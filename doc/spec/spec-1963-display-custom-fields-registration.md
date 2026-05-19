---
title: Display Custom Fields of an Event Registration
version: 1.0
date_created: 2026-05-19
last_updated: 2026-05-19
owner: Climate Connect Engineering Team
tags: [design, feature, event-registration, custom-fields, admin, ui]
---

# Display Custom Fields of an Event Registration

**Status**: DRAFT  
**Type**: Feature Design  
**GitHub Issue**: [#1963](https://github.com/climateconnect/climateconnect/issues/1963)  
**Blocked by**: [#1960](https://github.com/climateconnect/climateconnect/issues/1960) — member registers with custom fields

## 1. Purpose & Scope

**Purpose**: Define the requirements and design for displaying custom field values submitted by event registrants in the project admin/organiser registration management interface.

**Scope**: 
- Admin/organiser view of event registrations
- Visual indicators showing when custom data is available
- Modal/detail view for displaying custom field answers
- Reusable component architecture for future user-facing views
- Support for Phase 4a field types (checkbox, single-select option)

**Out of Scope**:
- User-facing view of own answers (separate feature)
- Editing submitted answers by admins
- New field types beyond checkbox/single-select
- Export/reporting UI (issue #1962)
- Field editing after answers collected (issue #1961)

---

## 2. Definitions

| Term | Definition |
|------|-----------|
| Event | Project with `type="event"` and online registration enabled |
| Registration | `EventRegistration` record linking user to event |
| Custom Field | `RegistrationField` definition; types: `checkbox` or `option_select` |
| Field Answer | `RegistrationFieldAnswer` record storing one response |
| Data Indicator | Visual icon/badge showing custom data is present |
| Admin | Event organiser or team member with edit permissions |
| Registrant | User who submitted registration |

---

## 3. Requirements, Constraints & Guidelines

### Functional Requirements

- **REQ-001**: Admins must view custom field answers in registration management (backend admin + frontend).
- **REQ-002**: Display answers in dedicated modal/detail view (not inline in grid).
- **REQ-003**: Grid view displays visual indicator on registrations with custom field answers.
- **REQ-004**: Answers display in organiser-defined order (ascending `order` field).
- **REQ-005**: Checkbox fields show sanitized description HTML and boolean value.
- **REQ-006**: Option-select fields show field title and selected option title.
- **REQ-007**: Each answer includes field definition alongside submitted value.
- **REQ-008**: Registrations without answers don't show indicator.
- **REQ-009**: Detail modal includes registration metadata (user, email, timestamp) and close button.
- **REQ-010**: Component architecture supports reuse for future user-facing views.

### UI/UX Constraints

- **UXC-001**: Grid view space-limited; indicators must be compact (icon/badge, not text).
- **UXC-002**: Modal fully keyboard-accessible (WCAG 2.1 AA compliance).
- **UXC-003**: Modal responsive on mobile (320px) and tablet (768px) viewports.
- **UXC-004**: No horizontal scrolling; content adapts to viewport width.
- **UXC-005**: Rich HTML rendered safely without XSS risk; server-side sanitization assumed.
- **UXC-006**: Empty/missing answers shown consistently ("Not answered", "—", or placeholder).

### Performance Requirements

- **PERF-001**: No N+1 queries; answers must be pre-fetched or included in list endpoint.
- **PERF-002**: Modal loads quickly; data cached client-side for repeat opens.
- **PERF-003**: Grid with 100+ registrations remains performant; indicator rendering efficient.

### Feature Toggle & Gating

- **GATE-001**: All custom field display UI gated behind `REGISTRATION_CUSTOM_FIELDS` toggle.
- **GATE-002**: API changes backward-compatible; existing interfaces continue to work.

### Design Reusability

- **REUSE-001**: Separate display logic from modal orchestration.
- **REUSE-002**: Answer display component exportable for other contexts.
- **REUSE-003**: Use theme-aware Material-UI components for consistency.

---

## 4. Interfaces & Data Contracts

### Enhanced API Response

**Endpoint**: `GET /api/projects/{slug}/registrations/`

**Current Response**: Registration object with `id`, `user`, `registered_at`, etc.

**Enhanced Response** (with custom fields):
```json
{
  "id": 123,
  "user": { "id": 1, "username": "john", "email": "john@example.com" },
  "registered_at": "2026-05-15T10:30:00Z",
  "answers": [
    {
      "id": 456,
      "field": {
        "id": 10,
        "field_type": "checkbox",
        "order": 1,
        "is_required": true,
        "settings": { "description": "<p><strong>Dietary restrictions?</strong></p>" }
      },
      "value_boolean": true,
      "value_option": null
    },
    {
      "id": 457,
      "field": {
        "id": 11,
        "field_type": "option_select",
        "order": 2,
        "settings": { "title": "T-shirt size" }
      },
      "value_boolean": null,
      "value_option": { "id": 50, "title": "Large", "order": 1 }
    }
  ]
}
```

### Data Model Reference

**RegistrationField**:
- `id`, `registration_config` (FK), `field_type` (checkbox/option_select), `order`, `is_required`, `settings` (JSON), timestamps

**RegistrationFieldAnswer**:
- `id`, `registration` (FK), `field` (FK), `value_boolean` (nullable), `value_option` (FK, nullable), timestamps

**RegistrationFieldOption**:
- `id`, `field` (FK), `title`, `order`

---

## 5. Acceptance Criteria

- **AC-001**: Registrations with answers display visual indicator in grid.
- **AC-002**: Clicking indicator opens modal with all answers for that registration.
- **AC-003**: Answers displayed in organiser-defined order with field definitions visible.
- **AC-004**: Checkbox fields show rich-text description and checked/unchecked state.
- **AC-005**: Option-select fields show title and selected option.
- **AC-006**: Unanswered optional fields show "Not answered" or similar placeholder.
- **AC-007**: Modal fully keyboard-navigable; Escape key closes it; focus properly managed.
- **AC-008**: Modal responsive on mobile (320px), tablet (768px), desktop; no horizontal scrolling.
- **AC-009**: Custom field display elements hidden when `REGISTRATION_CUSTOM_FIELDS` toggle disabled.
- **AC-010**: Component designed for reusability; display logic separable from modal wrapper.
- **AC-011**: Only event organiser/admin with edit permissions can view registration details.
- **AC-012**: Performance acceptable for 100+ registrations (query count ≤5, render <500ms).

---

## 6. Test Automation Strategy

### Backend Tests (`backend/organization/tests/test_event_registration_custom_fields_display.py`)

**Unit Tests**:
- Serialization includes answers; proper field ordering
- Permission checks; non-admin blocked
- Empty/missing answer states

**Integration Tests**:
- List endpoint returns answers for each registration
- Option titles included in answers
- Checkbox descriptions correctly serialized

**Performance Tests**:
- 100 registrations: query count ≤5
- Response time <500ms

### Frontend Tests (`frontend/src/components/event/RegistrationCustomFieldsModal.test.tsx`)

**Component Tests**:
- Render checkbox with description and boolean value
- Render option-select with title and selected value
- Handle empty answers state

**Integration Tests**:
- Click indicator → modal opens with registration data
- Escape key closes modal; focus restored
- Indicator hidden when feature toggle disabled

**Accessibility Tests**:
- ARIA labels on indicator and form elements
- Focus trap within modal
- Keyboard navigation works

### E2E Tests

- Admin views custom field answers for registration
- Grid remains compact; answers only in modal
- Modal usable on mobile/tablet

---

## 7. Rationale & Context

### Why Modal for Answers?

Grid view has limited space for up to 5 fields. Modal provides:
- **Space** for full viewport display
- **Clarity** with field definitions alongside values
- **Scannability** with vertical organization
- **Reusability** for future detail pages

### Why Visual Indicator?

Without indicator, admins must open each registration to discover answers (friction). Indicator provides:
- **Quick scanning** to identify which registrations have data
- **Intent signaling** that additional information is available
- **Compactness** with minimal grid disruption

### Why Reusable Component?

Future features:
- Members viewing their own answers (user-facing detail page)
- Export/reporting showing answers in context
- Admin bulk operations based on answers
- Mobile/API-driven interfaces

Component separation ensures same display logic reuses across contexts.

---

## 8. Dependencies & External Integrations

### Backend
- Models: `EventRegistration`, `RegistrationField`, `RegistrationFieldAnswer`, `RegistrationFieldOption` (issue #1960)
- Serializers: `EventRegistrationSerializer`, `RegistrationFieldSerializer`, `RegistrationFieldAnswerSerializer`
- Permissions: `IsEventOrganizerOrAdmin` (existing)
- Database: PostgreSQL; indexes on `(registration_id, field_id)` for queries

### Frontend
- Material-UI v5: Dialog, Box, Typography, Icon components
- React: Hooks (useState, useEffect, useCallback)
- Axios: HTTP requests
- Feature toggles: `useFeatureToggles` hook (existing)
- Internationalization: `getTexts()` function (existing)

### External Services
- None (uses existing APIs and stack)

---

## 9. Examples & Edge Cases

### Example 1: Registration with Multiple Answers

```
Modal displays:
┌─────────────────────────┐
│ Registration Details    │ [X]
├─────────────────────────┤
│ alice | alice@ex.com    │
│ May 15, 2026 10:30 AM   │
│                         │
│ Custom Answers:         │
│ ─────────────────────── │
│ 1. [✓] Dietary          │
│    restrictions?        │
│                         │
│ 2. T-shirt size         │
│    Large                │
│                         │
│          [Close]        │
└─────────────────────────┘
```

### Example 2: Unanswered Optional Field

```
2. T-shirt size
   — (Not answered)
```

### Example 3: No Custom Field Data

```
No custom field data available.
```

### Example 4: Mobile Responsive (320px)

- Adapts to width; no horizontal scroll
- Labels/values stack vertically
- Touch-friendly tap targets (≥44px)

### Example 5: Rich HTML with Links

Checkbox description: "I confirm I read the [terms](link) and **agree**."
- Links: clickable with `rel="noopener noreferrer"`, `target="_blank"`
- Bold text: visually distinct
- No XSS risk; server-sanitized HTML

---

## 10. Validation Criteria

**Must-Have**:
- ✓ Indicator shows on registrations with answers
- ✓ Modal displays all answers in organiser-defined order
- ✓ Field definitions + values clearly visible
- ✓ Checkbox/option-select rendered correctly
- ✓ Keyboard-accessible; Escape closes
- ✓ Feature toggle gates all UI

**Should-Have**:
- ✓ Responsive on mobile/tablet viewports
- ✓ Safe rich HTML rendering in descriptions
- ✓ Performance acceptable for 100+ registrations
- ✓ Component supports reuse in other contexts

**Failure Criteria** (Must NOT occur):
- ✗ XSS vulnerability via HTML rendering
- ✗ Unauthorized users view registration data
- ✗ Answers mixed/incorrect for wrong registrations
- ✗ Modal breaks on mobile viewport
- ✗ Toggle ignored; UI appears when disabled

---

## 11. Related Specifications / Further Reading

- [Event Registration Epic](./EPIC_event_registration.md)
- [Organiser Creates Custom Fields — Phase 4a](./20260416_1000_event_registration_custom_fields.md)
- [Member Registers with Custom Fields — Phase 4a](./20260512_1015_register_for_event_with_extra_fields.md)
- [Edit Custom Fields — Issue #1961](./20260512_0725_edit_event_registration_custom_fields.md)
- [Domain Entities Reference](../domain-entities.md)
- [API Documentation](../api-documentation.md)
- [Material-UI Dialog Component](https://mui.com/material-ui/react-dialog/)
- [WCAG 2.1 Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

## Appendix: Future User-Facing Registration Detail View

Once admin display is complete and validated, a follow-up feature enables members to view their own submitted answers. Reuse strategy:

1. Extract answer display logic: `RegistrationCustomFieldsDisplay.tsx`
2. Create context-specific wrappers:
   - `AdminRegistrationDetailsModal.tsx` — admin context
   - `UserRegistrationDetailsPage.tsx` — user context
3. Both fetch via respective endpoints (admin endpoint vs. user's own data)
4. Authorization handled at wrapper level, not display component

---

**Document End**
