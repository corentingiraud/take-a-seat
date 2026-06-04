import { ADMIN_ROLE_TYPE } from '../../constants';

const DAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;

const HOUR_MS = 1000 * 60 * 60;
const DAY_MS = HOUR_MS * 24;

// Full-time prepaid cards are credited with this sentinel "unlimited" balance.
const UNLIMITED_CARD_BALANCE = 9999;

type TimeSlot = { start: string; end: string };
type WeeklySchedule = Partial<Record<string, TimeSlot[]>>;

function computeTotalAvailableSeatHours(
  availabilities: Array<{
    startDate: string;
    endDate: string;
    weeklyAvailabilities: WeeklySchedule;
    numberOfSeats: number;
  }>,
  rangeStart: Date,
  rangeEnd: Date,
): number {
  let totalHours = 0;

  for (const av of availabilities) {
    const avStart = new Date(Math.max(new Date(av.startDate).getTime(), rangeStart.getTime()));
    const avEnd = new Date(Math.min(new Date(av.endDate).getTime(), rangeEnd.getTime()));

    const current = new Date(avStart);
    current.setHours(0, 0, 0, 0);

    const endDay = new Date(avEnd);
    endDay.setHours(0, 0, 0, 0);

    while (current <= endDay) {
      const dayName = DAY_NAMES[current.getDay()];
      const slots = av.weeklyAvailabilities?.[dayName] ?? [];

      for (const slot of slots) {
        const [sh, sm] = slot.start.split(':').map(Number);
        const [eh, em] = slot.end.split(':').map(Number);
        const slotHours = (eh * 60 + em - (sh * 60 + sm)) / 60;
        totalHours += slotHours * av.numberOfSeats;
      }

      current.setDate(current.getDate() + 1);
    }
  }

  return totalHours;
}

// Bookings are stored in UTC; the business runs in Europe/Paris. Extract the
// weekday/hour in that timezone so the heatmap is stable across DST changes.
const PARIS_TZ = 'Europe/Paris';
const WEEKDAY_INDEX: Record<string, number> = {
  Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
};
const parisPartsFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: PARIS_TZ,
  weekday: 'short',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

function getParisParts(date: Date): { dayOfWeek: number; hour: number; minute: number } {
  const parts = parisPartsFormatter.formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  return {
    dayOfWeek: WEEKDAY_INDEX[get('weekday')] ?? 0,
    hour: parseInt(get('hour'), 10),
    minute: parseInt(get('minute'), 10),
  };
}

function isSameCalendarDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default {
  async computeStats(startDate: string, endDate: string) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Exclusive next-day upper bound so the whole last day is included for
    // datetime fields (bookings are single-day), while keeping date-only
    // (YYYY-MM-DD) values that Strapi `date` fields expect.
    const endExclusiveDate = new Date(`${endDate}T00:00:00Z`);
    endExclusiveDate.setUTCDate(endExclusiveDate.getUTCDate() + 1);
    const endExclusive = endExclusiveDate.toISOString().slice(0, 10);

    const [allBookings, prepaidCards, availabilities, expiredCards, newRegistrations] = await Promise.all([
      // #1 All bookings in range (including cancelled, for cancellation rate).
      // Bookings are single-day, so filtering on startDate is enough.
      // Only the fields actually used downstream are populated.
      strapi.db.query('api::booking.booking').findMany({
        where: {
          startDate: { $gte: startDate, $lt: endExclusive },
        },
        populate: {
          service: {
            select: ['name'],
            populate: { coworkingSpace: { select: ['id', 'name'] } },
          },
          user: { select: ['id', 'firstName', 'lastName'] },
          prepaidCard: { select: ['id'] },
        },
      }),

      // #2 Prepaid cards purchased in range
      strapi.db.query('api::prepaid-card.prepaid-card').findMany({
        where: {
          validFrom: { $gte: startDate, $lte: endDate },
          paymentStatus: 'PAID',
        },
        populate: { user: { select: ['id'] } },
      }),

      // #3 Availabilities overlapping with range
      strapi.db.query('api::availability.availability').findMany({
        where: {
          startDate: { $lte: endDate },
          endDate: { $gte: startDate },
        },
        populate: ['service', 'service.coworkingSpace'],
      }),

      // #4 Prepaid cards expiring within range (for breakage & consumption)
      strapi.db.query('api::prepaid-card.prepaid-card').findMany({
        where: {
          expirationDate: { $gte: startDate, $lte: endDate },
          paymentStatus: 'PAID',
        },
        select: ['initialBalance', 'remainingBalance'],
      }),

      // #5 New registrations in range — counted via the Strapi helper.
      // Only real members: confirmed (email validated), not blocked, non-admin.
      strapi.db.query('plugin::users-permissions.user').count({
        where: {
          createdAt: { $gte: startDate, $lte: endDate },
          confirmed: true,
          blocked: { $ne: true },
          role: { type: { $ne: ADMIN_ROLE_TYPE } },
        },
      }),
    ]);

    // Separate cancelled vs active bookings
    const activeBookings = allBookings.filter((b: any) => b.bookingStatus !== 'CANCELLED');
    const cancelledBookings = allBookings.filter((b: any) => b.bookingStatus === 'CANCELLED');
    const cancelledCount = cancelledBookings.length;

    // --- Stat 1: Prepaid card buyers ---
    const prepaidCardBuyers = new Set(prepaidCards.map((c: any) => c.user?.id).filter(Boolean)).size;

    // --- Stat 2: Payment breakdown ---
    const prepaidCount = activeBookings.filter((b: any) => b.prepaidCard != null).length;
    const cbCount = activeBookings.filter((b: any) => b.prepaidCard == null).length;
    const totalActiveBookings = activeBookings.length;

    const paymentBreakdown = {
      prepaidCount,
      cbCount,
      total: totalActiveBookings,
      prepaidPercentage: totalActiveBookings > 0
        ? Math.round((prepaidCount / totalActiveBookings) * 10000) / 100
        : 0,
      cbPercentage: totalActiveBookings > 0
        ? Math.round((cbCount / totalActiveBookings) * 10000) / 100
        : 0,
    };

    // --- Stat 3: Occupancy per service ---
    // Group booked hours by service
    const bookedHoursByService = new Map<number, { hours: number; count: number; name: string; csId: number; csName: string }>();
    for (const b of activeBookings as any[]) {
      const serviceId = b.service?.id;
      if (!serviceId) continue;

      const hours = (new Date(b.endDate).getTime() - new Date(b.startDate).getTime()) / HOUR_MS;
      const existing = bookedHoursByService.get(serviceId);
      if (existing) {
        existing.hours += hours;
        existing.count += 1;
      } else {
        bookedHoursByService.set(serviceId, {
          hours,
          count: 1,
          name: b.service.name,
          csId: b.service.coworkingSpace?.id,
          csName: b.service.coworkingSpace?.name,
        });
      }
    }

    // Group availabilities by service
    const availabilitiesByService = new Map<number, any[]>();
    for (const av of availabilities as any[]) {
      const serviceId = av.service?.id;
      if (!serviceId) continue;
      const list = availabilitiesByService.get(serviceId) ?? [];
      list.push(av);
      availabilitiesByService.set(serviceId, list);
    }

    // Collect all service IDs (from both bookings and availabilities)
    const allServiceIds = new Set([
      ...bookedHoursByService.keys(),
      ...availabilitiesByService.keys(),
    ]);

    const occupancyPerService = Array.from(allServiceIds).map((serviceId) => {
      const booked = bookedHoursByService.get(serviceId);
      const serviceAvailabilities = availabilitiesByService.get(serviceId) ?? [];

      // Get service info from either source
      const serviceInfo = booked ?? {
        hours: 0,
        count: 0,
        name: serviceAvailabilities[0]?.service?.name ?? 'Unknown',
        csId: serviceAvailabilities[0]?.service?.coworkingSpace?.id,
        csName: serviceAvailabilities[0]?.service?.coworkingSpace?.name,
      };

      const totalAvailableSeatHours = computeTotalAvailableSeatHours(serviceAvailabilities, start, end);
      const totalBookedHours = Math.round((booked?.hours ?? 0) * 100) / 100;

      return {
        serviceId,
        serviceName: serviceInfo.name,
        coworkingSpaceId: serviceInfo.csId,
        coworkingSpaceName: serviceInfo.csName,
        bookingCount: booked?.count ?? 0,
        totalBookedHours,
        totalAvailableSeatHours: Math.round(totalAvailableSeatHours * 100) / 100,
        occupancyRate: totalAvailableSeatHours > 0
          ? Math.round((totalBookedHours / totalAvailableSeatHours) * 10000) / 100
          : 0,
      };
    });

    // --- Stat 4: Occupancy per coworking space ---
    const csMap = new Map<number, { name: string; booked: number; available: number }>();
    for (const s of occupancyPerService) {
      if (!s.coworkingSpaceId) continue;
      const existing = csMap.get(s.coworkingSpaceId);
      if (existing) {
        existing.booked += s.totalBookedHours;
        existing.available += s.totalAvailableSeatHours;
      } else {
        csMap.set(s.coworkingSpaceId, {
          name: s.coworkingSpaceName,
          booked: s.totalBookedHours,
          available: s.totalAvailableSeatHours,
        });
      }
    }

    const occupancyPerCoworkingSpace = Array.from(csMap.entries()).map(([id, data]) => ({
      coworkingSpaceId: id,
      coworkingSpaceName: data.name,
      totalBookedHours: Math.round(data.booked * 100) / 100,
      totalAvailableSeatHours: Math.round(data.available * 100) / 100,
      occupancyRate: data.available > 0
        ? Math.round((data.booked / data.available) * 10000) / 100
        : 0,
    }));

    // --- Stat 5: Unique coworkers ---
    const uniqueCoworkerIds = Array.from(
      new Set(activeBookings.map((b: any) => b.user?.id).filter(Boolean)),
    ) as number[];
    const uniqueCoworkers = uniqueCoworkerIds.length;

    // --- Stat 6: New vs returning active coworkers ---
    // A coworker is "returning" if they already had an active booking before the
    // period start; otherwise their first booking happened during the period.
    let returningCoworkers = 0;
    if (uniqueCoworkerIds.length > 0) {
      const priorBookings = await strapi.db.query('api::booking.booking').findMany({
        where: {
          startDate: { $lt: startDate },
          bookingStatus: { $ne: 'CANCELLED' },
          user: { id: { $in: uniqueCoworkerIds } },
        },
        populate: { user: { select: ['id'] } },
      });
      const returningSet = new Set(priorBookings.map((b: any) => b.user?.id).filter(Boolean));
      returningCoworkers = uniqueCoworkerIds.filter((id) => returningSet.has(id)).length;
    }
    const newCoworkers = uniqueCoworkers - returningCoworkers;

    // --- Stat 7: Cancellation rate (incl. same-day cancellations) ---
    // updatedAt is used as a proxy for when the booking was cancelled.
    let sameDayCancellations = 0;
    for (const b of cancelledBookings as any[]) {
      if (b.updatedAt && isSameCalendarDay(new Date(b.updatedAt), new Date(b.startDate))) {
        sameDayCancellations += 1;
      }
    }
    const cancellationRate = {
      cancelled: cancelledCount,
      total: allBookings.length,
      rate: allBookings.length > 0
        ? Math.round((cancelledCount / allBookings.length) * 10000) / 100
        : 0,
      sameDayCancellations,
      sameDayRate: cancelledCount > 0
        ? Math.round((sameDayCancellations / cancelledCount) * 10000) / 100
        : 0,
    };

    // --- Stat 8: Average booking lead time (booking anticipation) ---
    let averageBookingLeadTimeDays = 0;
    if (activeBookings.length > 0) {
      let leadSum = 0;
      let leadCount = 0;
      for (const b of activeBookings as any[]) {
        if (b.createdAt) {
          const lead = (new Date(b.startDate).getTime() - new Date(b.createdAt).getTime()) / DAY_MS;
          if (lead >= 0) {
            leadSum += lead;
            leadCount += 1;
          }
        }
      }
      averageBookingLeadTimeDays = leadCount > 0 ? Math.round((leadSum / leadCount) * 10) / 10 : 0;
    }

    // --- Stat 9: Average bookings per active member ---
    const averageBookingsPerMember = uniqueCoworkers > 0
      ? Math.round((activeBookings.length / uniqueCoworkers) * 10) / 10
      : 0;

    // --- Stat 10: Top clients ---
    const clientMap = new Map<number, { name: string; bookingCount: number; totalHours: number }>();
    for (const b of activeBookings as any[]) {
      const userId = b.user?.id;
      if (!userId) continue;
      const hours = (new Date(b.endDate).getTime() - new Date(b.startDate).getTime()) / HOUR_MS;
      const existing = clientMap.get(userId);
      if (existing) {
        existing.bookingCount += 1;
        existing.totalHours += hours;
      } else {
        const name = `${b.user.firstName ?? ''} ${b.user.lastName ?? ''}`.trim() || 'Inconnu';
        clientMap.set(userId, { name, bookingCount: 1, totalHours: hours });
      }
    }
    const topClients = Array.from(clientMap.values())
      .sort((a, b) => b.bookingCount - a.bookingCount || b.totalHours - a.totalHours)
      .slice(0, 10)
      .map((c) => ({ ...c, totalHours: Math.round(c.totalHours * 100) / 100 }));

    // --- Stat 11: Booking heatmap (day of week x hour) per coworking space ---
    const heatmapBySpace = new Map<number, { name: string; counts: Map<string, number> }>();
    for (const b of activeBookings as any[]) {
      const csId = b.service?.coworkingSpace?.id;
      if (!csId) continue;
      let entry = heatmapBySpace.get(csId);
      if (!entry) {
        entry = { name: b.service.coworkingSpace.name, counts: new Map() };
        heatmapBySpace.set(csId, entry);
      }
      const startParts = getParisParts(new Date(b.startDate));
      const endParts = getParisParts(new Date(b.endDate));
      const day = startParts.dayOfWeek;
      const startHour = startParts.hour;
      const endHour = endParts.hour + (endParts.minute > 0 ? 1 : 0);
      for (let h = startHour; h < endHour; h++) {
        const key = `${day}-${h}`;
        entry.counts.set(key, (entry.counts.get(key) ?? 0) + 1);
      }
    }
    const bookingHeatmap = Array.from(heatmapBySpace.entries()).map(([csId, entry]) => ({
      coworkingSpaceId: csId,
      coworkingSpaceName: entry.name,
      cells: Array.from(entry.counts.entries()).map(([key, count]) => {
        const [dayOfWeek, hour] = key.split('-').map(Number);
        return { dayOfWeek, hour, count };
      }),
    }));

    // --- Stat 12: Prepaid card breakage & consumption (cards expired in range) ---
    // Unlimited (full-time) cards are credited with a 9999 sentinel balance and
    // would distort breakage/consumption, so they are excluded.
    let initialSum = 0;
    let remainingSum = 0;
    let breakageCount = 0;
    let limitedExpiredCount = 0;
    for (const c of expiredCards as any[]) {
      const initial = Number(c.initialBalance ?? 0);
      if (initial >= UNLIMITED_CARD_BALANCE) continue;
      const remaining = Number(c.remainingBalance ?? 0);
      initialSum += initial;
      remainingSum += remaining;
      limitedExpiredCount += 1;
      if (remaining > 0) breakageCount += 1;
    }
    const cardBreakdown = {
      expiredCount: limitedExpiredCount,
      breakageCount,
      breakageBalance: Math.round(remainingSum * 100) / 100,
      consumptionRate: initialSum > 0
        ? Math.round(((initialSum - remainingSum) / initialSum) * 10000) / 100
        : 0,
    };

    return {
      prepaidCardBuyers,
      paymentBreakdown,
      occupancyPerService,
      occupancyPerCoworkingSpace,
      uniqueCoworkers,
      returningCoworkers,
      newCoworkers,
      newRegistrations,
      cancellationRate,
      averageBookingLeadTimeDays,
      averageBookingsPerMember,
      topClients,
      bookingHeatmap,
      cardBreakdown,
    };
  },
};
