# Harness Factory - Commands Reference Card

Quick reference for all common commands. Print this or bookmark it!

---

## 🚀 Deployment

```bash
# Full deployment (tests → build → deploy)
./deploy.sh --full

# Just run tests
./deploy.sh --test

# Just build Docker image
./deploy.sh --build

# Deploy to Kubernetes
./deploy.sh --deploy-k8s

# Setup ArgoCD
./deploy.sh --argocd

# Deploy via ArgoCD GitOps
./deploy.sh --deploy-argocd

# Verify deployment
./deploy.sh --verify
```

---

## 🧪 Testing

```bash
# Run all tests (400+)
npm test

# Run specific component tests
npm test -- ai/brain-wiki/tests/

# Run tests matching pattern
npm test -- --testNamePattern="Data Ingestion"

# Watch mode (re-run on file changes)
npm test -- --watch

# Coverage report
npm test -- --coverage

# Coverage for specific component
npm test -- --coverage ai/brain-wiki
```

---

## 🐳 Docker

```bash
# Build image
docker build -t harness-factory:latest .

# Build with no cache
docker build --no-cache -t harness-factory:latest .

# View images
docker images | grep tsvai

# Run container locally
docker run -p 3000:3000 -p 3001:3001 harness-factory:latest

# View running containers
docker ps | grep tsvai

# View container logs
docker logs <container-id>

# Stop container
docker stop <container-id>
```

---

## ☸️ Kubernetes - Deployment

```bash
# Create namespace
kubectl create namespace tsvai

# Create ConfigMap
kubectl apply -f k8s/configmap.yaml

# Deploy application
kubectl apply -f k8s/deployment.yaml

# Deploy services
kubectl apply -f k8s/service.yaml

# Deploy everything
kubectl apply -f k8s/

# Delete deployment
kubectl delete -f k8s/
```

---

## ☸️ Kubernetes - Monitoring

```bash
# View all pods
kubectl get pods -n harness-factory

# Watch pods (live updates)
kubectl get pods -n harness-factory -w

# View services
kubectl get svc -n harness-factory

# View deployments
kubectl get deployments -n harness-factory

# Check rollout status
kubectl rollout status deployment/harness-factory -n harness-factory

# View pod details
kubectl describe pod <pod-name> -n harness-factory

# View deployment details
kubectl describe deployment harness-factory -n harness-factory
```

---

## ☸️ Kubernetes - Logs & Debugging

```bash
# View logs from all pods
kubectl logs -n harness-factory -l app=harness-factory -f

# View logs from specific pod
kubectl logs -n harness-factory <pod-name> -f

# View previous logs (if crashed)
kubectl logs -n harness-factory <pod-name> --previous

# View tail of logs
kubectl logs -n harness-factory <pod-name> --tail=50

# Get shell access to pod
kubectl exec -it -n harness-factory <pod-name> -- /bin/sh

# Run command in pod
kubectl exec -n harness-factory <pod-name> -- npm test

# Copy file from pod
kubectl cp tsvai/<pod-name>:/path/to/file ./local/file

# View recent events
kubectl get events -n harness-factory --sort-by='.lastTimestamp'
```

---

## ☸️ Kubernetes - Port Forward

```bash
# Forward API (port 3000)
kubectl port-forward -n harness-factory svc/harness-factory-api 3000:3000 &

# Forward Dashboard (port 3001)
kubectl port-forward -n harness-factory svc/tsvai-dashboard 3001:3001 &

# Forward to specific pod
kubectl port-forward -n harness-factory <pod-name> 3000:3000

# Kill all port-forwards
pkill -f "port-forward"

# List active port-forwards
ps aux | grep port-forward
```

---

## ☸️ Kubernetes - Scaling & Updates

```bash
# Scale to specific number of replicas
kubectl scale deployment harness-factory -n harness-factory --replicas=5

# Restart deployment
kubectl rollout restart deployment/harness-factory -n harness-factory

# Update image
kubectl set image deployment/harness-factory \
  -n harness-factory \
  harness-factory=harness-factory:v1.1

# Watch rollout progress
kubectl rollout status deployment/harness-factory -n harness-factory -w

# Rollback to previous version
kubectl rollout undo deployment/harness-factory -n harness-factory
```

---

## 🔍 Git & Code Management

