import json
from typing import Any, Tuple, List
import asyncio
import os
from crewai import Crew, Process
from crew.agents.deep_analysis_agents.basic_deep_analysis_agent import (
    build_deep_analysis_agent,
)
from crew.tasks.deep_analysis_tasks.basic_deep_analysis_task import (
    build_deep_analysis_task,
)
from services.data_loader_service import load_all_json_from_data
from services.milvus_service import get_links_for_asset_ids, process_documents_parallel
from crew.agents.deep_analysis_agents.rca_synthesis_agent import build_rca_synthesis_agent
from crew.tasks.deep_analysis_tasks.rca_synthesis_task import build_rca_synthesis_task


def _extract_json_from_text(text: str) -> Tuple[Any, str]:
    if text is None:
        raise ValueError("No text to parse")

    cleaned = text.strip()

    if cleaned.startswith("```"):
        cleaned = cleaned.split("\n", 1)[1] if "\n" in cleaned else cleaned
    if cleaned.endswith("```"):
        cleaned = cleaned.rsplit("\n", 1)[0]

    start = cleaned.find("{")
    end = cleaned.rfind("}")
    if start == -1 or end == -1 or start > end:
        raise ValueError("No JSON object found in text")
    json_str = cleaned[start : end + 1]

    parsed = json.loads(json_str)
    return parsed, json_str


def _extract_asset_ids(data_map: dict) -> List[str]:
    asset_data = data_map.get("Asset")
    if not asset_data:
        return []
    records = asset_data if isinstance(asset_data, list) else [asset_data]
    ids: List[str] = []
    for rec in records:
        _id = rec.get("_id") or rec.get("id") or rec.get("assetId")
        if _id:
            ids.append(str(_id))
    return ids


async def get_deep_analysis_service(prompt: str, db) -> dict:
    try:
        data_map = load_all_json_from_data()
        asset_ids = []
        asset_data = data_map.get("Asset")
        if asset_data:
            records = asset_data if isinstance(asset_data, list) else [asset_data]
            for rec in records:
                _id = rec.get("_id") or rec.get("id") or rec.get("assetId")
                if _id:
                    asset_ids.append(str(_id))

        # Build both crews independently
        analysis_agent = build_deep_analysis_agent()
        analysis_task = build_deep_analysis_task(prompt, analysis_agent, data_map)
        analysis_crew = Crew(agents=[analysis_agent], tasks=[analysis_task], process=Process.sequential, verbose=True)

        # Prepare RCA synthesis inputs (chunks + links), then run RCA crew independently
        async def prepare_chunks_and_links():
            if db is None or not asset_ids:
                return [], {}
            links_map = await get_links_for_asset_ids(db, asset_ids)
            unique_doc_ids = sorted({doc_id for ids in links_map.values() for doc_id in ids}) if links_map else []
            try:
                from main import app
                milvus_alias = getattr(app.state, "milvus_alias", None)
            except Exception:
                milvus_alias = None

            if not unique_doc_ids or not milvus_alias:
                return [], links_map

            chunks, _, _, _ = await process_documents_parallel(unique_doc_ids, milvus_alias, prompt)
            top_chunks = sorted(chunks, key=lambda x: (x.get("score") or 0), reverse=True)[:5]
            return top_chunks, links_map

        # Run both crews in parallel
        async def run_analysis():
            # If there is no data, return empty structure
            if not data_map:
                return {"causes": []}
            result = await asyncio.to_thread(analysis_crew.kickoff)
            raw_text = str(getattr(result, "raw", result))
            try:
                parsed, _ = _extract_json_from_text(raw_text)
                return parsed
            except Exception:
                return {"causes": []}

        async def run_rca():
            top_chunks, links_map = await prepare_chunks_and_links()
            # If no chunks available, return an empty RCA structure
            if not top_chunks:
                return {"causes": [] , "sources": {"urls": [], "page_numbers": []}}
            rca_agent = build_rca_synthesis_agent()
            rca_task = build_rca_synthesis_task(
                prompt=prompt,
                agent=rca_agent,
                top_chunks=top_chunks,
            )
            rca_crew = Crew(agents=[rca_agent], tasks=[rca_task], process=Process.sequential, verbose=True)
            result = await asyncio.to_thread(rca_crew.kickoff)
            raw_text = str(getattr(result, "raw", result))
            try:
                parsed, _ = _extract_json_from_text(raw_text)
                return parsed
            except Exception:
                return {"causes": [], "sources": {"urls": [], "page_numbers": []}}

        analysis_result, rca_result = await asyncio.gather(run_analysis(), run_rca())
        return {"result": {"data_rca": analysis_result, "pdf_rca": rca_result}}
    except Exception as exc:
        return {"error": str(exc)} 