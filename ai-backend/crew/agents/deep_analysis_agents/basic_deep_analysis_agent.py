import os
from crewai import Agent
from langchain_openai import ChatOpenAI


def build_deep_analysis_agent() -> Agent:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError(
            "OPENAI_API_KEY is not set. Please set it to enable the Deep Analysis Agent."
        )

    llm = ChatOpenAI(model="gpt-4o", api_key=api_key, temperature=0.7)

    return Agent(
        role="Deep Analysis Agent",
        goal="Analyze the user's prompt and produce concise, RCA analysis.",
        backstory=(
            """You are an expert analyst skilled at breaking down complex prompts 
            into high-signal RCA analysis."""
        ),
        llm=llm,
        verbose=True,
    ) 