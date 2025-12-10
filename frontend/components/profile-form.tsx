"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, Save, Lock } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import type { UserData } from "@/lib/api/types"
import { getInitials } from "@/lib/constants"
import { storage } from "@/lib/storage"

export function ProfileForm() {
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    email: "",
    tc_number: "",
    phone: "",
  })
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const userData = storage.getUserData()
    if (userData) {
      setFormData({
        name: userData.firstName || "",
        surname: userData.lastName || "",
        email: userData.email || "",
        tc_number: userData.tcNumber || "",
        phone: userData.phoneNumber || "",
      })
    }
  }, [])

  const initials = formData.name && formData.surname 
    ? getInitials(`${formData.name} ${formData.surname}`)
    : "U"

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setPhotoUrl(url)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement profile update API call
    // await profileService.updateProfile(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Photo Upload */}
      <div className="flex items-center gap-6">
        <div className="relative">
          <Avatar className="w-24 h-24">
            <AvatarImage src={photoUrl || undefined} alt={`${formData.name} ${formData.surname}`} />
            <AvatarFallback className="bg-primary text-primary-foreground text-2xl">{initials}</AvatarFallback>
          </Avatar>
          <Button
            type="button"
            size="icon"
            variant="secondary"
            className="absolute bottom-0 right-0 rounded-full w-8 h-8"
            onClick={() => fileInputRef.current?.click()}
          >
            <Camera className="w-4 h-4" />
          </Button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
        </div>
        <div>
          <h3 className="font-medium">
            {formData.name} {formData.surname}
          </h3>
          <p className="text-sm text-muted-foreground">Click the camera icon to upload a new photo</p>
        </div>
      </div>

      <Separator />

      {/* Name Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="surname">Surname</Label>
          <Input
            id="surname"
            value={formData.surname}
            onChange={(e) => setFormData((prev) => ({ ...prev, surname: e.target.value }))}
          />
        </div>
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
        />
      </div>

      {/* TC Number - Read Only */}
      <div className="space-y-2">
        <Label htmlFor="tc_number" className="flex items-center gap-2">
          TC Identity Number
          <Lock className="w-3 h-3 text-muted-foreground" />
        </Label>
        <Input id="tc_number" value={formData.tc_number} disabled className="bg-muted cursor-not-allowed" />
        <p className="text-xs text-muted-foreground">This field cannot be changed</p>
      </div>

      {/* Gender */}
      <div className="space-y-2">
        <Label htmlFor="gender">Gender</Label>
        <Select value={formData.gender} onValueChange={(value) => setFormData((prev) => ({ ...prev, gender: value }))}>
          <SelectTrigger id="gender">
            <SelectValue placeholder="Select gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="male">Male</SelectItem>
            <SelectItem value="female">Female</SelectItem>
            <SelectItem value="other">Other</SelectItem>
            <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Phone */}
      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
          placeholder="+90 5XX XXX XX XX"
        />
      </div>

      <Separator />

      {/* Submit */}
      <div className="flex justify-end">
        <Button type="submit" className="gap-2">
          <Save className="w-4 h-4" />
          Save Changes
        </Button>
      </div>
    </form>
  )
}
