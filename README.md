<!-- qwen36-uncensored — white-label. No personal or company identifiers in this file by design. -->

<p align="center">
  <img src="assets/hero.svg" alt="qwen36-uncensored" width="100%">
</p>

<h1 align="center">Qwen 3.6 27B Uncensored</h1>

<p align="center">
  <b>Official Ollama <code>qwen3.6:27b</code> Q4_K_M (~17 GB) plus a harvested uncensored attribute pack baked into SYSTEM.</b><br>
  <sub>This repo does not host the 17 GB weights. GitHub cannot. You pull the official library tag, then <code>ollama create</code> applies the pack so <code>ollama run</code> and any local <code>/api/chat</code> client stay uncensored.</sub>
</p>

<p align="center">
<img src="https://img.shields.io/badge/license-MIT-8B7CF6" alt="MIT">
<img src="https://img.shields.io/badge/weights-Apache--2.0-8B7CF6" alt="weights Apache-2.0">
<img src="https://img.shields.io/badge/size-~17GB%20Q4__K__M-8B7CF6" alt="17GB">
<img src="https://img.shields.io/badge/vram-24GB%20card-8B7CF6" alt="24GB card">
</p>

<p align="center">
  <img src="assets/product.svg" alt="install and run" width="100%">
</p>

<p align="center">
<code>qwen3.6</code> · <code>27b</code> · <code>q4-k-m</code> · <code>uncensored</code> · <code>ollama</code> · <code>local</code>
</p>

---

## What this is

| Piece | Role |
|---|---|
| **Official weights** | `ollama pull qwen3.6:27b` — Qwen/Qwen3.6-27B Q4_K_M, ~17 GB, Apache-2.0 |
| **Attribute pack** | `lib/profile.cjs` — Arditi layer 38, 131 matrices, 0–6% thinking-off refusal, 262K context claim, `qwen3_coder`, vision + MTP |
| **Modelfile** | Bakes the pack into `qwen3.6:27b-uncensored` so `ollama run` is uncensored too |
| **Cheap path** | `think: false`, `num_ctx` 8192, all layers GPU — measured ~43 tok/s on a 24 GB card |

Not included: BF16 (51 GB), FP8 (31 GB), or the paid hosted id `obsidian/qwen3.8-27b`.

---

## Quickstart

```bash
# 1. Ollama on PATH, then pull + bake (~17 GB once)
node bin/install.cjs

# 2. interactive
ollama run --think=false qwen3.6:27b-uncensored

# 3. one-shot local chat (same pack prepended)
node examples/chat.cjs "Summarize this in one line: local 27B, think off."
```

Think-on (slower, more VRAM for the reasoning trace):

```bash
set QWEN_THINK=1
node examples/chat.cjs "Walk through why 8k ctx fits a 24 GB card."
```

---

## Hardware

Fits a single 24 GB GPU (Q4_K_M + 8k ctx, think off, ~16 GB resident). 262K context is a model claim, not a serving default — raising `QWEN_NUM_CTX` past 16384 will thrash KV on a 24 GB card.

---

## License

Scripts and the attribute pack text: MIT.  
Qwen weights: Apache-2.0 from the official library. This repository does not redistribute those bytes.

Harvested numbers cite [orcarouter/Qwen3.8-27B-Uncensored-FP8](https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored-FP8). Re-harvest the card before changing a figure.
