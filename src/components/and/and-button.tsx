import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { skeletonClass } from '@/components/and/and-skeleton';
import { cn } from '@/lib/utils';
import { Spinner } from '../ui/spinner';

const buttonVariants = cva(
  cn(
    "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium text-sm outline-none transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
    'active:scale-97'
  ),
  {
    variants: {
      variant: {
        primary: cn(
          'bg-primary text-white hover:bg-[hsl(from_var(--color-primary)_h_s_calc(l-5))]',
          'disabled:bg-gray-400 disabled:text-gray-50'
        ),
        secondary: cn(
          'bg-lime-600 text-white hover:bg-lime-700',
          'disabled:bg-gray-400 disabled:text-gray-50'
        ),
        basic: cn(
          'bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700',
          'disabled:bg-gray-400 disabled:text-gray-50'
        ),
        outline: cn(
          'border border-gray-200 bg-background hover:bg-[hsl(from_var(--uni-button-accent)_h_s_calc(l-7))] active:bg-[hsl(from_var(--uni-button-accent)_h_s_calc(l-14))]',
          'disabled:border-gray-400 disabled:text-gray-50'
        ),
        ghost: cn(
          'text-foreground hover:bg-[hsl(from_var(--color-accent)_h_s_calc(l-7))] hover:bg-accent active:bg-[hsl(from_var(--color-accent)_h_s_calc(l-14))]',
          'disabled:text-gray-50'
        ),
        tab: cn(
          'rounded-b-none border-foreground border-b-2 hover:bg-[hsl(from_var(--color-accent)_h_s_calc(l-7))] hover:text-foreground active:bg-[hsl(from_var(--color-accent)_h_s_calc(l-14))]',
          'disabled:text-gray-50'
        ),
        link: cn(
          'h-auto rounded-none p-0 text-brand-1 underline underline-offset-4 hover:text-[hsl(from_var(--color-brand-1)_h_s_calc(l-7))] active:text-[hsl(from_var(--color-brand-1)_h_s_calc(l-14))]',
          'disabled:text-gray-50'
        ),
      },
      size: {
        sm: 'h-9 px-3',
        md: 'h-10 px-4',
        lg: 'h-11 px-8',
        iconSm: 'h-9 w-9 p-0',
        iconMd: 'h-10 w-10 p-0',
        iconLg: 'h-11 w-11 p-0',
      },
      shape: {
        circle: 'rounded-full',
        roundedSm: 'rounded-sm',
        rounded: 'rounded-md',
        roundedLg: 'rounded-lg',
        square: 'rounded-none',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      shape: 'rounded',
    },
  }
);

export interface AndButtonProps
  extends React.ComponentProps<'button'>,
    VariantProps<typeof buttonVariants> {
  color?: string;
  skeleton?: boolean;
  loading?: boolean;
  asChild?: boolean;
  ref?: React.Ref<HTMLButtonElement>;
}

export const AndButton = ({
  variant,
  size,
  shape,
  className,
  skeleton = false,
  loading = false,
  asChild = false,
  ref,
  ...props
}: AndButtonProps) => {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      ref={ref}
      {...props}
      className={cn(
        'relative',
        buttonVariants({ variant, size, shape }),
        loading && 'pointer-events-none',
        className,
        skeletonClass(skeleton)
      )}
      data-slot="button"
      type={props.type || 'button'}
    >
      {props.children}

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center rounded-[inherit] bg-inherit">
          <Spinner />
        </div>
      )}
    </Comp>
  );
};
