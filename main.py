import os
import uvicorn
from app.main import app
from app.core.config import settings

if __name__ == "__main__":
    port = int(os.environ.get("PORT", settings.PORT))
    host = os.environ.get("HOST", settings.HOST)
    uvicorn.run("main:app", host=host, port=port, reload=False)
