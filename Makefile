.PHONY: help up down restart logs status health test clean install dev

# Default target
help:
	@echo "TSVAI Harness - Makefile Commands"
	@echo "=================================="
	@echo ""
	@echo "Deployment:"
	@echo "  make up              - Deploy TSVAI Harness to Kubernetes"
	@echo "  make down            - Remove TSVAI Harness from Kubernetes"
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
	@echo "🚀 Deploying TSVAI Harness..."
	@kubectl apply -f k8s/namespace.yaml
	@kubectl apply -f k8s/configmap.yaml
	@kubectl apply -f k8s/deployment.yaml
	@kubectl apply -f k8s/service.yaml
	@echo "⏳ Waiting for deployment to be ready..."
	@kubectl rollout status deployment/tsvai-harness -n tsvai --timeout=60s || echo "⚠️  Deployment timeout (pod may still be starting)"
	@echo ""
	@echo "✅ Deployment complete!"
	@echo ""
	@echo "Access dashboard:"
	@echo "  kubectl port-forward -n tsvai svc/tsvai-harness-api 8080:3000"
	@echo "  open http://localhost:8080"
	@echo ""
	@echo "Or use NodePort:"
	@echo "  open http://localhost:30000"

down:
	@echo "🛑 Removing TSVAI Harness..."
	@kubectl delete -f k8s/deployment.yaml --ignore-not-found=true
	@kubectl delete -f k8s/service.yaml --ignore-not-found=true
	@kubectl delete -f k8s/configmap.yaml --ignore-not-found=true
	@echo "✅ TSVAI Harness removed"

restart:
	@echo "🔄 Restarting deployment..."
	@kubectl rollout restart deployment/tsvai-harness -n tsvai
	@kubectl rollout status deployment/tsvai-harness -n tsvai --timeout=60s
	@echo "✅ Deployment restarted"

clean:
	@echo "🧹 Cleaning up (deleting namespace)..."
	@kubectl delete namespace tsvai --ignore-not-found=true
	@echo "✅ Cleanup complete"

reset: down up
	@echo "✅ Deployment reset"

# Monitoring & debugging
logs:
	@kubectl logs -n tsvai -l app=tsvai-harness -f --all-containers=true

status:
	@echo "📊 Deployment Status"
	@echo "===================="
	@kubectl get deployment -n tsvai tsvai-harness -o wide
	@echo ""
	@echo "Pods:"
	@kubectl get pods -n tsvai -o wide
	@echo ""
	@echo "Services:"
	@kubectl get svc -n tsvai -o wide

health:
	@echo "❤️  System Health Check"
	@echo "===================="
	@kubectl port-forward -n tsvai svc/tsvai-harness-api 8888:3000 > /dev/null 2>&1 & \
	sleep 2 && \
	curl -s http://localhost:8888/api/health | jq '.' && \
	pkill -f "kubectl port-forward.*8888" || true

dashboard:
	@echo "📊 Opening Dashboard..."
	@kubectl port-forward -n tsvai svc/tsvai-harness-api 8080:3000 > /dev/null 2>&1 & \
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
	@docker build -t tsvai-harness:latest .
	@echo "✅ Image built"
	@echo ""
	@echo "Loading into kind cluster..."
	@kind load docker-image tsvai-harness:latest --name dev-cluster
	@echo "✅ Image loaded into cluster"

# Database/storage targets
db-backup:
	@echo "💾 Backing up database..."
	@kubectl exec -n tsvai $$(kubectl get pods -n tsvai -l app=tsvai-harness -o jsonpath='{.items[0].metadata.name}') -- tar czf /tmp/backup.tar.gz /data/brain-wiki
	@kubectl cp tsvai/$$(kubectl get pods -n tsvai -l app=tsvai-harness -o jsonpath='{.items[0].metadata.name}'):/tmp/backup.tar.gz ./backup-$(shell date +%Y%m%d-%H%M%S).tar.gz
	@echo "✅ Backup created"

# Quick access shortcuts
port-forward:
	@echo "🔌 Starting port-forward on port 8080..."
	@echo "Access dashboard at: http://localhost:8080"
	@kubectl port-forward -n tsvai svc/tsvai-harness-api 8080:3000

shell:
	@echo "🐚 Opening pod shell..."
	@kubectl exec -it -n tsvai $$(kubectl get pods -n tsvai -l app=tsvai-harness -o jsonpath='{.items[0].metadata.name}') -- /bin/sh

describe:
	@echo "📝 Pod details:"
	@kubectl describe pod -n tsvai $$(kubectl get pods -n tsvai -l app=tsvai-harness -o jsonpath='{.items[0].metadata.name}')

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
