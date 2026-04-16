import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useState } from 'react';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  destructive?: boolean;
  requireReason?: boolean;
  reasonLabel?: string;
  onConfirm: (reason?: string) => void;
}

export function ConfirmDialog({
  open, onOpenChange, title, description, confirmLabel = 'Confirm',
  destructive = false, requireReason = false, reasonLabel = 'Reason',
  onConfirm,
}: ConfirmDialogProps) {
  const [reason, setReason] = useState('');

  const handleConfirm = () => {
    onConfirm(requireReason ? reason : undefined);
    setReason('');
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        {requireReason && (
          <div className="space-y-2 py-2">
            <Label>{reasonLabel}</Label>
            <Textarea value={reason} onChange={e => setReason(e.target.value)} placeholder={`Enter ${reasonLabel.toLowerCase()}...`} />
          </div>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => { setReason(''); }}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={requireReason && !reason.trim()}
            className={destructive ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
