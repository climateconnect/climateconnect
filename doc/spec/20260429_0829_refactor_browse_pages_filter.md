# Refactor Browse Pages and Filter

## Problem Statement

The current browse functionality (projects, organisations, members) is implemented as tabs within a single page with a shared filter component. This architecture leads to state management complexities and bugs, such as empty organisations or members pages when accessed directly after initial load without spending time on the projects tab. The filter is partially shared across tabs with different field sets per data type, and query parameter handling uses fragile string manipulation methods that can result in malformed URLs.

Refactoring the browse pages into separate, dedicated pages with individual URLs will simplify the codebase by eliminating unnecessary state handling, improve performance by loading data only when each page is accessed, and enhance user experience through direct navigation capabilities. The filter will be refactored into a shared context that preserves user selections across page switches while adapting field availability based on the current data type.

This change addresses the immediate bug while providing long-term maintainability benefits for the Climate Connect platform's browse functionality.

## Acceptance Criteria

- [ ] Separate Next.js pages exist for /browse/projects, /browse/organisations, and /browse/members
- [ ] Each page loads its respective data independently on access
- [ ] Filter state is preserved when navigating between browse pages
- [ ] Filter fields adapt appropriately based on the current data type (projects, organisations, members)
- [ ] Query parameters are managed using Axios's built-in support for query parameter collections instead of manual string concatenation
- [ ] URLs no longer contain malformed query strings
- [ ] URLs remain shareable and bookmarkable with filter state reflected in query parameters
- [ ] Redirects are implemented from old tab-based URLs to the new page URLs where possible
- [ ] No empty pages occur when accessing organisations or members pages directly
- [ ] Filter context maintains shared state across page navigations
- [ ] Existing filter functionality and user preferences are preserved

## Constraints and Non-Negotiable Requirements

- Changes are confined to the frontend (Next.js) codebase
- Maintain backward compatibility through URL redirects
- Preserve all existing filter options and their functionality
- No changes to backend API endpoints or data structures
- Filter state must persist across page switches within the same session
- Performance should not degrade (lazy loading per page)

## Domain Context

Climate Connect is a platform connecting climate activists, organizations, and projects globally. The browse functionality allows users to discover and filter climate-related content across three main entity types: projects (initiatives and activities), organizations (groups and institutions), and members (individual contributors). The current tabbed interface with shared filtering creates navigation and state management challenges that impact user experience and code maintainability.

## AI Insights

### Implementation Hints
- Use React Context API for managing shared filter state across pages
- Create separate static routes for /browse/projects, /browse/organisations, and /browse/members (or optionally use dynamic routing if preferred)
- Implement filter persistence using localStorage or sessionStorage
- Utilize Axios's params configuration for automatic query parameter serialization
- Create a reusable FilterContext provider wrapping the browse pages
- Use conditional rendering in filter components based on page type

### Trade-off Notes
- **Complexity vs. Performance**: Separate pages increase initial load times slightly but eliminate complex state management, trading short-term performance for long-term maintainability
- **URL Structure**: New dedicated URLs improve SEO and direct linking but require redirects from legacy tab URLs
- **Filter State Management**: Context-based shared state simplifies inter-page communication but adds slight overhead compared to component-local state
- **Code Duplication**: Some filter logic may need duplication across page types, but this is offset by removing tab-specific conditional rendering logic