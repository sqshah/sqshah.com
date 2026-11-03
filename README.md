# sqshah.com

Personal site of Syed Qasim Ali (SQ Shah).

| path | what it is |
|---|---|
| `index.html` | the whole page: markup, styles, and the load/scroll timelines |
| `hero3d.js` | the hero room — televisions, glow, dust, camera |
| `particles.js` | the figure section — type dissolving into the portrait, then the full figure |
| `assets/signature.json` | the signature, as outline + pen-stroke paths |
| `assets/figure-ink.png` | the ink drawing, alpha-keyed off its paper |
| `assets/vendor/` | GSAP, ScrollTrigger and three.js, self-hosted |

The case studies in the hero are read at runtime out of the written list in
`#work`, so that list is the single source of truth — edit a row and the
televisions follow.

Hosted on Cloudflare Pages. Any push to `main` publishes automatically.
