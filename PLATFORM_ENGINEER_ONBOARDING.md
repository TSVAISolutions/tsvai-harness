# TSVAI Harness - Platform Engineer Onboarding Guide

Welcome to the Platform Engineering team! This guide covers infrastructure, deployment, monitoring, and operational aspects of the TSVAI Harness system.

---

## 🎯 Platform Engineer Responsibilities

As a platform engineer, you'll be responsible for:

1. **Infrastructure & Deployment**
   - Kubernetes cluster setup and management
   - Docker image builds and optimization
   - GitOps with ArgoCD
   - Infrastructure as Code (Terraform)

2. **Reliability & Operations**
   - System monitoring and alerting
   - Performance optimization
   - Scaling and load balancing
   - Disaster recovery and backups

3. **Security & Compliance**
   - Network policies and security
   - RBAC configuration
   - Secret management
   - Audit logging

4. **CI/CD & Automation**
   - GitHub Actions workflows
   - Automated testing and deployment
   - Release management
   - Rollback procedures

---

## 📋 Day 1: Environment Setup

### 1.1 Prerequisites for Platform Engineers

```bash
# Essential tools
node --version              # v18+
npm --version               # v9+
docker --version            # Latest
kubectl version --client    # Latest
git --version               # Latest

# Additional platform tools
helm version 2>/dev/null || echo "Install Helm"
argocd version              # Check ArgoCD
terraform --version        # Optional: for IaC
prometheus_client           # Optional: for monitoring
```

### 1.2 Install Additional Platform Tools

```bash
# macOS (homebrew)
brew install helm
brew install argocd
brew install terraform      # Optional
brew install prometheus    # Optional
brew install grafana       # Optional

# Verify installations
helm version
argocd version
```

### 1.3 Configure kubectl Context

```bash
# View current context
kubectl config current-context

# List all contexts
kubectl config get-contexts

# Switch context (if needed)
kubectl config use-context docker-desktop

# Verify cluster access
kubectl cluster-info
kubectl get nodes
```

### 1.4 Docker Hub / Registry Access

```bash
# Login to registry (if private)
docker login registry.example.com

# Verify access
docker pull alpine
```

---

## 🏗️ Day 2: Understanding Infrastructure

### 2.1 Kubernetes Architecture

The TSVAI Harness runs on Kubernetes with this structure:

```
Kubernetes Cluster
├── kube-system (system namespace)
├── argocd (GitOps controller)
└── tsvai (application namespace)
    ├── Deployment: tsvai-harness (2-3 replicas)
    ├── Services: API, Dashboard, LoadBalancer
    ├── ConfigMap: Application configuration
    ├── PersistentVolume: Brain-Wiki storage
    └── RBAC: ServiceAccount, Roles, RoleBindings
```

### 2.2 Deployment Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│                 Git Repository                      │
│          (k8s manifests + application code)         │
└──────────────────────┬──────────────────────────────┘
                       │
                       ↓
            ┌──────────────────────┐
            │   GitHub Actions     │
            │  (CI/CD Pipeline)    │
            └──────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        ↓              ↓              ↓
    ┌────────┐   ┌─────────┐   ┌──────────┐
    │ Build  │   │  Test   │   │   Push   │
    │ Image  │   │  Suite  │   │ Registry │
    └────────┘   └─────────┘   └──────────┘
        │              │              │
        └──────────────┼──────────────┘
                       ↓
            ┌──────────────────────┐
            │   Docker Registry    │
            │  tsvai-harness:vX.X  │
            └──────────────────────┘
                       │
                       ↓
            ┌──────────────────────┐
            │  ArgoCD Controller   │
            │  (watches Git repo)  │
            └──────────────────────┘
                       │
                       ↓
        ┌──────────────────────────────┐
        │   Kubernetes Cluster         │
        ├──────────────────────────────┤
        │  tsvai Namespace             │
        │  ├─ Deployment               │
        │  ├─ Services                 │
        │  ├─ ConfigMap                │
        │  └─ PersistentVolumes        │
        └──────────────────────────────┘
