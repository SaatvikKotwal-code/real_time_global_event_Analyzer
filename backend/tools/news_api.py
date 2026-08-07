import requests
import os

NEWS_API_KEY = os.getenv("NEWS_API_KEY")

def get_news(query: str):
    if not NEWS_API_KEY:
        return "News API key not configured."

    url = f"https://newsapi.org/v2/everything?q={query}&apiKey={NEWS_API_KEY}"
    response = requests.get(url).json()

    articles = response.get("articles", [])[:5]

    combined = ""
    for article in articles:
        combined += f"{article['title']}\n{article['description']}\n\n"

    return combined if combined else "No news found."