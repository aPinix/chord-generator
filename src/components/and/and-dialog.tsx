'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';

interface AndDialogProps {
  title?: string;
  description?: string;
  trigger?: React.ReactNode;
  render?:
    | React.ReactElement<any, string | React.JSXElementConstructor<any>>
    | ((props: any) => React.ReactElement);
  className?: string;
  classNameTitle?: string;
  classNameDescription?: string;
  classNameHeader?: string;
  children: React.ReactNode;
  onToggle?: (open: boolean) => void;
}

export const AndDialog = ({
  title,
  description,
  trigger,
  render,
  className,
  classNameTitle,
  classNameDescription,
  classNameHeader,
  children,
  onToggle,
}: AndDialogProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <Dialog
      onOpenChange={(open) => {
        setDialogOpen(open);
        onToggle?.(open);
      }}
      open={dialogOpen}
    >
      <DialogTrigger render={render}>{trigger}</DialogTrigger>
      <DialogContent
        className={cn(
          'max-h-[calc(100dvh-4rem)]! w-screen! max-w-[calc(100vw-4rem)]! gap-0 overflow-hidden p-0',
          className
        )}
      >
        <DialogHeader
          className={cn('border-border border-b px-6 py-6', classNameHeader)}
        >
          {title && (
            <DialogTitle className={cn('text-2xl', classNameTitle)}>
              {title}
            </DialogTitle>
          )}
          {description && (
            <DialogDescription
              className={cn('text-muted-foreground', classNameDescription)}
            >
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        {children}
      </DialogContent>
    </Dialog>
  );
};
