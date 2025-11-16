"""
Study Buddy AI Backend
======================

This module implements a simple FastAPI backend for the Emotionally Intelligent
AI Study Buddy.  It exposes a handful of endpoints that allow a React
front‑end to send chat messages, upload study notes, and ask questions
about those notes.  The service wraps a generative model from Google
Gemini, an off‑the‑shelf Hugging Face emotion classifier, and a light‑weight
embedding model for retrieval.  The goal is to illustrate one way to
structure the backend; you can extend or optimise it as needed.

Key features:

* **Emotion detection** – Incoming user messages are passed through a
  transformer pipeline fine‑tuned on the Emotion dataset, which classifies
  text into six categories (sadness, joy, love, anger, fear and surprise).
  The Emotion dataset consists of English Twitter messages labelled with
  these six basic emotions【570093660071415†L602-L633】.  Using the
  classifier allows the Study Buddy to adapt its tone to the student's
  current mood.

* **Personality modes** – Users can choose between three personas
  (Cheerleader, Peer or Mentor).  Each persona has its own prompt
  describing its behaviour.  When generating responses, the service
  combines the persona prompt with the conversation history and the
  detected emotion to produce a more empathetic reply.

* **Note upload and retrieval** – Students can upload PDF, DOCX or plain
  text files containing their study notes.  The backend extracts the
  text, breaks it into chunks, computes sentence embeddings and stores
  them.  When asked a question, the service retrieves the most relevant
  chunks and passes them to the generative model to provide a
  context‑aware answer.

* **Stateless design** – To keep the example simple, conversation
  histories and note embeddings are stored in memory.  In a production
  system you would persist these to a database and use a dedicated
  vector store for retrieval.

The endpoints defined here expect JSON payloads and return structured
responses that can be consumed directly by a React front‑end.
"""

from __future__ import annotations

import json
import os
from datetime import datetime
from typing import List, Optional, Dict, Any

from fastapi import FastAPI, HTTPException, UploadFile, File, Depends, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

try:
    from sqlmodel import SQLModel, Field, create_engine, Session, select  # type: ignore
except ImportError:
    SQLModel = None  # type: ignore
    Field = None  # type: ignore
    create_engine = None  # type: ignore
    Session = None  # type: ignore
    select = None  # type: ignore

# Third‑party libraries for AI functionality
import google.generativeai as genai
from transformers import pipeline
from sentence_transformers import SentenceTransformer
import numpy as np
from dotenv import load_dotenv

# Libraries for extracting text from notes
import pdfplumber
import docx2txt


###############################################################################
# Configuration and initialisation
###############################################################################

# Load environment variables for the Gemini API key.  If the key is missing
# the application will fail at startup rather than when the first request
load_dotenv()

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise RuntimeError(
        "Environment variable GEMINI_API_KEY is not set. "
        "Make sure it's in your .env file."
    )

try:
    genai.configure(api_key=GEMINI_API_KEY)
    # Use the flash model for low latency 
    _generative_model = genai.GenerativeModel("models/gemini-2.5-flash") 
    print("Gemini client configured successfully!")

except Exception as e:
    raise RuntimeError(f"Failed to initialise the Gemini client: {e}")

# Initialise the emotion classification pipeline.  The model used here
# (distilbert‑base‑uncased‑emotion) has been fine‑tuned on the Emotion
# dataset (English Twitter messages labelled with six emotions
# {sadness, joy, love, anger, fear, surprise}【570093660071415†L602-L633】) and
# achieves competitive accuracy【696647717412394†L82-L97】.  Returning all
# scores allows us to pick the highest‑scoring label.
_emotion_classifier = pipeline(
    "text-classification",
    model="bhadresh-savani/distilbert-base-uncased-emotion",
    top_k=None,
)

# Initialise the sentence embedding model.  MiniLM provides a good
# performance/quality trade‑off for semantic similarity tasks.
_embedding_model = SentenceTransformer("all-MiniLM-L6-v2")


###############################################################################
# Data models
###############################################################################

# You can persist notes and chat history in a relational database via SQLModel.
# For brevity this example keeps data in memory. 

class Personality(BaseModel):
    name: str
    prompt: str
    emoji: str


# Define the available Study Buddy personas.  Each entry contains a name,
# descriptive prompt and an emoji.  When generating replies the prompt is
# prepended to the conversation context and emotion guidance.
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

# Guidance for adapting the response based on the detected emotion.  For each
# emotion we provide a short description that will be appended to the
# personality prompt.  These suggestions help the generative model adjust
# tone and content.  
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

# In‑memory storage for note embeddings.  Maps a user id to a list of
# dictionaries with 'embedding' (NumPy array) and 'text' fields.
_vector_store: Dict[int, List[Dict[str, Any]]] = {}

