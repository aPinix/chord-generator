import type React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { stringGetInitials } from '@/lib/string';
import { cn } from '@/lib/utils';

interface AndUserAvatarPropsI {
  src?: string;
  alt?: string;
  fallback?: string;
  title?: string;
  description?: string;
  size?: 'sm' | 'default' | 'lg';
  className?: string;
  classNameAvatar?: string;
  classNameTitle?: string;
  classNameDescription?: string;
}

export const AndUserAvatar: React.FC<AndUserAvatarPropsI> = ({
  src,
  alt,
  fallback,
  title,
  description,
  size = 'sm',
  className,
  classNameAvatar,
  classNameTitle,
  classNameDescription,
}) => {
  const initials = fallback ?? (title ? stringGetInitials(title) : '?');

  return (
    <div className={cn('flex items-center gap-2.5 text-left', className)}>
      <Avatar className={classNameAvatar} size={size}>
        <AvatarImage alt={alt ?? title ?? 'Avatar'} src={src} />
        <AvatarFallback>
          <span className="font-medium uppercase">{initials}</span>
        </AvatarFallback>
      </Avatar>

      {(title || description) && (
        <div className="grid flex-1 gap-0.5 text-left leading-tight">
          {title && (
            <span
              className={cn(
                'truncate font-medium text-foreground text-sm',
                classNameTitle
              )}
            >
              {title}
            </span>
          )}
          {description && (
            <span
              className={cn(
                'truncate text-muted-foreground text-xs',
                classNameDescription
              )}
            >
              {description}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
