from datetime import datetime, timezone

import json
import os

import subprocess

import requests

OUT_DIR = os.getenv("SNAPSHOT_DIR", "./snapshots")

URLS = ["https://varitywire.com", "https://varitywire.com"]


os.makedirs(OUT_DIR, exist_ok=True)
state_path, log_path = os.path.join(OUT_DIR, "last_state.json"), os.path.join(OUT_DIR, "history.log")

bash_cmd = "uptime -p 2>/dev/null || uptime; ss -tln 2>/dev/null | awk 'NR>1 {print $4}' | tr '\\n' ','"


proc = subprocess.run(["bash", "-c", bash_cmd], capture_output=True, text=True, timeout=5)


local_info = proc.stdout.strip() or proc.stderr.strip()


results = {}



for url in URLS:

    try:
        r = requests.get(url, timeout=5)
        results[url] = {"status": r.status_code, "ms": round(r.elapsed.total_seconds() * 1000, 1)}


    except requests.RequestException as exc:
        results[url] = {"status": "ERR", "error": str(exc)[:80]}

snapshot = {"ts": datetime.now(timezone.utc).isoformat(), "local": local_info, "endpoints": results}



prev = json.load(open(state_path, "r", encoding="utf-8")) if os.path.exists(state_path) else {}
changed = prev.get("endpoints") != snapshot["endpoints"] or prev.get("local") != snapshot["local"]

with open(log_path, "a", encoding="utf-8") as f:



    f.write(f"[{snapshot['ts']}] changed={changed} local={local_info!r} endpoints={json.dumps(results)}\n")


with open(state_path, "w", encoding="utf-8") as f:


    json.dump(snapshot, f, indent=2)

print(f"Saved snapshot (changed={changed}) -> {log_path}")
