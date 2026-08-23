/**
 * How a toggled follow-up chip edits the composer.
 *
 * Lines, not a replacement. The agent offers up to three suggestions and a
 * user often wants two of them in one turn, so each pressed chip contributes
 * one line and nothing already in the field is touched: whatever was typed
 * stays, and releasing a chip removes only the line it added — the first exact
 * match, so a suggestion the user retyped by hand is left alone.
 */
export function toggleFollowUpLine(
  value: string,
  text: string,
  on: boolean
): string {
  const lines = value === "" ? [] : value.split("\n");
  if (on) {
    lines.push(text);
  } else {
    const at = lines.indexOf(text);
    if (at !== -1) {
      lines.splice(at, 1);
    }
  }
  return lines.join("\n");
}
