# TSVAI Harness - Kubernetes Deployment Guide

Complete guide for deploying TSVAI Harness to a Kubernetes cluster with GitOps using ArgoCD.

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    Git Repository                        │
│     (k8s manifests: namespace, config, deployment)       │
└───────────────────────────┬──────────────────────────────┘
                            │
                            ↓
            ┌───────────────────────────────┐
            │       ArgoCD Controller        │
            │  (GitOps Continuous Sync)     │
            └───────────────────┬───────────┘
                                │
                ┌───────────────┼───────────────┐
                ↓               ↓               ↓
          ┌─────────┐     ┌─────────┐     ┌─────────┐
          │ Cluster │     │ Cluster │     │ Cluster │
          │  (dev)  │     │(staging)│     │  (prod) │
          └─────────┘     └─────────┘     └─────────┘

Within Each Cluster:
  ┌──────────────────────────────────┐
  │    Namespace: tsvai              │
  ├──────────────────────────────────┤
  │  ┌─────────────────────────────┐ │
  │  │  TSVAI Harness Pods (x2-3)  │ │
  │  │  - API Server (port 3000)   │ │
  │  │  - Dashboard (port 3001)    │ │
  │  └─────────────────────────────┘ │
  │         ↓         ↓         ↓     │
  │    ┌─────────────────────────┐   │
  │    │  Brain-Wiki Storage     │   │
  │    │  (Persistent Volume)    │   │
  │    └─────────────────────────┘   │
  └──────────────────────────────────┘
```

## Prerequisites

### Local Setup

```bash
# 1. Install Docker Desktop with Kubernetes enabled
# https://www.docker.com/products/docker-desktop

# 2. Verify Kubernetes is running
kubectl cluster-info
kubectl get nodes

# 3. Install essential tools
brew install kubectl kustomize helm

# 4. Verify Node.js
node --version  # v18+
npm --version   # v9+
```

### Git Repository

Ensure these files exist in your repo:
```
k8s/
├── namespace.yaml
├── configmap.yaml
├── deployment.yaml
├── service.yaml
└── argocd-application.yaml
```

---

## Option 1: Manual Kubernetes Deployment

### Step 1: Build Docker Image

```bash
cd /Users/kbuchepalli/tsvai-harness

# Build image for local Kubernetes
docker build -t tsvai-harness:latest .

# Verify build
docker images | grep tsvai-harness
```

### Step 2: Load Image into Kubernetes

```bash
# For Docker Desktop Kubernetes (automatic)
# Image is already available

# For other clusters (if needed):
docker save tsvai-harness:latest | docker exec -i docker-desktop docker load
```

### Step 3: Create Namespace

```bash
kubectl apply -f k8s/namespace.yaml

# Verify
kubectl get namespace tsvai
kubectl get resourcequota -n tsvai
kubectl get limitrange -n tsvai
```

### Step 4: Create ConfigMap

```bash
kubectl apply -f k8s/configmap.yaml

# Verify
kubectl get configmap -n tsvai
kubectl describe configmap tsvai-config -n tsvai
```

### Step 5: Deploy Application

```bash
kubectl apply -f k8s/deployment.yaml

# Monitor rollout
kubectl rollout status deployment/tsvai-harness -n tsvai

# View pods
kubectl get pods -n tsvai
kubectl logs -n tsvai -l app=tsvai-harness -f
```

### Step 6: Create Services

```bash
kubectl apply -f k8s/service.yaml

# Verify services
kubectl get svc -n tsvai
```

### Step 7: Access Application

```bash
# Port-forward to access locally
kubectl port-forward -n tsvai svc/tsvai-harness-api 3000:3000 &
kubectl port-forward -n tsvai svc/tsvai-dashboard 3001:3001 &

# Access in browser
# API: http://localhost:3000
# Dashboard: http://localhost:3001

# Or use NodePort (if available)
kubectl get svc -n tsvai tsvai-harness-nodeport
# Access at: http://localhost:30000 (API), http://localhost:30001 (Dashboard)
```

---

## Option 2: GitOps Deployment with ArgoCD

### Step 1: Install ArgoCD

```bash
# Create argocd namespace
kubectl create namespace argocd

