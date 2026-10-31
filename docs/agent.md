You are an expert full-stack developer architecture assistant. We are building "Issue-Bridge," an internal-facing support ticketing system that acts as a proxy between clients and a private GitHub repository.

**Tech Stack:**

- Framework: Next.js 16+ (App Router)
- Authentication: Auth.js (NextAuth v5) using bcrypt for password hashing
- Database: PostgreSQL (via Prisma ORM)
- Caching/Queue: Redis
- UI/Styling: Tailwind CSS, shadcn/ui
- Target Environment: Docker (linux/arm64 architecture on OCI Ampere)

**Core Business Logic:**
Clients log in to a secure portal to submit and track tickets. Support agents triage these tickets and can escalate them to create an Issue in a private GitHub repo. The database stores the `githubIssueId` internally, completely hiding the GitHub integration from the client. Future scope includes ingesting replies from email and messaging platforms.

**Please execute the following tasks sequentially:**

**Task 1: Initialize Auth.js & Prisma Schema (OAuth + Credentials)**
Set up the Prisma schema to support Auth.js with Google, Facebook, and Email/Password credentials, plus our omnichannel ticketing requirements. Include `binaryTargets = ["native", "linux-arm64-openssl-3.0.x"]`.

1. Include all standard Auth.js required models (`Account`, `Session`, `VerificationToken`).
2. Update the `User` model to include Auth.js fields (`emailVerified`, `image`).
   - Add a `password` field (String, optional - because OAuth users won't have one).
   - Add our custom `role` enum (CLIENT, AGENT, ADMIN) with a default of CLIENT.
3. Create the `Ticket` model:
   - Standard fields: `id`, `subject`, `description`, `status`, `priority`, `authorId`, `createdAt`, `updatedAt`.
   - GitHub Proxy fields: `githubIssueId` (Int, optional), `githubIssueUrl` (String, optional).
   - Omnichannel fields: `source` (Enum: WEB, EMAIL, MESSAGING), `externalThreadId` (String, optional).
4. Create the `Comment` model:
   - Standard fields: `id`, `content`, `ticketId`, `authorId`, `createdAt`.
   - Privacy field: `isInternal` (Boolean, default false).
   - Omnichannel field: `externalMessageId` (String, optional).

**Task 2: Implement Multi-Provider Authentication**
Generate the Next.js auth configuration utilizing Auth.js v5.

1. Create the `auth.ts` config file and the API route (`app/api/auth/[...nextauth]/route.ts`).
2. Configure the Prisma Adapter.
3. Set the session strategy to `"jwt"` (required when using the Credentials provider).
4. Configure 3 providers:
   - `Google`
   - `Facebook`
   - `Credentials`: Implement the `authorize` function to look up the user by email, compare the hashed password using bcrypt, and return the user object if successful.
5. Create a `middleware.ts` file to protect the `/dashboard` and `/tickets` routes, redirecting unauthenticated users to `/login`.

**Task 3: Build the Login & Client Dashboard UI**
Generate the UI using shadcn/ui components (`table`, `button`, `badge`, `input`, `form`).

1. `app/(auth)/login/page.tsx`: A login page featuring a standard email/password form, an "OR" divider, and two OAuth buttons (Login with Google, Login with Facebook).
2. `app/(client)/dashboard/page.tsx`: A view where the client sees ONLY the tickets where `authorId` matches their session ID.
3. `app/(client)/tickets/[id]/page.tsx`: The ticket detail view for the client. They should see the original description, public replies, and a text area to add new comments. DO NOT expose the `githubIssueId` to this view.

Ensure all generated code uses TypeScript, handles loading states properly, and uses Tailwind CSS.
