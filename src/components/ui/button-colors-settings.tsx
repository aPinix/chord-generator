import { RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ButtonColorsSettingsProps {
  label: string;
  labelWidth?: string;
  backgroundColor: string;
  diagramColor: string;
  onBackgroundColorChange: (color: string) => void;
  onDiagramColorChange: (color: string) => void;
  onResetColors: () => void;
  className?: string;
}

export function ButtonColorsSettings({
  label,
  labelWidth = 'w-12',
  backgroundColor,
  diagramColor,
  onBackgroundColorChange,
  onDiagramColorChange,
  onResetColors,
  className,
}: ButtonColorsSettingsProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 text-muted-foreground text-xs',
        className
      )}
    >
      <span className={cn('shrink-0', labelWidth)}>{label}</span>

      <div className="flex flex-1 items-center gap-1">
        {/* Background Color */}
        <div className="flex items-center gap-1">
          <span className="text-xs opacity-70">BG</span>
          <div className="relative">
            <input
              className="absolute h-6 w-6 cursor-pointer opacity-0"
              onChange={(e) => onBackgroundColorChange(e.target.value)}
              title="Background color"
              type="color"
              value={backgroundColor}
            />
            <button
              className="h-6 w-6 cursor-pointer appearance-none rounded-full border-2 border-border transition-colors hover:border-primary"
              onClick={(e) => {
                const input = e.currentTarget.parentElement?.querySelector(
                  'input'
                ) as HTMLInputElement;
                input?.click();
              }}
              style={{ backgroundColor }}
              type="button"
            />
          </div>
        </div>

        {/* Diagram Color */}
        <div className="flex items-center gap-1">
          <span className="text-xs opacity-70">Lines</span>
          <div className="relative">
            <input
              className="absolute h-6 w-6 cursor-pointer opacity-0"
              onChange={(e) => onDiagramColorChange(e.target.value)}
              title="Diagram color"
              type="color"
              value={diagramColor}
            />
            <button
              className="h-6 w-6 cursor-pointer appearance-none rounded-full border-2 border-border transition-colors hover:border-primary"
              onClick={(e) => {
                const input = e.currentTarget.parentElement?.querySelector(
                  'input'
                ) as HTMLInputElement;
                input?.click();
              }}
              style={{ backgroundColor: diagramColor }}
              type="button"
            />
          </div>
        </div>

        {/* Reset Button */}
        <button
          className="ml-auto cursor-pointer rounded-full bg-muted p-1 text-xs transition-colors hover:bg-muted-foreground/10"
          onClick={onResetColors}
          title="Reset colors to defaults"
          type="button"
        >
          <RotateCcw className="h-2.5 w-2.5" />
        </button>
      </div>
    </div>
  );
}
