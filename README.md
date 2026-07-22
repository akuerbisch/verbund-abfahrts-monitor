# Departure Board

A simple dashboard showing live upcoming bus/tram departures for stops you search for
and save, built with Next.js and [Untitled UI React](https://www.untitledui.com/react).

Live departure data comes from Verbundlinie's unofficial VAO/HAFAS StationBoard API
(Graz/Styria, Austria) — proxied through this app's own API routes so the required
client identifier stays server-side.

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in VAO_AID
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), search for a stop (e.g. "Graz
Jakominiplatz"), and add it to your dashboard. Saved stops and your preferred refresh
interval persist in the browser's localStorage — there's no backend database or
accounts.

## Environment variables

- `VAO_AID` — required client identifier for the VAO gate endpoint. Server-side only,
  never exposed to the browser. See `.env.example`.

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — production build
- `npm run test` — run unit tests (vitest)
- `npm run lint` — lint

## Notes

The VAO API is unofficial, undocumented, and can change without notice — the parsing
layer (`src/lib/vao/`) is defensive by design and degrades per-stop rather than
crashing the whole dashboard on a malformed or failed response.
