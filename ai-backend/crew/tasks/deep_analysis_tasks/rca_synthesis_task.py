from crewai import Task
from typing import List, Dict, Any
import json


def build_rca_synthesis_task(
    prompt: str,
    agent,
    top_chunks: List[Dict[str, Any]],
) -> Task:
    chunks_block = json.dumps(top_chunks, ensure_ascii=False, indent=2)

    description = f"""
        You are given:
        - The user's prompt
        - The Top 5 Milvus chunks ranked by score (each with text, url, page_number, metadata)

        Task:
        - Produce a list of Root Cause Analysis (RCA) considering all evidence in industrial language.
        - Combine and deduplicate all URLs and page_numbers from the chunks into arrays.
        - Respond STRICTLY as JSON with the following structure (no extra text):
        {{
        "causes": [{{"title": "...", "description": "..."}}],
        "sources": {{
            "urls": ["..."],
            "page_numbers": [1, 2, 3]
        }}
        }}

        Constraints:
        - The response MUST be valid JSON. No prose outside the JSON object.
        - If evidence conflicts, state assumptions briefly in the summary.

        User Prompt:
        {prompt}

        Top 5 Chunks:
        {chunks_block}
    """

    return Task(
        description=description,
        agent=agent,
        expected_output=(
            "Strict JSON object with keys rca.summary, rca.causes[], sources.urls[], sources.page_numbers[]"
        ),
    ) 