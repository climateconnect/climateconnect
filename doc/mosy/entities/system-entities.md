# System Entities

This document defines the core system entities for Climate Connect, serving as the "Data Model" view of the Mosy Framework.

## 1. Identity & Access

### User
- **Definition**: The central actor on the platform. Extends Django's authentication user.
- **Properties**:
  - `id`: UUID
  - `email`: String (Unique)
  - `first_name`: String
  - `last_name`: String
  - `bio`: Text
  - `is_verified`: Boolean
  - `verification_status`: Enum
- **Relationships**:
  - Has One `UserProfile` (Extended attributes).
  - Has Many `UserBadge` (Gamification).
  - Has Many `Skill` (Capabilities).
  - Belongs to `Location`.

### Role
- **Definition**: Access control definition for members of groups.
- **Properties**:
  - `name`: String (e.g., "Admin", "Member")
  - `permissions`: JSON/Bitmask
- **Relationships**:
  - Used by `ProjectMember`, `OrganizationMember`, `Participant`.

### Availability
- **Definition**: Time commitment level a user can pledge.
- **Properties**: `label` (e.g., "5-10 hours/week").
- **Relationships**: Referenced by `UserProfile`, `MembershipRequests`.

## 2. Climate Action (Core Domain)

### Organization
- **Definition**: Legal entity or group (NGO, Company) acting on the platform.
- **Properties**:
  - `name`: String
  - `type`: Enum (NGO, Startup, Corporate)
  - `description`: Text
  - `logo`: ImageURL
- **Relationships**:
  - Has Many `Project` (Owner).
  - Has Many `OrganizationMember` (Staff/Volunteers).
  - Has Many `Hub` (Affiliations).
  - Has Many `Sector` (Focus areas).

### Project
- **Definition**: A specific initiative, event, or campaign to address climate issues.
- **Properties**:
  - `title`: String
  - `status`: Enum (Idea, In-Progress, Finished, Cancelled)
  - `description`: Text
  - `start_date`: Date
  - `end_date`: Date
- **Relationships**:
  - Owned by `Organization` or `User`.
  - Located at `Location`.
  - Requires `Skill` (Matching).
  - Has Many `ProjectMember` (Team).
  - Has Many `Post` (Updates).

### MembershipRequest
- **Definition**: A request from a user to join a Project or Organization.
- **Properties**:
  - `status`: Enum (Pending, Approved, Rejected)
  - `message`: Text
- **Relationships**:
  - Links `User` to `Project` OR `Organization`.

## 3. Community & Hubs

### Hub
- **Definition**: A community space organized by geography (City/Country) or sector (Topic).
- **Properties**:
  - `name`: String
  - `slug`: String (URL identifier)
  - `type`: Enum (Location, Sector, Custom)
- **Relationships**:
  - Parent `Hub` (Hierarchy).
  - Has Many `HubAmbassador` (Leaders).
  - Has Many `Project` (Aggregated content).

### HubTheme
- **Definition**: Visual customization for a specific Hub.
- **Properties**: `primary_color`, `header_image`.
- **Relationships**: Belongs to `Hub`.

### Sector
- **Definition**: Climate focus area (e.g., Energy, Transport).
- **Properties**: `name`.
- **Relationships**: Used to categorize `Project`, `Organization`, `User`.

## 4. Innovation & Ideas (deprecated)

### Idea
- **Definition**: An early-stage proposal or concept that is not yet a full project.
- **Properties**:
  - `title`: String
  - `summary`: Text
  - `impact_potential`: Text
- **Relationships**:
  - Created by `User`.
  - Shared in `Hub`.
  - Has Many `IdeaSupporter` (Endorsements).
  - Has Many `IdeaRating` (Feasibility scores).

## 5. Communication

### MessageParticipants (Conversation)
- **Definition**: A chat container (thread) for users.
- **Properties**: `created_at`.
- **Relationships**:
  - Has Many `Participant` (Users).
  - Has Many `Message`.
  - Can relate to `Idea` (Context).

### Message
- **Definition**: A single text unit in a conversation.
- **Properties**: `content`, `timestamp`.
- **Relationships**:
  - Sent by `User`.
  - Belongs to `MessageParticipants`.

### Notification
- **Definition**: System alert for a user (18+ types).
- **Properties**: `type`, `is_read`.
- **Relationships**:
  - Target `User`.
  - Triggered by `Event` (Comment, Like, Follow).

## 6. Intelligence & Matching

### Question
- **Definition**: A survey item for the Climate Match algorithm.
- **Properties**: `text`, `answer_type` (Scale, Text, Choice).

### UserQuestionAnswer
- **Definition**: A user's response to a matching question.
- **Properties**: `value`.
- **Relationships**:
  - Links `User` to `Question`.
  - Scoped by `Hub`.
  - Uses `AnswerMetaData` for weighting.

## 7. Geography

### Location
- **Definition**: Spatial reference point using PostGIS.
- **Properties**:
  - `address`: String
  - `coordinates`: Point/MultiPolygon (PostGIS)
  - `osm_id`: String (OpenStreetMap reference)
  - `city`, `country`: String
- **Relationships**: Referenced by almost all core entities (`Project`, `User`, `Hub`).
