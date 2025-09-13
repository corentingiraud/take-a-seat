"use client";

import type { ColumnDef } from "@tanstack/react-table";

import * as React from "react";
import { ChevronRight, Text as TextIcon } from "lucide-react";

import { BookingStatusBadge } from "../badge";

import { BookingActionMenu } from "./actions";

import { useBooking } from "@/contexts/booking-context";
import { PaymentStatusBadge } from "@/components/payment-badge";
import { WeekSelector } from "@/components/ui/week-selector";
import { Button } from "@/components/ui/button";
import { capitalizeFirstLetter } from "@/lib/utils";
import { useDataTable } from "@/hooks/use-data-table";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { PaymentStatus } from "@/models/payment-status";
import { BookingStatus } from "@/models/booking-status";
import { Booking } from "@/models/booking";
import { Checkbox } from "@/components/ui/checkbox";

type BookingRow = {
  id: string;
  startTs: number;
  endTs: number;
  dateLabel: string;
  space: string;
  service: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  booking: Booking;
};

export function BookingsList() {
  const { bookings, reload, setWeekRange, startDate, endDate, goToNextWeek } =
    useBooking();

  React.useEffect(() => {
    reload();
  }, []);

  const filteredRows = React.useMemo<BookingRow[]>(
    () =>
      bookings.map((booking: Booking) => ({
        id: booking.documentId,
        startTs: booking.startDate.valueOf(),
        endTs: booking.endDate.valueOf(),
        dateLabel:
          capitalizeFirstLetter(
            booking.startDate.format("dddd DD/MM - HH[h]mm"),
          ) +
          " → " +
          booking.endDate.format("HH[h]mm"),
        space: booking.service?.coworkingSpace?.name ?? "",
        service: booking.service?.name ?? "",
        status: booking.bookingStatus,
        paymentStatus: booking.paymentStatus,
        booking,
      })),
    [bookings],
  );

  const columns = React.useMemo<ColumnDef<BookingRow, unknown>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            aria-label="Select all"
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            aria-label="Select row"
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
          />
        ),
        size: 32,
        enableSorting: false,
        enableHiding: false,
      },
      {
        id: "startTs",
        accessorKey: "startTs",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Date" />
        ),
        cell: ({ row }) => (
          <div className="whitespace-nowrap">{row.original.dateLabel}</div>
        ),
        meta: { label: "Date", variant: "dateRange", icon: TextIcon },
        enableColumnFilter: false,
      },
      {
        id: "space",
        accessorKey: "space",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Espace" />
        ),
        cell: ({ row }) => <div>{row.getValue("space") as string}</div>,
        meta: {
          label: "Espace",
          placeholder: "Rechercher un espace…",
          variant: "text",
          icon: TextIcon,
        },
        enableColumnFilter: false,
      },
      {
        id: "service",
        accessorKey: "service",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Service" />
        ),
        cell: ({ row }) => <div>{row.getValue("service") as string}</div>,
        meta: {
          label: "Service",
          placeholder: "Rechercher un service…",
          variant: "text",
          icon: TextIcon,
        },
        enableColumnFilter: false,
      },
      {
        id: "status",
        accessorKey: "status",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Status" />
        ),
        cell: ({ row }) => (
          <BookingStatusBadge booking={row.original.booking} />
        ),
        // meta: {
        //   label: "Status du paiement",
        //   variant: "multiSelect",
        //   options: (
        //     Object.keys(PaymentStatus) as Array<keyof typeof PaymentStatus>
        //   ).map((s) => ({
        //     label: getPaymentStatusLabel(s),
        //     value: getPaymentStatusLabel(s),
        //   })),
        // },
        enableColumnFilter: false,
      },
      {
        id: "paymentStatus",
        accessorKey: "paymentStatus",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Paiement" />
        ),
        cell: ({ row }) => (
          <PaymentStatusBadge status={row.original.paymentStatus} />
        ),
        enableColumnFilter: false,
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => <BookingActionMenu booking={row.original.booking} />,
        enableSorting: false,
        enableHiding: false,
      },
    ],
    [],
  );

  const { table } = useDataTable({
    data: filteredRows,
    columns,
    pageCount: 1,
    initialState: {
      sorting: [{ id: "startTs", desc: true }],
      columnPinning: { right: ["actions"] },
    },
    getRowId: (row) => row.id,
    enableRowSelection: true,
  });

  const selected = React.useMemo(
    () =>
      table.getFilteredSelectedRowModel().rows.map((r) => r.original.booking),
    [table],
  );

  return (
    <div className="mt-7">
      <WeekSelector
        endDate={endDate}
        startDate={startDate}
        onChange={setWeekRange}
      />

      {filteredRows.length === 0 ? (
        <div className="mt-7 rounded-lg border p-12 text-center">
          <div className="flex flex-col items-center gap-3">
            <p className="text-sm text-muted-foreground">
              Aucune réservation ...
            </p>
            <Button onClick={goToNextWeek}>
              Voir la semaine suivante
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-7">
          {table.getFilteredSelectedRowModel().rows.length > 0 && (
            <div className="mb-3 mt-3 flex items-center justify-between rounded-md border p-3">
              <p className="text-sm text-muted-foreground">
                {table.getFilteredSelectedRowModel().rows.length}{" "}
                sélectionnée(s)
              </p>
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  onClick={() => console.log(selected)}
                >
                  Annuler
                </Button>
              </div>
            </div>
          )}

          <DataTable table={table}>
            <DataTableToolbar table={table} />
          </DataTable>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between">
        <p className="text-muted-foreground">
          Semaine du {startDate.format("D MMMM")} au{" "}
          {endDate.format("D MMMM YYYY")}
        </p>
        <div className="w-fit">
          <WeekSelector
            compact
            endDate={endDate}
            startDate={startDate}
            onChange={setWeekRange}
          />
        </div>
      </div>
    </div>
  );
}
