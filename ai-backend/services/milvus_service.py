import asyncio
import json
import logging
from typing import List, Dict
from bson import ObjectId

logger = logging.getLogger(__name__)


async def get_knowledge_repository_links(db, object_id: str) -> List[str]:
    try:
        collection = db["KnowledgeRepositoryDocumentLink"]
        object_id_obj = ObjectId(object_id)
        query = {
            "objectIds": object_id_obj,
            "status": 1,
            "linkedEntities.entityType": "Equipment",
        }
        cursor = collection.find(query, {"_id": 1})
        return [str(doc["_id"]) async for doc in cursor]
    except Exception as e:
        raise e


async def get_links_for_asset_ids(db, asset_ids: List[str]) -> Dict[str, List[str]]:
    from asyncio import gather

    async def _one(aid: str):
        try:
            return aid, await get_knowledge_repository_links(db, aid)
        except Exception:
            return aid, []

    results = await gather(*(_one(aid) for aid in asset_ids))
    return {aid: links for aid, links in results}


def _resolve_collection_name(doc_id: str) -> str:
    try:
        from db.milvus_connection import get_milvus_collection_name  # type: ignore
        return get_milvus_collection_name(doc_id)
    except Exception:
        print("Exception in _resolve_collection_name", Exception)
        return doc_id


def query_milvus(query_text, collection_name, top_k=10, connection_alias="lifespan"):
    from pymilvus import Collection, utility
    try:
        from db.milvus_core import MilvusCore  # type: ignore
        get_embedding = MilvusCore.get_embedding
    except Exception:
        raise RuntimeError("MilvusCore.get_embedding provider is not available")

    if not collection_name or not utility.has_collection(collection_name, using=connection_alias):
        raise ValueError(f"Invalid collection: {collection_name}")

    query_embedding = get_embedding(query_text)
    collection = Collection(collection_name, using=connection_alias)
    collection.load()

    results = collection.search(
        data=[query_embedding],
        anns_field="embedding",
        param={"metric_type": "COSINE", "params": {"nprobe": 10}},
        limit=top_k,
        output_fields=["s3_key", "text_chunk", "chunk_index", "s3_url", "metadata", "page_number"],
    )

    context_chunks = []
    for hits in results:
        for hit in hits:
            # Safely parse metadata without passing a default to .get
            meta_raw = hit.entity.get("metadata")
            metadata = {}
            if isinstance(meta_raw, str):
                try:
                    metadata = json.loads(meta_raw)
                except json.JSONDecodeError:
                    metadata = {}
            elif isinstance(meta_raw, dict):
                metadata = meta_raw

            page_number = hit.entity.get("page_number")
            if page_number is None and isinstance(metadata, dict):
                page_number = metadata.get("page_number")

            text_chunk = hit.entity.get("text_chunk") or ""
            s3_key = hit.entity.get("s3_key") or ""
            s3_url = hit.entity.get("s3_url") or ""
            chunk_index = hit.entity.get("chunk_index")

            context_chunks.append(
                {
                    "text": text_chunk,
                    "source": s3_key,
                    "url": s3_url,
                    "score": hit.score,
                    "chunk_index": chunk_index,
                    "page_number": page_number,
                    "metadata": metadata,
                }
            )

    collection.release()
    return context_chunks


def process_single_document_sync(connection_alias: str, doc_id: str, question: str):
    from pymilvus import Collection, utility

    try:
        collection_name = _resolve_collection_name(doc_id)
        if not utility.has_collection(collection_name, using=connection_alias):
            return None, None, None

        collection = Collection(collection_name, using=connection_alias)
        collection.load()

        context_chunks = query_milvus(question, collection_name, top_k=10, connection_alias=connection_alias)

        for chunk in context_chunks:
            chunk["doc_id"] = doc_id
            chunk["collection_name"] = collection_name

        return collection_name, {"collection_name": collection_name, "doc_id": doc_id}, context_chunks
    except Exception as e:
        logger.error(f"Error processing document {doc_id}: {str(e)}")
        return None, None, None


async def process_single_document(connection_alias: str, doc_id: str, question: str):
    return await asyncio.to_thread(process_single_document_sync, connection_alias, doc_id, question)


async def process_documents_parallel(document_ids: List[str], connection_alias: str, question: str):
    import time

    start_time = time.time()
    logger.info(f"Starting parallel processing of {len(document_ids)} documents")

    tasks = [process_single_document(connection_alias, doc_id, question) for doc_id in document_ids]
    results = await asyncio.gather(*tasks)

    end_time = time.time()
    print(f"Completed parallel processing in {end_time - start_time:.2f} seconds")

    all_context_chunks = []
    collections_processed = []
    collections_info = {}
    collections_not_found = 0

    for collection_name, collection_info, chunks in results:
        if collection_name and chunks:
            if collection_name not in collections_processed:
                collections_processed.append(collection_name)
                collections_info[collection_name] = collection_info
                all_context_chunks.extend(chunks)
        else:
            collections_not_found += 1

    return all_context_chunks, collections_processed, collections_info, collections_not_found