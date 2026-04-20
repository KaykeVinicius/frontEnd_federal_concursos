"use client"

import { AlertTriangle, Loader2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface ConfirmDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description: string
  onConfirm: () => Promise<void> | void
  loading?: boolean
  error?: string | null
}

export function ConfirmDeleteDialog({
  open,
  onOpenChange,
  title = "Confirmar exclusão",
  description,
  onConfirm,
  loading = false,
  error = null,
}: ConfirmDeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={loading ? undefined : onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <DialogTitle className="text-foreground">{title}</DialogTitle>
          </div>
          <DialogDescription className="text-sm text-muted-foreground pl-13">
            {description}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={loading}
            className="flex-1"
          >
            {loading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Excluindo...</>
            ) : (
              <><Trash2 className="mr-2 h-4 w-4" />Sim, excluir</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
