import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import asyncio
import threading
import time
from datetime import datetime
from memory.vector_store import store_documents, store_risk_indicator
from agents.planner import plan
from agents.researcher import research
from agents.analyst import analyze
from agents.critic import critique
from agents.reporter import generate_report

DEFAULT_SECTORS = [
    {"name": "AI Technology & LLMs", "query": "Automated Agentic Workflows & LLM Infrastructure Trends"},
    {"name": "Cybersecurity & Zero Trust", "query": "Zero Trust Security Posture for Autonomous AI Systems"},
    {"name": "Autonomous Systems & Robotics", "query": "Autonomous Robotics Security & Deployment Risk Factors"},
    {"name": "Semiconductor Supply Chains", "query": "Global Semiconductor Market & Chip Manufacturing Risks"}
]

class IntelligenceScheduler:
    def __init__(self):
        self.is_running = False
        self.last_scan_time = None
        self.scan_count = 0
        self.logs = []
        self.thread = None

    def log(self, message: str):
        timestamp = datetime.now().strftime("%H:%M:%S")
        entry = f"[{timestamp}] {message}"
        print(f"[Scheduler] {entry}")
        self.logs.append(entry)
        if len(self.logs) > 50:
            self.logs = self.logs[-50:]

    def run_sector_scan(self, sector_info: dict) -> str:
        sector_name = sector_info["name"]
        query = sector_info["query"]
        self.log(f"Scanning sector: {sector_name} ('{query}')")

        try:
            planning = plan(query)
            research_data = research(query)
            analysis = analyze(research_data)
            improved = critique(analysis)
            report = generate_report(improved)

            # Save report to persistent vector memory
            store_documents([report], metadata={"sector": sector_name, "category": "Automated Daily Intelligence Scan"})

            # Register risk indicators if found in report
            if "Security" in report or "vulnerabilities" in report.lower():
                store_risk_indicator(sector_name, "Security Posture Vulnerability", "High", f"Detected threat vectors in {sector_name} during automated scan.")
            if "quota" in report.lower() or "fallback" in report.lower():
                store_risk_indicator(sector_name, "Quota / API Boundary Limit", "Medium", f"LLM generation quota boundary flagged during {sector_name} scan.")

            self.log(f"Sector scan completed successfully: {sector_name}")
            return report
        except Exception as e:
            self.log(f"Error during scan of {sector_name}: {e}")
            return f"Scan error for {sector_name}: {e}"

    def run_all_scans(self):
        self.log("Starting automated daily intelligence scan across all monitored sectors...")
        start_time = time.time()
        
        for sector in DEFAULT_SECTORS:
            self.run_sector_scan(sector)

        duration = round(time.time() - start_time, 2)
        self.scan_count += 1
        self.last_scan_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        self.log(f"Daily intelligence scan batch completed in {duration}s. Total batches run: {self.scan_count}")

    def _loop(self):
        self.log("Scheduler loop initialized. Running initial scan batch...")
        self.run_all_scans()

        # Run periodically (every 24 hours = 86400 seconds)
        while self.is_running:
            time.sleep(86400)
            if self.is_running:
                self.run_all_scans()

    def start(self):
        if self.is_running:
            return
        self.is_running = True
        self.thread = threading.Thread(target=self._loop, daemon=True)
        self.thread.start()

    def get_status(self):
        return {
            "running": self.is_running,
            "last_scan": self.last_scan_time or "Never",
            "total_scans": self.scan_count,
            "logs": self.logs[-10:],
            "monitored_sectors": [s["name"] for s in DEFAULT_SECTORS]
        }

# Global singleton scheduler instance
scheduler = IntelligenceScheduler()
