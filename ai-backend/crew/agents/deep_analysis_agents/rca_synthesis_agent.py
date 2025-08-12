import os
from crewai import Agent
from langchain_groq import ChatGroq


def build_rca_synthesis_agent() -> Agent:
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise RuntimeError(
            "GROQ_API_KEY is not set. Please set it to enable the RCA Synthesis Agent."
        )

    llm = ChatGroq(model="groq/meta-llama/llama-4-maverick-17b-128e-instruct", api_key=api_key)

    return Agent(
        role="RCA Synthesis Agent",
        goal="Synthesize a Root Cause Analysis using provided chunks and context, and produce a strict JSON response.",
        backstory=(
            "You combine multiple evidence sources into a unified, executive-ready RCA."
        ),
        llm=llm,
        verbose=True,
    ) 