#!/usr/bin/env python3
"""Build demo data for the Aerial web showcase."""

from __future__ import annotations

import json
import re
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]
OUTPUT_FILE = REPO_ROOT / "web_demo" / "data" / "demo-data.json"

COMPONENT_DIRS = {
    "cuPHY": "GPU-accelerated 5G PHY",
    "cuMAC": "GPU-accelerated MAC scheduler",
    "pyaerial": "Python APIs for research and integration",
    "testBenches": "Validation and performance tooling",
    "testVectors": "Reference vectors",
    "5GModel": "Waveform generation models",
}


def read_overview() -> list[str]:
    readme = (REPO_ROOT / "README.md").read_text(encoding="utf-8")
    bullets = []
    in_section = False
    for line in readme.splitlines():
        if line.strip() == "The **Aerial CUDA-Accelerated RAN** SDK includes:":
            in_section = True
            continue
        if in_section and line.startswith("### "):
            break
        if in_section and line.startswith("- **"):
            text = re.sub(r"^- \*\*(.+?)\*\*: ?", r"\1: ", line)
            bullets.append(text.strip())
    return bullets


def scan_component_stats() -> list[dict[str, object]]:
    stats = []
    for name, description in COMPONENT_DIRS.items():
        directory = REPO_ROOT / name
        file_count = sum(1 for p in directory.rglob("*") if p.is_file()) if directory.exists() else 0
        stats.append({"name": name, "description": description, "file_count": file_count})
    return stats


def load_perf_profiles() -> list[dict[str, object]]:
    profiles: list[dict[str, object]] = []
    for path in sorted((REPO_ROOT / "testBenches" / "perf").glob("testcases_*.json")):
        payload = json.loads(path.read_text(encoding="utf-8"))
        group_count = len(payload) if isinstance(payload, dict) else 0
        testcase_count = 0
        scenario_ids: set[str] = set()

        if isinstance(payload, dict):
            for group in payload.values():
                if isinstance(group, dict):
                    testcase_count += len(group)
                    scenario_ids.update(group.keys())

        profiles.append(
            {
                "name": path.stem,
                "groups": group_count,
                "num_testcases": testcase_count,
                "sample_scenarios": sorted(scenario_ids)[:4],
            }
        )
    return profiles


def main() -> None:
    data = {
        "repo": "NVIDIA Aerial CUDA-Accelerated RAN",
        "overview": read_overview(),
        "components": scan_component_stats(),
        "perf_profiles": load_perf_profiles(),
    }
    OUTPUT_FILE.write_text(json.dumps(data, indent=2), encoding="utf-8")
    print(f"Wrote {OUTPUT_FILE.relative_to(REPO_ROOT)}")


if __name__ == "__main__":
    main()
