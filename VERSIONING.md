# TSVAI CLI - Automatic Versioning Guide

Complete guide to understanding semantic versioning and automatic version bumping in TSVAI CLI.

## How It Works

**semantic-release** automatically increments versions based on commit messages. **No manual version updates needed!**

```
Your commit → CI/CD analyzes commit type → Bumps version → Creates release
```

---

## Commit Message Format

All commits must follow **Conventional Commits** format:

```
type(scope): description

[optional body]
[optional footer]
```

### Examples

```bash
# New feature → minor version bump (1.0.0 → 1.1.0)
git commit -m "feat(cli): add user search command"

# Bug fix → patch version bump (1.1.0 → 1.1.1)
git commit -m "fix(auth): handle token refresh on 401"

# Performance improvement → patch version bump
git commit -m "perf(api): optimize resource queries"

# Documentation → NO version bump
git commit -m "docs(readme): add usage examples"

# Chore/Refactor → NO version bump (unless you really need to)
git commit -m "chore(deps): update dependencies"
```

---

## Version Bump Rules

| Type | Release | Example |
|------|---------|---------|
| `feat` | **Minor** | 1.0.0 → **1.1.0** |
| `fix` | **Patch** | 1.1.0 → 1.1.**1** |
| `perf` | **Patch** | 1.1.1 → 1.1.**2** |
| `revert` | **Patch** | 1.1.2 → 1.1.**3** |
| `docs` | **No bump** | 1.1.3 → 1.1.3 |
| `style` | **No bump** | 1.1.3 → 1.1.3 |
| `test` | **No bump** | 1.1.3 → 1.1.3 |
| `chore` | **No bump** | 1.1.3 → 1.1.3 |
| `ci` | **No bump** | 1.1.3 → 1.1.3 |

---

## Semantic Versioning (SemVer)

Format: `MAJOR.MINOR.PATCH`

```
1.2.3
│ │ └─ PATCH: Bug fixes & maintenance (1.2.2 → 1.2.3)
│ └─── MINOR: New features, backward compatible (1.2.0 → 1.3.0)
└───── MAJOR: Breaking changes (1.0.0 → 2.0.0)
```

---

## Automatic Release Workflow

### 1. You Commit Code

```bash
git commit -m "feat(users): add batch user creation"
git push origin main
```

### 2. GitHub Actions Triggers

```yaml
# On: push to main
- Runs semantic-release
- Analyzes commit messages
- Bumps version in package.json
- Generates changelog
- Creates GitHub release
- Publishes to npm
```

### 3. What Gets Updated

✅ **Automatically updated:**
- `package.json` versions
- `bun.lock` dependencies
- `CHANGELOG.md` release notes
- GitHub release + tag
- npm package published

✅ **New release created:**
```
cli-v1.2.0 (GitHub Release)
├── tsvai.mjs (5.5 MB)
├── tsvai.mjs.sha256
└── Release notes (generated from commits)
```

---

## Real Example Flow

### Scenario: Adding New Feature

```bash
# 1. Work on feature
git checkout -b feat/user-search
# ... make changes ...

# 2. Commit with conventional format
git commit -m "feat(users): add full-text search capability

- Implement user search by email and name
- Add pagination support
- Add sort options

Closes #123"

# 3. Push to main
git push origin main

# 4. GitHub Actions:
#    - semantic-release analyzes commit
#    - Sees "feat(" type → MINOR bump
#    - Old version: 1.0.0
#    - New version: 1.1.0
#    - Creates tag: cli-v1.1.0
#    - Publishes release with artifacts
```

### Timeline

```
10:00 - Push commit "feat(users): add search"
10:01 - GitHub Actions triggered
10:02 - semantic-release runs
10:03 - Version bumped: 1.0.0 → 1.1.0
10:04 - Release created: cli-v1.1.0
10:05 - Available on npm & GitHub releases
```

---

