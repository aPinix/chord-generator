/**
 * A short, human description of the visitor's device and browser, such as
 * "iPhone, Safari 26" or "Mac, Chrome 141". Browser only: call it after mount.
 */
export function describeDevice(): string {
  const ua = navigator.userAgent;

  // iPads ask for desktop sites and report themselves as Macs, but have touch
  const isIPad =
    /iPad/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  const device = isIPad
    ? 'iPad'
    : /iPhone|iPod/.test(ua)
      ? 'iPhone'
      : /Android/.test(ua)
        ? /Mobile/.test(ua)
          ? 'Android phone'
          : 'Android tablet'
        : /Macintosh|Mac OS X/.test(ua)
          ? 'Mac'
          : /Windows/.test(ua)
            ? 'Windows PC'
            : /CrOS/.test(ua)
              ? 'Chromebook'
              : /Linux/.test(ua)
                ? 'Linux'
                : 'Unknown device';

  // Order matters: most browsers also claim to be Chrome and Safari
  const browsers: [name: string, pattern: RegExp][] = [
    ['Edge', /Edg(?:A|iOS)?\/(\d+)/],
    ['Opera', /(?:OPR|OPT)\/(\d+)/],
    ['Samsung Internet', /SamsungBrowser\/(\d+)/],
    ['Firefox', /(?:Firefox|FxiOS)\/(\d+)/],
    ['Chrome', /(?:Chrome|CriOS)\/(\d+)/],
    ['Safari', /Version\/(\d+)[\d.]* (?:Mobile\/\S+ )?Safari/],
  ];
  let browser = 'Unknown browser';
  for (const [name, pattern] of browsers) {
    const match = pattern.exec(ua);
    if (match) {
      browser = `${name} ${match[1]}`;
      break;
    }
  }

  // Brave looks exactly like Chrome, but says so through its own API
  if (
    browser.startsWith('Chrome') &&
    'brave' in navigator &&
    navigator.brave !== undefined
  ) {
    browser = browser.replace('Chrome', 'Brave');
  }

  return `${device}, ${browser}`;
}
