"use client"
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { adminService, Unit } from "@/lib/api/admin";
import { toast } from "@/components/ui/use-toast";
import UnitsTable from "@/components/units-table";
import UnitEditDialog from "@/components/unit-edit-dialog";

export default function AdminUnitsPage() {
    const [units, setUnits] = useState<Unit[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingUnit, setEditingUnit] = useState<Unit | null>(null);

    const fetchUnits = async () => {
        try {
            setLoading(true);
            const data = await adminService.getAllUnits();
            setUnits(data);
        } catch (error) {
            toast({
                title: "Error fetching units",
                description: "Could not fetch units. Please try again later.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUnits();
    }, []);

    const handleDialogSubmit = async (id: number | null, name: string, description: string) => {
        try {
            if (id !== null) { // Editing existing unit
                await adminService.updateUnit(id, { name, description, isActive: editingUnit?.isActive ?? false });
                toast({ title: "Unit updated successfully" });
            } else { // Adding new unit
                await adminService.addUnit({ name, description });
                toast({ title: "Unit added successfully" });
            }
            fetchUnits(); // Refresh list
            setIsDialogOpen(false); // Close dialog on success
        } catch (error) {
            toast({
                title: `Error ${id ? 'updating' : 'adding'} unit`,
                description: `Could not ${id ? 'update' : 'add'} the unit. Please try again.`,
                variant: "destructive",
            });
        }
    };
    
    const handleSetActivity = async (id: number, isActive: boolean) => {
        try {
            if (isActive) {
                await adminService.activateUnit(id);
                toast({ title: "Unit activated successfully" });
            } else {
                await adminService.deleteUnit(id);
                toast({ title: "Unit deactivated successfully" });
            }
            fetchUnits(); // Refresh list
        } catch (error) {
            toast({
                title: `Error ${isActive ? 'activating' : 'deactivating'} unit`,
                description: `Could not ${isActive ? 'activate' : 'deactivate'} the unit. Please try again.`,
                variant: "destructive",
            });
        }
    };

    const openAddDialog = () => {
        setEditingUnit(null);
        setIsDialogOpen(true);
    };

    const openEditDialog = (unit: Unit) => {
        setEditingUnit(unit);
        setIsDialogOpen(true);
    };

    return (
        <div className="container mx-auto p-4 md:p-6 lg:p-8">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Unit Management</h1>
                <Button onClick={openAddDialog}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Unit
                </Button>
            </div>

            <div className="bg-card border rounded-lg shadow-sm">
                <UnitsTable
                    units={units}
                    loading={loading}
                    onEdit={openEditDialog}
                    onSetActivity={handleSetActivity}
                />
            </div>

            <UnitEditDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                onSubmit={handleDialogSubmit}
                unit={editingUnit}
            />
        </div>
    );
}
