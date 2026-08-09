"""
Launch Script: FastAPI Backend + Cloudflare & Localtunnel Helpers
Runs Uvicorn backend server on port 8000 and concurrently spins up public HTTPS tunnels.
"""

import sys
import os
import subprocess
import time
import threading
import urllib.request
import re
import json

def get_python_executable():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    venv_py = os.path.join(base_dir, "venv", "Scripts", "python.exe")
    if os.path.exists(venv_py):
        return venv_py
    dot_venv_py = os.path.join(base_dir, "..", ".venv", "Scripts", "python.exe")
    if os.path.exists(dot_venv_py):
        return dot_venv_py
    return sys.executable

def ensure_cloudflared():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    cf_path = os.path.join(base_dir, "cloudflared.exe")
    if not os.path.exists(cf_path):
        print("[Launcher] Downloading Cloudflare Tunnel binary (cloudflared.exe)...")
        try:
            url = "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe"
            urllib.request.urlretrieve(url, cf_path)
            print("[Launcher] Cloudflare Tunnel binary downloaded successfully.")
        except Exception as e:
            print(f"[Launcher Warning] Could not download cloudflared: {e}")
    return cf_path if os.path.exists(cf_path) else None

def get_public_ip():
    try:
        req = urllib.request.Request("https://api.ipify.org", headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=5) as response:
            return response.read().decode('utf-8').strip()
    except Exception:
        return "Unable to fetch IP"

def run_uvicorn():
    py_exec = get_python_executable()
    print(f"[1/3] Starting FastAPI Backend with {py_exec} on http://127.0.0.1:8000 ...")
    cmd = [py_exec, "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
    subprocess.run(cmd)

def run_cloudflare_tunnel():
    cf_bin = ensure_cloudflared()
    if not cf_bin:
        return
    print("\n==========================================================")
    print(" 🚀 [2/3] Launching Cloudflare Tunnel (High Reliability)")
    print("==========================================================\n")
    
    cmd = [cf_bin, "tunnel", "--url", "http://127.0.0.1:8000"]
    while True:
        try:
            p = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, bufsize=1)
            for line in p.stdout:
                if not line:
                    continue
                match = re.search(r"https://[a-zA-Z0-9-]+\.trycloudflare\.com", line)
                if match:
                    active_url = match.group(0)
                    print("\n==========================================================")
                    print(f" 🌟 CLOUDFLARE LIVE TUNNEL URL: {active_url}")
                    print("==========================================================\n")
                    
                    base_dir = os.path.dirname(os.path.abspath(__file__))
                    with open(os.path.join(base_dir, "tunnel_url.txt"), "w", encoding="utf-8") as f:
                        f.write(active_url)
                    
                    frontend_json = os.path.join(base_dir, "..", "frontend", "public", "tunnel_url.json")
                    os.makedirs(os.path.dirname(frontend_json), exist_ok=True)
                    with open(frontend_json, "w", encoding="utf-8") as f:
                        json.dump({"url": active_url}, f)
            p.wait()
            time.sleep(3)
        except Exception as e:
            print(f"[Cloudflare Tunnel] Error: {e}. Retrying in 5 seconds...")
            time.sleep(5)

def run_localtunnel():
    time.sleep(3)
    public_ip = get_public_ip()
    print("\n==========================================================")
    print(" 🚀 [3/3] Launching Localtunnel (subdomain: ai-system-backend)")
    print(f" 🌐 Target URL: https://ai-system-backend.loca.lt")
    print(f" 🔑 Localtunnel Tunnel Password (Public IP): {public_ip}")
    print("==========================================================\n")
    
    cmd = "npx -y localtunnel --port 8000 --local-host 127.0.0.1 --subdomain ai-system-backend"
    while True:
        try:
            p = subprocess.Popen(cmd, shell=True)
            p.wait()
            time.sleep(3)
        except Exception as e:
            time.sleep(5)

if __name__ == "__main__":
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    print("==========================================================")
    print(" Multi-Agent System Live Backend & Dual Tunnel Launcher")
    print("==========================================================")
    
    t1 = threading.Thread(target=run_uvicorn, daemon=True)
    t1.start()
    
    t2 = threading.Thread(target=run_cloudflare_tunnel, daemon=True)
    t2.start()
    
    run_localtunnel()
