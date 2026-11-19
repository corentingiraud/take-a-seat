"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { People } from "./people";
import { mergeRanges, remainingSlots, type Range } from "./remaining-slots";

import moment from "@/lib/moment";
import { siteConfig } from "@/config/site";
import { useAuth } from "@/contexts/auth-context";
import { useConfirm } from "@/contexts/confirm-dialog-context";
import { useBookings } from "@/hooks/bookings/use-bookings";
import { useBulkCreateBookings } from "@/hooks/bookings/form/use-bulk-create-bookings";
import { useCoworkingSpaceCalendar } from "@/hooks/use-coworking-space-calendar";
import { useFavoriteCoworkingSpace } from "@/hooks/use-favorite-coworking-space";
import { usePrepaidCard } from "@/hooks/use-prepaid-cards";
import { useStrapiAPI } from "@/hooks/use-strapi-api";
import { Booking } from "@/models/booking";
import { BookingStatus } from "@/models/booking-status";
import { CoworkingSpace } from "@/models/coworking-space";
import { PrepaidCard } from "@/models/prepaid-card";
import { Service } from "@/models/service";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

// 8h, 8h30
const hour = (ms: number) => {
  const m = moment(ms);

  return `${m.hour()}h${m.minute() ? String(m.minute()).padStart(2, "0") : ""}`;
};
const label = (ranges: Range[]) =>
  ranges.map((r) => `${hour(r.start)}-${hour(r.end)}`).join(", ");
const hours = (n: number) => `${+n.toFixed(2)} h`;
const toRange = (b: Booking): Range => ({
  start: b.startDate.valueOf(),
  end: b.endDate.valueOf(),
});

const SERVICE_KEY = "favoriteServiceId";