# In‑memory conversation history.  Maps a session id (str) to a list of
# messages, each message being a dict with 'text' and 'is_user'.  
_conversation_history: Dict[str, List[Dict[str, Any]]] = {}


###############################################################################
# Utility functions
###############################################################################

def classify_emotion(text: str) -> str:
    """Classify the predominant emotion in a piece of text.

    The classifier returns a list of label/score pairs.  We select the label
    with the highest score.  If classification fails, we default to 'joy'.

    Args:
        text: The input string.

    Returns:
        The predicted emotion label as a lower‑case string.
    """
    try:
        predictions = _emotion_classifier(text)
        # predictions is a list of one item since return_all_scores=True
        if not predictions:
            return "joy"
        label_scores = predictions[0]
        # Pick the label with the highest score
        top = max(label_scores, key=lambda x: x["score"])
        return top["label"].lower()
    except Exception:
        # In case of any error, fall back to a neutral emotion
        return "joy"


def embed_text(text: str) -> np.ndarray:
    """Compute a sentence embedding for the given text.

    Uses the MiniLM model to encode the text into a high dimensional vector.  The
    output is an ndarray that can be used for cosine similarity.

    Args:
        text: The input text.

    Returns:
        A numpy array representing the embedding.
    """
    # The embedding model expects a list of sentences and returns a list
    embedding = _embedding_model.encode([text], convert_to_numpy=True)[0]
    # Normalise the embedding for cosine similarity
    norm = np.linalg.norm(embedding)
    return embedding / norm if norm > 0 else embedding


def retrieve_context(user_id: int, question: str, k: int = 3) -> List[str]:
    """Retrieve the most relevant note chunks for a question.

    Computes the embedding of the question and compares it to all stored
    embeddings for the user.  Returns the texts of the top‑`k` matches.

    Args:
        user_id: Identifier of the user.  Only their notes are considered.
        question: The query string for which context is needed.
        k: Number of top passages to return.

    Returns:
        A list of `k` text passages sorted by similarity.
    """
    notes = _vector_store.get(user_id, [])
    if not notes:
        return []
    question_embedding = embed_text(question)
    similarities = []
    for entry in notes:
        # Compute dot product since embeddings are normalised
        score = float(np.dot(question_embedding, entry["embedding"]))
        similarities.append((score, entry["text"]))
    # Sort by similarity descending and take top k
    similarities.sort(key=lambda x: x[0], reverse=True)
    top_passages = [text for _, text in similarities[:k]]
    return top_passages


def generate_reply(
    user_message: str,
    personality_mode: str,
    conversation: List[Dict[str, Any]],
    emotion: str,
    context_passages: Optional[List[str]] = None,
) -> str:
    """Generate a reply from the generative model.

    This helper builds a prompt that includes the personality description,
    emotion guidance, optional context from notes, and the conversation history.
    It then calls the Gemini model to produce a natural response.

    Args:
        user_message: The latest message from the student.
        personality_mode: One of '1', '2' or '3' indicating the persona.
        conversation: The recent conversation history (list of dicts with
            'text' and 'is_user').  Only the last ten messages are used.
        emotion: The detected emotion label.
        context_passages: Optional list of text passages retrieved from notes.

    Returns:
        The generated response text.
    """
    personality = PERSONALITY_MODES.get(personality_mode, PERSONALITY_MODES["1"])
    # Build conversation context string
    recent_history = conversation[-10:] if len(conversation) > 10 else conversation
    context_lines = []
    for msg in recent_history:
        speaker = "Student" if msg.get("is_user") else personality.name
        context_lines.append(f"{speaker}: {msg.get('text')}")
    context_text = "\n".join(context_lines) if context_lines else "This is the start of our conversation."
    # Build emotion guidance
    emotion_instruction = EMOTION_GUIDANCE.get(emotion, "")
    # Build optional note context
    note_context = ""
    if context_passages:
        joined = "\n\n".join(context_passages)
        note_context = (
            "\n\nHere are some relevant excerpts from the student's notes:"\
            f"\n{joined}"\
            "\nPlease use these notes to inform your answer."
        )
    # Compose final prompt
    full_prompt = (
        f"{personality.prompt}\n\n"
        f"{emotion_instruction}\n\n"
        "Previous conversation:\n"
        f"{context_text}\n\n"
        f"Current student message: {user_message}\n\n"
        f"IMPORTANT: The student is asking a question. You must provide a helpful, accurate answer to their question. "
        f"Respond naturally as {personality.name}, but make sure to directly address and answer what the student is asking. "
        f"If you don't know the answer, say so honestly, but still try to be helpful. "
        f"Maintain continuity of the conversation while being informative and educational."
        f"{note_context}"
    )
    # Generate response using Gemini
    try:
        response = _generative_model.generate_content(full_prompt)
        return response.text
    except Exception as e:
        return f"Error generating response: {e}"


