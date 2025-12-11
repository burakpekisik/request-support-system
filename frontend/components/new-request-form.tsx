"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, X, Loader2, FileText, AlertCircle } from "lucide-react"
import { commonService } from "@/lib/api/common"
import type { Category, Unit } from "@/lib/api/types"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface NewRequestFormProps {
  userRole?: string;
}

export function NewRequestForm({ userRole = "officer" }: NewRequestFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [files, setFiles] = useState<File[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [units, setUnits] = useState<Unit[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    categoryId: "",
    unitId: "",
    description: "",
  })

  useEffect(() => {
    loadFormData()
  }, [])

  const loadFormData = async () => {
    try {
      setIsLoadingData(true)
      const [categoriesData, unitsData] = await Promise.all([
        commonService.getCategories(),
        commonService.getUnits(),
      ])
      setCategories(categoriesData)
      setUnits(unitsData)
    } catch (error) {
      console.error("Failed to load form data:", error)
      setError("Failed to load categories and units. Please refresh the page.")
    } finally {
      setIsLoadingData(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(Array.from(e.target.files));
    }
  }

  const processFiles = (newFiles: File[]) => {
    const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const validExtensions = ['.pdf', '.png', '.jpg', '.jpeg', '.docx'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    const validFiles = newFiles.filter(file => {
      // Tip kontrolü
      const isValidType = validTypes.includes(file.type);
      const hasValidExtension = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
      
      if (!isValidType && !hasValidExtension) {
        setError(`Invalid file type: ${file.name}. Only PDF, PNG, JPG, or DOCX files are allowed.`);
        return false;
      }

      // Boyut kontrolü
      if (file.size > maxSize) {
        setError(`File too large: ${file.name}. Maximum size is 10MB.`);
        return false;
      }

      return true;
    });

    if (validFiles.length > 0) {
      setFiles([...files, ...validFiles]);
      setError(null);
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    processFiles(droppedFiles);
  }

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      await commonService.createRequest({
        title: formData.title,
        description: formData.description,
        unitId: parseInt(formData.unitId),
        categoryId: parseInt(formData.categoryId),
      }, files)

      // Navigate based on user role
      const redirectPath = userRole === "student" ? "/student/requests" : "/officer/requests"
      router.push(redirectPath)
    } catch (error) {
      console.error("Failed to create request:", error)
      setError(error instanceof Error ? error.message : "Failed to create request. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading form...</span>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="title">Request Title *</Label>
        <Input
          id="title"
          placeholder="Brief summary of your request"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
          className="h-11"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Category *</Label>
          <Select
            value={formData.categoryId}
            onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
            required
          >
            <SelectTrigger id="category" className="h-11">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={String(category.id)}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="unit">Unit *</Label>
          <Select 
            value={formData.unitId} 
            onValueChange={(value) => setFormData({ ...formData, unitId: value })} 
            required
          >
            <SelectTrigger id="unit" className="h-11">
              <SelectValue placeholder="Select a unit" />
            </SelectTrigger>
            <SelectContent>
              {units.map((unit) => (
                <SelectItem key={unit.id} value={String(unit.id)}>
                  {unit.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Please describe your issue or request in detail..."
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
          rows={6}
          className="resize-none"
        />
      </div>

      <div className="space-y-2">
        <Label>Attachments (Optional)</Label>
        <div 
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            isDragging 
              ? 'border-primary bg-primary/5' 
              : 'border-border hover:border-primary/50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input 
            type="file" 
            id="files" 
            multiple 
            accept=".pdf,.png,.jpg,.jpeg,.docx" 
            onChange={handleFileChange} 
            className="hidden" 
          />
          <label htmlFor="files" className="cursor-pointer">
            <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground mb-1">Click to upload or drag and drop</p>
            <p className="text-xs text-muted-foreground">PDF, PNG, JPG or DOCX (max. 10MB each)</p>
          </label>
        </div>

        {files.length > 0 && (
          <div className="space-y-2 mt-4">
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm truncate max-w-xs">{file.name}</span>
                  <span className="text-xs text-muted-foreground">({(file.size / 1024).toFixed(1)} KB)</span>
                </div>
                <Button type="button" variant="ghost" size="icon" onClick={() => removeFile(index)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-4 pt-4">
        <Button type="button" variant="outline" className="flex-1 bg-transparent" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" className="flex-1" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit Request"
          )}
        </Button>
      </div>
    </form>
  )
}
