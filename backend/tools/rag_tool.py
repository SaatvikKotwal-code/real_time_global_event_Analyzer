from memory.vector_store import retrieve

def rag_search(query: str):
    return retrieve(query)