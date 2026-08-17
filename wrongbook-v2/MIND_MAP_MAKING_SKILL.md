# Wrongbook Mind Map Making Skill

Version: 2026-08-17
Status: canonical reconstruction workflow for source-faithful Wrongbook mind maps

## 1. Purpose

This skill converts photographed or scanned educational mind-map material into an interactive Wrongbook mind map without losing source meaning, ownership, spatial relationships, blanks, figures, or connector intent.

It is not a generic infographic generator. It is a source-truth reconstruction and educational-structure workflow with strict geometry, semantic, browser, and regression QA.

Earth Science is the reference implementation used to recover this process. New subjects reuse the process, not Earth-specific decoration or Earth-specific diagrams.

## 2. Non-negotiable principles

1. Source authority is explicit and versioned.
2. Canonical educational content is immutable after source verification unless the source authority itself changes.
3. Semantic reasoning and visible source geometry are separate layers.
4. Every printed object has exactly one visual owner.
5. Every blank has exactly one educational owner.
6. Every rendered connector must be justified by the authoritative source or by an explicitly authorized derived-map design rule.
7. Educational graphics are content, not decoration.
8. Layout follows semantic structure and source relationships before aesthetics.
9. No accidental overlap, clipping, hidden content, micro-font fixes, or z-index concealment.
10. A render is never accepted without programmatic QA plus browser screenshot QA.
11. A fix is incomplete until the same region, neighboring regions, and regressions are rechecked.
12. Existing clean work is preserved rather than regenerated blindly.

## 3. Earth Science reference evidence

The Earth Science implementation establishes the following concrete pattern:

- canonical photographed prompt manifests;
- source-page ownership and per-page traces;
- exact prompt/blank reconstruction;
- independent source-figure inventory;
- semantic node/relation model used for reasoning;
- dedicated source-specific figure renderers;
- source-local hierarchy/parent ownership for dense regions;
- browser geometry capture for Recall and Learn modes;
- source-trace and source-refinement E2E gates;
- mobile viewport audits;
- screenshot comparison and grid-based correction;
- zero-defect acceptance gates.

For the current Earth Science source authority, the only valid visual source is the latest NEW_SOURCE_TRUTH pack containing 12 photos for pages 242–253. Its normalized 910×1270 pages and matching 10×10 grids are coordinate aids derived from those same photos. Older photographs, atlases, screenshots, website positions, and V4/V6/V7 coordinates are not visual authority when they disagree with that pack.

Earth Science canonical corpus:

- Chapter 1: 48 learning items
- Chapter 2: 50
- Chapter 3: 41
- Chapter 4: 27
- Chapter 5: 60
- Chapter 6: 50
- Total: 276 canonical learning items
- Source-required figure inventory: 56 figures

Important source-model lesson: a visible numbered field inside a composite printed prompt is not automatically a separate canonical learning item. Canonical ownership is determined from the actual printed structure, not by counting visible number glyphs alone.

## 4. Layer model

Every subject reconstruction uses five distinct layers.

### Layer A — Source authority

The actual user-approved photos/scans/PDF pages.

This layer decides:

- printed wording;
- visible blanks;
- visible labels;
- figure existence;
- figure shape and teaching area;
- connector existence and routing intent;
- local grouping;
- relative position/scale;
- important line breaks;
- printed page boundaries.

Never use the current website render as source authority.

### Layer B — Canonical educational inventory

A lossless inventory of educational objects extracted from the source.

### Layer C — Semantic model

A reasoning graph that answers why each object belongs where it does and what it teaches.

The semantic model may contain relationships that are not visually drawn in the source. Those relationships help clustering and QA, but they do not automatically authorize a visible connector.

### Layer D — Source-visible render graph

The objects and connector paths actually allowed to appear on screen.

For source-faithful reconstructions, a visible connector is rendered only if the authoritative source visibly contains that connection. Semantic-only edges stay in the reasoning model unless the user explicitly authorizes a redesigned knowledge-map connector system.

### Layer E — Interaction state

Recall/Learn state, blanks, answer reveal, hints, and other interaction behavior. Interaction must not change ownership or destroy source geometry.

## 5. Phase A — Recovery before editing

Before changing code:

1. Identify repository, app path, production branch, active work branches, and current main HEAD.
2. Inspect recent commits affecting the target mind-map implementation.
3. Find source packs, normalized pages, grids, manifests, source-trace files, canonical datasets, renderers, QA artifacts, screenshots, and reports.
4. Determine the newest source authority. Later explicit source-authority overrides beat older packs.
5. Determine the furthest validated implementation state.
6. Record clean regions/pages that must not regress.
7. Work on an isolated branch unless the user explicitly requires direct production editing.
8. Never overwrite a newer valid source coordinate set with an older one.

