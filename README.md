# 14th Gawad Kaligtasan at Kalusugan (GKK) Awards Portal

Welcome to the official repository for the **14th Gawad Kaligtasan at Kalusugan (GKK) Awards Portal**. This system serves as the digital infrastructure for the Occupational Safety and Health Center (OSHC), recognizing outstanding OSH achievements in the Philippines.

---

## Recent Update: Supabase Migration
The system has been migrated from a Firebase/localStorage mock to a robust **Supabase** live backend. This provides:
- **Persistent Data**: No more session loss; all data is stored in PostgreSQL.
- **Relational Integrity**: Proper foreign keys between Users, Applications, and Documents.
- **Scalability**: A dedicated `application_documents` table for handling heavy file uploads efficiently.

---

## Features

- **Public Landing Page**: Interactive showcase of award categories, timeline, and champions.
- **Unified Nominee Portal**: Registration via passkeys, profile management, and document submission.
- **Role-Based Portals**:
    - **REU (Regional Extension Unit)**: Front-line document verification and Stage 1 vetting.
    - **Evaluator / Regional Board**: Scoring and site inspection triggering.
    - **SCD (Safety Control Division)**: Oversight and final validation.
    - **Admin**: Full pipeline control and system audit visibility.
- **Multi-Stage Workflow**: Automated progression through Stage 1 (Technical), Stage 2 (Shortlist), and Stage 3 (National Board).

---

## Tech Stack

- **Frontend**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Styling**: Vanilla CSS (Custom tokens) + [Lucide React Icons](https://lucide.dev/)
- **Infrastructure**: Local Node.js development environment

---

## Demo Access

For development and testing, the following credentials and keys are pre-seeded in the database:

| Role | Access Type | Credential | Key Type |
| :--- | :--- | :--- | :--- |
| **Admin** | Email | `admin@local` | - |
| **Admin** | Passkey | `ADMIN-SB-REUSABLE` | Reusable |
| **Nominee** | Passkey | `GKK-SB-DEMO-2024` | Single Activation |

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0+)
- A Supabase Project

### Installation

1. **Clone and Install**:
   ```bash
   git clone <repo-url>
   cd oshc-gkk-awards-main
   npm install
   ```

2. **Supabase Configuration**:
   The application uses the Supabase client initialized in `services/supabaseClient.ts`. 
   
   If you aren't using the pre-configured project, ensure you update your variables:
   - `supabaseUrl`: Your Supabase Project URL.
   - `supabaseKey`: Your Supabase Anon/Publishable Key.

3. **Start Development**:
   ```bash
   npm run dev
   ```

---

## Project Structure

- `src/components/portal/`: Contains the core logic for Nominee and Evaluator dashboards.
- `src/services/dbService.ts`: The central data access layer, now fully powered by Supabase.
- `src/services/supabaseClient.ts`: Connection handler for the Supabase backend.
- `src/types.ts`: Shared TypeScript interfaces for data consistency.

---

## Database Overview (Live)

The system utilizes 7 core tables:
1. `users`: Profiles & roles.
2. `access_keys`: Registration passcodes.
3. `applications`: Core award submission data.
4. `application_documents`: Dedicated file tracking (Refined for performance).
5. `requirements`: Dynamic checklists by category.
6. `gkk_winners`: Hall of fame archive.
7. `system_logs`: Audit logs of all actions.

---

*This system was developed specifically for the Occupational Safety and Health Center (OSHC) under the Department of Labor and Employment (DOLE) of the Philippines.*
