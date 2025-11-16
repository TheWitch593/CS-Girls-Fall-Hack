# Study Buddy Setup Guide

## Prerequisites

1. **Python 3.8+** installed
2. **Node.js 18+** installed
3. **Google Gemini API Key** - Get one from [Google AI Studio](https://makersuite.google.com/app/apikey)

## Quick Start

### 1. Install Dependencies

#### Backend (Python)
```powershell
pip install -r requirements.txt
```

#### Frontend (Node.js)
```powershell
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

**Important:** Replace `your_actual_gemini_api_key_here` with your actual Google Gemini API key.

### 3. Start the Backend

Open a terminal and run:

```powershell
python study_buddy_backend.py
```

The backend will start on `http://localhost:8001`

You should see:
- "Gemini client configured successfully!"
- "Application startup complete"
- Server running on http://0.0.0.0:8001

### 4. Start the Frontend

Open a **new** terminal and run:

```powershell
npm run dev:client
```

The frontend will start on `http://localhost:5173` (or another port if 5173 is taken)

### 5. Use the Application

1. Open your browser to `http://localhost:5173`
2. Upload study notes (PDF, DOCX, or TXT) using the upload button
3. Ask questions about your notes or chat with the AI
4. The AI will use your uploaded notes to provide context-aware answers

## Features

### File Upload
- Click the upload button (📤) in the chat input
- Supported formats: PDF, DOCX, DOC, TXT
- Files are processed and stored as embeddings
- You can upload multiple files

### AI Chat
- Ask questions about your uploaded notes
- The AI will automatically use your notes when answering
- Choose from different study modes (Active Learning, Break Mode, Focused, Review)
- Select from multiple languages

### Document Summarization
- After uploading notes, you can ask for a summary
- The AI will generate a comprehensive summary of your documents

## API Endpoints

### Chat
- **POST** `/api/chat` - Send a chat message and get AI response

### Notes
- **POST** `/api/notes/upload` - Upload study notes (PDF, DOCX, TXT)
- **POST** `/api/notes/ask` - Ask questions about uploaded notes
- **POST** `/api/notes/summary` - Get a summary of all uploaded notes

### Other
- **GET** `/api/personality-modes` - Get available AI personality modes
- **GET** `/health` - Health check endpoint

## Troubleshooting

### Backend Issues

**Error: "GEMINI_API_KEY is not set"**
- Make sure you've created a `.env` file with your API key
- Check that the `.env` file is in the root directory

**Port 8001 already in use**
- Change the port in `study_buddy_backend.py` (line 609):
  ```python
  uvicorn.run(app, host="0.0.0.0", port=8002, reload=True)
  ```
- Update `client/src/lib/queryClient.ts` to match the new port

**Module not found errors**
- Run `pip install -r requirements.txt` again
- Ensure you're using the correct Python environment

### Frontend Issues

**API request fails / Network error**
- Verify the backend is running on http://localhost:8001
- Check the browser console for CORS errors
- The backend has CORS enabled for all origins in development

**Connection refused**
- Make sure both frontend and backend are running
- Check that the API_BASE in `client/src/lib/queryClient.ts` matches your backend URL

### File Upload Issues

**File upload fails**
- Check that the file is not too large
- Ensure the file format is supported (PDF, DOCX, DOC, TXT)
- Check backend logs for error messages

## Development

### Running Both Services

You can run both backend and frontend together using:

```powershell
# Terminal 1: Backend
python study_buddy_backend.py

# Terminal 2: Frontend
npm run dev:client
```

### Testing the Backend

Test the health endpoint:
```powershell
curl http://localhost:8001/health
```

Test chat endpoint:
```powershell
curl -X POST http://localhost:8001/api/chat `
  -H "Content-Type: application/json" `
  -d '{\"user_id\": 1, \"session_id\": \"test\", \"message\": \"Hello!\", \"personality_mode\": \"1\"}'
```

## Notes

- The backend stores notes and conversations in memory (not persisted to disk)
- For production, you should use a database and vector store
- The backend auto-reloads when code changes (development mode)
- CORS is enabled for all origins in development (restrict in production)

