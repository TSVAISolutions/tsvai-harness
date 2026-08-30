.PHONY: help up down restart logs status health test clean install dev

# Default target
help:
	@echo "Harness Factory - Makefile Commands"
	@echo "=================================="
	@echo ""
	@echo "Deployment:"
	@echo "  make up              - Deploy Harness Factory to Kubernetes"
	@echo "  make down            - Remove Harness Factory from Kubernetes"
	@echo "  make restart         - Restart the deployment (rolling restart)"
	@echo ""
	@echo "Access & Monitoring:"
	@echo "  make logs            - View pod logs (live)"
	@echo "  make status          - Check deployment status"
	@echo "  make health          - Check system health"
	@echo "  make dashboard       - Open dashboard in browser (requires port-forward)"
	@echo ""
	@echo "Development:"
	@echo "  make install         - Install npm dependencies"
	@echo "  make dev             - Start dev server locally (npm run dev)"
	@echo "  make test            - Run tests"
	@echo "  make build           - Build Docker image"
	@echo ""
	@echo "Cleanup:"
	@echo "  make clean           - Delete namespace (full cleanup)"
	@echo "  make reset           - Down + Up (reset deployment)"
	@echo ""

# Deployment targets
up:
	@echo "🚀 Deploying Harness Factory..."
	@kubectl apply -f k8s/namespace.yaml
	@kubectl apply -f k8s/configmap.yaml
	@kubectl apply -f k8s/deployment.yaml
	@kubectl apply -f k8s/service.yaml
	@echo "⏳ Waiting for deployment to be ready..."
	@kubectl rollout status deployment/harness-factory -n harness-factory --timeout=60s || echo "⚠️  Deployment timeout (pod may still be starting)"
	@echo ""
	@echo "✅ Deployment complete!"
	@echo ""
	@echo "Access dashboard:"
	@echo "  kubectl port-forward -n harness-factory svc/harness-factory-api 8080:3000"
	@echo "  open http://localhost:8080"
	@echo ""
	@echo "Or use NodePort:"
	@echo "  open http://localhost:30000"

down:
	@echo "🛑 Removing Harness Factory..."
	@kubectl delete -f k8s/deployment.yaml --ignore-not-found=true
	@kubectl delete -f k8s/service.yaml --ignore-not-found=true
	@kubectl delete -f k8s/configmap.yaml --ignore-not-found=true
	@echo "✅ Harness Factory removed"

restart:
	@echo "🔄 Restarting deployment..."
	@kubectl rollout restart deployment/harness-factory -n harness-factory
	@kubectl rollout status deployment/harness-factory -n harness-factory --timeout=60s
	@echo "✅ Deployment restarted"

clean:
	@echo "🧹 Cleaning up (deleting namespace)..."
	@kubectl delete namespace harness-factory --ignore-not-found=true
	@echo "✅ Cleanup complete"

reset: down up
	@echo "✅ Deployment reset"

# Monitoring & debugging
logs:
	@kubectl logs -n harness-factory -l app=harness-factory -f --all-containers=true

status:
	@echo "📊 Deployment Status"
	@echo "===================="
	@kubectl get deployment -n harness-factory harness-factory -o wide
	@echo ""
	@echo "Pods:"
	@kubectl get pods -n harness-factory -o wide
	@echo ""
	@echo "Services:"
	@kubectl get svc -n harness-factory -o wide

health:
	@echo "❤️  System Health Check"
	@echo "===================="
	@kubectl port-forward -n harness-factory svc/harness-factory-api 8888:3000 > /dev/null 2>&1 & \
	sleep 2 && \
	curl -s http://localhost:8888/api/health | jq '.' && \
	pkill -f "kubectl port-forward.*8888" || true

dashboard:
	@echo "📊 Opening Dashboard..."
	@kubectl port-forward -n harness-factory svc/harness-factory-api 8080:3000 > /dev/null 2>&1 & \
	sleep 2 && \
	open http://localhost:8080 && \
	echo "✅ Dashboard opened (running on localhost:8080)"

# Development targets
install:
	@echo "📦 Installing dependencies..."
	@npm install
	@npm workspaces run install
	@echo "✅ Dependencies installed"

dev:
	@echo "🔧 Starting dev server..."
	@npm run dev

test:
	@echo "🧪 Running tests..."
	@npm test

build:
	@echo "🔨 Building Docker image..."
	@docker build -t harness-factory:latest .
	@echo "✅ Image built"
	@echo ""
	@echo "Loading into kind cluster..."
	@kind load docker-image harness-factory:latest --name dev-cluster
	@echo "✅ Image loaded into cluster"

rebuild: build restart
	@echo "✅ Image rebuilt and deployed"

rebuild-no-cache:
	@echo "🔨 Building Docker image (no cache)..."
	@docker build --no-cache -t harness-factory:latest .
	@echo "✅ Image built (fresh layers)"
	@echo ""
	@echo "Loading into kind cluster..."
	@kind load docker-image harness-factory:latest --name dev-cluster
	@echo "✅ Image loaded into cluster"
	@echo ""
	@echo "Restarting deployment..."
	@kubectl rollout restart deployment/harness-factory -n harness-factory
	@kubectl rollout status deployment/harness-factory -n harness-factory --timeout=60s
	@echo "✅ Deployment restarted with new image"

# Database/storage targets
db-backup:
	@echo "💾 Backing up database..."
	@kubectl exec -n harness-factory $$(kubectl get pods -n harness-factory -l app=harness-factory -o jsonpath='{.items[0].metadata.name}') -- tar czf /tmp/backup.tar.gz /data/brain-wiki
	@kubectl cp harness-factory/$$(kubectl get pods -n harness-factory -l app=harness-factory -o jsonpath='{.items[0].metadata.name}'):/tmp/backup.tar.gz ./backup-$(shell date +%Y%m%d-%H%M%S).tar.gz
	@echo "✅ Backup created"

# Quick access shortcuts
port-forward:
	@echo "🔌 Starting port-forward on port 8080..."
	@echo "Access dashboard at: http://localhost:8080"
	@kubectl port-forward -n harness-factory svc/harness-factory-api 8080:3000

shell:
	@echo "🐚 Opening pod shell..."
	@kubectl exec -it -n harness-factory $$(kubectl get pods -n harness-factory -l app=harness-factory -o jsonpath='{.items[0].metadata.name}') -- /bin/sh

describe:
	@echo "📝 Pod details:"
	@kubectl describe pod -n harness-factory $$(kubectl get pods -n harness-factory -l app=harness-factory -o jsonpath='{.items[0].metadata.name}')

# Kubernetes cluster info
k8s-info:
	@echo "🎯 Kubernetes Cluster Info"
	@echo "=========================="
	@echo "Context: $$(kubectl config current-context)"
	@echo "Cluster: $$(kubectl cluster-info | head -1)"
	@echo ""
	@echo "Nodes:"
	@kubectl get nodes -o wide
	@echo ""
	@echo "Namespaces:"
	@kubectl get namespaces

# Default make target (show help)
.DEFAULT_GOAL := help
