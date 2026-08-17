# Wrongbook Mind Map — Clearnote Research Enrichment

Updated: 2026-08-17
Status: secondary-reference and content-repair layer for `MIND_MAP_MAKING_SKILL.md`

## 1. Why this layer exists

Earth Science taught the project how to reconstruct a source faithfully. Clearnote adds a different lesson: strong student notes reveal **how students naturally compress, compare, sequence, and spatially arrange knowledge**.

Clearnote is useful for:

- arrangement patterns;
- common exam-review groupings;
- high-frequency comparison axes;
- candidate omissions worth checking;
- student-friendly terminology;
- examples of what learners tend to put together on one page.

Clearnote is **not** authoritative for factual truth. Public student notes can contain mistakes, outdated syllabus assumptions, Simplified Chinese terminology, OCR ambiguity, handwriting ambiguity, and author-specific shortcuts.

Therefore:

> Use Clearnote to discover candidate structure and candidate content. Use official curriculum / authoritative subject references to decide what is true and what belongs in Wrongbook.

## 2. Source hierarchy

For non-Earth subjects use this hierarchy whenever sources disagree:

1. **Current user-designated source pack** (when the user explicitly supplies textbook/photos and says it is source truth)
2. **Official Taiwan curriculum / NAER 108 curriculum scope**
3. **Existing verified Wrongbook canonical curriculum data**
4. **Authoritative subject references** (official educational materials, standard scientific/mathematical definitions, primary historical/government sources when needed)
5. **Multiple mutually consistent high-quality study references**
6. **Clearnote / public student notes**
7. **Model inference from ambiguous handwriting/OCR**

Levels 6–7 can suggest a correction or supplement, but cannot override levels 1–4 without verification.

## 3. What Clearnote research showed

The senior-high collection contains tens of thousands of public notes across Chinese, English, mathematics, physics, chemistry, biology, Earth Science, history, civics and other areas. Popular notes repeatedly use the following information shapes:

- **tree / hierarchy** for literary knowledge, classification, grammar, taxonomy;
- **timeline** for history and developmental sequences;
- **comparison table / parallel columns** for government systems, biological distinctions, chemistry categories, grammar contrasts;
- **central diagram with local labels** for cells, anatomy, geography, physics, chemistry structure;
- **formula family around one visual** for mathematics and physics;
- **process flow** for metabolism, reactions, legal procedures, causal chains;
- **map + annotations** for geography/history;
- **one-page concept bundles** combining definition, condition, example, exception, common trap and related fact.

The research also shows why public notes require verification. Some Clearnote pages explicitly contain user corrections or author warnings about errors. Treat popularity as a signal of usefulness, not correctness.

## 4. Traditional Chinese / Taiwan terminology normalization

All final Wrongbook content must use Traditional Chinese and Taiwan senior-high terminology.

### 4.1 Never do blind character conversion only

Blind Simplified → Traditional conversion can preserve a Mainland term that is still wrong for Taiwan textbooks. Normalize **concept terminology**, not just characters.

Examples:

| Incoming / Mainland-style term | Wrongbook Taiwan term |
| --- | --- |
| 线粒体 / 線粒體 | 粒線體 |
| 高尔基体 / 高爾基體 | 高基氏體 |
| 酶 | 酵素 |
| 概率 | 機率 |
| 种群 / 種群 | 族群 |
| 群落 | 群集 |
| 生境 | 棲地 |
| 质粒 / 質粒 | 質體 |
| 矢量 | 向量 |
| 势能 / 勢能 | 位能 |
| 电势 / 電勢 | 電位 |
| 摩尔 / 摩爾 | 莫耳 |
| 数据 / 數據 | 資料 (unless a context specifically requires numerical data wording) |
| 视频 / 視頻 | 影片 |
| 信息 | 資訊 |

### 4.2 Ambiguous handwriting / OCR protocol

When a source word cannot be read:

