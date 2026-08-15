# Contributing

Keep this repo white-label: no personal names, no private emails, no absolute machine paths, no API keys.

Do not commit weight files (`.gguf`, `.safetensors`, `.bin`). The 17 GB Q4_K_M checkpoint is pulled from the official Ollama library at install time.

Before a PR:

```bash
npm test
npm run check
```

Re-harvest https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored-FP8 before changing a number in `lib/profile.cjs`.
