import re
from json import JSONEncoder

class CustomJSONEncoder(JSONEncoder):
    def default(self, obj):
        try:
            return super().default(obj)
        except TypeError:
            return str(obj)

def generate_milvus_compatible_name(name: str) -> str:
    name = name.strip()
    
    # Replace non-alphanumeric characters with underscores
    clean_name = re.sub(r'[^a-zA-Z0-9_]', '_', name)
    
    # Replace multiple consecutive underscores with a single underscore
    clean_name = re.sub(r'_+', '_', clean_name)
    
    # Remove leading/trailing underscores
    clean_name = clean_name.strip('_')
    
    if clean_name and clean_name[0].isdigit():
        clean_name = f"c_{clean_name}"
    return clean_name