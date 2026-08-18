# TikZ spatial geometry QA

Fixture: `A(1,5,-4)`, `B(-14,15,6)`, `P(-5,r,s)` on `AB`, with a plane through `P` perpendicular to `AB`.

- Detector triggers only for Math line/point/plane perpendicularity problems.
- A/B/P tuples parse exactly.
- P uses the known x-coordinate to place itself at parameter `t = 0.40` from A to B in the schematic.
- The diagram is browser-rendered SVG; no generative image is used.
- Gemini does not choose coordinates or layout for this template.
- The source tutor diagram is hidden; the worksheet V9 clone is the visible copy.
- The TikZ-specific sheet copy suppresses the generic multi-stage diagram pager.

Run:

```sh
node --check wrongbook-v2/tikz-spatial-geometry-v1.js
node wrongbook-v2/qa/tikz-spatial-geometry-v1.mjs wrongbook-v2/tikz-spatial-geometry-v1.js
```
