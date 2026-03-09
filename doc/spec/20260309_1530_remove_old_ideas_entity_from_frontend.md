# Remove Old Ideas Entity from Frontend

**Status**: DRAFT
**Type**: Cleanup / Technical Debt
**Date and time created**: 2026-03-09 15:30 UTC
**Date Completed**: TBD
**Related GitHub Issue**: N/A
**Related Specs**:
- [`doc/mosy/architecture_overview.md`](../mosy/architecture_overview.md)

## Problem Statement

The old standalone "ideas" entity is no longer being used or exposed in the Climate Connect platform. However, significant frontend code remains that references this deprecated entity. This dead code must be removed to clean up the codebase and eliminate confusion.

**Important Note**: The "idea" project type within the projects system should be preserved. This cleanup only targets the old standalone ideas entity that had its own browse tab, API endpoints, and notification system.

**Core Requirements (User/Stakeholder Stated):**

1. Identify and remove all frontend code related to the old standalone ideas entity
2. Preserve all legitimate "idea" project type functionality within the projects system
3. Ensure no regression is introduced in the browse, project, and notification flows
4. The clean-up must be verifiable — searching for old ideas patterns should return zero hits
5. Produce a clear summary of every file changed for documentation purposes

### Non Functional Requirements

- No new dependencies introduced
- All existing ESLint / TypeScript checks must continue to pass (`yarn lint`)
- Manual regression test on browse functionality and notifications

## Investigation Results

### **COMPLETE REMOVAL REQUIRED**

#### **1. Ideas Components Directory (REMOVE)**
- `/Users/CC/Development/climateconnect/frontend/src/components/ideas/` - Entire directory containing:
  - `IdeaRatingIcon.tsx` - Component for rating old ideas
  - `IdeaHubIcon.tsx` - Component for old idea hub icons

#### **2. Ideas Text File (REMOVE)**
- `/Users/CC/Development/climateconnect/frontend/public/texts/idea_texts.tsx` - Complete text definitions for old ideas UI (224 lines)

#### **3. Browse System - Old Ideas Tab (REMOVE)**
- `/Users/CC/Development/climateconnect/frontend/public/data/possibleFilters.ts`:
  - Line 19-21: `getIdeasFilters()` function and usage
  - Line 74: `getIdeasFilters` definition

- `/Users/CC/Development/climateconnect/frontend/src/components/browse/BrowseContent.tsx`:
  - Line 178: `ideas: useRef(null)` reference

- `/Users/CC/Development/climateconnect/frontend/src/components/browse/TabContentWrapper.tsx`:
  - Line 105: `type === "ideas"` condition (old standalone ideas tab)
  - Note: This treats ideas as special case, allowing display even with no items

- `/Users/CC/Development/climateconnect/frontend/src/components/browse/MobileBottomMenu.tsx`:
  - Line 43: `ideas: EmojiObjectsIcon` mapping (old ideas tab)

#### **4. Data Operations - Old Ideas Entity (REMOVE)**
- `/Users/CC/Development/climateconnect/frontend/public/lib/parsingOperations.ts`:
  - Line 10: `if (type === "ideas") return parseIdeas(data);`
  - Lines 36-40: `parseIdeas` function

- `/Users/CC/Development/climateconnect/frontend/public/lib/getDataOperations.ts`:
  - Line 20-22: `idea` parameter handling for old ideas
  - Function includes `idea` parameter for URL construction

- `/Users/CC/Development/climateconnect/frontend/public/lib/urlOperations.ts`:
  - Line 43: `idea ? idea=${idea.url_slug}` for old ideas URLs
  - Line 129: `filterKey !== "idea"` for old ideas filtering

- `/Users/CC/Development/climateconnect/frontend/public/lib/filterOperations.ts`:
  - Line 145: Documentation mentioning "ideas" as valid type in JSDoc

#### **5. Old Ideas API & Notifications (REMOVE)**
- `/Users/CC/Development/climateconnect/frontend/public/lib/messagingOperations.ts`:
  - Line 36: `/api/ideas/${idea.url_slug}/join_chat/` - old ideas API endpoint

- `/Users/CC/Development/climateconnect/frontend/src/components/communication/notifications/Notification.tsx`:
  - Line 106-111: Old ideas notification types:
    - `idea_comment`
    - `reply_to_idea_comment` 
    - `person_joined_idea`
  - Line 234: `entityType = notification.project_comment ? "project" : "idea"` - old ideas logic
  - Line 249: URL construction for old idea notifications

- `/Users/CC/Development/climateconnect/frontend/src/components/communication/notifications/CommentNotifications.tsx`:
  - Lines 38-56: `IdeaCommentNotification` and `IdeaCommentReplyNotification` components
  - These components reference `notification.idea` and construct URLs with `#ideas` fragments

