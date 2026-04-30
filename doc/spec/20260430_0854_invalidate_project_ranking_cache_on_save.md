# 20260430_0854_invalidate_project_ranking_cache_on_save

**Type**: Story  
**Status**: IMPLEMENTATION  
**Started**: 2026-04-30 08:54  
**Owner**: —  
**Depends on**: —  
**Blocks**: Improved consistency in project ordering after manual rating adjustments in Django admin.  

---

## Problem Statement

Project rankings are calculated and cached to optimize performance, but when the `rating` field is manually updated in Django admin, the cached ranking retains the old value, leading to incorrect project ordering in API responses until the cache expires (24 hours). This affects user experience by showing outdated rankings. To resolve this, we need to invalidate the project ranking cache whenever a `Project` instance is saved, ensuring immediate consistency without requiring cache expiration.

This change matters because manual rating adjustments in Django admin are infrequent but critical for maintaining accurate project prominence. Invalidating the cache on save guarantees that rankings reflect the latest data, improving trust in the platform's sorting logic.

---

## Acceptance Criteria

- **Cache Invalidation on Save**: Whenever a `Project` instance is saved (via Django admin or API), the ranking cache for that project is deleted.
- **Fresh Recalculation**: On next access to `cached_ranking`, a new ranking is calculated and cached based on current data.
- **No Impact on Performance**: Cache invalidation is lightweight and does not block saves or introduce noticeable latency.
- **Backward Compatibility**: Existing cache behavior for other projects remains unchanged; only the saved project's cache is affected.
- **Testing**: Verified that saving a project in Django admin invalidates its cache, and subsequent API calls return updated rankings.

---

## Constraints and Non-Negotiable Requirements

- **Project-ID Specific**: Only the cache for the specific project being saved is invalidated; other projects' caches are unaffected.
- **No Cache Key Changes**: Retain the existing cache key format (`"PROJECT_ID_{project_id}_RANKING"`) and TTL (24 hours).
- **Django Model Save**: Implement via overriding `Project.save()` to ensure it triggers on all save operations (admin, API, etc.).
- **No Breaking Changes**: Does not affect existing signals or other cache invalidation logic for related models (likes, comments, etc.).
- **Security/Performance**: Ensure the implementation does not expose sensitive data or cause performance degradation under load.

---

## Domain Context

This story addresses caching inconsistencies in the project ranking system within the Climate Connect platform. Projects are ranked based on a combination of manual ratings (set in Django admin) and dynamic factors (likes, comments, etc.), with rankings cached for performance. Django admin is used for occasional manual adjustments to ratings, which influence project ordering in browse views. Invalidating the cache on save ensures that these changes are immediately reflected in API responses, maintaining data integrity for users browsing projects.

---

## AI Insights

- **Hint**: Leverage the existing `generate_project_ranking_cache_key()` and `cache.delete()` patterns from related signal handlers in the codebase.
- **Trade-off Note**: Always invalidating on save (even for non-rating changes) is acceptable due to infrequent admin edits, but if performance becomes an issue, consider detecting rating-specific changes or restricting to admin-only saves.