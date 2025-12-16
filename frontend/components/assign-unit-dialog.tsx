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
import { adminService } from "@/lib/api/admin"

interface AssignUnitDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User
  onSave: (userId: string, units: string[]) => void
}

export function AssignUnitDialog({ open, onOpenChange, user, onSave }: AssignUnitDialogProps) {
  const [selectedUnits, setSelectedUnits] = useState<number[]>([])
  const [allUnits, setAllUnits] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (open) {
      fetchUnits()
    }
  }, [open])

  const fetchUnits = async () => {
    try {
      console.log("[AssignUnitDialog] Fetching all units")
      const units = await adminService.getAllUnits()
      console.log("[AssignUnitDialog] Units fetched:", units)
      setAllUnits(units)
      
      // Pre-select user's current units
      if (user.unit_ids) {
        const currentUnitIds = user.unit_ids.split(',').map((id: string) => parseInt(id.trim())).filter((id: number) => !isNaN(id))
        console.log("[AssignUnitDialog] Pre-selecting units:", currentUnitIds)
        setSelectedUnits(currentUnitIds)
      } else {
        setSelectedUnits([])
      }
    } catch (error) {
      console.error("[AssignUnitDialog] Error fetching units:", error)
    }
  }

  const handleToggleUnit = (unitId: number) => {
    setSelectedUnits((prev) =>
      prev.includes(unitId) ? prev.filter((id) => id !== unitId) : [...prev, unitId]
    )
  }

  const handleSave = async () => {
    try {
      setIsLoading(true)
      console.log(`[AssignUnitDialog] Saving units for user ${user.id}:`, selectedUnits)
      
      await adminService.updateUserUnits(Number(user.id), selectedUnits)
      
      console.log("[AssignUnitDialog] Units saved successfully")
      const unitNames = allUnits
        .filter((u) => selectedUnits.includes(u.id))
        .map((u) => u.name)
      
      onSave(user.id, unitNames)
      onOpenChange(false)
    } catch (error) {
      console.error("[AssignUnitDialog] Error saving units:", error)
    } finally {
      setIsLoading(false)
    }
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
              {user.name || user.first_name} {user.surname || user.last_name}
            </span>
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {allUnits.length === 0 ? (
              <p className="text-sm text-muted-foreground">Loading units...</p>
            ) : (
              allUnits.map((unit) => (
                <div key={unit.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50">
                  <Checkbox
                    id={`unit-${unit.id}`}
                    checked={selectedUnits.includes(unit.id)}
                    onCheckedChange={() => handleToggleUnit(unit.id)}
                    disabled={isLoading}
                  />
                  <Label htmlFor={`unit-${unit.id}`} className="flex-1 cursor-pointer text-sm font-normal">
                    {unit.name}
                  </Label>
                </div>
              ))
            )}
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
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
