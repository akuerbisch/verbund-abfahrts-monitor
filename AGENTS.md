<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Live deployment — avoid breaking changes to persisted state

This app is running as a real, unattended dashboard (office display), not just a repo in progress. All card configuration (stop/project selections, sort orders, filters, etc.) lives in the browser's `localStorage` under `CARDS_KEY` (`src/lib/storage/storageKeys.ts`), shaped by `CardConfig` in `src/types/domain.ts` and validated by the runtime type guards in `src/lib/storage/cards.ts` (`isDepartureCardConfig`, `isGitlabCardConfig`, `isJiraCardConfig`, `isCardConfig`).

Those guards are strict: a stored card that doesn't match the expected shape exactly is silently dropped by `loadCards()`. There is no server-side database to fix after the fact — whatever is in that one browser's `localStorage` is the only copy of that dashboard's setup.

Because of this:
- **Avoid breaking changes to the `CardConfig` shapes** (renaming/removing/retyping existing fields on `DepartureCardConfig`, `GitlabMergeRequestsCardConfig`, `JiraVersionsCardConfig`) whenever a purely additive change (new optional-with-default field, new card type) will do instead.
- **If a breaking change to stored data is unavoidable**, it needs an explicit migration: either make the type guard/`loadCards()` accept both the old and new shape and upgrade old entries in place before persisting, or bump `CARDS_KEY` to a new versioned key and migrate/copy forward from the old key. Never ship a schema change that would cause existing saved cards to be silently filtered out and disappear from the dashboard.
- The same caution applies to env var names/semantics the deployed instance already relies on (`GITLAB_ACCESS_TOKEN`, `GITLAB_BASE_URL`, `JIRA_TOKEN`, `JIRA_EMAIL`, `JIRA_BASE_URL`, `VAO_AID`) — renaming one without updating the deployment leaves that card silently broken on the live dashboard.
