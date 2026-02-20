# Aerial Web Demo: 6G Call Studio

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/NVIDIA/aerial-cuda-accelerated-ran/blob/main/web_demo/Aerial_6G_Call_Studio_Demo.ipynb)

This folder contains a static concept app that demonstrates what a lightweight
"network call planner" could look like on top of Aerial artifacts.

## What it does

- reads platform highlights from root `README.md`
- ingests performance profile metadata from `testBenches/perf/testcases_*.json`
- lets you choose a traffic type + profile + concurrency to generate synthetic
  call-session KPIs (latency, reliability, PRB demand, throughput)
- includes a Colab notebook (`Aerial_6G_Call_Studio_Demo.ipynb`) for interactive,
  zero-setup exploration

## Build demo data

```bash
python3 web_demo/build_demo_data.py
```

## Run locally

```bash
python3 -m http.server 8080
```

Open `http://localhost:8080/web_demo/`.
