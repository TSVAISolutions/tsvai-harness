#!/bin/bash

# TSVAI Harness - Deployment Script
# Automates testing and deployment to local Kubernetes

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
LOG_FILE="${SCRIPT_DIR}/deployment.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
  echo -e "${BLUE}[INFO]${NC} $1" | tee -a "$LOG_FILE"
}

log_success() {
  echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

log_warn() {
  echo -e "${YELLOW}[WARN]${NC} $1" | tee -a "$LOG_FILE"
}

log_error() {
  echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
}

# Check prerequisites
check_prerequisites() {
  log_info "Checking prerequisites..."

  # Check Docker
  if ! command -v docker &> /dev/null; then
    log_error "Docker is not installed"
    exit 1
  fi
  log_success "Docker is installed"

  # Check Kubernetes
  if ! command -v kubectl &> /dev/null; then
    log_error "kubectl is not installed"
    exit 1
  fi
  log_success "kubectl is installed"

  # Check Kubernetes cluster
  if ! kubectl cluster-info &> /dev/null; then
    log_error "Kubernetes cluster is not running"
    exit 1
  fi
  log_success "Kubernetes cluster is running"

  # Check Node.js
  if ! command -v node &> /dev/null; then
    log_error "Node.js is not installed"
    exit 1
  fi
  NODE_VERSION=$(node --version)
  log_success "Node.js $NODE_VERSION is installed"

  # Check npm
  if ! command -v npm &> /dev/null; then
    log_error "npm is not installed"
    exit 1
  fi
  NPM_VERSION=$(npm --version)
  log_success "npm $NPM_VERSION is installed"
}

# Run tests
run_tests() {
  log_info "Running test suite..."

  cd "$SCRIPT_DIR"

  # Install dependencies
  if [ ! -d "node_modules" ]; then
    log_info "Installing dependencies..."
    npm install
  fi

  # Run tests
  npm test 2>&1 | tee -a "$LOG_FILE"

  if [ $? -eq 0 ]; then
    log_success "All tests passed"
  else
    log_error "Tests failed"
    exit 1
  fi
}

# Build Docker image
build_docker_image() {
  log_info "Building Docker image..."

  cd "$SCRIPT_DIR"

  if docker build -t tsvai-harness:latest . 2>&1 | tee -a "$LOG_FILE"; then
    log_success "Docker image built successfully"
  else
    log_error "Failed to build Docker image"
    exit 1
  fi
}

# Deploy to Kubernetes (manual)
deploy_kubernetes_manual() {
  log_info "Deploying to Kubernetes (manual mode)..."

  # Create namespace
  log_info "Creating namespace..."
  kubectl apply -f "$SCRIPT_DIR/k8s/namespace.yaml" | tee -a "$LOG_FILE"

  # Create ConfigMap
  log_info "Creating ConfigMap..."
  kubectl apply -f "$SCRIPT_DIR/k8s/configmap.yaml" | tee -a "$LOG_FILE"

  # Deploy application
  log_info "Deploying application..."
  kubectl apply -f "$SCRIPT_DIR/k8s/deployment.yaml" | tee -a "$LOG_FILE"

  # Create services
  log_info "Creating services..."
  kubectl apply -f "$SCRIPT_DIR/k8s/service.yaml" | tee -a "$LOG_FILE"

  # Wait for rollout
  log_info "Waiting for deployment to be ready..."
  kubectl rollout status deployment/tsvai-harness -n tsvai --timeout=5m

  log_success "Deployment completed successfully"
}

# Setup ArgoCD
setup_argocd() {
  log_info "Setting up ArgoCD for GitOps..."

  # Check if ArgoCD namespace exists
  if ! kubectl get namespace argocd &> /dev/null; then
    log_info "Installing ArgoCD..."
    kubectl create namespace argocd
    kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

    log_info "Waiting for ArgoCD to be ready..."
    sleep 30
  else
    log_info "ArgoCD namespace already exists"
  fi

  log_success "ArgoCD setup completed"

  # Get admin password
  log_info "Retrieving ArgoCD admin password..."
  ARGOCD_PASSWORD=$(kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" 2>/dev/null | base64 -d || echo "admin")

  log_info "ArgoCD admin password: $ARGOCD_PASSWORD"
  log_info "Access ArgoCD at: https://localhost:8080"
  log_info "To port-forward: kubectl port-forward svc/argocd-server -n argocd 8080:443"
}

# Deploy via ArgoCD
deploy_argocd() {
  log_info "Deploying via ArgoCD (GitOps)..."

  # Create tsvai namespace
  kubectl create namespace tsvai --dry-run=client -o yaml | kubectl apply -f -

  # Apply ArgoCD Application manifest
  kubectl apply -f "$SCRIPT_DIR/k8s/argocd-application.yaml" | tee -a "$LOG_FILE"

  log_info "Waiting for ArgoCD application to sync..."
  sleep 10

  # Check sync status
  if command -v argocd &> /dev/null; then
    argocd app wait tsvai-harness --sync || log_warn "ArgoCD wait command failed"
  fi

  log_success "ArgoCD deployment completed"
}

# Verify deployment
verify_deployment() {
  log_info "Verifying deployment..."

  # Check pods
  log_info "Checking pods..."
  kubectl get pods -n tsvai

  # Check services
  log_info "Checking services..."
  kubectl get svc -n tsvai

  # Check events
  log_info "Recent events..."
  kubectl get events -n tsvai --sort-by='.lastTimestamp' | tail -10

  log_success "Deployment verification completed"
}

# Show access information
show_access_info() {
  log_info "TSVAI Harness Deployment Complete!"
  echo ""
  echo "════════════════════════════════════════════════════════════"
  echo "  Access Information"
  echo "════════════════════════════════════════════════════════════"
  echo ""
  echo "To access the application, run:"
  echo ""
  echo "  # Port-forward API"
  echo "  kubectl port-forward -n tsvai svc/tsvai-harness-api 3000:3000 &"
  echo ""
  echo "  # Port-forward Dashboard"
  echo "  kubectl port-forward -n tsvai svc/tsvai-dashboard 3001:3001 &"
  echo ""
  echo "Then access:"
  echo "  - API:       http://localhost:3000"
  echo "  - Dashboard: http://localhost:3001"
  echo ""
  echo "════════════════════════════════════════════════════════════"
  echo ""
  echo "Useful commands:"
  echo "  kubectl get pods -n tsvai                    # View pods"
  echo "  kubectl logs -n tsvai -l app=tsvai-harness  # View logs"
  echo "  kubectl describe pod -n tsvai <pod-name>    # Pod details"
  echo ""
}

# Show usage
show_usage() {
  echo "Usage: ./deploy.sh [OPTIONS]"
  echo ""
  echo "Options:"
  echo "  --test              Run tests only"
  echo "  --build             Build Docker image only"
  echo "  --deploy-k8s        Deploy to Kubernetes (manual)"
  echo "  --argocd            Setup ArgoCD for GitOps"
  echo "  --deploy-argocd     Deploy via ArgoCD"
  echo "  --verify            Verify deployment"
  echo "  --full              Run all steps (default)"
  echo "  --help              Show this help message"
  echo ""
  echo "Examples:"
  echo "  ./deploy.sh                    # Full deployment"
  echo "  ./deploy.sh --test             # Run tests only"
  echo "  ./deploy.sh --deploy-k8s       # Manual K8s deployment"
  echo "  ./deploy.sh --argocd           # Setup ArgoCD"
  echo ""
}

# Main execution
main() {
  echo "════════════════════════════════════════════════════════════"
  echo "  TSVAI Harness Deployment Script"
  echo "════════════════════════════════════════════════════════════"
  echo ""

  # Initialize log file
  > "$LOG_FILE"

  # Default to full deployment
  MODE="${1:-full}"

  case "$MODE" in
    --test)
      check_prerequisites
      run_tests
      ;;
    --build)
      check_prerequisites
      build_docker_image
      ;;
    --deploy-k8s)
      check_prerequisites
      build_docker_image
      deploy_kubernetes_manual
      verify_deployment
      show_access_info
      ;;
    --argocd)
      check_prerequisites
      setup_argocd
      ;;
    --deploy-argocd)
      check_prerequisites
      setup_argocd
      deploy_argocd
      verify_deployment
      show_access_info
      ;;
    --verify)
      verify_deployment
      ;;
    --full)
      check_prerequisites
      run_tests
      build_docker_image
      deploy_kubernetes_manual
      verify_deployment
      show_access_info
      ;;
    --help)
      show_usage
      ;;
    *)
      log_error "Unknown option: $MODE"
      show_usage
      exit 1
      ;;
  esac

  log_success "Deployment script completed"
}

# Run main function
main "$@"