# Install ArgoCD
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Wait for ArgoCD to be ready
kubectl rollout status deployment/argocd-server -n argocd
kubectl rollout status deployment/argocd-application-controller -n argocd

# Verify installation
kubectl get pods -n argocd
```

### Step 2: Access ArgoCD UI

```bash
# Port-forward to ArgoCD server
kubectl port-forward svc/argocd-server -n argocd 8080:443 &

# Get initial admin password
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d

# Access at: https://localhost:8080
# Username: admin
# Password: <from above>
```

### Step 3: Configure Git Repository

```bash
# Create GitHub personal access token with repo access
# https://github.com/settings/tokens

# Add repository to ArgoCD (via CLI or UI)
argocd repo add https://github.com/TSVAISolutions/tsvai-harness \
  --username <github-username> \
  --password <github-token>

# Verify
argocd repo list
```

### Step 4: Deploy via GitOps

```bash
# Create tsvai namespace (if not exists)
kubectl create namespace tsvai

# Apply ArgoCD Application manifest
kubectl apply -f k8s/argocd-application.yaml

# Monitor sync status
argocd app get tsvai-harness
argocd app wait tsvai-harness --sync

# Or via UI: https://localhost:8080/applications/tsvai-harness
```

### Step 5: Verify Deployment

```bash
# Check application status
argocd app get tsvai-harness

# Check pods
kubectl get pods -n tsvai -w

# Check services
kubectl get svc -n tsvai
```

### Step 6: Auto-Sync Configuration

Once deployed, ArgoCD will:
- Monitor the Git repository every 3 minutes
- Auto-sync any changes to `k8s/` directory
- Auto-heal if cluster state drifts
- Prune resources removed from Git

---

## Multi-Environment Setup with ApplicationSet

Deploy to multiple environments (dev/staging/prod):

```bash
# Apply ApplicationSet
kubectl apply -f k8s/argocd-application.yaml

# Monitor all applications
argocd app list

# Expected output:
# tsvai-harness-dev       - tsvai-dev       (1 replica)
# tsvai-harness-staging   - tsvai-staging   (2 replicas)
# tsvai-harness-prod      - tsvai-prod      (3 replicas)
```

Each environment:
- Separate namespace
- Own storage volumes
- Different replica counts
- Automatic syncing from Git

---

## Accessing the Application

### Method 1: Port-Forward (Local Access)

```bash
# API
kubectl port-forward -n tsvai svc/tsvai-harness-api 3000:3000 &

# Dashboard
kubectl port-forward -n tsvai svc/tsvai-dashboard 3001:3001 &

# Access:
# API: http://localhost:3000
# Dashboard: http://localhost:3001
```

### Method 2: NodePort (Node Access)

```bash
# Get node IP and port
kubectl get svc -n tsvai tsvai-harness-nodeport

# Access:
# API: http://<node-ip>:30000
# Dashboard: http://<node-ip>:30001
```

### Method 3: LoadBalancer (External Access)

```bash
# Get external IP (if available)
kubectl get svc -n tsvai tsvai-harness-loadbalancer

# Access:
# API: http://<external-ip>
# Dashboard: http://<external-ip>:3001
```

### Method 4: Kubectl Proxy (Cluster Access)

```bash
# Start proxy
kubectl proxy &

# Access (example):
# http://localhost:8001/api/v1/namespaces/tsvai/services/tsvai-harness-api:3000/proxy/
```

---

## Testing Deployment

### Check Health

```bash
# Port-forward if needed
kubectl port-forward -n tsvai svc/tsvai-harness-api 3000:3000 &

# Health check
curl http://localhost:3000/api/health

# Expected response:
# {
#   "overall": "healthy",
#   "components": {
#     "brain-wiki": { "status": "healthy" },
#     "harvester": { "status": "healthy" },
#     ...
#   }
# }
```

### Check Status

```bash
curl http://localhost:3000/api/status