```

### 2.3 Key Infrastructure Files

```
tsvai-harness/
├── Dockerfile                       # Container image definition
├── k8s/                            # Kubernetes manifests
│   ├── namespace.yaml              # Namespace + quotas + limits
│   ├── configmap.yaml              # Configuration
│   ├── deployment.yaml             # Pod deployment spec
│   ├── service.yaml                # Services for access
│   └── argocd-application.yaml     # GitOps configuration
├── .github/workflows/              # CI/CD pipelines
└── infrastructure/terraform/       # IaC (if using Terraform)
```

---

## 🚀 Day 3: Deployment & Scaling

### 3.1 Manual Kubernetes Deployment

```bash
# Create namespace
kubectl create namespace tsvai
kubectl apply -f k8s/namespace.yaml

# Create configuration
kubectl apply -f k8s/configmap.yaml

# Deploy application
kubectl apply -f k8s/deployment.yaml

# Create services
kubectl apply -f k8s/service.yaml

# Verify rollout
kubectl rollout status deployment/tsvai-harness -n tsvai
```

### 3.2 GitOps with ArgoCD

```bash
# Install ArgoCD
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Wait for ArgoCD to be ready
kubectl wait --for=condition=available --timeout=300s \
  deployment/argocd-server -n argocd

# Get admin password
kubectl -n argocd get secret argocd-initial-admin-secret \
  -o jsonpath="{.data.password}" | base64 -d

# Port-forward to UI
kubectl port-forward svc/argocd-server -n argocd 8080:443 &

# Add Git repository
argocd repo add https://github.com/TSVAISolutions/tsvai-harness \
  --username <username> \
  --password <token>

# Create application
kubectl apply -f k8s/argocd-application.yaml

# Monitor sync
argocd app wait tsvai-harness --sync
```

### 3.3 Scaling Operations

```bash
# Manual scaling
kubectl scale deployment tsvai-harness -n tsvai --replicas=5

# Horizontal Pod Autoscaler (HPA)
kubectl autoscale deployment tsvai-harness -n tsvai \
  --min=2 --max=10 --cpu-percent=70

# View HPA status
kubectl get hpa -n tsvai

# Update resource limits
kubectl set resources deployment tsvai-harness -n tsvai \
  --requests=cpu=500m,memory=1Gi \
  --limits=cpu=2,memory=4Gi
```

### 3.4 Rolling Updates

```bash
# Update Docker image
kubectl set image deployment/tsvai-harness \
  -n tsvai \
  tsvai-harness=tsvai-harness:v1.1

# Monitor rollout
kubectl rollout status deployment/tsvai-harness -n tsvai -w

# Check rollout history
kubectl rollout history deployment/tsvai-harness -n tsvai

# Rollback if needed
kubectl rollout undo deployment/tsvai-harness -n tsvai
```

---

## 📊 Day 4: Monitoring & Observability

### 4.1 Health Checks & Probes

The deployment includes three types of probes:

```yaml
# Liveness: Is the pod alive?
livenessProbe:
  httpGet:
    path: /api/health
    port: 3000
  initialDelaySeconds: 30
  periodSeconds: 10

# Readiness: Is it ready to serve traffic?
readinessProbe:
  httpGet:
    path: /api/ready
    port: 3000
  initialDelaySeconds: 15
  periodSeconds: 5

# Startup: Has it finished starting?
startupProbe:
  httpGet:
    path: /api/ready
    port: 3000
  initialDelaySeconds: 10
  failureThreshold: 30
```

### 4.2 Monitoring Commands

```bash
# Watch pod status
kubectl get pods -n tsvai -w

# View pod metrics (requires metrics-server)
kubectl top pods -n tsvai
kubectl top pods -n tsvai --sort-by=cpu
kubectl top pods -n tsvai --sort-by=memory

