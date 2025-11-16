"""
Study Buddy AI – Terminal Edition
================================

This script provides a command‑line interface for testing the core logic of
the Emotionally Intelligent Study Buddy without running a web server.  It
implements the following features:

* **Chat with personas** – Choose one of three personalities (Cheerleader,
  Peer, Mentor) to interact with the AI.  The script maintains a
  conversation history and prepends the persona's prompt to each request.

* **Emotion detection** – Each user message is classified into one of the
  six basic emotions (sadness, joy, love, anger, fear or surprise) using a
  Hugging Face model trained on the Emotion dataset【570093660071415†L602-L633】.  The detected
  emotion influences the AI's tone through predefined guidance phrases.

* **Note upload and retrieval** – You can upload a PDF, DOCX or plain
  text file by entering its path.  The script extracts text from the
  document, chunks it, computes sentence embeddings and stores them in
  memory.  When asking questions, the AI retrieves the most relevant
  passages to include as context.

Run the script with a valid Google Gemini API key set in your `.env` file
or environment.  Example:

```
pip install transformers sentence-transformers pdfplumber docx2txt python-dotenv google-generativeai
python study_buddy_terminal.py
```

The script will prompt you to choose a persona and start chatting.
Commands supported in the chat loop:

  * `/upload <path>` – Upload notes from the specified file path.
  * `/ask <question>` – Ask a question about your uploaded notes.
  * `/clear` – Clear the conversation history.
  * `/save` – Save the conversation to a text file.
  * `/exit` – Exit to persona selection.
  * `/quit` – Exit the program.

"""

from __future__ import annotations

import os
import sys
import json
import tempfile
from datetime import datetime
from typing import List, Dict, Any, Optional

from dotenv import load_dotenv
import numpy as np
import pdfplumber
import docx2txt
from transformers import pipeline
from sentence_transformers import SentenceTransformer
import google.generativeai as genai

###############################################################################
# Load environment variables and configure Gemini
###############################################################################

load_dotenv()
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    print("❌ GEMINI_API_KEY not found. Please create a .env file with GEMINI_API_KEY=<your-key>.")
    sys.exit(1)

try:
    genai.configure(api_key=GEMINI_API_KEY)
    # Use the flash model for lower latency
    gen_model = genai.GenerativeModel("models/gemini-2.5-flash")
    print("✅ Gemini configured successfully!")
except Exception as e:
    print(f"❌ Failed to configure Gemini: {e}")
    sys.exit(1)

###############################################################################
# Initialise models: emotion classifier and sentence embeddings
###############################################################################

print("🔄 Loading models…")
try:
    emotion_classifier = pipeline(
        "text-classification",
        model="bhadresh-savani/distilbert-base-uncased-emotion",
        return_all_scores=True,
    )
    embedding_model = SentenceTransformer("all-MiniLM-L6-v2")
    print("✅ Models loaded.")
except Exception as e:
    print(f"❌ Error loading models: {e}")
    sys.exit(1)

###############################################################################
# Personality and emotion guidance definitions
###############################################################################

class Personality:
    def __init__(self, name: str, prompt: str, emoji: str) -> None:
        self.name = name
        self.prompt = prompt
        self.emoji = emoji


PERSONALITY_MODES: Dict[str, Personality] = {
    "1": Personality(
        name="The Cheerleader",
        prompt=(
            "You're an enthusiastic and motivating study buddy! "
            "You're always positive, encouraging, and celebrate every small win. "
            "You use emojis, exclamation marks, and make studying feel fun and achievable. "
            "When explaining concepts, you break them down into bite‑sized pieces and "
            "constantly remind the student they can do this! You're like their "
            "biggest fan cheering them on. You answer in the language that the "
            "user typed or requested."
        ),
        emoji="🎉",
    ),
    "2": Personality(
        name="The Peer",
        prompt=(
            "You're a friendly, relatable study buddy who feels like a classmate. "
            "You use casual language, share study tips like you're texting a friend, "
            "and relate to the struggles of learning. You're supportive but real – "
            "you understand when things are tough and help work through it together. "
            "You're collaborative and conversational. You answer in the language "
            "that the user typed or requested."
        ),
        emoji="🤝",
    ),
    "3": Personality(
        name="The Mentor",
        prompt=(
            "You're a wise, patient mentor who provides structured guidance. "
            "You ask thoughtful questions to check understanding, provide detailed "
            "explanations with examples, and help students develop critical thinking skills. "
            "You're encouraging but also challenge students to think deeper. "
            "You use techniques like the Socratic method, provide step‑by‑step breakdowns, "
            "and connect concepts to real‑world applications. You answer in the language "
            "that the user typed or requested."
        ),
        emoji="📚",
    ),
}