export function TodayPlanning() {
  const { user } = useAuth();
  const confirm = useConfirm();
  const { fetchAll } = useStrapiAPI();
  const [busy, setBusy] = useState(false);
  const [storedServiceId, setStoredServiceId] = useState<string | null>(() => {
    try {
      return localStorage.getItem(SERVICE_KEY);
    } catch {
      return null;
    }
  });

  const today = moment();
  const now = today.valueOf();

  const { data: spaces = [] } = useQuery({
    queryKey: ["coworking-spaces"],
    queryFn: () => fetchAll(CoworkingSpace.strapiAPIParams),
  });
  const { selected, select, latestServiceId } =
    useFavoriteCoworkingSpace(spaces);

  const { data: space, isLoading } = useCoworkingSpaceCalendar({
    coworkingSpaceId: selected?.documentId,
    startDate: today,
    endDate: today,
  });
  const { bookings: myBookings } = useBookings({
    startDate: today.clone().startOf("day"),
    endDate: today.clone().endOf("day"),
    pageSize: 50,
  });
  const { usablePrepaidCards } = usePrepaidCard({});

  const slotsOf = (s: Service) => {
    const av = s.findAvailabilityForDate(today);

    if (!av || !space) return [];

    return s
      .getTimeSlot(today)
      .map((t) => {
        const start = today
          .clone()
          .startOf("day")
          .hour(t.hour)
          .minute(t.minute);

        return { start, end: start.clone().add(s.bookingDuration, "minutes") };
      })
      .filter(
        (x) => !space.unavailabilities.some((u) => u.overlaps(x.start, x.end)),
      )
      .map((x) => ({
        start: x.start.valueOf(),
        end: x.end.valueOf(),
        seats: av.numberOfSeats,
      }));
  };
  const seatsOf = (s: Service) =>
    s.findAvailabilityForDate(today)?.numberOfSeats ?? 0;
  const allServices = space?.services ?? [];
  // Services open today, most seats first.
  const openServices = allServices
    .filter((s) => slotsOf(s).length > 0)
    .sort((a, b) => seatsOf(b) - seatsOf(a));
  const known = (id?: string | null) =>
    openServices.find((s) => s.documentId === id);
  const chosen =
    known(storedServiceId) ?? known(latestServiceId) ?? openServices[0] ?? null;
  const availability = chosen?.findAvailabilityForDate(today) ?? null;
  const daySlots = chosen ? slotsOf(chosen) : [];

  function chooseService(id: string) {
    setStoredServiceId(id);
    try {
      localStorage.setItem(SERVICE_KEY, id);
    } catch {
      // ignore: the choice just lasts for this page view
    }
  }

  const activeBookings = (chosen?.bookings ?? []).filter(
    (b) => b.bookingStatus !== BookingStatus.CANCELLED,
  );
  // Any service of the space counts: someone in the meeting room is already here.
  const ownBookings = myBookings
    .filter(
      (b) =>
        b.bookingStatus !== BookingStatus.CANCELLED &&
        !!space?.services.some((s) => s.documentId === b.service?.documentId),
    )
    .map(toRange);

  const lastOwnEnd = Math.max(0, ...ownBookings.map((r) => r.end));
  const remaining = remainingSlots({
    slots: daySlots,
    now,
    serviceBookings: activeBookings.map(toRange),
    ownBookings,
  }).filter((s) => s.start >= lastOwnEnd);

  const cost = chosen?.hoursFor(remaining.length) ?? 0;
  const card = PrepaidCard.best(usablePrepaidCards, cost);
  const cardCovers = !!card && card.remainingBalance >= cost;
  const blockedByCard = !!availability?.prepaidCardOnly && !cardCovers;
  const extending = ownBookings.length > 0;

  const bulkCreate = useBulkCreateBookings({
    bookings: remaining.map(
      (s) =>
        new Booking({
          startDate: moment(s.start),
          endDate: moment(s.end),
          service: chosen,
          user,
        }),
    ),
  });

  async function book() {
    const range = label(mergeRanges(remaining));
    const ok = await confirm({
      title: extending
        ? "Prolonger la journée"
        : "Réserver le reste de la journée",
      description: `${range} à ${selected?.name}${
        cardCovers
          ? `, ${hours(cost)} débitées de la carte « ${card!.name} ».`
          : ". Paiement sur place."
      }`,
      confirmText: "Réserver",
    });

    if (!ok) return;
    setBusy(true);
    try {
      await bulkCreate(cardCovers ? card : null);
    } catch {
      // the hook already shows an error toast
    } finally {
      setBusy(false);
    }
  }

  const name = selected?.name ?? "";
  const isOpenNow = (s: Service) =>
    slotsOf(s).some((x) => x.start <= now && now < x.end);
  const note = "rounded-md bg-muted px-3 py-2 text-sm";

  return (
    <Card className="mb-8">
      <CardHeader className="space-y-3 p-4 sm:p-6">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-lg">
              Aujourd&apos;hui{name && ` à ${name}`}
            </CardTitle>
            <CardDescription className="mt-1 first-letter:uppercase">
              {today.format("dddd D MMMM")}
            </CardDescription>
          </div>
          {selected && (
            <Button asChild size="sm" variant="outline" className="shrink-0">
              <Link
                href={`${siteConfig.path.calendar.href}?coworkingSpaceId=${selected.documentId}`}
              >
                Voir la semaine
              </Link>
            </Button>
          )}
        </div>
        {spaces.length > 1 && (
          <div className="flex flex-wrap gap-2">
            {spaces.map((s) => (
              <Button
                key={s.documentId}
                size="sm"
                variant={
                  s.documentId === selected?.documentId ? "default" : "outline"
                }
                onClick={() => select(s.documentId)}
              >
                {s.name}
              </Button>
            ))}
          </div>
        )}
      </CardHeader>
      <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
        {isLoading || !space ? (
          <div className="space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-9 w-48" />
          </div>
        ) : (
          <div className="space-y-4">
            <People
              services={allServices}
              chosenId={chosen?.documentId}
              me={user?.firstNameWithInitial}
              isOpenNow={isOpenNow}
            />
            <Separator />
            <div className="space-y-3">
              {openServices.length > 1 &&
                (openServices.length <= 3 ? (
                  <div className="flex flex-wrap gap-2">
                    {openServices.map((s) => (
                      <Button
                        key={s.documentId}
                        size="sm"
                        variant={
                          s.documentId === chosen?.documentId
                            ? "default"
                            : "outline"
                        }
                        onClick={() => chooseService(s.documentId)}
                      >
                        {s.name}
                      </Button>
                    ))}
                  </div>
                ) : (
                  <Select
                    value={chosen?.documentId}
                    onValueChange={chooseService}
                  >
                    <SelectTrigger className="w-full sm:w-64">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {openServices.map((s) => (
                        <SelectItem key={s.documentId} value={s.documentId}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ))}
              {daySlots.length === 0 ? (
                <p className={note}>Fermé aujourd&apos;hui</p>
              ) : remaining.length === 0 ? (
                extending && (
                  <p className={note}>
                    Vous êtes inscrit aujourd&apos;hui{" "}
                    {label(mergeRanges(ownBookings))}
                  </p>
                )
              ) : blockedByCard ? (
                <p className={note}>
                  Votre carte prépayée n&apos;a pas assez de crédit pour
                  réserver le reste de la journée.{" "}
                  <a className="underline" href="#prepaid-cards">
                    Voir mes cartes
                  </a>
                </p>
              ) : (
                <div className="space-y-2">
                  <Button
                    className="h-auto w-full whitespace-normal sm:w-auto"
                    disabled={busy}
                    onClick={book}
                  >
                    {extending
                      ? `Prolonger jusqu'à ${hour(remaining[remaining.length - 1].end)}`
                      : remaining.length === daySlots.length
                        ? `Réserver ${label(mergeRanges(remaining))}`
                        : `Réserver le reste de la journée (${label(mergeRanges(remaining))})`}
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    {cardCovers
                      ? `${hours(cost)} débitées de la carte « ${card!.name} » (${hours(card!.remainingBalance)} restantes, puis ${hours(card!.remainingBalance - cost)})`
                      : "Aucune carte utilisée, paiement sur place."}
                  </p>
                </div>
              )}
              <Button asChild variant="link" size="sm" className="h-auto p-0">
                <Link href={siteConfig.path.book.href}>Autre réservation</Link>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
