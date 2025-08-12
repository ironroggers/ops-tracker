from services.deep_analysis_service import get_deep_analysis_service


async def get_deep_analysis(prompt: str, db):
    return await get_deep_analysis_service(prompt, db) 