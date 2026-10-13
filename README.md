# ReviseMind — Spaced Repetition & Active Recall System

ReviseMind is a full-stack web application designed to help learners organize subjects and topics, record study sessions, automatically schedule spaced repetition revisions (at 0, 3, 7, 14, and 21 days by default), and perform active recall self-testing.

---

## Architecture Overview

- **Backend:** Java 21, Spring Boot 3.3.4 (Spring Web, Spring Data JPA, Spring Security, Spring Boot Actuator, Flyway, springdoc-openapi / Swagger).
- **Frontend:** React 18, TypeScript, Vite, React Router, TanStack Query, Tailwind CSS, Lucide Icons.
- **Database:** PostgreSQL 16 (H2 in-memory mode for unit/integration tests).
- **Authentication Strategy:** JWT / Spring Security (scaffolded foundation in M1, user registration/login endpoints in M2).

---

## Local Setup Instructions

### Prerequisites
- Java 21 JDK
- Node.js (v18+) and npm
- Docker Desktop / Docker Compose (for local PostgreSQL database)

### 1. Database Setup
Start the local PostgreSQL container using Docker Compose:
```bash
docker compose up -d
```
The database will be available at `localhost:5432` (database: `revisemind`, user: `revisemind`, password: `revisemind_pass`).

### 2. Backend Setup & Execution
1. Copy `.env.example` to `.env` if custom environment overrides are needed.
2. Navigate to the backend directory and compile/test:
   ```bash
   cd backend
   mvn clean test
   ```
3. Run the Spring Boot application:
   ```bash
   mvn spring-boot:run
   ```
   The backend API will start on `http://localhost:8080`.
   - **Actuator Health:** `http://localhost:8080/actuator/health`
   - **Swagger OpenAPI UI:** `http://localhost:8080/swagger-ui.html`

### 3. Frontend Setup & Execution
1. In a new terminal, navigate to the frontend directory:
   ```bash
   cd frontend
   npm install
   ```
2. Run frontend tests:
   ```bash
   npm test
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

---

## Milestone Status

- [x] **Milestone 1 — Foundation:** Scaffolding complete for Spring Boot backend, PostgreSQL schema migrations with Flyway, React + Vite + Tailwind CSS frontend, Actuator health endpoints, Docker Compose setup, and unit/integration tests.
- [x] **Milestone 2 — Authentication & User Authorization:** User registration with BCrypt password hashing, login/logout, JWT token authentication, stateless SecurityFilterChain, current user session endpoint (`/api/v1/auth/me`), protected routes, and Auth forms.
- [x] **Milestone 3 — Subjects & Topics Management:** Domain models for Subjects and Topics with user ownership scoping, Flyway schema migration `V2`, paginated REST API, soft deletion/archiving, topic count aggregation, and React UI pages with search, modals, and breadcrumbs.
- [x] **Milestone 4 — Study Sessions & Revision Scheduling:** Transactional study session logging, customizable schedule offsets (default `0, 3, 7, 14, 21` days) calculated in user time zone, Flyway migration `V3`, settings configuration API & page, and study session creation form.
- [x] **Milestone 5 — Active Recall Revision Workflow:** Due Today, Overdue, Upcoming, and Completed revision queues, Active Recall workflow with recall prompt, "Reveal Notes" toggle, 4-outcome selector (`AGAIN`, `HARD`, `GOOD`, `EASY`), reflection capture, and completion endpoint with duplicate-submission protection.
- [x] **Milestone 6 — Dashboard Metrics & Revision History:** Live dashboard summary metrics (due today, overdue, completed today, total sessions, active subjects, completion rate %), upcoming revisions list, and revision & study session history log with tabs and pagination.
- [x] **Milestone 7 — Polish, Final Verification & Delivery:** End-to-end verification of all core user journeys, zero test failures across backend (`mvn test`) and frontend (`npm test`), production build validation (`npm run build`), OpenAPI Swagger UI documentation (`/swagger-ui.html`), and Actuator health check integration.
- [ ] **Milestone 7 — UI Polish, Verification & Final Delivery**
