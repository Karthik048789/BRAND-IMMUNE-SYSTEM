import sys
import os
import uvicorn

# Ensure workspace root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

if __name__ == "__main__":
    print("=" * 60)
    print("  BRAND IMMUNE SYSTEM - FastAPI Backend Server")
    print("  Listening on: http://127.0.0.1:8000")
    print("  Interactive API Docs: http://127.0.0.1:8000/docs")
    print("=" * 60)
    uvicorn.run("backend.app.main:app", host="127.0.0.1", port=8000, reload=False)
