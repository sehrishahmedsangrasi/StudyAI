import sqlite3
import json
from pathlib import Path
from datetime import datetime

DB_PATH = Path("./storage/studyai.db")
DB_PATH.parent.mkdir(exist_ok=True)


def get_conn():
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_conn()
    c = conn.cursor()
    c.executescript("""
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            google_id TEXT UNIQUE NOT NULL,
            name TEXT,
            email TEXT,
            avatar TEXT,
            created_at TEXT DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS files (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            filename TEXT NOT NULL,
            chunks INTEGER DEFAULT 0,
            uploaded_at TEXT DEFAULT (datetime('now')),
            FOREIGN KEY(user_id) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS generations (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            title TEXT,
            file_names TEXT,
            difficulty TEXT,
            notes TEXT,
            quiz TEXT,
            flashcards TEXT,
            created_at TEXT DEFAULT (datetime('now')),
            FOREIGN KEY(user_id) REFERENCES users(id)
        );
    """)
    conn.commit()
    conn.close()


# ── Users ─────────────────────────────────────────────────────────────────────

def upsert_user(google_id, name, email, avatar) -> dict:
    import uuid
    conn = get_conn()
    c = conn.cursor()
    c.execute("SELECT * FROM users WHERE google_id = ?", (google_id,))
    row = c.fetchone()
    if row:
        c.execute("UPDATE users SET name=?, email=?, avatar=? WHERE google_id=?",
                  (name, email, avatar, google_id))
        user_id = row["id"]
    else:
        user_id = str(uuid.uuid4())
        c.execute("INSERT INTO users (id, google_id, name, email, avatar) VALUES (?,?,?,?,?)",
                  (user_id, google_id, name, email, avatar))
    conn.commit()
    conn.close()
    return {"id": user_id, "name": name, "email": email, "avatar": avatar}


def get_user(user_id: str) -> dict | None:
    conn = get_conn()
    c = conn.cursor()
    c.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    row = c.fetchone()
    conn.close()
    return dict(row) if row else None


# ── Files ─────────────────────────────────────────────────────────────────────

def save_file(file_id: str, user_id: str, filename: str, chunks: int):
    conn = get_conn()
    conn.execute("INSERT OR REPLACE INTO files (id, user_id, filename, chunks) VALUES (?,?,?,?)",
                 (file_id, user_id, filename, chunks))
    conn.commit()
    conn.close()


def delete_file(file_id: str, user_id: str):
    conn = get_conn()
    conn.execute("DELETE FROM files WHERE id=? AND user_id=?", (file_id, user_id))
    conn.commit()
    conn.close()


def get_user_files(user_id: str) -> list:
    conn = get_conn()
    rows = conn.execute(
        "SELECT * FROM files WHERE user_id=? ORDER BY uploaded_at DESC", (user_id,)
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


# ── Generations ───────────────────────────────────────────────────────────────

def save_generation(gen_id, user_id, title, file_names, difficulty, notes, quiz, flashcards):
    conn = get_conn()
    conn.execute("""
        INSERT INTO generations (id, user_id, title, file_names, difficulty, notes, quiz, flashcards)
        VALUES (?,?,?,?,?,?,?,?)
    """, (
        gen_id, user_id, title,
        json.dumps(file_names),
        difficulty,
        json.dumps(notes) if notes else None,
        json.dumps(quiz) if quiz else None,
        json.dumps(flashcards) if flashcards else None,
    ))
    conn.commit()
    conn.close()


def get_user_generations(user_id: str) -> list:
    conn = get_conn()
    rows = conn.execute(
        "SELECT * FROM generations WHERE user_id=? ORDER BY created_at DESC LIMIT 50",
        (user_id,)
    ).fetchall()
    conn.close()
    result = []
    for r in rows:
        d = dict(r)
        d["file_names"] = json.loads(d["file_names"]) if d["file_names"] else []
        d["notes"] = json.loads(d["notes"]) if d["notes"] else None
        d["quiz"] = json.loads(d["quiz"]) if d["quiz"] else None
        d["flashcards"] = json.loads(d["flashcards"]) if d["flashcards"] else None
        result.append(d)
    return result


def get_generation(gen_id: str, user_id: str) -> dict | None:
    conn = get_conn()
    row = conn.execute(
        "SELECT * FROM generations WHERE id=? AND user_id=?", (gen_id, user_id)
    ).fetchone()
    conn.close()
    if not row:
        return None
    d = dict(row)
    d["file_names"] = json.loads(d["file_names"]) if d["file_names"] else []
    d["notes"] = json.loads(d["notes"]) if d["notes"] else None
    d["quiz"] = json.loads(d["quiz"]) if d["quiz"] else None
    d["flashcards"] = json.loads(d["flashcards"]) if d["flashcards"] else None
    return d
