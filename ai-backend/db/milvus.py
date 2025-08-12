import re

from pymilvus import Collection, utility
from ...core.models.milvus_connection import connect_to_milvus, MilvusConnectionError, MilvusURIError, MilvusAuthError, MilvusCollectionError, get_milvus_credentials, get_milvus_collection_name
from typing import Optional, Any
import logging

logger = logging.getLogger(__name__)

# Cache for collection objects
collection_cache = {}

def get_collection_for_work_order(domain_name, doc_id):
    try:
        # Extract base domain to match how connections are created
        base_domain = domain_name.split('.')[0] if '.' in domain_name else domain_name
        connection_alias = base_domain
        
        # Get Milvus-compatible collection name
        collection_name = get_milvus_collection_name(doc_id)

        cache_key = f"{domain_name}:{doc_id}"
        
        # Check cache first
        if cache_key in collection_cache:
            collection = collection_cache[cache_key]
            try:
                collection.load()
                return collection, {
                    "domain_name": domain_name,
                    "doc_id": doc_id,
                    "collection_name": collection_name
                }
            except Exception:
                # If cached collection is invalid, remove it
                del collection_cache[cache_key]
        
        try:
            if utility.has_collection(collection_name, using=connection_alias):
                collection = Collection(collection_name, using=connection_alias)
                collection.load()
                
                # Cache the collection
                collection_cache[cache_key] = collection
                
                # Return collection and info
                collection_info = {
                    "domain_name": domain_name,
                    "doc_id": doc_id,
                    "collection_name": collection_name
                }
                
                return collection, collection_info
        except Exception as e:
            logger.error(f"Error accessing collection {collection_name}: {str(e)}")
        
        raise MilvusCollectionError(f"No collection found for {domain_name}/{doc_id}", status_code=404)
    
    except (MilvusConnectionError, MilvusCollectionError):
        raise
    except ValueError:
        raise
    except Exception as e:
        raise MilvusCollectionError(f"Unexpected error getting Milvus collection: {e}", status_code=500)

def ensure_milvus_connected(domain_name):
    """Ensure connection to the appropriate Milvus cluster based on domain name."""
    try:
        connection_alias = connect_to_milvus(domain_name)
        return connection_alias
    except Exception as e:
        raise e

def get_collection(domain_name: str, doc_id: str) -> Optional[Any]:
    """Get collection if it exists."""
    try:
        # Connect to the appropriate cluster
        connection_alias = ensure_milvus_connected(domain_name)
        
        # Get Milvus-compatible collection name
        collection_name = get_milvus_collection_name(doc_id)
        
        # Check if collection exists
        if utility.has_collection(collection_name, using=connection_alias):
            collection = Collection(name=collection_name, using=connection_alias)
            
            # Ensure collection is loaded before any operations
            try:
                collection.load()
                logger.info(f"Collection {collection_name} loaded successfully")
            except Exception as load_error:
                logger.warning(f"Failed to load collection on first try: {str(load_error)}")
                # If load fails, try to release and load again
                try:
                    utility.load_collection(collection_name, using=connection_alias)
                except Exception as reload_error:
                    logger.error(f"Failed to reload collection: {str(reload_error)}")
                    return None
            
            return collection
            
        return None
    except Exception as e:
        logger.error(f"Error getting collection: {str(e)}")
        return None

def ensure_collection_loaded(collection: Any, domain_name: str = None) -> bool:
    """Ensure a collection is loaded and ready for operations."""
    if not collection:
        return False
        
    try:
        # If domain_name is not provided, try to use the default connection
        if not domain_name:
            try:
                # Just try to load the collection with default connection
                collection.load()
                return True
            except Exception as e:
                logger.error(f"Error loading collection without domain: {str(e)}")
                return False
        
        # Get connection alias for the domain
        _, _, connection_alias = get_milvus_credentials(domain_name)
        
        # Try to load the collection
        try:
            collection.load()
            return True
        except Exception as e:
            logger.error(f"Error loading collection: {str(e)}")
            # Try to reload using utility if first attempt fails
            try:
                # Check if collection exists
                if utility.has_collection(collection.name, using=connection_alias):
                    # Use the correct method to load the collection
                    collection = Collection(collection.name, using=connection_alias)
                    collection.load()
                    return True
            except Exception as reload_error:
                logger.error(f"Failed to reload collection: {str(reload_error)}")
                return False
    except Exception as e:
        logger.error(f"Error ensuring collection loaded: {str(e)}")
        return False

def disconnect_milvus(domain_name=None):
    """Disconnect from Milvus clusters."""
    try:
        if domain_name:
            # Disconnect from specific cluster
            _, _, base_domain = get_milvus_credentials(domain_name)
            connections.disconnect(alias=base_domain)
        else:
            # Disconnect from all clusters
            connections.disconnect("all")
    except Exception as e:
        raise e