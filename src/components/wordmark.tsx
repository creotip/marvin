// "Open" in the default foreground color, "Decode" in the brand accent —
// the color split emphasizes the differentiating half of the name, not
// the generic "Open" prefix. Kept separate from `appName` (plain text),
// which metadata, OG images, and JSON-LD schemas still use as-is.
export function Wordmark() {
  return (
    <span>
      Open<span className="text-fd-primary">Decode</span>
    </span>
  );
}
