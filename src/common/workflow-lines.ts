/**
 * A `run:` block with its shell comments removed.
 *
 * Exists because a script's only appearance in a workflow can be inside a comment, and a substring
 * match cannot tell a command from a mention — so `# ./scripts/x.sh disabled` would satisfy the
 * very checks written to catch that. Only executable lines count. Shared by the workflow-gate
 * specs (ci-privilege-gate, release-gate-parity); lives outside a .spec so importing it does not
 * drag another spec's describe blocks into the importing suite's run.
 */
export function executableLines(run: string): string {
  return run
    .split('\n')
    .map(line => {
      const hash = line.indexOf('#');
      if (hash === -1) return line;
      // A '#' inside quotes is data, not a comment — keep the line whole rather than truncating it.
      const before = line.slice(0, hash);
      const quotes = (before.match(/["']/g) ?? []).length;
      return quotes % 2 === 1 ? line : before;
    })
    .join('\n');
}