Recovery output must state:

- source authority;
- code baseline;
- branch;
- canonical counts known/unknown;
- existing clean state;
- unresolved state;
- source files available/missing.

## 6. Phase B — Source truth extraction

Process each authoritative source page independently before layout work.

### 6.1 Establish page boundary

- identify the true page rectangle;
- ignore accidental neighboring-page content;
- normalize orientation/perspective only as a coordinate aid;
- keep original photo available for visual verification;
- do not promote handwriting/student answers to printed source content.

### 6.2 Build a fixed coordinate space

Use one stable source coordinate system per source family.

Earth reference uses:

- width: 910
- height: 1270
- 10 columns, x step 91
- 10 rows, y step 127

Other subjects may use a different normalized canvas if their authoritative source requires it, but the canvas must remain stable throughout extraction, rendering, and QA.

### 6.3 Inventory every publisher-printed object

At minimum classify:

- prompt;
- blank;
- label;
- heading;
- formula/equation;
- table;
- graph;
- graph axis/tick/legend;
- diagram;
- illustration;
- figure-safe teaching region;
- box/background container;
- connector/arrow/line;
- decorative-only object, if truly non-educational.

Do not silently drop small labels, arrows, lines, axis text, legends, or diagram annotations.

### 6.4 Record source geometry

For each object record:

- source page;
- source object ID;
- x;
- y;
- width;
- height;
- role;
- source cluster;
- visual owner;
- confidence;
- whether geometry is source-measured or inferred.

When a grid exists, use it to locate and report corrections instead of vague visual descriptions.

## 7. Canonical inventory schema

Each subject must maintain an auditable inventory equivalent to:

```js
{
  id,
  sourcePage,
  type,
  printedText,
  canonicalQuestionId,
  sourceNumbers,
  parentConcept,
  sourceCluster,
  sourceRect: { x, y, width, height },
  renderRect,
  visualOwner,
  blankOwner,
  graphicOwner,
  semanticFunction,
  interactionRole,
  rendered,
  validated
}
```

For connectors:

```js
{
  id,
  sourcePage,
  from,
  to,
  relation,
  reason,
  sourceVisible,
  tracedPath,
  rendered,
  validated
}
```

For figures:

```js
{
  id,
  sourcePage,
  owner,
  sourceRect,
  safeTeachingRect,
  renderer,
  essentialComponents,
  sourceRequired,
  rendered,
  validated
}
```

## 8. Canonical-content rules

1. Every canonical learning item appears exactly once unless intentional repetition is visible in the source.
2. A visible printed number does not by itself create a new canonical item.
3. Preserve exact publisher wording and meaningful context.
4. Preserve blank count and blank grouping.
5. Preserve source line breaks when they carry layout/ownership meaning.
6. Do not turn filled handwritten answers into static prompt text.
7. Do not leak Learn answers into Recall static labels.
8. Do not paraphrase, simplify, merge, delete, or invent educational content to make layout easier.
9. If source interpretation is uncertain, mark uncertainty; do not fabricate certainty.

## 9. Blank ownership

For every blank determine:

- canonical owner;
- visual owner;
- before/after/under/inside/beside relationship;
- source width/height;
- grouping with adjacent blanks;
- whether the blank lives inside a figure/table/process;
- answer-reveal growth behavior.

Never rearrange source-significant blanks solely for neatness.

Recall and Learn mode must both be measured because an answer can be wider than the blank and create a collision not present in Recall.

## 10. Semantic reconstruction

Before layout, build the semantic model.

For each concept/object ask:

- What does this teach/test?
- What is its parent concept?
- Which items are siblings?
- Which facts/questions form one coherent cluster?
- Does a figure explain this item, or merely sit near it?
- Is a relationship causal, sequential, hierarchical, comparative, spatial, classificatory, or transformational?
- Why is this object here?

A cluster is valid only when a student can understand why its members belong together.

Do not cluster based on empty space.

## 11. Graphics and figure fidelity

Graphics are semantic content when they teach.

For every meaningful figure:

1. identify why it exists;
2. identify essential visual components;
3. record its source teaching/safe region;
4. use a dedicated source-faithful renderer when a generic renderer would alter the meaning;
5. preserve relation to nearby prompts/blanks;
6. keep text/questions out of the teaching area unless the source itself embeds them there;
7. reject generic decorative substitution.

