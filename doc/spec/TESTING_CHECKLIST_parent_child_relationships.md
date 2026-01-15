# Parent/Child Project Relationships - Testing Checklist

**Branch**: `parent_child_project_relationships`  
**Testing Approach**: Django Admin (management) + API verification (display)

---

## Quick Start

```bash
# 1. Start development server
cd backend
python manage.py runserver

# 2. Access Django Admin
open http://localhost:8000/admin/organization/project/

# 3. Login with superuser credentials
```

---

## Test Checklist

### ✅ 1. Create Parent/Child Relationship

**In Django Admin**:
- [ ] Create parent project: "Climate Festival 2026"
- [ ] Verify parent has `has_children = False`
- [ ] Create child project: "Solar Workshop"
- [ ] Set child's parent to "Climate Festival 2026"
- [ ] **Verify parent now has `has_children = True`** ⭐ (signals working!)

**API Check**:
```bash
curl http://localhost:8000/api/projects/climate-festival-2026/ | jq '.child_projects_count'
# Should return: 1
```

---

### ✅ 2. Multiple Children

**In Django Admin**:
- [ ] Add child: "Policy Panel"
- [ ] Add child: "Networking Session"
- [ ] Verify parent still shows `has_children = True`

**API Check**:
```bash
curl http://localhost:8000/api/projects/?parent_project_slug=climate-festival-2026 | jq '.count'
# Should return: 3
```

---

### ✅ 3. Delete Children & Signal Updates

**In Django Admin**:
- [ ] Delete "Policy Panel"
- [ ] Delete "Networking Session"
- [ ] Verify parent still has `has_children = True` (Solar Workshop remains)
- [ ] Delete "Solar Workshop"
- [ ] **Verify parent now has `has_children = False`** ⭐ (delete signal working!)

**API Check**:
```bash
curl http://localhost:8000/api/projects/climate-festival-2026/ | jq '.child_projects_count'
# Should return: 0
```

---

### ✅ 4. Validation: Self-Reference

**In Django Admin**:
- [ ] Edit "Climate Festival 2026"
- [ ] Try to set itself as parent
- [ ] **Verify error: "A project cannot be its own parent"** ⭐

---

### ✅ 5. Validation: Max Depth = 1

**In Django Admin**:
- [ ] Create: Festival → Workshop A
- [ ] Try to create: Workshop A → Sub-Workshop
- [ ] **Verify error: "Projects can only be nested one level deep"** ⭐

---

### ✅ 6. Validation: Parent with Children

**In Django Admin**:
- [ ] Create: Festival → Workshop A
- [ ] Try to give Festival a parent
- [ ] **Verify error: "A project with child projects cannot have a parent"** ⭐

---

### ✅ 7. Deletion Behavior (SET_NULL)

**In Django Admin**:
- [ ] Create: Festival → Workshop A
- [ ] Delete Festival
- [ ] **Verify Workshop A still exists with NULL parent** ⭐

**API Check**:
```bash
curl http://localhost:8000/api/projects/workshop-a/ | jq '.parent_project_id'
# Should return: null
```

---

### ✅ 8. Move Child Between Parents

**In Django Admin**:
- [ ] Create: Festival A → Workshop
- [ ] Create: Summit B (no children)
- [ ] Move Workshop from Festival A to Summit B
- [ ] **Verify Festival A: `has_children = False`** ⭐
- [ ] **Verify Summit B: `has_children = True`** ⭐

**API Check**:
```bash
curl http://localhost:8000/api/projects/workshop/ | jq '.parent_project_slug'
# Should return: "summit-b"
```

**Note**: An automated test `test_has_children_flag_on_parent_change` was written for this scenario.
The test initially FAILED, catching a bug in the signal code where the old parent's `has_children`
was not being cleared. The bug was fixed by using a pre_save signal to track the old parent value.
This demonstrates the value of comprehensive test coverage - the test caught the bug before production!

---

### ✅ 9. Management Command

**Create discrepancy**:
```bash
python manage.py shell
from organization.models import Project
parent = Project.objects.get(url_slug="festival")
Project.objects.filter(pk=parent.pk).update(has_children=False)  # Break it
exit()
```

**Test reconciliation**:
```bash
python manage.py reconcile_has_children --dry-run
# Should show: "Would set has_children=True for 1 projects"

python manage.py reconcile_has_children
# Should fix it
```

---

### ✅ 10. Admin Filters

**In Django Admin**:
- [ ] Filter by "Has children: Yes" → Only parent projects shown
- [ ] Filter by "Project type: Event"
- [ ] Combine filters: Has children + Event type
- [ ] Search for parent name → Child projects also shown

---

### ✅ 11. API Endpoints

**Test all API features**:

```bash
# List with parent/child fields
curl http://localhost:8000/api/projects/ | jq '.results[0] | {name, parent_project_id, has_children}'

# Detail with full info
curl http://localhost:8000/api/projects/festival/ | jq '{
  name,
  parent_project_id,
  parent_project_name,
  parent_project_slug,
  has_children,
  child_projects_count
}'

# Filter by parent ID
curl http://localhost:8000/api/projects/?parent_project=42

# Filter by parent slug (preferred)
curl http://localhost:8000/api/projects/?parent_project_slug=festival

# Filter by has_children
curl http://localhost:8000/api/projects/?has_children=true

# Combine filters
curl "http://localhost:8000/api/projects/?has_children=true&project_type=EV"
```

---

## Success Criteria

All checkboxes above should be ✅ and:

1. ✅ Signals automatically update `has_children` (create, delete, move)
2. ✅ Validation prevents invalid states (self-ref, depth > 1, parent-with-children)
3. ✅ Deletion orphans children (SET_NULL)
4. ✅ Admin filters and search work correctly
5. ✅ Management command reconciles discrepancies
6. ✅ API returns correct data for all endpoints
7. ✅ No N+1 query problems on list view

---

## Common Issues

### Issue: Validation error not showing
- Make sure you're calling `Save` (triggers `clean()`)
- Check Django messages at top of page

### Issue: Signal not updating has_children
- Check `organization/apps.py` has `ready()` method
- Restart Django server after code changes

### Issue: API returning 404
- Verify project is not `is_draft=True`
- Check URL slug is correct (lowercase, hyphens)

---

## Quick Reference

**Admin URL**: `http://localhost:8000/admin/organization/project/`  
**API Base**: `http://localhost:8000/api/projects/`  
**Documentation**: `doc/spec/IMPLEMENTATION_SUMMARY_parent_child_relationships.md`

---

**Last Updated**: 2026-01-15  
**Status**: Ready for testing ✅

