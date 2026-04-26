# 🏛️ Smart Campus Operations Hub

> IT3030 – Programming Applications and Frameworks | SLIIT | 2026 Semester 1

A full-stack web platform for managing university facility bookings and maintenance incidents, built with **Spring Boot** (REST API) and **React** (client app).

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Java 17, Spring Boot 3.x |
| Frontend | React 18, Axios |
| Database | PostgreSQL |
| Auth | OAuth 2.0 (Google), Spring Security + JWT |
| CI/CD | GitHub Actions |

---

## Modules

- **Module A** – Facilities & Assets Catalogue (CRUD for rooms, labs, equipment)
- **Module B** – Booking Management (PENDING → APPROVED / REJECTED → CANCELLED)
- **Module C** – Maintenance & Incident Ticketing (with image attachments)
- **Module D** – In-app Notifications
- **Module E** – Authentication & Role-based Access (USER / ADMIN / TECHNICIAN)

---

## Getting Started

### Backend
```bash
cd backend
cp src/main/resources/application.example.properties src/main/resources/application.properties
# Fill in DB credentials and OAuth details
mvn spring-boot:run
```
API runs at: `http://localhost:8080`

### Frontend
```bash
cd frontend
npm install
npm run dev
```
App runs at: `http://localhost:5173`

---

## Environment Variables

**`application.properties`**
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/smart_campus
spring.datasource.username=YOUR_DB_USER
spring.datasource.password=YOUR_DB_PASSWORD
spring.security.oauth2.client.registration.google.client-id=YOUR_CLIENT_ID
spring.security.oauth2.client.registration.google.client-secret=YOUR_CLIENT_SECRET
app.jwt.secret=YOUR_JWT_SECRET
```

**`.env`**
```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
```

---

## Team Contributions

| Member | Student ID | Module |
|--------|-----------|--------|
| Dissanayake D.M.P.N.B. | IT23846654 | Module A – Facilities & Assets |
| Karunarathna J.M.M. | IT23833234  | Module B – Booking Management |
| Weerasinghe P.L. | IT23714052| Module C – Incident Ticketing |
| Jayathunga I.T.N. | IT23829992 | Module D & E – Notifications & Auth |

---

## Testing

```bash
# Backend tests
cd backend && mvn test

# API testing — import Postman collection from:
docs/SmartCampus.postman_collection.json
```

> Full API docs available at `http://localhost:8080/swagger-ui.html`

---

*IT3030 – SLIIT Faculty of Computing | 2026*
```
