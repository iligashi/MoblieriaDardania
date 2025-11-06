"use client"

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import type { CustomField } from "@/lib/types"

interface DynamicFieldRendererProps {
  fields: CustomField[]
  values?: Record<string, any>
  onChange?: (key: string, value: any) => void
  readOnly?: boolean
  showLabels?: boolean
}

export function DynamicFieldRenderer({ 
  fields, 
  values = {}, 
  onChange,
  readOnly = false,
  showLabels = true
}: DynamicFieldRendererProps) {
  const sortedFields = [...fields].sort((a, b) => a.displayOrder - b.displayOrder)
    .filter(f => f.isVisible)

  if (sortedFields.length === 0) {
    return null
  }

  const renderField = (field: CustomField) => {
    const value = values[field.fieldKey] ?? field.fieldValue

    switch (field.fieldType) {
      case 'text':
      case 'url':
      case 'email':
        return (
          <div key={field.id} className="space-y-2">
            {showLabels && (
              <Label htmlFor={field.fieldKey} className="text-sm font-medium">
                {field.fieldLabel}
                {field.isRequired && <span className="text-destructive ml-1">*</span>}
              </Label>
            )}
            <Input
              id={field.fieldKey}
              type={field.fieldType === 'url' ? 'url' : field.fieldType === 'email' ? 'email' : 'text'}
              value={value || ''}
              onChange={(e) => onChange?.(field.fieldKey, e.target.value)}
              placeholder={field.fieldOptions?.placeholder}
              readOnly={readOnly}
              disabled={readOnly}
              className={readOnly ? "bg-muted" : ""}
            />
          </div>
        )
      
      case 'number':
        return (
          <div key={field.id} className="space-y-2">
            {showLabels && (
              <Label htmlFor={field.fieldKey} className="text-sm font-medium">
                {field.fieldLabel}
                {field.isRequired && <span className="text-destructive ml-1">*</span>}
              </Label>
            )}
            <Input
              id={field.fieldKey}
              type="number"
              value={value || ''}
              onChange={(e) => onChange?.(field.fieldKey, Number(e.target.value))}
              min={field.fieldOptions?.min}
              max={field.fieldOptions?.max}
              step={field.fieldOptions?.step}
              readOnly={readOnly}
              disabled={readOnly}
              className={readOnly ? "bg-muted" : ""}
            />
          </div>
        )
      
      case 'textarea':
        return (
          <div key={field.id} className="space-y-2">
            {showLabels && (
              <Label htmlFor={field.fieldKey} className="text-sm font-medium">
                {field.fieldLabel}
                {field.isRequired && <span className="text-destructive ml-1">*</span>}
              </Label>
            )}
            <Textarea
              id={field.fieldKey}
              value={value || ''}
              onChange={(e) => onChange?.(field.fieldKey, e.target.value)}
              rows={field.fieldOptions?.rows || 4}
              readOnly={readOnly}
              disabled={readOnly}
              className={readOnly ? "bg-muted" : ""}
            />
          </div>
        )
      
      case 'select':
        return (
          <div key={field.id} className="space-y-2">
            {showLabels && (
              <Label htmlFor={field.fieldKey} className="text-sm font-medium">
                {field.fieldLabel}
                {field.isRequired && <span className="text-destructive ml-1">*</span>}
              </Label>
            )}
            <Select
              value={value || ''}
              onValueChange={(val) => onChange?.(field.fieldKey, val)}
              disabled={readOnly}
            >
              <SelectTrigger id={field.fieldKey} className={readOnly ? "bg-muted" : ""}>
                <SelectValue placeholder={field.fieldOptions?.placeholder || `Select ${field.fieldLabel}`} />
              </SelectTrigger>
              <SelectContent>
                {field.fieldOptions?.options?.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )
      
      case 'boolean':
        return (
          <div key={field.id} className="flex items-center gap-2 space-y-0">
            <input
              type="checkbox"
              id={field.fieldKey}
              checked={value || false}
              onChange={(e) => onChange?.(field.fieldKey, e.target.checked)}
              disabled={readOnly}
              className="h-4 w-4 rounded border-gray-300"
            />
            {showLabels && (
              <Label htmlFor={field.fieldKey} className="text-sm font-medium cursor-pointer">
                {field.fieldLabel}
                {field.isRequired && <span className="text-destructive ml-1">*</span>}
              </Label>
            )}
          </div>
        )
      
      case 'color':
        return (
          <div key={field.id} className="space-y-2">
            {showLabels && (
              <Label htmlFor={field.fieldKey} className="text-sm font-medium">
                {field.fieldLabel}
                {field.isRequired && <span className="text-destructive ml-1">*</span>}
              </Label>
            )}
            <div className="flex items-center gap-2">
              <Input
                id={field.fieldKey}
                type="color"
                value={value || '#000000'}
                onChange={(e) => onChange?.(field.fieldKey, e.target.value)}
                disabled={readOnly}
                className="h-10 w-20 cursor-pointer"
              />
              <Input
                type="text"
                value={value || ''}
                onChange={(e) => onChange?.(field.fieldKey, e.target.value)}
                placeholder="#000000"
                disabled={readOnly}
                className={readOnly ? "bg-muted" : ""}
              />
            </div>
          </div>
        )
      
      case 'image':
        return (
          <div key={field.id} className="space-y-2">
            {showLabels && (
              <Label htmlFor={field.fieldKey} className="text-sm font-medium">
                {field.fieldLabel}
                {field.isRequired && <span className="text-destructive ml-1">*</span>}
              </Label>
            )}
            <Input
              id={field.fieldKey}
              type="url"
              value={value || ''}
              onChange={(e) => onChange?.(field.fieldKey, e.target.value)}
              placeholder="https://example.com/image.jpg"
              readOnly={readOnly}
              disabled={readOnly}
              className={readOnly ? "bg-muted" : ""}
            />
            {value && typeof value === 'string' && (
              <div className="mt-2">
                <img
                  src={value}
                  alt={field.fieldLabel}
                  className="max-w-full h-auto rounded-lg border border-border"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              </div>
            )}
          </div>
        )
      
      case 'date':
        return (
          <div key={field.id} className="space-y-2">
            {showLabels && (
              <Label htmlFor={field.fieldKey} className="text-sm font-medium">
                {field.fieldLabel}
                {field.isRequired && <span className="text-destructive ml-1">*</span>}
              </Label>
            )}
            <Input
              id={field.fieldKey}
              type="date"
              value={value || ''}
              onChange={(e) => onChange?.(field.fieldKey, e.target.value)}
              readOnly={readOnly}
              disabled={readOnly}
              className={readOnly ? "bg-muted" : ""}
            />
          </div>
        )
      
      default:
        return (
          <div key={field.id} className="space-y-2">
            {showLabels && (
              <Label className="text-sm font-medium">{field.fieldLabel}</Label>
            )}
            <p className="text-sm text-muted-foreground">
              {value ? String(value) : 'No value'}
            </p>
          </div>
        )
    }
  }

  return (
    <div className="space-y-4">
      {sortedFields.map(renderField)}
    </div>
  )
}

// Display component for product detail page (read-only, styled)
export function CustomFieldsDisplay({ fields, values = {} }: { fields: CustomField[], values?: Record<string, any> }) {
  const sortedFields = [...fields].sort((a, b) => a.displayOrder - b.displayOrder)
    .filter(f => f.isVisible)

  if (sortedFields.length === 0) {
    return null
  }

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {sortedFields.map((field) => {
        const value = values[field.fieldKey] ?? field.fieldValue
        
        return (
          <Card key={field.id} className="border border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <p className="text-sm font-medium text-muted-foreground mb-2">{field.fieldLabel}</p>
              <p className="text-base font-semibold text-foreground">
                {field.fieldType === 'boolean' 
                  ? value ? 'Yes' : 'No'
                  : field.fieldType === 'image' && value
                  ? (
                    <img
                      src={String(value)}
                      alt={field.fieldLabel}
                      className="max-w-full h-auto rounded-lg"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  )
                  : value ? String(value) : '—'
                }
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