## Configuration (.releaserc.json)

### Commit Analysis
```json
"@semantic-release/commit-analyzer": {
  "preset": "angular",  // Use Angular commit conventions
  "releaseRules": [     // Define bump rules
    { "type": "feat", "release": "minor" },
    { "type": "fix", "release": "patch" }
  ]
}
```

### Changelog Generation
```json
"@semantic-release/release-notes-generator"
// Generates release notes from commits
// Format: version, date, features, fixes
```

### Version Sync
```json
"@semantic-release/exec": {
  "prepareCmd": "node scripts/sync-versions.js ${nextRelease.version}"
  // Syncs version across all package.json files
}
```

### Publishing
```json
"@semantic-release/npm": { 
  "npmPublish": false  // Don't auto-publish to public npm
},
"@semantic-release/github": {}  // Publish to GitHub releases
```

---

## How Harness Gets Latest CLI

### Automatic Submodule Update

When CLI releases a new version:

```bash
# In tsvai-harness repo
cd ai/cli
git pull origin main

# cli-v1.1.0 is now available
# Harness can download: cli-v1.1.0/tsvai.mjs
```

### Plugin Workflow Uses Latest

```yaml
# .github/workflows/build-plugin.yml
- name: Download standalone CLI
  run: gh release download cli-v1.1.0 --repo TSVAISolutions/cli
  # Automatically uses latest release
```

---

## Breaking Changes (MAJOR Version)

For breaking changes, add a footer:

```bash
git commit -m "feat(api): change user response format

BREAKING CHANGE: /users endpoint now returns 'id' instead of 'userId'"
```

**Result:** Version bumps MAJOR (1.0.0 → **2.0.0**)

---

## Tips for Good Commits

### ✅ Good Commit Messages

```bash
# Clear scope and type
git commit -m "feat(auth): implement OAuth token refresh"

# With body explanation
git commit -m "fix(data): handle null values in export

Previously, null values in JSON export caused parsing errors.
Now they are properly handled as empty strings."

# Reference issues
git commit -m "fix(users): resolve duplicate user creation

Closes #456"
```

### ❌ Bad Commit Messages

```bash
# No type
git commit -m "update cli"

# Unclear scope
git commit -m "fix: stuff"

# Not following format
git commit -m "CLI version bump to 1.2.0"
```

---

## Check Current Version

```bash
# In package.json
cat package.json | grep '"version"'

# Current: "version": "1.104.0"
```

## View Release History

```bash
# See all releases
gh release list -R TSVAISolutions/cli

# View specific release
gh release view cli-v1.105.0 -R TSVAISolutions/cli
```

---

## Summary: Version Bumping Flow

```
1. Developer commits code
   ↓
2. Commit message analyzed
   ├─ feat → MINOR bump
   ├─ fix → PATCH bump
   └─ docs → NO bump
   ↓
3. Version automatically incremented
   ├─ package.json updated
   ├─ CHANGELOG.md generated
   └─ Artifacts created
   ↓
4. GitHub Release created
   ├─ Tag: cli-v1.105.0
   ├─ Artifacts: tsvai.mjs + sha256
   └─ Release notes from commits
   ↓
5. Available for download
   ├─ GitHub Releases
   ├─ npm registry
   └─ Harness can fetch
```

---

## No Manual Versioning Needed!

**The beauty of semantic-release:**

✅ Developers write good commits  
✅ CI/CD analyzes and decides version  
✅ Everything automated (version, changelog, release, publish)  
✅ No merge conflicts from version bumps  
✅ Release history always accurate  

---

## Resources

- [Semantic Versioning](https://semver.org/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [semantic-release](https://semantic-release.gitbook.io/)
- [Angular Commit Conventions](https://github.com/angular/angular/blob/master/CONTRIBUTING.md#-commit-message-guidelines)

---

**That's it! Just commit with proper format and CI/CD handles the rest.** 🚀