Examples of valid subject-specific instructional graphics:

- Biology: cell/anatomy/process/pathway/phylogeny;
- Chemistry: molecular structure/reaction flow/apparatus/orbital relation;
- Physics: vectors/free-body/rays/circuits/waves/graphs;
- Mathematics: geometry/coordinate systems/functions/transformations;
- History: chronology/causal chains/geographic relations;
- Geography: maps/climate/terrain/flows.

Do not introduce cartoon students, teachers, animals, mascots, anime people, decorative faces, or random AI-generated characters.

## 12. Connector policy

Maintain two concepts separately:

### Semantic edge

Used internally to represent meaning and validate clustering.

### Rendered connector

A visible line/arrow on the mind map.

For source-faithful pages, render a connector only when the current authoritative source visibly shows it.

Every rendered connector must have:

- from;
- to;
- relationship;
- reason;
- traced path;
- clear endpoints.

Route through:

1. whitespace corridor;
2. outside cluster boundary;
3. orthogonal path;
4. curved path around obstacles;
5. cluster reflow if no safe route exists.

Reject:

- dangling lines;
- unexplained lines;
- connectors to empty space;
- connectors through unrelated text/blanks/figures;
- arrowheads on text;
- semantic-only lines not authorized by the visual-source contract.

## 13. Single visual owner

A printed object may not simultaneously exist as multiple visible implementations such as:

- legacy HTML;
- source SVG text;
- CSS pseudo-element;
- prompt-renderer text;
- correction/refinement overlay;
- duplicate figure label.

When a legacy renderer conflicts with source-owned output, consolidate ownership rather than stacking another patch.

Z-index is not a geometry fix.

## 14. Layout algorithm

Layout begins only after inventory, ownership, and semantic grouping are stable.

Priority order:

1. semantic correctness;
2. source fidelity;
3. readability;
4. complete visibility;
5. logical grouping;
6. relationship clarity;
7. spatial balance;
8. aesthetics.

For source reconstruction:

- use source-local coordinates for dense child structures;
- use explicit parent rectangles;
- move whole semantic/source clusters when possible;
- fine-tune individual children only after cluster placement is correct;
- do not solve a source mismatch with endless one-pixel patches if the parent coordinate system is wrong.

## 15. Text containment

For every text container enforce a positive padding margin:

```text
textLeft   >= boxLeft + padding
textRight  <= boxRight - padding
textTop    >= boxTop + padding
textBottom <= boxBottom - padding
```

If content does not fit, repair in this order:

1. correct bad source/local coordinates;
2. increase container width;
3. increase container height;
4. move/reflow neighboring cluster;
5. wrap intelligently;
6. slightly reduce excess padding;
7. reduce font only as a final, still-readable fallback.

Micro-font is a QA failure, not a solution.

## 16. Collision model

For unrelated rectangles A and B:

```text
overlapX = min(A.right, B.right) - max(A.left, B.left)
overlapY = min(A.bottom, B.bottom) - max(A.top, B.top)
collision = overlapX > tolerance && overlapY > tolerance
```

At minimum detect:

- text/text;
- text/blank;
- text/connector;
- text/graph;
- text/figure;
- blank/blank;
- blank/connector;
- blank/figure;
- graph/label;
- figure/figure;
- cluster/cluster;
- container-child containment;
- clipping/overflow.

Use real line rectangles (`Range.getClientRects()` or equivalent), not only coarse element boxes, when text lines matter.

Sample connector/graph paths against protected rectangles when line crossings are possible.

Do not weaken tolerances/allowlists to make the report green.

## 17. Grid-based debugging

Use the normalized source grid as an engineering coordinate system.

Every visual issue report should identify:

- page/view;
- grid region or source rectangle;
- affected IDs;
- failure class;
- root cause;
- correction;
- recheck status.

Example:

```text
Page: 248 Learn
Region: C4–E6
Problem: q18 answer intersects source figure safe area
Affected: q18, p248-crustsection
Root cause: child uses page-global y inside a source-local parent
Fix: convert q18 to parent-local y and move parent cluster 18 px down
Recheck: required in Recall + Learn + neighboring cluster
```

## 18. Programmatic QA gates

### Content gate

Require:

- canonical count equals expected count;
- unique canonical count equals expected count;
- registered/rendered count equals expected count;
- missing = 0;
- duplicates = 0;
- orphan learning items = 0;
- page/cluster ownership mismatches = 0;
- phantom/invented items = 0.

### Figure gate

Require:

