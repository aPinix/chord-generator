import { APP_NAME } from '@/config/variables.config';
import { AndImage } from '../and/and-image';
import { ThemeModeSelector } from '../theme/theme-mode-selector';

export const Header = () => {
  return (
    <header
    // className="sticky top-0 z-50 border-border/40 border-b bg-background/80 backdrop-blur-sm"
    >
      <div className="container mx-auto flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <AndImage
            alt={APP_NAME}
            className="size-10 object-contain"
            src="/images/app/chord-generator-logo.svg"
          />
          <span className="font-semibold text-lg">{APP_NAME}</span>
        </div>
        <ThemeModeSelector />
      </div>
    </header>
  );
};
