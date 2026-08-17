# Wrongbook Mind Map Execution Status

Updated: 2026-08-17
Candidate branch: `wrongbook-mind-map-skill-20260817`
Last dedicated validation run: GitHub Actions run `31994161333`

## Executive status

The Earth Science reconstruction process has been recovered from the current repository, source-truth packs, source inventories, semantic models, source-local hierarchy, dedicated figure renderers, geometry captures, and browser QA infrastructure, then formalized as `MIND_MAP_MAKING_SKILL.md`.

The existing non-Earth renderer has been refactored in place to follow that skill rather than creating a parallel architecture.

Dedicated validation on the exact synced candidate passed for:

- non-Earth desktop browser geometry/content gate;
- non-Earth mobile browser geometry/content gate;
- current Earth source-truth regression gate;
- current Earth source-refinement regression gate;
- representative desktop/mobile screenshot capture for all nine non-Earth subjects.

The temporary validation workflow used to produce this evidence was removed after the passing run and is not part of the production candidate.

## Earth Science — Class A photographed source-truth reconstruction

Source authority:

- latest `EARTH_MINDMAP_NEW_SOURCE_TRUTH_WITH_GRID` pack;
- 12 authoritative photographs;
- source pages 242–253;
- normalized coordinate aid 910×1270;
- 10×10 source grid.

Canonical corpus:

- Chapter 1: 48 learning items;
- Chapter 2: 50;
- Chapter 3: 41;
- Chapter 4: 27;
- Chapter 5: 60;
- Chapter 6: 50;
- total: **276 canonical learning items**;
- source-required figures: **56**.

Current Earth acceptance evidence:

- 276 source-prompt validation passes;
- semantic data validation passes;
- six-chapter structure passes;
- source-specific two-page rendering passes;
- generic fallback figure count remains zero;
- semantic fallback figure count remains zero;
- auto-routed production edge count remains zero;
- rendered semantic connectors require source trace/path/source-page evidence;
- only source-visible concept nodes are rendered;
- figure renderer readiness passes;
- chapter counts 48 / 50 / 41 / 27 / 60 / 50 pass;
- source geometry check for page 242 passes;
- chapter 5 source order passes;
- source photos are not shipped as production backgrounds;
- current source-refinement regression passes.

The Earth source-trace E2E was explicitly decoupled from an unrelated homepage-copy/boot assertion. No Earth source, count, hierarchy, figure, connector, or geometry assertion was removed or weakened.

## Non-Earth subjects — Class B curriculum-driven semantic knowledge maps

No authoritative publisher-photo source pack for these subjects was recovered in the available Wrongbook sources. Their current source authority remains the repository's curated Taiwan 108 curriculum/learning-object structures. Therefore this status does **not** claim photographed textbook-page fidelity for them.

Validated subjects:

| Subject | Chapters | Canonical learning items |
| --- | ---: | ---: |
| Chinese / 國文 | 8 | 48 |
| English / 英文 | 9 | 54 |
| Mathematics / 數學 | 14 | 71 |
| Physics / 物理 | 14 | 84 |
| Chemistry / 化學 | 14 | 70 |
| Biology / 生物 | 14 | 99 |
| History / 歷史 | 11 | 66 |
| Geography / 地理 | 10 | 60 |
| Civics / 公民 | 11 | 66 |
| **Total** | **105** | **618** |

### Desktop validation

- subjects expected: 9;
- chapters expected: 105;
- chapters rendered: 105;
- canonical items expected: 618;
- canonical items rendered: 618;
- detected QA issue totals: **0**;
- status: **PASS**.

### Mobile validation

- subjects expected: 9;
- chapters expected: 105;
- chapters rendered: 105;
- canonical items expected: 618;
- canonical items rendered: 618;
- detected QA issue totals: **0**;
- status: **PASS**.

The cross-subject gate checks at minimum:

- canonical point count;
- section count;
- answer-input count;
- duplicate point ownership;
- forbidden mascot/page-number/continuation/numbered-blank artifacts;
- horizontal overflow;
- viewport overflow;
- input outside map/owner;
- text outside map/owner;
- micro-font violations;
- recall/recall collisions;
- recall/figure collisions;
- ribbon/content collisions;
- ribbon/figure collisions;
- clipped nowrap text.

## Human-reading / screenshot QA

Representative desktop and mobile screenshots were captured for:

- Chinese;
- English;
- Mathematics;
- Physics;
- Chemistry;
- Biology;
- History;
- Geography;
- Civics.

Human-reading review found that short pseudo-connectors drawn between prompt columns and central figures read as dangling/misleading line fragments even though the DOM geometry gate was green. The root cause was the generic pseudo-connector styling rather than source/semantic ownership.

Correction:

- removed the pseudo-connectors;
- retained meaningful instructional graphics and section hierarchy;
- reran desktop/mobile gates;
- reran screenshots;
- all 105 chapters / 618 items remained green.

Current visual behavior:

- no mascot/cartoon character;
- no artificial numbered blank badges;
- no fake workbook page split;
- no continuation/page-number footer;
- no artificial Page 1/Page 2 index artifact;
- no short dangling pseudo-connectors;
- central instructional graphics remain readable;
- mobile stacks the semantic cluster instead of shrinking the whole map to unreadable scale;
- blanks stay adjacent to the concept/visual/flow context that gives them meaning.

## Renderer changes

The existing `mindmap-textbook-v4.js` / `mindmap-textbook-v4.css` implementation was changed in place rather than replaced with a second mind-map architecture.

Removed legacy behavior:

- mascot SVG;
- numbered blank badges;
- fake workbook page splitting;
- continuation headers;
- page-number footers;
- pseudo-connectors that produced dangling visual fragments.

Added/preserved:

- one coherent knowledge map per chapter;
- subject-specific instructional visual grammar;
- answer blanks embedded with their semantic prompt context;
- explicit point/section/slot/figure ownership metadata;
- answer-leak prevention by stripping labels from retrieval-cue hero SVGs;
- desktop/mobile responsive layout without micro-font shrinking.

## Legacy broad E2E note

The old broad `?e2e=1` suite remains a non-blocking diagnostic because several of its assertions encode superseded product behavior, including:

- old Earth wrapper/count assumptions;
- required semantic connector counts that conflict with the current source-visible-connector contract;
- old numbered-recall expectations;
- a removed `notebook` navigation route.

The production candidate was **not** changed to satisfy those obsolete assertions. The dedicated current source-truth/refinement gates and the new cross-subject gate are the acceptance evidence for this work.

## Final measurable status

### Earth Science

- canonical items: 276;
- source-required figures: 56;
- current source-truth gate: PASS;
- current refinement gate: PASS;
- status for this regression scope: **READY**.

### Non-Earth curriculum maps

- subjects: 9;
- chapters: 105 / 105;
- canonical items: 618 / 618;
- desktop detected QA issues: 0;
- mobile detected QA issues: 0;
- forbidden mascot/page-index artifacts: 0;
- screenshot capture coverage: 9 subjects desktop + mobile;
- reviewed dangling pseudo-connectors: fixed and rechecked;
- status under current curated Taiwan 108 curriculum authority: **READY**.

## Source-authority caveat for future work

If Biology, Chemistry, Physics, Mathematics, History, Geography, Chinese, English, or Civics later receives an explicit publisher-photo/textbook source pack, that new pack becomes the visual source authority. At that point the full photographed-source extraction, coordinate, blank ownership, figure inventory, connector tracing, source overlay, and source-specific semantic QA phases must be rerun before claiming photographed-page fidelity.
