import { cn } from '@/lib/utils';

interface PickIconProps extends React.ComponentProps<'svg'> {
  /** Draw the highlight and shading used for the Zen mode cursor */
  shaded?: boolean;
}

/** A plectrum, tip down. The tip sits at the bottom centre of the box. */
export function PickIcon({
  shaded = false,
  className,
  ...props
}: PickIconProps) {
  return (
    <svg
      aria-hidden="true"
      className={cn('shrink-0', className)}
      fill="currentColor"
      viewBox="0 0 40 46"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M20 45.5C14.5 45.5 1.5 23 1.5 13C1.5 5 8.5 0.5 20 0.5C31.5 0.5 38.5 5 38.5 13C38.5 23 25.5 45.5 20 45.5Z" />
      {shaded && (
        <>
          <path
            d="M20 45.5C14.5 45.5 1.5 23 1.5 13C1.5 5 8.5 0.5 20 0.5C31.5 0.5 38.5 5 38.5 13C38.5 23 25.5 45.5 20 45.5Z"
            fill="url(#pick-shade)"
          />
          <ellipse
            cx="14"
            cy="10"
            fill="white"
            opacity="0.35"
            rx="7"
            ry="4"
            transform="rotate(-18 14 10)"
          />
          <defs>
            <linearGradient id="pick-shade" x1="8" x2="30" y1="2" y2="44">
              <stop offset="0" stopColor="white" stopOpacity="0.18" />
              <stop offset="1" stopColor="black" stopOpacity="0.28" />
            </linearGradient>
          </defs>
        </>
      )}
    </svg>
  );
}
