"use client"

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Category } from "@/lib/api/admin";

interface CategoryEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: number | null, name: string) => void;
  category: Category | null; // null for adding, Category object for editing
}

const CategoryEditDialog: React.FC<CategoryEditDialogProps> = ({ isOpen, onClose, onSubmit, category }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setName(category ? category.name : '');
      setError('');
    }
  }, [isOpen, category]);

  const handleSubmit = () => {
    if (!name.trim()) {
      setError('Category name cannot be empty.');
      return;
    }
    onSubmit(category ? category.id : null, name);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{category ? 'Edit Category' : 'Add New Category'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
            />
          </div>
          {error && <p className="col-span-4 text-sm text-red-500 text-center">{error}</p>}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleSubmit}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryEditDialog;
