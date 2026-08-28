# TSVAI Harness - Quick Start Guide

Get TSVAI Harness tested, built, and running on your local Kubernetes cluster in minutes.

---

## Prerequisites Checklist

```bash
# Check Docker
docker --version          # Should be Docker Desktop with K8s enabled
docker ps                 # Should work without sudo

# Check Kubernetes
kubectl cluster-info      # Should show cluster running
kubectl get nodes         # Should show at least 1 node

# Check Node.js
node --version            # v18.0.0 or higher
npm --version             # v9.0.0 or higher
```

If any are missing, install them first:
- **Docker Desktop**: https://www.docker.com/products/docker-desktop
- **kubectl**: `brew install kubectl` (macOS) or download from k8s.io
- **Node.js**: https://nodejs.org/

---

## Option 1: Automated Deployment (Recommended)

### 1.1 Run Full Deployment Script

```bash
cd /Users/kbuchepalli/tsvai-harness

# Make script executable (one time)
chmod +x deploy.sh

# Run full deployment (tests → build → deploy)
./deploy.sh --full

# Or run specific steps
./deploy.sh --test              # Just run tests
./deploy.sh --build             # Just build Docker image
./deploy.sh --deploy-k8s        # Deploy to Kubernetes
./deploy.sh --argocd            # Setup ArgoCD for GitOps
./deploy.sh --deploy-argocd     # Deploy via ArgoCD GitOps
```

### 1.2 Watch Deployment Progress

```bash
# In a new terminal, watch pods starting
kubectl get pods -n tsvai -w

# Should see:
# tsvai-harness-xxxxx   0/1   ContainerCreating
# tsvai-harness-xxxxx   1/1   Running
```

### 1.3 Verify Deployment

```bash
# Check all pods are running
kubectl get pods -n tsvai
# Expected: 2 pods in Running state

# Check services
kubectl get svc -n tsvai
# Expected: Multiple services

# Check system health
kubectl port-forward -n tsvai svc/tsvai-harness-api 3000:3000 &
curl http://localhost:3000/api/health | jq
```

### Done! ✅

Your harness is now running on Kubernetes!

---

## Option 2: Manual Step-by-Step Deployment

### Step 1: Run Tests

```bash
cd /Users/kbuchepalli/tsvai-harness

# Install dependencies
npm install

# Run all tests
npm test

# Expected output:
# Test Suites: 8 passed, 8 total
# Tests:       400+ passed, 400+ total
```

**If tests fail**, check:
- Node.js version: `node --version` (needs v18+)
- Dependencies: `npm install` (re-run if needed)
- Logs: Review npm test output carefully

### Step 2: Build Docker Image

```bash
# Build image (takes ~2-3 minutes first time)
docker build -t tsvai-harness:latest .

# Verify build succeeded
docker images | grep tsvai-harness
```

### Step 3: Create Kubernetes Namespace

```bash
# Create namespace with resource quotas
kubectl apply -f k8s/namespace.yaml

# Verify
kubectl get namespace tsvai
```

### Step 4: Deploy to Kubernetes

```bash
# Create ConfigMap
kubectl apply -f k8s/configmap.yaml

# Deploy application
kubectl apply -f k8s/deployment.yaml

# Wait for rollout (~30-60 seconds)
kubectl rollout status deployment/tsvai-harness -n tsvai
```

### Step 5: Create Services

```bash
# Create services for access
kubectl apply -f k8s/service.yaml

# Verify services
kubectl get svc -n tsvai
```

### Step 6: Access Application

```bash
# Port-forward API (keep running in terminal)
kubectl port-forward -n tsvai svc/tsvai-harness-api 3000:3000 &

# Port-forward Dashboard (new terminal)
kubectl port-forward -n tsvai svc/tsvai-dashboard 3001:3001 &

# Test API is running
curl http://localhost:3000/api/health
```

---

## Option 3: GitOps with ArgoCD

### Step 1: Install ArgoCD

```bash
# Install ArgoCD
./deploy.sh --argocd

# This will:
# 1. Create argocd namespace
# 2. Install ArgoCD components
# 3. Show admin password
```

