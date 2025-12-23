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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Unit } from "@/lib/api/admin";

interface UnitEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: number | null, name: string, description: string) => void;
  unit: Unit | null; // null for adding, Unit object for editing
}

const UnitEditDialog: React.FC<UnitEditDialogProps> = ({ isOpen, onClose, onSubmit, unit }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setName(unit ? unit.name : '');
      setDescription(unit ? unit.description : '');
      setError('');
    }
  }, [isOpen, unit]);

  const handleSubmit = () => {
    if (!name.trim()) {
      setError('Unit name cannot be empty.');
      return;
    }
    onSubmit(unit ? unit.id : null, name, description);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{unit ? 'Edit Unit' : 'Add New Unit'}</DialogTitle>
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
           <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="description" className="text-right pt-2">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
              placeholder="A brief description of the unit"
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

export default UnitEditDialog;
