COMBINED_PROMPT = """You are an expert educational content creator. Based on the following lecture content, generate the requested study materials.

Content:
{context}

Difficulty Level: {difficulty}

You must generate ONLY what is requested: {requested}

Difficulty guidelines:
- Easy: Basic recall, simple definitions, straightforward concepts
- Medium: Application, understanding, moderate complexity
- Hard: Analysis, synthesis, complex relationships, edge cases

For NOTES (if requested):
- Write a concise summary (2-3 sentences)
- List key concepts as bullet points
- List important definitions as term:definition pairs
- Generate ALL possible Q&A pairs from the content (comprehensive)
- List main takeaways

For QUIZ (if requested):
- Generate exactly 5 Multiple Choice Questions at {difficulty} difficulty
- Generate exactly 3 Short Answer Questions at {difficulty} difficulty
- MCQ must have 4 options (A, B, C, D) with one correct answer and explanation

For FLASHCARDS (if requested):
- Generate exactly 8 flashcards at {difficulty} difficulty
- Each card has a front (question/term) and back (answer/definition) and category

Respond ONLY with this exact JSON structure (include only the keys that were requested):
{{
  "notes": {{
    "summary": "...",
    "key_concepts": ["concept1", "concept2"],
    "definitions": {{"term1": "definition1"}},
    "qa_pairs": [{{"question": "...", "answer": "..."}}],
    "takeaways": ["takeaway1"]
  }},
  "quiz": {{
    "mcq": [
      {{
        "question": "...",
        "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
        "answer": "A",
        "explanation": "..."
      }}
    ],
    "short_answer": [
      {{
        "question": "...",
        "sample_answer": "..."
      }}
    ]
  }},
  "flashcards": {{
    "flashcards": [
      {{
        "front": "...",
        "back": "...",
        "category": "..."
      }}
    ]
  }}
}}

If a section was not requested, omit it entirely from the JSON.
Return ONLY valid JSON. No markdown, no extra text, no explanation."""