# View node metrics
kubectl top nodes

# Check resource usage
kubectl describe deployment tsvai-harness -n tsvai | grep -A 20 "Resources:"

# View events
kubectl get events -n tsvai --sort-by='.lastTimestamp' | tail -20
```

### 4.3 Logging

```bash
# View logs from all pods
kubectl logs -n tsvai -l app=tsvai-harness -f

# View logs from specific pod
kubectl logs -n tsvai <pod-name> -f

# View previous logs (if crashed)
kubectl logs -n tsvai <pod-name> --previous

# View with timestamps
kubectl logs -n tsvai <pod-name> --timestamps=true

# Follow specific error pattern
kubectl logs -n tsvai -l app=tsvai-harness -f | grep ERROR
```

### 4.4 Prometheus Integration (Optional)

```yaml
# Add to deployment annotations:
annotations:
  prometheus.io/scrape: "true"
  prometheus.io/port: "3000"
  prometheus.io/path: "/api/metrics"

# Prometheus would then scrape metrics automatically
```

### 4.5 Alerting Rules (Example)

```yaml
# Create PrometheusRule if Prometheus is installed
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: tsvai-alerts
  namespace: tsvai
spec:
  groups:
  - name: tsvai.rules
    interval: 30s
    rules:
    - alert: TsvaiPodDown
      expr: count(up{job="tsvai-harness"} == 1) < 2
      for: 5m
      annotations:
        summary: "TSVAI pod is down"
    
    - alert: HighMemoryUsage
      expr: container_memory_usage_bytes{pod=~"tsvai.*"} > 3e9
      for: 5m
      annotations:
        summary: "High memory usage in TSVAI pods"
```

---

## 🔒 Day 5: Security & Compliance

### 5.1 RBAC (Role-Based Access Control)

```bash
# View current RBAC
kubectl get roles -n tsvai
kubectl get rolebindings -n tsvai
kubectl get serviceaccounts -n tsvai

# Create custom role
kubectl create role pod-reader --verb=get --verb=list \
  --resource=pods -n tsvai

# Bind role to service account
kubectl create rolebinding read-pods \
  --clusterrole=pod-reader \
  --serviceaccount=tsvai:default -n tsvai

# Test permissions
kubectl auth can-i get pods --as=system:serviceaccount:tsvai:default -n tsvai
```

### 5.2 Network Policies

```yaml
# Example: Restrict ingress to API only
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: tsvai-network-policy
  namespace: tsvai
spec:
  podSelector:
    matchLabels:
      app: tsvai-harness
  policyTypes:
  - Ingress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: ingress-nginx
    ports:
    - protocol: TCP
      port: 3000
```

### 5.3 Secret Management

```bash
# Create secrets for sensitive data
kubectl create secret generic tsvai-secrets \
  --from-literal=db-password=secret123 \
  -n tsvai

# View secrets
kubectl get secrets -n tsvai

# Update secret
kubectl delete secret tsvai-secrets -n tsvai
kubectl create secret generic tsvai-secrets \
  --from-literal=db-password=newsecret123 \
  -n tsvai

# Use in deployment via environment variable:
# env:
# - name: DB_PASSWORD
#   valueFrom:
#     secretKeyRef:
#       name: tsvai-secrets
#       key: db-password
```

### 5.4 Pod Security Policies

```yaml
# Example PSP for restricted containers
apiVersion: policy/v1beta1
kind: PodSecurityPolicy
metadata:
  name: tsvai-restricted
spec:
  privileged: false
  allowPrivilegeEscalation: false
  requiredDropCapabilities:
  - ALL
  volumes:
  - 'configMap'
  - 'emptyDir'
  - 'projected'
  - 'secret'
  - 'downwardAPI'
  - 'persistentVolumeClaim'
  hostNetwork: false
  hostIPC: false
  hostPID: false
  runAsUser:
    rule: 'MustRunAsNonRoot'
  seLinux:
    rule: 'MustRunAs'
  fsGroup:
    rule: 'MustRunAs'
