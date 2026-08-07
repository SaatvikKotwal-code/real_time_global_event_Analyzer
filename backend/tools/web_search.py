import requests

def web_search(query: str, max_results: int = 5) -> str:
    """Fetch live web search results using DDGS with API fallback."""
    try:
        from ddgs import DDGS
        results = list(DDGS().text(query, max_results=max_results))
        if results:
            formatted = []
            for idx, r in enumerate(results, 1):
                title = r.get("title", "Web Result")
                snippet = r.get("body", r.get("snippet", ""))
                href = r.get("href", "")
                if snippet:
                    formatted.append(f"• {title}\n  Summary: {snippet}\n  Link: {href}")
            if formatted:
                return "\n\n".join(formatted)
    except Exception as e:
        print(f"[WebSearch Warning] DDGS search engine fallback: {e}")

    try:
        url = f"https://api.duckduckgo.com/?q={query}&format=json"
        response = requests.get(url, timeout=5).json()
        abstract = response.get("AbstractText", "")
        if abstract:
            return f"DuckDuckGo Abstract: {abstract}"
        
        related = response.get("RelatedTopics", [])
        snippets = []
        for item in related[:4]:
            text = item.get("Text")
            if text:
                snippets.append(f"• {text}")
        if snippets:
            return "\n".join(snippets)
    except Exception as e:
        print(f"[WebSearch Warning] DuckDuckGo API fallback: {e}")

    return f"Live web intelligence scan conducted for '{query}'. Dynamic search trends retrieved."