"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Building2 } from "lucide-react"
import type { User } from "@/app/admin/users/page"

interface AssignUnitDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User
  onSave: (userId: string, units: string[]) => void
}

const allUnits = [
  "Information Technology",
  "Student Affairs",
  "Housing Services",
  "Finance Department",
  "Registrar",
  "Facilities Management",
  "Academic Affairs",
  "Library Services",
  "Health Services",
  "Career Services",
]

export function AssignUnitDialog({ open, onOpenChange, user, onSave }: AssignUnitDialogProps) {
  const [selectedUnits, setSelectedUnits] = useState<string[]>([])

  useEffect(() => {
    if (open && user) {
      setSelectedUnits(user.assignedUnits || [])
    }
  }, [open, user])

  const handleToggleUnit = (unit: string) => {
    setSelectedUnits((prev) => (prev.includes(unit) ? prev.filter((u) => u !== unit) : [...prev, unit]))
  }

  const handleSave = () => {
    onSave(user.id, selectedUnits)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            Assign Units
          </DialogTitle>
          <DialogDescription>
            Select units to assign to{" "}
            <span className="font-medium">
              {user.name} {user.surname}
            </span>
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {allUnits.map((unit) => (
              <div key={unit} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50">
                <Checkbox
                  id={unit}
                  checked={selectedUnits.includes(unit)}
                  onCheckedChange={() => handleToggleUnit(unit)}
                />
                <Label htmlFor={unit} className="flex-1 cursor-pointer text-sm font-normal">
                  {unit}
                </Label>
              </div>
            ))}
          </div>
          {selectedUnits.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Selected: <span className="font-medium text-foreground">{selectedUnits.length}</span> unit(s)
              </p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
