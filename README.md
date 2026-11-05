# 🏙️ CivicPulse — Smart Civic Governance & Issue Management Platform

<div align="center">

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Online%20App-0d9488?style=for-the-badge&logo=render&logoColor=white)](#-live-demo--preview)
[![Deploy to Render](https://img.shields.io/badge/Deploy%20to-Render-46E3B7?style=for-the-badge&logo=render&logoColor=black)](https://render.com/deploy)
[![Docker Ready](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)](#-quick-start-with-docker)

<br/>

[![Java](https://img.shields.io/badge/Java-17-orange.svg?style=flat-square&logo=openjdk&logoColor=white)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.0.7-brightgreen.svg?style=flat-square&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![Spring Security](https://img.shields.io/badge/Spring%20Security-Stateless%20JWT-blue.svg?style=flat-square&logo=springsecurity&logoColor=white)](https://spring.io/projects/spring-security)
[![React](https://img.shields.io/badge/React-19.x-cyan.svg?style=flat-square&logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.x-purple.svg?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-00758F.svg?style=flat-square&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Leaflet](https://img.shields.io/badge/Leaflet-GPS%20Maps-199900.svg?style=flat-square&logo=leaflet&logoColor=white)](https://leafletjs.com/)
[![Bucket4j](https://img.shields.io/badge/Bucket4j-Rate%20Limiting-red.svg?style=flat-square)](https://github.com/bucket4j/bucket4j)
[![Tests Passing](https://img.shields.io/badge/Tests-15%2F15%20Passing-success.svg?style=flat-square)]()

<br/>

**A resilient, enterprise-grade civic governance web application empowering citizens to report public infrastructure issues with precise GPS geotagging, automated address resolution, and cryptographic email verification, while equipping municipal administrators with real-time analytics, status workflows, and citizen communication channels.**

</div>

---

## 🌐 Live Demo & Preview

Visitors and recruiters can explore the deployed application or test locally with pre-seeded demo accounts:

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Municipal Admin** | `admin@civicpulse.com` | `admin123` | Full Administrative Dashboard, Status Transitions, Issue Deletion & Analytics |
| **Citizen Demo** | `citizen@civicpulse.com` | `citizen123` | Geotagged Issue Reporting, Personal Profile Tracking, Status Updates |

> 💡 *New citizen registrations trigger live, automated 6-digit OTP delivery to the registered inbox via Gmail SMTP.*

---

## 🌟 Key Engineering & Architectural Highlights

### 📍 1. Interactive GPS Geolocation & Reverse Geocoding
- **GPS Device Location:** Detects real-time browser coordinates via the HTML5 `navigator.geolocation` API with high-accuracy fallbacks.
- **Interactive Leaflet Mapping:** Embedded responsive map with custom brand-teal pin markers and click-and-drag coordinate repositioning.
- **Automated Address Lookup:** Seamless integration with the **OpenStreetMap Nominatim API** to resolve latitude/longitude into human-readable municipal street addresses.
- **Turn-by-Turn Navigation:** Dynamic "Open in Google Maps" deep link directly navigating municipal maintenance crews to the reported coordinates.

### 📧 2. Cryptographic Email Verification & Transactional Dispatch
- **Asynchronous Email Pipeline:** Non-blocking email dispatch powered by Spring Boot's `@Async` and `MimeMessageHelper`.
- **Branded Responsive HTML Templates:** High-contrast OTP verification cards featuring CivicPulse teal accents, 15-minute expiration countdowns, and security disclaimers.
- **Defense Against Stale Codes:** Automatically regenerates OTPs upon resend requests while invalidating previous codes and resetting expiration windows.
- **Production SMTP Security:** Support for Google App Passwords and local environment injection via `.gitignore`d configurations.

### 🔐 3. Enterprise Security & Defense-in-Depth
- **Stateless JWT Architecture:** Bearer token authentication validated on every request via a custom `JwtAuthenticationFilter`.
- **Role-Based Access Control (RBAC):** Strict authorization separation between `USER` and `ADMIN` at both the Spring Security filter chain and React route guards (`<ProtectedRoute role="ADMIN" />`).
- **Bucket4j Token-Bucket Rate Limiting:** Global rate-limiting filter on `/api/auth/**` enforcing a maximum of 10 requests/minute per client IP (using `X-Forwarded-For` inspection) to prevent credential stuffing and brute-force attacks.
- **Password Salting & Hashing:** Passwords hashed with BCrypt prior to persistence.
- **File Upload Sanitization:** Multipart uploads validated against strict MIME types (JPEG, PNG) and file size caps (5 MB), with filenames sanitized using UUID hashing to eliminate path traversal vulnerabilities.

### 📊 4. Real-Time Analytics & Data Visualization
- **Dynamic Recharts Charts:** Interactive donut and pie charts showing status distribution (`Pending`, `In Progress`, `Resolved`) and color-coded category frequency histograms (`Road`, `Garbage`, `Water Leakage`, `Electricity`).
- **Administrative Telemetry:** High-level metrics showing total volume, resolution rate, and open backlog.

---

## 🏗️ System Architecture

```
                    ┌────────────────────────────────────────────────────────┐
                    │                   React 19 Frontend                    │
                    │         (Vite + React Router + Leaflet Maps)           │
                    └───────────────────────────┬────────────────────────────┘
                                                │ HTTPS / JSON (Bearer JWT)
                                                ▼
                    ┌────────────────────────────────────────────────────────┐
                    │               Bucket4j Rate Limiting                   │
                    │               (10 requests / min / IP)                 │
                    └───────────────────────────┬────────────────────────────┘
                                                │
                                                ▼
                    ┌────────────────────────────────────────────────────────┐
                    │               JwtAuthenticationFilter                  │
                    │               (Stateless Token Auth)                   │
                    └───────────────────────────┬────────────────────────────┘
                                                │
                                                ▼
                    ┌────────────────────────────────────────────────────────┐
                    │                   Spring Boot MVC                      │
                    │            (AuthController, IssueController)           │
                    └─────────────────────┬───────────────────┬──────────────┘
                                          │                   │
                        ┌─────────────────┴─┐               ┌─┴─────────────────┐
                        ▼                   ▼               ▼                   ▼
             ┌─────────────────────┐ ┌─────────────┐ ┌─────────────┐ ┌───────────────────┐
             │    IssueService     │ │ UserService │ │ Nominatim   │ │ EmailNotification │
             │ (CRUD, Multi-Filter)│ │ (Auth & OTP)│ │ Geocoding   │ │ (SMTP Mail Sender)│
             └──────────┬──────────┘ └──────┬──────┘ └─────────────┘ └─────────┬─────────┘
                        │                   │                                  │
                        ▼                   ▼                                  ▼
             ┌─────────────────────────────────────┐                  ┌───────────────────┐
             │       MySQL 8.0 / InnoDB JPA        │                  │ Real Citizen Inbox│
             │   (Users, Issues, Coordinates)      │                  │ (HTML OTP Email)  │
             └─────────────────────────────────────┘                  └───────────────────┘
```

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite 6, React Router 7, Axios, Leaflet, Recharts, React-Toastify, CSS Modules |
| **Backend** | Java 17, Spring Boot 4.0.7, Spring Security 6, Spring Data JPA, Spring Mail |
| **Database** | MySQL 8.0 with InnoDB Storage Engine |
| **Security & Utilities** | JJWT (io.jsonwebtoken), Bucket4j Core, BCrypt, Lombok, Jackson JSR-310 |
| **Geocoding & Maps** | OpenStreetMap Nominatim, Leaflet.js, Google Maps Deep Linking |
| **DevOps & Containers** | Docker, Docker Compose, Render Blueprint (`render.yaml`), Vercel SPA Config |
| **Testing & Quality** | JUnit 5, Mockito, JaCoCo Code Coverage, Node.js Edge-Case Test Harness |

---

## 📡 REST API Specifications

### Authentication & Account Security
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new citizen account and trigger email OTP |
| `POST` | `/api/auth/verify-email` | Public | Validate 6-digit OTP, activate account, and return JWT |
| `POST` | `/api/auth/resend-code` | Public | Regenerate a fresh 6-digit OTP with a 15-minute expiration |
| `POST` | `/api/auth/login` | Public | Authenticate verified user and return signed JWT |

### Issue Management & Telemetry
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/issues` | Authenticated | Multi-filter search (Admins see all; Citizens see their own) |
| `GET` | `/api/issues/{id}` | Authenticated | Fetch single issue details with coordinates and author info |
| `POST` | `/api/issues` | Authenticated | Create new civic issue with GPS coordinates & optional photo |
| `PUT` | `/api/issues/{id}` | Admin Only | Edit issue metadata, category, location, and coordinates |
| `PUT` | `/api/issues/{id}/status` | Admin Only | Update issue status (`Pending` → `In Progress` → `Resolved`) |
| `DELETE` | `/api/issues/{id}` | Admin Only | Permanently delete an issue record |
| `GET` | `/api/issues/dashboard/stats` | Admin Only | Return system metrics, category counts, and status telemetry |

---

## 🧪 Automated Testing & Empirical Verification

CivicPulse includes a rigorous, production-grade test suite covering both unit tests and end-to-end edge cases:

### 1. 15-Case Automated Edge-Case Test Suite
Located at [`scratch/test_edge_cases.js`](scratch/test_edge_cases.js):

| Category | Cases Tested | Pass Rate |
|---|---|:---:|
| **Authentication & OTP** | Registration OTP trigger, unverified login gating, invalid OTP rejection, malformed non-6-digit code validation, JWT issuance on verification, idempotent re-verification, post-verification login, duplicate email blocking, OTP resend refresh, non-existent user handling | **10/10 PASS** |
| **GPS & Geolocation** | Float precision coordinate persistence (`13.08268, 80.27072`), null coordinate backward compatibility, negative/southern hemisphere preservation (`-33.8688, 151.2093`), admin coordinate updates, Nominatim API connectivity | **5/5 PASS** |
| **Total Empirical Score** | **15 of 15 Scenarios Passed** | **100%** |

### 2. Service-Layer Unit Tests
```bash
cd backend
mvn test
```
*Executes all JUnit 5 & Mockito test cases validating authorization enforcement, filtering logic, and state transitions.*

---

## 🐳 Quick Start with Docker

Run the entire full-stack platform (MySQL + Spring Boot + React) locally with a single command:

```bash
# 1. Clone the repository
git clone https://github.com/Abu1820/CivicPulse-Smart-Governance-Platform.git
cd CivicPulse-Smart-Governance-Platform

# 2. Launch all services
docker compose up -d --build
```
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8080/api`
- MySQL: `localhost:3306`

---

## 💻 Manual Local Development Setup

### Prerequisites
- Java 17+ JDK installed
- Node.js 18+ & npm installed
- MySQL 8.0 running locally

### 1. Database Setup
```sql
CREATE DATABASE civicpulse_project;
```

### 2. Backend Setup
```bash
cd backend
mvn clean test
mvn spring-boot:run
```
*The default administrator account (`admin@civicpulse.com` / `admin123`) is seeded automatically on initial boot.*

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🚀 One-Click Cloud Deployment

CivicPulse is pre-configured with a **Render Blueprint** ([`render.yaml`](render.yaml)) and **Vercel SPA configuration** ([`frontend/vercel.json`](frontend/vercel.json)):

### Option A: Deploy with Render Blueprint
1. Fork or push this repository to your GitHub account.
2. Sign in to [Render](https://render.com) and click **New +** → **Blueprint**.
3. Select your repository. Render will automatically provision:
   - MySQL Cloud Database
   - Spring Boot Web Service (using `backend/Dockerfile`)
   - React Static Site (with SPA routing)
4. Click **Apply** to launch!

### Option B: Deploy Frontend to Vercel
1. Import the repository in [Vercel](https://vercel.com).
2. Set the **Root Directory** to `frontend`.
3. Set the environment variable: `VITE_API_BASE_URL=https://your-backend-service.onrender.com`.
4. Deploy!

---

## 👤 Author & Acknowledgments

- **Developer:** Abdul Majeed R
- **GitHub:** [@Abu1820](https://github.com/Abu1820)
- **Repository:** [CivicPulse-Smart-Governance-Platform](https://github.com/Abu1820/CivicPulse-Smart-Governance-Platform)

---

## 📄 License
This project is open-source and distributed under the [ISC License](LICENSE).
