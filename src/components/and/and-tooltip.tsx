import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

interface AndTooltipProps {
  side?: 'top' | 'right' | 'bottom' | 'left';
  trigger: React.ReactNode;
  children: React.ReactNode;
}

export const AndTooltip = ({
  side = 'top',
  trigger,
  children,
}: AndTooltipProps) => {
  return (
    <Tooltip>
      <TooltipTrigger>{trigger}</TooltipTrigger>
      <TooltipContent side={side}>{children}</TooltipContent>
    </Tooltip>
  );
};
