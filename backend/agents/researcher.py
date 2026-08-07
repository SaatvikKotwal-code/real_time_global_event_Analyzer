from tools.web_search import web_search
from tools.news_api import get_news
from tools.rag_tool import rag_search

def research(query: str):
    web_data = web_search(query)
    news_data = get_news(query)
    rag_data = rag_search(query)

    combined = f"""Web Data:
{web_data}

News Data:
{news_data}

Memory Data:
{rag_data}"""

    return combined