### Step 2: Access ArgoCD UI

```bash
# Port-forward ArgoCD (in new terminal)
kubectl port-forward svc/argocd-server -n argocd 8080:443 &

# Get admin password
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d

# Access at: https://localhost:8080
# Username: admin
# Password: <from above>
```

### Step 3: Deploy via ArgoCD

```bash
# Deploy using GitOps
./deploy.sh --deploy-argocd

# Or manually
kubectl apply -f k8s/argocd-application.yaml

# Watch sync status
argocd app get tsvai-harness
```

### Step 4: Verify Deployment

```bash
# Check pods
kubectl get pods -n tsvai

# Check ArgoCD application
argocd app get tsvai-harness
```

---

## Testing the Deployment

### Health Check

```bash
# Ensure port-forward is running
kubectl port-forward -n tsvai svc/tsvai-harness-api 3000:3000 &

# Test health
curl http://localhost:3000/api/health | jq

# Expected response:
{
  "overall": "healthy",
  "components": {
    "brain-wiki": { "status": "healthy" },
    "harvester": { "status": "healthy" },
    ...
  }
}
```

### Execute Workflows

```bash
# Data Ingestion Workflow
curl -X POST http://localhost:3000/api/workflows/execute \
  -H "Content-Type: application/json" \
  -d '{"workflow":"data-ingestion","inputs":{"pipelineId":"test-pipeline"}}' | jq

# Expected: success=true, harvested/curated/learned counts

# Decision Making Workflow
curl -X POST http://localhost:3000/api/workflows/execute \
  -H "Content-Type: application/json" \
  -d '{"workflow":"decision-making","inputs":{"question":"Should we scale?","minConfidence":0.8}}' | jq

# System Integration Test
curl -X POST http://localhost:3000/api/workflows/execute \
  -H "Content-Type: application/json" \
  -d '{"workflow":"integration-test","inputs":{}}' | jq

# Monitoring Workflow
curl -X POST http://localhost:3000/api/workflows/execute \
  -H "Content-Type: application/json" \
  -d '{"workflow":"monitoring","inputs":{}}' | jq
```

### View Dashboard

Open browser: **http://localhost:3001**

Dashboard shows:
- System health and status
- Component metrics
- Real-time data flow
- Workflow execution history

---

## Useful Commands

### Monitoring

```bash
# Watch pods
kubectl get pods -n tsvai -w

# Stream logs from all pods
kubectl logs -n tsvai -l app=tsvai-harness -f

# View specific pod logs
kubectl logs -n tsvai <pod-name> -f

# Get detailed pod info
kubectl describe pod -n tsvai <pod-name>

# View recent events
kubectl get events -n tsvai --sort-by='.lastTimestamp'
```

### Management

```bash
# Scale deployment
kubectl scale deployment tsvai-harness -n tsvai --replicas=5

# Restart deployment
kubectl rollout restart deployment/tsvai-harness -n tsvai

# Update image
kubectl set image deployment/tsvai-harness \
  -n tsvai \
  tsvai-harness=tsvai-harness:v1.1

# Delete deployment
kubectl delete -f k8s/ -n tsvai
```

### Debugging

```bash
# Get shell in pod
kubectl exec -it -n tsvai <pod-name> -- /bin/sh

# Run command in pod
kubectl exec -n tsvai <pod-name> -- npm test

# Copy file from pod
kubectl cp tsvai/<pod-name>:/path/to/file ./local/file

# Port-forward to debug
kubectl port-forward -n tsvai <pod-name> 3000:3000
```

---

## Troubleshooting

### Issue: Pods stuck in "Pending" state

```bash
# Check what's wrong
kubectl describe pod -n tsvai <pod-name>

# Common causes:
# 1. Insufficient resources
#    kubectl describe node
# 2. Image not found
#    docker images | grep tsvai-harness
# 3. ConfigMap missing
#    kubectl get configmap -n tsvai
```

### Issue: Pods crash with "CrashLoopBackOff"

