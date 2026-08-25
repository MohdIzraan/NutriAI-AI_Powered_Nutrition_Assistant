# 🌿 NutriAI — AI-Powered Food Recognition & Regional Nutrition Assistant

> Full-stack AI application demonstrating Computer Vision, Generative AI, NLP, and Personalization

---

## 📌 Overview

NutriAI is a production-style AI SaaS application that:

- 🔍 **Recognises food** from photos using Google Gemini Vision AI
- 📊 **Estimates nutrition** with confidence scores and serving-size adjustment
- 🗓️ **Generates personalised 7-day diet plans** using Gemini generative AI, adapted to your region, budget, and dietary goals
- 💬 **Provides an AI chat assistant** for natural language nutrition guidance
- 📈 **Tracks nutrition** with weekly analytics and progress charts
- 🍽️ **Shows meal photos** in meal history
- 📍 **Personalises** based on Indian regional cuisine, city, and budget

---

## 🤖 AI Stack

| Component | Technology | Purpose |
|---|---|---|
| Food Recognition | Google Gemini 3.6 Flash Vision | Identify food from photos |
| Diet Generation | Google Gemini 3.6 Flash | 7-day personalised regional plans |
| AI Chat | Google Gemini 3.6 Flash | Nutrition Q&A assistant |
| Recommendations | Google Gemini 3.6 Flash | Personalised wellness tips |
| Fallback | Demo Provider | Development without API cost |

---

## 🛠️ Tech Stack

**Frontend**
- React 18, Vite, Tailwind CSS
- Recharts for analytics charts
- React Hook Form and Zod for validation
- Axios and React Router

**Backend**
- Node.js 18, Express.js REST API
- MongoDB Atlas and Mongoose
- JWT authentication and bcrypt
- Multer for file uploads, Helmet for security

**AI Service**
- Python 3.14, FastAPI, Uvicorn
- Google Gemini 3.6 Flash Vision and Chat
- google-genai 2.x SDK
- Pillow, NumPy, PyTorch

**Database**
- MongoDB Atlas free tier

---

## 🚀 Features

| Feature | Description |
|---|---|
| 🔍 AI Food Recognition | Upload any food photo — Gemini identifies food and nutrition |
| 📍 Regional Personalisation | Diet plans use locally available foods from your city and state |
| 🗓️ 7-Day Diet Plans | AI-generated plans with regional Indian foods and costs in ₹ |
| 💬 AI Chat Assistant | Ask nutrition questions in plain language |
| 🖼️ Meal Photos | Food images shown in meal history and detail view |
| 📊 Nutrition Analytics | Weekly calorie charts, macro distribution, progress tracking |
| 🔐 Secure Auth | JWT and bcrypt, rate limiting, helmet security headers |
| ✏️ Plan Modification | Modify diet plans using natural language commands |

---

## 📋 Prerequisites

Make sure you have these installed:

| Software | Minimum Version | Check Command |
|---|---|---|
| Node.js | v18 or higher | `node --version` |
| npm | Any version | `npm --version` |
| Python | 3.10 or higher | `python --version` |
| Git | Any version | `git --version` |

---

