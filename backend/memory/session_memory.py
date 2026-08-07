session_store = {}

def save_session(session_id: str, content: str):
    if session_id not in session_store:
        session_store[session_id] = []
    session_store[session_id].append(content)

def get_session(session_id: str):
    return session_store.get(session_id, [])