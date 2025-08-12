from pymilvus import (connections, FieldSchema,CollectionSchema,DataType,Collection,utility)
from src.config.config import VECTOR_DIM
from utils.milvus_utils import generate_milvus_compatible_name
import os

class MilvusConnectionError(Exception):
    def __init__(self, message, status_code=500):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)

class MilvusURIError(MilvusConnectionError):
    pass

class MilvusAuthError(MilvusConnectionError):
    pass

class MilvusCollectionError(MilvusConnectionError):
    pass

def get_milvus_credentials(domain_name):
    """Get Milvus URI and token based on domain name."""
    # Handle default domain case
    if domain_name == "default":
        uri = os.environ.get('MILVUS_URI')
        token = os.environ.get('MILVUS_TOKEN')
        return uri, token, "default"
    
    # Extract the base domain name (e.g., cwp-dev-in from cwp-dev-in.innovapptive.com)
    base_domain = domain_name.split('.')[0] if '.' in domain_name else domain_name
    
    # Try with original format (lowercase with hyphens)
    uri_env_var_original = f"MILVUS_URI_{base_domain}"
    token_env_var_original = f"MILVUS_TOKEN_{base_domain}"
    
    # Try with uppercase with underscores format (for backward compatibility)
    uri_env_var_transformed = f"MILVUS_URI_{base_domain.upper().replace('-', '_')}"
    token_env_var_transformed = f"MILVUS_TOKEN_{base_domain.upper().replace('-', '_')}"
    
    # Try original format first
    uri = os.environ.get(uri_env_var_original)
    token = os.environ.get(token_env_var_original)
    
    # If not found, try transformed format
    if not uri:
        uri = os.environ.get(uri_env_var_transformed)
    if not token:
        token = os.environ.get(token_env_var_transformed)
    
    # Fallback to default if domain-specific not found
    if not uri:
        uri = os.environ.get('MILVUS_URI')
    if not token:
        token = os.environ.get('MILVUS_TOKEN')
    
    return uri, token, base_domain

def connect_to_milvus(domain_name):
    try:
        uri, token, base_domain = get_milvus_credentials(domain_name)
        
        if not uri:
            raise MilvusURIError(f"Milvus URI for domain {domain_name} not found", status_code=500)
            
        if uri.startswith("https://") and not token:
            raise MilvusAuthError(f"Milvus token for domain {domain_name} is required for cloud Milvus instances", status_code=500)
            
        uri_parts = uri.split("://")
        if len(uri_parts) >= 2:
            protocol = uri_parts[0]
            
            # For Zilliz Cloud, we don't need to validate port
            if protocol == "https":
                connections.connect(
                    alias=base_domain, 
                    uri=uri,
                    token=token
                )
            else:
                # For self-hosted Milvus, validate host:port format
                address = uri_parts[1]
                if ":" not in address:
                    raise MilvusURIError(f"Port must be specified in MILVUS_URI for self-hosted Milvus. Format should be protocol://host:port", status_code=500)
                
                host, port = address.split(":")
                connections.connect(
                    alias=base_domain, 
                    uri=uri
                )
        else:
            raise MilvusURIError(f"Invalid MILVUS_URI format: {uri}", status_code=500)
            
        return base_domain  # Return the connection alias
    except MilvusConnectionError as e:
        raise e
    except Exception as e:
        raise MilvusConnectionError(f"Failed to connect to Milvus for domain {domain_name}: {e}", status_code=500)

def get_milvus_collection_name(doc_id):
    """Get a Milvus-compatible collection name from a document ID."""
    return generate_milvus_compatible_name(doc_id)

def create_milvus_collection(domain_name, doc_id):
    # Connect to the appropriate Milvus cluster
    connection_alias = connect_to_milvus(domain_name)
    
    # Generate collection name - ensure it's Milvus compatible
    collection_name = get_milvus_collection_name(doc_id)
    
    # Check if collection already exists
    if utility.has_collection(collection_name, using=connection_alias):
        try:
            return Collection(collection_name, using=connection_alias)
        except Exception as e:
            raise MilvusCollectionError(f"Failed to get collection: {e}", status_code=500)
    
    # Create a new collection
    fields = [
        FieldSchema(name="id", dtype=DataType.VARCHAR, description="Document chunk ID", is_primary=True, max_length=100),
        FieldSchema(name="s3_key", dtype=DataType.VARCHAR, description="S3 object key", max_length=500),
        FieldSchema(name="file_type", dtype=DataType.VARCHAR, description="File type", max_length=50),
        FieldSchema(name="content_hash", dtype=DataType.VARCHAR, description="Content hash", max_length=100),
        FieldSchema(name="chunk_index", dtype=DataType.INT64, description="Chunk index"),
        FieldSchema(name="text_chunk", dtype=DataType.VARCHAR, description="Text chunk content", max_length=65535),
        FieldSchema(name="s3_url", dtype=DataType.VARCHAR, description="S3 URL", max_length=500),
        FieldSchema(name="metadata", dtype=DataType.VARCHAR, description="Metadata JSON", max_length=1000),
        FieldSchema(name="embedding", dtype=DataType.FLOAT_VECTOR, description="Text embedding vector", dim=VECTOR_DIM),
        FieldSchema(name="page_number", dtype=DataType.INT64, description="Page number"),
        FieldSchema(name="page_image_urls", dtype=DataType.VARCHAR, description="Page-specific image URLs as JSON", max_length=5000),
        FieldSchema(name="page_image_descriptions", dtype=DataType.VARCHAR, description="Page-specific image descriptions as JSON mapping filenames to descriptions", max_length=5000),
        FieldSchema(name="page_image_embeddings", dtype=DataType.VARCHAR, description="Page-specific image embeddings as JSON mapping filenames to embedding vectors", max_length=65535)
    ]
    
    try:
        schema = CollectionSchema(
            fields=fields,
            description=f"Document collection for {domain_name}/{doc_id}"
        )
        collection = Collection(
            name=collection_name,
            schema=schema,
            shards_num=2,  #for parallel inserting data
            using=connection_alias
        )
    except Exception as e:
        raise MilvusCollectionError(f"Failed to create collection schema: {e}", status_code=500)
    
    try:
        collection.create_index(
            field_name="embedding",
            index_params={
                "metric_type":"COSINE",
                "index_type":"HNSW", #HNSW is a type of index that is used to search for nearest neighbors in a high-dimensional space.
                "params":{"M": 8, "efConstruction": 64} #Number of neighbors to link #Search depth during index creation
            }
        )
    except Exception as e:
        raise MilvusCollectionError(f"Failed to create index on collection: {e}", status_code=500)
    
    return collection
