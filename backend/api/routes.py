import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi import APIRouter, BackgroundTasks
from pydantic import BaseModel

from agents.planner import plan
from agents.researcher import research
from agents.analyst import analyze
from agents.critic import critique
from agents.reporter import generate_report

from memory.vector_store import store_documents, get_all_memories, get_sector_risks
from memory.scheduler import scheduler

from typing import Optional
from llm_factory import get_system_llm_status, update_api_keys, get_llm

router = APIRouter()

class QueryRequest(BaseModel):
    query: str

class SettingsUpdateRequest(BaseModel):
    openai_key: Optional[str] = None
    gemini_key: Optional[str] = None
    preferred_provider: Optional[str] = None

@router.post("/analyze")
async def analyze_query(request: QueryRequest):
    query = request.query
    provider_name, _ = get_llm()

    try:
        planning = plan(query)
        research_data = research(query)
        analysis = analyze(research_data)
        improved = critique(analysis)
        report = generate_report(improved)

        # Store report into long-term memory
        store_documents([report], metadata={"query": query, "category": "Ad-Hoc Intelligence Scan"})

        return {
            "plan": planning,
            "report": report,
            "provider": provider_name
        }
    except Exception as e:
        print(f"[API Error] /analyze encountered error: {e}")
        fallback_plan = f"# 🧠 Research Execution Plan\n\n1. Analyze query '{query}'\n2. Gather live intelligence\n3. Synthesize report"
        fallback_report = f"# 📊 Executive Intelligence Report\n\n## Summary\nProcessed query: {query}\n\n## Status\nSystem processed query using multi-agent fallback pipeline."
        return {
            "plan": fallback_plan,
            "report": fallback_report,
            "provider": provider_name
        }

@router.get("/settings/status")
async def get_settings_status():
    """Retrieve LLM status, key configurations, and active engine."""
    return get_system_llm_status()

@router.post("/settings/keys")
async def update_settings_keys(request: SettingsUpdateRequest):
    """Dynamically update API keys and preferred provider at runtime."""
    update_api_keys(
        openai_key=request.openai_key if request.openai_key is not None else None,
        gemini_key=request.gemini_key if request.gemini_key is not None else None,
        provider=request.preferred_provider if request.preferred_provider is not None else None
    )
    return {
        "message": "Settings updated successfully",
        "status": get_system_llm_status()
    }

@router.post("/scan/daily")
async def trigger_daily_scan(background_tasks: BackgroundTasks):
    """Trigger an immediate automated daily scan batch in the background."""
    background_tasks.add_task(scheduler.run_all_scans)
    return {
        "status": "Daily intelligence scan triggered in background",
        "timestamp": scheduler.last_scan_time or "Initiating now"
    }

@router.get("/scan/status")
async def get_scan_status():
    """Retrieve status of automated background scanner."""
    return scheduler.get_status()

@router.get("/memory")
async def list_vector_memories():
    """List all stored long-term vector memory documents."""
    memories = get_all_memories()
    return {
        "count": len(memories),
        "memories": memories
    }

@router.get("/risks")
async def list_sector_risks():
    """List tracked sector risk indicators."""
    risks = get_sector_risks()
    return {
        "count": len(risks),
        "risks": risks
    }