from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.routes import router as routes

import os
from contextlib import asynccontextmanager
import motor.motor_asyncio


@asynccontextmanager
async def lifespan(app: FastAPI):
    mongo_uri = os.getenv("MONGO_URI")
    mongo_db = os.getenv("MONGO_DB")

    client = None
    if mongo_uri and mongo_db:
        try:
            client = motor.motor_asyncio.AsyncIOMotorClient(mongo_uri)
            app.state.mongo_client = client
            app.state.db = client[mongo_db]
            # Optional sanity check
            await app.state.db.command("ping")
        except Exception:
            # Keep app running even if DB is not reachable; readiness will reflect status
            pass

    # Milvus connection (optional)
    milvus_uri = os.getenv("MILVUS_URI")
    milvus_token = os.getenv("MILVUS_TOKEN")
    milvus_alias = None
    if milvus_uri:
        try:
            from pymilvus import connections, utility  # lazy import
            milvus_alias = "lifespan"
            if milvus_token:
                connections.connect(alias=milvus_alias, uri=milvus_uri, token=milvus_token)
            else:
                connections.connect(alias=milvus_alias, uri=milvus_uri)
            app.state.milvus_alias = milvus_alias
            # Optional sanity check
            try:
                _ = utility.get_server_version(using=milvus_alias)
                app.state.milvus_ok = True
            except Exception:
                app.state.milvus_ok = False
        except Exception:
            app.state.milvus_ok = False

    try:
        yield
    finally:
        if client is not None:
            client.close()
        if milvus_alias is not None:
            try:
                from pymilvus import connections  # lazy import
                connections.disconnect(alias=milvus_alias)
            except Exception:
                pass


def create_app() -> FastAPI:
    app = FastAPI(title="AI Backend", version="0.1.0", lifespan=lifespan)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/health")
    async def health() -> dict:
        return {"status": "ok", "message": "Service is healthy"}

    @app.get("/ready")
    async def ready() -> dict:
        db = getattr(app.state, "db", None)
        if db is None:
            db_status = "not_configured"
        else:
            try:
                await db.command("ping")
                db_status = "ok"
            except Exception as e:
                db_status = f"error: {e}"

        milvus_status = "not_configured"
        try:
            from pymilvus import connections  # lazy import
            alias = getattr(app.state, "milvus_alias", None)
            if alias:
                milvus_status = "ok" if connections.has_connection(alias) and getattr(app.state, "milvus_ok", True) else "error"
        except Exception:
            pass

        return {"status": "ready", "message": "Service is ready", "db": db_status, "milvus": milvus_status}

    app.include_router(routes, prefix="/api")
    return app


app = create_app()


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=int(os.getenv("PORT", "9090")), reload=True)