```

---

## 💾 Day 6: Backup & Disaster Recovery

### 6.1 Backup Procedures

```bash
# Backup Brain-Wiki data
kubectl exec -n tsvai <pod-name> -- \
  tar -czf /tmp/brain-wiki-backup.tar.gz /data/brain-wiki

# Copy backup from pod
kubectl cp tsvai/<pod-name>:/tmp/brain-wiki-backup.tar.gz \
  ./backups/brain-wiki-$(date +%Y%m%d).tar.gz

# Backup entire namespace state
kubectl get all -n tsvai -o yaml > tsvai-backup-$(date +%Y%m%d).yaml

# Backup configmaps and secrets
kubectl get cm,secret -n tsvai -o yaml > tsvai-configs-$(date +%Y%m%d).yaml
```

### 6.2 Restore Procedures

```bash
# Restore from namespace backup
kubectl apply -f tsvai-backup-20260829.yaml

# Restore data from backup
kubectl cp ./backups/brain-wiki-20260829.tar.gz \
  tsvai/<pod-name>:/tmp/
kubectl exec -n tsvai <pod-name> -- \
  tar -xzf /tmp/brain-wiki-20260829.tar.gz -C /

# Verify restoration
kubectl logs -n tsvai <pod-name> | grep "restored"
```

### 6.3 Disaster Recovery Plan

```
DR Checklist:
├─ Automated backups every 24 hours
├─ Store backups in S3 or cloud storage
├─ Test restore procedures monthly
├─ Document recovery time objectives (RTO)
├─ Document recovery point objectives (RPO)
├─ Keep disaster recovery runbook up to date
└─ Regular training for team members
```

---

## 🔄 Day 7: CI/CD & Automation

### 7.1 GitHub Actions Workflow

The project uses GitHub Actions for CI/CD:

```yaml
# .github/workflows/build-and-deploy.yml
name: Build and Deploy

on:
  push:
    branches: [main]
    paths:
      - 'ai/**'
      - 'k8s/**'
      - 'Dockerfile'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - uses: actions/setup-node@v3
      with:
        node-version: '18'
    - run: npm install
    - run: npm test

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - uses: docker/build-push-action@v4
      with:
        push: true
        tags: |
          registry.example.com/tsvai-harness:${{ github.sha }}
          registry.example.com/tsvai-harness:latest

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
    - name: Deploy to cluster
      run: |
        kubectl set image deployment/tsvai-harness \
          -n tsvai \
          tsvai-harness=registry.example.com/tsvai-harness:${{ github.sha }}
```

### 7.2 Automated Testing

```bash
# Run full test suite in CI
npm test -- --coverage --ci

# Generate coverage reports
npm test -- --coverage
open coverage/index.html
```

### 7.3 Automated Deployment

```bash
# Automatic GitOps sync with ArgoCD
# (No manual deployment needed - Git is source of truth)

# For manual emergency deployment:
./deploy.sh --deploy-k8s

# For staged rollout:
kubectl patch deployment tsvai-harness -n tsvai \
  -p '{"spec":{"strategy":{"type":"RollingUpdate","rollingUpdate":{"maxSurge":"25%","maxUnavailable":"25%"}}}}'
```

---

## 📈 Week 2: Performance Optimization

### 8.1 Resource Optimization

```bash
# Analyze current resource usage
kubectl top pods -n tsvai

# Adjust resource requests/limits based on actual usage
# Update k8s/deployment.yaml:
# resources:
#   requests:
#     cpu: 250m      # Based on actual usage
#     memory: 512Mi
#   limits:
#     cpu: 1000m
#     memory: 2Gi

