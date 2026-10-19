# Embed in Genially

Publish URL: https://natalifilonovets.github.io/Hw/embed.html

Use Genially's external content / iframe embed with this HTML:

```html
<iframe
  src="https://natalifilonovets.github.io/Hw/embed.html"
  title="Johnny's Halloween Adventure"
  width="1280"
  height="720"
  style="width:100%;height:100%;border:0;display:block"
  allow="autoplay; fullscreen"
  allowfullscreen>
</iframe>
```

Set the Genially object to **16:9**, for example **1280 × 720** or **960 × 540**. Place it on a 16:9 slide and keep its proportions when resizing. The outer embed fits the full composition inside the available rectangle; the inner game keeps a fixed 1280 × 720 viewport. A different container ratio produces small dark margins instead of stretching or cropping the game. The two text pages can scroll internally on small displays. For comfortable touch controls, use fullscreen on small phones.

Use `embed.html` for Genially and `index.html` for the normal responsive standalone game. Completion messages are forwarded through the wrapper with origin/source validation. Configure `parentOrigin` and `hotelUrl` in `config.js` if the host needs completion notifications or an external return destination.
