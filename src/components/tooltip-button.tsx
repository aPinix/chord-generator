import { AndButton } from './and/and-button';
import { AndTooltip } from './and/and-tooltip';

interface TooltipButtonProps {
  children: React.ReactNode;
  tooltipText?: string;
  disabled?: boolean;
  onClick?: () => void;
}

export const TooltipButton = ({
  children,
  tooltipText,
  disabled,
  onClick,
}: TooltipButtonProps) => {
  const Button = () => {
    return (
      <AndButton
        disabled={disabled}
        onClick={onClick}
        size="iconXs"
        variant="basic"
      >
        {children}
        {tooltipText && <span className="sr-only">{tooltipText}</span>}
      </AndButton>
    );
  };

  return (
    <>
      {!disabled ? (
        <AndTooltip render={<Button />} trigger={<Button />}>
          {tooltipText}
        </AndTooltip>
      ) : (
        <Button />
      )}
    </>
  );
};
