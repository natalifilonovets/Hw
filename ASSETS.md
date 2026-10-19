# Local asset manifest

All listed files exist in `assets/`. Built-in Imagegen was used; no external image URLs or API keys are required to play. Generated characters are interpretations of the named characters, not reused approved production assets. No source project assets were supplied.

| Exact filename | Shape / use | Source status |
|---|---|---|
| `lobby-bg.jpg` | 1672×941, approximately 16:9; burgundy and gold hotel | generated, JPEG delivery conversion |
| `ancient-village-bg.jpg` | 1672×941, approximately 16:9; teal hillside, fire, disguise, spirit illustration | generated, JPEG delivery conversion |
| `old-village-bg.jpg` | 1672×941, approximately 16:9; two explorable timber cottages | generated, JPEG delivery conversion |
| `street-bg.jpg` | 1672×941, approximately 16:9; five houses in one continuous street | generated, JPEG delivery conversion |
| `johnny-welcome.png` | 666×1000 RGBA; full body with magic book | generated separate character overlay; actual transparent pixels verified |
| `dracula-reaction.png` | 666×1000 RGBA; full body/cape | generated separate character overlay; actual transparent pixels verified |
| `magic-book.svg` | 160×180; book / image error fallback | authored SVG |
| `clock.svg` | 300×300; mechanical clock | authored SVG |
| `gear.svg` | 160×155; unlock and socket object | authored SVG |
| `candy-bag.svg` | 160×180; stitched bag HUD | authored SVG |
| `pumpkin.svg` | 160×180; pumpkin resident and physical clue object | authored SVG |
| `ghost.svg` | 160×180; friendly ghost resident | authored SVG |
| `witch.svg` | 160×180; witch costume / resident | authored SVG |
| `skeleton.svg` | 160×180; skeleton costume | authored SVG |
| `pirate.svg` | 160×180; pirate costume | authored SVG |
| `wolf.svg` | 160×180; friendly werewolf resident | authored SVG |
| `bat.svg` | 160×180; harmless prank bat | authored SVG |
| `bench.svg` | 160×180; bench with basket under it | authored SVG |
| `gate.svg` | 160×180; gate with small pumpkin next to it | authored SVG |
| `book-spread.svg` | 1200×720; curved parchment leaves, golden trim, leather binding and ribbon | authored SVG |
| `page-fire.svg` | 72×98; illustrated fire page fragment | authored SVG |
| `page-mask.svg` | 72×98; illustrated mask page fragment | authored SVG |
| `page-spirit.svg` | 72×98; illustrated spirit page fragment | authored SVG |

The suggested five separate `house-*.webp` files are not needed or referenced: all five houses belong to the locally generated street composition, preserving an environmental scene rather than website cards. Timeline thumbnails reuse the corresponding era illustrations. Scene backgrounds never include Johnny or Dracula; their alpha overlays remain separate. House/costume objects deliberately use lightweight SVG illustrations.

There are no missing required files and no required manual generation tasks. Optional future improvement: replace the SVG doorstep residents with matched transparent 3D renders and add more Johnny reaction poses. These optional files are not claimed to exist. Narration uses the browser's English Web Speech voice; no missing audio tracks are referenced.

Generation prompts and additional transparency edit attempts are recorded in `ART_PROMPTS.md`. Original generated files remain in the tool's output directory; the game uses only the workspace copies listed above. JPEG scenes are derived from the generated PNGs; character alpha was preserved during resizing.

Chapter 01 reuses the exact ancient scene in an SVG coordinate plane (1672×941); the image and invisible object targets scale together. The left book page reuses the same illustration. New book and fragment artwork is native SVG, with no additional raster generation.


## Detailed illustrated exploration props

These six local PNG assets were generated with built-in Imagegen for the revised Chapter 01. They replace the simple SVG props in that chapter; the original SVG files remain available for other uses. All six retain RGBA transparency. Prompts: `ART_PROMPTS_EXPLORATION.md`.