###############################################################################
# FastAPI application
###############################################################################

app = FastAPI(title="Emotionally Intelligent Study Buddy API")

# Configure CORS so that the React front‑end can talk to this service.  In
# production restrict allow_origins to your deployed domain.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite dev server
        "http://localhost:5174",  # Vite dev server (alternative port)
        "http://localhost:3000",  # Alternative React dev server
        "http://localhost:8080",  # Alternative port
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)


class ChatRequest(BaseModel):
    """Schema for chat requests."""

    user_id: int
    session_id: str
    message: str
    personality_mode: str = "1"

    # The front‑end can optionally send the conversation history; if not
    # provided the server will use what it has stored for this session.
    conversation: Optional[List[Dict[str, Any]]] = None
    # If provided and true, ask the model to consult uploaded notes.
    use_notes: bool = False


class ChatResponse(BaseModel):
    """Schema for chat responses."""

    reply: str
    emotion: str
    session_id: str


@app.post("/api/chat", response_model=ChatResponse)
async def chat_endpoint(payload: ChatRequest) -> ChatResponse:
    """Handle a chat message from the front‑end.

    Steps:
    1. Retrieve or initialise the conversation history for the given session.
    2. Detect the emotional state of the student's message.
    3. Optionally retrieve relevant note passages for the user.
    4. Generate a reply using the selected persona and context.
    5. Store the message and response in the session history.

    Args:
        payload: Parsed request body containing user id, session id, message,
            personality mode and optional conversation history.

    Returns:
        A ChatResponse containing the AI's reply and the detected emotion.
    """
    # Retrieve or create conversation history
    conversation = payload.conversation or _conversation_history.get(payload.session_id, [])
    # Append the new user message to the history
    conversation.append({"text": payload.message, "is_user": True})
    # Detect emotion
    emotion = classify_emotion(payload.message)
    # If requested, retrieve relevant note passages
    context_passages: Optional[List[str]] = None
    if payload.use_notes:
        context_passages = retrieve_context(payload.user_id, payload.message)
    # Generate the reply
    reply = generate_reply(
        user_message=payload.message,
        personality_mode=payload.personality_mode,
        conversation=conversation,
        emotion=emotion,
        context_passages=context_passages,
    )
    # Append AI response to history
    conversation.append({"text": reply, "is_user": False})
    # Save conversation back to memory
    _conversation_history[payload.session_id] = conversation
    # Return structured response
    return ChatResponse(reply=reply, emotion=emotion, session_id=payload.session_id)


class NoteUploadResponse(BaseModel):
    message: str
    num_chunks: int


@app.post("/api/notes/upload", response_model=NoteUploadResponse)
async def upload_notes(
    user_id: int = Form(...),
    file: UploadFile = File(...),
) -> NoteUploadResponse:
    """Upload study notes for later retrieval.

    Accepts a PDF, DOCX or plain text file.  The file contents are extracted,
    split into chunks of around 500 words and stored as embeddings in the
    in‑memory vector store.  For large files this endpoint may take a while.

    Args:
        user_id: The id of the user uploading the notes.
        file: The uploaded file (multipart/form-data).

    Returns:
        A NoteUploadResponse indicating how many chunks were stored.
    """
    # Read file contents
    contents = await file.read()
    if not contents:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")
    # Determine file type by extension
    filename = file.filename or ""
    ext = os.path.splitext(filename.lower())[1]
    text: str = ""
    try:
        import tempfile
        if ext in {".pdf"}:
            # Extract text from PDF using pdfplumber
            # pdfplumber needs a file path, so we write to a temporary file
            with tempfile.NamedTemporaryFile(suffix=ext, delete=False) as tmp:
                tmp.write(contents)
                tmp_path = tmp.name
            with pdfplumber.open(tmp_path) as pdf:
                pages = [page.extract_text() or "" for page in pdf.pages]
                text = "\n".join(pages)
            os.unlink(tmp_path)
        elif ext in {".docx", ".doc"}:
            # Extract text from DOCX using docx2txt
            # docx2txt expects a file path, so we write to a temporary file
            with tempfile.NamedTemporaryFile(suffix=ext, delete=False) as tmp:
                tmp.write(contents)
                tmp_path = tmp.name
            text = docx2txt.process(tmp_path) or ""
            os.unlink(tmp_path)
        else:
            # Assume plain text
            text = contents.decode("utf-8", errors="ignore")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse file: {e}")
    # Split text into chunks of roughly 500 words
    words = text.split()
    chunk_size = 500
    chunks = [
        " ".join(words[i : i + chunk_size])
        for i in range(0, len(words), chunk_size)
    ]
    # Compute embeddings and store them
    stored = []
    for chunk in chunks:
        if not chunk.strip():
            continue
        embedding = embed_text(chunk)
        stored.append({"embedding": embedding, "text": chunk})
    # Extend existing entries or create new list
    user_notes = _vector_store.get(user_id, [])
    user_notes.extend(stored)
    _vector_store[user_id] = user_notes
    return NoteUploadResponse(
        message=f"Stored {len(stored)} chunks for user {user_id}",
        num_chunks=len(stored),
    )


