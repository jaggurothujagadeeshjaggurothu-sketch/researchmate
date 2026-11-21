"""ResearchMate AI - FastAPI backend.

Run:  uvicorn main:app --reload --port 8000
"""
from __future__ import annotations

import logging
import os
import time
from typing import Any, Literal

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, field_validator

import ai_service
from ai_service import AIServiceError

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")

app = FastAPI(title="ResearchMate AI", version="1.0.0")

_env_origins = os.getenv("CORS_ORIGINS")
origins = (
    [o.strip() for o in _env_origins.split(",") if o.strip()]
    if _env_origins
    else ai_service.CONFIG.get("server", {}).get(
        "cors_origins", ["http://localhost:5173", "http://127.0.0.1:5173"]
    )
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Provider = Literal["ollama", "gemini"]
Level = Literal["Beginner", "Intermediate", "Advanced"]
Section = Literal["titles", "abstract", "keywords", "objectives", "future_enhancements"]


class ResearchRequest(BaseModel):
    idea: str = Field(..., max_length=1500)
    domain: str = Field("AI / Machine Learning", max_length=80)
    tech_preferences: str | None = Field(None, max_length=300)
    level: Level = "Intermediate"
    provider: Provider = "ollama"
    model: str | None = Field(None, max_length=80)

    @field_validator("idea")
    @classmethod
    def idea_is_meaningful(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 15 or len(v.split()) < 3:
            raise ValueError("Please describe your project idea in at least a short sentence.")
        return v

    @field_validator("domain")
    @classmethod
    def domain_not_blank(cls, v: str) -> str:
        return v.strip() or "Other"


class RegenerateRequest(ResearchRequest):
    section: Section
    current: dict[str, Any] = Field(default_factory=dict)


@app.exception_handler(AIServiceError)
async def ai_error_handler(_: Request, exc: AIServiceError):
    return JSONResponse(status_code=exc.status_code, content={"error": {"code": exc.code, "message": exc.message}})


@app.exception_handler(RequestValidationError)
async def validation_handler(_: Request, exc: RequestValidationError):
    first = exc.errors()[0] if exc.errors() else {}
    message = str(first.get("msg", "Invalid request")).removeprefix("Value error, ")
    return JSONResponse(status_code=422, content={"error": {"code": "validation", "message": message}})


@app.exception_handler(Exception)
async def unexpected_handler(_: Request, exc: Exception):
    logging.getLogger("researchmate").exception("Unhandled error")
    return JSONResponse(
        status_code=500,
        content={"error": {"code": "internal", "message": "Something went wrong on the server."}},
    )


@app.get("/api/health")
async def health(ollama_model: str | None = None):
    return {"status": "ok", **await ai_service.provider_status(ollama_model)}


@app.post("/api/generate")
async def generate(req: ResearchRequest):
    started = time.perf_counter()
    data, warnings, model = await ai_service.generate_research(
        req.idea, req.domain, req.tech_preferences, req.level, req.provider, req.model
    )
    return {
        "data": data,
        "meta": {
            "provider": req.provider,
            "model": model,
            "warnings": warnings,
            "elapsed_ms": int((time.perf_counter() - started) * 1000),
        },
    }


@app.post("/api/regenerate")
async def regenerate(req: RegenerateRequest):
    started = time.perf_counter()
    data, warnings, model = await ai_service.regenerate_section(
        req.idea, req.domain, req.tech_preferences, req.level, req.section, req.current, req.provider, req.model
    )
    return {
        "data": data,
        "meta": {
            "provider": req.provider,
            "model": model,
            "warnings": warnings,
            "elapsed_ms": int((time.perf_counter() - started) * 1000),
        },
    }
