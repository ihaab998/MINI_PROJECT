# 🩺 MyHealth — Universal Longitudinal Health Platform

> **An AI-powered universal longitudinal health record and dynamic chronic disease analytics platform.**  
> Standardized with **LOINC** laboratory coding and **RxNorm** medication ontologies.

---

## ✨ Key Features

- 🏥 **Master Chronological Timeline**: Unifies lab reports, hospital discharge summaries, acute episodes, and active prescriptions into a single interactive feed.
- 🎨 **Modern Periwinkle Design System**: Built with Next.js 15, custom HSL periwinkle aesthetics (`#6b7cce`, `#dbe5ff`), rounded crisp cards (`rounded-[32px]`), and responsive navigation.
- 🤖 **Context-Aware Clinical AI Assistant (`MyHealth AI`)**: Intelligent medical assistant powered by Gemini 1.5 Pro with full longitudinal patient record awareness, voice synthesis (Text-to-Speech), and query resolution.
- 📄 **Document AI & Spatial Audit**: Ingests medical PDFs and lab report images, extracts biomarkers with spatial bounding box coordinates, and verifies patient identity provenance.
- 📊 **Chronic Disease Progression Analytics**: Tracks eGFR trajectory, annualized decline rates, serum creatinine, and KDIGO disease staging (Stage G3b CKD).
- 📲 **WhatsApp Integration**: Twilio-ready backend pipeline for phone PIN verification, document uploads via WhatsApp attachments, and instant AI chat responses.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend Framework** | Next.js 15 (App Router), TypeScript, React 19 |
| **Styling & Motion** | Tailwind CSS, Framer Motion, Lucide React Icons |
| **Backend API** | FastAPI (Python 3.10+), Pydantic v2, Uvicorn |
| **AI & Document Processing** | Google Gemini 1.5 Pro / Flash, Document AI OCR Pipeline |
| **Database & Storage** | Supabase (PostgreSQL & Object Storage) |
| **Integrations** | Twilio SDK (WhatsApp Messaging), Web Speech API |

---

## 📁 Repository Structure

```text
MINI_PROJECT/
├── app/                        # FastAPI Backend Application
│   ├── api/
│   │   └── routers/            # API Endpoints (Auth, Agent, Documents, Analytics, WhatsApp)
│   ├── core/                   # App Configuration & Settings
│   ├── services/               # Document AI Parser, Chronic Disease Detector
│   └── main.py                 # FastAPI Application Entrypoint
├── frontend/                   # Next.js 15 Web Application
│   ├── src/
│   │   ├── app/                # App Router Pages (Dashboard, Login, Timeline, etc.)
│   │   ├── components/         # Dashboard Tabs, AI Chat, Modals, Sidebar
│   │   └── context/            # AuthContext (Authentication & Session State)
│   ├── public/                 # Static Assets & 3D Stethoscope Illustrations
│   └── package.json
├── .env.example                # Environment Variable Template
├── .gitignore                  # Git Exclusion Rules
├── Dockerfile                  # Container Deployment Configuration
├── requirements.txt            # Python Dependencies
└── README.md                   # Project Documentation
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** v18+ and **npm** v9+
- **Python** 3.10+
- **Google Gemini API Key** (Optional for live LLM reasoning)

---

### 1. Backend Setup (FastAPI)

```bash
# 1. Navigate to project root
cd MINI_PROJECT

# 2. Create and activate virtual environment
python -m venv .venv
# On Windows:
.venv\Scripts\activate
# On macOS/Linux:
source .venv/bin/activate

# 3. Install Python dependencies
pip install -r requirements.txt

# 4. Create environment file
cp .env.example .env
# Edit .env with your credentials

# 5. Launch FastAPI Backend
python -m uvicorn app.main:app --reload --port 8000
```
Backend API will be running at `http://localhost:8000`  
Swagger API Documentation: `http://localhost:8000/docs`

---

### 2. Frontend Setup (Next.js)

```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Install Dependencies
npm install

# 3. Start Development Server
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## 🔒 Authentication & Account Demo

You can quickly log in using the demo patient profile or create your own account:

- **Demo Patient**: `ihaab998@gmail.com`
- **Demo Clinician**: `dr.eleanor@myhealth.ai`
- **Default WhatsApp Linking PIN**: `123456`

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for details.