```bash
# Check logs
kubectl logs -n tsvai <pod-name>

# Common causes:
# 1. Health check failing
#    curl http://localhost:3000/api/health
# 2. Configuration error
#    kubectl describe configmap -n tsvai
# 3. Image issues
#    docker run tsvai-harness:latest
```

### Issue: Can't connect to API

```bash
# Verify port-forward is running
ps aux | grep port-forward

# Start port-forward if needed
kubectl port-forward -n tsvai svc/tsvai-harness-api 3000:3000 &

# Test connectivity
curl http://localhost:3000/api/health

# Check service exists
kubectl get svc -n tsvai
```

### Issue: High memory usage

```bash
# Check resource usage
kubectl top pods -n tsvai

# Check limits
kubectl get deployment -n tsvai tsvai-harness -o yaml | grep -A 20 resources

# Adjust limits in k8s/deployment.yaml and reapply
kubectl apply -f k8s/deployment.yaml
```

---

## File Structure Reference

```
tsvai-harness/
├── deploy.sh                          # Automated deployment script
├── Dockerfile                         # Docker image definition
├── TESTING_GUIDE.md                   # Testing procedures
├── KUBERNETES_DEPLOYMENT.md           # Detailed K8s deployment guide
├── k8s/
│   ├── namespace.yaml                 # Namespace + quotas + limits
│   ├── configmap.yaml                 # Configuration for all components
│   ├── deployment.yaml                # Pod deployment spec
│   ├── service.yaml                   # Services for access
│   └── argocd-application.yaml        # GitOps configuration
├── ai/                                # Component source code
├── package.json                       # Dependencies
└── README.md                          # Main documentation
```

---

## Next Steps After Deployment

### 1. Explore the Dashboard

Visit `http://localhost:3001` to see:
- Component health status
- System metrics
- Workflow history
- Real-time data flow

### 2. Run More Workflows

```bash
# Test all workflows
for workflow in data-ingestion agent-learning content-processing decision-making monitoring; do
  echo "Testing $workflow..."
  curl -X POST http://localhost:3000/api/workflows/execute \
    -H "Content-Type: application/json" \
    -d "{\"workflow\":\"$workflow\",\"inputs\":{}}" | jq '.success'
done
```

### 3. Scale Up

```bash
# Increase replicas
kubectl scale deployment tsvai-harness -n tsvai --replicas=5

# Monitor scaling
kubectl get pods -n tsvai -w
```

### 4. Setup Persistence

See [KUBERNETES_DEPLOYMENT.md](./KUBERNETES_DEPLOYMENT.md#enable-brain-wiki-persistence) for persistent storage setup.

### 5. Configure GitOps Auto-Sync

Push changes to Git, ArgoCD automatically syncs to cluster.

---

## Quick Reference

| Task | Command |
|------|---------|
| **Full Deploy** | `./deploy.sh --full` |
| **Tests Only** | `./deploy.sh --test` |
| **Manual K8s** | `./deploy.sh --deploy-k8s` |
| **Setup ArgoCD** | `./deploy.sh --argocd` |
| **GitOps Deploy** | `./deploy.sh --deploy-argocd` |
| **View Pods** | `kubectl get pods -n tsvai` |
| **View Logs** | `kubectl logs -n tsvai -l app=tsvai-harness -f` |
| **Check Health** | `curl http://localhost:3000/api/health` |
| **Access Dashboard** | `http://localhost:3001` |
| **Scale Replicas** | `kubectl scale deployment tsvai-harness -n tsvai --replicas=5` |

---

## Support & Help

For more detailed information:
- **Testing**: See [TESTING_GUIDE.md](./TESTING_GUIDE.md)
- **Kubernetes**: See [KUBERNETES_DEPLOYMENT.md](./KUBERNETES_DEPLOYMENT.md)
- **Architecture**: See [HARNESS_COMPLETION_SUMMARY.md](./HARNESS_COMPLETION_SUMMARY.md)
- **Deployment**: See [ai/integration/DEPLOYMENT.md](./ai/integration/DEPLOYMENT.md)

---

**Status**: ✅ Production Ready

**Version**: 1.0.0

**Last Updated**: 2026-08-28
