import { GithubIcon, Linkedin01Icon, NewTwitterIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import Link from 'next/link';
import { APP_NAME } from '@/config/variables.config';

const socialLinks = [
  {
    name: 'Twitter',
    href: 'https://twitter.com/aPinix',
    icon: NewTwitterIcon,
  },
  {
    name: 'GitHub',
    href: 'https://github.com/aPinix',
    icon: GithubIcon,
  },
  {
    name: 'LinkedIn',
    href: 'https://linkedin.com/in/pinix',
    icon: Linkedin01Icon,
  },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-background">
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex flex-col items-center gap-2 sm:items-start">
            <p className="text-muted-foreground text-sm">
              © {currentYear} {APP_NAME}. Built by{' '}
              <Link
                className="text-foreground font-medium underline-offset-4 transition-colors hover:underline"
                href="https://github.com/aPinix"
                rel="noopener noreferrer"
                target="_blank"
              >
                aPinix
              </Link>
            </p>
          </div>

          <div className="flex items-center gap-4">
            {socialLinks.map((link) => (
              <Link
                aria-label={link.name}
                className="text-muted-foreground hover:text-foreground transition-colors"
                href={link.href}
                key={link.name}
                rel="noopener noreferrer"
                target="_blank"
              >
                <HugeiconsIcon className="size-5" icon={link.icon} />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
