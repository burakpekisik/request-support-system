"use client"
import React, { useState } from 'react';
import { Category } from "@/lib/api/admin";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2, CheckCircle, XCircle } from "lucide-react";
import { ConfirmationDialog } from './confirmation-dialog';

interface CategoriesTableProps {
    categories: Category[];
    loading: boolean;
    onEdit: (category: Category) => void; // Changed to pass the whole object
    onSetActivity: (id: number, isActive: boolean) => Promise<void>;
}

const CategoriesTable: React.FC<CategoriesTableProps> = ({ categories, loading, onEdit, onSetActivity }) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogContent, setDialogContent] = useState<{ title: string; description: string; onConfirm: () => void; } | null>(null);

    const handleEditClick = (category: Category) => {
        onEdit(category); // Pass the category object up to the parent
    };
    
    const openConfirmationDialog = (title: string, description: string, onConfirm: () => void) => {
        setDialogContent({ title, description, onConfirm });
        setDialogOpen(true);
    };

    const handleDeactivateClick = (category: Category) => {
        openConfirmationDialog(
            "Deactivate Category",
            `Are you sure you want to deactivate the category "${category.name}"?`,
            () => onSetActivity(category.id, false)
        );
    };

    const handleActivateClick = (category: Category) => {
        openConfirmationDialog(
            "Activate Category",
            `Are you sure you want to activate the category "${category.name}"?`,
            () => onSetActivity(category.id, true)
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

    if (categories.length === 0) {
        return <div className="p-4 text-center text-muted-foreground">No categories found.</div>;
    }

    return (
        <>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {categories.map((category) => (
                        <TableRow key={category.id}>
                            <TableCell className="font-medium">{category.name}</TableCell>
                            <TableCell>
                                <Badge variant={category.isActive ? "success" : "destructive"}>
                                    {category.isActive ? "Active" : "Inactive"}
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
                                        <DropdownMenuItem onClick={() => handleEditClick(category)}>
                                            <Pencil className="mr-2 h-4 w-4" />
                                            <span>Edit</span>
                                        </DropdownMenuItem>
                                        {category.isActive ? (
                                             <DropdownMenuItem onClick={() => handleDeactivateClick(category)} className="text-destructive">
                                                <XCircle className="mr-2 h-4 w-4" />
                                                <span>Deactivate</span>
                                            </DropdownMenuItem>
                                        ) : (
                                            <DropdownMenuItem onClick={() => handleActivateClick(category)} className="text-green-600">
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
                        dialogContent.onConfirm();
                        setDialogOpen(false);
                    }}
                    title={dialogContent.title}
                    description={dialogContent.description}
                />
            )}
        </>
    );
};

export default CategoriesTable;
