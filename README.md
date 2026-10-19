# Johnny's Halloween Time Machine

A complete buildless browser adventure in English for ages 10–12 (A1+–A2). Explore an ancient festival, help Johnny correct his notes, and visit five Halloween houses. There is no intro, village, clock-repair or chronology stage.

## Run

From this folder:

```sh
python3 -m http.server 8000
```

Open **http://localhost:8000**. No Node, installation, account, paid API, or build is required. Opening `index.html` directly also works, but a server is recommended for consistent saving and offline caching. All game artwork is local. No analytics or remote fonts are used.

## Play

- Begin directly at the illustrated ancient festival. The intro is supplied by Genially.
- Explore the fire, hanging mask and spirit. Johnny walks to the selected object, where a small illustrated parchment shows one fact and a question with two picture answers. A correct answer releases its page fragment; wrong answers can be retried. Pending questions survive refresh and can be closed to explore another object. Three earned fragments open the illustrated book.
- Read the complete A1+–A2 historical passage. Help Johnny correct three notes, one at a time: **England → Ireland**, **candles → fires**, **animals → spirits**. Each has three shuffled choices. A wrong answer gives a reading hint and does not advance. The passage remains visible; selecting answers never remounts the book artwork. Player-facing vocabulary uses **costumes**.
- Three corrections stamp the page RESTORED and open Halloween Street directly.
- Knock on five illustrated doors in any order. Choose “Trick or treat!”, then solve three Present Simple questions per house. Narrow screens can swipe across the continuous panorama.
- Correct intermediate answers advance the local 0/3 progress. **Only a completed house grants candy**: 2 + 2 + 2 + 3 + 2 = **11**. Exactly that many illustrated sweets fly into the bag. The visible counter updates from saved reward state. Wrong answers, partial houses and revisits grant no candy.
- Complete all five houses to reach the finale.

The spirit illustrates an old belief. The game does not claim that Samhain involved modern candy collecting or that trick-or-treating has one proven origin.

## Controls and saving

Semantic buttons support keyboard, mouse, and touch. Dragging is optional. English speech is opt-in with **SOUND OFF / ON**, and all task text remains readable. Speech availability and voice quality depend on the browser/OS; every line is written on screen. Audio never gates progress. There are no required sound files.

**MOTION OFF** disables animations. System reduced-motion preferences are also honored. **?** opens context help. **BACK** revisits the previous chapter without deleting progress. The J logo returns to the ancient festival without clearing progress. Restart and Play Again ask for confirmation.

Autosave uses the localStorage key `johnny-halloween-v1`; refresh, resize, and backward navigation preserve progress. Old completed books stay complete, and collected fragments, house visits and candy are retained. Saves at the removed village continue directly to the street. Partial new note corrections and house questions survive refresh. Old-version or invalid saves reset safely; rewards are recomputed from unique completed houses. In restrictive iframe/privacy settings storage may be unavailable, in which case the footer says `SAVE UNAVAILABLE` and the current session remains playable.

For teachers, **Ctrl+Shift+D** opens a hidden stage selector. This can mark prerequisites complete for testing. It is not exposed in normal play.

A local service worker precaches the game on localhost or HTTPS. After the first successful online load and cache installation, refreshes can work offline. A file:// launch does not install a service worker. To update cached asset definitions, increment the cache version in `sw.js`.

## GitHub Pages

Place this folder's contents at a repository root, including `assets/`. In the repository's Pages settings, choose deployment from your main branch and its root directory. The published address will use the repository path, for example `https://YOUR-ACCOUNT.github.io/YOUR-REPOSITORY/`. Relative paths work below a repository subdirectory. No compilation is needed. The Pages deployment is managed by `.github/workflows/pages.yml`.

## Genially embed

Use **https://natalifilonovets.github.io/Hw/embed.html** for embedding. Full copy/paste code is in [GENIALLY_EMBED.md](GENIALLY_EMBED.md). Set the Genially object to 16:9, e.g. 1280 × 720 or 960 × 540. The dedicated wrapper keeps the internal game viewport at 1280 × 720 and scales the entire composition proportionally. It preserves hotspot placement and avoids switching layouts when Genially resizes the embed. Other aspect ratios have margins instead of stretching or clipping. `index.html` remains the standalone responsive version.

