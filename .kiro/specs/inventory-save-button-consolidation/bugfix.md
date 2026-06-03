# Bugfix Requirements Document

## Introduction

The inventory management section of the admin panel previously rendered an individual Save button on each product row. With a large product catalogue this creates a chaotic, error-prone workflow: admins must remember which rows they edited and click multiple buttons to persist changes, risking partial saves and inconsistent state. The fix consolidates all per-row save buttons into a single "Save all changes" control (plus a sticky bottom save bar) that batches every pending edit into one atomic operation.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN the admin edits one or more product fields in the inventory table THEN the system displays an individual Save button on each edited row, requiring a separate click per product to persist changes.

1.2 WHEN the admin edits multiple product rows without clicking each row's Save button THEN the system allows navigation or refresh to occur silently, causing unsaved edits to be lost with no consolidated warning.

1.3 WHEN the admin clicks a per-row Save button THEN the system saves only that single product, leaving other edited rows in an unsaved state with no indication of remaining pending changes.

### Expected Behavior (Correct)

2.1 WHEN the admin edits one or more product fields in the inventory table THEN the system SHALL track all changes in a pending-edits state and display a single "Save all changes" button in the page header (with a count of dirty rows) instead of per-row Save buttons.

2.2 WHEN the admin has pending edits and attempts to leave or refresh the page THEN the system SHALL display an unsaved-changes banner and a sticky bottom save bar alerting the admin that changes have not yet been persisted.

2.3 WHEN the admin clicks "Save all changes" THEN the system SHALL save all pending edits for all modified products in a single batched operation and confirm success with a toast notification showing the number of products saved.

### Unchanged Behavior (Regression Prevention)

3.1 WHEN the admin loads the inventory page with no edits pending THEN the system SHALL CONTINUE TO display the full product list with all fields (price, stock quantity, low-stock threshold, visibility) editable inline.

3.2 WHEN the admin edits product fields and then clicks "Discard" THEN the system SHALL CONTINUE TO reset all edited rows back to their last-saved values without persisting any changes.

3.3 WHEN stock quantity reaches zero for an active product THEN the system SHALL CONTINUE TO flag that product as "Out of stock" with a red indicator in the stock quantity cell.

3.4 WHEN stock quantity is above zero but at or below the low-stock threshold THEN the system SHALL CONTINUE TO flag that product as "Low stock" with an amber indicator in the stock quantity cell.

3.5 WHEN the admin toggles a product's visibility THEN the system SHALL CONTINUE TO reflect the new visibility state immediately in the row (Eye/EyeOff icon) as a pending change, without saving until "Save all changes" is clicked.

3.6 WHEN the admin clicks "Refresh" THEN the system SHALL CONTINUE TO reload the latest product data from the server, discarding any local pending edits.
