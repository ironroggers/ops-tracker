from crewai import Task
from typing import Dict, Any
import json


def build_deep_analysis_task(prompt: str, agent, data_map: Dict[str, Any]) -> Task:
    sections = []
    for name, content in sorted(data_map.items()):
        pretty = json.dumps(content, ensure_ascii=False, indent=2)
        sections.append(f"- {name} (JSON/JSONs)\n{pretty}")
    json_block = "\n\n".join(sections) if sections else "<no data found>"

    description = (
        f"""
        You are an expert analyst. Use the provided JSON as the sole source of truth.  

        If the JSON lacks sufficient information to answer confidently, return:
        {{"causes": []}}

        Data:
        {json_block}

        User Query:
        {prompt}

        Rules:
        1. So the flow is like this:
            - First the user will raise issue on an Asset.
            - That issue will be converted to a work order.
            - A Permit will be created for the work order (before issuing permit workorder cannot be executed so here the planned vs actual time is also crucial).
            - The Workorder will have operations(small tasks to perform).
            - The Operations will have components(small equipments to perform the operation).
        2. Derive the Root Cause Analysis (RCA) in a formal, industry-oriented tone.
        3. Do not take names of users or assets or operations or components or work orders or permits or issues or anything else.

        Output:
        Return ONLY a single JSON object in the format below (no extra text).  
        Percentages must always be positive numbers.

        Example (for reference only — do not copy text):
        {{
            "causes": [
                {{
                    "title": "The assigned workforce has limited capacity",
                    "description": "The current manpower allocated to the work order falls short of the planned staffing requirements, potentially impacting schedule and productivity",
                    "trends": 
                        {{ 
                            "actual_value": 3,
                            "planned_value": 5,
                            "impact": "positive",
                            "percentage_change": 40,
                        }},
                }},
                {{
                    "title": "The work order is experiencing delays",
                    "description": "The actual duration of the operation is surpassing the planned schedule, indicating potential inefficiencies or unforeseen challenges",
                    "trends": 
                        {{
                            "actual_value": 3,
                            "planned_value": 5,
                            "impact": "positive",
                            "percentage_change": 40,
                        }}
                }}
            ]
        }}
        """
    )

    return Task(
        description=description,
        agent=agent,
        expected_output=(
            "Json object in the format mentioned above. Stricly JSON with no other text(not even a single word)."
        ),
    ) 