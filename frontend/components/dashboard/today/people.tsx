import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookingStatus } from "@/models/booking-status";
import { Service } from "@/models/service";
import { groupBookingsByPerson } from "@/models/utils/booking-people";
import moment from "@/lib/moment";

type Props = {
  services: Service[];
  chosenId?: string;
  me?: string;
  isOpenNow: (s: Service) => boolean;
};

const initials = (name: string) =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

// Unlike the calendar, names are masked to first name + initial: people are compared on that.
export function People({ services, chosenId, me, isOpenNow }: Props) {
  const now = moment();
  const sections = services
    .map((s) => {
      const active = s.bookings.filter(
        (b) => b.bookingStatus !== BookingStatus.CANCELLED,
      );

      return {
        service: s,
        seats: s.findAvailabilityForDate(now)?.numberOfSeats ?? 0,
        occupied: active.filter(
          (b) => b.startDate.isSameOrBefore(now) && b.endDate.isAfter(now),
        ).length,
        people: groupBookingsByPerson(
          active
            .filter((b) => b.user)
            .map((b) => ({
              name: b.user!.firstNameWithInitial,
              start: b.startDate.toDate(),
              end: b.endDate.toDate(),
            })),
        ),
      };
    })
    .filter((s) => s.people.length > 0)
    .sort(
      (a, b) =>
        Number(b.service.documentId === chosenId) -
        Number(a.service.documentId === chosenId),
    );

  return (
    <div className="space-y-4">
      <h5 className="text-sm font-semibold">Qui est là</h5>
      {sections.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Personne n&apos;a encore réservé aujourd&apos;hui.
        </p>
      )}
      {sections.map(({ service, seats, occupied, people }) => (
        <div key={service.documentId} className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {service.name}
            </span>
            {seats > 0 && isOpenNow(service) && (
              <Badge variant="secondary">
                {occupied}/{seats} maintenant
              </Badge>
            )}
          </div>
          {service.documentId === chosenId &&
            seats > 0 &&
            isOpenNow(service) && (
              <Progress
                className="h-1"
                value={Math.min(100, (occupied / seats) * 100)}
              />
            )}
          <ul className="space-y-2">
            {people.map((p) => (
              <li key={p.name} className="flex items-center gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
                  {initials(p.name)}
                </div>
                <span className="min-w-0 truncate text-sm">{p.name}</span>
                {p.name === me && <Badge>Vous</Badge>}
                <div className="ml-auto flex flex-wrap justify-end gap-1">
                  {p.label.split(", ").map((r) => (
                    <Badge key={r} variant="outline" className="font-normal">
                      {r}
                    </Badge>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