EMOTION_GUIDANCE: Dict[str, str] = {
    "sadness": (
        "The student seems sad or down. Respond with empathy and encouragement. "
        "Use gentle language, acknowledge their feelings and remind them that "
        "learning takes time. Offer simple steps to build confidence."
    ),
    "joy": (
        "The student appears joyful and excited. Mirror their positivity and keep the "
        "momentum going. Reinforce the fun aspects of learning and suggest small "
        "challenges to sustain engagement."
    ),
    "love": (
        "The student expresses affectionate or appreciative feelings. Respond with "
        "kindness and gratitude. Encourage them to channel this positive energy "
        "into their studies."
    ),
    "anger": (
        "The student seems frustrated or angry. Remain calm and patient. Validate "
        "their frustration and offer to revisit the concepts step by step. Reassure "
        "them that struggles are a normal part of learning."
    ),
    "fear": (
        "The student expresses fear or anxiety. Use a reassuring tone, emphasise "
        "safety and support. Break tasks into manageable pieces and remind them "
        "that they have your full support."
    ),
    "surprise": (
        "The student seems surprised. Clarify any misunderstandings, provide more "
        "context and invite them to ask follow‑up questions."
    ),
}

###############################################################################
# In‑memory storage
###############################################################################

vector_store: Dict[int, List[Dict[str, Any]]] = {}
conversation_history: Dict[str, List[Dict[str, Any]]] = {}

###############################################################################
# Helper functions
###############################################################################

def classify_emotion(text: str) -> str:
    """Return the highest scoring emotion label for the given text."""
    try:
        preds = emotion_classifier(text)
        if not preds:
            return "joy"
        top = max(preds[0], key=lambda x: x["score"])
        return top["label"].lower()
    except Exception:
        return "joy"


def embed_text(text: str) -> np.ndarray:
    """Compute a normalised sentence embedding for the text."""
    vec = embedding_model.encode([text], convert_to_numpy=True)[0]
    norm = np.linalg.norm(vec)
    return vec / norm if norm > 0 else vec


def retrieve_context(user_id: int, question: str, k: int = 3) -> List[str]:
    """Return the k most similar note chunks for the question."""
    notes = vector_store.get(user_id, [])
    if not notes:
        return []
    q_emb = embed_text(question)
    sims = []
    for entry in notes:
        score = float(np.dot(q_emb, entry["embedding"]))
        sims.append((score, entry["text"]))
    sims.sort(key=lambda x: x[0], reverse=True)
    return [text for _, text in sims[:k]]


def generate_reply(
    user_message: str,
    personality_mode: str,
    conversation: List[Dict[str, Any]],
    emotion: str,
    context_passages: Optional[List[str]] = None,
) -> str:
    """Construct a prompt and query Gemini for a reply."""
    persona = PERSONALITY_MODES.get(personality_mode, PERSONALITY_MODES["1"])
    recent = conversation[-10:] if len(conversation) > 10 else conversation
    context_lines = []
    for msg in recent:
        speaker = "Student" if msg.get("is_user") else persona.name
        context_lines.append(f"{speaker}: {msg.get('text')}")
    context_text = "\n".join(context_lines) if context_lines else "This is the start of our conversation."
    emotion_instruction = EMOTION_GUIDANCE.get(emotion, "")
    notes_section = ""
    if context_passages:
        joined = "\n\n".join(context_passages)
        notes_section = (
            "\n\nHere are some relevant excerpts from the student's notes:"\
            f"\n{joined}"\
            "\nPlease use these notes to inform your answer."
        )
    prompt = (
        f"{persona.prompt}\n\n"
        f"{emotion_instruction}\n\n"
        "Previous conversation:\n"
        f"{context_text}\n\n"
        f"Current student message: {user_message}\n\n"
        f"Respond naturally as {persona.name}, maintaining continuity of the conversation."
        f"{notes_section}"
    )
    try:
        response = gen_model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"Error generating response: {e}"


def load_notes(user_id: int, path: str) -> int:
    """Load notes from a file and store their embeddings for a user.

    Args:
        user_id: The user for whom notes are stored.
        path: Path to the PDF, DOCX or plain text file.

    Returns:
        Number of chunks stored.
    """
    if not os.path.isfile(path):
        print(f"❌ File not found: {path}")
        return 0
    ext = os.path.splitext(path.lower())[1]
    text = ""
    try:
        if ext == ".pdf":
            with pdfplumber.open(path) as pdf:
                pages = [p.extract_text() or "" for p in pdf.pages]
                text = "\n".join(pages)
        elif ext in {".docx", ".doc"}:
            text = docx2txt.process(path) or ""
        else:
            with open(path, "r", encoding="utf-8", errors="ignore") as f:
                text = f.read()
    except Exception as e:
        print(f"❌ Failed to extract text: {e}")
        return 0
    words = text.split()
    chunk_size = 500
    chunks = [" ".join(words[i : i + chunk_size]) for i in range(0, len(words), chunk_size)]
    stored = []
    for chunk in chunks:
        if not chunk.strip():
            continue
        emb = embed_text(chunk)
        stored.append({"embedding": emb, "text": chunk})
    existing = vector_store.get(user_id, [])
    existing.extend(stored)
    vector_store[user_id] = existing
    return len(stored)


