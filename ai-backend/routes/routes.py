from fastapi import APIRouter, Request
from pydantic import BaseModel
from controllers.deep_analysis_controller import get_deep_analysis

router = APIRouter()


class DeepAnalysisRequest(BaseModel):
    prompt: str


@router.post("/deep-analysis")
async def deep_analysis(payload: DeepAnalysisRequest, req: Request):
    return await get_deep_analysis(payload.prompt, getattr(req.app.state, "db", None)) 