#### **6. Profile Navigation - Old Ideas (REMOVE)**
- `/Users/CC/Development/climateconnect/frontend/src/components/profile/ProfileRoot.tsx`:
  - Line 123: `ideasRef = useRef(null)`
  - Line 138-140: URL fragment handling for `#ideas`

#### **7. Text System - Old Ideas (REMOVE)**
- `/Users/CC/Development/climateconnect/frontend/public/texts/texts.ts`:
  - Line 15: `import getIdeaTexts from "./idea_texts"`
  - Line 38: `"idea"` in PageType union (old ideas page type)
  - Line 51: `idea?: any` parameter
  - Line 70: `idea` parameter in getTexts function
  - Line 102-104: `idea: getIdeaTexts({...})` call
  - Line 111: `idea` parameter in notification texts

- `/Users/CC/Development/climateconnect/frontend/public/texts/general_texts.json`:
  - Lines 694-697: `"ideas"` translation entries (old ideas tab)

- `/Users/CC/Development/climateconnect/frontend/public/texts/dashboard_texts.ts`:
  - Lines 16-22: `"create_idea"` and `"my_ideas"` entries (old ideas)

- `/Users/CC/Development/climateconnect/frontend/public/texts/settings.json`:
  - Lines 98-101: `"email_on_new_idea_join_text"` entry (old ideas)

### **LEGITIMATE IDEA PROJECT TYPE CODE (TO KEEP)**

The following files contain legitimate "idea" project type usage and should **NOT** be modified:

- `/Users/CC/Development/climateconnect/frontend/src/types.ts`:
  - Line 66: `"idea"` in ProjectType union ✓ (legitimate project type)
  - Line 65: BrowseTab already correctly excludes "ideas" ✓

- `/Users/CC/Development/climateconnect/frontend/public/data/projectTypeOptions.ts`:
  - Lines 17-20: Configuration for idea project type ✓

- `/Users/CC/Development/climateconnect/frontend/public/texts/project_texts.tsx`:
  - Lines 8-11: `project_type_idea` translations ✓

- `/Users/CC/Development/climateconnect/frontend/src/components/shareProject/ProjectDateSection.tsx`:
  - Line 37: `project_type !== "idea"` logic ✓

- `/Users/CC/Development/climateconnect/frontend/src/components/project/ProjectContent.tsx`:
  - Lines 189, 196, 275: Idea project type handling ✓

- `/Users/CC/Development/climateconnect/frontend/src/components/project/Buttons/ContactCreatorButton.tsx`:
  - Line 107: Idea project type logic ✓

- `/Users/CC/Development/climateconnect/frontend/src/components/shareProject/ShareProject.tsx`:
  - Line 159: General "ideas" reference (likely legitimate) ✓

## Implementation Plan

### Phase 1: Remove Core Ideas Components
1. Delete `/src/components/ideas/` directory
2. Delete `/public/texts/idea_texts.tsx`

### Phase 2: Remove Browse System References
1. Remove ideas filter logic from `possibleFilters.ts`
2. Remove ideas references from browse components
3. Remove ideas tab from mobile bottom menu

### Phase 3: Remove Data Operations
1. Remove ideas parsing logic
2. Remove ideas URL construction
3. Remove ideas filtering operations

### Phase 4: Remove API & Notifications
1. Remove ideas API calls
2. Remove ideas notification components
3. Remove ideas notification types

### Phase 5: Remove Text & Navigation
1. Remove ideas text imports and usage
2. Remove ideas translation entries
3. Remove ideas navigation references

### Phase 6: Cleanup & Verification
1. Run `yarn lint` to ensure no TypeScript errors
2. Search for remaining ideas patterns to verify complete removal
3. Manual testing of browse functionality

## Verification Criteria

After cleanup, the following searches should return zero results (excluding legitimate project type usage):

- `getIdeaTexts`
- `IdeaRatingIcon`
- `IdeaHubIcon`
- `idea_comment` (notification type)
- `reply_to_idea_comment` (notification type)
- `person_joined_idea` (notification type)
- `/api/ideas/`
- `#ideas` (URL fragment)
- `parseIdeas`
- `getIdeasFilters`

## Risk Assessment

**Low Risk**: The old ideas entity appears to be completely unused and already removed from the type system. No active routes or components reference it.

**Mitigation**: 
- Preserve all legitimate idea project type functionality
- Comprehensive testing of browse functionality
- Backup of modified files before changes

## Impact Assessment

**Positive Impact**:
- Reduced codebase complexity
- Elimination of dead code
- Clearer distinction between project types and old entities

**No Impact**:
- Legitimate idea project type functionality
- Existing project and event browsing
- Current notification system for projects and organizations
