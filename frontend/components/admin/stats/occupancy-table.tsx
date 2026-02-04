"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";

interface OccupancyRow {
  name: string;
  totalBookedHours: number;
  totalAvailableSeatHours: number;
  occupancyRate: number;
}

interface OccupancyTableProps {
  rows: OccupancyRow[];
  isLoading?: boolean;
}

export function OccupancyTable({ rows, isLoading }: OccupancyTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nom</TableHead>
          <TableHead className="text-right">Heures réservées</TableHead>
          <TableHead className="text-right">Heures disponibles</TableHead>
          <TableHead className="w-[200px]">Taux d&apos;occupation</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading &&
          Array.from({ length: 3 }).map((_, i) => (
            <TableRow key={`skeleton-${i}`}>
              <TableCell>
                <div className="h-4 w-32 animate-pulse rounded bg-muted" />
              </TableCell>
              <TableCell>
                <div className="h-4 w-16 animate-pulse rounded bg-muted ml-auto" />
              </TableCell>
              <TableCell>
                <div className="h-4 w-16 animate-pulse rounded bg-muted ml-auto" />
              </TableCell>
              <TableCell>
                <div className="h-4 w-full animate-pulse rounded bg-muted" />
              </TableCell>
            </TableRow>
          ))}

        {!isLoading &&
          rows.map((row) => (
            <TableRow key={row.name}>
              <TableCell className="font-medium">{row.name}</TableCell>
              <TableCell className="text-right">
                {row.totalBookedHours}h
              </TableCell>
              <TableCell className="text-right">
                {row.totalAvailableSeatHours}h
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Progress value={row.occupancyRate} className="flex-1" />
                  <span className="text-sm font-medium w-12 text-right">
                    {row.occupancyRate}%
                  </span>
                </div>
              </TableCell>
            </TableRow>
          ))}

        {!isLoading && rows.length === 0 && (
          <TableRow>
            <TableCell colSpan={4} className="text-center text-muted-foreground">
              Aucune donnée pour cette période
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
