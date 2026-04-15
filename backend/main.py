import io
import os
import uuid
from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from pypdf import PdfReader
from rag_pipeline import RAGPipeline
from database import (
    init_db, upsert_user, get_user,
    save_file, delete_file, get_user_files,
    save_generation, get_user_generations, get_generation, get_conn
)
from auth import create_token, get_current_user_id, get_google_auth_url, exchange_google_code

app = FastAPI(title="StudyAI Generator", version="3.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",                  # local dev
        "https://study-ai-inky-omega.vercel.app",            # production
    ],
    allow_credentials=False, allow_methods=["*"], allow_headers=["*"],
)

init_db()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
HF_API_KEY = os.getenv("HF_API_KEY", "")
pipelines: dict[str, RAGPipeline] = {}


def get_pipeline(user_id: str) -> RAGPipeline:
    if user_id not in pipelines:
        pipelines[user_id] = RAGPipeline(api_key=GEMINI_API_KEY, user_id=user_id, hf_api_key=HF_API_KEY)  # ← add hf_api_key
    return pipelines[user_id]


def extract_text(content: bytes, filename: str) -> str:
    if filename.endswith(".pdf"):
        reader = PdfReader(io.BytesIO(content))
        return "\n".join(page.extract_text() or "" for page in reader.pages)
    elif filename.endswith((".txt", ".md")):
        return content.decode("utf-8", errors="ignore")
    raise ValueError("Unsupported file type. Use .pdf .txt .md")


@app.get("/")
def root():
    return {"message": "StudyAI Generator v3.1 running"}


# ── Auth ──────────────────────────────────────────────────────────────────────
@app.get("/auth/google")
def google_login():
    return {"url": get_google_auth_url()}


@app.get("/auth/google/callback")
async def google_callback(code: str):
    user_info = await exchange_google_code(code)
    user = upsert_user(
        google_id=user_info["id"],
        name=user_info.get("name", ""),
        email=user_info.get("email", ""),
        avatar=user_info.get("picture", ""),
    )
    token = create_token(user["id"])
    FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
    return RedirectResponse(url=f"{FRONTEND_URL}/auth?token={token}&name={user['name']}&avatar={user['avatar']}&email={user['email']}")

@app.get("/auth/me")
def get_me(user_id: str = Depends(get_current_user_id)):
    user = get_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    return user


# ── Files ─────────────────────────────────────────────────────────────────────
@app.get("/files")
def list_files(user_id: str = Depends(get_current_user_id)):
    db_files = get_user_files(user_id)
    pipeline = get_pipeline(user_id)
    in_memory = {f["id"] for f in pipeline.list_files()}
    for f in db_files:
        if f["id"] not in in_memory:
            pipeline.file_store._load_meta()
            break
    return {"files": db_files}


@app.post("/files/upload")
async def upload_file(file: UploadFile = File(...), user_id: str = Depends(get_current_user_id)):
    content = await file.read()
    filename = file.filename or "unknown"
    try:
        text = extract_text(content, filename)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    if len(text.strip()) < 30:
        raise HTTPException(status_code=400, detail="File empty or unreadable.")
    pipeline = get_pipeline(user_id)
    file_id = str(uuid.uuid4())
    try:
        chunks = pipeline.add_file(file_id, filename, text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Embedding failed: {str(e)}")
    save_file(file_id, user_id, filename, chunks)
    return {"success": True, "file_id": file_id, "filename": filename, "chunks": chunks}


@app.delete("/files/{file_id}")
def remove_file(file_id: str, user_id: str = Depends(get_current_user_id)):
    pipeline = get_pipeline(user_id)
    pipeline.remove_file(file_id)
    delete_file(file_id, user_id)
    return {"success": True}


# ── Generate ──────────────────────────────────────────────────────────────────
@app.post("/generate")
async def generate(payload: dict, user_id: str = Depends(get_current_user_id)):
    file_ids = payload.get("file_ids", [])
    difficulty = payload.get("difficulty", "Medium")
    gen_notes = payload.get("notes", True)
    gen_quiz = payload.get("quiz", True)
    gen_flashcards = payload.get("flashcards", True)

    if not file_ids:
        raise HTTPException(status_code=400, detail="Select at least one file.")
    if not any([gen_notes, gen_quiz, gen_flashcards]):
        raise HTTPException(status_code=400, detail="Select at least one output type.")

    pipeline = get_pipeline(user_id)
    try:
        result = pipeline.generate(
            file_ids=file_ids, difficulty=difficulty,
            generate_notes=gen_notes, generate_quiz=gen_quiz, generate_flashcards=gen_flashcards,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Generation failed: {str(e)}")

    db_files = get_user_files(user_id)
    file_map = {f["id"]: f["filename"] for f in db_files}
    file_names = [file_map.get(fid, fid) for fid in file_ids]
    title = ", ".join(file_names[:2]) + (" +more" if len(file_names) > 2 else "")

    gen_id = str(uuid.uuid4())
    save_generation(
        gen_id=gen_id, user_id=user_id, title=title,
        file_names=file_names, difficulty=difficulty,
        notes=result.get("notes"), quiz=result.get("quiz"), flashcards=result.get("flashcards"),
    )
    return {"success": True, "gen_id": gen_id, **result}


# ── History ───────────────────────────────────────────────────────────────────
@app.get("/history")
def get_history(user_id: str = Depends(get_current_user_id)):
    return {"generations": get_user_generations(user_id)}


@app.get("/history/{gen_id}")
def get_single(gen_id: str, user_id: str = Depends(get_current_user_id)):
    gen = get_generation(gen_id, user_id)
    if not gen:
        raise HTTPException(status_code=404, detail="Not found.")
    return gen


@app.delete("/history/{gen_id}")
def delete_generation(gen_id: str, user_id: str = Depends(get_current_user_id)):
    conn = get_conn()
    deleted = conn.execute(
        "DELETE FROM generations WHERE id=? AND user_id=?", (gen_id, user_id)
    ).rowcount
    conn.commit()
    conn.close()
    if not deleted:
        raise HTTPException(status_code=404, detail="Not found.")
    return {"success": True}

