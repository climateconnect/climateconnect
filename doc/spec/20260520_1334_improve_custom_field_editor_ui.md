# Improve Custom Field Editor UI for Event Registration Configuration

**Status**: DRAFT
**Type**: Feature (UI polish)
**Date and time created**: 2026-05-20 13:34
**GitHub Issue**: [#1998](https://github.com/climateconnect/climateconnect/issues/1998)
**Epic**: [`EPIC_event_registration.md`](./EPIC_event_registration.md)
**Related Specs**:
- [`20260416_1000_event_registration_custom_fields.md`](./20260416_1000_event_registration_custom_fields.md)
- [`20260519_1328_inventory_field_type_event_registration.md`](./20260519_1328_inventory_field_type_event_registration.md)

---

## Problem Statement

The create and edit flows for event registration configuration have three minor UI gaps that reduce usability:

1. **No visual icons for field types** — When an organiser adds a custom registration field, the "Add field" dropdown menu and the field header only show plain text labels ("Checkbox", "Single choice", "Inventory"). Adding icons would make the field types instantly recognisable and improve the visual polish of the editor.

2. **Inventory field form is cramped in the modal** — The `EditEventRegistrationModal` uses `maxWidth="sm"` (600px). The inventory field editor has three columns per option row (title, available amount, max per guest) plus action buttons. At 600px width the layout is tight, especially on the `md` breakpoint where the Grid columns compress. Widening the modal on desktop would give the inventory form room to breathe.

3. **No guidance that single-select and inventory fields limit guests to one option** — Organisers may not realise that for "Single choice" and "Inventory" field types, a guest can only pick one option. A short helper text in the footer of those field editors would set the right expectation. The German translation is "Gast kann nur eine Option wählen".

All three changes are **UI only** — no backend, API, or data model changes are needed.

**Core Requirements (User/Stakeholder Stated):**

1. Show icons for each custom field type in the "Add field" select menu and on the field form component header.
2. On desktop, make the edit registration modal wider so that the inventory field form fits better.
3. Add a helper text to single-select and inventory field types indicating that a guest can only choose one option (German: "Gast kann nur eine Option wählen"), displayed in the footer area of the field form component.

**Explicitly Out of Scope (this task):**

- Any backend or API changes.
- Changes to the registrant-side registration modal (`EventRegistrationModal.tsx`).
- Changes to the checkbox field editor (no single-option limitation applies).
- Changes to the `RegistrationFieldList` component beyond the icon additions.
- Any changes to field validation logic or data contracts.

### Non-Functional Requirements

- **No breaking changes** to existing UI behaviour or data flow.
- **Icons must be from `@mui/icons-material`** — use existing icon imports, no new icon library dependencies.
- **Modal widening must be responsive** — only widen on `md` and up breakpoints; mobile/tablet should keep the current width.
- **Helper text must be translatable** — add EN and DE text keys following the existing pattern in `project_texts.tsx`.
- **Accessibility** — icons in the menu items should have appropriate `aria-label` or be decorative with `aria-hidden`.

### AI Agent Insights and Additions

- **Icon choices** — Suggested MUI icons that match the field semantics:
  - **Checkbox** → `CheckBoxOutlineBlankIcon` or `CheckCircleOutlineIcon` (conveys a checkbox/toggle)
  - **Single choice (option_select)** → `RadioButtonUncheckedIcon` or `RadioIcon` (conveys a radio/single-select)
  - **Inventory** → `InventoryIcon` or `LocalOfferIcon` (conveys stock/items)
  The implementing agent should pick the most visually consistent set.

- **Where to add icons in `RegistrationFieldList.tsx`**:
  - **Add field menu** (lines 230–237): Each `<MenuItem>` currently renders plain text. Wrap the text in a `<Box>` or `<ListItem>` with an icon prefix.
  - **Field header** (lines 148–153): The `<Typography>` that shows the field type label should be preceded by an icon.

- **Modal widening in `EditEventRegistrationModal.tsx`**:
  - Line 344: `maxWidth="sm"` → change to `maxWidth="md"` (900px) or use a breakpoint-aware approach. The simplest change is `maxWidth="md"`, which is still reasonable for the form layout and gives the inventory grid more room.

- **Helper text placement**:
  - **`OptionSelectFieldEditor.tsx`**: Add a `<Typography>` with `variant="caption"` and `color="textSecondary"` after the options list (after line 153, before the "Add option" button or after it).
  - **`InventoryFieldEditor.tsx`**: Same pattern — add after the options list (after line 237, before or after the "Add option" button).
  - The text should be subtle (caption style) and only appear for these two field types.

- **Text keys to add in `project_texts.tsx`**:
  - `single_option_per_guest_notice` — EN: "Guests can only select one option", DE: "Gast kann nur eine Option wählen"

---

## Acceptance Criteria

- [ ] The "Add field" dropdown menu in `RegistrationFieldList` shows an icon next to each field type label (Checkbox, Single choice, Inventory).
- [ ] Each field's header in `RegistrationFieldList` shows an icon next to the field type label.
- [ ] The `EditEventRegistrationModal` is wider on desktop (at least `md` breakpoint), giving the inventory field form more horizontal space.
- [ ] The `OptionSelectFieldEditor` displays a helper text indicating that guests can only select one option.
- [ ] The `InventoryFieldEditor` displays the same helper text indicating that guests can only select one option.
- [ ] The helper text is translatable — both EN and DE text keys exist in `project_texts.tsx`.
- [ ] The `CheckboxFieldEditor` does **not** show the single-option helper text.
- [ ] All existing tests pass.
- [ ] `yarn lint` and `yarn format` pass with no errors.

---

## Files to Change

### Frontend

| File | Change |
|------|--------|
| `src/components/shareProject/RegistrationFieldList.tsx` | Add icons to the "Add field" menu items (lines 231–237) and to the field header label (lines 148–153) |
| `src/components/project/EditEventRegistrationModal.tsx` | Change `maxWidth="sm"` to `maxWidth="md"` on the Dialog (line 344) |
| `src/components/shareProject/OptionSelectFieldEditor.tsx` | Add helper text after the options list (after line 153) |
| `src/components/shareProject/InventoryFieldEditor.tsx` | Add helper text after the options list (after line 237) |
| `public/texts/project_texts.tsx` | Add `single_option_per_guest_notice` text key with EN and DE translations |

---

## Test Cases

### Frontend

| # | Scenario | Expected |
|---|----------|---------|
| 1 | Open "Add field" menu in create/edit event registration | Each menu item shows an icon next to the field type label |
| 2 | View a field card in the registration field list | Field header shows an icon next to the type label |
| 3 | Open edit registration modal on desktop (≥900px viewport) | Modal is wider than before (md width), inventory form has more space |
| 4 | View an option-select field editor | Helper text "Guests can only select one option" is visible |
| 5 | View an inventory field editor | Helper text "Guests can only select one option" is visible |
| 6 | View a checkbox field editor | No single-option helper text is shown |
| 7 | Switch locale to German | Helper text displays "Gast kann nur eine Option wählen" |
| 8 | Existing unit tests for RegistrationFieldList, OptionSelectFieldEditor, InventoryFieldEditor | All pass without modification |

---

## Dependency Notes

- **No new dependencies** — icons come from the existing `@mui/icons-material` package.
- **No backend changes** — this is purely a frontend UI polish task.
- **No feature toggle changes** — the existing `REGISTRATION_CUSTOM_FIELDS` toggle already gates the entire custom field editor UI.

---

## Log

- 2026-05-20 13:34 — Task created from GitHub issue [#1998](https://github.com/climateconnect/climateconnect/issues/1998). Three UI-only improvements for the event registration custom field editor: icons for field types, wider modal on desktop, and helper text for single-option field types.