```bash
# See who's working where
cat AGENTS.md

# Register yourself
vim AGENTS.md
# Add your row
git add AGENTS.md
git commit -m "chore: register alice-smith working on brain-wiki"
git push origin main

# Create feature branch
git checkout -b feature/your-feature-name

# View changes
git status

# Add changes
git add ai/component/src/file.js

# Commit
git commit -m "feat: describe your feature"

# Push branch
git push origin feature/your-feature-name

# Pull latest
git pull origin main

# See commit history
git log --oneline -10
```

---

## 📡 API Testing

```bash
# Health check
curl http://localhost:3000/api/health | jq

# System status
curl http://localhost:3000/api/status | jq

# List workflows
curl http://localhost:3000/api/workflows | jq

# Execute Data Ingestion
curl -X POST http://localhost:3000/api/workflows/execute \
  -H "Content-Type: application/json" \
  -d '{"workflow":"data-ingestion","inputs":{"pipelineId":"test"}}'

# Execute Agent Learning
curl -X POST http://localhost:3000/api/workflows/execute \
  -H "Content-Type: application/json" \
  -d '{"workflow":"agent-learning","inputs":{"tasks":[{"id":"task1"}]}}'

# Execute Decision Making
curl -X POST http://localhost:3000/api/workflows/execute \
  -H "Content-Type: application/json" \
  -d '{"workflow":"decision-making","inputs":{"question":"Should we scale?","minConfidence":0.8}}'

# Execute Integration Test
curl -X POST http://localhost:3000/api/workflows/execute \
  -H "Content-Type: application/json" \
  -d '{"workflow":"integration-test","inputs":{}}'

# Get event log
curl http://localhost:3000/api/events?limit=50 | jq

# Get diagnostics
curl http://localhost:3000/api/diagnostics | jq
```

---

## 📊 Resource Monitoring

```bash
# Check resource usage (requires metrics-server)
kubectl top pods -n harness-factory

# Check CPU usage per pod
kubectl top pods -n harness-factory --sort-by=cpu

# Check memory usage per pod
kubectl top pods -n harness-factory --sort-by=memory

# View resource requests/limits
kubectl describe deployment harness-factory -n harness-factory | grep -A 10 "Resources"

# Check node resources
kubectl top nodes
```

---

## 🔧 ArgoCD Commands

```bash
# Install ArgoCD
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Port-forward ArgoCD UI
kubectl port-forward svc/argocd-server -n argocd 8080:443 &

# Get admin password
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d

# Add repository
argocd repo add https://github.com/Harness FactorySolutions/harness-factory

# Create application
kubectl apply -f k8s/argocd-application.yaml

# Get application status
argocd app get harness-factory

# Sync application
argocd app sync harness-factory

# Wait for sync
argocd app wait harness-factory --sync

# List all applications
argocd app list
```

---

## 🔍 Code Search

```bash
# Find files by pattern
find ai -name "*.js" | grep semantic

# Search for text in files
grep -r "knowledge" ai/brain-wiki/src/

# Find TODO comments
grep -r "TODO\|FIXME" ai/

# Find specific function
grep -n "function learn" ai/brain-wiki/src/

# Count lines of code
find ai -name "*.js" -not -path "*/node_modules/*" | xargs wc -l | tail -1

# List all test files
find ai -name "*.test.js"
```

---

## 📂 File Management

```bash
# View directory structure
tree -L 2 ai/

# List files with details
ls -lah ai/brain-wiki/

# Count files in directory
find ai/brain-wiki -type f | wc -l

# Find large files
find ai -size +1M -type f

# Check disk usage
du -sh ai/

# Clean npm cache
npm cache clean --force

# Remove node_modules
rm -rf node_modules
```

---

## 🔄 Helpful Aliases

Add these to your `~/.bashrc` or `~/.zshrc`:

```bash
# Harness shortcuts
alias h-test='npm test'
alias h-deploy='./deploy.sh --full'
alias h-pods='kubectl get pods -n harness-factory'
alias h-logs='kubectl logs -n harness-factory -l app=harness-factory -f'
alias h-health='curl http://localhost:3000/api/health | jq'
alias h-status='curl http://localhost:3000/api/status | jq'
alias h-forward='kubectl port-forward -n harness-factory svc/harness-factory-api 3000:3000 & kubectl port-forward -n harness-factory svc/tsvai-dashboard 3001:3001 &'

# Kubernetes shortcuts
alias k=kubectl
alias kg='kubectl get'
alias kgp='kubectl get pods -n harness-factory'
alias kgd='kubectl get deployment -n harness-factory'
alias kgs='kubectl get svc -n harness-factory'
alias kd='kubectl describe'
alias kdp='kubectl describe pod -n harness-factory'
```

