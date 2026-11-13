'use client';

import { useEffect, useState } from 'react';
import { buildFeedbackUrl } from '@/config/variables.config';
import { describeDevice } from '@/lib/device';

type FeedbackLinkProps = Omit<React.ComponentProps<'a'>, 'href'>;

/**
 * Opens a feedback email with the visitor's device and browser filled in.
 * The server renders the draft without them; the browser adds them on mount.
 */
export function FeedbackLink(props: FeedbackLinkProps) {
  const [href, setHref] = useState(() => buildFeedbackUrl());

  useEffect(() => {
    setHref(buildFeedbackUrl(describeDevice()));
  }, []);

  return <a href={href} {...props} />;
}
