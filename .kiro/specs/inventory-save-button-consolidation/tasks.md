# Implementation Plan

## Overview

This task list follows the exploratory bugfix workflow for the inventory save button consolidation.
Tasks are ordered to: (1) explore the bug with tests before touching the code, (2) lock down
preservation behaviour, (3) implement the fix, and (4) validate everything passes.

## Task Dependency Graph

```json
{
  "waves": [
    { "wave": 1, "tasks": ["1", "2"] },
    { "wave": 2, "tasks": ["3"] },
    { "wave": 3, "tasks": ["4"] }
  ]
}
```

## Tasks

- [ ] 1. Write bug condition exploration test
  - **Property 1: Bug Condition** – Consolidated Save Controls Present When Edits Are Pending
  - **CRITICAL**: This test MUST FAIL on unfixed code — failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior — it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate per-row Save buttons are rendered instead of consolidated controls
  - **Scoped PBT Approach**: Scope the property to the concrete failing case — render `AdminInventoryContent` with a two-product mock, simulate editing the price field of product 1, then assert the following (all assertions will FAIL on unfixed code):
    - A "Save all changes" button is present in the header
    - No per-row Save button exists anywhere in the table body
    - An amber unsaved-changes banner is rendered
    - A sticky bottom save bar is rendered inside the table container
    - The header button label includes the dirty-row count "(1)"
  - Also test a two-row-edit variant: edit both products → assert the count reads "(2)"
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests FAIL (this is correct — it proves the bug exists)
  - Document counterexamples found (e.g., "per-row Save button found at row index 0; header 'Save all changes' button absent")
  - Mark task complete when tests are written, run, and failure is documented
  - _Requirements: 1.1, 1.2, 1.3_

- [ ] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** – Non-Edit Interactions Remain Unchanged
  - **IMPORTANT**: Follow observation-first methodology
  - Observe the following on UNFIXED code and record actual outputs:
    - `buildInitial(products)` produces a map with the same number of entries as the input array
    - After editing a field and clicking Discard, `edits` equals `original`
    - Products with `stock_quantity === 0` render the red "Out" indicator
    - Products with `0 < stock_quantity <= low_stock_threshold` render the amber "Low" indicator
    - Toggling `is_active` flips the Eye/EyeOff icon without issuing a save call
    - Selecting a category filter pill narrows rendered rows to that category only
    - Clicking Refresh calls `DataService.getAllProducts` again
  - Write property-based tests using the observed behavior patterns from the Preservation Requirements in design.md:
    - Generate random arrays of products; verify `buildInitial` map key count equals input array length
    - Generate random edit mutations; verify `dirtyIds` set equals the set of mutated product IDs
    - For any product with `stock_quantity === 0`, verify "Out" badge is rendered regardless of other edits
    - For any product with stock in `(0, low_stock_threshold]`, verify "Low" badge is rendered
    - For any non-edit interaction (filter change, Discard, Refresh), verify no `DataService.updateProduct` call is made
  - Verify all tests PASS on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

