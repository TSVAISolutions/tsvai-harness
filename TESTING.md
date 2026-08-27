# TSVAI Harness Testing Guide

Complete testing guide for the TSVAI Harness monorepo, workflows, and releases.

## Quick Start Testing

### 1. Clone & Setup

```bash
git clone --recursive https://github.com/TSVAISolutions/tsvai-harness.git
cd tsvai-harness
bash scripts/setup.sh
```

### 2. Test Local Plugin Build

```bash
# Setup plugin
make plugin-setup

# Build plugin
make plugin-build

# Verify output
ls -lh ai/plugin/tsvai-plugin.zip
ls -lh ai/plugin/tsvai-dev-plugin.zip
```

✅ **Expected:** Plugin zips created in `ai/plugin/`

---

## Testing GitHub Actions Workflows

### CLI Workflow Test

```bash
# Trigger CLI build
gh workflow run build-cli.yml -R TSVAISolutions/cli

# Monitor progress
gh run list -R TSVAISolutions/cli -w "Build CLI" --limit 1

# Watch logs
gh run view <run-id> -R TSVAISolutions/cli --log

# Verify release
gh release list -R TSVAISolutions/cli --limit 1
gh release download cli-v1.104.0 --repo TSVAISolutions/cli --pattern "tsvai.*"
```

✅ **Expected:** 
- Workflow completes in ~14-18 seconds
- Release `cli-vX.X.X` created
- Files: `tsvai.mjs` (5.5 MB) + `tsvai.mjs.sha256`

### Plugin Workflow Test

```bash
# Trigger plugin build
gh workflow run build-plugin.yml -R TSVAISolutions/tsvai-harness

# Monitor progress
gh run list -R TSVAISolutions/tsvai-harness -w "Build Plugin" --limit 1

# Watch logs
gh run view <run-id> -R TSVAISolutions/tsvai-harness --log

# Verify release
gh release list -R TSVAISolutions/tsvai-harness --limit 1
gh release download plugin-v1.0.0 --repo TSVAISolutions/tsvai-harness --pattern "tsvai-*.zip"
```

✅ **Expected:**
- Workflow completes in ~12-15 seconds
- Downloads CLI from releases (no auth)
- Release `plugin-vX.X.X` created
- Files: `tsvai-plugin.zip` + `tsvai-dev-plugin.zip`

### Cleanup Agents Workflow Test

```bash
# Add a test entry to AGENTS.md
echo "| test-agent | ai/plugin | test task | 2026-08-27T10:00:00Z | 2026-08-27T10:00:00Z |" >> AGENTS.md
git add AGENTS.md
git commit -m "test: add test agent entry"
git push

# Trigger cleanup (or wait 6 hours for cron)
gh workflow run cleanup-agents.yml -R TSVAISolutions/tsvai-harness

# Verify old entries removed
gh run view <run-id> -R TSVAISolutions/tsvai-harness --log
git pull
cat AGENTS.md
```

✅ **Expected:** Entries >1 hour old automatically removed

---

## Testing Release Download

### Test CLI Download (like harness does)

```bash
# This is what plugin workflow does
cd /tmp
gh release download cli-v1.104.0 --repo TSVAISolutions/cli --pattern "tsvai.mjs"

# Verify
ls -lh tsvai.mjs
file tsvai.mjs  # Should be: ASCII text (Node.js)
```

✅ **Expected:** Downloads successfully, no auth needed

### Test Plugin Download (like users do)

```bash
cd /tmp
gh release download plugin-v1.0.0 --repo TSVAISolutions/tsvai-harness --pattern "tsvai-plugin.zip"

# Verify
ls -lh tsvai-plugin.zip
unzip -l tsvai-plugin.zip | head -20
```

✅ **Expected:** Plugin zip with structure:
```
.claude-plugin/plugin.json
CLAUDE.md
skills/
  analytics/
  text-analysis/
  ...
```

---

## Testing Agent Coordination

### Test AGENTS.md Registration

```bash
# 1. Read current status
cat AGENTS.md

# 2. Add yourself
echo "| my-agent | ai/plugin | testing | $(date -u +'%Y-%m-%dT%H:%M:%SZ') | $(date -u +'%Y-%m-%dT%H:%M:%SZ') |" >> AGENTS.md

# 3. Commit
git add AGENTS.md
git commit -m "test: register agent"
git push

# 4. Verify in GitHub
gh api repos/TSVAISolutions/tsvai-harness/contents/AGENTS.md | jq -r '.content' | base64 -d | grep my-agent
```

✅ **Expected:** Entry appears in AGENTS.md

---

## Testing Domains Setup

### Test Frontend Domain

```bash
# List domains
make domains

# Setup frontend
make setup frontend

# Check status
make status frontend

# Update
make update frontend
```

