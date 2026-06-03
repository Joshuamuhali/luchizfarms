# Inventory Save Button Consolidation – Bugfix Design

## Overview

The admin inventory page previously rendered an individual Save button on every product row.
This design formalises the bug condition (the presence of per-row Save buttons), defines the
expected consolidated-save behaviour, hypothesises the root cause, and documents the testing
strategy for both fix-checking and preservation-checking.

The fix replaces per-row Save buttons with:
1. A single **"Save all changes (N)"** button in the page header.
2. An **unsaved-changes banner** that appears whenever dirty rows exist.
3. A **sticky bottom save bar** that floats above the table footer while changes are pending.

All three entry-points invoke the same `saveAll()` function, which batches every dirty row into
one `Promise.all` call and confirms success with a toast.

---

## Glossary

- **Bug_Condition (C)**: The condition that triggers the defect — the admin has edited one or more
  product fields and the UI renders a per-row Save button instead of a single consolidated control.
- **Property (P)**: The desired behaviour when edits are pending — all changes are batched behind a
  single "Save all changes" action; no individual row exposes its own Save button.
- **Preservation**: Existing read, filter, discard, refresh, stock-alert and visibility-toggle
  behaviours that must remain entirely unchanged after the fix is applied.
- **dirtyIds**: The derived list of product IDs whose current `edits` state differs from the
  `original` snapshot loaded from the server.
- **saveAll()**: The function in `AdminInventoryPage.tsx` that iterates `dirtyIds`, calls
  `DataService.updateProduct` for each, and reloads data on success.
- **discardAll()**: The function that resets `edits` to `original`, abandoning all pending changes.
- **EditRow**: The TypeScript interface that captures all editable fields for a single product row
  (`price`, `stock_quantity`, `low_stock_threshold`, `is_market_price`, `market_note`, `is_active`).

---

## Bug Details

### Bug Condition

The bug manifests whenever the admin edits any field on any product row.  In the defective
implementation each row renders its own Save button; clicking it saves only that one product,
leaving all other edited rows in an unsaved, unmarked state.  The consolidated UI controls
(header button, banner, sticky bar) are absent.

**Formal Specification:**

```
FUNCTION isBugCondition(uiState)
  INPUT:  uiState of type AdminInventoryUIState
            { edits: Record<string, EditRow>,
              original: Record<string, EditRow>,
              renderedControls: UIControlList }
  OUTPUT: boolean

  dirtyCount ← COUNT(id IN uiState.edits WHERE uiState.edits[id] ≠ uiState.original[id])

  RETURN dirtyCount > 0
         AND uiState.renderedControls CONTAINS per-row Save buttons
         AND uiState.renderedControls NOT CONTAINS "Save all changes" header button
         AND uiState.renderedControls NOT CONTAINS unsaved-changes banner
         AND uiState.renderedControls NOT CONTAINS sticky bottom save bar
END FUNCTION
```

### Examples

- Admin edits the price of "Tomatoes" → a Save button appears on that row only; no header button,
  no banner, no sticky bar. Clicking it saves only Tomatoes. (BUG)
- Admin edits price on "Tomatoes" and stock on "Cabbage" → two separate Save buttons; clicking one
  leaves the other row in an unindicated dirty state. (BUG)
- Admin edits any field → no consolidated count shown; admin cannot tell at a glance how many
  products have pending changes. (BUG)
- Admin loads page with no edits → no Save buttons of any kind visible. (NOT a bug — no dirty rows)

---

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- The full product list continues to load on page mount with all fields editable inline.
- "Discard" / "Discard all" resets every edited row back to the last-saved server values without
  saving anything.
- "Refresh" reloads all product data from the server and discards local pending edits.
- Out-of-stock products continue to be flagged red ("Out") in the stock quantity cell.
- Low-stock products (stock > 0 and stock ≤ low_stock_threshold) continue to be flagged amber ("Low").
- Toggling visibility immediately flips the Eye/EyeOff icon as a local pending change without
  auto-saving; the change only persists when "Save all changes" is explicitly clicked.
- Category filter pills continue to narrow the displayed rows without affecting `dirtyIds` tracking.

**Scope:**
All admin interactions that do NOT involve editing a product field (browsing, filtering, refreshing)
must be completely unaffected by this fix.  Mouse clicks on category filter pills, the Refresh
button, and Discard behave identically before and after the change.

---

