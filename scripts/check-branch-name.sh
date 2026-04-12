#!/usr/bin/env bash
# Branch naming convention check.
# Allows: main, master, develop, HEAD (detached), or feat/fix/docs/chore/refactor/test/deps/ci/style/perf prefix.
set -euo pipefail

BRANCH="$(git rev-parse --abbrev-ref HEAD)"
PATTERN="^(feat|fix|docs|chore|refactor|test|deps|ci|style|perf)/"

case "$BRANCH" in
  main|master|develop|HEAD)
    exit 0
    ;;
esac

if [[ ! "$BRANCH" =~ $PATTERN ]]; then
  echo "Invalid branch name: $BRANCH" >&2
  echo "Branch must match: feat/, fix/, docs/, chore/, refactor/, test/, deps/, ci/, style/, perf/" >&2
  exit 1
fi
