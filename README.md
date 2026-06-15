# AI Interview Prep App — Backend

An AI-powered interview preparation platform backend built with Node.js, Express, MongoDB, and Groq LLM.

## 🚀 Features

- JWT Authentication with Cookie & Token Blacklisting
- AI Interview Report Generation using Groq (Llama 3.3)
- Resume PDF Upload & Text Extraction
- AI Optimized Resume PDF Download
- Interview Specific Chatbot
- Rate Limiting & HTTP Request Logging
- Protected Routes with Auth Middleware

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| Node.js | Runtime |
| Express.js | Web Framework |
| MongoDB + Mongoose | Database |
| Groq (Llama 3.3) | AI/LLM |
| JWT | Authentication |
| Bcryptjs | Password Hashing |
| Multer | File Upload |
| pdf-parse | PDF Text Extraction |
| Playwright | PDF Generation |
| Morgan | HTTP Logging |
| express-rate-limit | Rate Limiting |

## 📁 Folder Structure
Backend/

src/

config/        → Database connection

controllers/   → Business logic

middlewares/   → Auth, file upload

models/        → MongoDB schemas

routes/        → API endpoints

services/      → Groq AI service

server.js        → Entry point

app.js           → Express config

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | /api/auth/register | Register new user | Public |
| POST | /api/auth/login | Login user | Public |
| POST | /api/auth/logout | Logout user | Private |
| GET | /api/auth/get-me | Get current user | Private |

### Interview
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | /api/interview/ | Generate AI report | Private |
| GET | /api/interview/ | Get all reports | Private |
| GET | /api/interview/report/:id | Get report by ID | Private |
| POST | /api/interview/resume/pdf/:id | Download resume PDF | Private |

### Chat
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | /api/chat/:interviewId | Chat with AI about report | Private |

## ⚙️ Environment Variables

Create `.env` file in root:

```env
PORT=3000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
GROQ_API_KEY=your_groq_api_key
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

## 🏃 Run Locally

```bash
# Clone the repo
git clone https://github.com/yourusername/genai-interview-prep-backend.git

# Install dependencies
cd Backend
npm install

# Add .env file
# Run development server
npm run dev
```

## 📐 Architecture
Client Request

↓

Express Server (app.js)

↓

Rate Limiter + Morgan Logger

↓

Routes (auth / interview / chat)

↓

Auth Middleware (JWT verify)

↓

Controllers (business logic)

↓

Services (Groq AI)  ←→  Models (MongoDB)

↓

Response

## 🧪 Testing

- API tested with Postman
- All endpoints verified with auth flow
