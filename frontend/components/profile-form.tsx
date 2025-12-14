"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, Save, Lock, Loader2, CheckCircle } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { getInitials, getFullStaticUrl, AVATAR_VALID_TYPES, AVATAR_MAX_SIZE } from "@/lib/constants"
import { storage } from "@/lib/storage"
import { profileService } from "@/lib/api/profile"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { ProfileFormData } from "@/lib/api/types"

export function ProfileForm() {
  const [initialData, setInitialData] = useState<ProfileFormData>({
    name: "",
    surname: "",
    email: "",
    tc_number: "",
    phone: "",
  })
  const [formData, setFormData] = useState<ProfileFormData>({
    name: "",
    surname: "",
    email: "",
    tc_number: "",
    phone: "",
  })
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [initialPhotoUrl, setInitialPhotoUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const userData = storage.getUserData()
    if (userData) {
      const data: ProfileFormData = {
        name: userData.firstName || "",
        surname: userData.lastName || "",
        email: userData.email || "",
        tc_number: userData.tcNumber || "",
        phone: userData.phoneNumber || "",
      }
      setFormData(data)
      setInitialData(data)
      
      // Avatar URL'sini yükle
      if (userData.avatarUrl) {
        setPhotoUrl(userData.avatarUrl)
        setInitialPhotoUrl(userData.avatarUrl)
      }
    }
  }, [])

  const initials = formData.name && formData.surname 
    ? getInitials(`${formData.name} ${formData.surname}`)
    : "U"

  // Değişiklik kontrolü
  const hasChanges = () => {
    return (
      formData.name !== initialData.name ||
      formData.surname !== initialData.surname ||
      formData.email !== initialData.email ||
      formData.phone !== initialData.phone
    )
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Dosya tipi kontrolü
    if (!AVATAR_VALID_TYPES.includes(file.type)) {
      setError('Invalid file type. Only PNG, JPG, JPEG, GIF, and WEBP images are allowed.')
      return
    }

    // Dosya boyutu kontrolü
    if (file.size > AVATAR_MAX_SIZE) {
      setError('File too large. Maximum size is 5MB.')
      return
    }

    setIsUploadingAvatar(true)
    setError(null)

    try {
      // Önce önizleme için local URL oluştur
      const localUrl = URL.createObjectURL(file)
      setPhotoUrl(localUrl)

      // Backend'e yükle
      const response = await profileService.uploadAvatar(file)
      
      // LocalStorage'daki kullanıcı bilgilerini güncelle
      const userData = storage.getUserData()
      if (userData) {
        storage.setUserData({
          ...userData,
          avatarUrl: response.avatarUrl,
        })
      }

      // Backend'den gelen URL'yi set et
      setPhotoUrl(response.avatarUrl)
      setInitialPhotoUrl(response.avatarUrl)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      console.error('Failed to upload avatar:', err)
      setError(err instanceof Error ? err.message : 'Failed to upload avatar. Please try again.')
      // Hata durumunda eski fotoğrafa geri dön
      setPhotoUrl(initialPhotoUrl)
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      await profileService.updateProfile({
        firstName: formData.name,
        lastName: formData.surname,
        email: formData.email,
        phoneNumber: formData.phone,
      })

      // LocalStorage'daki kullanıcı bilgilerini güncelle
      const userData = storage.getUserData()
      if (userData) {
        storage.setUserData({
          ...userData,
          firstName: formData.name,
          lastName: formData.surname,
          email: formData.email,
          phoneNumber: formData.phone,
        })
      }

      // Initial data'yı güncelle
      setInitialData(formData)
      setSuccess(true)

      // Başarı mesajını 3 saniye sonra kaldır
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      console.error("Failed to update profile:", err)
      setError(err instanceof Error ? err.message : "Failed to update profile. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Success Message */}
      {success && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Profile updated successfully!
          </AlertDescription>
        </Alert>
      )}

      {/* Error Message */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Photo Upload */}
      <div className="flex items-center gap-6">
        <div className="relative">
          <Avatar className="w-24 h-24">
            <AvatarImage src={getFullStaticUrl(photoUrl) || undefined} alt={`${formData.name} ${formData.surname}`} />
            <AvatarFallback className="bg-primary text-primary-foreground text-2xl">{initials}</AvatarFallback>
          </Avatar>
          {isUploadingAvatar ? (
            <div className="absolute bottom-0 right-0 rounded-full w-8 h-8 bg-secondary flex items-center justify-center">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
          ) : (
            <Button
              type="button"
              size="icon"
              variant="secondary"
              className="absolute bottom-0 right-0 rounded-full w-8 h-8"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="w-4 h-4" />
            </Button>
          )}
          <input 
            ref={fileInputRef} 
            type="file" 
            accept=".png,.jpg,.jpeg,.gif,.webp" 
            className="hidden" 
            onChange={handlePhotoUpload} 
          />
        </div>
        <div>
          <h3 className="font-medium">
            {formData.name} {formData.surname}
          </h3>
          <p className="text-sm text-muted-foreground">Click the camera icon to upload a new photo</p>
          <p className="text-xs text-muted-foreground">PNG, JPG, GIF or WEBP (max. 5MB)</p>
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
        <Button type="submit" className="gap-2" disabled={!hasChanges() || isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
