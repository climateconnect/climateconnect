# Form Validation: Zod + React Hook Form

**Status**: DRAFT
**Type**: Refactoring / Frontend Infrastructure
**Date and time created**: 2026-03-26 10:30 UTC
**Date Completed**: TBD
**GitHub Issue**: TBD
**Related Specs**:
- [`doc/mosy/architecture_overview.md`](../mosy/architecture_overview.md)

## Problem Statement

The Climate Connect frontend currently uses hand-written, ad-hoc form validation with inconsistent patterns across components. This makes forms hard to maintain, test, and keep visually consistent.

**Observed pain points:**
- `useState` error objects are scattered across individual form components.
- Different components use different error handling approaches (plain strings, error objects, `Alert` components).
- Validation logic is mixed with component rendering logic.
- No centralised schema definitions — the same rules (e.g. minimum password length) are duplicated in multiple places.

**Core Requirements (User/Stakeholder Stated):**

1. Adopt **Zod** for schema-based validation and **React Hook Form** for form state management across all Climate Connect forms.
2. Create a shared `lib/validation/schemas/` directory containing reusable Zod schemas for all major domains (user, organisation, project, common fields).
3. Create reusable form primitive components (`FormField`, `Form`, `FormError`) that wrap MUI inputs with React Hook Form controllers, so individual forms do not need to wire up validation manually.
4. Migrate existing forms in priority order:
   - Signup form (`pages/signup.tsx`)
   - Project creation (`components/shareProject/`)
   - Organisation forms (`pages/createorganization.tsx`)
   - Account settings (`components/account/SettingsPage.tsx`)
   - Remaining forms (iterative)
5. Remove old ad-hoc validation patterns after each migration and update `CONTRIBUTING.md` with the new patterns.

**Explicitly Out of Scope (this iteration):**
- Changes to the Django backend validation logic or API contracts.
- Server-side (SSR) schema validation in `getServerSideProps`.
- Custom async validation that calls the backend (e.g. username uniqueness checks) — to be considered as a follow-up.

### Non Functional Requirements

- Total bundle size increase must remain reasonable; the two libraries together add approximately 21 kB (Zod ~12 kB, React Hook Form ~9 kB).
- Validation mode defaults to `onBlur` for improved UX (errors appear after the user leaves a field, not during typing).
- All existing `yarn lint` / TypeScript checks must continue to pass after each migration step.
- Migrated forms must be fully responsive and accessible (ARIA error associations via `helperText`/`aria-describedby`).
- Each migration step must be independently deployable — no "big bang" cutover required.

### AI Agent Insights and Additions

- **Library compatibility**: React Hook Form `Controller` works natively with all MUI v5 inputs (TextField, Select, Autocomplete, DatePicker). No additional adapter libraries are needed beyond `@hookform/resolvers`.
- **TypeScript inference**: Zod's `z.infer<typeof schema>` eliminates the need to write separate TypeScript interface definitions for form data shapes — a major maintenance win given the ongoing TypeScript migration.
- **`refine` for cross-field validation**: Password confirmation (`repeatpassword === password`) and date-range checks (`end_date >= start_date`) are natural use-cases for Zod's `.refine()` / `.superRefine()`. These should be modelled in the schemas rather than handled imperatively in components.
- **Translation key pattern**: The plan uses translation key strings (e.g. `'password_too_short'`) as Zod error messages. Confirm that these keys are resolved by the i18n layer at render time (inside the `helperText` prop), not at schema-definition time, to avoid stale closures.
- **`FormProvider` context**: Using React Hook Form's `FormProvider` + `useFormContext()` in `FormField` allows deeply nested field components to access form state without prop-drilling. This is important for multi-step wizards like Share Project.
- **Multi-step wizard compatibility**: The Share Project wizard manages its own step state. React Hook Form can work per-step (separate `useForm` per step) or with a single form context across all steps. The recommended approach is **per-step forms with shared Zod schemas** — data is accumulated in parent state as each step is validated and submitted.
- **Testing**: Zod schemas are pure functions and can be unit-tested directly (`schema.safeParse(...)`) without rendering any component — this dramatically simplifies validation test coverage.
- **Phased migration logging**: Each migrated form should include a brief comment referencing the task (e.g. `// migrated to RHF in 20260326_1030_form_validation_zod_react_hook_form`) to assist future code archaeology.

## System impact

*To be filled by Archie (mosy-system-architect) during system impact analysis.*

## Software Architecture

*Frontend only — no backend changes.*

### New Directory Structure

```
frontend/src/
├── lib/
│   └── validation/
│       ├── schemas/
│       │   ├── common.ts          # shared primitives: email, password, url, date range
│       │   ├── user.ts            # signup, signin, profile update
│       │   ├── organization.ts    # create / edit organisation
│       │   └── project.ts         # create / edit project (including event fields)
│       └── index.ts               # re-exports all schemas
└── components/
    └── forms/
        ├── Form.tsx               # base <form> wrapper — takes schema + onSubmit
        ├── FormField.tsx          # MUI TextField wrapped with RHF Controller
        └── FormError.tsx          # standardised inline error display component
```