# Apply changes
kubectl apply -f k8s/deployment.yaml
```

### 8.2 Database Performance (if applicable)

```bash
# Monitor query performance
kubectl exec -n tsvai <pod-name> -- \
  psql -U user -d database -c "EXPLAIN ANALYZE SELECT ..."

# Create indexes
kubectl exec -n tsvai <pod-name> -- \
  psql -U user -d database -c "CREATE INDEX idx_brain_wiki_type ON knowledge(type);"

# Vacuum and analyze
kubectl exec -n tsvai <pod-name> -- \
  psql -U user -d database -c "VACUUM ANALYZE;"
```

### 8.3 Image Optimization

```bash
# Reduce Docker image size
# Multi-stage builds already in Dockerfile
docker build -t tsvai-harness:latest .

# Check image size
docker images | grep tsvai-harness

# Scan for vulnerabilities
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy image tsvai-harness:latest
```

---

## 🛠️ Week 3: Troubleshooting & Operations

### 9.1 Common Issues & Solutions

**Issue: Pods stuck in PendingState**

```bash
# Diagnose
kubectl describe pod -n tsvai <pod-name>

# Solutions:
# 1. Insufficient resources
kubectl describe nodes

# 2. Image pull error
kubectl logs -n tsvai <pod-name>

# 3. Missing ConfigMap
kubectl get configmap -n tsvai
```

**Issue: High Memory Usage**

```bash
# Check memory usage
kubectl top pods -n tsvai

# Check limits
kubectl describe deployment tsvai-harness -n tsvai

# Increase limits
kubectl set resources deployment tsvai-harness -n tsvai \
  --limits=memory=4Gi
```

**Issue: Network Connectivity**

```bash
# Test DNS
kubectl run -it --rm debug --image=busybox --restart=Never \
  -n tsvai -- nslookup tsvai-harness-api

# Test port connectivity
kubectl exec -it <pod-name> -n tsvai -- \
  nc -zv tsvai-harness-api 3000

# Check network policies
kubectl get networkpolicies -n tsvai
```

### 9.2 Debugging Tools

```bash
# Get shell access
kubectl exec -it <pod-name> -n tsvai -- /bin/sh

# Run diagnostics
curl -s http://tsvai-harness-api:3000/api/diagnostics | jq

# Check environment variables
kubectl exec <pod-name> -n tsvai -- env

# Check mounted volumes
kubectl exec <pod-name> -n tsvai -- mount | grep data

# Inspect resource definitions
kubectl get deployment tsvai-harness -n tsvai -o yaml
```

### 9.3 Incident Response Playbook

```
1. Detection
   └─ Alert fires or user reports issue

2. Immediate Response (0-5 min)
   ├─ Check pod status: kubectl get pods -n tsvai
   ├─ Check logs: kubectl logs -n tsvai <pod>
   ├─ Check health: curl http://localhost:3000/api/health
   └─ Document issue in runbook

3. Diagnosis (5-15 min)
   ├─ Check recent changes: git log --oneline -5
   ├─ Check metrics: kubectl top pods -n tsvai
   ├─ Check events: kubectl get events -n tsvai
   └─ Interview application team

4. Resolution (15-60 min)
   ├─ If code issue: kubectl rollout undo
   ├─ If resource issue: kubectl scale --replicas=5
   ├─ If config issue: kubectl apply -f fixed-config.yaml
   └─ If data issue: Restore from backup

5. Verification (5-10 min)
   ├─ Health check passes
   ├─ All pods running
   ├─ API responding
   └─ No new alerts

6. Post-Incident (after incident)
   ├─ Write incident report
   ├─ Root cause analysis
   ├─ Preventive measures
   └─ Update runbook
