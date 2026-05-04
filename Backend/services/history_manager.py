import json
import os
from datetime import datetime

HISTORY_FILE = "data/history.json"

def load_history():
    if not os.path.exists(HISTORY_FILE):
        return []

    try:
        with open(HISTORY_FILE, "r") as f:
            # Check if file is empty before loading
            content = f.read().strip()
            if not content:
                return []
            return json.loads(content)
    except json.JSONDecodeError:
        # If the file is corrupted or contains invalid JSON, start fresh
        print("Warning: history.json is corrupted or empty. Starting fresh.")
        return []


def save_history(prompt, responses, comparison=None):
    # Ensure the data directory exists
    os.makedirs(os.path.dirname(HISTORY_FILE), exist_ok=True)

    history = load_history()

    entry = {
        "id": len(history) + 1,
        "prompt": prompt,
        "responses": responses,
        "comparison": comparison,
        "timestamp": datetime.utcnow().isoformat()
    }

    history.append(entry)

    with open(HISTORY_FILE, "w") as f:
        json.dump(history, f, indent=2)


def get_history():
    return load_history()


def get_history_by_id(entry_id):
    history = load_history()
    for item in history:
        if item["id"] == entry_id:
            return item
    return None