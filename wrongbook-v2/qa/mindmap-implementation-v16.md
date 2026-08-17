# Illustrated mind-map implementation v16

## Source-of-truth order

1. Supplied finished reference mind maps for composition and typography
2. Supplied enhanced WebP packs for complex illustrations
3. Existing Wrong Book data, answers, Learn/Recall state, and routing
4. Native HTML/CSS/SVG for text, patches, connectors, and scientific diagrams

## Typography decision

The reference uses a high-contrast printed Traditional Chinese Ming/Song face for
large titles and a compact, lightly rounded printed Traditional Chinese sans for
labels and body copy. The exact originating font cannot be established reliably
from the raster references. The implementation therefore uses the production-safe
Noto family: `Noto Serif TC` (700–900) for display text and `Noto Sans TC`
(400–800) for labels, educational copy, English, numerals, and inputs. Both remain
real HTML text. Tokens live on `.mindmap--illustrated` in
`mindmap-illustrated-v16.css`; subject files consume the tokens instead of
declaring unrelated generic fonts.

## Asset ownership

`mindmap-approved-assets-v16.js` is the canonical inventory and placement map.
It records a subject, semantic owner, accessible description, and local WebP path
for every approved asset. Inventory totals are Earth Science 12, Chemistry 31,
and Biology 33. Assets whose concepts do not exist in the live curriculum remain
inventoried but are not inserted into an unrelated concept.

## Rendering decisions

- Earth Science: existing `earth-png-board-v15` live entry point rebuilt as
  semantic clusters; native SVG connectors/diagrams and real Recall inputs replace
  the prior flattened strip/canvas presentation.
- Chemistry: existing reference renderer retained; approved assets are appended to
  the matching live clusters while existing native figures and question logic stay
  authoritative.
- Biology: existing shared textbook renderer retained; subject-scoped composition
  and asset placement produce illustrated clusters without affecting other subjects.
- Mobile: clusters become a document flow; desktop connector overlays are removed
  where their routes no longer correspond to the stacked reading order.

## Automated checks completed

- JavaScript syntax checks for every changed renderer/registry file
- Git whitespace/error check
- 76/76 registered asset files present
- zero missing placement IDs
- zero cross-subject placements
- Learn/Recall inputs, chapter selectors, and existing answer-state functions remain
  wired through their original data attributes/functions
- Earth renderer contains no flattened reference strip or canvas renderer

## Visual QA status

Cloud-browser access to the local runtime is blocked in this execution environment
(local HTTP is upgraded to an unreachable HTTPS endpoint, and local file URLs are
disallowed). Consequently, screenshot comparison and console-driven viewport QA
must be run in an environment where the local Wrong Book URL is browser-accessible.
The implementation must not be marked visually approved until desktop, tablet, and
mobile screenshots for all three subjects pass the collision and typography checks.
