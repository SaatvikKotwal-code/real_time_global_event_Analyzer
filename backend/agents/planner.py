from llm_factory import get_llm, smart_synthesize_planner

def plan(query: str):
    prompt = f"""
    Break this user query into structured research steps:
    {query}
    """
    provider_name, llm = get_llm()
    if llm is not None:
        try:
            res = llm.invoke(prompt)
            return res.content if hasattr(res, 'content') else str(res)
        except Exception as e:
            print(f"[Planner Warning] LLM {provider_name} invocation failed: {e}. Switching to dynamic synthesizer.")

    return smart_synthesize_planner(query)