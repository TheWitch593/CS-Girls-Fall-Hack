# Backend-Frontend Connection Setup Guide

## Overview
This guide will help you connect the FastAPI backend to the React frontend for the Study Buddy application.

## Prerequisites
- Python 3.8+ installed
- Node.js 16+ installed
- A Google Gemini API key ([Get one here](https://makersuite.google.com/app/apikey))

## Setup Instructions

### 1. Backend Setup

#### Install Python Dependencies
```cmd
pip install -r requirements.txt
```

This will install:
- FastAPI
- Uvicorn (ASGI server)
- Google Generative AI
- Transformers (for emotion detection)
- Sentence Transformers (for embeddings)
- PDF and DOCX processing libraries
- Other dependencies

#### Configure Environment Variables
1. Copy the example environment file:
   ```cmd
   copy .env.example .env
   ```

2. Edit `.env` and add your Gemini API key:
   ```
   GEMINI_API_KEY=your_actual_api_key_here
   ```

#### Run the Backend
```cmd
python study_buddy_backend.py
```

The backend will start on `http://localhost:8000`

You should see:
- "Gemini client configured successfully!"
- Server running on http://0.0.0.0:8000

### 2. Frontend Setup

#### Install Node Dependencies
```cmd
npm install
```

#### Run the Frontend
In a new terminal:
```cmd
npm run dev:client
```

The frontend will start on `http://localhost:5173` (or another port if 5173 is taken)

### 3. Testing the Connection

1. Open your browser to the frontend URL (e.g., `http://localhost:5173`)
2. Type a message in the chat interface
3. The frontend will send the message to `http://localhost:8000/api/chat`
4. You should receive an AI-generated response with emotion detection

## Available API Endpoints

### Chat Endpoint
- **URL**: `POST /api/chat`
- **Purpose**: Send a chat message and get an AI response with emotion detection
- **Payload**:
  ```json
  {
    "user_id": 1,
    "session_id": "session-123",
    "message": "Help me with calculus",
    "personality_mode": "1",
    "use_notes": false
  }
  ```

### Notes Upload
- **URL**: `POST /api/notes/upload`
- **Purpose**: Upload PDF, DOCX, or text files for later retrieval
- **Content-Type**: `multipart/form-data`

### Ask About Notes
- **URL**: `POST /api/notes/ask`
- **Purpose**: Ask questions about uploaded notes
- **Payload**:
  ```json
  {
    "user_id": 1,
    "session_id": "session-123",
    "question": "What are the key concepts in chapter 3?",
    "personality_mode": "3"
  }
  ```

### Personality Modes
- **URL**: `GET /api/personality-modes`
- **Purpose**: Get available AI personality modes

### Health Check
- **URL**: `GET /health`
- **Purpose**: Verify the backend is running

## Personality Modes

1. **The Cheerleader** (mode "1"): Enthusiastic, motivating, uses emojis
2. **The Peer** (mode "2"): Casual, friendly, relatable
3. **The Mentor** (mode "3"): Wise, structured, uses Socratic method

## Emotion Detection

The backend automatically detects emotions in user messages:
- **joy**: Student is excited
- **sadness**: Student seems down
- **anger**: Student is frustrated
- **fear**: Student is anxious
- **love**: Student is appreciative
- **surprise**: Student is confused

The AI adjusts its tone and response based on the detected emotion.

## Troubleshooting

### Backend Issues

**Error: "GEMINI_API_KEY is not set"**
- Make sure you've created a `.env` file with your API key

**Port 8000 already in use**
- Change the port in `study_buddy_backend.py`:
  ```python
  uvicorn.run(app, host="0.0.0.0", port=8001, reload=True)
  ```

**Module not found errors**
- Run `pip install -r requirements.txt` again
- Ensure you're using the correct Python environment

### Frontend Issues

**API request fails / Network error**
- Verify the backend is running on http://localhost:8000
- Check the browser console for CORS errors
- The backend already has CORS enabled for all origins in development

**Connection refused**
- Make sure both frontend and backend are running
- Check that the API_BASE in `client/src/lib/queryClient.ts` matches your backend URL

### CORS Issues
The backend is configured with:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

For production, update `allow_origins` to your deployed frontend domain.

## Development Workflow

1. **Start Backend**: `python study_buddy_backend.py` (Terminal 1)
2. **Start Frontend**: `npm run dev:client` (Terminal 2)
3. **Make changes**: The backend auto-reloads with `reload=True`
4. **Test**: Use the chat interface or test endpoints with curl/Postman

## Example Test with curl

```cmd
curl -X POST http://localhost:8000/api/chat ^
  -H "Content-Type: application/json" ^
  -d "{\"user_id\": 1, \"session_id\": \"test\", \"message\": \"Hello!\", \"personality_mode\": \"1\"}"
```

Expected response:
```json
{
  "reply": "Hey there! 🎉 ...",
  "emotion": "joy",
  "session_id": "test"
}
```

## Next Steps

- Add user authentication
- Persist conversations to a database
- Deploy to production (Heroku, Railway, etc.)
- Add file upload functionality to the frontend UI
- Implement real-time typing indicators
- Add support for more file types
