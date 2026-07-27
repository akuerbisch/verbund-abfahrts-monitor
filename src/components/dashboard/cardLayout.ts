// Cards are capped to the available viewport height so a long list scrolls
// internally instead of pushing the page taller than the screen — this is a
// wall-mounted dashboard, not a page you scroll.
// Accounts for: AppHeader's h-16 (4rem) + DashboardShell main's py-8 (2rem
// top + 2rem bottom = 4rem) + a card's own bottom margin in the masonry
// layout, mb-4 (1rem). Keep in sync with those if they change.
export const CARD_MAX_HEIGHT_CLASS = "max-h-[calc(100vh-9rem)]";
