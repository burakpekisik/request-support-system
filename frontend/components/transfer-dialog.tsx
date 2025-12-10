"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Search, User, Building2, ArrowRightLeft } from "lucide-react"

interface TransferDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentUnit: string
}

// Mock data for officers in same unit
const sameUnitOfficers = [
  { id: "1", name: "Ahmet Yilmaz", email: "ahmet.yilmaz@university.edu", role: "Senior Officer" },
  { id: "2", name: "Fatma Demir", email: "fatma.demir@university.edu", role: "Officer" },
  { id: "3", name: "Mehmet Kaya", email: "mehmet.kaya@university.edu", role: "Officer" },
  { id: "4", name: "Ayse Celik", email: "ayse.celik@university.edu", role: "Team Lead" },
]

// Mock data for different units
const otherUnits = [
  { id: "1", name: "Student Affairs", description: "Handles student-related matters" },
  { id: "2", name: "Housing Services", description: "Dormitory and accommodation" },
  { id: "3", name: "Finance Department", description: "Financial services and payments" },
  { id: "4", name: "Registrar", description: "Academic records and enrollment" },
  { id: "5", name: "Facilities Management", description: "Campus facilities and maintenance" },
  { id: "6", name: "Library Services", description: "Library resources and access" },
]

export function TransferDialog({ open, onOpenChange, currentUnit }: TransferDialogProps) {
  const [selectedOfficer, setSelectedOfficer] = useState("")
  const [selectedUnit, setSelectedUnit] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("officers")

  const filteredOfficers = sameUnitOfficers.filter(
    (officer) =>
      officer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      officer.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const filteredUnits = otherUnits.filter(
    (unit) =>
      unit.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      unit.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleTransfer = () => {
    // TODO: Implement transfer API call
    // if (activeTab === "officers" && selectedOfficer) {
    //   await requestService.transferToOfficer(selectedOfficer)
    // } else if (activeTab === "units" && selectedUnit) {
    //   await requestService.transferToUnit(selectedUnit)
    // }
    onOpenChange(false)
    setSelectedOfficer("")
    setSelectedUnit("")
    setSearchQuery("")
  }

  const canTransfer = (activeTab === "officers" && selectedOfficer) || (activeTab === "units" && selectedUnit)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5" />
            Transfer Request
          </DialogTitle>
          <DialogDescription>
            Transfer this request to another officer in your unit or to a different unit.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="officers" className="gap-2">
              <User className="w-4 h-4" />
              My Unit Officers
            </TabsTrigger>
            <TabsTrigger value="units" className="gap-2">
              <Building2 className="w-4 h-4" />
              Other Units
            </TabsTrigger>
          </TabsList>

          {/* Search Input */}
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={activeTab === "officers" ? "Search officers..." : "Search units..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <TabsContent value="officers" className="mt-4 max-h-64 overflow-y-auto">
            <p className="text-sm text-muted-foreground mb-3">
              Officers in <span className="font-medium text-foreground">{currentUnit}</span>
            </p>
            <RadioGroup value={selectedOfficer} onValueChange={setSelectedOfficer}>
              <div className="space-y-2">
                {filteredOfficers.map((officer) => (
                  <Label
                    key={officer.id}
                    htmlFor={`officer-${officer.id}`}
                    className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5"
                  >
                    <RadioGroupItem value={officer.id} id={`officer-${officer.id}`} />
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-secondary text-secondary-foreground text-sm">
                        {officer.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{officer.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{officer.email}</p>
                    </div>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">{officer.role}</span>
                  </Label>
                ))}
                {filteredOfficers.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No officers found</p>
                )}
              </div>
            </RadioGroup>
          </TabsContent>

          <TabsContent value="units" className="mt-4 max-h-64 overflow-y-auto">
            <p className="text-sm text-muted-foreground mb-3">Transfer to a different department</p>
            <RadioGroup value={selectedUnit} onValueChange={setSelectedUnit}>
              <div className="space-y-2">
                {filteredUnits.map((unit) => (
                  <Label
                    key={unit.id}
                    htmlFor={`unit-${unit.id}`}
                    className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5"
                  >
                    <RadioGroupItem value={unit.id} id={`unit-${unit.id}`} />
                    <div className="p-2 rounded-lg bg-muted">
                      <Building2 className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{unit.name}</p>
                      <p className="text-xs text-muted-foreground">{unit.description}</p>
                    </div>
                  </Label>
                ))}
                {filteredUnits.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No units found</p>
                )}
              </div>
            </RadioGroup>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleTransfer} disabled={!canTransfer}>
            <ArrowRightLeft className="w-4 h-4 mr-2" />
            Transfer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
