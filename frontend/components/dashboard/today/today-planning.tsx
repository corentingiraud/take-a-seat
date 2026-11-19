"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

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
import { groupBookingsByPerson } from "@/models/utils/booking-people";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/ui/section";

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

export function TodayPlanning() {
  const { user } = useAuth();
  const confirm = useConfirm();
  const { fetchAll } = useStrapiAPI();
  const [busy, setBusy] = useState(false);

  const today = moment();
  const now = today.valueOf();

  const { data: spaces = [] } = useQuery({
    queryKey: ["coworking-spaces"],
    queryFn: () => fetchAll(CoworkingSpace.strapiAPIParams),
  });
  const { selected, select } = useFavoriteCoworkingSpace(spaces);

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

  // Openspace = service with the most seats in today's availability.
  const seatsOf = (s: NonNullable<typeof space>["services"][number]) =>
    s.findAvailabilityForDate(today)?.numberOfSeats ?? 0;
  const services = [...(space?.services ?? [])].sort((a, b) => seatsOf(b) - seatsOf(a));
  const openspace = services[0] && seatsOf(services[0]) > 0 ? services[0] : null;
  const availability = openspace?.findAvailabilityForDate(today) ?? null;

  const activeBookings = (openspace?.bookings ?? []).filter(
    (b) => b.bookingStatus !== BookingStatus.CANCELLED,
  );
  const ownBookings = myBookings
    .filter(
      (b) =>
        b.bookingStatus !== BookingStatus.CANCELLED &&
        b.service?.documentId === openspace?.documentId,
    )
    .map(toRange);

  const daySlots =
    openspace && availability && space
      ? openspace.getTimeSlot(today).map((t) => {
          const start = today.clone().startOf("day").hour(t.hour).minute(t.minute);

          return {
            start: start.valueOf(),
            end: start.clone().add(openspace.bookingDuration, "minutes").valueOf(),
            seats: availability.numberOfSeats,
          };
        })
      : [];
  const closedByUnavailability = !!space?.findUnavailabilityForDate(today);

  const lastOwnEnd = Math.max(0, ...ownBookings.map((r) => r.end));
  const remaining = closedByUnavailability
    ? []
    : remainingSlots({
        slots: daySlots,
        now,
        serviceBookings: activeBookings.map(toRange),
        ownBookings,
        unavailabilities: [],
      }).filter((s) => s.start >= lastOwnEnd);

  const cost = openspace?.hoursFor(remaining.length) ?? 0;
  const card = PrepaidCard.withMostCredits(usablePrepaidCards);
  const cardCovers = !!card && card.remainingBalance >= cost;
  const blockedByCard = !!availability?.prepaidCardOnly && !cardCovers;
  const extending = ownBookings.length > 0;

  const bulkCreate = useBulkCreateBookings({
    bookings: remaining.map(
      (s) =>
        new Booking({
          startDate: moment(s.start),
          endDate: moment(s.end),
          service: openspace,
          user,
        }),
    ),
  });

  async function book() {
    const range = label(mergeRanges(remaining));
    const ok = await confirm({
      title: extending ? "Prolonger la journée" : "Réserver le reste de la journée",
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

  // Unlike the calendar, names are masked to first name + initial: compare on that.
  const people = (s: (typeof services)[number]) =>
    groupBookingsByPerson(
      s.bookings
        .filter((b) => b.bookingStatus !== BookingStatus.CANCELLED && b.user)
        .map((b) => ({
          name: b.user!.firstNameWithInitial,
          start: b.startDate.toDate(),
          end: b.endDate.toDate(),
        })),
    );
  const me = user?.firstNameWithInitial;
  const withBookings = services.filter((s) => s.bookings.length > 0);
  const shown = [
    ...(openspace ? [openspace] : []),
    ...withBookings.filter((s) => s !== openspace),
  ];

  const occupied = openspace
    ? activeBookings.filter((b) => b.startDate.isSameOrBefore(today) && b.endDate.isAfter(today))
        .length
    : 0;
  const open = daySlots.some((s) => s.start <= now && now < s.end);

  const name = selected?.name ?? "";

  return (
    <Section>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Aujourd&apos;hui{name && ` à ${name}`}
          </h4>
          <p className="text-sm text-muted-foreground first-letter:uppercase">
            {today.format("dddd D MMMM")}
          </p>
        </div>
        {selected && (
          <Link
            className="text-sm underline"
            href={`${siteConfig.path.calendar.href}?coworkingSpaceId=${selected.documentId}`}
          >
            Voir la semaine
          </Link>
        )}
      </div>

      {spaces.length > 1 && (
        <div className="mb-4 flex gap-2">
          {spaces.map((s) => (
            <Button
              key={s.documentId}
              size="sm"
              variant={s.documentId === selected?.documentId ? "default" : "outline"}
              onClick={() => select(s.documentId)}
            >
              {s.name}
            </Button>
          ))}
        </div>
      )}

      {isLoading || !space ? (
        <p className="text-sm text-muted-foreground">Chargement...</p>
      ) : (
        <div className="space-y-4">
          {openspace && open && (
            <p className="text-sm font-medium">
              {occupied}/{availability!.numberOfSeats} places occupées
            </p>
          )}

          {withBookings.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Personne n&apos;a encore réservé aujourd&apos;hui.
            </p>
          )}
          {shown.map((s) => {
            const list = people(s);

            if (list.length === 0 && s !== openspace) return null;

            return (
              <div key={s.documentId}>
                <h5 className="text-sm font-semibold">{s.name}</h5>
                <ul className="text-sm">
                  {list.map((p) => (
                    <li key={p.name} className={p.name === me ? "font-semibold" : undefined}>
                      {p.name} {p.label}
                      {p.name === me && " (vous)"}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}

          <div className="space-y-2 border-t pt-4">
            {daySlots.length === 0 || closedByUnavailability ? (
              <p className="text-sm font-medium">Fermé aujourd&apos;hui</p>
            ) : remaining.length === 0 ? (
              extending && (
                <p className="text-sm font-medium">
                  Vous êtes inscrit aujourd&apos;hui {label(mergeRanges(ownBookings))}
                </p>
              )
            ) : blockedByCard ? (
              <p className="text-sm">
                Votre carte prépayée n&apos;a pas assez de crédit pour réserver le reste de la
                journée.{" "}
                <a className="underline" href="#prepaid-cards">
                  Voir mes cartes
                </a>
              </p>
            ) : (
              <>
                <Button disabled={busy} onClick={book}>
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
              </>
            )}
            <div>
              <Link className="text-sm underline" href={siteConfig.path.book.href}>
                Autre réservation
              </Link>
            </div>
          </div>
        </div>
      )}
    </Section>
  );
}
