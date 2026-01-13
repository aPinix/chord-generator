// Helper to highlight matching text in search results
export function highlightMatch(text: string, query: string) {
  if (!query.trim()) return text;
  const regex = new RegExp(
    `(${query.replace(/[.*+?^${}()|[\]]/g, '\\$&')})`,
    'gi'
  );
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? (
      // biome-ignore lint/suspicious/noArrayIndexKey: Array index is safe as this is a static mapping with unique positions
      <mark className="rounded bg-primary/30 px-0.5 text-primary" key={i}>
        {part}
      </mark>
    ) : (
      part
    )
  );
}
