"use client"
import React, { useState } from 'react';
import { Unit } from "@/lib/api/admin";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, CheckCircle, XCircle } from "lucide-react";
import { ConfirmationDialog } from './confirmation-dialog';

interface UnitsTableProps {
    units: Unit[];
    loading: boolean;
    onEdit: (unit: Unit) => void;
    onSetActivity: (id: number, isActive: boolean) => Promise<void>;
}

const UnitsTable: React.FC<UnitsTableProps> = ({ units, loading, onEdit, onSetActivity }) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogContent, setDialogContent] = useState<{ title: string; description: string; onConfirm: () => void; } | null>(null);

    const handleEditClick = (unit: Unit) => {
        onEdit(unit);
    };
    
    const openConfirmationDialog = (title: string, description: string, onConfirm: () => void) => {
        setDialogContent({ title, description, onConfirm });
        setDialogOpen(true);
    };

    const handleDeactivateClick = (unit: Unit) => {
        openConfirmationDialog(
            "Deactivate Unit",
            `Are you sure you want to deactivate the unit "${unit.name}"?`,
            () => onSetActivity(unit.id, false)
        );
    };

    const handleActivateClick = (unit: Unit) => {
        openConfirmationDialog(
            "Activate Unit",
            `Are you sure you want to activate the unit "${unit.name}"?`,
            () => onSetActivity(unit.id, true)
        );
    };

    if (loading) {
        return (
            <div className="p-4">
                <Skeleton className="h-10 w-full mb-2" />
                <Skeleton className="h-10 w-full mb-2" />
                <Skeleton className="h-10 w-full" />
            </div>
        );
    }

    if (units.length === 0) {
        return <div className="p-4 text-center text-muted-foreground">No units found.</div>;
    }

    return (
        <>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {units.map((unit) => (
                        <TableRow key={unit.id}>
                            <TableCell className="font-medium">{unit.name}</TableCell>
                            <TableCell>{unit.description}</TableCell>
                            <TableCell>
                                <Badge variant={unit.isActive ? "success" : "destructive"}>
                                    {unit.isActive ? "Active" : "Inactive"}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                            <span className="sr-only">Open menu</span>
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => handleEditClick(unit)}>
                                            <Pencil className="mr-2 h-4 w-4" />
                                            <span>Edit</span>
                                        </DropdownMenuItem>
                                        {unit.isActive ? (
                                             <DropdownMenuItem onClick={() => handleDeactivateClick(unit)} className="text-destructive">
                                                <XCircle className="mr-2 h-4 w-4" />
                                                <span>Deactivate</span>
                                            </DropdownMenuItem>
                                        ) : (
                                            <DropdownMenuItem onClick={() => handleActivateClick(unit)} className="text-green-600">
                                                <CheckCircle className="mr-2 h-4 w-4" />
                                                <span>Activate</span>
                                            </DropdownMenuItem>
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            
            {dialogContent && (
                 <ConfirmationDialog
                    open={dialogOpen}
                    onOpenChange={(open) => setDialogOpen(open)}
                    onConfirm={() => {
                        if (dialogContent) {
                            dialogContent.onConfirm();
                        }
                        setDialogOpen(false);
                    }}
                    title={dialogContent.title}
                    description={dialogContent.description}
                />
            )}
        </>
    );
};

export default UnitsTable;
