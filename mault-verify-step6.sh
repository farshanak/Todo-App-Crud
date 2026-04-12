#!/usr/bin/env bash
# mault-verify-step6.sh — Ralph Loop verification for Step 6: Pre-commit Hooks
# 12 CHECKs. Exit 0 only if ALL pass.
set -uo pipefail

PASS_COUNT=0
FAIL_COUNT=0
PENDING_COUNT=0
CHECK_RESULTS=()
TOTAL_CHECKS=12

PROOF_DIR=".mault"
PROOF_FILE="$PROOF_DIR/verify-step6.proof"

record_result() { CHECK_RESULTS+=("CHECK $1: $2 - $3"); }
print_pass()    { echo "[PASS]    CHECK $1: $2"; PASS_COUNT=$((PASS_COUNT + 1)); record_result "$1" "PASS" "$2"; }
print_fail()    { echo "[FAIL]    CHECK $1: $2"; FAIL_COUNT=$((FAIL_COUNT + 1)); record_result "$1" "FAIL" "$2"; }
print_pending() { echo "[PENDING] CHECK $1: $2"; PENDING_COUNT=$((PENDING_COUNT + 1)); record_result "$1" "PENDING" "$2"; }

if [ -f "$PROOF_FILE" ]; then
  PROOF_SHA=$(grep '^GitSHA:' "$PROOF_FILE" | awk '{print $2}')
  CURRENT_SHA=$(git rev-parse --short HEAD 2>/dev/null)
  if [ "$PROOF_SHA" != "$CURRENT_SHA" ]; then
    echo "Stale proof detected (SHA mismatch). Deleting."
    rm -f "$PROOF_FILE"
  fi
fi

detect_default_branch() {
  local branch
  branch=$(gh repo view --json defaultBranchRef -q '.defaultBranchRef.name' 2>/dev/null) || true
  if [ -n "$branch" ]; then echo "$branch"; return; fi
  if git show-ref --verify --quiet refs/heads/main 2>/dev/null; then echo "main"
  elif git show-ref --verify --quiet refs/heads/master 2>/dev/null; then echo "master"
  else echo "main"; fi
}
DEFAULT_BRANCH=$(detect_default_branch)

write_proof_file() {
  local sha epoch iso token
  sha=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
  epoch=$(date +%s)
  iso=$(date -u +"%Y-%m-%dT%H:%M:%SZ" 2>/dev/null || date +"%Y-%m-%dT%H:%M:%S")
  token="MAULT-STEP6-${sha}-${epoch}-${TOTAL_CHECKS}/${TOTAL_CHECKS}"
  mkdir -p "$PROOF_DIR"
  if [ ! -f "$PROOF_DIR/.gitignore" ]; then
    printf '*\n!.gitignore\n' > "$PROOF_DIR/.gitignore"
  fi
  {
    echo "MAULT-STEP6-PROOF"
    echo "=================="
    echo "Timestamp: $epoch"
    echo "DateTime: $iso"
    echo "GitSHA: $sha"
    echo "Checks: ${TOTAL_CHECKS}/${TOTAL_CHECKS} PASS"
    for r in "${CHECK_RESULTS[@]}"; do
      echo "  $r"
    done
    echo "=================="
    echo "Token: $token"
  } > "$PROOF_FILE"
  echo ""
  echo "Proof file written: $PROOF_FILE"
  echo "Token: $token"
}

echo "========================================"
echo "  MAULT Step 6 Pre-commit Verification"
echo "  Default branch: $DEFAULT_BRANCH"
echo "========================================"
echo ""

# CHECK 1: Step 5 prerequisite
check_1() {
  if [ -f ".mault/verify-step5.proof" ]; then
    local token
    token=$(grep '^Token:' .mault/verify-step5.proof | awk '{print $2}')
    print_pass 1 "Step 5 proof exists (${token})"
  else
    print_fail 1 "Step 5 proof not found. Complete Step 5 first."
  fi
}

# CHECK 2: pre-commit CLI installed
check_2() {
  if command -v pre-commit >/dev/null 2>&1; then
    local v
    v=$(pre-commit --version 2>&1)
    print_pass 2 "pre-commit installed (${v})"
  else
    print_fail 2 "pre-commit CLI not installed."
  fi
}

# CHECK 3: At least one pre-commit config exists
check_3() {
  local found=""
  [ -f ".pre-commit-config.yaml" ] && found="${found}.pre-commit-config.yaml "
  [ -f ".pre-commit-config-ts.yaml" ] && found="${found}.pre-commit-config-ts.yaml "
  if [ -n "$found" ]; then
    print_pass 3 "Pre-commit config(s) present: ${found}"
  else
    print_fail 3 "No pre-commit config files found."
  fi
}

# CHECK 4: Multi-stack combined hook installer exists
check_4() {
  if [ -f "scripts/install-precommit-hooks.sh" ] && [ -x "scripts/install-precommit-hooks.sh" ]; then
    print_pass 4 "Combined hook installer is present and executable"
  else
    print_fail 4 "scripts/install-precommit-hooks.sh missing or not executable."
  fi
}