def chat_loop(user_id: int, session_id: str, mode: str) -> None:
    """Run the interactive chat loop for a given persona."""
    persona = PERSONALITY_MODES.get(mode, PERSONALITY_MODES["1"])
    history = conversation_history.get(session_id, [])
    print(f"\n✨ Chatting with {persona.emoji} {persona.name}. Type your message or a command.\n")
    print("Available commands:")
    print("  /upload <path>  - Upload notes from a file")
    print("  /ask <question> - Ask a question using your uploaded notes")
    print("  /clear          - Clear the conversation history")
    print("  /save           - Save the conversation to a file")
    print("  /exit           - Exit to persona selection")
    print("  /quit           - Quit the application\n")
    # Send an initial greeting from the AI
    init_message = "Hi! I'm ready to study."
    history.append({"text": init_message, "is_user": True})
    init_emotion = classify_emotion(init_message)
    reply = generate_reply(init_message, mode, history, init_emotion)
    history.append({"text": reply, "is_user": False})
    print(f"{persona.emoji} {persona.name}: {reply}\n")
    # Chat loop
    while True:
        try:
            user_input = input("You: ").strip()
        except KeyboardInterrupt:
            print("\n👋 Goodbye!")
            sys.exit(0)
        if not user_input:
            continue
        # Command handling
        if user_input.startswith("/quit"):
            print("👋 Exiting…")
            sys.exit(0)
        if user_input.startswith("/exit"):
            conversation_history[session_id] = history
            return
        if user_input.startswith("/clear"):
            history.clear()
            print("🧹 Conversation cleared.\n")
            continue
        if user_input.startswith("/save"):
            filename = f"study_session_{session_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
            with open(filename, "w", encoding="utf-8") as f:
                f.write(f"Study Buddy Session - {persona.name}\n")
                f.write(f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
                f.write("=" * 60 + "\n\n")
                for msg in history:
                    speaker = "You" if msg.get("is_user") else persona.name
                    f.write(f"{speaker}: {msg.get('text')}\n\n")
            print(f"💾 Conversation saved to {filename}\n")
            continue
        if user_input.startswith("/upload"):
            parts = user_input.split(maxsplit=1)
            if len(parts) < 2:
                print("❗ Usage: /upload <path>")
                continue
            path = parts[1].strip().strip('"')
            chunks = load_notes(user_id, path)
            if chunks > 0:
                print(f"📄 Uploaded and stored {chunks} chunks from {path}\n")
            continue
        if user_input.startswith("/ask"):
            parts = user_input.split(maxsplit=1)
            if len(parts) < 2:
                print("❗ Usage: /ask <question>")
                continue
            question = parts[1].strip()
            # Treat /ask as a separate Q&A but still update conversation
            history.append({"text": question, "is_user": True})
            emotion = classify_emotion(question)
            context_passages = retrieve_context(user_id, question)
            answer = generate_reply(question, mode, history, emotion, context_passages if context_passages else None)
            history.append({"text": answer, "is_user": False})
            print(f"{persona.emoji} {persona.name}: {answer}\n")
            continue
        # Otherwise it's a normal chat message
        history.append({"text": user_input, "is_user": True})
        emotion = classify_emotion(user_input)
        response = generate_reply(user_input, mode, history, emotion)
        history.append({"text": response, "is_user": False})
        print(f"{persona.emoji} {persona.name}: {response}\n")


def main() -> None:
    """Main entry point for the terminal UI."""
    print("\n🎓 Study Buddy AI – Terminal Edition")
    print("=" * 60)
    while True:
        print("\nSelect your study buddy mode:")
        for key, persona in PERSONALITY_MODES.items():
            print(f"  {key}. {persona.emoji} {persona.name}")
        print("  q. Quit\n")
        choice = input("Enter choice (1-3 or 'q' to quit): ").strip().lower()
        if choice == "q":
            print("👋 Goodbye!")
            break
        if choice not in PERSONALITY_MODES:
            print("❌ Invalid selection. Please choose 1, 2, or 3.")
            continue
        # Ask for user_id and session_id
        try:
            uid_input = input("Enter your user ID (integer): ").strip()
            user_id = int(uid_input)
        except ValueError:
            print("❌ Invalid user ID. Must be an integer.")
            continue
        session_id = f"session_{user_id}_{datetime.now().strftime('%Y%m%d%H%M%S')}"
        chat_loop(user_id, session_id, choice)


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"❌ Fatal error: {e}")
        sys.exit(1)