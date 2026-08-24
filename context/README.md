# Context Documentation

This folder contains architectural context, deployment flows, and infrastructure documentation for the TSVAI Solutions monorepo projects.

## Folder Structure

```
context/
├── deployments/
│   └── ai-subcook-platform-deployment.md
└── README.md (this file)
```

## Documentation

### Deployments

#### [AI-SubCook Platform Deployment Flow](./deployments/ai-subcook-platform-deployment.md)
Comprehensive guide for the AI-SubCook platform deployment architecture using Terraform Cloud.

**Key Sections:**
- Architecture overview and deployment flow
- Terraform Cloud setup and configuration
- Environment management (dev, staging, prod)
- AWS resources and infrastructure
- Deployment process step-by-step
- Best practices and security guidelines
- Monitoring, alerting, and troubleshooting
- Maintenance schedules

## Adding New Context

To add new documentation:

1. Create appropriate folder under `context/` (e.g., `context/architecture/`, `context/runbooks/`)
2. Add markdown files with clear structure and headings
3. Include diagrams where helpful (ASCII or Mermaid)
4. Update this README with links to new documentation

## Guidelines

- Use clear, descriptive titles
- Include architecture diagrams
- Provide step-by-step procedures
- List common troubleshooting issues
- Keep documentation updated with changes
- Include contact information for support

---

**Last Updated**: 2026-08-24
