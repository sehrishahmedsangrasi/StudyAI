# 🎓 AI Quiz & Notes Generator
### Powered by LangChain + RAG + Gemini 1.5 Flash + FAISS

Upload any lecture transcript and instantly generate **study notes**, **quiz questions**, and **flashcards** using a full RAG pipeline.

---

## 🏗️ Architecture

```
Frontend (React)
      ↓  HTTP
FastAPI Backend
      ↓
LangChain RAG Pipeline
  ├── PDF/Text Parser
  ├── RecursiveCharacterTextSplitter (chunks)
  ├── FAISS Vector Store (local, free)
  ├── Google Embeddings (embedding-001)
  └── Gemini 1.5 Flash (generation)
```

---

## ⚡ Quick Start

### 1. Get a FREE Gemini API Key
Go to: https://aistudio.google.com/app/apikey
- Sign in with Google
- Click "Create API Key"
- Copy the key (starts with `AIza...`)

---

### 2. Setup Backend

```bash
# Go to backend folder
cd backend

# Create virtual environment
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the backend server
uvicorn main:app --reload --port 8000
```

Backend will run at: http://localhost:8000

---

### 3. Setup Frontend

Open a **new terminal**:

```bash
# Go to frontend folder
cd frontend

# Install dependencies
npm install

# Start React app
npm start
```

Frontend will open at: http://localhost:3000

---

## 🎮 How to Use

1. Open http://localhost:3000 in your browser
2. Paste your **Gemini API Key** in the input field
3. Upload a transcript file (`.pdf`, `.txt`, or `.md`)
4. Choose difficulty: **Easy / Medium / Hard**
5. Click **"Generate Everything"**
6. View your **Notes**, **Quiz**, and **Flashcards** in the tabs

---

## 📁 Project Structure

```
quiz-generator/
├── backend/
│   ├── main.py           # FastAPI routes
│   ├── rag_pipeline.py   # LangChain + FAISS + Gemini
│   ├── prompts.py        # AI prompt templates
│   └── requirements.txt
├── frontend/
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── App.js
│       ├── index.js
│       ├── index.css
│       └── components/
│           ├── UploadPanel.js    # File upload + controls
│           ├── NotesPanel.js     # Study notes display
│           ├── QuizPanel.js      # Interactive MCQ + short answer
│           └── FlashcardsPanel.js # Flip card UI
└── README.md
```

---

## 🔧 Tech Stack

| Layer | Technology | Cost |
|-------|-----------|------|
| Frontend | React 18 | Free |
| Backend | FastAPI + Python | Free |
| RAG Framework | LangChain | Free |
| Vector DB | FAISS (local) | Free |
| Embeddings | sentence-transformers/all-MiniLM-L6-v2 | Free |
| LLM | Gemini 1.5 Flash | Free* |
| PDF Parsing | PyPDF | Free |

*Gemini free tier: 15 requests/min, 1M tokens/day

---

## ❓ Troubleshooting

**CORS error?**
→ Make sure backend is running on port 8000

**API key error?**
→ Double check your key at https://aistudio.google.com/app/apikey

**PDF not parsing?**
→ Make sure the PDF has selectable text (not a scanned image)

**`npm install` fails?**
→ Make sure Node.js 16+ is installed: https://nodejs.org
