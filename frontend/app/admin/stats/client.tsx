"use client";

import { useState } from "react";
import { startOfMonth, endOfMonth, format } from "date-fns";

import { useAdminStats } from "@/hooks/admin/stats/use-admin-stats";
import { MonthPicker } from "@/components/admin/stats/date-range-picker";
import { StatCard } from "@/components/admin/stats/stat-card";
import { OccupancyTable } from "@/components/admin/stats/occupancy-table";
import { Section } from "@/components/ui/section";

function toISODate(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export default function StatsPageClient() {
  const [month, setMonth] = useState(new Date());

  const startDate = toISODate(startOfMonth(month));
  const endDate = toISODate(endOfMonth(month));

  const { data, isLoading } = useAdminStats(startDate, endDate);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
          Statistiques
        </h3>
        <MonthPicker month={month} onMonthChange={setMonth} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Coworkers uniques"
          value={data?.uniqueCoworkers ?? 0}
          description="Ayant fait au moins une réservation"
          isLoading={isLoading}
        />
        <StatCard
          title="Nouveaux inscrits"
          value={data?.newRegistrations ?? 0}
          isLoading={isLoading}
        />
        <StatCard
          title="Acheteurs carte prépayée"
          value={data?.prepaidCardBuyers ?? 0}
          isLoading={isLoading}
        />
        <StatCard
          title="Paiement CB"
          value={`${data?.paymentBreakdown.cbPercentage ?? 0}%`}
          description={`${data?.paymentBreakdown.cbCount ?? 0} réservation(s)`}
          isLoading={isLoading}
        />
        <StatCard
          title="Paiement carte prépayée"
          value={`${data?.paymentBreakdown.prepaidPercentage ?? 0}%`}
          description={`${data?.paymentBreakdown.prepaidCount ?? 0} réservation(s)`}
          isLoading={isLoading}
        />
        <StatCard
          title="Taux d'annulation"
          value={`${data?.cancellationRate.rate ?? 0}%`}
          description={`${data?.cancellationRate.cancelled ?? 0} sur ${data?.cancellationRate.total ?? 0}`}
          isLoading={isLoading}
        />
        <StatCard
          title="Durée moyenne de réservation"
          value={`${data?.averageBookingDurationHours ?? 0}h`}
          isLoading={isLoading}
        />
      </div>

      <Section title="Taux d'occupation par service">
        <OccupancyTable
          rows={
            data?.occupancyPerService.map((s) => ({
              name: `${s.serviceName} (${s.coworkingSpaceName})`,
              totalBookedHours: s.totalBookedHours,
              totalAvailableSeatHours: s.totalAvailableSeatHours,
              occupancyRate: s.occupancyRate,
            })) ?? []
          }
          isLoading={isLoading}
        />
      </Section>

      <Section title="Taux d'occupation par espace de coworking">
        <OccupancyTable
          rows={
            data?.occupancyPerCoworkingSpace.map((cs) => ({
              name: cs.coworkingSpaceName,
              totalBookedHours: cs.totalBookedHours,
              totalAvailableSeatHours: cs.totalAvailableSeatHours,
              occupancyRate: cs.occupancyRate,
            })) ?? []
          }
          isLoading={isLoading}
        />
      </Section>
    </div>
  );
}