## Hypothesized Root Cause

Based on the bug description and review of the source file, the most likely root issues in the
defective version are:

1. **Per-row Save button rendering**: The `TableRow` map renders a `<Button onClick={() => saveSingle(product.id)}>Save</Button>` element inside each row, making the save action row-scoped rather than global.

2. **No global dirty state aggregation**: Without a `dirtyIds` derived value, the UI has no way to
   count or display the number of pending changes across all rows simultaneously.

3. **No unsaved-changes banner**: The amber banner that warns the admin of pending changes is absent,
   so edits can be lost silently on navigation or refresh.

4. **No sticky bottom save bar**: There is no bottom-of-table floating bar providing a persistent
   call-to-action when the primary header button scrolls out of view.

5. **Partial-save semantics**: Saving row-by-row creates a window where some products are updated
   and others are not, leaving the catalogue in a temporarily inconsistent state.

---

## Correctness Properties

Property 1: Bug Condition – Consolidated Save Controls Rendered When Edits Are Pending

_For any_ admin inventory UI state where one or more product rows have been edited (dirtyIds.length > 0),
the fixed `AdminInventoryContent` component SHALL render a single "Save all changes" header button
(showing a dirty-row count), an unsaved-changes banner, and a sticky bottom save bar — and SHALL NOT
render per-row Save buttons.

**Validates: Requirements 2.1, 2.2, 2.3**

Property 2: Preservation – Non-Edit Interactions Remain Unchanged

_For any_ admin inventory UI state where the bug condition does NOT hold (no product fields have been
edited, or all edits have been discarded/saved), the fixed component SHALL produce exactly the same
rendered output and data behaviour as the original component — preserving inline editing, stock alerts,
category filtering, Discard, and Refresh functionality.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6**

---

## Fix Implementation

### Changes Required

**File:** `src/pages/admin/AdminInventoryPage.tsx`

**Component:** `AdminInventoryContent`

**Specific Changes:**

1. **Remove per-row Save buttons**: Delete the `<Button>Save</Button>` element and its
   `saveSingle` handler from the `TableRow` map entirely.

2. **Add `dirtyIds` derivation**: Compute `dirtyIds` as the list of product IDs whose
   serialised `edits` row differs from the serialised `original` row (using `rowKey()`).

3. **Add consolidated header button**: Render a `<Button onClick={saveAll}>` in the page
   header that is disabled when `dirtyIds.length === 0` and shows the count when dirty.

4. **Add unsaved-changes banner**: Render an amber `AlertTriangle` banner below the header
   when `dirtyIds.length > 0 && !saving`, prompting the admin to click "Save all changes".

5. **Add sticky bottom save bar**: Render a `sticky bottom-0` bar inside the table container
   when `dirtyIds.length > 0`, providing Discard-all and Save-all buttons that remain visible
   regardless of scroll position.

6. **Implement `saveAll()`**: Use `Promise.all(dirtyIds.map(...))` to batch all updates,
   then call `load()` to refresh from the server and reset `original`.

7. **Implement `discardAll()`**: Reset `edits` to `original` and show a confirmation toast.

8. **Mark dirty rows visually**: Add an amber dot indicator (`w-1.5 h-1.5 rounded-full bg-amber-400`)
   next to the product name and apply `bg-amber-50/40` row highlight to dirty rows.

---

## Testing Strategy

### Validation Approach

The testing strategy follows the four-phase bug-condition methodology:

1. **Explore** — Write tests against the UNFIXED code to surface per-row Save button presence
   and absence of consolidated controls. Observe failures to confirm the root cause.
2. **Preserve** — Write property-based tests that observe non-edit interactions on UNFIXED
   code, then verify those same tests pass on FIXED code (no regressions).
3. **Implement** — Apply the fix described above.
4. **Validate** — Re-run exploration tests (now expected to PASS) and preservation tests
   (still expected to PASS).

---

### Exploratory Bug Condition Checking

**Goal:** Surface counterexamples that demonstrate the bug BEFORE implementing the fix.
Confirm or refute the root cause analysis; if refuted, re-hypothesise.

**Test Plan:** Render `AdminInventoryContent` with a mocked `DataService` that returns a
small product list. Simulate editing a field in one row, then assert that:
- A "Save all changes" button is rendered in the header.
- No per-row Save button is rendered in the table body.
- An unsaved-changes banner is visible.
- A sticky bottom save bar is visible.