---

## ⚡ One-Liners

```bash
# Deploy and forward immediately
./deploy.sh --deploy-k8s && sleep 5 && kubectl port-forward -n harness-factory svc/harness-factory-api 3000:3000 &

# Run all tests and show coverage
npm test -- --coverage

# Test specific workflow
npm test -- --testNamePattern="Data Ingestion"

# View logs and follow
kubectl logs -n harness-factory -l app=harness-factory -f

# Get all pod names
kubectl get pods -n harness-factory -o name

# Delete all pods and redeploy
kubectl delete pods -n harness-factory -l app=harness-factory && kubectl apply -f k8s/deployment.yaml

# Scale and monitor
kubectl scale deployment harness-factory -n harness-factory --replicas=5 && kubectl get pods -n harness-factory -w

# Test workflow with pretty output
curl -s http://localhost:3000/api/workflows | jq '.'

# Get last 10 workflow executions
curl -s http://localhost:3000/api/events | jq '.events[-10:] | .[] | {type, timestamp: .timestamp}'
```

---

## 📋 Troubleshooting Quick Commands

```bash
# Something broken? Try these in order:

# 1. Check if pods are running
kubectl get pods -n harness-factory

# 2. Check pod logs
kubectl logs -n harness-factory <pod-name>

# 3. Check pod events
kubectl describe pod -n harness-factory <pod-name>

# 4. Check API health
curl http://localhost:3000/api/health

# 5. Check diagnostics
curl http://localhost:3000/api/diagnostics | jq

# 6. Restart deployment
kubectl rollout restart deployment/harness-factory -n harness-factory

# 7. Check all events
kubectl get events -n harness-factory --sort-by='.lastTimestamp'

# 8. Check resource usage
kubectl top pods -n harness-factory

# 9. Redeploy from scratch
kubectl delete -f k8s/ && kubectl apply -f k8s/

# 10. Check logs in real-time
kubectl logs -n harness-factory -l app=harness-factory -f
```

---

## 💾 Backup & Recovery

```bash
# Backup brain-wiki data
kubectl exec -n harness-factory <pod-name> -- tar -czf /tmp/brain-wiki.tar.gz /data/brain-wiki

# Copy backup from pod
kubectl cp tsvai/<pod-name>:/tmp/brain-wiki.tar.gz ./brain-wiki-backup.tar.gz

# List backups
ls -lh *backup*.tar.gz

# Restore from backup
kubectl cp ./brain-wiki-backup.tar.gz tsvai/<pod-name>:/tmp/
kubectl exec -n harness-factory <pod-name> -- tar -xzf /tmp/brain-wiki-backup.tar.gz -C /
```

---

## 🎯 Daily Development Workflow

```bash
# Morning: Pull latest and run tests
git checkout main && git pull origin main && npm test

# During day: Work on feature
git checkout -b feature/my-feature
# ... make changes ...
npm test

# Before committing: Run full test suite
npm test

# Commit changes
git commit -m "feat: describe feature"

# Push to GitHub
git push origin feature/my-feature

# Evening: Deploy staging
./deploy.sh --deploy-k8s

# Monitor
kubectl logs -n harness-factory -l app=harness-factory -f
```

---

## 📞 Emergency Commands

```bash
# Pod is in crash loop? Check logs
kubectl logs -n harness-factory <pod-name> --previous

# Can't connect to API? Kill and restart port-forward
pkill -f "port-forward"
kubectl port-forward -n harness-factory svc/harness-factory-api 3000:3000

# Out of disk space? Clean up
docker system prune -a
rm -rf node_modules
npm install

# Running out of memory? Scale down
kubectl scale deployment harness-factory -n harness-factory --replicas=1

# Deployment stuck? Force restart
kubectl rollout restart deployment/harness-factory -n harness-factory
kubectl wait --for=condition=available --timeout=300s deployment/harness-factory -n harness-factory

# Everything broken? Full redeploy
kubectl delete ns tsvai
./deploy.sh --full
```

---

**Print this page and keep it handy!** 📋

Save as bookmark: `harness-factory/COMMANDS_REFERENCE.md`

**Version**: 1.0.0  
**Last Updated**: 2026-08-29
