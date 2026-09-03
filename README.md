# Pixel Pal — Concept B (Ask-based)

Clickable prototype of an alternative Pixel Pal mechanism: anonymous ask → private message
request → accept/decline → 1:1 chat → optional mutual profile reveal. No matching algorithm.

See [docs/concept-b-spec.md](docs/concept-b-spec.md) for the full concept, the screen-by-screen
flow, and what's deliberately not built.

## Stack

Vite + React 18 + TypeScript + Tailwind CSS + Zustand (persist) + React Router + Framer Motion —
same stack and design tokens as the other two Pixel Pal prototypes on this machine, copied over
for visual continuity; no shared code or data between them.

## Run

```bash
npm install
npm run dev
```

Open `/` and click **Enter Community**, or jump straight to `/groups/pixel-pal`.

The bottom-right gear icon opens **Demo Controls** — this is a single-device prototype, so
anything that needs "the other person" to act (a message request arriving, a reply, a profile
share, an accept/decline on a request you sent) is simulated from there.

## Route map

| Path | Screen |
|---|---|
| `/` | Launcher — concept cover + Reset demo |
| `/home` | Placeholder tab (not part of this concept) |
| `/messages` | Care Team + Pixel Pal entry card (reference screenshot recreation) |
| `/groups` | Community/Groups (reference screenshot recreation) |
| `/groups/pixel-pal` | Pixel Pal feed — post an ask, browse and reach out to others' |
| `/groups/pixel-pal/my-ask` | Your ask — status, close it, accept/decline requests |
| `/groups/pixel-pal/chat/:conversationId` | Private 1:1 chat + profile reveal |
