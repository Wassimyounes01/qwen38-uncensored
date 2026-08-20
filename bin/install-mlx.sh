#!/usr/bin/env bash
# MLX quick-start for Mac — 30-50% faster than Ollama on Apple Silicon.
# Abliterated Qwen 3.8 27B uncensored weights via MLX format.
# Serves on :11434 (same port as Ollama) so the harness works unchanged.
set -euo pipefail

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║  Qwen 3.8 27B Uncensored — MLX Install (Mac only)      ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# Check macOS
if [[ "$(uname)" != "Darwin" ]]; then
  echo "ERROR: MLX is only supported on macOS with Apple Silicon."
  exit 2
fi

# Check Apple Silicon
ARCH=$(uname -m)
if [[ "$ARCH" != "arm64" ]]; then
  echo "ERROR: MLX requires Apple Silicon (arm64). Detected: $ARCH"
  exit 2
fi

# Check Python
PY=""
for cmd in python3 python; do
  if command -v "$cmd" &>/dev/null; then
    PY="$cmd"
    break
  fi
done
if [[ -z "$PY" ]]; then
  echo "ERROR: Python 3 is required. Install: brew install python3"
  exit 2
fi

echo "Python:    $($PY --version)"
echo "Chip:      $(sysctl -n machdep.cpu.brand_string 2>/dev/null || echo 'Apple Silicon')"
echo "Memory:    $(( $(sysctl -n hw.memsize) / 1073741824 )) GB"
echo ""

# Install dependencies
echo "Installing mlx-lm + huggingface-hub..."
$PY -m pip install --upgrade mlx-lm huggingface-hub 2>&1 | tail -3
echo ""

# Download model
MODEL_DIR="$(cd "$(dirname "$0")/.." && pwd)/models/mlx"
echo "Downloading abliterated MLX model to $MODEL_DIR..."
$PY -m huggingface_hub download orcarouter/Qwen3.8-27B-Uncensored-MLX --local-dir "$MODEL_DIR"
echo ""

echo "╔══════════════════════════════════════════════════════════╗"
echo "║  MLX installed!                                          ║"
echo "║                                                         ║"
echo "║  Start the server:                                       ║"
echo "║                                                         ║"
echo "║    mlx_lm.server \\                                       ║"
echo "║      --model $MODEL_DIR \\                                ║"
echo "║      --port 11434                                        ║"
echo "║                                                         ║"
echo "║  Then chat:                                              ║"
echo "║                                                         ║"
echo "║    node examples/chat.cjs \"hello\"                       ║"
echo "║    (same port as Ollama — harness works unchanged)       ║"
echo "║                                                         ║"
echo "║  Or run directly:                                        ║"
echo "║                                                         ║"
echo "║    mlx_lm.generate \\                                     ║"
echo "║      --model $MODEL_DIR \\                                ║"
echo "║      --prompt \"Hello, uncensored Qwen.\"                 ║"
echo "╚══════════════════════════════════════════════════════════╝"
