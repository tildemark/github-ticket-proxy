# Architecture Document: Issue-Bridge (GitHub-Proxy Ticketing System)

This document outlines the system architecture, infrastructure, data model, and core workflows for **Issue-Bridge**, a secure proxy ticketing platform designed to decouple client-facing support interactions from internal engineering workflows hosted in a private GitHub repository.

---

### 1. High-Level System Architecture

The system operates as a unified Next.js full-stack application. It acts as a secure boundary between external users (Clients), internal users (Support Agents), and the engineering source of truth (GitHub).

```mermaid
graph TD
    subgraph External Actors
        C[Client]
        A[Support Agent]
    end

    subgraph Authentication
        O[OAuth: Google / Facebook]
    end

    subgraph OCI Ampere A1: Docker/Portainer
        subgraph Next.js Container
            FE[Frontend UI: React + shadcn/ui]
            BE[Backend: Server Actions & API Routes]
            WR[Webhook Receiver]
        end
        DB[(PostgreSQL 16)]
        R[(Redis 7)]
    end

    subgraph External Services
        GH[Private GitHub Repo]
    end

    C -->|Submit & View Tickets| FE
    A -->|Manage & Escalate| FE
    FE <--> BE
    BE <-->|Auth| O
    BE <-->|Prisma ORM| DB
    BE <-->|Queue / Cache| R
    
    BE -->|REST API: Create Issue| GH
    GH -->|Webhook: Status Updates| WR
    WR -->|Push to Queue| R

```

**Architecture Components:**

* **Next.js App Router (Frontend + Backend):** Handles SSR/SSG rendering, client-side interactions, and server-side business logic. Client and Agent UIs are isolated via route groups `(client)` and `(dashboard)`.
* **PostgreSQL:** The primary relational data store for users, tickets, internal comments, and authentication state.
* **Redis:** Serves as a high-throughput message queue to buffer incoming GitHub webhooks, preventing timeout disconnects during traffic spikes or database locks.
* **Authentication Boundary:** Managed by Auth.js using a JWT strategy, supporting OAuth (Google, Facebook) and standard Credentials.

---

### 2. Infrastructure & Deployment (OCI Always Free)

The deployment architecture leverages Oracle Cloud Infrastructure (OCI) Ampere A1 ARM-based compute instances, orchestrated via Docker and Portainer.

```mermaid
architecture-beta
    group vcn(cloud)[OCI Virtual Cloud Network]
    
    service loadbalancer(server)[Ingress / Reverse Proxy] in vcn
    
    group docker(server)[Docker Engine / Portainer Stack] in vcn
    service app(server)[Next.js Container - linux/arm64] in docker
    service db(database)[PostgreSQL 16 Container] in docker
    service cache(database)[Redis 7 Container] in docker
    
    loadbalancer:R --> L:app
    app:R --> L:db
    app:R --> L:cache

```

**Deployment Specifications:**

* **Compute:** VM.Standard.A1.Flex (4 OCPUs, 24GB RAM).
* **Architecture Constraint:** All Docker images must be built for the `linux/arm64` architecture. Next.js uses standalone output mode to minimize container footprint.
* **Orchestration:** A single `docker-compose.yml` deployed via Portainer manages the Next.js, Postgres, and Redis containers on an internal Docker bridge network, ensuring DB and Cache ports are never exposed to the public internet.

---

### 3. Data Model Architecture

The data architecture enforces strict separation of concerns. The GitHub Issue ID is stored, but is never queried or transmitted to the client-facing APIs.

```mermaid
erDiagram
    USER ||--o{ TICKET : "authors"
    USER ||--o{ COMMENT : "writes"
    USER ||--o{ ACCOUNT : "has OAuth"
    TICKET ||--o{ COMMENT : "contains"
    
    USER {
        string id PK
        string email
        string password "Nullable (OAuth)"
        enum role "CLIENT, AGENT, ADMIN"
    }
    
    ACCOUNT {
        string provider "Google, Facebook"
        string providerAccountId
    }

    TICKET {
        string id PK
        string subject
        text description
        enum status "OPEN, IN_PROGRESS, RESOLVED"
        int githubIssueId "Nullable, Hidden from Client"
        string authorId FK
    }

    COMMENT {
        string id PK
        text content
        boolean isInternal "True = Agent Only"
        string ticketId FK
        string authorId FK
    }

```

**Key Data Design Decisions:**

* `isInternal`: Allows agents to have discussions on a ticket that clients cannot see.
* `githubIssueId`: A nullable integer. If populated, the ticket is linked to the engineering team.
* **Auth.js Linking:** The `ACCOUNT` table allows a single user email to log in via multiple OAuth providers or standard credentials seamlessly.

---

### 4. Core System Workflows

#### A. Ticket Escalation (Agent to GitHub)

When a support agent determines a ticket requires a code fix, they escalate it. The system uses a GitHub App (not a Personal Access Token) to authenticate.

```mermaid
sequenceDiagram
    actor Agent
    participant UI as Next.js Frontend
    participant Server as Next.js Server Action
    participant DB as PostgreSQL
    participant GitHub as GitHub API

    Agent->>UI: Click "Escalate to Engineering"
    UI->>Server: Trigger escalateTicket(ticketId)
    Server->>DB: Verify Agent permissions & fetch ticket
    Server->>Server: Generate JWT using GitHub App Private Key
    Server->>GitHub: POST /repos/{owner}/{repo}/issues (Markdown Payload)
    
    alt Success
        GitHub-->>Server: 201 Created (Issue #42)
        Server->>DB: UPDATE Ticket SET githubIssueId = 42
        Server-->>UI: Revalidate Path (Show GitHub link to Agent)
    else Failure
        GitHub-->>Server: 403 Forbidden / Error
        Server-->>UI: Return Error Toast
    end

```

#### B. Asynchronous Webhook Processing (GitHub to System)

To prevent dropping webhooks if the database is busy, the webhook endpoint acts only as a receiver, offloading the work to Redis.

```mermaid
sequenceDiagram
    participant GitHub as GitHub Webhook
    participant API as /api/webhooks/github
    participant Redis as Redis Queue
    participant Worker as Background Worker / Cron
    participant DB as PostgreSQL

    GitHub->>API: POST Event (e.g., Issue Closed)
    API->>API: Verify HMAC SHA-256 Signature
    API->>Redis: LPUSH github_events {payload}
    API-->>GitHub: 200 OK (Immediate Acknowledgment)
    
    loop Every minute / Continuously
        Worker->>Redis: RPOP github_events
        alt Event exists
            Worker->>Worker: Parse Issue ID & Status
            Worker->>DB: SELECT id FROM Ticket WHERE githubIssueId = Issue ID
            Worker->>DB: UPDATE Ticket SET status = RESOLVED
        end
    end

```

**Security Implementations:**

1. **HMAC Verification:** The webhook receiver validates the `x-hub-signature-256` header against the GitHub App Webhook Secret to ensure payloads cannot be spoofed.
2. **Environment Variable Isolation:** The GitHub App Private Key and Client Secrets exist only inside the backend Node.js process and are never exposed to the `NEXT_PUBLIC_` environment space.