# CHECK 5: .git/hooks/pre-commit installed and runs both configs
check_5() {
  if [ ! -x ".git/hooks/pre-commit" ]; then
    print_fail 5 ".git/hooks/pre-commit missing or not executable."
    return
  fi
  if grep -q '.pre-commit-config.yaml' .git/hooks/pre-commit && \
     grep -q '.pre-commit-config-ts.yaml' .git/hooks/pre-commit; then
    print_pass 5 ".git/hooks/pre-commit references both configs"
  else
    print_fail 5 ".git/hooks/pre-commit does not reference both configs."
  fi
}

# CHECK 6: pre-commit run --all-files exits 0 for BOTH configs
check_6() {
  if pre-commit run --all-files --config=.pre-commit-config.yaml >/tmp/pc_py.log 2>&1; then
    if pre-commit run --all-files --config=.pre-commit-config-ts.yaml >/tmp/pc_ts.log 2>&1; then
      print_pass 6 "pre-commit run --all-files passes for both configs"
    else
      print_fail 6 "TS pre-commit failed. See /tmp/pc_ts.log"
    fi
  else
    print_fail 6 "Python pre-commit failed. See /tmp/pc_py.log"
  fi
}

# CHECK 7: validate-pr-title job in CI
check_7() {
  local ci_file=".github/workflows/ci.yml"
  if [ -f "$ci_file" ] && grep -q 'validate-pr-title:' "$ci_file"; then
    print_pass 7 "validate-pr-title job present in CI workflow"
  else
    print_fail 7 "validate-pr-title job missing from CI workflow."
  fi
}

# CHECK 8: validate-branch-name job in CI
check_8() {
  local ci_file=".github/workflows/ci.yml"
  if [ -f "$ci_file" ] && grep -q 'validate-branch-name:' "$ci_file"; then
    print_pass 8 "validate-branch-name job present in CI workflow"
  else
    print_fail 8 "validate-branch-name job missing from CI workflow."
  fi
}

# CHECK 9: Branch protection includes the new validation jobs
check_9() {
  local owner repo protection
  owner=$(gh repo view --json owner -q '.owner.login' 2>/dev/null) || true
  repo=$(gh repo view --json name -q '.name' 2>/dev/null) || true
  if [ -z "$owner" ] || [ -z "$repo" ]; then
    print_pending 9 "Cannot query branch protection (no gh/repo)."
    return
  fi
  protection=$(gh api "repos/${owner}/${repo}/branches/${DEFAULT_BRANCH}/protection/required_status_checks" -q '.contexts[]' 2>/dev/null) || true
  if [ -z "$protection" ]; then
    print_fail 9 "No required status checks on ${DEFAULT_BRANCH}."
    return
  fi
  local missing=""
  echo "$protection" | grep -qF "validate-pr-title" || missing="${missing} validate-pr-title"
  echo "$protection" | grep -qF "validate-branch-name" || missing="${missing} validate-branch-name"
  if [ -z "$missing" ]; then
    print_pass 9 "Branch protection requires validate-pr-title and validate-branch-name"
  else
    print_fail 9 "Branch protection missing required checks:${missing}"
  fi
}

# CHECK 10: Handshake commit with [mault-step6] marker exists in history
check_10() {
  if git log --all --grep='\[mault-step6\]' --oneline | head -1 | grep -q .; then
    local sha
    sha=$(git log --all --grep='\[mault-step6\]' -1 --format='%h')
    print_pass 10 "Handshake commit found (${sha})"
  else
    print_fail 10 "No commit with [mault-step6] marker found."
  fi
}

# CHECK 11: Pre-commit manifest exists
check_11() {
  if [ -f ".mault/pre-commit-manifest.json" ]; then
    print_pass 11 ".mault/pre-commit-manifest.json present"
  else
    print_fail 11 ".mault/pre-commit-manifest.json missing."
  fi
}

# CHECK 12: Handshake issue exists
check_12() {
  if ! command -v gh >/dev/null 2>&1; then
    print_pending 12 "gh not available."
    return
  fi
  local url
  url=$(gh issue list --search "[MAULT] Production Readiness: Step 6" --json url -q '.[0].url' 2>/dev/null) || true
  if [ -z "$url" ]; then
    url=$(gh issue list --state closed --search "[MAULT] Production Readiness: Step 6" --json url -q '.[0].url' 2>/dev/null) || true
  fi
  if [ -n "$url" ]; then
    print_pass 12 "Handshake issue: ${url}"
  else
    print_pending 12 "No handshake issue found."
  fi
}

check_1
check_2
check_3
check_4
check_5
check_6
check_7
check_8
check_9
check_10
check_11
check_12

echo ""
echo "========================================"
echo "  PASS: ${PASS_COUNT}/${TOTAL_CHECKS}  FAIL: ${FAIL_COUNT}/${TOTAL_CHECKS}  PENDING: ${PENDING_COUNT}/${TOTAL_CHECKS}"
echo "========================================"

if [ "$FAIL_COUNT" -eq 0 ] && [ "$PENDING_COUNT" -eq 0 ]; then
  write_proof_file
  echo "ALL CHECKS PASSED. Step 6 Pre-commit Hooks complete."
  exit 0
elif [ "$FAIL_COUNT" -gt 0 ]; then
  rm -f "$PROOF_FILE"
  echo "${FAIL_COUNT} check(s) FAILED. Fix and re-run."
  exit 1
else
  rm -f "$PROOF_FILE"
  echo "${PENDING_COUNT} check(s) PENDING."
  exit 1
fi
