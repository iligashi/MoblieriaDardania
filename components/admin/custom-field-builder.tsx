"use client"

import { useState } from "react"
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core"
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { GripVertical, Plus, Trash2, Settings, X } from "lucide-react"
import type { CustomField, FieldType } from "@/lib/types"

interface CustomFieldBuilderProps {
  furnitureId?: string
  initialFields?: CustomField[]
  onFieldsChange?: (fields: CustomField[]) => void
}

const FIELD_TYPES: { value: FieldType; label: string }[] = [
  { value: 'text', label: 'Text Input' },
  { value: 'number', label: 'Number Input' },
  { value: 'textarea', label: 'Textarea' },
  { value: 'select', label: 'Select Dropdown' },
  { value: 'date', label: 'Date Picker' },
  { value: 'boolean', label: 'Checkbox' },
  { value: 'url', label: 'URL' },
  { value: 'email', label: 'Email' },
  { value: 'color', label: 'Color Picker' },
  { value: 'image', label: 'Image URL' },
]

export function CustomFieldBuilder({ furnitureId, initialFields = [], onFieldsChange }: CustomFieldBuilderProps) {
  const [fields, setFields] = useState<CustomField[]>(initialFields)
  const [editingField, setEditingField] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      setFields((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)
        const newFields = arrayMove(items, oldIndex, newIndex).map((field, index) => ({
          ...field,
          displayOrder: index,
        }))
        onFieldsChange?.(newFields)
        return newFields
      })
    }
  }

  const addField = () => {
    const newField: CustomField = {
      id: `field-${Date.now()}`,
      fieldType: 'text',
      fieldKey: `field_${Date.now()}`,
      fieldLabel: 'New Field',
      displayOrder: fields.length,
      isRequired: false,
      isVisible: true,
    }
    const newFields = [...fields, newField]
    setFields(newFields)
    onFieldsChange?.(newFields)
    setEditingField(newField.id)
  }

  const removeField = (id: string) => {
    const newFields = fields.filter((f) => f.id !== id).map((field, index) => ({
      ...field,
      displayOrder: index,
    }))
    setFields(newFields)
    onFieldsChange?.(newFields)
  }

  const updateField = (id: string, updates: Partial<CustomField>) => {
    const newFields = fields.map((field) =>
      field.id === id ? { ...field, ...updates } : field
    )
    setFields(newFields)
    onFieldsChange?.(newFields)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Custom Fields</CardTitle>
          <Button onClick={addField} size="sm" type="button">
            <Plus className="mr-2 h-4 w-4" />
            Add Field
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {fields.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No custom fields yet. Click "Add Field" to create one.</p>
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-4">
                {fields.map((field) => (
                  <SortableFieldItem
                    key={field.id}
                    field={field}
                    isEditing={editingField === field.id}
                    onEdit={() => setEditingField(field.id)}
                    onSave={() => setEditingField(null)}
                    onRemove={() => removeField(field.id)}
                    onUpdate={(updates) => updateField(field.id, updates)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </CardContent>
    </Card>
  )
}

function SortableFieldItem({
  field,
  isEditing,
  onEdit,
  onSave,
  onRemove,
  onUpdate,
}: {
  field: CustomField
  isEditing: boolean
  onEdit: () => void
  onSave: () => void
  onRemove: () => void
  onUpdate: (updates: Partial<CustomField>) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: field.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const [localField, setLocalField] = useState(field)

  const handleSave = () => {
    onUpdate(localField)
    onSave()
  }

  const handleCancel = () => {
    setLocalField(field)
    onSave()
  }

  return (
    <div ref={setNodeRef} style={style} className="border rounded-lg p-4 bg-card">
      <div className="flex items-start gap-3">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing mt-1 p-1 hover:bg-muted rounded"
          type="button"
        >
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </button>

        {isEditing ? (
          <div className="flex-1 space-y-4">
            <div className="grid gap-2">
              <Label>Field Label</Label>
              <Input
                value={localField.fieldLabel}
                onChange={(e) => setLocalField({ ...localField, fieldLabel: e.target.value })}
                placeholder="Field Label"
              />
            </div>

            <div className="grid gap-2">
              <Label>Field Key (unique identifier)</Label>
              <Input
                value={localField.fieldKey}
                onChange={(e) => setLocalField({ ...localField, fieldKey: e.target.value.replace(/\s+/g, '_').toLowerCase() })}
                placeholder="field_key"
              />
            </div>

            <div className="grid gap-2">
              <Label>Field Type</Label>
              <Select
                value={localField.fieldType}
                onValueChange={(value) => setLocalField({ ...localField, fieldType: value as FieldType })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FIELD_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {localField.fieldType === 'select' && (
              <div className="grid gap-2">
                <Label>Options (comma-separated)</Label>
                <Input
                  value={localField.fieldOptions?.options?.join(', ') || ''}
                  onChange={(e) =>
                    setLocalField({
                      ...localField,
                      fieldOptions: {
                        ...localField.fieldOptions,
                        options: e.target.value.split(',').map((opt) => opt.trim()).filter(Boolean),
                      },
                    })
                  }
                  placeholder="Option 1, Option 2, Option 3"
                />
              </div>
            )}

            {localField.fieldType === 'textarea' && (
              <div className="grid gap-2">
                <Label>Rows</Label>
                <Input
                  type="number"
                  value={localField.fieldOptions?.rows || 4}
                  onChange={(e) =>
                    setLocalField({
                      ...localField,
                      fieldOptions: {
                        ...localField.fieldOptions,
                        rows: Number(e.target.value),
                      },
                    })
                  }
                  min="1"
                  max="20"
                />
              </div>
            )}

            {(localField.fieldType === 'number' || localField.fieldType === 'text') && (
              <div className="grid gap-2">
                <Label>Placeholder</Label>
                <Input
                  value={localField.fieldOptions?.placeholder || ''}
                  onChange={(e) =>
                    setLocalField({
                      ...localField,
                      fieldOptions: {
                        ...localField.fieldOptions,
                        placeholder: e.target.value,
                      },
                    })
                  }
                  placeholder="Enter placeholder text"
                />
              </div>
            )}

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={`required-${field.id}`}
                  checked={localField.isRequired}
                  onChange={(e) => setLocalField({ ...localField, isRequired: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor={`required-${field.id}`} className="cursor-pointer">
                  Required
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={`visible-${field.id}`}
                  checked={localField.isVisible}
                  onChange={(e) => setLocalField({ ...localField, isVisible: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor={`visible-${field.id}`} className="cursor-pointer">
                  Visible
                </Label>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSave} size="sm" type="button">
                Save
              </Button>
              <Button onClick={handleCancel} size="sm" variant="outline" type="button">
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <p className="font-medium">{field.fieldLabel}</p>
                {field.isRequired && (
                  <span className="text-xs text-destructive">*</span>
                )}
                {!field.isVisible && (
                  <span className="text-xs text-muted-foreground">(hidden)</span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Type: {FIELD_TYPES.find((t) => t.value === field.fieldType)?.label || field.fieldType}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Key: {field.fieldKey}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={onEdit} type="button">
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={onRemove} type="button">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
