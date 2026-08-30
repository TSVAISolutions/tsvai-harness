# Harness Factory - Onboarding Guide for New Starters

Welcome to the Harness Factory team! This guide will help you get up and running in 30 minutes.

---

## 🎯 Day 1: Setup & First Run

### 1.1 Clone Repository

```bash
# Clone with all submodules
git clone --recursive https://github.com/Harness FactorySolutions/harness-factory.git
cd harness-factory

# Verify submodules are loaded
git submodule status
# Should show multiple submodules with commit hashes
```

### 1.2 Install Prerequisites

Check you have all required tools:

```bash
# Node.js (v18+)
node --version

# npm (v9+)
npm --version

# Docker Desktop (with Kubernetes enabled)
docker --version
kubectl version --client

# Git
git --version
```

**Not installed?** Install here:
- **Node.js**: https://nodejs.org/ (v18 LTS recommended)
- **Docker Desktop**: https://www.docker.com/products/docker-desktop
- **kubectl**: `brew install kubectl` (macOS)

### 1.3 Install Dependencies

```bash
# Install npm packages for the harness
npm install

# Verify installation
npm list | head -20
```

### 1.4 Run Your First Test

```bash
# Run the complete test suite
npm test

# Expected output:
# ✓ 400+ tests pass
# ✓ >90% code coverage
```

