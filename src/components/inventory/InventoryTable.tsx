'use client';

import { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    flexRender,
    ColumnDef,
    SortingState,
    ColumnFiltersState
} from '@tanstack/react-table';
import { ArrowUpDown, ChevronDown, MoreHorizontal, Filter } from 'lucide-react';

import { db, Catch } from '@/lib/db';
import { updateCatchStatus, InventoryStatus, STATUS_LABELS, STATUS_COLORS } from '@/lib/inventory-machine';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils'; // Assuming this exists from project scan

export function InventoryTable() {
    const data = useLiveQuery(() => db.catches.toArray()) || [];
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

    const columns = useMemo<ColumnDef<Catch>[]>(() => [
        {
            accessorKey: 'species',
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                        className="pl-0 hover:bg-transparent"
                    >
                        Species
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => <div className="font-semibold">{row.getValue('species')}</div>,
        },
        {
            accessorKey: 'weight',
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    className="pl-0 hover:bg-transparent"
                >
                    Weight (kg)
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => <div className="font-mono">{row.getValue<number>('weight').toFixed(2)}</div>,
        },
        {
            accessorKey: 'inventoryStatus',
            header: 'Status',
            cell: ({ row }) => {
                const status = row.getValue('inventoryStatus') as InventoryStatus;
                return (
                    <Badge variant="outline" className={cn("capitalize font-normal", STATUS_COLORS[status] || STATUS_COLORS['caught'])}>
                        {STATUS_LABELS[status] || status}
                    </Badge>
                );
            },
        },
        {
            accessorKey: 'timestamp',
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    className="pl-0 hover:bg-transparent"
                >
                    Logged At
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => {
                const date = new Date(row.getValue('timestamp'));
                return <div className="text-muted-foreground text-sm">{date.toLocaleDateString()}</div>
            },
        },
        {
            id: 'actions',
            cell: ({ row }) => {
                const catchItem = row.original;
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => updateCatchStatus(catchItem.id!, 'caught')}>
                                Mark as Caught
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateCatchStatus(catchItem.id!, 'on_ice')}>
                                Move to Ice
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateCatchStatus(catchItem.id!, 'listed')}>
                                List for Sale
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => updateCatchStatus(catchItem.id!, 'sold')} className="text-emerald-600 font-semibold">
                                Mark as SOLD
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        },
    ], []);

    const table = useReactTable({
        data,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        state: {
            sorting,
            columnFilters,
        },
        initialState: {
            pagination: {
                pageSize: 10,
            }
        }
    });

    return (
        <Card className="border-none shadow-none bg-transparent">
            <CardHeader className="px-0 pt-0 pb-4">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-2xl font-bold">Inventory Management</CardTitle>
                        <CardDescription>Track catch lifecycle from boat to table.</CardDescription>
                    </div>
                </div>
                <div className="flex items-center py-4 gap-2">
                    <Input
                        placeholder="Filter species..."
                        value={(table.getColumn('species')?.getFilterValue() as string) ?? ''}
                        onChange={(event) =>
                            table.getColumn('species')?.setFilterValue(event.target.value)
                        }
                        className="max-w-sm h-12 bg-white rounded-xl border-slate-200"
                    />
                    {/* Basic Status Filter Placeholder - Can enhance later */}
                    <Button variant="outline" className="h-12 rounded-xl">
                        <Filter className="mr-2 h-4 w-4" /> Filter
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="px-0">
                <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                    <div className="relative w-full overflow-auto">
                        <table className="w-full caption-bottom text-sm text-left">
                            <thead className="[&_tr]:border-b bg-slate-50/50">
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <tr key={headerGroup.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                        {headerGroup.headers.map((header) => (
                                            <th key={header.id} className="h-12 px-4 align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext()
                                                    )}
                                            </th>
                                        ))}
                                    </tr>
                                ))}
                            </thead>
                            <tbody className="[&_tr:last-child]:border-0">
                                {table.getRowModel().rows?.length ? (
                                    table.getRowModel().rows.map((row) => (
                                        <tr
                                            key={row.id}
                                            data-state={row.getIsSelected() && 'selected'}
                                            className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                                        >
                                            {row.getVisibleCells().map((cell) => (
                                                <td key={cell.id} className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={columns.length} className="h-24 text-center">
                                            No results.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="flex items-center justify-end space-x-2 py-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                        className="rounded-lg"
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                        className="rounded-lg"
                    >
                        Next
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