## 📁 Project Structure
```bash
ai-nutrition-assistant/
│
├── client/ React Frontend
│ └── src/
│ ├── pages/
│ │ ├── Landing.jsx Public landing page
│ │ ├── Dashboard.jsx Main dashboard with charts
│ │ ├── FoodRecognition.jsx AI food image upload and analysis
│ │ ├── MealAnalyzer.jsx Meal logging with AI
│ │ ├── MealHistory.jsx Meal history with food images
│ │ ├── DietPlanner.jsx 7-step diet plan wizard
│ │ ├── DietPlanDetails.jsx View and modify diet plan with AI
│ │ ├── AIAssistant.jsx AI chat interface
│ │ ├── Analytics.jsx Nutrition charts and trends
│ │ ├── Profile.jsx User profile settings
│ │ ├── Settings.jsx App settings
│ │ └── About.jsx About page
│ ├── components/ui/ Reusable UI components
│ ├── services/ API service clients
│ └── context/AuthContext.jsx Authentication state
│
├── server/ Node.js Backend
│ └── src/
│ ├── controllers/
│ │ ├── auth.controller.js Register, login, logout
│ │ ├── food.controller.js Food image analysis
│ │ ├── meal.controller.js Meal CRUD operations
│ │ ├── diet.controller.js Diet plan generation
│ │ ├── chat.controller.js AI chat messages
│ │ └── analytics.controller.js Dashboard data
│ ├── models/
│ │ ├── User.js User schema
│ │ ├── Profile.js Profile schema
│ │ ├── Meal.js Meal schema
│ │ ├── DietPlan.js Diet plan schema
│ │ ├── Chat.js Chat schema
│ │ └── AIAnalysis.js AI analysis records
│ ├── routes/ Express API routes
│ ├── middleware/ Auth, error, upload handlers
│ └── services/ai.service.js Python AI service client
│
├── ai-service/ Python FastAPI AI Service
│ └── app/
│ ├── core/
│ │ ├── config.py Environment settings
│ │ └── providers.py AI provider factory
│ ├── services/providers/
│ │ ├── gemini_provider.py Google Gemini integration
│ │ ├── local_vision.py HuggingFace ViT model
│ │ ├── openai_vision.py OpenAI GPT-4o integration
│ │ └── demo.py Demo mode provider
│ ├── api/routes/
│ │ ├── food.py Food analysis endpoint
│ │ ├── diet.py Diet generation endpoint
│ │ └── chat.py Chat endpoint
│ └── schemas/ Pydantic data models
│
│
└── docker-compose.yml Docker configuration
```


---

## ⚡ Quick Start

### Step 1 — Clone the Repository

```bash
git clone https://github.com/MohdIzraan/ai-nutrition-assistant.git
cd ai-nutrition-assistant
```

---

### Step 2 — Set Up MongoDB Atlas (Free)

1. Go to https://www.mongodb.com/cloud/atlas/register
2. Create a free account
3. Create a free M0 cluster and select Mumbai region for India
4. Create a database user with a username and password
5. Go to Network Access and click Add IP Address
6. Click Allow Access From Anywhere
7. Go to Database and click Connect then Drivers
8. Copy your connection string

---

### Step 3 — Get Your Free API Key

---

### Step 4 — Configure Environment Variables

**Server — open `server/.env` and fill in your values:**

```bash
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/ai_nutrition?retryWrites=true&w=majority
JWT_SECRET=your-secret-key-minimum-32-characters
JWT_EXPIRE=7d
AI_SERVICE_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000
STORAGE_PROVIDER=local
```

**AI Service — open `ai-service/.env` and fill in your values:**

```bash
AI_MODE=production
VISION_PROVIDER=gemini(or other any API key provider name)
LLM_PROVIDER=gemini(or other any API key provider name)
GEMINI_API_KEY=AIzaSy_your_key_here
GEMINI_VISION_MODEL=gemini-3.6-flash
GEMINI_CHAT_MODEL=gemini-3.6-flash
PORT=8000
HOST=0.0.0.0
LOG_LEVEL=INFO
```

---

### Step 5 — Install Dependencies

**Server:**
```bash
cd server
npm install
```

**Client:**
```bash
cd ../client
npm install
```

**AI Service:**
```bash
cd ../ai-service
python -m venv venv
venv\Scripts\activate
python -m pip install --upgrade pip
pip install -r requirements.txt
pip install google-genai
pip uninstall google-generativeai -y
```

---

## ▶️ Running the Project

You need 3 terminals open at the same time.

**Terminal 1 — AI Service:**
```bash
cd ai-service
venv\Scripts\activate
python run.py
```

Success message:

```bash
✅ Gemini Provider ready — Vision: gemini-3.6-flash, Chat: gemini-3.6-flash
INFO: Uvicorn running on http://0.0.0.0:8000
```

**Terminal 2 — Server:**
```bash
cd server
npm run dev
```

Success message:
```bash
🚀 AI Nutrition Server running on port 5000
MongoDB connected: cluster0.xxxxx.mongodb.net
```

**Terminal 3 — Client:**
```bash
cd client
npm run dev
```

Success message:

➜ Local: http://localhost:3000/


Then open your browser and go to http://localhost:3000

---

## 🔄 Quick Start Cheat Sheet

Every time you want to run the project:

Terminal 1: cd ai-service → venv\Scripts\activate → python run.py

Terminal 2: cd server → npm run dev

Terminal 3: cd client → npm run dev

Browser: http://localhost:3000


---


## 🌐 API Endpoints