| File in `assets/` | Purpose | Status |
|---|---|---|
| `magic-book-open.png` | Detailed two-page leather-and-gold book, painted Irish village on the left, blank parchment for HTML task text on the right | generated |
| `magic-book-closed.png` | Ornate closed book in the scene corner | generated |
| `page-fire-illustrated.png` | Torn illuminated parchment with bonfire painting | generated |
| `page-mask-illustrated.png` | Torn illuminated parchment with wooden-mask painting | generated |
| `page-spirit-illustrated.png` | Torn illuminated parchment with friendly-spirit painting | generated |
| `johnny-explorer.png` | Separate transparent right-facing walking/exploring pose, derived from the existing Johnny reference | generated from reference |

Johnny's movement uses a walking-pose image, position interpolation and a gentle step animation; it is not a frame-by-frame sprite animation. His locations share the illustration's SVG coordinates so they scale with the scene and object targets. The collectible is awarded on arrival, then flies into the book. Reduced-motion mode completes this without animated travel.


## Chapter 02 doorway adventures

The original `old-village-bg.jpg` is retained byte-for-byte. New chapter assets below were created with built-in Imagegen; their prompts are in `ART_PROMPTS_VILLAGE.md`. The guising entrance uses a character-free background and separate alpha performer, so the performance does not move the scenery.

| File in `assets/` | Purpose | Source |
|---|---|---|
| `village-souling-porch.jpg` | 16:9 open-door close-up, friendly villager saying a prayer, empty basket and wooden tabletop | generated |
| `village-guising-porch.jpg` | 16:9 open-door close-up, lanterns, bench and treats, character removed for animation | generated and edited |
| `village-performer.png` | Transparent full-body disguised villager with lute | extracted/generated from the guising source |
| `village-sorting-table.png` | Transparent carved wooden table and two empty wicker baskets with blank parchment tags | generated |
| `soul-cake.png` | Transparent round cake with a scored cross and currants | generated |
| `village-lute.png` | Transparent wooden lute | generated |
| `village-word-parchment.png` | Text-free ornate parchment base for illustrated sorting cards | generated |

Existing `page-mask-illustrated.png`, `bench.svg`, `gear.svg`, and Johnny artwork are reused. Card labels and basket names are real HTML text, so they remain crisp and accessible. The doorway overview uses the same 1672×941 coordinate plane as the village art, while close-up props are positioned inside a matching 16:9 frame. No new asset is remotely hotlinked.


## Vocabulary distractor replacement

`assets/village-broom.png` is a generated transparent 3D-style household broom, delivered at 500px maximum dimension with alpha preserved. It replaces the bench-based “Go to sleep” distractor in Chapter 02. The option now reads “Sweep the floor”. Source: built-in Imagegen; exact prompt in `ART_PROMPT_BROOM.md`. The original `bench.svg` remains used by the modern location-clue task.

## Present Simple Halloween Street

The original `street-bg.jpg` supplies the panorama and cropped doorway close-ups. Existing Johnny and Dracula art is reused. New transparent Imagegen characters: `street-witch.png`, `street-ghost.png`, `street-werewolf.png`. Prompts: `ART_PROMPTS_STREET.md`. Wrapped candy is authored SVG (`wrapped-candy.svg`). Old clock assets are retained but their stages are absent from the playable route.


## Object discovery questions and candy HUD

`candy-bag.svg` was redrawn as a stitched purple satchel with gold cords, a candy medallion and wrapped sweets. `discovery-lantern.svg` is an authored illustrated lantern distractor. The three discovery questions reuse the illustrated fire/mask fragments, friendly ghost, wolf and wrapped candy art. No new bitmap generation or remote asset is required.

## Consistent discovery answer set

The discovery choices now use transparent dimensional art: `discovery-fire.png`, `discovery-mask.png`, `discovery-lantern.png`, `discovery-fox.png`, and `discovery-candy.png`, alongside the existing `street-ghost.png`. All five new illustrations were generated with built-in Imagegen against that shared ghost style reference and saved at 512px maximum dimension with alpha preserved. Exact generation and final refinement prompts are in `ART_PROMPTS_DISCOVERY.md`. They replace the flat wolf/lantern/candy icons and parchment fragments only within the discovery answers.
