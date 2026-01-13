import { cn } from '@/lib/utils';
import { StepNumber } from './number-count';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';

interface CardBentoProps {
  step?: string;
  children: React.ReactNode;
  title?: string | React.ReactNode;
  titleSuffix?: React.ReactNode;
  description?: string | React.ReactNode;
  className?: string;
  classNameTitle?: string;
  classNameDescription?: string;
  classNameContent?: string;
}

export const CardBento = ({
  step,
  children,
  title,
  titleSuffix,
  description,
  className,
  classNameTitle,
  classNameDescription,
  classNameContent,
}: CardBentoProps) => {
  return (
    <Card
      className={cn(
        'gap-0 rounded-3xl border-0 bg-muted/50 shadow-none ring-0 dark:bg-zinc-900/80 dark:ring-1 dark:ring-white/10',
        className
      )}
    >
      <CardHeader>
        {step && (
          <CardTitle className={cn('flex items-center gap-3', classNameTitle)}>
            {step && <StepNumber>{step}</StepNumber>}
            {title && <div className="flex flex-1 items-center">{title}</div>}
            {titleSuffix && (
              <div className="ml-auto flex items-center gap-1.5">
                {titleSuffix}
              </div>
            )}
          </CardTitle>
        )}
        {description && (
          <CardDescription className={classNameDescription}>
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className={cn('flex flex-col p-4', classNameContent)}>
        {children}
      </CardContent>
    </Card>
  );
};
