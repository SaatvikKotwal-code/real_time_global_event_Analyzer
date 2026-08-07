from llm_factory import get_llm, smart_synthesize_analyst

def analyze(data: str):
    prompt = f"""
    Analyze the following information.
    Extract key insights, risks, and trends.

    {data}
    """
    provider_name, llm = get_llm()
    if llm is not None:
        try:
            res = llm.invoke(prompt)
            return res.content if hasattr(res, 'content') else str(res)
        except Exception as e:
            print(f"[Analyst Warning] LLM {provider_name} invocation failed: {e}. Switching to dynamic synthesizer.")

    return smart_synthesize_analyst(data)