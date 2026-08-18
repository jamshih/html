# Illustrated mind-map integration — final QA

Release scope: Earth Science, Chemistry, and Biology in the live Wrong Book → Mind Map route.

## Runtime coverage

| Subject | Live pages | Desktop | Tablet | Mobile | Learn/Recall |
| --- | ---: | --- | --- | --- | --- |
| Earth Science | 6 | Pass | Pass | Pass | Pass |
| Chemistry | 11 (6 GSAT + 5 elective) | Pass | Pass | Pass | Pass |
| Biology | 10 composite curriculum chapters | Pass | Pass | Pass | Pass |

The checks used the real application shell at 1440 × 1050, 820 × 1180, and 390 × 844. Mobile uses semantic cluster reflow instead of scaling a desktop sheet.

## Approved asset ownership

- Earth Science: 18 approved WebP files. The first reference sheet owns 13 component-level illustrations; later chapters use five registry-owned chapter assets.
- Chemistry: 31 approved WebP files, all assigned through the chemistry page/cluster placement registry.
- Biology: 33 approved WebP files. Twenty-six are section placements and seven are owned by the reproduction/life-cycle chapter shelf.
- No full reference sheet, educational label, formula, or answer blank is rasterized.
- Native HTML remains the owner of educational text and inputs; CSS owns patches and simple geometry; SVG owns connectors and scientific diagrams.

## Typography

The exact reference typeface could not be identified or licensed with sufficient confidence. The production-safe match is:

- Body and answer text: `LXGW WenKai TC` with `Klee One`, `BiauKai`, and `DFKai-SB` fallbacks.
- Display headings: `Noto Serif TC` with Traditional Chinese serif fallbacks.
- Web-font loading is centralized in `index.html`; subject sheets consume shared typography tokens from `.mindmap--illustrated`.
- Mobile educational labels and answer/status text have an 11 px floor; normal explanatory copy remains 13–14 px or larger.

## Visual and functional gates

All 27 live pages were opened through subject and chapter/page controls. After lazy assets settled, the final checks reported:

- 0 broken approved images and no relevant 404s.
- 0 viewport-horizontal-overflow failures.
- 0 illustration/input and input/input collisions.
- 0 duplicate answer keys.
- 0 flat reference-sheet images or answer leaks.
- Earth desktop clusters stay two-column; tablet preserves paired clusters; mobile stacks semantic clusters.
- Chemistry keeps the fixed reference composition on desktop and reflows concept clusters on mobile.
- Biology retains illustrated paired clusters on desktop and a readable single-column mobile sequence.
- Learn/Recall toggles, correct-answer marking, answer persistence, chapter switching, chemistry track switching, and subject switching pass.

## Intentional responsive deviation

At phone width, connector layers that depend on fixed desktop coordinates are suppressed and their meaning is preserved through semantic DOM order: illustration → related concept → explanation → answer blank. This is the only intentional composition change from the desktop reference structure.
