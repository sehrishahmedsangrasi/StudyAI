"""
Run this to see which models are available on your API key:
  python test_models.py YOUR_API_KEY_HERE
"""
import sys
import google.generativeai as genai

api_key = sys.argv[1] if len(sys.argv) > 1 else input("Enter your Gemini API key: ")
genai.configure(api_key=api_key)

print("\n--- Available Embedding Models ---")
for m in genai.list_models():
    if "embed" in m.name.lower():
        print(f"  {m.name}  |  methods: {m.supported_generation_methods}")

print("\n--- Available Generative Models ---")
for m in genai.list_models():
    if "generateContent" in m.supported_generation_methods:
        print(f"  {m.name}")
