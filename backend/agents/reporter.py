from llm_factory import get_llm, smart_synthesize_reporter

def generate_report(content: str):
    prompt = f"""
    Generate a structured Intelligence Report:

    - Executive Summary
    - Key Findings
    - Risk Assessment
    - Strategic Recommendations

    {content}
    """
    provider_name, llm = get_llm()
    if llm is not None:
        try:
            res = llm.invoke(prompt)
            return res.content if hasattr(res, 'content') else str(res)
        except Exception as e:
            print(f"[Reporter Warning] LLM {provider_name} invocation failed: {e}. Switching to dynamic synthesizer.")

    return smart_synthesize_reporter(content)