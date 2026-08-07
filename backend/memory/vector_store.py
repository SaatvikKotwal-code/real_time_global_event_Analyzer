import os
import json
import math
import re
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

DB_FILE = os.path.join(os.path.dirname(__file__), "vector_memory.json")

def _load_db() -> dict:
    if os.path.exists(DB_FILE):
        try:
            with open(DB_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            print(f"[VectorStore Warning] Could not load DB: {e}")
    return {"documents": [], "risks": []}

def _save_db(db_data: dict):
    try:
        with open(DB_FILE, "w", encoding="utf-8") as f:
            json.dump(db_data, f, indent=2, ensure_ascii=False)
    except Exception as e:
        print(f"[VectorStore Warning] Could not save DB: {e}")

def _tokenize(text: str) -> set:
    words = re.findall(r'\w+', text.lower())
    return set(words)

def _jaccard_similarity(query_tokens: set, doc_tokens: set) -> float:
    if not query_tokens or not doc_tokens:
        return 0.0
    intersection = len(query_tokens.intersection(doc_tokens))
    union = len(query_tokens.union(doc_tokens))
    return intersection / union if union > 0 else 0.0

def store_documents(docs: list, metadata: dict = None):
    """Store documents persistently into memory with timestamp and metadata."""
    db = _load_db()
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    meta = metadata or {}
    
    for doc in docs:
        if not doc or not str(doc).strip():
            continue
        # Avoid exact duplicate content
        existing_contents = [d.get("content") for d in db["documents"]]
        if str(doc) in existing_contents:
            continue

        entry = {
            "id": len(db["documents"]) + 1,
            "content": str(doc),
            "timestamp": now_str,
            "category": meta.get("category", "General Intelligence"),
            "sector": meta.get("sector", "Technology"),
            "source": meta.get("source", "Multi-Agent Pipeline")
        }
        db["documents"].append(entry)
        
    _save_db(db)

def retrieve(query: str, top_k: int = 3) -> str:
    """Retrieve top-k relevant documents from long-term persistent memory."""
    db = _load_db()
    docs = db.get("documents", [])
    if not docs:
        return "No prior memory found."

    query_tokens = _tokenize(query)
    scored_docs = []

    for doc_entry in docs:
        content = doc_entry.get("content", "")
        doc_tokens = _tokenize(content)
        sim = _jaccard_similarity(query_tokens, doc_tokens)
        
        # Boost if exact substring matches
        if query.lower() in content.lower():
            sim += 0.5
            
        scored_docs.append((sim, doc_entry))

    scored_docs.sort(key=lambda x: x[0], reverse=True)
    
    # Filter non-zero scores or fallback to most recent
    relevant = [entry["content"] for sim, entry in scored_docs if sim > 0.05]
    if not relevant:
        # Return recent 2 documents as contextual fallback
        relevant = [entry["content"] for entry in docs[-2:]]
        
    return "\n---\n".join(relevant[:top_k])

def store_risk_indicator(sector: str, risk_type: str, severity: str, description: str):
    """Store explicit sector risk indicator."""
    db = _load_db()
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M")
    
    risk_entry = {
        "sector": sector,
        "risk_type": risk_type,
        "severity": severity,
        "description": description,
        "timestamp": now_str
    }
    
    # Prevent duplicate active risks
    existing = [r for r in db["risks"] if r.get("sector") == sector and r.get("description") == description]
    if not existing:
        db["risks"].append(risk_entry)
        _save_db(db)

def get_sector_risks() -> list:
    """Get tracked high-priority sector risk indicators."""
    db = _load_db()
    risks = db.get("risks", [])
    if not risks:
        # Default baseline sector risk indicators
        default_risks = [
            {
                "sector": "AI Technology & LLMs",
                "risk_type": "Quota Limits & Fallback Mode",
                "severity": "Medium",
                "description": "API rate limits triggering dynamic fallback mode across agent endpoints.",
                "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M")
            },
            {
                "sector": "Cybersecurity & Autonomous Robotics",
                "risk_type": "Security Posture Vulnerabilities",
                "severity": "High",
                "description": "Rapid autonomous agent deployment outpacing zero-trust verification frameworks.",
                "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M")
            },
            {
                "sector": "Global Enterprise Systems",
                "risk_type": "Integration Risk",
                "severity": "Medium",
                "description": "Fast-paced market adoption requires continuous vector memory monitoring.",
                "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M")
            }
        ]
        db["risks"] = default_risks
        _save_db(db)
        return default_risks
    return risks

def get_all_memories() -> list:
    """Get all documents in long-term memory."""
    db = _load_db()
    return db.get("documents", [])