✅ **Expected:**
- `submodules/frontend/pms-frontend/` checked out
- `submodules/frontend/admin-dashboard/` checked out

### Test Backend Domain

```bash
make setup backend
ls -la submodules/backend/
make status backend
```

✅ **Expected:** `submodules/backend/pms-backend/` ready

### Test Platform Domain

```bash
make setup platform
ls -la submodules/platform/
make status platform
```

✅ **Expected:** `submodules/platform/pms-platform/` ready

---

## Testing Documentation

### Verify Key Documents

```bash
# Check all required docs exist
ls -lh CLAUDE.md CONTEXT.md AGENTS.md README.md
ls -lh docs/onboarding.md docs/vega-inheritance.md
ls -lh .claude/rules/README.md

# Read core docs
cat CONTEXT.md | head -30
cat CLAUDE.md | grep "MANDATORY" -A 5
```

✅ **Expected:** All docs present and readable

---

## Full Integration Test

Complete end-to-end test:

```bash
#!/bin/bash
set -e

echo "🧪 TSVAI Harness Full Integration Test"
echo ""

# 1. Clone
echo "1. Cloning..."
cd /tmp && rm -rf tsvai-test && git clone --recursive https://github.com/TSVAISolutions/tsvai-harness.git tsvai-test
cd tsvai-test

# 2. Setup
echo "2. Setting up..."
bash scripts/setup.sh

# 3. Local build
echo "3. Building plugin locally..."
make plugin-build
test -f ai/plugin/tsvai-plugin.zip && echo "✅ Plugin built" || exit 1

# 4. Test download
echo "4. Testing CLI download..."
cd /tmp && rm -f tsvai.mjs
gh release download cli-v1.104.0 --repo TSVAISolutions/cli --pattern "tsvai.mjs"
test -f tsvai.mjs && echo "✅ CLI downloaded" || exit 1

# 5. Verify domains
echo "5. Checking domains..."
cd /tmp/tsvai-test
make domains | grep -q "frontend" && echo "✅ Domains configured" || exit 1

# 6. Test registration
echo "6. Testing AGENTS.md..."
echo "| test-$(date +%s) | ai/plugin | test | $(date -u +'%Y-%m-%dT%H:%M:%SZ') | $(date -u +'%Y-%m-%dT%H:%M:%SZ') |" >> AGENTS.md
git add AGENTS.md && git commit -m "test: agent registration" && git push
echo "✅ AGENTS.md works"

# 7. Verify workflows
echo "7. Checking workflows..."
test -f .github/workflows/build-plugin.yml && echo "✅ build-plugin.yml" || exit 1
test -f .github/workflows/cleanup-agents.yml && echo "✅ cleanup-agents.yml" || exit 1

echo ""
echo "🎉 ALL TESTS PASSED!"
echo "✅ Clone successful"
echo "✅ Setup successful"
echo "✅ Plugin build successful"
echo "✅ CLI download successful"
echo "✅ Domains configured"
echo "✅ AGENTS.md works"
echo "✅ Workflows present"
```

Run this:
```bash
bash full-test.sh
```

---

## Troubleshooting Tests

### If clone fails:
```bash
# Check git config
git config --global http.sslverify false
# Or use SSH
git clone --recursive git@github.com:TSVAISolutions/tsvai-harness.git
```

### If plugin build fails:
```bash
# Check Node/Bun
bun --version
npm --version

# Reinstall
cd ai/plugin
rm -rf node_modules package-lock.json
bun install
bun run build
```

### If workflow doesn't trigger:
```bash
# Check workflow file syntax
gh workflow view build-plugin.yml -R TSVAISolutions/tsvai-harness

# Trigger manually
gh workflow run build-plugin.yml -R TSVAISolutions/tsvai-harness
```

### If release download fails:
```bash
# Check releases exist
gh release list -R TSVAISolutions/cli

# Try with token
GH_TOKEN=<your-token> gh release download cli-v1.104.0 --repo TSVAISolutions/cli --pattern "tsvai.mjs"
```

---

## Success Criteria

✅ All tests pass when:

- [x] Clone completes successfully
- [x] Setup runs without errors
- [x] Plugin builds locally
- [x] CLI downloads from releases
- [x] Workflows complete in <30 seconds
- [x] Releases have correct artifacts
- [x] AGENTS.md registration works
- [x] Domains can be setup
- [x] Documentation is complete

---

## Next Steps

Once testing passes:

1. ✅ Add yourself to AGENTS.md
2. ✅ Setup your domain: `make setup <domain>`
3. ✅ Start building features
4. ✅ Commit frequently
5. ✅ Remove yourself from AGENTS.md when done

---

**Happy testing!** 🚀
