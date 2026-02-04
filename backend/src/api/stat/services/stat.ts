const DAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;

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

export default {
  async computeStats(startDate: string, endDate: string) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    // 4 queries in parallel
    const [allBookings, prepaidCards, availabilities, newUsers] = await Promise.all([
      // #1 All bookings in range (including cancelled, for cancellation rate)
      strapi.db.query('api::booking.booking').findMany({
        where: {
          startDate: { $gte: startDate },
          endDate: { $lte: endDate },
        },
        populate: ['service', 'service.coworkingSpace', 'prepaidCard', 'user'],
      }),

      // #2 Prepaid cards purchased in range
      strapi.db.query('api::prepaid-card.prepaid-card').findMany({
        where: {
          validFrom: { $gte: startDate, $lte: endDate },
          paymentStatus: 'PAID',
        },
        populate: ['user'],
      }),

      // #3 Availabilities overlapping with range
      strapi.db.query('api::availability.availability').findMany({
        where: {
          startDate: { $lte: endDate },
          endDate: { $gte: startDate },
        },
        populate: ['service', 'service.coworkingSpace'],
      }),

      // #4 New registrations in range
      strapi.db.query('plugin::users-permissions.user').findMany({
        where: {
          createdAt: { $gte: startDate, $lte: endDate },
        },
        select: ['id'],
      }),
    ]);

    // Separate cancelled vs active bookings
    const activeBookings = allBookings.filter((b: any) => b.bookingStatus !== 'CANCELLED');
    const cancelledCount = allBookings.length - activeBookings.length;

    // --- Stat 1: Prepaid card buyers ---
    const prepaidCardBuyers = new Set(prepaidCards.map((c: any) => c.user?.id)).size;

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

      const hours = (new Date(b.endDate).getTime() - new Date(b.startDate).getTime()) / (1000 * 60 * 60);
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
    const uniqueCoworkers = new Set(activeBookings.map((b: any) => b.user?.id).filter(Boolean)).size;

    // --- Stat 6: New registrations ---
    const newRegistrations = newUsers.length;

    // --- Stat 7: Cancellation rate ---
    const cancellationRate = {
      cancelled: cancelledCount,
      total: allBookings.length,
      rate: allBookings.length > 0
        ? Math.round((cancelledCount / allBookings.length) * 10000) / 100
        : 0,
    };

    // --- Stat 8: Average booking duration ---
    let averageBookingDurationHours = 0;
    if (activeBookings.length > 0) {
      const totalHours = activeBookings.reduce((sum: number, b: any) => {
        return sum + (new Date(b.endDate).getTime() - new Date(b.startDate).getTime()) / (1000 * 60 * 60);
      }, 0);
      averageBookingDurationHours = Math.round((totalHours / activeBookings.length) * 100) / 100;
    }

    return {
      prepaidCardBuyers,
      paymentBreakdown,
      occupancyPerService,
      occupancyPerCoworkingSpace,
      uniqueCoworkers,
      newRegistrations,
      cancellationRate,
      averageBookingDurationHours,
    };
  },
};