Run these tests on UNFIXED code — expect FAILURE on each assertion.

**Test Cases:**
1. **Single-row edit — header button**: Edit price of product A → assert header contains
   "Save all changes (1)". (will FAIL on unfixed code)
2. **Single-row edit — no per-row button**: Edit price of product A → assert no row-level
   Save button exists in the DOM. (will FAIL on unfixed code)
3. **Single-row edit — banner visible**: Edit any field → assert amber unsaved-changes
   banner is rendered. (will FAIL on unfixed code)
4. **Single-row edit — sticky bar visible**: Edit any field → assert sticky bottom save bar
   is rendered inside the table container. (will FAIL on unfixed code)
5. **Multi-row edit — count reflects all dirty rows**: Edit two products → assert header
   button label shows "(2)". (will FAIL on unfixed code)

**Expected Counterexamples:**
- Per-row Save buttons are found in the DOM when they should not exist.
- "Save all changes" button is absent from the header.
- Possible causes: save logic is row-scoped, no global `dirtyIds` derivation.

---

### Fix Checking

**Goal:** Verify that for all inputs where the bug condition holds, the fixed component
produces the expected consolidated-save UI.

**Pseudocode:**
```
FOR ALL uiState WHERE isBugCondition(uiState) DO
  render AdminInventoryContent with uiState
  ASSERT "Save all changes" header button IS rendered
  ASSERT per-row Save buttons ARE NOT rendered
  ASSERT unsaved-changes banner IS rendered
  ASSERT sticky bottom save bar IS rendered
END FOR
```

---

### Preservation Checking

**Goal:** Verify that for all inputs where the bug condition does NOT hold, the fixed
component behaves identically to the original.

**Pseudocode:**
```
FOR ALL uiState WHERE NOT isBugCondition(uiState) DO
  ASSERT original_render(uiState) = fixed_render(uiState)
END FOR
```

**Testing Approach:** Property-based testing is recommended because:
- It generates many combinations of product data and filter state automatically.
- It catches edge cases (empty catalogue, all products hidden, mixed stock levels).
- It provides strong guarantees that non-edit paths are unchanged.

**Test Plan:** Observe each preservation behaviour on UNFIXED code, capture expected
outputs, then write property-based tests asserting those outputs hold after the fix.

**Test Cases:**
1. **Stock-alert preservation**: For any product with `stock_quantity === 0`, verify the
   "Out" red indicator is still rendered after the fix.
2. **Low-stock preservation**: For any product with `0 < stock_quantity <= low_stock_threshold`,
   verify the "Low" amber indicator is still rendered.
3. **Discard preservation**: After editing fields and clicking Discard, verify `edits`
   equals `original` and the dirty-indicator dot is absent.
4. **Refresh preservation**: After clicking Refresh, verify `DataService.getAllProducts`
   is called and the table re-renders with fresh data.
5. **Visibility toggle preservation**: Toggle `is_active` on a product; verify the
   Eye/EyeOff icon flips immediately without triggering a save.
6. **Category filter preservation**: Select a non-"all" category; verify only products
   matching that category are rendered.

---

### Unit Tests

- Test `buildInitial()` builds the correct `EditRow` map from a product array.
- Test `rowKey()` returns identical strings for identical rows and different strings for
  differing rows.
- Test `dirtyIds` derivation: zero dirty IDs on fresh load; correct IDs after mutations.
- Test `saveAll()` calls `DataService.updateProduct` exactly once per dirty ID.
- Test `discardAll()` resets `edits` to `original` without calling `DataService`.

### Property-Based Tests

- Generate random arrays of products; verify `buildInitial` produces a map with the same
  key count as the input array.
- Generate random edit mutations; verify `dirtyIds` always equals the set of mutated IDs.
- Generate random subsets of products to mark dirty; verify `saveAll` issues exactly that
  many `updateProduct` calls.
- Generate random product lists; verify no per-row Save button appears in the rendered DOM
  regardless of which fields are edited (post-fix).

### Integration Tests

- Full flow: load → edit multiple rows → click "Save all changes" → verify toast shows
  correct count → verify `original` updated → verify dirty indicators cleared.
- Full flow: load → edit rows → click "Discard all" in sticky bar → verify all rows
  revert → verify banner and sticky bar disappear.
- Full flow: load → edit rows → click Refresh → verify edits are wiped and fresh data loads.