```

---

## 📚 Platform Engineer Documentation

### Essential Reading

| Document | Purpose | Time |
|----------|---------|------|
| KUBERNETES_DEPLOYMENT.md | Complete K8s guide | 30 min |
| TESTING_GUIDE.md | Testing procedures | 15 min |
| HARNESS_COMPLETION_SUMMARY.md | System overview | 20 min |
| COMMANDS_REFERENCE.md | Quick commands | bookmark |
| ai/integration/DEPLOYMENT.md | Production guide | 20 min |

### Kubernetes Documentation

- [Kubernetes Official Docs](https://kubernetes.io/docs/)
- [Kubectl Cheat Sheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)
- [Kubernetes Best Practices](https://kubernetes.io/docs/concepts/overview/working-with-objects/field-selectors/)

### ArgoCD Documentation

- [ArgoCD Official Docs](https://argo-cd.readthedocs.io/)
- [ArgoCD Application Spec](https://argo-cd.readthedocs.io/en/stable/operator-manual/application.yaml/)

---

## ✅ Platform Engineer Onboarding Checklist

### Week 1

- [ ] Day 1: Install tools and verify cluster access
- [ ] Day 2: Understand Kubernetes architecture
- [ ] Day 3: Deploy via manual K8s
- [ ] Day 4: Setup ArgoCD GitOps
- [ ] Day 5: Configure monitoring and alerts
- [ ] Day 5: Implement security policies (RBAC, network policies)
- [ ] Day 6: Setup backup and restore procedures
- [ ] Day 7: Review CI/CD workflows

### Week 2

- [ ] Perform load testing
- [ ] Optimize resource allocation
- [ ] Test disaster recovery procedures
- [ ] Set up automated backups
- [ ] Document runbooks for common issues
- [ ] Review and optimize Docker images
- [ ] Setup monitoring dashboards
- [ ] Create incident response playbook

### Week 3+

- [ ] Monitor production deployments
- [ ] Optimize performance based on metrics
- [ ] Implement auto-scaling
- [ ] Conduct security audit
- [ ] Lead oncall rotation
- [ ] Mentor junior platform engineers
- [ ] Contribute infrastructure improvements

---

## 🎯 Platform Engineer Success Metrics

**By end of Week 1:**
- ✅ Can deploy system to Kubernetes
- ✅ Can scale deployments
- ✅ Understand monitoring and alerting
- ✅ Know how to troubleshoot common issues
- ✅ Can perform backups and restores

**By end of Week 2:**
- ✅ GitOps workflow automated
- ✅ Monitoring dashboards setup
- ✅ Disaster recovery tested
- ✅ Performance optimized
- ✅ Security policies implemented

**By end of Month 1:**
- ✅ Oncall capable
- ✅ Can handle production incidents
- ✅ Infrastructure documented
- ✅ Runbooks created
- ✅ Team trained on procedures

---

## 📞 Platform Engineer Contacts

For help with:
- **Kubernetes issues** → Check KUBERNETES_DEPLOYMENT.md
- **Deployment issues** → Check ai/integration/DEPLOYMENT.md
- **Commands** → Check COMMANDS_REFERENCE.md
- **Emergency** → Run troubleshooting playbook

---

## 🚀 Quick Start for Platform Engineers

```bash
# 1. Setup (15 min)
git clone --recursive https://github.com/TSVAISolutions/tsvai-harness.git
cd tsvai-harness
./deploy.sh --full

# 2. Understand (30 min)
cat KUBERNETES_DEPLOYMENT.md
cat k8s/*.yaml

# 3. Monitor (ongoing)
kubectl get pods -n tsvai -w
kubectl logs -n tsvai -l app=tsvai-harness -f

# 4. Operate (daily)
kubectl get nodes
kubectl top pods -n tsvai
argocd app get tsvai-harness
```

---

**Welcome to Platform Engineering! 🚀**

You now have everything you need to:
✅ Deploy and manage the TSVAI Harness infrastructure  
✅ Monitor system health and performance  
✅ Respond to incidents  
✅ Optimize resources  
✅ Maintain security and compliance  

Let's build a bulletproof platform!

**Version**: 1.0.0  
**Last Updated**: 2026-08-29