### Affected Files (Phase 4 — Migration)

| File | Change |
|---|---|
| `frontend/package.json` | Add `zod`, `react-hook-form`, `@hookform/resolvers` |
| `frontend/src/lib/validation/schemas/common.ts` | New — shared Zod primitives |
| `frontend/src/lib/validation/schemas/user.ts` | New — signup / signin / profile schemas |
| `frontend/src/lib/validation/schemas/organization.ts` | New — organisation schemas |
| `frontend/src/lib/validation/schemas/project.ts` | New — project / event schemas |
| `frontend/src/lib/validation/index.ts` | New — barrel re-export |
| `frontend/src/components/forms/Form.tsx` | New — base form component |
| `frontend/src/components/forms/FormField.tsx` | New — MUI/RHF field wrapper |
| `frontend/src/components/forms/FormError.tsx` | New — error display component |
| `frontend/pages/signup.tsx` | Migrate to RHF + Zod (Phase 4, step 1) |
| `frontend/src/components/shareProject/**` | Migrate to RHF + Zod (Phase 4, step 2) |
| `frontend/pages/createorganization.tsx` | Migrate to RHF + Zod (Phase 4, step 3) |
| `frontend/src/components/account/SettingsPage.tsx` | Migrate to RHF + Zod (Phase 4, step 4) |
| `frontend/CONTRIBUTING.md` / root `CONTRIBUTING.md` | Add section on new form validation patterns |

### Implementation Phases

#### Phase 1 — Dependencies
```bash
yarn add zod react-hook-form @hookform/resolvers
```

#### Phase 2 — Shared Schemas

Key schema patterns to implement:

```typescript
// lib/validation/schemas/user.ts
export const signupSchema = z.object({
  email: z.string().email('invalid_email'),
  password: z.string().min(8, 'password_too_short'),
  repeatpassword: z.string(),
  first_name: z.string().min(1, 'first_name_required'),
  last_name: z.string().min(1, 'last_name_required'),
}).refine(d => d.password === d.repeatpassword, {
  message: 'passwords_dont_match',
  path: ['repeatpassword'],
});
export type SignupFormData = z.infer<typeof signupSchema>;

// lib/validation/schemas/project.ts
export const projectSchema = z.object({
  name: z.string().min(1, 'project_name_required').max(100),
  description: z.string().min(10, 'description_too_short').max(5000),
  start_date: z.date().nullable(),
  end_date: z.date().nullable(),
}).refine(d => !d.end_date || !d.start_date || d.end_date >= d.start_date, {
  message: 'end_date_before_start',
  path: ['end_date'],
});
export type ProjectFormData = z.infer<typeof projectSchema>;
```

#### Phase 3 — Reusable Form Primitives

```typescript
// components/forms/FormField.tsx
export function FormField({ name, ...props }: FormFieldProps) {
  const { control, formState: { errors } } = useFormContext();
  return (
    <Controller name={name} control={control} render={({ field }) => (
      <TextField {...field} {...props} error={!!errors[name]} helperText={errors[name]?.message as string} />
    )} />
  );
}

// components/forms/Form.tsx
export function Form<T>({ schema, onSubmit, children, ...props }: FormProps<T>) {
  const methods = useForm<T>({ resolver: zodResolver(schema), mode: 'onBlur', ...props });
  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>{children}</form>
    </FormProvider>
  );
}
```

#### Phase 4 — Form Migration (Priority Order)

1. `pages/signup.tsx` — high impact, self-contained, clear scope
2. `components/shareProject/` — complex multi-step wizard, high value
3. `pages/createorganization.tsx`
4. `components/account/SettingsPage.tsx`
5. All remaining forms (iterative, tracked separately if needed)

#### Phase 5 — Cleanup & Documentation

- Remove old `useState` error patterns incrementally after each migration.
- Update `CONTRIBUTING.md` with the canonical new form pattern.
- Add form validation section to code review checklist.

### Before / After Pattern

**Before:**
```typescript
const [errors, setErrors] = useState({ email: '', password: '' });
const validate = () => { /* imperative checks */ };
<TextField value={email} onChange={...} error={!!errors.email} helperText={errors.email} />
```

**After:**
```typescript
<Form schema={signupSchema} onSubmit={handleSubmit}>
  <FormField name="email" label={texts.email} type="email" />
  <FormField name="password" label={texts.password} type="password" />
  <Button type="submit">{texts.sign_in}</Button>
</Form>
```

## Log

| Date | Entry |
|---|---|
| 2026-03-26 10:30 UTC | Task created from `plans/form-validation-implementation-plan.md` |

