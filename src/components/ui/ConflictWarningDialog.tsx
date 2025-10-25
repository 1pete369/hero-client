"use client"

import { AlertTriangle, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { TimeConflict, formatConflictMessage } from "@/utils/timeConflict"

interface ConflictWarningDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  conflicts: TimeConflict[]
  newTodoTitle: string
  newTimeSlot: string
}

export default function ConflictWarningDialog({
  isOpen,
  onClose,
  onConfirm,
  conflicts,
  newTodoTitle,
  newTimeSlot,
}: ConflictWarningDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border-solid border-3 border-black rounded shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-amber-600 text-lg font-semibold">
            <AlertTriangle className="h-5 w-5" />
            Time Conflict Detected
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="p-3 bg-amber-50 border-3 border-black rounded">
            <p className="text-sm text-amber-800">
              <strong>&quot;{newTodoTitle}&quot;</strong> at <strong>{newTimeSlot}</strong> has scheduling conflicts:
            </p>
          </div>
          <div className="space-y-2 max-h-56 overflow-y-auto scrollbar-hide">
            {conflicts.map((conflict, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 border-3 border-black rounded">
                <div className="flex-shrink-0 mt-0.5">
                  <Clock className="h-4 w-4 text-gray-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">{formatConflictMessage(conflict)}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className={`text-xs border-3 ${
                      conflict.conflictType === 'overlap' || conflict.conflictType === 'contains'
                        ? 'bg-red-100 text-red-700 border-black'
                        : 'bg-yellow-100 text-yellow-700 border-black'
                    }`}>
                      {conflict.conflictType === 'overlap' && 'Overlap'}
                      {conflict.conflictType === 'adjacent' && 'Adjacent'}
                      {conflict.conflictType === 'contains' && 'Contains'}
                      {!conflict.conflictType && 'Conflict'}
                    </Badge>
                    <Badge variant="outline" className="text-xs border-3 border-black">
                      {conflict.todo.priority}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 bg-blue-50 border-3 border-black rounded">
            <p className="text-sm text-blue-800">
              <strong>Options:</strong>
            </p>
            <ul className="text-sm text-blue-700 mt-1 space-y-1">
              <li>• Adjust the time to avoid conflicts</li>
              <li>• Proceed anyway if this is intentional</li>
              <li>• Cancel and reschedule</li>
            </ul>
          </div>
        </div>
        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={onClose} className="flex-1 border-3 border-black rounded shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0_0_rgba(0,0,0,1)]">Cancel</Button>
          <Button variant="destructive" onClick={onConfirm} className="flex-1 border-3 border-black rounded shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0_0_rgba(0,0,0,1)]">Proceed Anyway</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}


