import subprocess
import time
import re
import urllib.request

cmd = ["cloudflared.exe", "tunnel", "--url", "http://127.0.0.1:8000"]
p = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, bufsize=1)

url = None
start = time.time()
while time.time() - start < 15:
    line = p.stdout.readline()
    if not line:
        continue
    print(line.strip())
    match = re.search(r"https://[a-zA-Z0-9-]+\.trycloudflare\.com", line)
    if match:
        url = match.group(0)
        print(f"\n✨ FOUND CLOUDFLARE TUNNEL URL: {url}\n")
        break

if url:
    print(f"Testing URL: {url}/ ...")
    try:
        req = urllib.request.Request(f"{url}/")
        res = urllib.request.urlopen(req, timeout=5)
        print(f"Status: {res.status}, Body: {res.read().decode('utf-8')}")
    except Exception as e:
        print(f"Request error: {e}")

p.terminate()
