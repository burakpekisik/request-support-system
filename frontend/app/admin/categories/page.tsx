"use client"
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { adminService, Category } from "@/lib/api/admin";
import CategoriesTable from "@/components/categories-table";
import CategoryEditDialog from "@/components/category-edit-dialog";
import { toast } from "@/components/ui/use-toast";

export default function AdminCategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const data = await adminService.getAllCategories();
            setCategories(data);
        } catch (error) {
            toast({
                title: "Error fetching categories",
                description: "Could not fetch categories. Please try again later.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleDialogSubmit = async (id: number | null, name: string, description: string) => {
        try {
            if (id !== null) { // Editing existing category
                await adminService.updateCategory(id, name, description);
                toast({ title: "Category updated successfully" });
            } else { // Adding new category
                await adminService.addCategory(name, description);
                toast({ title: "Category added successfully" });
            }
            fetchCategories(); // Refresh list
            setIsDialogOpen(false); // Close dialog on success
        } catch (error) {
            toast({
                title: `Error ${id ? 'updating' : 'adding'} category`,
                description: `Could not ${id ? 'update' : 'add'} the category. Please try again.`,
                variant: "destructive",
            });
        }
    };
    
    const handleSetActivity = async (id: number, isActive: boolean) => {
        try {
            if (isActive) {
                await adminService.activateCategory(id);
                toast({ title: "Category activated successfully" });
            } else {
                await adminService.deleteCategory(id);
                toast({ title: "Category deactivated successfully" });
            }
            fetchCategories(); // Refresh list
        } catch (error) {
            toast({
                title: `Error ${isActive ? 'activating' : 'deactivating'} category`,
                description: `Could not ${isActive ? 'activate' : 'deactivate'} the category. Please try again.`,
                variant: "destructive",
            });
        }
    };

    const openAddDialog = () => {
        setEditingCategory(null);
        setIsDialogOpen(true);
    };

    const openEditDialog = (category: Category) => {
        setEditingCategory(category);
        setIsDialogOpen(true);
    };

    return (
        <div className="container mx-auto p-4 md:p-6 lg:p-8">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Category Management</h1>
                <Button onClick={openAddDialog}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Category
                </Button>
            </div>

            <div className="bg-card border rounded-lg shadow-sm">
                <CategoriesTable
                    categories={categories}
                    loading={loading}
                    onEdit={openEditDialog} // Pass the function to open the dialog
                    onSetActivity={handleSetActivity}
                />
            </div>

            <CategoryEditDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                onSubmit={handleDialogSubmit}
                category={editingCategory}
            />
        </div>
    );
}
