<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep the seven-day sleep log in the shared Somna parent state and calculate metrics through `src/lib/sleep-log.ts` so floor navigation cannot reset or diverge the log.
- Keep Floor 2 presentation in `src/components/lifestyle-floor.tsx` and lifestyle values in the shared Somna provider using `src/lib/lifestyle-log.ts`; every floor can read the same values without resetting them on navigation, and Care Summary presentation stays independently scoped.
- Keep Floor 1 local-calendar arithmetic and date-keyed read-only sample history in `src/lib/sleep-weeks.ts`; rolling seven-day windows end Today and the Today editor writes to the shared final-night entry so Week/Day navigation agrees without altering Floor 4 or resetting current data. Read the device clock after hydration and refresh on focus and calendar rollover to avoid server-time mismatches.
- Keep Floor 3 note parsing, timestamps, and sample history in `src/lib/journal-log.ts`; parsing is clause-based and omits unmentioned or skipped meals rather than showing empty categories. Read the clock after hydration, like Floor 1.
- Keep journal history in shared Somna state and Care Summary presentation/calculations in `src/components/care-summary-floor.tsx` and `src/lib/care-summary.ts`; this preserves saved notes across navigation and separates live single-night data from labeled aggregate sample profiles.