1. inspect surrounding heading, arrows, diagram and neighboring facts;
2. infer the semantic slot (e.g. organelle, process, date, formula variable, institution);
3. generate candidate readings;
4. check candidate against current Taiwan curriculum terminology;
5. verify factual compatibility with authoritative reference;
6. accept only if confidence is high and context is uniquely consistent;
7. otherwise mark `needs_source_review` instead of inventing text.

Never turn uncertainty into a confident canonical fact just because the blank can be filled plausibly.

## 5. Factual-repair protocol

Every candidate fact from a public note receives one of four states:

```text
VERIFIED          authoritative support found
CORRECTED         source note is wrong; corrected version verified
CONTEXT_REPAIRED  handwriting/OCR fragment reconstructed from unique context and verified
REJECTED          unsupported, obsolete, misleading, or not in intended scope
```

For each correction retain provenance internally:

```js
{
  candidate,
  sourceType: 'clearnote',
  state: 'CORRECTED',
  correction,
  reason,
  authority,
  confidence
}
```

Do not silently preserve a wrong note because it is popular.

## 6. Supplement policy

A supplement is added only when it improves understanding or exam transfer without bloating the map.

Good supplements answer one of these questions:

- What is this commonly confused with?
- Under what condition is this rule true?
- What is the important exception?
- What diagram makes the relation obvious?
- What is the cause → mechanism → result chain?
- What changes if a variable/direction/condition changes?
- What historical consequence or continuity matters?
- What linguistic example distinguishes two forms?
- What graph slope/area/unit/axis interpretation is commonly tested?
- What source evidence supports the conclusion?

Reject supplements that are merely trivia, duplicate the prompt, or exist only to fill whitespace.

## 7. Subject-specific arrangement grammar

### Chinese / 國文

Preferred structures:

- text / article → author & context → structure → theme → key sentences → rhetoric → word meanings → related literary knowledge;
- tree for author/genre/literary knowledge;
- parallel comparison for schools, rhetoric, word meanings, viewpoints;
- flow for article argument/narrative structure.

Useful supplements:

- form/meaning distinctions;
- key textual evidence;
- frequently confused word meanings;
- author/work comparison;
- rhetoric function, not merely rhetoric name.

Avoid: decoration around prose with no relation to the text.

### English / 英文

Preferred structures:

- grammar form → meaning → usage condition → example → contrast → common error;
- vocabulary clusters by meaning/collocation rather than alphabetical dumps;
- comparison layout for tense, voice, clause, participle, inversion, hypothetical constructions;
- flow for paragraph/writing organization.

Useful supplements:

- collocation;
- register;
- near-synonym distinction;
- representative example;
- common learner error.

### Mathematics / 數學

Preferred structures:

- concept/figure in center;
- formula family grouped by shared condition;
- domain/assumption next to formula;
- graphical/algebraic/geometric representations connected semantically;
- comparison panels for similar formulas or cases.

Useful supplements:

- domain / validity conditions;
- equivalent forms;
- graph interpretation;
- common sign/branch mistakes;
- counterexample when a tempting overgeneralization is false.

### Physics / 物理

Preferred structures:

- physical situation / diagram first;
- vector direction and sign convention adjacent to the relevant quantity;
- formula + units + graph + physical meaning as one cluster;
- flow for energy transfer or process;
- comparison for regimes/conditions.

Useful supplements:

- unit/dimension;
- slope/area meaning;
- limiting case;
- vector/scalar distinction;
- force/action pair distinction;
- conservation-law condition.

### Chemistry / 化學

Preferred structures:

- macroscopic observation ↔ particle model ↔ symbolic equation;
- reaction flow for sequences;
- comparison for acids/bases, bonding, intermolecular forces, oxidation states;
- structural diagram for atoms/molecules/apparatus;
- formula panel for stoichiometry/concentration/gas/energy relations.

Useful supplements:

- units and conditions;
- limiting reagent / excess logic where relevant;
- state symbols / reaction conditions;
- microscopic explanation of macroscopic observation;
- common terminology mismatch between Mainland and Taiwan materials.

### Biology / 生物

