#!/usr/bin/env bash
# Installs a combined pre-commit hook that runs both the Python and the
# TypeScript pre-commit configs sequentially. Required for multi-stack repos
# because `pre-commit install` only registers a single config file.
set -euo pipefail

HOOK_PATH=".git/hooks/pre-commit"

if ! command -v pre-commit >/dev/null 2>&1; then
  echo "Error: pre-commit not found. Install with: pip install pre-commit" >&2
  exit 1
fi

cat > "$HOOK_PATH" <<'HOOK_EOF'
#!/usr/bin/env bash
set -e

echo "=== Running Python pre-commit hooks (.pre-commit-config.yaml) ==="
pre-commit run --config=.pre-commit-config.yaml "$@"

echo "=== Running TypeScript pre-commit hooks (.pre-commit-config-ts.yaml) ==="
pre-commit run --config=.pre-commit-config-ts.yaml "$@"

echo "=== All pre-commit hooks passed ==="
HOOK_EOF

chmod +x "$HOOK_PATH"
echo "Combined pre-commit hook installed at $HOOK_PATH"
