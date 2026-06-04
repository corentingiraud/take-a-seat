"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatHours } from "@/lib/format";

interface TopClient {
  name: string;
  bookingCount: number;
  totalHours: number;
}

interface TopClientsTableProps {
  rows: TopClient[];
  isLoading?: boolean;
}

export function TopClientsTable({ rows, isLoading }: TopClientsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-10">#</TableHead>
          <TableHead>Coworker</TableHead>
          <TableHead className="text-right">Réservations</TableHead>
          <TableHead className="text-right">Heures réservées</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading &&
          Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={`skeleton-${i}`}>
              <TableCell>
                <div className="h-4 w-4 animate-pulse rounded bg-muted" />
              </TableCell>
              <TableCell>
                <div className="h-4 w-32 animate-pulse rounded bg-muted" />
              </TableCell>
              <TableCell>
                <div className="h-4 w-12 animate-pulse rounded bg-muted ml-auto" />
              </TableCell>
              <TableCell>
                <div className="h-4 w-16 animate-pulse rounded bg-muted ml-auto" />
              </TableCell>
            </TableRow>
          ))}

        {!isLoading &&
          rows.map((row, i) => (
            <TableRow key={`${row.name}-${i}`}>
              <TableCell className="text-muted-foreground">{i + 1}</TableCell>
              <TableCell className="font-medium">{row.name}</TableCell>
              <TableCell className="text-right">{row.bookingCount}</TableCell>
              <TableCell className="text-right">{formatHours(row.totalHours)}</TableCell>
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
