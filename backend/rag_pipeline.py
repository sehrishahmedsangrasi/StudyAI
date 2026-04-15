import os, json, re, time
from pathlib import Path
from typing import Optional
from langchain_huggingface import HuggingFaceEndpointEmbeddings
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_community.vectorstores import FAISS
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from prompts import COMBINED_PROMPT

STORAGE_DIR = Path("./storage")
STORAGE_DIR.mkdir(exist_ok=True)


def clean_json(text: str) -> str:
    text = text.strip()
    text = re.sub(r"^```json\s*", "", text)
    text = re.sub(r"^```\s*", "", text)
    text = re.sub(r"\s*```$", "", text)
    return text.strip()


def sanitize_context(text: str) -> str:
    replacements = {
        '\u2019': "'", '\u2018': "'",
        '\u201c': '"', '\u201d': '"',
        '\u2013': '-', '\u2014': '-',
        '\u00a0': ' ', '\u2026': '...',
        '\u2022': '-', '\u00b7': '-',
    }
    for char, replacement in replacements.items():
        text = text.replace(char, replacement)
    text = text.encode('ascii', errors='ignore').decode('ascii')
    return text


def repair_json(text: str) -> str:
    text = text.strip()
    open_braces = text.count('{') - text.count('}')
    open_brackets = text.count('[') - text.count(']')
    text = re.sub(r',\s*$', '', text)
    in_string = False
    escaped = False
    for ch in text:
        if escaped:
            escaped = False
            continue
        if ch == '\\':
            escaped = True
            continue
        if ch == '"':
            in_string = not in_string
    if in_string:
        text += '"'
    text += ']' * max(0, open_brackets)
    text += '}' * max(0, open_braces)
    return text


class FileStore:
    def __init__(self, embeddings, user_id: str):
        self.embeddings = embeddings
        self.sdir = STORAGE_DIR / user_id[:16]
        self.sdir.mkdir(exist_ok=True)
        self.meta_path = self.sdir / "files_meta.json"
        self.meta: dict = {}
        self.vectorstores: dict = {}
        self._load_meta()

    def _load_meta(self):
        if self.meta_path.exists():
            try:
                self.meta = json.loads(self.meta_path.read_text())
            except:
                self.meta = {}

    def _save_meta(self):
        self.meta_path.write_text(json.dumps(self.meta, indent=2))

    def _faiss_path(self, file_id: str) -> Path:
        return self.sdir / f"faiss_{file_id}"

    def _get_vs(self, file_id: str):
        if file_id in self.vectorstores:
            return self.vectorstores[file_id]
        fp = self._faiss_path(file_id)
        if fp.exists():
            try:
                vs = FAISS.load_local(str(fp), self.embeddings, allow_dangerous_deserialization=True)
                self.vectorstores[file_id] = vs
                return vs
            except:
                pass
        return None

    def add_file(self, file_id: str, filename: str, text: str) -> int:
        splitter = RecursiveCharacterTextSplitter(chunk_size=800, chunk_overlap=150)
        chunks = splitter.split_text(text)
        if not chunks:
            raise ValueError("Empty file.")
        docs = [Document(page_content=c, metadata={"file_id": file_id}) for c in chunks]
        vs = FAISS.from_documents(docs, self.embeddings)
        vs.save_local(str(self._faiss_path(file_id)))
        self.vectorstores[file_id] = vs
        self.meta[file_id] = {"name": filename, "chunks": len(chunks)}
        self._save_meta()
        return len(chunks)

    def remove_file(self, file_id: str) -> bool:
        if file_id not in self.meta:
            return False
        self.vectorstores.pop(file_id, None)
        del self.meta[file_id]
        self._save_meta()
        fp = self._faiss_path(file_id)
        if fp.exists():
            import shutil
            shutil.rmtree(str(fp), ignore_errors=True)
        return True

    def list_files(self) -> list:
        return [{"id": fid, "name": info["name"], "chunks": info["chunks"]}
                for fid, info in self.meta.items()]

    def retrieve_context(self, file_ids: list, query: str, k: int = 3) -> str:
        all_docs = []
        for fid in file_ids:
            if fid not in self.meta:
                continue
            vs = self._get_vs(fid)
            if vs:
                all_docs.extend(vs.similarity_search(query, k=k))
        seen, result = set(), []
        for doc in all_docs:
            c = doc.page_content.strip()
            if c not in seen:
                seen.add(c)
                result.append(c)
        raw_context = "\n\n".join(result)[:2500]
        return sanitize_context(raw_context)