Set `hotelUrl` in `config.js` to the actual hotel/quest URL if desired. With no configured URL, **BACK TO HOTEL** returns to the ancient festival and retains the completed adventure. No button depends on an unknown external destination.

Set `parentOrigin` in `config.js` to the exact trusted embedding origin (scheme + hostname + optional port). On the finale, and on Back to Hotel, the game sends:

```js
{type:'hotel-transylvania-mission-complete', mission:'johnny-trick-or-treat', candies:11}
```

The default target `*` sends this non-sensitive completion notification to the embedding parent; set an explicit origin for your integration. This **does not automatically grant Genially rewards**. A host you control can validate both origin and source, deduplicate, then update its own quest:

```js
const gameFrame = document.getElementById('johnny-game');
const gameOrigin = 'https://YOUR-ACCOUNT.github.io';
let completionHandled = false;
window.addEventListener('message', event => {
  if (event.origin !== gameOrigin || event.source !== gameFrame.contentWindow) return;
  const data = event.data;
  if (!data || data.type !== 'hotel-transylvania-mission-complete' ||
      data.mission !== 'johnny-trick-or-treat' || data.candies !== 11 || completionHandled) return;
  completionHandled = true;
  // Connect your own host's supported reward / navigation behavior here.
});
```

## Files

- `index.html`, `styles.css`, `game.js`: interface and scene interactions.
- `street-data.js`, `street.js`: fifteen grammar questions, balanced answers, street doors and animated house encounters.
- `engine.js`: deterministic state/reward operations and task guards.
- `village.js`: archived village interactions retained with their assets; not part of the playable route.
- `config.js`: embedding destination and trusted parent origin.
- `sw.js`: optional offline cache.
- `assets/`: the original four cinematic scene backgrounds, generated character/prop overlays, two new cottage entrance scenes, a layered performer, sorting table, illustrated parchment, and SVG support artwork. Detailed provenance is in ASSETS.md.
- `ASSETS.md`, `ART_PROMPTS.md`, `ART_PROMPTS_EXPLORATION.md`, `ART_PROMPTS_VILLAGE.md`: source status and image prompts.
- `tests/`: engine and real-handler checks using a minimal simulated DOM.

## Verification

```sh
python3 tests/run.py
```

Uses Node if installed, or macOS JavaScriptCore through Python's standard library. On other platforms install Node first. No test dependencies are downloaded.

The book image and root book element stay mounted while notes change; the opening animation is not replayed by corrections.

Completed checks: JavaScript syntax; 14,695 engine assertions including all 120 house orders, fifteen grammar questions, legacy-save migration and the 11-candy invariant; 172 real-handler assertions using a simulated DOM, including partial-question reload, animation cancellation, and stationary book artwork. Local asset references, SVG parsing and offline precache coverage also pass.

**Verification limit:** the available toolset did not expose browser automation. The UI handler tests simulate a DOM; visual layout, actual speech, browser drag/drop, iframe messaging, service-worker installation, and real touch behavior still need a browser smoke test. No screenshot or real-browser pass is claimed.

Manual browser checklist:

- At 1440×900, 1280×720, tablet width, and 390px wide, check readable content, scrolling and no obstructed controls.
- Complete all three note corrections, book reopening, fragment animations and all fifteen Present Simple questions.
- Try wrong choices and complete the adventure with keyboard controls.
- Check wrong greetings, grammar hints, door animations, and returning to a partially completed house.
- Reload mid-task and mid-street; revisit finished houses; verify exactly 11 candies.
- Cancel/confirm Restart; test Help, Back, Sound, Motion, finale, and configured hotel URL.
- Embed in the actual host, validate completion origin/source and deduplication, and test restrictive storage permissions.



The candy HUD uses a newly drawn stitched purple satchel with visible sweets, a large gold number and an engraved progress track. Its DOM stays mounted as the score changes, allowing the progress fill to transition smoothly. A house reward makes the satchel sway; reduced-motion mode suppresses the animation.
