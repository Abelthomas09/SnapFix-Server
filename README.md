# SnapFix – Service Booking Platform

SnapFix is a full-stack service booking platform designed to connect customers with service providers. It provides a seamless booking experience through a customer-facing application and an administrative dashboard.

The platform follows a separate frontend and backend architecture, with three independent repositories.

## 🚀 Project Repositories

| Component | Repository |
|---|---|
| Backend Server | https://github.com/Abelthomas09/SnapFix-Server |
| Customer Frontend | https://github.com/Abelthomas09/SnapFix-Frontend |
| Admin Panel | https://github.com/Abelthomas09/SnapFix-AdminPanel |

## 🏗️ Architecture

The application consists of three main components:

### 1. Backend Server
- Handles application business logic.
- Provides RESTful APIs for frontend applications.
- Manages database operations.
- Handles authentication and authorization.
- Processes customer and administrative requests.

### 2. Customer Frontend
- Provides the customer-facing interface.
- Allows customers to explore services.
- Supports service booking and related interactions.
- Communicates with the backend through APIs.

### 3. Admin Panel
- Provides an administrative dashboard.
- Allows administrators to manage platform operations.
- Communicates with the backend through APIs.

## 🛠️ Technology Stack

Refer to the source code and package configuration for the exact technologies, libraries, and dependencies used in each component.

## 📁 Repository Structure

The project is maintained across three separate repositories:

```text
SnapFix/
│
├── SnapFix-Frontend/
│   └── Customer Application
│
├── SnapFix-AdminPanel/
│   └── Admin Dashboard
│
└── SnapFix-Server/
    └── Backend Server
```

## ⚙️ Getting Started

### Clone the Backend Repository

```bash
git clone https://github.com/Abelthomas09/SnapFix-Server.git
```

### Install Dependencies

```bash
cd SnapFix-Server
npm install
```

Configure the required environment variables before running the application.

### Run the Development Server

```bash
npm run dev
```

Refer to `package.json` for the available scripts and project-specific configuration.

## 🔗 Related Repositories

- **Customer Application:** https://github.com/Abelthomas09/SnapFix-Frontend
- **Admin Dashboard:** https://github.com/Abelthomas09/SnapFix-AdminPanel

---

**SnapFix – Full-Stack Service Booking Platform**
