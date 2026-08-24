# AI-SubCook Platform Deployment Flow - Terraform Cloud

## Overview
This document outlines the deployment architecture and workflow for the AI-SubCook platform using Terraform Cloud for infrastructure-as-code management and automated deployments.

## Architecture

### Components
- **Terraform Cloud**: VCS integration, state management, and deployment orchestration
- **GitHub**: Source control and VCS trigger
- **AWS**: Cloud infrastructure provider
- **CI/CD Pipeline**: Automated testing and deployment

### Deployment Flow

```
┌─────────────┐
│   GitHub    │
│  Repo Push  │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────┐
│  Terraform Cloud VCS Trigger │
└──────┬──────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│  Plan Stage                  │
│  - Validate Terraform        │
│  - Cost Estimation           │
│  - Dependency Analysis       │
└──────┬───────────────────────┘
       │
       ▼ (Approval Required)
┌──────────────────────────────┐
│  Apply Stage                 │
│  - Deploy Infrastructure     │
│  - Update AWS Resources      │
│  - State Management          │
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│  Monitoring & Validation     │
│  - Health Checks             │
│  - Log Aggregation           │
│  - Alert Configuration       │
└──────────────────────────────┘
```

## Terraform Cloud Setup

### 1. Organization & Workspace Configuration

```hcl
# Terraform Cloud Variables
terraform_cloud_org = "tsvai"
workspace_name      = "ai-subcook-prod"
vcs_repository      = "TSVAISolutions/tsvai-harness"
```

### 2. VCS Integration
- **Provider**: GitHub
- **Branch**: `main` (configured for auto-deployment)
- **Trigger**: Push to main branch triggers plan automatically
- **Approval**: Manual approval required before apply

### 3. State Management
- **Backend**: Terraform Cloud Remote State
- **Locking**: Automatic state locking to prevent conflicts
- **Versioning**: All state changes tracked with timestamps
- **Encryption**: State encrypted at rest and in transit

## Deployment Environments

### Development
- **Workspace**: `ai-subcook-dev`
- **Auto-apply**: Enabled for testing
- **Variables**: Non-production credentials
- **Cleanup**: Automatic resource cleanup after 30 days of inactivity

### Staging
- **Workspace**: `ai-subcook-staging`
- **Auto-apply**: Disabled (manual approval)
- **Variables**: Staging credentials and configurations
- **Duration**: Persistent for testing cycles

### Production
- **Workspace**: `ai-subcook-prod`
- **Auto-apply**: Disabled (requires explicit approval)
- **Variables**: Production credentials with enhanced security
- **Approval**: Requires 2-approver policy
- **Notifications**: Slack alerts for plan and apply events

## Configuration Management

### Environment Variables in Terraform Cloud

```
# AWS Credentials
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_REGION

# Terraform Variables
environment
project_name
deployment_region
instance_count
```

### Sensitive Variables
- Mark all credentials as sensitive
- Rotate credentials every 90 days
- Use AWS IAM roles instead of access keys where possible
- Enable MFA for production approvals

## Deployment Process

### Step 1: Code Commit & Push
```bash
git add .
git commit -m "feat: update infrastructure"
git push origin main
```

### Step 2: Terraform Cloud Plan
- Automatically triggered on VCS push
- Generates plan with AWS resource changes
- Costs estimated for review
- Plan available in Terraform Cloud UI

### Step 3: Review & Approve
- Review plan in Terraform Cloud
- Check resource changes and costs
- Add comments if needed
- Approve to proceed

### Step 4: Apply
- Apply stage creates/updates AWS resources
- State file updated in Terraform Cloud
- Deployment status tracked
- Notifications sent on completion

### Step 5: Post-Deployment
- Health checks run automatically
- Monitoring dashboards updated
- Logs aggregated in CloudWatch
- Alerts configured in Grafana

## Key AWS Resources

### Compute
- **ECS Clusters**: Container orchestration
- **EC2 Instances**: Compute resources
- **Lambda Functions**: Serverless components
- **Auto Scaling Groups**: Dynamic scaling

### Networking
- **VPC**: Virtual network isolation
- **ALB**: Application load balancer
- **Security Groups**: Network access control
- **NAT Gateway**: Outbound internet access

### Data & Storage
- **RDS**: Relational database
- **S3 Buckets**: Object storage
- **ElastiCache**: Caching layer
- **Secrets Manager**: Credential storage

### Monitoring & Logging
- **CloudWatch**: Logs and metrics
- **CloudTrail**: API audit logging
- **X-Ray**: Distributed tracing

## Best Practices

### 1. Terraform Code
- Use modular structure for reusability
- Implement consistent naming conventions
- Document all variables and outputs
- Use `.terraform-lock.hcl` for version pinning

### 2. State Management
- Never store state locally in production
- Enable state locking to prevent conflicts
- Regular state backups (handled by Terraform Cloud)
- Use state isolation per environment

### 3. Security
- Use Terraform Cloud variable sets for shared variables
- Enable audit logging for all API calls
- Implement least-privilege IAM policies
- Rotate credentials regularly

### 4. Deployment Strategy
- Use blue-green deployments for zero downtime
- Implement canary deployments for gradual rollouts
- Maintain rollback procedures
- Test infrastructure changes in staging first

### 5. Cost Optimization
- Review Terraform Cloud cost estimates before apply
- Use auto-scaling for variable workloads
- Implement resource cleanup policies
- Monitor AWS spending via Cost Explorer

## Monitoring & Alerts

### Terraform Cloud Events
- Plan completion
- Apply success/failure
- State changes
- Policy violations

### AWS Monitoring
- Resource utilization
- Application performance
- Error rates
- Cost tracking

### Notification Channels
- Slack: Real-time deployment alerts
- Email: Weekly summary reports
- PagerDuty: Critical incident escalation
- CloudWatch: Log-based alerts

## Troubleshooting

### Common Issues

#### 1. State Lock
**Problem**: Another apply operation in progress  
**Solution**: Check Terraform Cloud UI, wait for completion or force unlock if stuck

#### 2. Plan Diff Unexpected
**Problem**: Plan shows changes not in code  
**Solution**: Check for drift detection, review AWS console for manual changes

#### 3. Apply Failure
**Problem**: AWS API errors during apply  
**Solution**: Check AWS service limits, IAM permissions, and CloudTrail logs

#### 4. VCS Trigger Not Working
**Problem**: Push to main doesn't trigger plan  
**Solution**: Verify VCS integration, webhook configuration, and branch settings

## Maintenance Schedule

| Task | Frequency | Owner |
|------|-----------|-------|
| Credential rotation | Every 90 days | DevOps |
| Terraform version updates | Quarterly | DevOps |
| State backup verification | Monthly | DevOps |
| Cost review & optimization | Monthly | Finance/DevOps |
| Security audit | Quarterly | Security |
| Disaster recovery drill | Semi-annually | DevOps |

## References & Documentation

- [Terraform Cloud Documentation](https://www.terraform.io/cloud-docs)
- [AWS Provider Reference](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [Terraform Best Practices](https://www.terraform.io/docs/language/index.html)
- [AI-SubCook Repository](https://github.com/TSVAISolutions/ai-subcook)

## Support & Escalation

- **DevOps Team**: @devops-team on Slack
- **Infrastructure Issues**: Create issue in `tsvai-harness` repo
- **Terraform Cloud Support**: https://support.hashicorp.com
- **AWS Support**: AWS Console Support Center

---

**Last Updated**: 2026-08-24  
**Version**: 1.0  
**Maintainer**: DevOps Team
