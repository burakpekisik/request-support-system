"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"

export function LoginForm() {
  const { login, loading, error } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [tcError, setTcError] = useState("")
  const [formData, setFormData] = useState({
    tcIdentity: "",
    password: "",
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

    if (!formData.password.trim()) {
      setTcError("Password cannot be empty")
      return
    }

    try {
      await login(formData.tcIdentity, formData.password)
    } catch (err) {
      // Error is handled by useAuth hook
      console.error(err)
    }
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {(tcError || error) && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm font-medium text-red-800">
                {tcError || error}
              </p>
            </div>
          )}

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
              disabled={loading}
              className={`h-11 ${tcError ? "border-red-500 focus-visible:ring-red-500" : ""}`}
            />
            {tcError && <p className="text-sm text-red-500 mt-1">{tcError}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                disabled={loading}
                className="h-11 pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={loading}
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

          {/* <div className="flex items-center justify-between text-sm">
            <Link href="/forgot-password" className="text-primary hover:underline">
              Forgot password?
            </Link>
          </div> */}

          <Button type="submit" className="w-full h-11" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/register" className="text-primary hover:underline font-medium">
              Sign up
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}