- expected source figure count equals model count;
- missing source figures = 0;
- invented/unverified source figures = 0;
- missing dedicated renderers for required figures = 0;
- orphan figure ownership = 0.

### Geometry gate

Require:

- text outside container = 0;
- text/text collision = 0;
- text/blank collision = 0;
- text/connector collision = 0;
- text/figure collision = 0;
- text/graph collision = 0;
- blank/connector collision = 0;
- blank/figure collision = 0;
- unintended figure/figure collision = 0;
- cluster collision = 0;
- containment violation = 0;
- clipping/overflow = 0.

### Typography gate

Require:

- micro-font violations = 0;
- invisible text = 0;
- clipped text = 0;
- truncated equation = 0.

### Connector gate

Require:

- connector through protected content = 0;
- dangling connector = 0;
- meaningless connector = 0;
- incorrect endpoint = 0;
- unauthorized semantic-only visible connector = 0.

### Ownership gate

Require:

- duplicate visual owner = 0;
- wrong parent = 0;
- orphan blank = 0;
- orphan label = 0;
- orphan figure = 0.

## 19. Browser screenshot QA

Browser rendering is the truth.

For every completed view:

1. render in the actual product browser route;
2. wait for fonts and layout stabilization;
3. capture the source-space page at stable scale;
4. capture geometry evidence before assertions abort the run;
5. compare authoritative source vs render;
6. create a 50% overlay/difference view where useful;
7. inspect with grid overlay;
8. record exact defects;
9. fix;
10. rerender and recheck.

Earth reference captured every source page in both Recall and Learn modes and persisted geometry JSON even when a later gate failed.

## 20. Viewport QA

At minimum inspect:

- desktop;
- laptop-sized viewport when product behavior differs;
- tablet/iPad;
- phone.

Check:

- clipping;
- accidental scale collapse;
- readability;
- overflow;
- zoom/pan behavior;
- connector distortion;
- blank distortion;
- cluster collapse;
- navigation obstruction.

Do not “fix” mobile by shrinking the entire map until text is unreadable. Preserve legibility and allow appropriate exploration/scrolling if the product design calls for it.

## 21. Human-reading simulation

After programmatic checks, evaluate the rendered map as a student:

- Are the major concepts obvious?
- Is the reading path understandable?
- Can I tell why items are grouped?
- Can I tell which blank belongs to which prompt?
- Are arrows/lines unambiguous?
- Is any text hard to read?
- Is any sentence mentally reconstructed because part is hidden?
- Are diagrams educationally useful?
- Is any object decorative without teaching purpose?
- Is there any item where I would ask “why is this here?”
- Would another conceptual position be more correct?
- Does the result feel like a knowledge structure rather than random boxes?

A human-reading defect requires another iteration even if collision counters are zero.

## 22. Subject-specific semantic QA

### Biology

Check hierarchy/classification, process order, anatomy/spatial relationships, mechanism arrows, structure-function correspondence.

### Chemistry

Check reactions, equation readability, structure-label ownership, conditions/catalysts, apparatus sequence, molecular relationships.

### Physics

Check vectors/directions, formula conditions, free-body coherence, circuit connectivity, graph axes and physical meaning.

### Mathematics

Check formula assumptions, transformation sequence, geometric truth, axes/domains, example-rule ownership.

### History

Check chronology vs causality, people/event context, comparison groups, geography when relevant.

### Geography

Check map/spatial relationships, scale/direction, climate/terrain/process relationships, flow direction.

Adapt equivalent semantic checks for any additional subject.

## 23. No page-index artifacts

Final knowledge maps must not add artificial content such as:

- Page 1 / Page 2;
- source page numbers as navigation cards;
- “Question 1 / Question 2” wrappers;
- chapter-index cards;
- numbered textbook-page containers;

unless the exact label is educational source content.

Source page IDs may remain in non-visible metadata/debug attributes for traceability.

## 24. Root-cause fixing

Classify a defect before editing.

Typical causes:

- wrong source coordinate;
- wrong parent/local coordinate system;
- wrong ownership;
- wrong cluster membership;
- duplicate renderer;
- container too small;
- bad line wrapping;
- font metric change;
- answer reveal wider than Recall blank;
- connector routing error;
- source scaling mismatch;
- inaccurate bounding-box logic;
- responsive CSS distortion;
- wrong diagram dimensions.

Fix the root cause instead of accumulating patches.

## 25. Required detect-to-regression loop

```text
DETECT
  ↓
LOCATE
  ↓
DIAGNOSE ROOT CAUSE
  ↓
FIX
  ↓
RERENDER
  ↓
RECHECK SAME REGION
  ↓
CHECK NEIGHBORING REGIONS
  ↓
RUN REGRESSION
```

