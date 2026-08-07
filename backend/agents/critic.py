from llm_factory import get_llm

def critique(report: str):
    prompt = f"""
    Review this analysis.
    Improve clarity.
    Fix inconsistencies.
    Reduce hallucination risk.

    {report}
    """
    provider_name, llm = get_llm()
    if llm is not None:
        try:
            res = llm.invoke(prompt)
            return res.content if hasattr(res, 'content') else str(res)
        except Exception as e:
            print(f"[Critic Warning] LLM {provider_name} invocation failed: {e}.")

    return report