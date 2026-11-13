import { GlobeIcon } from 'lucide-react';
import Link from 'next/link';
import { APP_NAME } from '@/config/variables.config';
import { GitHubLogo, LinkedInLogo, XLogo } from '../brand-icons';
import { FeedbackLink } from './feedback-link';

// Brand marks are the real solid logos; the website keeps a plain globe
const socialLinks = [
  {
    name: 'Website',
    href: 'https://apinix.com/',
    icon: <GlobeIcon className="size-5" />,
  },
  {
    name: 'X',
    href: 'https://x.com/aPinix',
    icon: <XLogo className="size-4" />,
  },
  {
    name: 'GitHub',
    href: 'https://github.com/aPinix',
    icon: <GitHubLogo className="size-[1.125rem]" />,
  },
  {
    name: 'LinkedIn',
    href: 'https://linkedin.com/in/pinix',
    icon: <LinkedInLogo className="size-4" />,
  },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row sm:px-6 lg:px-8">
        <p className="text-sm text-muted-foreground">
          © {currentYear} {APP_NAME}. Built by{' '}
          <Link
            className="font-medium text-foreground underline-offset-4 transition-colors hover:underline"
            href="https://github.com/aPinix"
            rel="noopener noreferrer"
            target="_blank"
          >
            aPinix
          </Link>
          .{' '}
          <FeedbackLink className="font-medium text-foreground underline-offset-4 transition-colors hover:underline">
            Send feedback
          </FeedbackLink>
        </p>

        <div className="flex items-center gap-1">
          {socialLinks.map((link) => (
            <Link
              aria-label={link.name}
              className="flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground pointer-coarse:size-11"
              href={link.href}
              key={link.name}
              rel="noopener noreferrer"
              target="_blank"
            >
              {link.icon}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
