# Refactor Project Serializers into Representation-Focused Modules

**Date**: 2026-07-06
**Status**: DRAFT
**Type**: Backend — refactor
**Depends on**: None

---

## Problem Statement

`backend/organization/serializers/project.py` has grown to 716 lines and contains at least fifteen distinct serializer classes that serve very different purposes: full project detail, edit views, list stubs, suggestion cards, membership records, follower records, notification payloads, sitemap entries, and several relationship wrappers. All of these classes are currently co-located because they happen to mention the `Project` model or one of its related models.

This concentration creates concrete problems for the team:

- **Cognitive load.** A developer opening the file to change one representation must reason about every other representation at the same time. It is hard to see which fields belong to which use case, and which helper methods are shared.
- **Risk of unintended side effects.** Because `EditProjectSerializer` inherits from `ProjectSerializer` and overrides many of its fields, a change made to the detail serializer for read endpoints can silently change the edit payload shape or performance characteristics.
- **Duplicated and scattered helpers.** The `_LocationNameMixin` is shared by three serializers, while image, location, and project-type logic is duplicated or nearly duplicated between `ProjectSerializer`, `ProjectStubSerializer`, and `ProjectNotificationSerializer`.
- **Hard to test in isolation.** The only way to import a single serializer today is to pull in the entire module, which increases import-time coupling and makes focused unit tests more expensive to write.
- **Code review friction.** Large files make diffs harder to read and increase the chance that unrelated changes end up in the same commit.
- **Context-window pressure.** The file is already large enough that tooling truncates it, which slows down both human reviewers and automated assistance.

The business reason this matters is velocity and reliability: project serialization is on the critical path for almost every project-related feature (browse, hub pages, project detail, edit, notifications, climate match, sitemap), so friction in this file slows down most product work and increases the risk of regressions in a high-traffic surface.

A refactor is needed to organize the project serializers by **representation depth and use case** rather than by the model they reference, and to make the boundaries between read/detail, edit, stub, membership, and infrastructure serializers explicit.

## Acceptance Criteria

### Module structure

- [ ] `backend/organization/serializers/project.py` is replaced by a package `backend/organization/serializers/project/`.
- [ ] The new package has an `__init__.py` that re-exports every public serializer class under its current name, so all existing imports from `organization.serializers.project` continue to work without modification.
- [ ] The new package splits serializers into modules grouped by representation/use case. Each module must contain only serializers that serve a single logical purpose.
  - Core project representations (detail, edit, minimal, stub, suggestion).
  - Project relationships (parents, collaborators, wrappers that expose a project through a relationship model).
  - Membership (project members, insert-only member serializer).
  - User interactions (followers, likes, membership requests).
  - Infrastructure/notification (sitemap entry, notification payload).
  - Shared helpers/mixins used by more than one representation.
- [ ] No single module in the new package exceeds ~300 lines. The shared helper module may be shorter; representation modules should be small enough to read in full without scrolling.

### Behavioral preservation

- [ ] Every serializer class continues to produce exactly the same JSON output for the same input object and context as before the refactor. There must be no changes to field names, field order, null handling, or computed values visible to API consumers.
- [ ] All existing view usages of these serializers continue to work without modification. The re-export surface in `__init__.py` must cover every class imported anywhere in the backend.
- [ ] All existing tests pass without changes to test assertions.
- [ ] `pdm run python manage.py test organization --keepdb` and the full backend test suite pass.
- [ ] `make format` (or the equivalent backend formatting command) passes with no changes.

### Code quality improvements

- [ ] Shared helpers that are genuinely reused across representations live in a single dedicated module. Helpers that are only used in one representation are moved next to that representation.
- [ ] The inheritance link between `EditProjectSerializer` and `ProjectSerializer` is removed or replaced with composition/shared helpers, so that the edit payload is no longer implicitly tied to the detail read payload.
- [ ] Imports are scoped to the module that needs them; no module imports a serializer it does not use.
- [ ] The refactored code passes the project's linter and import-sorting rules.

### Tests

- [ ] Existing tests for project serializers continue to pass.
- [ ] If no existing tests cover a representation whose logic was moved, add a minimal serializer test for that representation as part of the refactor.
- [ ] No new test utilities or factories are required unless genuinely missing; prefer reusing existing factories.

## Constraints and Non-Negotiable Requirements

