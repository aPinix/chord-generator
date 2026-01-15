import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

interface AndTooltipProps {
  side?: 'top' | 'right' | 'bottom' | 'left';
  trigger: React.ReactNode;
  asChild?: boolean;
  children: React.ReactNode;
}

export const AndTooltip = ({
  side = 'top',
  trigger,
  asChild,
  children,
}: AndTooltipProps) => {
  return (
    <Tooltip>
      <TooltipTrigger
        render={asChild ? (trigger as React.ReactElement) : undefined}
      >
        {trigger}
      </TooltipTrigger>
      <TooltipContent side={side}>{children}</TooltipContent>
    </Tooltip>
  );
};
