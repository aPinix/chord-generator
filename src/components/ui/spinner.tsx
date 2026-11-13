import { LoaderCircleIcon, type LucideProps } from 'lucide-react';
import { cn } from '@/lib/utils';

function Spinner({ className, ...props }: LucideProps) {
  return (
    <LoaderCircleIcon
      aria-label="Loading"
      className={cn('size-4 animate-spin', className)}
      role="status"
      {...props}
    />
  );
}

export { Spinner };
