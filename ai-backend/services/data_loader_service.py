import json
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from typing import Dict, Any


def _read_single_json(json_path: Path) -> Any:
    with json_path.open("r", encoding="utf-8") as f:
        return json.load(f)


def load_all_json_from_data() -> Dict[str, Any]:
    base_dir = Path(__file__).resolve().parents[1]
    data_dir = base_dir / "data"
    result: Dict[str, Any] = {}

    if not data_dir.exists() or not data_dir.is_dir():
        return result

    json_files = list(data_dir.glob("*.json"))
    if not json_files:
        return result

    with ThreadPoolExecutor(max_workers=min(8, len(json_files))) as executor:
        future_to_name = {
            executor.submit(_read_single_json, jf): jf.stem for jf in json_files
        }
        for future in as_completed(future_to_name):
            name = future_to_name[future]
            try:
                result[name] = future.result()
            except Exception as exc:
                result[name] = {"error": f"Failed to read {name}.json: {exc}"}

    return dict(sorted(result.items(), key=lambda kv: kv[0])) 