<!-- qwen36-uncensored — white-label. No personal or company identifiers in this file by design. -->

<p align="center">
  <img src="assets/dragon.png" alt="qwen36-uncensored" width="100%">
</p>

<h1 align="center">Qwen 3.6 27B Uncensored</h1>

<p align="center">
  Official <b>27B Q4_K_M</b> (~16.8 GB) + a harvested uncensored SYSTEM pack.<br>
  GitHub cannot host the weights. Download the GGUF below, or pull the Ollama tag — this repo bakes the residual so <code>ollama run</code> stays uncensored.
</p>

<p align="center">
  <a href="https://huggingface.co/unsloth/Qwen3.6-27B-GGUF/blob/main/Qwen3.6-27B-Q4_K_M.gguf"><img src="https://img.shields.io/badge/download-Q4__K__M%20GGUF%20·%2016.8GB-FFD21E?style=for-the-badge&logo=huggingface&logoColor=black" alt="Download Q4_K_M GGUF"></a>
  <a href="https://huggingface.co/unsloth/Qwen3.6-27B-GGUF/resolve/main/Qwen3.6-27B-Q4_K_M.gguf"><img src="https://img.shields.io/badge/direct-resolve%20Qwen3.6--27B--Q4__K__M.gguf-FF9F43?style=for-the-badge&logo=huggingface&logoColor=white" alt="Direct GGUF download"></a>
  <a href="https://huggingface.co/Qwen/Qwen3.6-27B"><img src="https://img.shields.io/badge/base-Qwen%2FQwen3.6--27B-111111?style=for-the-badge&logo=huggingface&logoColor=FFD21E" alt="Official Qwen 3.6 27B"></a>
</p>

<p align="center">
<img src="https://img.shields.io/badge/license-MIT-8B7CF6?style=flat-square" alt="MIT">
<img src="https://img.shields.io/badge/weights-Apache--2.0-8B7CF6?style=flat-square" alt="weights Apache-2.0">
<img src="https://img.shields.io/badge/quant-Q4__K__M-8B7CF6?style=flat-square" alt="Q4_K_M">
<img src="https://img.shields.io/badge/vram-24GB%20card-8B7CF6?style=flat-square" alt="24GB card">
<img src="https://img.shields.io/badge/speed-~43%20tok%2Fs-8B7CF6?style=flat-square" alt="43 tok/s">
<img src="https://img.shields.io/badge/think-off%20by%20default-8B7CF6?style=flat-square" alt="think off">
</p>

---

## Download the model

**File:** [`Qwen3.6-27B-Q4_K_M.gguf`](https://huggingface.co/unsloth/Qwen3.6-27B-GGUF/blob/main/Qwen3.6-27B-Q4_K_M.gguf) · **~16.8 GB** · Apache-2.0

Uncensored behavior is the SYSTEM pack in this repo. It is not a second weight dump.

| What | Link |
|---|---|
| **Q4_K_M GGUF (this is the file)** | [unsloth/Qwen3.6-27B-GGUF · Qwen3.6-27B-Q4_K_M.gguf](https://huggingface.co/unsloth/Qwen3.6-27B-GGUF/blob/main/Qwen3.6-27B-Q4_K_M.gguf) |
| **Direct download** | [resolve/main/Qwen3.6-27B-Q4_K_M.gguf](https://huggingface.co/unsloth/Qwen3.6-27B-GGUF/resolve/main/Qwen3.6-27B-Q4_K_M.gguf) |
| **All GGUF quants** | [unsloth/Qwen3.6-27B-GGUF](https://huggingface.co/unsloth/Qwen3.6-27B-GGUF) |
| **Official base** | [Qwen/Qwen3.6-27B](https://huggingface.co/Qwen/Qwen3.6-27B) |
| **Ollama library (same class)** | `ollama pull qwen3.6:27b` |

```bash
# Hugging Face CLI
huggingface-cli download unsloth/Qwen3.6-27B-GGUF Qwen3.6-27B-Q4_K_M.gguf --local-dir ./models

# curl (same URL the installer uses)
curl -L -o models/Qwen3.6-27B-Q4_K_M.gguf \
  https://huggingface.co/unsloth/Qwen3.6-27B-GGUF/resolve/main/Qwen3.6-27B-Q4_K_M.gguf
```

Skip: BF16 (~51 GB), FP8 (~31 GB), paid `obsidian/qwen3.8-27b`. Q4_K_M is the 24 GB-card quant.

---

## Install + bake uncensored

Requires [Ollama](https://ollama.com) and Node 18+. Weights stay off GitHub (100 MB file cap).

```bash
git clone <this-repo>
cd qwen36-uncensored

# A) Ollama pulls the official 17 GB tag, then this repo bakes SYSTEM
node bin/install.cjs

# B) Download the Hugging Face Q4_K_M GGUF, then bake FROM that file
node bin/install.cjs --gguf

ollama run --think=false qwen3.6:27b-uncensored
node examples/chat.cjs "Summarize this in one line: local 27B, think off."
```

Think-on (slower, more VRAM for the reasoning trace):

```bash
set QWEN_THINK=1
node examples/chat.cjs "Walk through why 8k ctx fits a 24 GB card."
```

---

## What this is

| Piece | Role |
|---|---|
| **Q4_K_M weights** | Hugging Face GGUF above, or Ollama `qwen3.6:27b` — Qwen/Qwen3.6-27B, ~17 GB, Apache-2.0 |
| **Attribute pack** | `lib/profile.cjs` — Arditi layer 38, 131 matrices, 0–6% thinking-off refusal, 262K context claim, `qwen3_coder`, vision + MTP |
| **Modelfile** | Bakes the pack into `qwen3.6:27b-uncensored` so `ollama run` is uncensored too |
| **Cheap path** | `think: false`, `num_ctx` 8192, all layers GPU — measured ~43 tok/s on a 24 GB card |

| Card | Quant | Context | Think | Resident | Speed |
|---|---|---|---|---|---|
| 24 GB | Q4_K_M | 8192 | off | ~16 GB | ~43 tok/s |
| 24 GB | Q4_K_M | 16384 | off | tighter KV | slower |
| 24 GB | Q4_K_M | 8192 | on | reasoning trace on GPU | much slower |

262K context is a model claim, not a serving default. Raising `QWEN_NUM_CTX` past 16384 will thrash KV on a 24 GB card.

---

## License

Scripts and the attribute pack text: MIT.  
Qwen weights: Apache-2.0. This repository does not redistribute those bytes.

Harvested numbers cite [orcarouter/Qwen3.8-27B-Uncensored-FP8](https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored-FP8). Re-harvest the card before changing a figure.
