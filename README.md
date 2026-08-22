# Paddock — Formula 1 PWA

Installable, offline-capable Formula 1 app: race calendar with countdown, both
championships, full season archive back to 1950, and live timing.

Available in English (master), Spanish, French, German and Italian.

## Data sources

| Source | Used for | Cost |
| --- | --- | --- |
| [Jolpica-F1](https://api.jolpi.ca) (Ergast-compatible) | Calendar, results, standings, history | Free, no key |
| [OpenF1](https://openf1.org) | Live timing, tyres, race control | Free tier for history; **€9.90/mo sponsor tier for live** |

### The OpenF1 restriction, and why the app handles it explicitly

OpenF1's free tier blocks **every** request — historical ones included — from 30
minutes before a session until 30 minutes after it ends. It answers with HTTP
200 and a `detail` field rather than an error status, so `src/lib/api/openf1.ts`
inspects the body shape and raises `OpenF1RestrictedError`. The Live screen then
explains the rule instead of showing a generic failure.

To unlock live data, add a sponsor key:

```bash
echo 'VITE_OPENF1_API_KEY=your-key-here' > .env.local
```

Without a key the rest of the app is fully functional — only `/live` degrades.

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build     # → dist/
npm run preview
```

### Deploying to GitHub Pages

Project sites are served from `/<repo>/`, not the domain root, so the build must
be told its base path. Nothing is hard-coded for this: the router reads
`import.meta.env.BASE_URL`, and `vite-plugin-pwa` derives the manifest's
`start_url` and `scope` from Vite's `base`. Build with:

```bash
npm run build -- --base=/<repo-name>/
```

Building without `--base` (the default `/`) produces a bundle that 404s on every
asset when served from a subdirectory.

## Architecture

```
src/
  lib/api/      Jolpica + OpenF1 clients, wire-format types
  lib/          team liveries, country/ISO mapping, Intl formatting
  hooks/        TanStack Query wrappers; live-timing aggregation
  i18n/         i18next setup + locales/{en,es,fr,de,it}.json
  components/   shell, timing tables, shared states
  routes/       one file per screen, lazy-loaded except Home
```

Conventions worth keeping:

- **Every Ergast scalar is a string on the wire**, including positions and
  points. Convert at the edge; never assume a number.
- **All user-facing text goes through `Intl`** with the active locale. Dates,
  times, numbers and relative time differ per language — hard-coding English
  shapes is the usual way multi-language apps leak.
- **Country and nationality arrive in English.** `lib/countries.ts` maps both to
  ISO 3166-1 alpha-2, which buys localisation via `Intl.DisplayNames` and flag
  emoji with no assets.
- **Timing colours follow broadcast convention**: purple = session best,
  green = personal best, yellow = slower.
- Service-worker cache versioning is automatic (`registerType: 'autoUpdate'`,
  content-hash revisions) — there is no manual `APP_VERSION` bump here.

## Known gaps

- **Race names are not translated.** Jolpica returns them in English only
  ("Dutch Grand Prix"); localising them needs a `circuitId` → name lookup per
  language, which doesn't exist yet.
- Team liveries in `lib/teams.ts` are approximations; tweak there and every row,
  bar and badge follows.