**First test failed?** See [Troubleshooting](#troubleshooting) below.

---

## 🏗️ Understanding the Architecture

### 2.1 The 7 Core Components

```
harness-factory/ai/
├── plugin/              # Plugin system + skills
├── army-agents/         # Multi-agent coordination
├── brain-wiki/          # Knowledge base
├── consilient/          # Consensus + pattern mining
├── harvester/           # Data collection
├── curator/             # Quality control
└── vi-dashboard/        # Real-time visualization
```

### 2.2 Data Flow

```
External Data
    ↓
Harvester (collect)
    ↓
Curator (validate & filter)
    ↓
Brain-Wiki (learn & store)
    ↓
Consilient (mine patterns)
    ↓
VI-Dashboard (visualize)
```

### 2.3 Component Details

| Component | Purpose | Key Files |
|-----------|---------|-----------|
| **Plugin** | Extensible plugin framework | `src/plugin-system.js`, `src/plugin-registry.js` |
| **Army-Agents** | Task execution coordination | `src/army-agents.js`, `src/agent-pool.js` |
| **Brain-Wiki** | Knowledge storage & search | `src/knowledge-store.js`, `src/semantic-search.js` |
| **Consilient** | Pattern discovery & consensus | `src/pattern-miner.js`, `src/conflict-resolver.js` |
| **Harvester** | Multi-source data collection | `src/data-collector.js`, `src/harvester.js` |
| **Curator** | Quality validation & filtering | `src/quality-validator.js`, `src/filter-engine.js` |
| **VI-Dashboard** | Real-time monitoring UI | `src/dashboard-server.js`, `public/index.html` |

### 2.4 Integration Layer

```
ai/integration/
├── src/harness-orchestrator.js    # Central coordinator
├── src/e2e-workflows.js           # 6 complete workflows
└── tests/e2e.test.js              # Integration tests
```

---

## 🚀 Day 1 Complete: Deploy Locally

### 3.1 Deploy to Local Kubernetes

```bash
# One-command full deployment
./deploy.sh --full

# This runs:
# 1. Prerequisites check
# 2. Test suite (400+ tests)
# 3. Docker image build
# 4. Kubernetes deployment
# 5. Verification

# Should complete in ~3-5 minutes
```

### 3.2 Access the System

```bash
# API (keep terminal open)
kubectl port-forward -n harness-factory svc/harness-factory-api 3000:3000 &

# Dashboard (new terminal)
kubectl port-forward -n harness-factory svc/tsvai-dashboard 3001:3001 &

# Test API
curl http://localhost:3000/api/health | jq

# Open Dashboard
# http://localhost:3001
```

### 3.3 Verify Everything Works

```bash
# Check health
curl http://localhost:3000/api/health | jq '.overall'
# Expected: "healthy"

# Run a workflow
curl -X POST http://localhost:3000/api/workflows/execute \
  -H "Content-Type: application/json" \
  -d '{"workflow":"integration-test","inputs":{}}' | jq '.success'
# Expected: true
```

✅ **Congratulations!** System is running!

---

## 📚 Day 2-3: Understanding the Codebase

### 4.1 Project Structure Overview

```
harness-factory/
├── QUICK_START.md                 ← Read this first
├── TESTING_GUIDE.md               ← Testing procedures
├── KUBERNETES_DEPLOYMENT.md       ← K8s guide
├── HARNESS_COMPLETION_SUMMARY.md  ← Project overview
├── deploy.sh                      ← Deployment script
├── Dockerfile                     ← Container definition
│
├── ai/                            ← Core components
│   ├── plugin/                    ← Plugin system
│   ├── army-agents/               ← Agent coordination
│   ├── brain-wiki/                ← Knowledge base
│   ├── consilient/                ← Consensus engine
│   ├── harvester/                 ← Data collection
│   ├── curator/                   ← Quality control
│   ├── vi-dashboard/              ← Visualization
│   └── integration/               ← Orchestration
│
├── k8s/                           ← Kubernetes manifests
├── submodules/                    ← External repos
└── context/                       ← Reference docs
```

### 4.2 Key Documentation

**Start with these in order:**

1. **QUICK_START.md** (5 min)
   - Overview of deployment options
   - Basic commands

2. **TESTING_GUIDE.md** (15 min)
   - How to run tests
   - Testing procedures
   - Test coverage

3. **HARNESS_COMPLETION_SUMMARY.md** (20 min)
   - Complete architecture overview
   - All 10 phases explained
   - 14,066+ lines of code breakdown

4. **KUBERNETES_DEPLOYMENT.md** (30 min)
   - Manual K8s deployment
   - GitOps with ArgoCD
   - Troubleshooting guide

5. **Component READMEs** (per component)
   - `ai/brain-wiki/README.md`
   - `ai/consilient/README.md`
   - `ai/harvester/README.md`
   - etc.

### 4.3 Code Navigation Examples

**Find where something is implemented:**

```bash
# Where is semantic search implemented?
grep -r "semantic" ai/brain-wiki/src/

# Where are workflows defined?
grep -r "dataIngestionWorkflow" ai/integration/

# Where is quality validation?
grep -r "qualityValidator" ai/curator/

# Find test files
find ai -name "*.test.js"

# View specific component
cat ai/brain-wiki/README.md
```

### 4.4 Run Component Tests

```bash
# Test specific component
npm test -- ai/brain-wiki/tests/brain-wiki.test.js

# View test file for examples
cat ai/brain-wiki/tests/brain-wiki.test.js

# Run with coverage
npm test -- --coverage ai/brain-wiki
```

---

## 🔧 Day 3-5: Make Your First Contribution

### 5.1 Setup for Development

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes in your component
cd ai/component-name
# Edit files...

# Run tests to verify
npm test -- ai/component-name/tests/
```

### 5.2 Example: Fix a Bug in Brain-Wiki

```bash
# 1. Navigate to component
cd ai/brain-wiki

# 2. Read the code
cat src/knowledge-store.js | head -50

# 3. Find the bug
grep -n "TODO\|FIXME\|BUG" src/

# 4. Write test first
cat tests/brain-wiki.test.js

# 5. Fix the bug
vim src/knowledge-store.js

# 6. Run tests
npm test -- tests/brain-wiki.test.js

# 7. Verify no regressions
npm test
```

### 5.3 Example: Add a New Feature

```bash
# 1. Create feature branch
git checkout -b feature/add-search-filter

# 2. Write test first
cat ai/brain-wiki/tests/brain-wiki.test.js
# Add test case...

# 3. Implement feature
vim ai/brain-wiki/src/semantic-search.js

# 4. Run tests
npm test -- ai/brain-wiki

# 5. Check coverage
npm test -- --coverage ai/brain-wiki

# 6. Commit
git add .
git commit -m "feat: add advanced search filtering to brain-wiki"

# 7. Create PR
git push origin feature/add-search-filter
# Create PR on GitHub
```

### 5.4 Register in AGENTS.md

When starting work, register yourself:

```bash
# Edit AGENTS.md
vim AGENTS.md

# Add your row (your-id can be your name or ID)
# Example:
# | alice-smith | ai/brain-wiki | Implementing semantic search improvements | 2026-08-29T09:00:00Z | 2026-08-29T14:30:00Z |

# Commit
git add AGENTS.md
git commit -m "chore: register alice-smith working on brain-wiki"
git push origin main

# When done, remove your row and commit
```

---

## 📖 Documentation to Read

### Essential Reading

| Document | Time | Why |
|----------|------|-----|
| QUICK_START.md | 5 min | Get system running |
| TESTING_GUIDE.md | 15 min | Understand testing |
| HARNESS_COMPLETION_SUMMARY.md | 20 min | See complete picture |
| KUBERNETES_DEPLOYMENT.md | 30 min | Deploy and manage |
| CLAUDE.md | 10 min | Project rules |

### Component Documentation

Read the README for your component:

```bash
# Examples:
cat ai/brain-wiki/README.md
cat ai/curator/README.md
cat ai/harvester/README.md
```

### API Documentation

```bash
# Integration layer
cat ai/integration/README.md
cat ai/integration/DEPLOYMENT.md
cat ai/integration/PHASE_10_INTEGRATION.md
```

---

## 🧪 Testing Guide for New Starters

### 6.1 Run All Tests

```bash
npm test
# Expected: 400+ tests pass, >90% coverage
```

### 6.2 Run Tests for Your Component

```bash
# Replace 'brain-wiki' with your component
npm test -- ai/brain-wiki/tests/

# Or watch mode (re-runs on changes)
npm test -- ai/brain-wiki/tests/ --watch
```

### 6.3 Run Specific Test

```bash
# Run one test file
npm test -- --testPathPattern="brain-wiki" --testNamePattern="learn"

# Or test specific workflow
npm test -- --testNamePattern="Data Ingestion"
```

### 6.4 Coverage Report

```bash
# Generate coverage for your component
npm test -- --coverage ai/brain-wiki

# View HTML report
open coverage/index.html
```

---

## 🚀 Common Workflows

### Workflow 1: Start Fresh Development

```bash
# 1. Pull latest main
git checkout main
git pull origin main

# 2. Create feature branch
git checkout -b feature/my-feature

# 3. Make changes
# ... edit files ...

# 4. Run tests
npm test

# 5. Commit
git add .
git commit -m "feat: describe your feature"

# 6. Push
git push origin feature/my-feature

# 7. Create PR on GitHub
```

### Workflow 2: Fix a Bug

```bash
# 1. Create bug fix branch
git checkout -b fix/bug-description

# 2. Locate bug
grep -r "problematic code" ai/

# 3. Write test that fails
# Add test to .test.js file

# 4. Fix the bug
# Edit source file

# 5. Verify test passes
npm test -- --testNamePattern="your test"

# 6. Run full test suite
npm test

# 7. Commit and push
git commit -m "fix: describe the bug fix"
git push origin fix/bug-description
```

### Workflow 3: Review Someone's Work

```bash
# 1. Checkout their branch
git checkout feature/their-feature

# 2. Run tests
npm test

# 3. Review code
cat ai/component/src/file.js

# 4. Try the feature
curl http://localhost:3000/api/health

# 5. Comment on PR with feedback
```

---

## 🔍 Troubleshooting

### Issue: Tests fail on first run

```bash
# Solution 1: Clean install
rm -rf node_modules package-lock.json
npm install
npm test

# Solution 2: Check Node version
node --version  # Should be v18+

# Solution 3: Check Jest
npm list jest
```

### Issue: Docker image won't build

```bash
# Clean and rebuild
docker system prune -a
./deploy.sh --build

# Or manually
docker build --no-cache -t harness-factory:latest .
```

### Issue: Pods won't start on Kubernetes

```bash
# Check pod logs
kubectl logs -n harness-factory <pod-name>

# Check pod description
kubectl describe pod -n harness-factory <pod-name>

# Check events
kubectl get events -n harness-factory --sort-by='.lastTimestamp'

# Redeploy
./deploy.sh --deploy-k8s
```

### Issue: Can't connect to API

```bash
# Verify port-forward is running
ps aux | grep port-forward

# Start port-forward
kubectl port-forward -n harness-factory svc/harness-factory-api 3000:3000 &

# Test connectivity
curl http://localhost:3000/api/health
```

### Issue: High memory usage

```bash
# Check resource usage
kubectl top pods -n harness-factory

# Check pod logs for errors
kubectl logs -n harness-factory <pod-name> --tail=100

# Scale down replicas
kubectl scale deployment harness-factory -n harness-factory --replicas=1
```

---

## 👥 Team Information

### Component Owners

Ask these people for component-specific questions:

```
Brain-Wiki (Knowledge)     → Check ai/brain-wiki/README.md
Consilient (Patterns)      → Check ai/consilient/README.md
Harvester (Data)           → Check ai/harvester/README.md
Curator (Quality)          → Check ai/curator/README.md
Army-Agents (Tasks)        → Check ai/army-agents/README.md
VI-Dashboard (Visuals)     → Check ai/vi-dashboard/README.md
Plugin (Extensions)        → Check ai/plugin/README.md
Integration (Orchestration) → Check ai/integration/README.md
```

### Communication

- **Questions?** Check component README first
- **Issues?** Report on GitHub with details
- **Coordination?** Update AGENTS.md when working
- **Sync?** Check AGENTS.md before touching shared code

---

## ✅ First Week Checklist

### Day 1
- [ ] Clone repository with submodules
- [ ] Install all prerequisites
- [ ] Run `npm install`
- [ ] Run `npm test` (all pass)
- [ ] Deploy with `./deploy.sh --full`
- [ ] Access API and dashboard

### Day 2-3
- [ ] Read HARNESS_COMPLETION_SUMMARY.md
- [ ] Read TESTING_GUIDE.md
- [ ] Understand project architecture
- [ ] Explore all 7 components
- [ ] Read component READMEs

### Day 3-5
- [ ] Create feature branch
- [ ] Make first code change
- [ ] Write or update tests
- [ ] Verify tests pass
- [ ] Create PR and get review
- [ ] Deploy to staging

### Week 2+
- [ ] Contribute regularly
- [ ] Review teammates' code
- [ ] Improve documentation
- [ ] Optimize performance
- [ ] Add new features

---

## 🎓 Learning Path

### Beginner (Week 1)
1. Run tests and deployment
2. Understand architecture
3. Read component docs
4. Make small bug fixes

### Intermediate (Week 2-3)
1. Add new features to existing component
2. Improve test coverage
3. Optimize performance
4. Review code changes

### Advanced (Week 4+)
1. Design new components
2. Refactor architecture
3. Lead technical initiatives
4. Mentor new starters

---

## 📞 Getting Help

### Quick Questions
- Check component README
- Search code: `grep -r "your-query" ai/`
- Read test files for examples

### Stuck?
- Read relevant documentation file
- Check TROUBLESHOOTING section above
- Review similar test cases
- Ask on team Slack

### Code Questions
- Check component source code
- Run the code locally
- Debug with `console.log` or debugger
- Test your understanding

---

## 🎯 Next Steps

1. **Run the system**: `./deploy.sh --full` (5 min)
2. **Explore code**: `cd ai/brain-wiki && cat README.md` (10 min)
3. **Run tests**: `npm test` (5 min)
4. **Make a change**: Fix something small (30 min)
5. **Create a PR**: Submit your first contribution (15 min)

---

## 📚 Reference

| Resource | Location |
|----------|----------|
| Quick Start | QUICK_START.md |
| Testing | TESTING_GUIDE.md |
| Kubernetes | KUBERNETES_DEPLOYMENT.md |
| Project Overview | HARNESS_COMPLETION_SUMMARY.md |
| Project Rules | CLAUDE.md |
| Agent Coordination | AGENTS.md |

---

**Welcome to the team! 🎉**

You now have everything you need to:
- ✅ Understand the system
- ✅ Run it locally
- ✅ Write tests
- ✅ Make contributions
- ✅ Deploy changes

If you get stuck, check the docs, read the code, and ask on Slack. Happy coding!

**Version**: 1.0.0  
**Last Updated**: 2026-08-29
