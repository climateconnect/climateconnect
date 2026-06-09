# Allow Negative Project Ratings

**Status**: DRAFT
**Type**: Backend — enhancement
**Epic**: Project Ranking
**Date created**: 2026-06-09

---

## Problem Statement

The project ranking system allows admins to manually adjust a project's position in the list via the `rating` field on the `Project` model. This field is added directly to the computed ranking score in `ProjectRanking.calculate_ranking()`.

Currently, `rating` is a `PositiveSmallIntegerField` (range 0–32767) with a default of `100`. This means:

- Every project starts with a **+100 baseline** contribution to its ranking score.
- An admin can **lower** a project's rating to reduce its boost (e.g. set it to `0`), but can never make it **negative** — i.e. can never push a project below the baseline of other projects.

### Why This Matters Now

Newly created upcoming events are dominating the project list. A brand-new event with zero engagement receives ~75 points from the `created_at` factor alone (weight 5 × recency score 15). An established project with real engagement (comments, likes, followers) totals ~74 points. The manual `rating` field is the only lever admins have to correct this, but since it can only go down to `0`, it cannot overcome the `created_at` advantage of new events.

Allowing **negative** `rating` values would let admins set a project's rating to e.g. `-50`, which subtracts 50 from its total ranking score — enough to sink unwanted projects below those with genuine engagement.

---

## Core Requirements

### What We're Building

Change the `rating` field on `Project` from `PositiveSmallIntegerField` to `SmallIntegerField`, allowing values from **-32768 to 32767**. This enables admins to assign negative ratings in Django admin to forcefully downrank specific projects.

### What Stays the Same

- The default value remains `100`.
- The ranking formula in `ProjectRanking.calculate_ranking()` continues to add `rating` directly to the score — no logic change needed.
- The field is only editable in Django admin (not exposed in any API serializer).

---

## System Impact

### Entities Changed

| Entity | Change |
|--------|--------|
| `Project.rating` ([`backend/organization/models/project.py:175`](backend/organization/models/project.py:175)) | `PositiveSmallIntegerField` → `SmallIntegerField` |

### Files Affected

| File | Change |
|------|--------|
| `backend/organization/models/project.py` | Change field type, update `help_text` and `verbose_name` to reflect new range |
| `backend/organization/migrations/NNNN_*.py` | New migration for field type change |

### No Changes Required

| File | Reason |
|------|--------|
| `organization/utility/project_ranking.py` | Already adds `project_manually_set_rating` (i.e. `self.rating`) directly to the score. Negative values work automatically. |
| `organization/admin.py` | Already exposes `rating` in the "Collaboration" fieldset. Django admin renders `SmallIntegerField` the same way — no widget change needed. |
| `organization/serializers/*.py` | `rating` is not exposed in any API serializer. |
| `organization/views/project_views.py` | No view logic references `rating` for validation or filtering in the list/create/update endpoints. |

### Existing `rating` Filters — Compatibility Check

Several places in the codebase filter on `rating`. All remain compatible with negative values:

| Location | Filter | Impact |
|----------|--------|--------|
| `organization/utility/project.py:234` | `rating__gte=49` | Projects with negative ratings are excluded from similar-projects candidates. This is **desired behaviour** — downranked projects should not appear as recommendations. |
| `organization/views/project_views.py:1496` | `rating__lte=99` | Projects with negative ratings are **included** in featured projects. If the intent of `ListFeaturedProjects` is to show only "default" projects (rating ≤ 99), negative-rated projects would now also appear. **Review needed**: consider whether to add a lower bound (e.g. `rating__gte=0`) to exclude downranked projects from featured listings. |
| `organization/views/project_views.py:1797` | `rating__gte=49` | Same as similar-projects — downranked projects excluded. Desired. |
| `organization/models/project.py:303` | `Meta.ordering = ["-rating", "-id"]` | Projects with negative ratings sort after all default (100) and boosted (>100) projects. This is correct. |

---

## Acceptance Criteria

