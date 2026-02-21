# 🚀 FleetFlow — AI-Powered Fleet Intelligence & Command Center

Collaborator : Aman Patel

Collabarotar (Mentor hithub) : amoa-odoo

Team leader : Shyam kumar Chaurasiya

Nember 2 : Mrityunjay Prasad Chaurasiya

Member 3 : Sandip Sah Turha

Member 4 : Niraj kumar sahani

Round : first (Virtually)

purpose : Selection for ffinal round

Date " 21/02/2026

FleetFlow is a state-of-the-art, full-stack fleet management ecosystem designed for modern logistics. Built with a futuristic **Dark Glassmorphism** aesthetic, it combines real-time data streaming, advanced operational analytics, and AI-driven decision support to provide a unified command center for logistics professionals.

## 🌟 Key Features

### 🧠 AI Intelligence (FleetAssist AI)
- **Gemini Pro Integration**: A context-aware AI assistant that has real-time access to your fleet database.
- **Operational Queries**: Ask about vehicle availability, driver compliance, or trip efficiency in natural language.
- **Decision Support**: Get data-driven advice on route planning and asset utilization.

### 📊 Advanced Data Visualizations
- **Operational Heatmaps**: Real-time dispatch density analysis across hours and days.
- **Fleet Execution Flow**: Interactive Sankey-style diagrams illustrating the trip lifecycle.
- **Financial Intelligence**: Detailed revenue vs. expense tracking and net profit analysis.
- **Safety command**: Real-time monitoring of speed violations, incident reports, and compliance scores.

### 🛡️ Multi-Role Command Centers
The application adapts dynamically to four specialized organizational roles:
- **Manager**: 360° overview of fleet health, financial performance, and operational KPIs.
- **Dispatcher**: Real-time trip validation engine with capacity and compliance checks.
- **Safety Officer**: Incident management, inspection tracking, and license compliance alerts.
- **Financial Analyst**: Expense breakdown, profitability analysis, and fuel efficiency trends.

### ⚡ Real-Time Infrastructure
- **Live Sync**: Powered by Socket.io, data updates across all dashboards instantly without refreshes.
- **Smart Notifications**: Instant alerts for trip completions, cancellations, and safety violations.
- **Collapsible Sidebar**: A sleek, space-efficient navigation system for maximum data visibility.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Framer Motion (Animations), Recharts (Analytics), Lucide Icons.
- **Backend**: Node.js, Express, Socket.io (Real-time), JWT (Security).
- **AI Engine**: Google Generative AI (Gemini Pro).
- **Database**: MongoDB + Mongoose.

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js 18+
- MongoDB (Local or Atlas)
- **Google Gemini API Key** (for AI features)

### 2. Installation
```bash
# Clone the repository and install dependencies
cd fleetflow/server && npm install
cd ../client && npm install
```

### 3. Environment Setup
Configure your `server/.env` file:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/fleetflow
JWT_SECRET=fleetflow_super_secret_key_2026
GEMINI_API_KEY=your_gemini_api_key_here
```

### 4. Running the Application
**Terminal 1 (Backend Engine):**
```bash
cd server && npm run dev
```
*Note: The database will auto-seed with demo data on the first run.*

**Terminal 2 (Frontend Interface):**
```bash
cd client && npm run dev
```

Visit **[http://localhost:3000](http://localhost:3000)** to launch the command center.

---

## 🔑 Demo Access
Use these credentials to explore the different specialized dashboards:

| Command Center | Email | Password |
| :--- | :--- | :--- |
| **👑 Manager** | `admin@fleetflow.com` | `admin123` |
| **🛰️ Dispatcher** | `dispatch@fleetflow.com` | `dispatch123` |
| **🛡️ Safety Officer** | `safety@fleetflow.com` | `safety123` |
| **💰 Financial Analyst** | `finance@fleetflow.com` | `finance123` |

---

## 💼 Business Intelligence Logic
- **Smart Dispatch**: Automatically prevents dispatching if cargo exceeds capacity, licenses are expired, or assets are currently on-trip.
- **Maintenance Lifecycle**: Vehicles are automatically marked "In Shop" during repairs and returned to "Available" upon resolution.
- **Efficiency Algorithms**: Automatically calculates fuel consumption rates and driver ratings based on trip performance.

Built with ❤️ by the FleetFlow Engineering Team.
