# Harness Monorepo

Central workspace for all TSVAI Solutions repositories using Git submodules.

## Quick Start

Clone with submodules:
```bash
git clone --recursive https://github.com/tsvai-solutions/harness.git
cd harness
```

Update submodules:
```bash
git submodule update --init --recursive
git pull --recurse-submodules
```

## Repository Structure

```
harness/
└── submodules/
    ├── frontend/         # PMS Frontend (pms-frontend)
    ├── backend/          # PMS Backend (pms-backend)
    └── platform/         # PMS Platform (pms-platform)
```

## Working with Submodules

**Make changes in a submodule:**
```bash
cd backend/api-gateway
git checkout -b feature/my-feature
# Make changes
git add .
git commit -m "your message"
git push origin feature/my-feature
cd ../..
git add backend/api-gateway
git commit -m "update submodule"
```

**Add a new submodule:**
```bash
git submodule add https://github.com/tsvai-solutions/repo.git path/to/repo
git add .gitmodules path/to/repo
git commit -m "add repo submodule"
git push
```

**View submodule status:**
```bash
git submodule status
```

## Contributing

See individual repository READMEs for specific contribution guidelines.
