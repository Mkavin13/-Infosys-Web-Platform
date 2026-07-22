# CarbonTrack — Environmental Impact Tracking & Sustainability Analytics

CarbonTrack is a production-grade full-stack web application designed for individuals and organizations to quantify, analyze, and systematically reduce their daily carbon footprint (CO₂e).

---

## 🚀 Key Features

1. **Daily Impact Logging**: Fast logging for commutes, utility use, food portions, and shopping budgets, enforcing rigid data bounds via Jakarta Validation.
2. **Rule-Based Calculation Engine**: Fully isolated, strategy-configured engine that computes emissions dynamically based on database-stored emission factors (sourced from IPCC/EPA reference values). Allows admins to update factors without redeploying code.
3. **Interactive Sustainability Dashboard**: Rendered via React and Recharts, presenting carbon breakdowns (Pie Chart), daily trend lines (Area Chart), and comparative peer benchmarking cards.
4. **Milestone Targets (Budgets)**: Set carbon reduction goals for a given timeframe, automatically comparing progress against past carbon baselines.
5. **Gamification & Badges**: Unlock status achievements like `Eco Pioneer`, `Green Commuter`, and `Plant Power` as activities are logged or budgets are satisfied.
6. **Corporate Workplace Standings**: Aggregates worker footprints for corporate CSR reporting, complete with employee scoreboards (restricted to `ORG_ADMIN`).

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Backend Framework** | Java 21 / 24, Spring Boot 3.4.1, Spring Data JPA, Spring Security 6, Jakarta Validation |
| **Security** | Stateless JSON Web Tokens (JWT) + BCrypt Password Encoder |
| **Database** | MySQL 8.0 (Local instance) |
| **Migrations** | Flyway Schema Migrations (`V1__init_schema.sql`, `V2__seed_data.sql`) |
| **Frontend** | React 18+, Vite Bundler, Recharts (Data Viz), Lucide Icons, Vanilla CSS (Custom Glassmorphism theme) |
| **Testing** | Postman API Test Collection with Token Chaining |

---

## 📂 Project Structure

```
d:\carbontrack-backend/
│   README.md                   <- Documentation (This File)
│   postman_collection.json     <- Postman API suite
│
├───backend/                    <- Spring Boot Maven Application
│   ├───src/main/java           <- Java Source files (Security, Strategies, Services)
│   └───src/main/resources
│       ├───db/migration/       <- Flyway migration schema & pre-seeds
│       └───application.yml     <- DB connection & security config
│
└───frontend/                   <- React Vite Dashboard Webapp
    ├───src/
    │   ├───App.jsx             <- Main App component & routing
    │   ├───index.css           <- Custom glassmorphic CSS styling
    │   └───main.jsx            <- Entrypoint binder
    ├───index.html              <- Google fonts loader
    └───package.json            <- Node package manifest
```

---

## 🔌 Setup & Running Guide

### 1. Database Configuration
Before booting up the backend, ensure your local MySQL server is running on port `3306`.
By default, the application is configured to hook into `jdbc:mysql://localhost:3306/carbontrack` and will automatically create the schema if it does not exist.

If you need to override the username or password, set the following environment variables in your terminal before launching:
```powershell
# Windows PowerShell
$env:SPRING_DATASOURCE_USERNAME="your_mysql_username"
$env:SPRING_DATASOURCE_PASSWORD="your_mysql_password"
```

### 2. Run the Java Spring Boot Backend
Navigate into the `backend` folder and compile/run the application:
```bash
cd backend
mvn clean spring-boot:run
```
The server will start up on `http://localhost:8080`.
Upon boot, Flyway will run all migrations to create tables and pre-populate the IPCC emission factors and default gamification badges.

### 3. Run the React Frontend
Open a new terminal window, navigate into the `frontend` folder, and spin up Vite's developer server:
```bash
cd frontend
npm install
npm run dev
```
The developer app will open on `http://localhost:5173`.

> **Note on Backend Offline Operation:** If you run the frontend without the backend running, the React application automatically detects the connection failure and activates a fully interactive, high-fidelity mock fallback mode. This lets you inspect and interact with the UI, charts, logging calculators, and boards instantly.

---

## 🧪 Postman API Verification

Import [postman_collection.json](file:///d:/carbontrack-backend/postman_collection.json) into Postman to run integrated tests.

### JWT Token Chaining
The collection is pre-configured with a test script on the **Login User** request.
Upon a successful login, Postman automatically captures the returned JWT access and refresh tokens, writing them into the environment variables `jwt_token` and `refresh_token`. All subsequent requests (logging activities, goals, leaderboard) read this variable automatically, so you don't need to copy-paste tokens manually.

---

## 📐 Architecture Details

### Emission Calculation Strategies
All calculations flow through a Strategy Pattern implementation, allowing individual categories to run custom logic while pulling configuration directly from the database:
1. `EmissionCalculationStrategy` (Interface): Declares `supports(Category)` and `calculate(quantity, factor)`.
2. `TransportCalculationStrategy` (Implementation): If input quantities are in miles, it maps conversions before applying the distance factor.
3. `EmissionStrategyFactory` (Factory): Resolves and returns the strategy matching the incoming log category.
4. `EmissionCalculationService`: Coordinates DB lookups and executes calculations, decoupling endpoint contracts from calculation details.
