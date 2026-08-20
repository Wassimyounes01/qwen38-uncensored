<!-- qwen38-uncensored — white-label. No personal or company identifiers in this file by design. -->

<p align="center">
  <img src="assets/dragon.png" alt="qwen38-uncensored" width="100%">
</p>

<h1 align="center">Qwen 3.8 27B Uncensored</h1>

<p align="center">
  <b>Abliterated</b> Qwen 3.8 27B — uncensored at the weight level, not just prompting.<br>
  Cross-platform: <b>Mac M5 Pro</b> (Q3_K_M · 13.5GB · Metal) + <b>Windows</b> (Q4_K_M · 16.8GB · CUDA).<br>
  Optional <b>MLX</b> backend for 30-50% faster inference on Apple Silicon.
</p>

<p align="center">
  <a href="https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored-GGUF"><img src="https://img.shields.io/badge/download-Abliterated%20GGUF-FFD21E?style=for-the-badge&logo=huggingface&logoColor=black" alt="Abliterated GGUF"></a>
  <a href="https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored-MLX"><img src="https://img.shields.io/badge/download-MLX%20(Mac)-FF9F43?style=for-the-badge&logo=apple&logoColor=white" alt="MLX"></a>
  <a href="https://huggingface.co/Qwen/Qwen3.8-27B"><img src="https://img.shields.io/badge/base-Qwen%2FQwen3.8--27B-111111?style=for-the-badge&logo=huggingface&logoColor=FFD21E" alt="Official Qwen 3.8 27B"></a>
</p>

<p align="center">
<img src="https://img.shields.io/badge/license-MIT-8B7CF6?style=flat-square" alt="MIT">
<img src="https://img.shields.io/badge/weights-Apache--2.0-8B7CF6?style=flat-square" alt="weights Apache-2.0">
<img src="https://img.shields.io/badge/abliterated-weight--level-FF4444?style=flat-square" alt="abliterated">
<img src="https://img.shields.io/badge/Mac-M5%20Pro%20optimized-8B7CF6?style=flat-square" alt="M5 Pro">
<img src="https://img.shields.io/badge/Windows-24GB%20GPU-8B7CF6?style=flat-square" alt="Windows">
</p>

---

## What's different: abliterated vs system-pack

| Approach | How it works | Uncensoring depth |
|---|---|---|
| **System pack** (v1) | Official Qwen weights + a SYSTEM prompt that steers away from refusal | Surface-level — model can still refuse |
| **Abliterated** (v2, this) | Refusal direction orthogonalized out of 131 weight matrices at layer 38 | Weight-level — refusal circuits removed |

