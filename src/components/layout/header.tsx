import { MessageCircleIcon } from 'lucide-react';
import { APP_NAME, APP_REPO_URL } from '@/config/variables.config';
import { AndImage } from '../and/and-image';
import { GitHubLogo } from '../brand-icons';
import { ThemeModeSelector } from '../theme/theme-mode-selector';
import { FeedbackLink } from './feedback-link';

export const Header = () => {
  return (
    <header className="bg-stage text-stage-foreground">
      <div className="container mx-auto flex items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <AndImage
            alt=""
            className="size-9 object-contain"
            src="/images/app/chord-generator-logo.svg"
          />
          <div className="flex items-baseline gap-3">
            <span className="font-display text-xl font-bold tracking-tight whitespace-nowrap">
              {APP_NAME}
            </span>
            <h1 className="hidden text-sm text-stage-muted sm:block">
              Guitar chord diagram maker
            </h1>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <FeedbackLink
            aria-label="Send feedback by email: report a bug or suggest a feature"
            className="flex h-9 items-center gap-2 rounded-full px-3 text-sm font-medium ring-1 ring-stage-edge transition-colors outline-none hover:bg-stage-raised/60 focus-visible:ring-2 focus-visible:ring-stage-foreground max-sm:w-9 max-sm:justify-center max-sm:px-0 pointer-coarse:h-11 max-sm:pointer-coarse:w-11"
          >
            <MessageCircleIcon className="size-4 shrink-0" />
            <span className="max-sm:hidden">Feedback</span>
          </FeedbackLink>
          <a
            aria-label="G-Chord on GitHub"
            // Narrow phones need the room for the name; the footer still links GitHub
            className="flex size-9 shrink-0 items-center justify-center rounded-full ring-1 ring-stage-edge transition-colors outline-none hover:bg-stage-raised/60 focus-visible:ring-2 focus-visible:ring-stage-foreground max-[26rem]:hidden pointer-coarse:size-11"
            href={APP_REPO_URL}
            rel="noopener noreferrer"
            target="_blank"
            title="G-Chord on GitHub"
          >
            <GitHubLogo className="size-4" />
          </a>
          <ThemeModeSelector />
        </div>
      </div>
    </header>
  );
};
