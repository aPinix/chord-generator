import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import { cn } from '@/lib/utils';

interface ButtonGroupSettingsProps {
  label: string;
  labelWidth?: string;
  children: React.ReactNode;
  className?: string;
}

export function ButtonGroupSettings({
  label,
  labelWidth = 'w-12',
  children,
  className,
}: ButtonGroupSettingsProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 text-muted-foreground text-xs',
        className
      )}
    >
      <span className={cn('shrink-0', labelWidth)}>{label}</span>
      <ButtonGroup className="flex flex-1 overflow-hidden rounded-full bg-muted">
        {children}
      </ButtonGroup>
    </div>
  );
}

interface ButtonGroupSettingsItemProps {
  isActive?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export function ButtonGroupSettingsItem({
  isActive = false,
  children,
  onClick,
  className,
}: ButtonGroupSettingsItemProps) {
  return (
    <Button
      className={cn(
        'flex flex-1 items-center justify-center gap-1 px-2 py-1.5',
        className
      )}
      onClick={onClick}
      size="xs"
      type="button"
      variant={isActive ? 'default' : 'baseAlt'}
    >
      {children}
    </Button>
  );
}