Preferred structures:

- biological structure at the center with functions positioned locally;
- process arrows for respiration, photosynthesis, cell cycle, gene expression and regulation;
- comparison for prokaryote/eukaryote, mitosis/meiosis, transport modes, inheritance patterns;
- hierarchy for classification/ecology.

Useful supplements:

- structure → function relationship;
- location of process;
- input/output;
- regulation;
- important exception;
- distinction between correlation and mechanism.

### History / 歷史

Preferred structures:

- chronology only when chronology is genuinely the organizing relation;
- background → trigger → actors → event → consequence → longer-term effect;
- parallel lanes for regions/states occurring at the same time;
- comparison for institutions, reforms, empires, movements;
- map when geography changes the historical explanation.

Useful supplements:

- causation vs coincidence;
- continuity/change;
- immediate vs long-term effect;
- primary actor/institution;
- date only when it anchors a meaningful sequence.

### Geography / 地理

Preferred structures:

- map/diagram as the spatial anchor;
- process flow for geomorphology, climate, hydrology;
- graph next to the phenomenon it represents;
- comparison for climate types, regions, population and industry patterns;
- scale/location explicitly represented.

Useful supplements:

- spatial scale;
- map projection/coordinate implications where relevant;
- process → pattern → consequence;
- graph axes/units;
- human–environment interaction.

### Civics / 公民與社會

Preferred structures:

- comparison matrix for government systems/institutions;
- actor → power/right → procedure → constraint → remedy;
- flow for legal/administrative procedures;
- market diagrams next to supply/demand concepts;
- hierarchy for law/institutions.

Useful supplements:

- who has the power/right;
- legal condition;
- procedure;
- check/balance;
- remedy;
- exception;
- Taiwan-specific institutional terminology.

## 8. Layout-selection rules implemented in renderer

The non-Earth renderer should choose semantic layout from content, not alternate styles by section index.

Supported layout intents:

```text
diagram     spatial/structural relation
flow        mechanism/process/causal chain
compare     parallel concepts or systems
timeline    verified chronological sequence
formula     equations + condition + representation
tree        hierarchy/classification/text structure
```

A layout is selected from subject + chapter/section semantics. The renderer must expose `data-v4tb-layout` so QA can confirm every section received a valid semantic layout.

## 9. Content-quality dimensions

Every enriched concept should aim to include the relevant dimensions below, not all dimensions mechanically:

```text
definition
condition
structure
function
mechanism
sequence
cause
effect
comparison
exception
example
representation
unit / axis / direction
common confusion
source evidence
```

“Thorough” means the concept has the dimensions needed to understand and retrieve it, not that every card contains maximum text.

## 10. Anti-copy / anti-noise rule

Do not copy a public note page wholesale into Wrongbook. Reconstruct knowledge from independently verified concepts and use the note only as a secondary signal for arrangement and likely omissions.

Do not inherit:

- decorative characters;
- personal mnemonics that do not generalize;
- outdated exam scope;
- author-specific abbreviations without explanation;
- unverified dates/formulas;
- Simplified/Mainland terminology;
- handwritten answers as canonical source text;
- page indexes or notebook-specific pagination.

## 11. QA additions

Cross-subject QA should also require:

- every section has one recognized semantic layout intent;
- no known banned Mainland terminology in rendered canonical text;
- no unresolved `needs_source_review` content is rendered as canonical;
- timeline layout is not used without sequence semantics;
- formula layout is not used as decoration when the section contains no quantitative/formal relation;
- comparison layout preserves all compared items without overlap;
- mobile reflow preserves the same ownership and reading order;
- all added supplements are source-verified or explicitly marked as derived explanation.

## 12. Final decision test

For every imported or supplemental fact ask:

1. **Why is this content here?**
2. **Where did it come from?**
3. **Is it correct in Taiwan high-school terminology/scope?**
4. **What does it add beyond the existing canonical point?**
5. **What visual structure best represents its actual relationship?**

If these cannot be answered, do not add it.
