# Core Functional Flows

## 1. User Onboarding Flow
- **Actor**: Guest
- **Trigger**: User clicks "Sign Up"
- **Actions**:
  1.  User submits registration form (Email/Password).
  2.  System sends verification email (via Mailjet).
  3.  User clicks verification link.
  4.  System activates account.
  5.  User completes profile setup.

## 2. Project/Event/Idea Creation Flow
- **Actor**: Member, Organization
- **Trigger**: User clicks "Share"
- **Actions**:
  1. User selects a type of project (Event, Idea, etc.). 
  2. User inputs project details (Title, Description, Location).
  3. System validates inputs.
  4. System saves Project as "Draft" or "Published".
  5. System notifies followers (if applicable).

## 3. Organization Creation Flow
- **Actor**: Member
- **Trigger**: User clicks "Create Organization" on profile page
- **Actions**:
   1. User inputs organization details (Name, Description, Location).
   2. System validates inputs.
   3. System saves Organization.

## 4. Search & Discovery Flow
- **Actor**: Member
- **Trigger**: User searches for projects/events/organizations
- **Actions**:
  1.  User enters keywords or selects location hub.
  2.  System queries database/index.
  3.  System returns filtered and ranked list of results.