**Authentication**

POST /api/auth/register Create new account

POST /api/auth/login Login and get token

GET /api/auth/me Get current logged in user

POST /api/auth/logout Logout


**Profile**

GET /api/profile Get user profile

PUT /api/profile Update user profile


**Food Analysis**

POST /api/food/analyze Upload food image for Gemini AI analysis

GET /api/food/analysis/:id Get a previous analysis result


**Meals**

POST /api/meals Save a meal to history

GET /api/meals List meals with filters and pagination

GET /api/meals/:id Get one meal with full details

DELETE /api/meals/:id Delete a meal

GET /api/meals/today/summary Get today's total nutrition


**Diet Plans**

POST /api/diet/generate Generate a 7-day AI diet plan

GET /api/diet List all plans

GET /api/diet/active Get current active plan

GET /api/diet/:id Get plan with all 7 days

PUT /api/diet/:id/modify Modify plan using natural language

DELETE /api/diet/:id Delete a plan


**Chat**

POST /api/chat Send message to Gemini AI

GET /api/chat/history Get past chat conversations

GET /api/chat/:id Get one full chat


**Analytics**

GET /api/analytics/summary Today's nutrition vs targets

GET /api/analytics/weekly 7-day calorie and macro charts

GET /api/analytics/recommendations Gemini wellness tips


---

## 🤖 AI Provider Configuration

Switch AI providers without changing any code.
Just update `ai-service/.env`:

| Setting | Value | Description | 
|---|---|---|
| VISION_PROVIDER | gemini | Google Gemini Vision | 
| VISION_PROVIDER | local | HuggingFace ViT Food101 | 
| VISION_PROVIDER | openai | GPT-4o Vision | 
| VISION_PROVIDER | demo | Sample responses | 
| LLM_PROVIDER | gemini | Gemini for diet and chat | 
| LLM_PROVIDER | openai | GPT-4o for diet and chat | 
| LLM_PROVIDER | demo | Sample responses | 

---

## 🐛 Common Issues and Fixes

| Error | Cause | Fix |
|---|---|---|
| MongoDB connection failed bad auth | Wrong password in MONGODB_URI | Reset Atlas database user password and update .env |
| google-genai not installed | Package missing | Run pip install google-genai in venv |
| pip install fails on numpy or Pillow | Python version too new | Change == to >= in requirements.txt |
| venv not showing | Virtual environment not activated | Run venv\Scripts\activate in ai-service folder |
| AI chat service unavailable | API Key error | Check Your_API_KEY in ai-service/.env |
| Port already in use | Previous process still running | Close all terminals and reopen VS Code |
| Profile shows Incomplete | Key fields not filled | Fill age, gender, height, weight, and goal in profile |

---

## 🔐 Security Features

- All passwords hashed with bcrypt using 12 salt rounds
- Authentication via JWT tokens with 7-day expiry
- Rate limiting on all API routes
- Helmet.js security headers on every response
- CORS restricted to frontend origin only
- Environment variables never committed to Git
- File upload validation for type, size, and MIME type
- Input sanitization on all API endpoints

---

## ⚠️ Limitations

1. AI Vision works best with clear, well-lit food photos
2. Nutrition values are AI estimates with roughly 15 to 30 percent accuracy variation
3. Prices in diet plans are approximate and vary by location
4. The app does not provide medical advice or diagnoses

---

## 🔮 Future Improvements

1. Fine-tuned Indian food recognition model trained on regional dishes
2. Barcode scanning for packaged foods with exact nutrition data
3. Integration with fitness trackers for calorie burn data
4. Offline mode with compressed on-device AI model
5. Multi-language support for Hindi, Telugu, Tamil, and other languages
6. Recipe suggestions with step-by-step cooking instructions
7. Grocery list generation directly from generated diet plans
8. Social sharing of meal logs and achievements

---

## ⚕️ Medical Disclaimer

NutriAI provides AI-generated nutritional estimates and general wellness information for educational and informational purposes only.
It is not a medical device and does not provide medical advice. Nutritional values are approximate estimates.
Always consult a qualified healthcare professional or registered dietitian before making significant dietary changes.

---

## 👤 Author

**Mohd Izraan**

B.C.A. — Bachelor of Computer Applications

Artificial Intelligence Fundamentals Project

---

## 📜 License

MIT License — For educational and portfolio use.