- **No API contract changes.** This is a pure code-organization refactor. The public JSON shape of every endpoint using these serializers must remain identical.
- **No database migrations.** No model changes are required.
- **No endpoint URL changes.** Views and URLs remain untouched except for import paths, which must stay compatible through the re-export.
- **Incremental safety.** The refactor must be one logical commit that moves code without changing behavior. It must not be bundled with feature work.
- **Backward-compatible imports.** All code that currently imports from `organization.serializers.project` must continue to work. Internal imports inside the new package should use relative imports; external consumers continue to use the public package path.
- **No new third-party dependencies.** The refactor uses only Django, Django REST Framework, and existing project utilities.
- **Follow project style.** Python formatting, import ordering, and docstring conventions must match `backend/agent.md` and the existing codebase.
- **Representations must not be recombined into a single large file.** The goal is to keep the package easy to navigate; creating one module per serializer is acceptable if it makes the purpose of each clearer.
- **Inheritance is allowed only for genuine shared behavior.** Do not preserve inheritance relationships whose only purpose is code proximity.

## Domain Context

Climate Connect is a platform connecting climate activists, organisations, and projects globally. The `Project` model is central: almost every feature — browse pages, hub pages, project detail, editing, notifications, climate match, the sitemap, member management — needs to serialize project data in some form. Different consumers need radically different shapes: a browse card needs only a name, image, location, and parent organisation; the detail view needs full descriptions, event registration config, parent/child relationships, and counts; the notification serializer needs only a name, slug, and image; the sitemap needs only a slug and updated timestamp.

Historically these serializers accumulated in one file because they all touch `Project` or its close relations. That colocation made sense when the file was small, but it now obscures the fact that each consumer has its own contract. Keeping the contracts separate makes it easier to reason about which fields each API response promises, and makes it harder for a change aimed at one consumer to leak into another.

## AI Insights

### Implementation Hints

- Start by listing every serializer in the current file and every class that imports it. The import surface is small (a few views, notification utility, climate match, and the climatematch serializer), so the re-export list in `__init__.py` can be verified mechanically.
- A package layout by representation depth is usually clearer than one by model. Group serializers by the API shape they produce, not by the underlying model.
- The shared `_LocationNameMixin` and similar cross-cutting helpers belong in a `mixins.py` or `helpers.py` module inside the package. Image-formatting logic that appears in both detail and stub serializers should become a reusable helper there if it is identical, or stay local if the two representations intentionally differ.
- Removing the `EditProjectSerializer → ProjectSerializer` inheritance may be the highest-value change. The two classes currently share many field names but compute them differently; composition via a shared mixin or helper functions is safer than inheritance here.
- Relative imports inside the new package keep the modules loosely coupled; external consumers should continue to import from `organization.serializers.project` so the refactor is transparent.
- `git mv` can preserve history for the original file if you first move it to `project/__init__.py` and then split contents into sibling modules. Alternatively, create the package and delete the old file in one commit; history loss for a refactor-only change is acceptable.
- Run the full serializer test suite after each sub-move. Because the refactor preserves public API shape, tests are the best safety net.
- `grep -R "organization.serializers.project" backend` should be the final check that no external import was missed.

### Trade-off Notes

- **One package vs. many files.** Splitting into many small files adds import overhead for the developer but reduces cognitive overhead when reading. For a file this large, the trade-off favors splitting.
- **Re-export everything vs. clean up imports.** Re-exporting all existing names keeps the refactor non-breaking but leaves some names that might eventually be renamed. Renaming is out of scope; do it in a follow-up task if desired.
- **Inheritance vs. composition.** Keeping `ProjectSuggestionSerializer` inheriting from `ProjectStubSerializer` may be justified because it truly is “stub plus one field”. The decision for each parent/child pair should be based on whether the subclass is a strict extension of the parent's contract or a different contract entirely.
- **Module granularity.** One module per serializer is fine if it improves clarity, but grouping tightly related serializers (e.g., all membership serializers in one file) reduces file proliferation. The right granularity is “one file per logical representation family”.
- **Shared helper location.** Putting shared helpers in a dedicated module avoids circular imports that can arise when two representation modules both need the same utility. Keep helpers stateless and free of serializer-class imports when possible.
- **Scope boundary.** This task is only about moving and cleaning the serializers in `project.py`. It is tempting to also refactor the views that use them or to deduplicate field logic with the organization serializers, but those should be separate tasks to keep the diff reviewable and the behavior unchanged.
- **No new abstractions.** Avoid creating a generic "ProjectSerializerBase" that tries to serve every use case. The current problem is partly caused by over-sharing; the solution is clearer separation, not a deeper inheritance hierarchy.
