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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, ArrowRightLeft, Loader2, UserPlus } from "lucide-react"
import { officerService } from "@/lib/api/officer"
import { adminService } from "@/lib/api/admin"
import { commonService } from "@/lib/api/common"
import { getFullStaticUrl, getInitials } from "@/lib/constants"
import type { UnitOfficer } from "@/lib/api/types"

interface TransferDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentUnit: string
  unitId?: number // For admin to fetch officers from specific unit
  requestId?: number
  onTransferComplete?: () => void
  title?: string
  description?: string
  disabledUserId?: number // User ID to disable in the list (e.g., requester or currently assigned officer)
}

export function TransferDialog({ open, onOpenChange, currentUnit, unitId, requestId, onTransferComplete, title, description, disabledUserId }: TransferDialogProps) {
  const [selectedOfficer, setSelectedOfficer] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [officers, setOfficers] = useState<UnitOfficer[]>([])
  const [loading, setLoading] = useState(false)
  const [transferring, setTransferring] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load officers when dialog opens
  useEffect(() => {
    if (open) {
      loadOfficers()
    } else {
      // Reset state when dialog closes
      setSelectedOfficer("")
      setSearchQuery("")
      setError(null)
    }
  }, [open, unitId])

  const loadOfficers = async () => {
    setLoading(true)
    setError(null)
    try {
      // If unitId is provided (admin case), fetch officers from that specific unit
      // Otherwise, fetch officers from current user's unit (officer case)
      const data = unitId 
        ? await adminService.getOfficersByUnit(unitId)
        : await officerService.getUnitOfficers()
      setOfficers(data)
    } catch (err) {
      console.error("Failed to load officers:", err)
      setError("Failed to load officers. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const filteredOfficers = officers.filter(
    (officer) => {
      const fullName = `${officer.firstName} ${officer.lastName}`.toLowerCase()
      const query = searchQuery.toLowerCase()
      return fullName.includes(query) || officer.email.toLowerCase().includes(query)
    }
  )

  const handleTransfer = async () => {
    if (!selectedOfficer || !requestId) return

    setTransferring(true)
    setError(null)
    try {
      await commonService.transferToOfficer(requestId, Number(selectedOfficer))
      onOpenChange(false)
      onTransferComplete?.()
    } catch (err) {
      console.error("Failed to transfer request:", err)
      setError("Failed to transfer request. Please try again.")
    } finally {
      setTransferring(false)
    }
  }

  const canTransfer = selectedOfficer && !transferring

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {title ? <UserPlus className="w-5 h-5" /> : <ArrowRightLeft className="w-5 h-5" />}
            {title || "Transfer Request"}
          </DialogTitle>
          <DialogDescription>
            {description || "Transfer this request to another officer in your unit."}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search officers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="mt-4 max-h-64 overflow-y-auto">
            <p className="text-sm text-muted-foreground mb-3">
              Officers in <span className="font-medium text-foreground">{currentUnit || "your unit"}</span>
            </p>
            
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3 p-3">
                    <Skeleton className="h-9 w-9 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-32 mb-1" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-sm text-destructive text-center py-4">{error}</div>
            ) : (
              <RadioGroup value={selectedOfficer} onValueChange={setSelectedOfficer}>
                <div className="space-y-2">
                  {filteredOfficers.map((officer) => {
                    const isDisabled = disabledUserId === officer.id
                    return (
                      <Label
                        key={officer.id}
                        htmlFor={`officer-${officer.id}`}
                        className={`flex items-center gap-3 p-3 rounded-lg border transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5 ${
                          isDisabled 
                            ? "opacity-50 cursor-not-allowed" 
                            : "cursor-pointer hover:bg-muted/50"
                        }`}
                      >
                        <RadioGroupItem 
                          value={String(officer.id)} 
                          id={`officer-${officer.id}`} 
                          disabled={isDisabled}
                        />
                        <Avatar className="h-9 w-9">
                          {officer.avatarUrl && (
                            <AvatarImage src={getFullStaticUrl(officer.avatarUrl) || undefined} />
                          )}
                          <AvatarFallback className="bg-secondary text-secondary-foreground text-sm">
                            {getInitials(`${officer.firstName} ${officer.lastName}`)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{officer.firstName} {officer.lastName}</p>
                          <p className="text-xs text-muted-foreground truncate">{officer.email}</p>
                        </div>
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                          {officer.roleName}
                        </span>
                        {isDisabled && (
                          <span className="text-xs text-muted-foreground">
                            {disabledUserId === officer.id && title?.includes("Transfer") ? "(Current)" : "(Requester)"}
                          </span>
                        )}
                      </Label>
                    )
                  })}
                  {filteredOfficers.length === 0 && !loading && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      {officers.length === 0 ? "No other officers in your unit" : "No officers found"}
                    </p>
                  )}
                </div>
              </RadioGroup>
            )}
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleTransfer} disabled={!canTransfer}>
            {transferring ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Transferring...
              </>
            ) : (
              <>
                <ArrowRightLeft className="w-4 h-4 mr-2" />
                Transfer
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
