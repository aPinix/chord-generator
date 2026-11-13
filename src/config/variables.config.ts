// app --------------------

// the name of the app
export const APP_NAME: string = 'G-Chord';
export const APP_DESCRIPTION: string =
  'Design custom guitar chords and download them as images.';

// the favicon of the app
export const APP_FAVICON_LIGHT: string = '/images/app/chord-generator-logo.svg';
export const APP_FAVICON_DARK: string = '/images/app/chord-generator-logo.svg';

// the social media preview image
export const APP_SOCIAL_IMAGE: string = '/images/app/g-chord-social.jpg';
export const APP_URL: string = 'https://g-chord.vercel.app';

// the source code, with bug and feature issue forms
export const APP_REPO_URL: string = 'https://github.com/aPinix/chord-generator';

// feedback arrives by email
export const APP_FEEDBACK_EMAIL: string = 'a.pinix@gmail.com';

// Every feedback email starts with this tag, so a mail filter on
// subject:"[G-Chord]" catches them all
export const APP_FEEDBACK_SUBJECT: string = '[G-Chord] Feedback';

/**
 * The email draft: a bug half and a feature half, each with examples so
 * people know what to write. `deviceAndBrowser` fills in that line when the
 * page knows it (see `describeDevice`).
 */
export function buildFeedbackBody(deviceAndBrowser = ''): string {
  return [
    'Hi,',
    '',
    'BUG',
    'What happened: (e.g. "Strum plays no sound after I pick a chord")',
    'What I expected: (e.g. "To hear the chord with the nylon guitar")',
    `Device and browser: ${deviceAndBrowser || '(e.g. "iPhone, Safari 26")'}`,
    '',
    'FEATURE REQUEST',
    'What I\'d like: (e.g. "Download all my saved chords as one image")',
    'Why it would help: (e.g. "To print one chord sheet per song")',
    '',
  ].join('\n');
}

/** Opens the visitor's email app with a draft already filled in. */
export function buildFeedbackUrl(deviceAndBrowser = ''): string {
  return `mailto:${APP_FEEDBACK_EMAIL}?subject=${encodeURIComponent(
    APP_FEEDBACK_SUBJECT
  )}&body=${encodeURIComponent(buildFeedbackBody(deviceAndBrowser))}`;
}
