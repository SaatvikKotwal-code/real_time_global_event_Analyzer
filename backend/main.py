import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv
load_dotenv(override=True)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import router
from memory.scheduler import scheduler

app = FastAPI(title="Autonomous Multi-Agent Intelligence System")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

@app.on_event("startup")
def on_startup():
    print("[Main] Initializing automated daily intelligence background scheduler...")
    scheduler.start()

@app.get("/")
def root():
    return {"status": "System Running 🚀"}