# Expected response:
# {
#   "initialized": true,
#   "componentsCount": 7,
#   "health": { ... },
#   ...
# }
```

### Execute Test Workflow

```bash
curl -X POST http://localhost:3000/api/workflows/execute \
  -H "Content-Type: application/json" \
  -d '{
    "workflow": "integration-test",
    "inputs": {}
  }' | jq

# Expected response:
# {
#   "success": true,
#   "workflow": "integration-test",
#   "result": {
#     "success": true,
#     "componentsReady": 7,
#     ...
#   }
# }
```

### Run All Workflows

```bash
# Data Ingestion
curl -X POST http://localhost:3000/api/workflows/execute \
  -H "Content-Type: application/json" \
  -d '{"workflow": "data-ingestion", "inputs": {"pipelineId": "test"}}' | jq

# Agent Learning
curl -X POST http://localhost:3000/api/workflows/execute \
  -H "Content-Type: application/json" \
  -d '{"workflow": "agent-learning", "inputs": {"tasks": [{"id": "task1"}]}}' | jq

# Monitoring
curl -X POST http://localhost:3000/api/workflows/execute \
  -H "Content-Type: application/json" \
  -d '{"workflow": "monitoring", "inputs": {}}' | jq
```

---

## Monitoring & Management

### View Logs

```bash
# All harness pods
kubectl logs -n tsvai -l app=tsvai-harness -f

# Specific pod
kubectl logs -n tsvai <pod-name> -f

# Previous logs (if crashed)
kubectl logs -n tsvai <pod-name> --previous
```

### View Events

```bash
# Namespace events
kubectl get events -n tsvai --sort-by='.lastTimestamp'

# Watch events
kubectl get events -n tsvai -w
```

### Describe Resources

```bash
# Deployment
kubectl describe deployment tsvai-harness -n tsvai

# Pods
kubectl describe pod <pod-name> -n tsvai

# Services
kubectl describe svc tsvai-harness-api -n tsvai
```

### Execute Commands in Pod

```bash
# Get shell access
kubectl exec -it -n tsvai <pod-name> -- /bin/sh

# Run command
kubectl exec -n tsvai <pod-name> -- npm test
```

---

## Scaling

### Manual Scaling

```bash
# Scale replicas
kubectl scale deployment tsvai-harness -n tsvai --replicas=5

# Verify
kubectl get pods -n tsvai
```

### Horizontal Pod Autoscaling

```bash
# Create HPA
kubectl autoscale deployment tsvai-harness -n tsvai \
  --min=2 --max=10 --cpu-percent=70

# View HPA
kubectl get hpa -n tsvai
```

### Update Image

```bash
# Rebuild image
docker build -t tsvai-harness:v1.1 .

# Update deployment
kubectl set image deployment/tsvai-harness \
  -n tsvai \
  tsvai-harness=tsvai-harness:v1.1

# Watch rollout
kubectl rollout status deployment/tsvai-harness -n tsvai
```

---

## Troubleshooting

### Pod not starting

```bash
# Check pod status
kubectl describe pod -n tsvai <pod-name>

# View logs
kubectl logs -n tsvai <pod-name>

# Check events
kubectl get events -n tsvai --sort-by='.lastTimestamp'
```

### Deployment stuck

```bash
# Check rollout status
kubectl rollout status deployment/tsvai-harness -n tsvai

# Rollback if needed
kubectl rollout undo deployment/tsvai-harness -n tsvai

# Check replica set
kubectl get rs -n tsvai
```

### Health check failing

```bash
# Port-forward to pod
kubectl port-forward -n tsvai <pod-name> 3000:3000

# Test health endpoint
curl http://localhost:3000/api/health

# Check pod logs for errors
kubectl logs -n tsvai <pod-name> --tail=50
```

### High memory usage

```bash
# Check resource usage
kubectl top pods -n tsvai

# Adjust limits in deployment.yaml
# resources:
#   requests:
#     memory: "512Mi"
#   limits:
#     memory: "2Gi"