Never stop at DETECT → FIX.

## 26. Eight-pass acceptance sequence

Every subject must pass, in order:

1. source fidelity;
2. structural/ownership validation;
3. geometry validation;
4. real-browser visual QA;
5. grid inspection;
6. student-reading simulation;
7. subject-semantic validation;
8. regression validation.

## 27. Required subject status report

```text
SUBJECT
Source authority: ...
Canonical items: X
Rendered: X
Missing: X
Duplicates: X
Wrong parent: X
Orphan blanks: X
Orphan figures: X
Layout collisions: X
Visibility violations: X
Connector violations: X
Duplicate visual owners: X
Semantic issues: X
Human-reading issues: X
Viewport regressions: X
Status: NOT READY / READY
```

Do not report “almost done”, “mostly fixed”, or “looks good” as acceptance evidence.

## 28. Strict completion contract

A subject is READY only when all relevant counters are zero:

- missing canonical content;
- duplicate canonical content;
- wrong-parent content;
- orphan blanks/figures/diagrams;
- text outside containers;
- accidental text/text, text/blank, text/figure, text/graph, blank/figure collisions;
- micro-font;
- clipped/hidden text;
- hidden figures/graphics;
- meaningless/dangling connectors;
- connectors covering educational content;
- unauthorized visible connectors;
- duplicate visual ownership;
- artificial page-index artifacts;
- unnecessary cartoon/AI characters;
- unexplained cluster placement;
- major human-reading issues;
- subject-semantic teaching errors.

The target is zero, not “close enough”.

## 29. Anti-cheating rules

Never make QA pass by:

- deleting difficult content;
- hiding content with CSS;
- reducing opacity;
- misclassifying educational objects as decorative;
- shrinking text until collisions disappear;
- excluding failures from the checker without source evidence;
- increasing tolerances until failures disappear;
- moving content outside the checked region;
- deleting meaningful source connectors;
- changing canonical source truth;
- checking only clean pages;
- ignoring difficult viewports;
- disabling a failing test.

## 30. Production safety

- inspect branch state before editing;
- preserve known-good production;
- work on a dedicated branch for unfinished reconstruction;
- do not merge incomplete source reconstruction;
- do not overwrite canonical source truth;
- do not regenerate clean areas without evidence;
- rerun relevant Wrongbook regressions before merge;
- verify deployed/browser state after merge only when all gates pass.

## 31. Reusable implementation mapping

The Earth implementation should be treated as a pattern, not copied file-for-file into every subject.

Conceptual mapping:

```text
SOURCE PACK
  → source authority manifest
  → normalized page + grid
  → canonical prompt/object inventory
  → source hierarchy / visual ownership
  → semantic reasoning graph
  → source-visible connector graph
  → dedicated instructional figure renderers
  → source-local layout
  → Recall/Learn renderer
  → content/ownership validators
  → geometry/collision gate
  → browser capture + E2E
  → mobile/tablet audit
  → student/semantic QA
  → regression gate
```

Reuse existing Wrongbook infrastructure where it already satisfies these roles. Do not create a parallel renderer merely because a new subject is being added.

## 32. Execution protocol for a new subject

For each new subject, execute exactly this sequence:

1. locate and declare source authority;
2. freeze a source version/manifest;
3. inventory source pages/images;
4. normalize source coordinate space;
5. extract canonical learning items and all educational objects;
6. verify counts and ownership before layout;
7. build semantic clusters;
8. assign blank ownership;
9. assign graphic ownership;
10. record source-visible connectors separately from semantic edges;
11. preserve good existing renderer components only where source-faithful;
12. implement source-local layout/figures;
13. run content/ownership gate;
14. run geometry gate in Recall;
15. run geometry gate in Learn;
16. capture real-browser screenshots;
17. compare source | render | overlay using grid;
18. fix by root cause;
19. rerun same region, neighbors, and regression;
20. inspect desktop/tablet/phone behavior;
21. perform student-reading simulation;
22. perform subject-semantic QA;
23. report measurable counters;
24. mark READY only when strict counters are zero.

## 33. Final decision rule

At every placement ask:

> Why is this element here?

Acceptable answer:

> Because this source object belongs to this canonical item/concept, its blank/figure/label has this owner, and its source or authorized knowledge-map relationship requires this placement.

Unacceptable answer:

> Because there was empty space.

Correctness, source fidelity, visibility, and teaching meaning always come before decoration.
