import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

interface AndTooltipProps {
  side?: 'top' | 'right' | 'bottom' | 'left';
  trigger: React.ReactNode;
  render?:
    | React.ReactElement<any, string | React.JSXElementConstructor<any>>
    | ((props: any) => React.ReactElement);
  children: React.ReactNode;
}

export const AndTooltip = ({
  side = 'top',
  trigger,
  render,
  children,
}: AndTooltipProps) => {
  return (
    <Tooltip>
      <TooltipTrigger render={render}>{trigger}</TooltipTrigger>
      <TooltipContent side={side}>{children}</TooltipContent>
    </Tooltip>
  );
};