# Apply changes
kubectl apply -f k8s/deployment.yaml
```

---

## Persistence

### Enable Brain-Wiki Persistence

```bash
# Create PersistentVolume
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: PersistentVolume
metadata:
  name: brain-wiki-pv
spec:
  capacity:
    storage: 10Gi
  accessModes:
    - ReadWriteOnce
  hostPath:
    path: /tmp/brain-wiki
EOF

# Create PersistentVolumeClaim
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: brain-wiki-pvc
  namespace: tsvai
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi
EOF

# Update deployment.yaml volumes section:
# volumes:
# - name: brain-wiki-storage
#   persistentVolumeClaim:
#     claimName: brain-wiki-pvc

# Apply deployment
kubectl apply -f k8s/deployment.yaml
```

### Backup Data

```bash
# Create backup
kubectl exec -n tsvai <pod-name> -- \
  tar -czf /tmp/brain-wiki-backup.tar.gz /data/brain-wiki

# Copy from pod
kubectl cp tsvai/<pod-name>:/tmp/brain-wiki-backup.tar.gz ./backup.tar.gz

# Verify
tar -tzf backup.tar.gz | head
```

---

## GitOps Best Practices

### 1. Declarative Configuration

```bash
# All configuration in Git
git add k8s/
git commit -m "Update TSVAI Harness config"
git push origin main

# ArgoCD will automatically sync
```

### 2. Version Control

```bash
# Tag releases
git tag v1.0.0
git push origin v1.0.0

# ArgoCD tracks version
argocd app get tsvai-harness
```

### 3. Pull Request Workflow

```bash
# Create feature branch
git checkout -b feature/update-config

# Make changes
vim k8s/deployment.yaml

# Commit and push
git add k8s/deployment.yaml
git commit -m "Increase replica count"
git push origin feature/update-config

# Create PR on GitHub
# ArgoCD will preview changes (if configured)

# Merge PR
# ArgoCD will auto-sync to cluster
```

### 4. Monitoring Sync Status

```bash
# CLI
argocd app wait tsvai-harness --sync

# UI
# https://argocd-server/applications/tsvai-harness

# Webhooks (GitHub → ArgoCD)
# Reduces sync time from 3 minutes to seconds
```

---

## Production Checklist

- [ ] Configure persistent storage for brain-wiki
- [ ] Set up monitoring/logging (Prometheus, ELK)
- [ ] Configure backup strategy
- [ ] Set up ArgoCD notifications (Slack, email)
- [ ] Enable RBAC and network policies
- [ ] Configure ingress for HTTP/HTTPS
- [ ] Set up resource quotas and limits
- [ ] Enable pod security policies
- [ ] Configure health checks and alerts
- [ ] Document runbooks for common issues
- [ ] Set up disaster recovery procedures
- [ ] Load test before production

---

## Common Commands Summary

```bash
# Deployment
kubectl apply -f k8s/
kubectl delete -f k8s/

# Status
kubectl get pods -n tsvai
kubectl get svc -n tsvai
kubectl describe deployment tsvai-harness -n tsvai

# Logs
kubectl logs -n tsvai -l app=tsvai-harness -f

# Access
kubectl port-forward -n tsvai svc/tsvai-harness-api 3000:3000

# Scaling
kubectl scale deployment tsvai-harness -n tsvai --replicas=5

# Updates
kubectl set image deployment/tsvai-harness -n tsvai \
  tsvai-harness=tsvai-harness:v1.1

# GitOps (ArgoCD)
argocd app get tsvai-harness
argocd app sync tsvai-harness
argocd app rollback tsvai-harness
```

---

## Next Steps

1. **Deploy to Kubernetes** - Run manual or GitOps deployment
2. **Access Dashboard** - View real-time metrics and status
3. **Run Workflows** - Execute end-to-end workflows
4. **Set Up Monitoring** - Add Prometheus/Grafana
5. **Configure Backups** - Regular data backups
6. **Production Hardening** - Security and HA setup

---

**Version**: 1.0.0  
**Last Updated**: 2026-08-28  
**Status**: Production-Ready
