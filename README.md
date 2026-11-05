# 🏙️ CivicPulse — Smart Civic Issue Reporting & Management Platform

[![Java](https://img.shields.io/badge/Java-17-orange.svg)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.0.7-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![Spring Security](https://img.shields.io/badge/Spring%20Security-JWT%20Stateless-blue.svg)](https://spring.io/projects/spring-security)
[![React](https://img.shields.io/badge/React-19-cyan.svg)](https://react.dev/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-blue.svg)](https://www.mysql.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-ISC-green.svg)](LICENSE)

CivicPulse is an enterprise-grade full-stack civic governance platform designed to empower citizens to report, track, and monitor public infrastructure issues (road damage, water leakages, streetlight failures, sanitation concerns) while providing municipal authorities with real-time analytics, filtering, and workflow controls.

---

## 🌟 Key Architecture & Features

### 🔐 Security & Access Control
- **Stateless JWT Authentication:** Secure JSON Web Token authentication with custom filter chain (`JwtAuthenticationFilter`).
- **Role-Based Access Control (RBAC):** Strict segregation between `USER` and `ADMIN` roles across API endpoints and React route guards (`<ProtectedRoute role="ADMIN" />`).
- **Bucket4j Rate Limiting:** Token-bucket rate limiting filter on `/api/auth/**` protecting against credential stuffing and brute-force attacks (10 requests/min per client IP).
- **BCrypt Password Hashing:** Salted one-way hashing for secure credential storage.

### 📊 Real-Time Analytics & Data Visualization
- **Recharts Data Visualizations:** Dynamic donut/pie chart for issue status distribution and color-coded bar chart for category frequencies.
- **Admin & Citizen Analytics:** Admins monitor community-wide metrics; citizens access a personal profile dashboard showing their reported issues and resolution breakdown.

### 🚀 Issue Management & Multi-Filter Query Engine
- **Multipart Media Uploads:** Server-side file validation (JPEG/PNG, 5 MB limit) with UUID file sanitization.
- **Advanced Query Engine:** Multi-parameter search supporting title, description, category, location, and reporting date.
- **Audit Trails:** Automatic entity auditing via JPA `@PrePersist` and `@PreUpdate` timestamp hooks.
- **Asynchronous Email Notifications:** Spring Mail integration (`@Async`) triggering status notifications to citizens upon resolution progress.

### 🧪 Test Coverage & CI/CD Readiness
- **JUnit 5 + Mockito Unit Tests:** Comprehensive service-layer testing covering filter algorithms, authorization enforcement, and status transitions.
- **JaCoCo Code Coverage:** Integrated Maven JaCoCo plugin generating automated test coverage metrics.
- **Containerized Deployment:** Multi-stage `Dockerfile` and `docker-compose.yml` for unified local setup with zero dependencies.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, React Router 7, Axios, Recharts, React-Toastify, Leaflet |
| **Backend** | Java 17, Spring Boot 4, Spring Security, Spring Data JPA, Spring Mail |
| **Database** | MySQL 8.0 with InnoDB engine |
| **Security & Utilities** | JJWT (io.jsonwebtoken), Bucket4j, Lombok, Jackson JSR-310 |
| **DevOps & Testing** | Docker, Docker Compose, JUnit 5, Mockito, JaCoCo |

---

## 🏗️ System Architecture

```
                    ┌─────────────────────────┐
                    │      React Client       │
                    │   (Vite + React Router) │
                    └────────────┬────────────┘
                                 │ HTTP / JSON (Bearer JWT)
                                 ▼
                    ┌─────────────────────────┐
                    │   Rate Limiting Filter  │ (Bucket4j: 10 req/min)
                    └────────────┬────────────┘
                                 ▼
                    ┌─────────────────────────┐
                    │ JwtAuthenticationFilter │ (Stateless Security)
                    └────────────┬────────────┘
                                 ▼
                    ┌─────────────────────────┐
                    │   Spring MVC Layer      │ (IssueController, AuthController)
                    └────────────┬────────────┘
                                 │
                    ┌────────────┴────────────┐
                    ▼                         ▼
        ┌───────────────────────┐ ┌───────────────────────┐
        │     IssueService      │ │      UserService      │
        └───────────┬───────────┘ └───────────┬───────────┘
                    │                         │
                    ├──────────┐              │
                    ▼          ▼              ▼
        ┌───────────────┐ ┌─────────┐ ┌───────────────┐
        │EmailNotif.Svc │ │ MySQL 8 │ │ PasswordHash  │
        │(Spring Mail)  │ │ (JPA)   │ │ (BCrypt)      │
        └───────────────┘ └─────────┘ └───────────────┘
```

---

## 📡 REST API Specifications

### Authentication Endpoints
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register citizen account with field validation |
| `POST` | `/api/auth/login` | Public | Authenticate user & return signed JWT |

### Issue Management Endpoints
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/issues` | Authenticated | Fetch issues (Users see own issues, Admins see all) with multi-filter queries |
| `GET` | `/api/issues/{id}` | Authenticated | Get issue details (secured per user/admin) |
| `POST` | `/api/issues` | Authenticated | Create issue (JSON payload or multipart image upload) |
| `PUT` | `/api/issues/{id}` | Admin | Update issue title, category, location, description |
| `PUT` | `/api/issues/{id}/status` | Admin | Update status (`Pending` → `In Progress` → `Resolved`) |
| `DELETE` | `/api/issues/{id}` | Admin | Remove issue record |
| `GET` | `/api/issues/dashboard/stats` | Admin | Aggregated issue counts + category distribution |

---

## 🐳 Quick Start with Docker

```bash
# Clone the repository
git clone https://github.com/Abu1820/CivicPulse-Smart-Governance-Platform.git
cd CivicPulse-Smart-Governance-Platform

# Start MySQL and Spring Boot in containers
docker compose up -d --build
```

---

## 💻 Local Development Setup

### 1. Database
Ensure MySQL is running on port `3306` with database `civicpulse_project`:
```sql
CREATE DATABASE civicpulse_project;
```

### 2. Backend
```bash
cd backend
mvn clean test jacoco:report
mvn spring-boot:run
```
*Default admin credentials seeded automatically:*
- **Email:** `admin@civicpulse.com`
- **Password:** `admin123`

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```
Access the application at `http://localhost:5173`.

---

## 🧪 Running Automated Tests

```bash
cd backend
mvn test
```
*11 automated JUnit 5 & Mockito test cases execute with 100% pass rate.*

---

## 📄 License
This project is open-source and available under the [ISC License](LICENSE).