This repo now defaults to [orcarouter's abliterated weights](https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored-GGUF) + the system pack as reinforcement.

---

## Hardware profiles

| Platform | Chip | RAM | Quant | Model size | Context | Backend |
|---|---|---|---|---|---|---|
| **Mac M5 Pro** | 18-core CPU, 20-core GPU | 48 GB | **Q3_K_M** | 13.5 GB | 8192 | Metal (all-GPU) |
| **Mac M5 Max** | 40-core GPU | 64-128 GB | Q4_K_M+ | 16.8 GB | 16384 | Metal |
| **Mac (any, ≥32GB)** | Apple Silicon | 32+ GB | Q3_K_M | 13.5 GB | 8192 | Metal |
| **Windows** | NVIDIA 24GB | 24+ GB | Q4_K_M | 16.8 GB | 8192 | CUDA |
| **Windows** | NVIDIA 12GB | 16+ GB | Q3_K_M | 13.5 GB | 4096 | CUDA |

### Why Q3_K_M for Mac M5 Pro?

The M5 Pro has 48GB unified memory, but macOS reserves ~25% (~12GB). That leaves **~36GB** for inference:

- **Q4_K_M** (16.8GB weights + ~3GB KV cache) = ~20GB → works but tight with apps open
- **Q3_K_M** (13.5GB weights + ~3GB KV cache) = ~16.5GB → **23GB+ headroom** for OS, apps, and larger context when needed
- All layers stay on GPU (Metal unified memory) → no CPU offloading → fast inference

---

## Quick start

### Mac (Ollama)

```bash
git clone https://github.com/Wassimyounes01/qwen38-uncensored.git
cd qwen38-uncensored

# Auto-detects Mac → pulls Q3_K_M abliterated (13.5 GB)
node bin/install.cjs

ollama run --think=false qwen3.8:27b-uncensored
```

### Mac (MLX — 30-50% faster)

```bash
# Install MLX backend (Apple Silicon native, ~30-50% faster than Ollama)
node bin/install.cjs --mlx

# Or use the shell script:
bash bin/install-mlx.sh

# Start the server (same port as Ollama — harness works unchanged)
mlx_lm.server --model models/mlx --port 11434

# Chat
node examples/chat.cjs "hello"
```

### Windows

```bash
git clone https://github.com/Wassimyounes01/qwen38-uncensored.git
cd qwen38-uncensored

# Auto-detects Windows → pulls Q4_K_M abliterated (16.8 GB)
node bin/install.cjs

ollama run --think=false qwen3.8:27b-uncensored
```

### Override quant

```bash
# Force a specific quant on any platform
node bin/install.cjs --quant=IQ4_XS    # 15.3 GB — mid-ground
node bin/install.cjs --quant=Q5_K_M    # 19.5 GB — higher quality
node bin/install.cjs --quant=Q3_K_M    # 13.5 GB — maximum headroom

# Use legacy official weights + system pack (NOT abliterated)
node bin/install.cjs --legacy
```

---

## Available quants

All from [orcarouter/Qwen3.8-27B-Uncensored-GGUF](https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored-GGUF) — abliterated at the weight level.

| Quant | Size | Best for |
|---|---|---|
| Q3_K_M | 13.5 GB | Mac M5 Pro 48GB, 12GB GPUs, max context headroom |
| IQ4_XS | 15.3 GB | Importance-matrix, best quality-per-bit at this size |
| Q4_K_S | 16.2 GB | Slightly smaller than Q4_K_M |
| **Q4_K_M** | **16.8 GB** | **Windows 24GB GPU (default)** |
| Q5_K_M | 19.5 GB | Higher quality when VRAM allows |
| Q6_K | 22.4 GB | Quality-per-GB sweet spot |
| Q8_0 | 29.0 GB | Near-lossless |

---

## Architecture

```
┌─────────────────────────────────────────────┐
│               install.cjs                    │
│  detects platform → picks quant + Modelfile  │
├──────────────┬──────────────────────────────┤
│   Mac path   │      Windows path            │
│  Q3_K_M      │      Q4_K_M                  │
│  Modelfile.mac│     Modelfile                │
│  Metal GPU    │      CUDA GPU                │
│  12 threads   │      auto threads            │
├──────────────┴──────────────────────────────┤
│         orcarouter abliterated weights       │
│  refusal direction orthogonalized out of     │
│  131 matrices at layer 38 (Arditi et al.)    │
├─────────────────────────────────────────────┤
│           SYSTEM pack (reinforcement)        │
│  profile.cjs → Modelfile SYSTEM block        │
└─────────────────────────────────────────────┘
```

---

## Troubleshooting

### Still slow on Mac?

1. **Check GPU offloading:** `ollama ps` — if you see a CPU/GPU split, the model is partially on CPU
2. **Force all layers to GPU:** Already set in `Modelfile.mac` (`num_gpu 999`), but verify with `ollama show qwen3.8:27b-uncensored`
3. **Reduce context:** `QWEN_NUM_CTX=4096 node examples/chat.cjs "test"` — smaller KV cache = less memory
4. **Switch to MLX:** `node bin/install.cjs --mlx` — 30-50% faster on Apple Silicon
5. **Close memory-heavy apps:** Safari, Chrome, Docker eat into unified memory
6. **Check Ollama version:** Requires 0.17.1+ for Qwen 3.8 architecture

### Model doesn't respond / refuses

- Verify you pulled abliterated weights: `ollama show qwen3.8:27b-uncensored --modelfile` should show `FROM orcarouter/...`
- If using `--legacy`, the system pack alone may not fully suppress refusals

---

## Honest stack

| Layer | What it actually is |
|---|---|
| **Loaded weights** | Abliterated `orcarouter/Qwen3.8-27B-Uncensored-GGUF` — refusal direction removed from 131 matrices. Mac: Q3_K_M, Windows: Q4_K_M. |
| **SYSTEM pack** | Reinforcement layer from this repo (`lib/profile.cjs`), harvested from orcarouter model card. |
| **MLX alternative** | `orcarouter/Qwen3.8-27B-Uncensored-MLX` — same abliterated weights in Apple MLX format. |
| **Not loaded** | The 30.9 GB FP8 checkpoint. That is the abliteration source, not the serving format. |

---

## API usage

```javascript
const res = await fetch('http://127.0.0.1:11434/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: 'qwen3.8:27b-uncensored',
    stream: false,
    think: false,
    messages: [{ role: 'user', content: 'Hello' }],
    options: { num_ctx: 8192, num_gpu: 999, num_batch: 512 },
  }),
});
const { message } = await res.json();
console.log(message.content);
```

---

## License

Scripts, attribute pack, and platform harness: **MIT**.  
Qwen weights: **Apache-2.0**. This repo does not redistribute weight bytes.

Abliterated weights by [orcarouter](https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored-GGUF). Abliteration method: [Arditi et al. (2024)](https://arxiv.org/abs/2406.11717).