class NoteQuery(BaseModel):
    user_id: int
    session_id: str
    question: str
    personality_mode: str = "1"


class NoteAnswer(BaseModel):
    answer: str
    emotion: str
    session_id: str


@app.post("/api/notes/ask", response_model=NoteAnswer)
async def ask_notes(payload: NoteQuery) -> NoteAnswer:
    """Answer a question using the student's uploaded notes.

    Retrieves the most relevant passages from the user's notes and uses
    them as context for the generative model.  The conversation history is
    also updated with the question and response.

    Args:
        payload: The query containing user id, session id and question.

    Returns:
        A NoteAnswer containing the generated answer and the detected emotion.
    """
    # Retrieve conversation history
    conversation = _conversation_history.get(payload.session_id, [])
    # Append the student's question
    conversation.append({"text": payload.question, "is_user": True})
    # Detect emotion
    emotion = classify_emotion(payload.question)
    # Retrieve relevant passages from notes
    passages = retrieve_context(payload.user_id, payload.question)
    if not passages:
        # If no notes are available, still attempt to answer using the generative model
        reply = generate_reply(
            user_message=payload.question,
            personality_mode=payload.personality_mode,
            conversation=conversation,
            emotion=emotion,
            context_passages=None,
        )
    else:
        reply = generate_reply(
            user_message=payload.question,
            personality_mode=payload.personality_mode,
            conversation=conversation,
            emotion=emotion,
            context_passages=passages,
        )
    # Append reply to history
    conversation.append({"text": reply, "is_user": False})
    _conversation_history[payload.session_id] = conversation
    return NoteAnswer(answer=reply, emotion=emotion, session_id=payload.session_id)


@app.get("/api/personality-modes", response_model=Dict[str, Personality])
def list_personality_modes() -> Dict[str, Personality]:
    """Return the available personality modes.

    This endpoint allows the front‑end to populate a dropdown of persona
    choices.  It returns a mapping from mode identifier to its details.
    """
    return PERSONALITY_MODES


class SummaryRequest(BaseModel):
    user_id: int
    personality_mode: str = "1"


class SummaryResponse(BaseModel):
    summary: str
    num_chunks: int


@app.post("/api/notes/summary", response_model=SummaryResponse)
async def summarize_notes(payload: SummaryRequest) -> SummaryResponse:
    """Generate a summary of all uploaded notes for a user.

    Retrieves all note chunks for the user and asks the AI to generate
    a comprehensive summary of the content.

    Args:
        payload: The request containing user_id and personality_mode.

    Returns:
        A SummaryResponse containing the generated summary and number of chunks.
    """
    notes = _vector_store.get(payload.user_id, [])
    if not notes:
        raise HTTPException(status_code=404, detail="No notes found for this user")
    
    # Combine all note chunks
    all_text = "\n\n".join([entry["text"] for entry in notes])
    
    personality = PERSONALITY_MODES.get(payload.personality_mode, PERSONALITY_MODES["1"])
    
    # Create a prompt for summarization
    summary_prompt = (
        f"{personality.prompt}\n\n"
        "The student has uploaded study notes. Please provide a comprehensive summary "
        "of the key concepts, main topics, and important information from these notes. "
        "Organize the summary in a clear and structured way that will help the student "
        "understand and review the material.\n\n"
        f"Notes content:\n{all_text}\n\n"
        "Please provide a well-organized summary."
    )
    
    try:
        response = _generative_model.generate_content(summary_prompt)
        summary = response.text
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate summary: {e}")
    
    return SummaryResponse(
        summary=summary,
        num_chunks=len(notes)
    )


###############################################################################
# Health check
###############################################################################

@app.get("/health")
def health() -> Dict[str, str]:
    """Simple health check endpoint."""
    return {"status": "ok"}


###############################################################################
# Run the application
###############################################################################

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "study_buddy_backend:app",
        host="0.0.0.0",
        port=8001,
        reload=True
    )
