# Poll App

This is a Poll App project built with React.js (frontend) and FastAPI (backend) with WebSocket support.

## Setup Instructions

### Frontend
cd frontend
npm install       # Install frontend dependencies
npm run dev       # Start frontend dev server
#### Update WebSocket URL in frontend code (page.js)
const socket = new WebSocket("ws://127.0.0.1:8000/ws");

### Backend
cd backend
python -m venv .venv          # Create virtual environment
#### Activate virtual environment
#### Windows:
.venv\Scripts\activate
#### Linux/macOS:
source .venv/bin/activate
pip install -r requirements.txt   # Install backend dependencies
uvicorn main:app --reload         # Run backend server

#### Note
Make sure the backend is running before starting the frontend to enable real-time WebSocket communication.
