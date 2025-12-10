"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Eye, EyeOff, Loader2 } from "lucide-react"

export function RegisterForm() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [tcError, setTcError] = useState("")
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    tcIdentity: "",
    password: "",
    confirmPassword: "",
  })

  const validateTCNumber = (tcNumber: string): boolean => {
    if (tcNumber.length !== 11 || !/^\d+$/.test(tcNumber)) return false
    if (tcNumber[0] === '0') return false

    const digits = tcNumber.split('').map(Number)
    const evenSum = digits.filter((_, i) => i % 2 === 0 && i < 9).reduce((sum, digit) => sum + digit, 0)
    const oddSum = digits.filter((_, i) => i % 2 === 1 && i < 9).reduce((sum, digit) => sum + digit, 0)

    const digit10 = (evenSum * 7 - oddSum) % 10
    const digit11 = digits.slice(0, 10).reduce((sum, digit) => sum + digit, 0) % 10

    return digit10 === digits[9] && digit11 === digits[10]
  }

  const handleTCChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setFormData({ ...formData, tcIdentity: value })
    
    if (value.length === 11) {
      if (!validateTCNumber(value)) {
        setTcError("Invalid TC Identity Number")
      } else {
        setTcError("")
      }
    } else {
      setTcError("")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateTCNumber(formData.tcIdentity)) {
      setTcError("Invalid TC Identity Number")
      return
    }
    
    setIsLoading(true)

    // Simulate registration
    await new Promise((resolve) => setTimeout(resolve, 1000))

    router.push("/login")
    setIsLoading(false)
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                type="text"
                placeholder="John"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                type="text"
                placeholder="Doe"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
                className="h-11"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tcIdentity">TC Identity Number</Label>
            <Input
              id="tcIdentity"
              type="text"
              placeholder="Enter your TC Identity Number"
              value={formData.tcIdentity}
              onChange={handleTCChange}
              required
              maxLength={11}
              pattern="[0-9]{11}"
              className={`h-11 ${tcError ? "border-red-500 focus-visible:ring-red-500" : ""}`}
            />
            {tcError && <p className="text-sm text-red-500 mt-1">{tcError}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@university.edu"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+90 5XX XXX XX XX"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                className="h-11 pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-11 w-11 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
              className="h-11"
            />
          </div>

          <Button type="submit" className="w-full h-11" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              "Create Account"
            )}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
