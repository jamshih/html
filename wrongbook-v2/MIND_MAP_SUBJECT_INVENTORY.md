# Wrongbook Mind Map Subject Inventory

Updated: 2026-08-17
Branch: `wrongbook-mind-map-skill-20260817`

This file is the Phase D inventory for the Earth-derived Mind Map Making Skill. It distinguishes source-photo reconstruction from curriculum-driven semantic maps so source fidelity is never falsely claimed.

## Source authority classes

### Class A — photographed source-truth reconstruction

**Earth Science / 地科**

- Authoritative visual source: latest `EARTH_MINDMAP_NEW_SOURCE_TRUTH_WITH_GRID` pack.
- Pages: 242–253, 12 current photographs.
- Normalized coordinate aid: 910×1270 with 10×10 grid.
- Canonical learning items: 276.
- Source-required figures: 56.
- Dedicated source prompt, figure, trace, refinement, hierarchy, integrity, and browser QA infrastructure exists.
- Current Earth work is already evolving independently on `main`; this branch does not overwrite or merge older Earth V9 geometry blindly.

### Class B — curriculum-driven semantic knowledge maps

The following subjects have existing Taiwan 108 curriculum data and are rendered from that semantic curriculum layer. No separate authoritative publisher-photo source pack for them has been recovered in the available Wrongbook files as of this inventory, so **do not claim photographed-page fidelity** for these subjects.

- Chinese / 國文
- English / 英文
- Mathematics / 數學
- Physics / 物理
- Chemistry / 化學
- Biology / 生物
- History / 歷史
- Geography / 地理
- Civics / 公民

Their current source authority is the repository's existing curated curriculum structures (`curriculum-tw.js`, `curriculum-more-tw.js`, bridge/fix layers) plus existing Wrongbook learning-object data. If a later user-supplied textbook/photo pack is found, that explicit pack supersedes this Class B source authority for visual reconstruction.

## Existing implementation state found during recovery

The legacy non-Earth `mindmap-textbook-v4.js` renderer previously contained:

- a cartoon mascot;
- artificial numbered blanks;
- artificial workbook page splitting;
- continuation headers;
- chapter/page-number footers.

Those structures violate the current Mind Map Making Skill and have been removed on this branch. The renderer is now one coherent knowledge map per chapter, keeps recall blanks beside their semantic visual/flow context, exposes explicit point/slot/figure ownership metadata, and preserves the existing subject-specific visual grammar instead of creating a parallel renderer.

## Required QA state

Earth Science keeps its dedicated 276-item / 56-figure source-truth gates.

For the nine Class B subjects, `mindmap-skill-qa-v1.js` runs every curriculum chapter at real browser geometry and checks at minimum:

- rendered point count equals curriculum point count;
- rendered section count equals curriculum section count;
- input count equals point count;
- duplicate point ownership = 0;
- visible mascot/page-number/continuation/numbered-blank artifacts = 0;
- horizontal/viewport overflow = 0;
- input outside map/owner = 0;
- text outside map/owner = 0;
- micro-font violations = 0;
- recall/recall collisions = 0;
- recall/figure collisions = 0;
- ribbon/content and ribbon/figure collisions = 0;
- clipped nowrap text = 0.

The temporary branch workflow also captures desktop and mobile browser screenshots for all nine non-Earth subjects so the student-reading and semantic visual pass can inspect real rendering instead of trusting HTML/CSS alone.

## Readiness contract

No Class B subject is marked READY merely because the renderer changed. The branch remains NOT READY until the browser gate reports measurable zero-defect counters and the captured screenshots have been reviewed for human readability and semantic placement.

When a future photographed source pack is supplied for Biology, Chemistry, Physics, Mathematics, History, Geography, Chinese, English, or Civics, repeat the full source-truth extraction phase before claiming source-coordinate fidelity.