- [ ] `Project.rating` field type is `SmallIntegerField` (range -32768 to 32767)
- [ ] Default value remains `100`
- [ ] `help_text` and `verbose_name` updated to reflect the new range (e.g. "Rating (-100 to 100)" or similar)
- [ ] Django migration is generated and applies cleanly (no data backfill needed — existing values are within the new range)
- [ ] An admin can set a negative rating (e.g. `-50`) via Django admin and save successfully
- [ ] A project with a negative `rating` is ranked below projects with the default `rating=100` in the project list
- [ ] `ListFeaturedProjects` does not surface projects with negative ratings (add `rating__gte=0` filter if needed)
- [ ] Existing tests pass with no modifications

---

## Non-Goals

- Changing the ranking algorithm weights or recency scoring logic.
- Exposing `rating` in the public API or frontend.
- Changing the `Organization.rating` field (separate model, same pattern but out of scope).
- Addressing the `created_at` dominance for events (separate concern — see discussion about using `start_date_score` instead of `max(created_at_score, start_date_score)` for upcoming events).

---

## AI Agent Insights

### Why `SmallIntegerField` and Not an Arbitrary Range

Django's `SmallIntegerField` maps to PostgreSQL's `SMALLINT` (2 bytes, -32768 to 32767). It's the smallest integer type that supports negatives. There's no need for `IntegerField` (4 bytes) since the practical range for manual adjustments will be roughly -100 to +200. Using `SmallIntegerField` keeps storage minimal and communicates intent.

### Why Keep the Default at 100

Changing the default would require a data migration for all existing projects. Since `rating` is added as a flat offset to every project's score, the absolute value doesn't matter — only the **relative difference** between projects matters. A default of 100 means "neutral / no manual adjustment," and negative values mean "manually downranked." This is intuitive for admins.

### The `ListFeaturedProjects` Blind Spot

`ListFeaturedProjects` (line 1496) filters `rating__lte=99` — intended to exclude "boosted" projects (rating > 99) from the featured list. But with negative ratings allowed, a project set to `-50` would still pass this filter and appear in featured projects. The fix is to add `rating__gte=0` (or `rating__gte=1` if 0 should also be excluded). This should be addressed as part of this task.

### Future Consideration: `created_at` Fix for Events

This negative-rating change gives admins a manual lever, but it doesn't fix the root cause of new events dominating the list. The `created_at_factor` for upcoming events uses `max(created_at_score, start_date_score)`, which means a freshly created event always gets a high score regardless of its start date. A follow-up task should change this to use only `start_date_score` for upcoming events, as the code's own comment states: *"For events the start_date and end_date are more important than the creation time."*

---

## Implementation Notes

### Model Change

File: [`backend/organization/models/project.py`](backend/organization/models/project.py:175)

```python
# Before
rating = models.PositiveSmallIntegerField(
    help_text="The larger the number, the more to the top this project will be displayed",
    verbose_name="Rating (1-100)",
    default=100,
)

# After
rating = models.SmallIntegerField(
    help_text="The larger the number, the more to the top this project will be displayed. Negative values downrank the project.",
    verbose_name="Rating",
    default=100,
)
```

### Migration

Run `pdm run python manage.py makemigrations organization` after the model change. The migration is a pure column type change (`ALTER TABLE ... ALTER COLUMN ... TYPE smallint`). PostgreSQL handles this as a no-op rewrite since `smallint` is smaller than the existing type. No data loss — all existing values (0–32767) fit within `smallint` range.

### Optional: `ListFeaturedProjects` Fix

File: [`backend/organization/views/project_views.py`](backend/organization/views/project_views.py:1494)

```python
# Before
return Project.objects.filter(
    rating__lte=99, is_draft=False, is_active=True
).prefetch_related("loc__translate_location__language")[0:4]

# After
return Project.objects.filter(
    rating__gte=0, rating__lte=99, is_draft=False, is_active=True
).prefetch_related("loc__translate_location__language")[0:4]
```
