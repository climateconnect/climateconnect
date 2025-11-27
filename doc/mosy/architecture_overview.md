# Architecture Overview (Mosy Framework)

## Introduction
This document outlines the architecture of Climate Connect using the Mosy Framework principles. It aligns business objectives with technical implementation.

## Core Components

### 1. Actors
- **Guest**: Unauthenticated visitor.
- **Member**: Verified registered user.
- **Organization**: Organization represented by a user.
- **Admin**: Platform administrator.
- **Networker**: Platform administrator of a specific climate hub.

### 2. Technical Stack
- **Frontend**: Next.js (React), TypeScript, Tailwind CSS.
- **Backend**: Python (Django), Django Rest Framework.
- **Database**: PostgreSQL (PostGIS).
- **Async/Queue**: Redis, Celery.
- **Storage**: Azure Blob Storage (Production).
- **External Services**:
  - Mailjet (Email).
  - OpenStreetMap/Nominatim (Geocoding).
  - Sentry (Monitoring).

### 3. Documentation Map
- **[System Entities](./entities/system-entities.md)**: Data models and domain objects.
- **[Functional Flows](./flows/core-flows.md)**: User journeys and system processes.
- **[Objectives & Metrics](./metrics/objectives.md)**: Success criteria.
