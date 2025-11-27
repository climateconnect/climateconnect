# Climate Connect Domain Entities Documentation

## Overview

This document provides comprehensive documentation of the main domain entities in the Climate Connect platform. The platform is built on Django and follows a modular app-based architecture with PostgreSQL/PostGIS for data storage.

---

## Table of Contents

1. [Core User & System Entities](#1-core-user--system-entities-climateconnect_api)
2. [Organization & Project Entities](#2-organization--project-entities-organization)
3. [Messaging Entities](#3-messaging-entities-chat_messages)
4. [Hub Entities](#4-hub-entities-hubs)
5. [Idea Entities](#5-idea-entities-ideas)
6. [Location Entities](#6-location-entities-location)
7. [Climate Match Entities](#7-climate-match-entities-climate_match)
8. [Cross-Cutting Patterns](#8-cross-cutting-patterns)
9. [Entity Relationship Summary](#9-entity-relationship-summary)
10. [Key Design Principles](#10-key-design-principles)

---

## 1. Core User & System Entities (climateconnect_api)

### UserProfile

**Summary**: Extended user profile containing biographical information, skills, location, and preferences.

**Description**: The central entity representing a Climate Connect user. Extends Django's built-in User model with climate action-specific fields including biography, availability for collaboration, skills, location, email preferences, and verification status. Users can specify their time commitment, language preferences, and hub affiliations.

**Relationships**:
- **OneToOne**: Django `User` (authentication)
- **ForeignKey**: `Location` (geographic location), `Availability` (time commitment), `Language` (preferred language)
- **ManyToMany**: `Skill` (user skills), `Hub` (related_hubs - hubs user follows)
- **Referenced by**: `UserProfileTranslation`, `UserProfileSectorMapping`, `ProjectMember`, `OrganizationMember`, `Donation`, `Notification`, `UserBadge`

---

### Skill

**Summary**: Technical and non-technical skills that users possess and projects require.

**Description**: Represents abilities and competencies in the climate action space. Skills can be hierarchical with parent-child relationships, allowing for skill categorization (e.g., "Programming" as parent, "Python" as child). Used to match users with relevant projects and organizations.

**Relationships**:
- **ForeignKey**: `Self` (parent_skill - hierarchical structure)
- **ManyToMany with**: `UserProfile` (user skills), `Project` (required project skills)

---

### Badge & UserBadge

**Summary**: Gamification system for recognizing user achievements and contributions.

**Description**: Badges reward users for various platform activities and milestones. Special `DonorBadge` variant recognizes financial contributions with amount and duration thresholds. `UserBadge` links users to their earned badges.

**Relationships**:
- **Badge** → Extended by `DonorBadge`
- **UserBadge**:
  - **ForeignKey**: `User`, `Badge`
  - Creates many-to-many relationship between users and badges

---

### Donation & DonationGoal

**Summary**: Financial contribution tracking and fundraising campaign management.

**Description**: `DonationGoal` represents fundraising campaigns with monetary targets and optional hub affiliation. `Donation` records individual contributions, supporting both one-time and recurring donations with payment tracking.

**Relationships**:
- **DonationGoal**:
  - **ForeignKey**: `Hub` (optional - hub-specific fundraising)
  - **Referenced by**: `Donation`
- **Donation**:
  - **ForeignKey**: `User` (donor), `DonationGoal` (optional - associated campaign)

---

### Notification & UserNotification

**Summary**: Multi-channel notification system for platform events.

**Description**: Comprehensive notification system supporting 18 notification types including messages, comments, follows, likes, membership requests, and content updates. `UserNotification` tracks per-user notification state and read status. `EmailNotification` logs email deliveries.

**Supported notification types**:
- Chat messages
- Project/Post/Idea comments
- Project follows, likes, and publications
- Organization follows
- Membership requests
- Idea support

**Relationships**:
- **Notification**:
  - **ForeignKey**: `MessageParticipants`, `ProjectComment`, `PostComment`, `IdeaComment`, `IdeaSupporter`, `ProjectFollower`, `ProjectLike`, `Post`, `MembershipRequests`, `OrganizationFollower`, `OrgProjectPublished`
- **UserNotification**:
  - **ForeignKey**: `User`, `Notification`
- **EmailNotification**:
  - **ForeignKey**: `User`, `Notification`

---

### Language

**Summary**: Internationalization support for multilingual content.

**Description**: Defines supported platform languages with locale information. Used throughout the system to enable translation of user-facing content. Currently supports English and German with extensibility for additional languages.

**Relationships**:
- **Referenced by**: All translation models (`ProjectTranslation`, `OrganizationTranslation`, `HubTranslation`, etc.), `UserProfile`, `Organization`, `Project`, `Hub`, `Idea`

---

### Availability

**Summary**: Time commitment levels for collaboration.

**Description**: Predefined options for how much time users can dedicate to projects or organizations (e.g., "5-10 hours/week", "Full-time volunteer"). Used in membership and matching algorithms.

**Relationships**:
- **Referenced by**: `UserProfile`, `ProjectMember`, `OrganizationMember`, `MembershipRequests`

---

### Role

**Summary**: Permission levels for member access control.

**Description**: Defines access permissions for project and organization members. Three main levels: read-only, read-write, and all (admin). Controls what actions members can perform within their teams.

**Relationships**:
- **Referenced by**: `ProjectMember`, `OrganizationMember`, `Participant` (chat)

---

### Feedback & ContentShares

**Summary**: User feedback collection and social media sharing tracking.

**Description**: `Feedback` captures user suggestions and bug reports. `ContentShares` tracks when users share projects, organizations, ideas, or profiles on social platforms (10 types: Facebook, Twitter, WhatsApp, LinkedIn, Email, etc.).

**Relationships**:
- **Feedback**: ForeignKey to `User`
- **ContentShares**: ForeignKey to `Project`, `Organization`, `Idea`, `User`

---

## 2. Organization & Project Entities (organization)

### Organization

**Summary**: Climate action organizations, companies, NGOs, and groups.

**Description**: Represents organizational entities working on climate solutions. Organizations can have parent-child relationships (e.g., chapters), belong to multiple hubs, have members with defined roles, publish projects, and be categorized by sectors and tags. Supports multilingual content via translations.

**Relationships**:
- **ForeignKey**: `Self` (parent_organization - hierarchical structure), `Location`, `Language`
- **ManyToMany**: `Hub` (hubs and related_hubs - primary and followed hubs)
- **Referenced by**: `OrganizationTranslation`, `OrganizationMember`, `OrganizationTagging`, `OrganizationSectorMapping`, `OrganizationFieldTagging`, `OrganizationFollower`, `ProjectParents`, `ProjectCollaborators`, `HubSupporter`, `Idea`, `ContentShares`

---

### Project

**Summary**: Climate action projects, events, and initiatives.

**Description**: Core entity representing climate projects with three types: project (ongoing work), event (time-bound activities), and idea (proposals). Projects have lifecycle status (idea, in-progress, finished, cancelled, recurring), location, required skills, hub affiliations, and ranking for discovery. Can have parent organization or user, collaborating organizations, members, followers, and tagged categorization.

**Key features**:
- Ranking algorithm for visibility
- Skill requirements for matching
- Geographic and hub-based discovery
- Collaborative memberships with roles
- Engagement tracking (followers, likes)

**Relationships**:
- **ForeignKey**: `ProjectStatus`, `Location`, `Language`
- **ManyToMany**: `Skill` (required skills), `Hub` (related_hubs)
- **Referenced by**: `ProjectTranslation`, `ProjectParents`, `ProjectMember`, `ProjectCollaborators`, `ProjectTagging`, `ProjectSectorMapping`, `ProjectComment`, `Post`, `ProjectFollower`, `ProjectLike`, `OrgProjectPublished`, `ContentShares`

---

### ProjectStatus

**Summary**: Lifecycle stages for projects.

**Description**: Predefined status values representing project maturity and activity state. Statuses include: idea (conceptual), in-progress (active development), finished (completed), cancelled (discontinued), and recurring (ongoing events).

**Relationships**:
- **Referenced by**: `Project`

---

### ProjectMember & OrganizationMember

**Summary**: User membership in projects and organizations with role-based access.

**Description**: Defines relationships between users and the projects/organizations they participate in. Each membership has a role (permissions), availability commitment, and timestamps. Enforces uniqueness constraint to prevent duplicate memberships.

**Relationships**:
- **ProjectMember**:
  - **ForeignKey**: `User`, `Project`, `Role`, `Availability`
  - **Unique**: (user, project)
- **OrganizationMember**:
  - **ForeignKey**: `User`, `Organization`, `Role`, `Availability`
  - **Unique**: (user, organization)

---

### MembershipRequests

**Summary**: Join requests for projects and organizations.

**Description**: Handles the workflow for users requesting to join projects or organizations. Tracks request status (pending, approved, rejected), proposed availability commitment, and optional introduction message. Used to manage team growth and vet new members.

**Relationships**:
- **ForeignKey**: `User`, `Project` (nullable), `Organization` (nullable), `Availability`
- **Referenced by**: `Notification` (notifies admins of requests)

---

### Post & PostComment

**Summary**: Project updates and discussions.

**Description**: `Post` represents news updates, progress reports, and announcements published by project members. `PostComment` enables community discussion on these updates. Both support translations, soft deletion (deleted_by tracking), and threaded conversations via parent comment relationships.

**Relationships**:
- **Post**:
  - **ForeignKey**: `Project`, `User` (author), `User` (deleted_by)
  - **Referenced by**: `PostTranslation`, `PostComment`, `Notification`
- **PostComment** (extends abstract `Comment`):
  - **ForeignKey**: `Post`, `Self` (parent_comment - threading), `User` (author), `User` (deleted_by)
  - **Referenced by**: `CommentTranslation`, `Notification`

---

### ProjectComment

**Summary**: Comments on projects for feedback and discussion.

**Description**: User-generated comments on project pages. Supports threaded discussions via parent-child relationships, translations, soft deletion, and triggers notifications to project members.

**Relationships**:
- **ForeignKey**: `Project`, `Self` (parent_comment), `User` (author), `User` (deleted_by)
- **Referenced by**: `CommentTranslation`, `Notification`

---

### ProjectFollower & OrganizationFollower

**Summary**: User subscriptions to projects and organizations.

**Description**: Enables users to follow projects and organizations for updates. Followers receive notifications when followed entities publish new content, reach milestones, or make announcements.

**Relationships**:
- **ProjectFollower**:
  - **ForeignKey**: `User`, `Project`
  - **Referenced by**: `Notification`
- **OrganizationFollower**:
  - **ForeignKey**: `User`, `Organization`
  - **Referenced by**: `Notification`

---

### ProjectLike

**Summary**: User appreciation for projects.

**Description**: Simple engagement mechanism allowing users to "like" projects. Aggregated likes contribute to project ranking and visibility in discovery algorithms.

**Relationships**:
- **ForeignKey**: `User`, `Project`
- **Referenced by**: `Notification`

---

### ProjectTags & OrganizationTags

**Summary**: Hierarchical categorization system for projects and organizations.

**Description**: Tag taxonomies for content categorization. Both support parent-child relationships for hierarchical organization (e.g., "Renewable Energy" → "Solar", "Wind"). `ProjectTagging` and `OrganizationTagging` create many-to-many relationships with uniqueness constraints.

**Relationships**:
- **ProjectTags**:
  - **ForeignKey**: `Self` (parent_tag)
  - **ManyToMany with**: `Project` (via `ProjectTagging`), `Hub` (filter_parent_tags)
- **OrganizationTags**:
  - **ForeignKey**: `Self` (parent_tag)
  - **ManyToMany with**: `Organization` (via `OrganizationTagging`)

---

### Sector

**Summary**: Climate action sectors and focus areas.

**Description**: Represents broad climate solution categories like Energy, Transportation, Agriculture, Built Environment, etc. Sectors can relate to each other (relates_to_sector) for cross-cutting themes. Used to categorize users, projects, and organizations, and filter content in hubs.

**Relationships**:
- **ForeignKey**: `Self` (relates_to_sector)
- **ManyToMany with**: `Project` (via `ProjectSectorMapping`), `Organization` (via `OrganizationSectorMapping`), `UserProfile` (via `UserProfileSectorMapping`), `Hub`

---

### ProjectParents & ProjectCollaborators

**Summary**: Project ownership and collaboration relationships.

**Description**: `ProjectParents` links projects to their parent entity (organization or individual user). `ProjectCollaborators` tracks organizations collaborating on projects, enabling multi-stakeholder initiatives.

**Relationships**:
- **ProjectParents**:
  - **ForeignKey**: `Project`, `Organization` (nullable), `User` (nullable)
- **ProjectCollaborators**:
  - **ForeignKey**: `Project`, `Organization`

---

## 3. Messaging Entities (chat_messages)

### MessageParticipants

**Summary**: Chat conversations between users.

**Description**: Represents a chat conversation, either one-on-one or group messaging. Can be associated with an idea for collaboration discussions. Tracks conversation creator and creation timestamp.

**Relationships**:
- **ForeignKey**: `User` (created_by), `Idea` (related_idea - nullable)
- **Referenced by**: `Message`, `MessageReceiver`, `Participant`, `Notification`

---

### Message

**Summary**: Individual messages in conversations.

**Description**: Single message within a chat conversation. Contains message content, sender, timestamps, and optional reply-to reference. Delivered to all conversation participants via `MessageReceiver` tracking.

**Relationships**:
- **ForeignKey**: `MessageParticipants` (conversation), `User` (sender)
- **Referenced by**: `MessageReceiver`

---

### MessageReceiver & Participant

**Summary**: Message delivery tracking and conversation membership.

**Description**: `MessageReceiver` tracks message delivery state and read status for each recipient. `Participant` defines conversation membership with roles (creator, admin, member) and enforces user-conversation uniqueness.

**Relationships**:
- **MessageReceiver**:
  - **ForeignKey**: `User` (recipient), `Message`
- **Participant**:
  - **ForeignKey**: `User`, `MessageParticipants` (chat), `Role`
  - **Unique**: (user, chat)

---

## 4. Hub Entities (hubs)

### Hub

**Summary**: Regional or sector-based community hubs.

**Description**: Community spaces organized by geography (location hubs), climate sector (sector hubs), or custom themes. Hubs aggregate relevant projects, organizations, ideas, and members. Support parent-child relationships for hub hierarchies, custom statistics, visual theming, ambassadors, and organizational supporters. Used throughout the platform for content filtering and community building.

**Hub types**:
- **Location**: Geographic communities (cities, regions, countries)
- **Sector**: Thematic communities (energy, transport, agriculture)
- **Custom**: Special-interest communities

**Relationships**:
- **ForeignKey**: `Self` (parent_hub - hierarchy), `Language`
- **ManyToMany**: `HubStat` (displayed statistics), `ProjectTags` (filter_parent_tags), `Sector`, `Location`
- **ManyToMany with**: `UserProfile` (related_hubs), `Organization` (hubs, related_hubs), `Project` (related_hubs)
- **Referenced by**: `HubTranslation`, `HubTheme`, `HubAmbassador`, `HubSupporter`, `DonationGoal`, `Idea`, `UserQuestionAnswer`

---

### HubStat

**Summary**: Statistics displayed on hub pages.

**Description**: Configurable statistics showcasing hub impact and activity (e.g., "150 Projects", "5,000 Members", "20 Organizations"). Supports translations for multilingual hubs.

**Relationships**:
- **ForeignKey**: `Language`
- **ManyToMany with**: `Hub`
- **Referenced by**: `HubStatTranslation`

---

### HubAmbassador & HubSupporter

**Summary**: Hub community leaders and organizational sponsors.

**Description**: `HubAmbassador` designates users as community leaders and representatives for hubs. `HubSupporter` recognizes organizations providing resources or endorsement to hubs. Both enhance hub credibility and community engagement.

**Relationships**:
- **HubAmbassador**:
  - **ForeignKey**: `User`, `Hub`
- **HubSupporter**:
  - **ForeignKey**: `Hub`, `Organization`, `Language`
  - **Referenced by**: `HubSupporterTranslation`

---

### HubTheme

**Summary**: Visual customization for hub branding.

**Description**: Defines custom color schemes for hubs including primary color, secondary color, background, and header. Uses `HubThemeColor` for color palette definitions. OneToOne relationship ensures each hub has a single theme.

**Relationships**:
- **OneToOne**: `Hub`
- **ForeignKey**: `HubThemeColor` (primary, secondary, background_default, header_background)

---

## 5. Idea Entities (ideas)

### Idea

**Summary**: Climate action proposals and concepts from users.

**Description**: Represents early-stage climate action ideas that haven't yet become full projects. Ideas can be shared within specific hubs, have geographic scope, support comments and ratings, and gather supporters. Users or organizations can propose ideas which may eventually evolve into projects. Includes status tracking and multilingual support.

**Relationships**:
- **ForeignKey**: `User` (creator), `Organization` (proposing org - nullable), `Hub` (main hub and hub_shared_in), `Location`, `Language`
- **Referenced by**: `IdeaTranslation`, `IdeaComment`, `IdeaRating`, `IdeaSupporter`, `MessageParticipants`, `ContentShares`

---

### IdeaComment

**Summary**: Discussion threads on ideas.

**Description**: User comments on idea proposals. Supports threaded discussions, translations, soft deletion, and notifications to idea creators and participants.

**Relationships**:
- **ForeignKey**: `Idea`, `Self` (parent_comment - threading), `User` (author), `User` (deleted_by)
- **Referenced by**: `CommentTranslation`, `Notification`

---

### IdeaRating

**Summary**: User ratings for idea quality and feasibility.

**Description**: Allows users to rate ideas on various dimensions (e.g., impact potential, feasibility, innovation). Aggregated ratings help surface high-quality ideas for funding or project development.

**Relationships**:
- **ForeignKey**: `Idea`, `User`

---

### IdeaSupporter

**Summary**: Users endorsing ideas.

**Description**: Tracks users who support an idea, demonstrating community interest and validation. High supporter counts may attract resources or transition ideas to projects. Triggers notifications to idea creators.

**Relationships**:
- **ForeignKey**: `User`, `Idea`
- **Referenced by**: `Notification`

---

## 6. Location Entities (location)

### Location

**Summary**: Geographic locations with PostGIS spatial support.

**Description**: Represents any geographic location from exact addresses to cities, regions, or countries. Uses PostgreSQL PostGIS extension for spatial queries and geofencing. Stores geometry as multi_polygon and centre_point for mapping and proximity searches. Integrates with OpenStreetMap (osm_id) and Google Places (place_id) for data enrichment.

**Key features**:
- Hierarchical address structure (address → city → state → country)
- Spatial data types for geographic queries
- Multi-polygon support for region boundaries
- Centroid calculation for distance queries

**Relationships**:
- **Referenced by**: `LocationTranslation`, `UserProfile`, `Organization`, `Project`, `Idea`, `Hub` (ManyToMany)

---

## 7. Climate Match Entities (climate_match)

### Question

**Summary**: Questionnaire questions for climate matching algorithm.

**Description**: Represents survey questions used to match users with relevant projects, organizations, and hubs. Questions have dynamic answer types defined via ContentType (multiple choice, text, scale, etc.) and support translations. Used in intelligent matching algorithms.

**Relationships**:
- **ForeignKey**: `Language`, `ContentType` (answer_type - polymorphic answer format)
- **Referenced by**: `QuestionTranslation`, `Answer`, `UserQuestionAnswer`

---

### Answer

**Summary**: Predefined answer options for questions.

**Description**: Possible answers for multiple-choice and scale-type questions. Linked to metadata that weights answers for matching algorithms. Supports translations for multilingual questionnaires.

**Relationships**:
- **ForeignKey**: `Question`, `Language`
- **ManyToMany**: `AnswerMetaData` (weighting for matching)
- **Referenced by**: `AnswerTranslation`, `UserQuestionAnswer`

---

### AnswerMetaData

**Summary**: Weighting data for intelligent matching.

**Description**: Contains metadata that weights user answers for matching algorithms. Links answers to specific resources (projects, organizations, sectors, skills) via ContentType polymorphic relationships. Enables sophisticated matching logic.

**Relationships**:
- **ForeignKey**: `ContentType` (resource_type - polymorphic to match targets)
- **ManyToMany with**: `Answer`, `UserQuestionAnswer`

---

### UserQuestionAnswer

**Summary**: User responses to climate match questionnaire.

**Description**: Records user answers to questionnaire questions. Can store predefined answers or free-text responses. Hub-scoped to enable different matching profiles for different communities. Links to metadata for matching algorithm processing.

**Relationships**:
- **ForeignKey**: `User`, `Question`, `Answer` (predefined_answer - nullable), `Hub`
- **ManyToMany**: `AnswerMetaData` (answers - weighted metadata)

---

## 8. Cross-Cutting Patterns

### Translation Support

Most user-facing entities have corresponding translation models to support internationalization:
- `ProjectTranslation`, `OrganizationTranslation`, `HubTranslation`, `IdeaTranslation`
- `PostTranslation`, `CommentTranslation`
- `QuestionTranslation`, `AnswerTranslation`
- `LocationTranslation`, `HubStatTranslation`, `HubSupporterTranslation`

All translation models follow the pattern:
- **ForeignKey**: Parent entity, `Language`
- **Unique constraint**: (parent, language)

### Soft Deletion

Comments and Posts use soft deletion via `deleted_by` ForeignKey to User, preserving data integrity while hiding deleted content.

### Notification System

Many entities trigger notifications when actions occur:
- `Project`, `Organization` → follows, likes, publications
- `Comment` entities → replies and mentions
- `MembershipRequests` → approval workflows
- `Message` → chat notifications
- `IdeaSupporter` → endorsements

### Hub Integration

Hubs are a central organizing principle connecting:
- Users (via `UserProfile.related_hubs`)
- Projects and Organizations (via `related_hubs` ManyToMany)
- Ideas (via `main_hub` and `hub_shared_in`)
- Donations (via `DonationGoal.hub`)
- Climate Match (via `UserQuestionAnswer.hub`)
- Geographic and sector filters

### Skill & Role-Based Access

- `Skill` connects users to projects for matching
- `Role` governs permissions in projects, organizations, and chats
- `Availability` defines time commitment across memberships

---

## 9. Entity Relationship Summary

### Core Relationships

```
User (Django auth)
├── UserProfile (OneToOne)
│   ├── Skills (ManyToMany)
│   ├── Location (ForeignKey)
│   ├── Hubs (ManyToMany - related_hubs)
│   ├── Availability (ForeignKey)
│   └── Sectors (ManyToMany via UserProfileSectorMapping)
│
├── ProjectMember (user participation)
│   ├── Project (ForeignKey)
│   ├── Role (ForeignKey)
│   └── Availability (ForeignKey)
│
├── OrganizationMember (user participation)
│   ├── Organization (ForeignKey)
│   ├── Role (ForeignKey)
│   └── Availability (ForeignKey)
│
├── Idea (creator)
├── Donation (donor)
├── Message (sender)
├── Comments (author)
├── Notifications (recipient)
└── Badges (via UserBadge)

Organization
├── Location (ForeignKey)
├── Parent Organization (ForeignKey Self)
├── Hubs (ManyToMany - primary and related)
├── Sectors (ManyToMany via OrganizationSectorMapping)
├── Tags (ManyToMany via OrganizationTagging)
├── Members (OrganizationMember)
├── Projects (via ProjectParents)
└── Followers (OrganizationFollower)

Project
├── Location (ForeignKey)
├── Status (ForeignKey)
├── Skills Required (ManyToMany)
├── Hubs (ManyToMany - related_hubs)
├── Sectors (ManyToMany via ProjectSectorMapping)
├── Tags (ManyToMany via ProjectTagging)
├── Parent (Organization or User via ProjectParents)
├── Collaborators (Organizations via ProjectCollaborators)
├── Members (ProjectMember)
├── Posts (updates)
├── Comments (ProjectComment)
├── Followers (ProjectFollower)
└── Likes (ProjectLike)

Hub
├── Parent Hub (ForeignKey Self)
├── Locations (ManyToMany)
├── Sectors (ManyToMany)
├── Stats (ManyToMany HubStat)
├── Filter Tags (ManyToMany ProjectTags)
├── Theme (OneToOne HubTheme)
├── Ambassadors (HubAmbassador)
├── Supporters (HubSupporter)
└── Associated Content:
    ├── Users (via UserProfile.related_hubs)
    ├── Projects (via related_hubs)
    ├── Organizations (via hubs/related_hubs)
    ├── Ideas (via main_hub/hub_shared_in)
    └── Donation Goals (via hub)

Idea
├── Creator (User ForeignKey)
├── Organization (ForeignKey - optional)
├── Main Hub (ForeignKey)
├── Hub Shared In (ForeignKey)
├── Location (ForeignKey)
├── Comments (IdeaComment)
├── Ratings (IdeaRating)
└── Supporters (IdeaSupporter)

MessageParticipants (Chat)
├── Creator (User ForeignKey)
├── Related Idea (ForeignKey - optional)
├── Messages (Message)
├── Participants (Participant with Roles)
└── Message Receivers (MessageReceiver)

ClimateMatch
├── Question
│   ├── Answers (predefined options)
│   │   └── AnswerMetaData (ManyToMany - matching weights)
│   └── UserQuestionAnswer (user responses)
│       ├── Hub (ForeignKey - scoped matching)
│       └── AnswerMetaData (ManyToMany - selected weights)
```

---

## 10. Key Design Principles

1. **Multilingual First**: Dedicated translation tables for all user-facing content
2. **Hub-Centric**: Hubs organize and filter all major content types
3. **Geographic Awareness**: PostGIS integration for spatial queries and location-based discovery
4. **Flexible Relationships**: Organizations can own projects, users can create projects independently
5. **Engagement Tracking**: Followers, likes, comments, and supporters across entities
6. **Permission Model**: Role-based access control for collaborative entities
7. **Notification System**: Event-driven notifications for platform activity
8. **Soft Deletion**: Preserve data integrity for comments and posts
9. **Hierarchical Structures**: Parent-child relationships for organizations, hubs, tags, skills, sectors
10. **Matching Intelligence**: ClimateMatch system with weighted metadata for user-project-organization matching

---

## Total Entity Count

- **Core Domain Models**: 80+ entities
- **Translation Support Tables**: 14 models
- **Mapping/Junction Tables**: 15+ models for many-to-many relationships
- **Total**: 100+ database tables

This architecture supports a comprehensive climate action platform with social networking, project management, real-time messaging, gamification, multilingual support, and intelligent matching capabilities.

## Version History

- **2025-11-27**: Initial documentation