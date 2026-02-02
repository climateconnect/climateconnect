# Show Sub-Events of an Event Series on Project Detail Page

**Status**: DRAFT  
**Type**: Feature  
**Date and time created**: 2026-02-02 15:30 UTC  
**Date Completed**: N/A  
**Related GitHub Issue**: [#1752 - Show sub-event of an event series](https://github.com/climateconnect/climateconnect/issues/1752)

**Upstream Dependencies / References**:  
- `doc/spec/20250106_1430_parent_child_project_relationships.md` (parent/child projects API enabler)
- `doc/spec/20260121_1413_issue_1747_wasseraktionswochen_event_page.md` (special event page with feature toggle)

## Problem Statement

Enhance the project/event detail page to properly support parent-child event series relationships. When viewing a child event (sub-event) of an event series, users should be able to easily navigate back to the parent event, see sibling events in the series, and understand the relationship context.

**Core Requirements (User/Stakeholder Stated):**

1. **Enhanced Back Navigation**
   - If the parent event has a special event page (like Wasseraktionswochen), the '← Back' button should take the user back to that special page instead of the general browse page
   - Bonus: Display '← Back to [parent name]' instead of generic '← Back' text
   - The parent name is already available in the project data

2. **Show Sibling Events in Sidebar**
   - On the right sidebar, display other projects/events from the same event series
   - Show sibling events (children of the same parent)
   - "Show all" button at the end should link to the special event page if one exists for this parent

3. **Parent Event Context in Main Content**
   - Below the text showing who organizes the project, add information about the parent event
   - Display text like: "This [project type] is part of [parent name]"
   - Link the parent name to the parent project detail page
   - Note: Automatic redirect already handles routing to special event page when applicable, so simple link to parent detail is sufficient

**Additional Context from Issue:**
- This feature is part of an epic to support event series with special pages
- The proof of concept work has already started on the `event-series-poc` branch
- Parent project information (`parent_project_id`, `parent_project_name`, `parent_project_slug`) is already being parsed in the project detail page
- Some parent event display logic has been added to `ProjectContent.tsx`

### Non Functional Requirements

1. **Performance**: 
   - Sidebar sibling events should load efficiently (consider pagination if many siblings)
   - Back navigation should be instant (no additional API calls needed)
   - Reuse existing data fetching patterns

2. **i18n**: 
   - Support both `de` and `en` locales for all new text
   - Text patterns should work grammatically in both languages

3. **Resilience**: 
   - Gracefully handle cases where parent data is incomplete
   - Handle cases where special event page doesn't exist
   - Handle cases where feature toggle is disabled

4. **Compatibility**: 
   - Must work with existing project detail page architecture
   - Must not break existing non-series projects/events
   - Must coexist with feature toggle for special event pages

5. **Maintainability**:
   - Code should be reusable for future event series beyond Wasseraktionswochen
   - Logic for determining the special page URL can be specific for this pilot case and does not need to be centralized yet.
   - Should leverage existing components where possible

### AI Agent Insights and Additions

**Additional Considerations:**

1. **Smart Back Navigation Logic**:
   - Need to determine if a parent has a special event page programmatically
   - Could use a hardcoded mapping of the parent slug to the special page path for this pilot case.

2. **Sibling Events Display**:
   - Reuse existing `ProjectPreviews` or similar component for consistency
   - Consider limiting initial display (e.g., 3-5 siblings) with "Show all" button
   - Sort siblings by date (same logic as special event page: upcoming first, then past)
   - Exclude the current event from the sibling list to avoid confusion

3. **Parent Event Context Integration**:
   - The text is already partially implemented in `ProjectContent.tsx` 
   - Need to enhance it with proper link to parent detail page
   - Automatic redirect (already implemented) will handle routing to special page when applicable
   - Text pattern should be flexible for different project types (event, project, idea)
   - Consider making the text more prominent visually (icon, border, or highlighted box)

4. **Feature Toggle Coordination**:
   - The `WASSERAKTIONSWOCHEN_FEATURE` toggle already exists
   - Need to ensure all three features (back nav, sidebar, parent context) respect this toggle
   - When toggle is off, fall back to standard behavior (browse page, parent detail page)

5. **Data Requirements**:
   - Need to fetch sibling events - may require new API endpoint or filter
   - Could use existing `/api/projects?parent_project_slug=...` filter
   - Parent project data is already available, no additional fetch needed for basic display

6. **Edge Cases**:
   - What if parent has no special page but has many children?
   - What if child event has no siblings (only child of parent)?
   - What if parent project is deleted but children remain?
   - What if special page path changes or is misconfigured?

## System impact

**Actors involved**
- VisitorActor: anonymous or logged-in user viewing event/project detail pages
- MemberActor: authenticated user with same viewing capabilities
- PlatformOpsActor: manages feature toggles for special event pages

**Actions to implement / update**
- VisitorActor → ViewChildEventDetail → Project entity (enhanced with parent context and sibling navigation)
- VisitorActor → NavigateBackToParent → Parent special page OR browse page (smart routing based on parent configuration)
- VisitorActor → ViewSiblingEvents → Project collection (filtered by parent_project_slug)
- VisitorActor → NavigateToParentContext → Parent special page OR parent detail page (depending on special page existence and toggle)

**Flows affected / added**

1. **ProjectDetailPageFlow (modified)**
   - Trigger: Visitor navigates to any project detail page
   - New behavior: When project has `parent_project_id`, display parent context and fetch siblings
   - Technical components: `ProjectContent`, `ProjectSideBar`, header back navigation
   - Entities: Project (current), Project (parent), Project collection (siblings)

2. **SmartBackNavigationFlow (new)**
   - Trigger: Visitor clicks back button on child event detail page
   - Logic: Determine if parent has special page, redirect accordingly
   - Technical components: Header component, special page mapping configuration
   - Entities: Project (parent), FeatureToggle (WASSERAKTIONSWOCHEN_FEATURE)

3. **SiblingEventsDisplayFlow (new)**
   - Trigger: Project detail page loads with parent_project_id present
   - Logic: Fetch and display sibling events in sidebar
   - Technical components: `ProjectSideBar`, `ProjectPreviews` or similar
   - Entities: Project collection (siblings filtered by parent_project_slug)

4. **ParentContextDisplayFlow (enhanced)**
   - Trigger: Project detail page loads with parent_project_id present
   - Current: Basic text "This event is part of [parent]" (already implemented in PoC)
   - Enhancement: Link to parent detail page; automatic redirect (already implemented) handles special page routing
   - Technical components: `ProjectContent`
   - Entities: Project (parent)

**Entity changes needed**
- No database schema changes required
- Parent project data fields already added to project parsing (`parent_project_id`, `parent_project_name`, `parent_project_slug`)
- May need to fetch sibling projects via existing API

**Integration changes**
- API: Reuse existing `/api/projects?parent_project_slug=...` endpoint for fetching siblings
- Frontend: Create or extend special page mapping configuration (map parent slugs to special page paths)
- Header navigation: Enhance back button logic to support smart routing
- Sidebar: Add sibling events section when parent exists

**Specification updates required**
- Document special page mapping configuration structure and location
- Define behavior when feature toggle is disabled
- Define sibling events display limits and sorting
- Define fallback behavior for missing parent data or special pages

**Notes based on PoC (`event-series-poc` branch)**
- Parent fields already parsed in `parseProject()` function
- Basic parent event text already added to `ProjectContent.tsx` but needs enhancement for special page linking
- No sibling events display implemented yet
- No smart back navigation implemented yet
- Header links logic has been enhanced for Wasseraktionswochen page but not for project detail pages

## Software Architecture




### Component Architecture

1. **ProjectContent Enhancement** (`frontend/src/components/project/ProjectContent.tsx`)
   - Enhance existing parent event display
   - Link to parent project detail page (automatic redirect handles special page routing)
   - Make the parent context more visually prominent

2. **ProjectSideBar Enhancement** (`frontend/src/components/project/ProjectSideBar.tsx`)
   - Add new section for "Events in this series" or "Related Events"
   - Fetch sibling events using parent_project_slug filter
   - Display using `ProjectPreviews` component (limit to 3-5 events)
   - "Show all" button links to special page if available

3. **Header Back Navigation** (location TBD - need to find where back button is rendered)
   - Add logic to detect if current project has parent
   - Use `getSpecialEventPagePath()` to determine back destination
   - Update back button text: "← Back to [parent_name]" when applicable
   - Fallback to standard browse page when no special page exists

4. **Data Fetching Strategy**
   - Parent data: Already available in project object
   - Sibling events: Fetch on component mount using `/api/projects?parent_project_slug={slug}`
   - Consider using SWR or similar for caching sibling data

### Implementation Phases

**Phase 1: Parent Context Link Enhancement**
- Enhance existing parent display in ProjectContent
- Add special page mapping configuration
- Link to parent detail page (automatic redirect already handles special page routing)

**Phase 2: Sibling Events Sidebar**
- Add sibling events section to ProjectSideBar
- Implement data fetching for siblings
- Display limited list with "Show all" button

**Phase 3: Smart Back Navigation**
- Locate back button rendering logic
- Implement smart routing based on parent special page
- Update button text with parent name

**Phase 4: Testing & Polish**
- Test with feature toggle enabled/disabled
- Test with various parent configurations
- Test edge cases (no siblings, no parent, deleted parent, etc.)
- Add loading states and error handling

### Technical Decisions



2. **Sibling Events Fetching**:
   - Use existing API endpoint with parent_project_slug filter
   - Fetch on component mount, not in getServerSideProps (to avoid blocking page load)
   - Use client-side loading state

3. **Sibling Events Display Limit**:
   - Show max 5 sibling events in sidebar
   - Sort by start_date (upcoming first, then past - same logic as special page)
   - "Show all" button when more than 5 siblings

4. **Back Navigation**:
   - Priority: Special page > Parent detail > Browse page
   - Check special page mapping and feature toggle
   - Preserve query params (like ?hub=em) when navigating

5. **Translations**:
   - Add new translation keys:
     - `back_to_parent`: "← Back to {parent_name}"
     - `events_in_this_series`: "Events in this series"
     - `related_events`: "Related events"
     - `show_all_events`: "Show all events"
     - `this_event_is_part_of`: "This {project_type} is part of {parent_name}"

## Technical Solution



### 2. Enhance ProjectContent Component

File: `frontend/src/components/project/ProjectContent.tsx`

Enhance the existing parent event display (already started in PoC):

```tsx
{project.parent_project_id && (
  <Box sx={{ mt: 2, p: 2, bgcolor: 'primary.extraLight', borderRadius: 1 }}>
    <Typography>
      {texts.this_event_is_part_of
        .replace('{project_type}', projectTypeName)
        .replace('{parent_name}', '')}
      {project.parent_project_name && project.parent_project_slug ? (
        <Link
          href={`/projects/${project.parent_project_slug}`}
          sx={{ color: 'primary.main', fontWeight: 'bold', textDecoration: 'none' }}
        >
          {project.parent_project_name}
        </Link>
      ) : (
        <span>{texts.a_project_series}</span>
      )}
    </Typography>
  </Box>
)}
```

Note: The link points to the parent project detail page. Automatic redirect (already implemented) will route to the special event page when the feature toggle is enabled.

### 3. Add Sibling Events to ProjectSideBar

File: `frontend/src/components/project/ProjectSideBar.tsx`

Add new section for sibling events:

```tsx
// Add state and effect for fetching siblings
const [siblingEvents, setSiblingEvents] = useState([]);
const [loadingSiblings, setLoadingSiblings] = useState(false);

useEffect(() => {
  if (project.parent_project_slug) {
    fetchSiblingEvents();
  }
}, [project.parent_project_slug]);

const fetchSiblingEvents = async () => {
  setLoadingSiblings(true);
  try {
    const response = await axios.get(
      `${process.env.API_URL}/api/projects/?parent_project_slug=${project.parent_project_slug}`
    );
    // Filter out current project and limit to 5
    const siblings = response.data.results
      .filter(p => p.url_slug !== project.url_slug)
      .slice(0, 5);
    setSiblingEvents(siblings);
  } catch (error) {
    console.error('Error fetching sibling events:', error);
  } finally {
    setLoadingSiblings(false);
  }
};

// Render sibling events section
{project.parent_project_id && siblingEvents.length > 0 && (
  <>
    <Typography variant="h6" className={classes.subHeader}>
      {texts.events_in_this_series}
    </Typography>
    <ProjectPreviews
      projects={siblingEvents}
      hubUrl={hubUrl}
      hasMore={false}
      isLoading={loadingSiblings}
      displayOnePreviewInRow={true}
    />
    {siblingEvents.length >= 5 && (
      <Button
        variant="outlined"
        fullWidth
        href={
          getSpecialEventPagePath(project.parent_project_slug) ||
          `/browse?parent=${project.parent_project_slug}`
        }
      >
        {texts.show_all_events}
      </Button>
    )}
  </>
)}
```

### 4. Enhance Back Navigation

Need to locate where the back button is rendered in the header and enhance it:

```tsx
// Determine back destination
const getBackDestination = () => {
  if (project.parent_project_slug) {
    const specialPage = getSpecialEventPagePath(project.parent_project_slug);
    if (specialPage) {
      return specialPage;
    }
  }
  return '/browse'; // default
};

const getBackText = () => {
  if (project.parent_project_slug && project.parent_project_name) {
    return texts.back_to_parent.replace('{parent_name}', project.parent_project_name);
  }
  return texts.back;
};

// Render back button
<Link href={getBackDestination()}>
  {getBackText()}
</Link>
```

### 5. Add Required Translations

Add to translation files:

**English:**
```typescript
back_to_parent: "← Back to {parent_name}",
events_in_this_series: "Events in this series",
related_events: "Related events",
show_all_events: "Show all events",
this_event_is_part_of: "This {project_type} is part of ",
```

**German:**
```typescript
back_to_parent: "← Zurück zu {parent_name}",
events_in_this_series: "Veranstaltungen in dieser Reihe",
related_events: "Verwandte Veranstaltungen",
show_all_events: "Alle Veranstaltungen anzeigen",
this_event_is_part_of: "Diese {project_type} ist Teil von ",
```

## Testing Strategy

### Unit Tests



2. **Test ProjectContent**:
   - Test parent context display with special page
   - Test parent context display without special page
   - Test parent context display with no parent
   - Test with feature toggle disabled

### Integration Tests

1. **Test ProjectSideBar**:
   - Test sibling events fetch and display
   - Test with 0, 1, 5, and 10+ siblings
   - Test "Show all" button link destination

2. **Test Back Navigation**:
   - Test back to special page when available
   - Test back to browse when no special page
   - Test back button text with parent name

### Manual Testing Checklist

- [ ] View child event with special page parent (Wasseraktionswochen)
- [ ] Verify back button goes to special page
- [ ] Verify back button text includes parent name
- [ ] Verify sibling events appear in sidebar
- [ ] Verify "Show all" button links to special page
- [ ] Verify parent context box displays and links correctly
- [ ] Disable WASSERAKTIONSWOCHEN_FEATURE toggle
- [ ] Verify back button goes to browse page
- [ ] Verify parent context links to parent detail page
- [ ] Verify "Show all" links to browse with filter
- [ ] Test with event having no siblings
- [ ] Test with event having 10+ siblings
- [ ] Test with regular project (no parent)
- [ ] Test in both English and German locales
- [ ] Test responsive design on mobile

## Definition of Done


- [ ] Parent context display enhanced with special page linking
- [ ] Sibling events section added to sidebar
- [ ] Smart back navigation implemented
- [ ] All translations added for English and German
- [ ] Unit tests written and passing
- [ ] Manual testing completed with checklist
- [ ] Feature toggle behavior verified (on/off)
- [ ] Code reviewed and approved
- [ ] Documentation updated if needed
- [ ] No regressions in existing project detail pages
- [ ] Works correctly for events with and without parents
- [ ] Works correctly with feature toggle enabled and disabled

## Log

- 2026-02-02 15:30 UTC - Task created, awaiting user review of problem statement
- 2026-02-02 16:00 UTC - Simplified spec to remove centralized special page URL logic for this pilot case.