class RAGPipeline:
    def __init__(self, api_key: str, user_id: str, hf_api_key: str):
        os.environ["GOOGLE_API_KEY"] = api_key
        
        self.embeddings = HuggingFaceEndpointEmbeddings(
            model="sentence-transformers/all-MiniLM-L6-v2",
            huggingfacehub_api_token=hf_api_key,
        )
        
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-1.5-flash",
            google_api_key=api_key,
            temperature=0.2,
            max_output_tokens=2048,
        )
        self.file_store = FileStore(self.embeddings, user_id)

    def add_file(self, file_id, filename, text):
        return self.file_store.add_file(file_id, filename, text)

    def remove_file(self, file_id):
        return self.file_store.remove_file(file_id)

    def list_files(self):
        return self.file_store.list_files()

    def _generate_single(self, context, difficulty, requested) -> dict:
        chain = PromptTemplate(
            input_variables=["context", "difficulty", "requested"],
            template=COMBINED_PROMPT
        ) | self.llm | StrOutputParser()

        raw = chain.invoke({
            "context": context,
            "difficulty": difficulty,
            "requested": requested,
        })

        cleaned = clean_json(raw)

        # Attempt 1: direct parse
        try:
            return json.loads(cleaned)
        except json.JSONDecodeError:
            pass

        # Attempt 2: repair truncated JSON
        try:
            repaired = repair_json(cleaned)
            return json.loads(repaired)
        except json.JSONDecodeError:
            pass

        # Attempt 3: ask Gemini to fix its own broken output
        try:
            fix_chain = self.llm | StrOutputParser()
            fixed_raw = fix_chain.invoke(
                f"The following is broken JSON. Fix it so it is valid and return ONLY "
                f"the corrected JSON object, no markdown, no explanation, nothing else:\n\n{cleaned[:3000]}"
            )
            return json.loads(clean_json(fixed_raw))
        except Exception as e:
            raise ValueError(
                f"Could not parse AI response: {e}\n\nRaw (first 300 chars):\n{cleaned[:300]}"
            )

    def _with_retry(self, fn, max_attempts=3) -> dict:
        for attempt in range(max_attempts):
            try:
                return fn()
            except Exception as e:
                err = str(e)
                if "429" in err or "RESOURCE_EXHAUSTED" in err:
                    if attempt < max_attempts - 1:
                        time.sleep(35 * (attempt + 1))
                        continue
                    raise ValueError("Quota limit reached. Wait 1 minute and retry.")
                if attempt == max_attempts - 1:
                    raise
                time.sleep(5)

    def generate(self, file_ids, difficulty="Medium",
                 generate_notes=True, generate_quiz=True, generate_flashcards=True) -> dict:

        parts = []
        if generate_notes:     parts.append("NOTES")
        if generate_quiz:      parts.append("QUIZ")
        if generate_flashcards: parts.append("FLASHCARDS")
        if not parts:
            raise ValueError("Select at least one output.")

        context = self.file_store.retrieve_context(
            file_ids, f"{difficulty} concepts definitions facts", k=3
        )
        if not context.strip():
            raise ValueError("No content found for selected files.")

        result = {}

        # Split notes into its own call to avoid truncation when all 3 are requested
        if generate_notes and (generate_quiz or generate_flashcards):
            notes_result = self._with_retry(
                lambda: self._generate_single(context, difficulty, "NOTES")
            )
            result.update(notes_result)

            remaining = []
            if generate_quiz:       remaining.append("QUIZ")
            if generate_flashcards: remaining.append("FLASHCARDS")

            time.sleep(2)
            rest_result = self._with_retry(
                lambda: self._generate_single(context, difficulty, ", ".join(remaining))
            )
            result.update(rest_result)

        else:
            # Single call: only 1 or 2 outputs, no notes split needed
            result = self._with_retry(
                lambda: self._generate_single(context, difficulty, ", ".join(parts))
            )

        return result