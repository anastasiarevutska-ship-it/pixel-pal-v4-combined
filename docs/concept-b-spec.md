# Pixel Pal — Concept B (Ask-based)

**Status:** standalone prototype, separate from the other two Pixel Pal explorations on this
machine — V1 (`Pixel Pal Proto V1`, suggestion cards + accept/decline matching) and V2
(`Pixel Pal Proto V2_Peer`, automatic 1:1 peer matching). Concept B shares none of their code or
data model on purpose: it's a genuinely different mechanism, not a variation on either.

## The idea

No matching algorithm. A patient posts anonymously what they want to talk about; other patients
browse those asks and, if one resonates, send a private message request; the author accepts or
declines who gets in. Accepting opens a private 1:1 chat that both sides can start anonymously,
with an optional, mutual "share my profile" moment later.

Mental model: **Groups = public community conversations. Pixel Pal = private one-to-one
conversations.** Both live under the same Community section of the app — Pixel Pal is a sibling
tab next to Groups, not a separate product.

## Where it lives in the app

- `/groups` — Community/Groups, recreated from the client's reference screenshot
  ("Community_Home_NoGroups"): avatar/greeting header, empty-groups state, Explore Groups, Groups
  for you. A segmented control (**Groups | Pixel Pal**) sits under the header — the "new tab or
  clear entry point" the brief asked for, styled as a sibling of Groups rather than a promo card
  bolted onto it.
- `/groups/pixel-pal` — the feed: her own active ask (if any) at the top, then anonymous asks
  from other patients below, each with a single "Reach out" action.
- `/messages` — recreated from the second reference screenshot (Care Team block unchanged); the
  existing "Find a Pixel Pal" card is repointed at the ask-based feed instead of a matching flow,
  so Pixel Pal reads as reachable from where patients already look for one-to-one help, not only
  from Groups.
- `/home` — a placeholder tab only, same honesty convention as Treatment/Library: not part of
  this concept, kept so the bottom nav has somewhere real to land.

## The flow, screen by screen

| Step | Where | Notes |
|---|---|---|
| Post an anonymous ask | Feed → "Ask for support" sheet | Short text only, no preference/matching questions. Confirmation state shows the posted text back to her. |
| Browse asks | Feed | Anonymous avatar (a generic silhouette, never initials — initials can leak identity), relative timestamp, the ask text, "Reach out". No forum chrome — cards are calm, not a scored/ranked list. |
| Respond to an ask | Feed card → "Reach out" sheet | A short intro message, sent as a **message request**, not an open chat. The original ask is quoted for context. |
| Message request arrives | `/groups/pixel-pal/my-ask` | The responder is shown as anonymous. Accept / Decline. Multiple requests on the same ask stack as separate cards. |
| Accept | My ask → chat | Opens the private chat immediately; the request's intro message becomes the first chat message. |
| Decline | My ask | Private and reasonless — the responder is never told why, same courtesy the other two prototypes use for the same moment. |
| Private chat | `/groups/pixel-pal/chat/:id` | Both sides start anonymous. A context strip ("You connected over…") keeps the original ask visible so the connection still makes sense days later. |
| Profile reveal | Inside chat | "Share my profile" is optional and one-sided until the other person also shares — never automatic, never assumed. Once both have shared, the header switches from an anonymous silhouette to the real Avatar/name. |
| Close an ask | My ask | Stops new responses; existing accepted conversations are unaffected. She can post a new ask once the old one is closed. |

## Deliberately not built

- **No matching algorithm, no ranking, no suggested-profile carousel.** The feed is chronological;
  finding someone to talk to is the patient's own browsing, not a system decision.
- **No treatment/preference questions at ask time.** The ask text itself carries whatever context
  the patient chooses to include — this was a direct instruction ("avoid complex preference
  questions or matching settings").
- **No read receipts, no "seen" state on requests** — same reasoning as the sibling prototypes:
  it would pressure a response neither side has agreed to yet.
- **A patient can post at most one open ask at a time.** Not a hard product rule, just an MVP
  scope cut to keep the prototype legible — see "Open questions" below.
- Groups itself (join/follow, real group content) is presentational only, matching the reference
  screenshot; this prototype is about Pixel Pal, not about building Groups.

## Data model & demo mechanics

`src/lib/types.ts` — `Ask`, `MessageRequest`, `Conversation`, `ChatMessage`, `Person`. No
Member/Pal roles, no relationship "state machine" — a `Conversation` just exists once a request is
accepted, from either direction (she can be the ask's author or the one reaching out).

`src/store/useDemoStore.ts` — Zustand + `persist` (localStorage), same convention as the sibling
prototypes. Single-persona demo: "Samantha" is always `me`; every other participant is seeded
(`src/lib/seed.ts`) with an alias and no photo (`Avatar` falls back to initials), so nothing here
implies every real patient must use an alias — it's a privacy-friendly prototype fixture, same
choice V2's source-of-truth doc calls for.

Because this is single-device, anything that needs "the other person" to act — a request arriving,
a reply, a profile share, the ask author's decision — is simulated through the **Demo Controls**
panel (bottom-right gear icon, dashed-coral border, obviously not product UI), the same pattern
used throughout the other two prototypes.

## Open questions (not resolved by this prototype)

- Whether a patient may run more than one open ask, or reach out to more than one ask, at a time.
- What happens to an ask's remaining pending requests once one is accepted (left as-is here).
- Report/safety flow for an ask or a message request — out of scope, same as the sibling
  prototypes' "not built" lists.
- Whether Groups itself should feed into Pixel Pal (e.g. "start a private thread from a group
  reply") — not asked for here, and not built.
