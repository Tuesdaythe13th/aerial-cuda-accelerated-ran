# Quick Repository Review + Demo Direction

## Why this repo is ideal for a call-planning demo

1. `cuPHY` and `cuMAC` provide the exact L1/L2 acceleration story behind modern
   high-density wireless traffic.
2. `testBenches/perf` already contains scenario bundles we can repurpose as
   profile inputs for a simulation-oriented UI.
3. `pyaerial` creates a bridge to future AI/ML-assisted policy engines.

## Demo concept implemented

`web_demo` now acts as a **6G Call Studio**:

- choose traffic class (voice/video/IoT),
- choose a testcase profile,
- choose concurrency,
- generate synthetic per-session call plan with KPI cards.

This keeps the demo lightweight while still grounded in real repo artifacts.
