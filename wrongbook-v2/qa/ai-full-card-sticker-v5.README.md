# AI full-card sticker V5 QA

Regression target: the visible AI diagram card is one draggable object. For worksheet overlays this is `.v9-sheet-ai-card`, which contains the V8 diagram plus `.v9-sheet-key-concepts` footer chips.

The old V4 runtime must not bind the nested `.v8-ai-diagram`. `ai-diagram-scope-guard-v2.js` blocks V4 and boots V3 then V5. V3 marks the outer card with `data-wb-ai-sticker-scope="full"`; V5 captures pointerdown on that outer card so header, diagram, footer text/chips, border and background move together.

Static gate: `node qa/ai-full-card-sticker-v5.mjs`.