- [ ] 3. Fix – Consolidate per-row Save buttons into a single batched Save action

  - [ ] 3.1 Remove per-row Save buttons and add `dirtyIds` derivation
    - Delete the row-level `<Button>Save</Button>` element and any `saveSingle` handler from the `TableRow` map in `AdminInventoryContent`
    - Ensure `dirtyIds` is derived as `products.map(p => p.id).filter(id => edits[id] && original[id] && rowKey(edits[id]) !== rowKey(original[id]))`
    - Confirm no Save button remains inside the `<TableBody>` after this change
    - _Bug_Condition: isBugCondition(uiState) — dirtyIds.length > 0 AND per-row Save buttons rendered_
    - _Expected_Behavior: "Save all changes" header button, banner, and sticky bar rendered; no per-row Save buttons_
    - _Preservation: Inline editing, stock alerts, category filter, Discard, Refresh all unaffected_
    - _Requirements: 2.1, 2.3_

  - [ ] 3.2 Add consolidated "Save all changes" header button
    - Render a `<Button onClick={saveAll}>` in the page header area (flex row with Refresh)
    - Disable the button when `dirtyIds.length === 0` or `saving === true`
    - Show label `"Save all changes (N)"` when `dirtyIds.length > 0`, plain `"Save all changes"` otherwise
    - Include a `<Save className="w-4 h-4" />` icon prefix and show `"Saving…"` text while `saving`
    - _Requirements: 2.1, 2.3_

  - [ ] 3.3 Add unsaved-changes banner
    - Render an amber `AlertTriangle` banner below the header when `dirtyIds.length > 0 && !saving`
    - Banner text: "You have unsaved changes on **N product(s)**. Click **Save all changes** to apply them."
    - Banner must disappear when `dirtyIds.length === 0` (after save or discard)
    - _Requirements: 2.2_

  - [ ] 3.4 Add sticky bottom save bar inside table container
    - Render a `sticky bottom-0` bar inside the `<div>` that wraps `<Table>`, visible only when `dirtyIds.length > 0`
    - Bar must contain: dirty-count label, "Discard all" ghost button (calls `discardAll`), "Save all (N)" primary button (calls `saveAll`)
    - _Requirements: 2.2, 2.3_

  - [ ] 3.5 Implement `saveAll()` batched save function
    - Guard: if `dirtyIds.length === 0`, show "Nothing to save" toast and return
    - Call `Promise.all(dirtyIds.map(id => DataService.updateProduct(id, {...})))` with the correct field mapping (price, stock_quantity, low_stock_threshold, is_market_price, market_note, is_active)
    - On success: show toast `"N product(s) saved"` and call `load()` to refresh `original`
    - On failure: show destructive toast with error message
    - Use `setSaving(true/false)` to disable controls during the operation
    - _Requirements: 2.3_

  - [ ] 3.6 Implement `discardAll()` function
    - Reset `edits` to `original` via `setEdits(original)`
    - Show a "Changes discarded" confirmation toast
    - _Requirements: 3.2_

  - [ ] 3.7 Add dirty-row visual indicators
    - Apply `bg-amber-50/40` background to `<TableRow>` when `isDirty === true`
    - Render an amber dot (`<span className="w-1.5 h-1.5 rounded-full bg-amber-400">`) next to the product name when `isDirty === true`
    - _Requirements: 2.1_

  - [ ] 3.8 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** – Consolidated Save Controls Present When Edits Are Pending
    - **IMPORTANT**: Re-run the SAME test from task 1 — do NOT write a new test
    - The test from task 1 encodes the expected behavior
    - When this test passes it confirms the consolidated-save UI is correctly implemented
    - Run bug condition exploration test from step 1
    - **EXPECTED OUTCOME**: Tests PASS (confirms bug is fixed)
    - _Requirements: 2.1, 2.2, 2.3_

  - [ ] 3.9 Verify preservation tests still pass
    - **Property 2: Preservation** – Non-Edit Interactions Remain Unchanged
    - **IMPORTANT**: Re-run the SAME tests from task 2 — do NOT write new tests
    - Run all preservation property tests from step 2
    - **EXPECTED OUTCOME**: All tests PASS (confirms no regressions)
    - Confirm stock alerts, Discard, Refresh, filter, and visibility-toggle behaviours are all intact

- [ ] 4. Checkpoint – Ensure all tests pass
  - Run the full test suite; confirm zero failures
  - Manually verify the admin inventory page in the browser:
    - No per-row Save button is visible
    - Editing any field reveals the header "Save all changes (N)" button
    - The amber unsaved-changes banner appears
    - Scrolling down shows the sticky bottom save bar
    - Clicking "Save all changes" batches all edits and shows the correct toast
    - Clicking "Discard all" resets all rows and clears all indicators
    - Refreshing reloads fresh data and clears pending edits
  - Ask the user if any questions arise before marking complete

## Notes

- Write exploration tests (task 1) and preservation tests (task 2) **before** touching `AdminInventoryPage.tsx`.
- Run task 1 tests on UNFIXED code first — they must FAIL to confirm the bug exists.
- Run task 2 tests on UNFIXED code first — they must PASS to establish the preservation baseline.
- The `saveAll()` function uses `Promise.all` for a single atomic batch; do not reintroduce row-scoped save handlers.
- All three save entry-points (header button, banner CTA, sticky bar button) must invoke the same `saveAll()` function.
- After the fix, the sticky bottom save bar should only appear when `dirtyIds.length > 0` to avoid cluttering the UI.
