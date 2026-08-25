# TSVAI Harness Makefile
# Manage submodules, domains, and development workflows

# Domain definitions — a domain groups related submodules
DOMAIN_platform := \
	submodules/platform/pms-platform

DOMAIN_frontend := \
	submodules/frontend/pms-frontend \
	submodules/frontend/admin-dashboard

DOMAIN_backend := \
	submodules/backend/pms-backend

# Computed groups (kept out of DOMAINS so `help` listing stays compact):
#   backend → every submodules/backend/* entry in .gitmodules
#   all     → every submodule entry in .gitmodules
DOMAIN_backend := $(shell grep '^[[:space:]]*path = submodules/backend/' .gitmodules | sed 's/.*path = //')
DOMAIN_all     := $(shell grep '^[[:space:]]*path = ' .gitmodules | sed 's/.*path = //' | grep -v '^ai/')

DOMAINS := platform frontend backend

_service := $(word 2, $(MAKECMDGOALS))
_domain  := $(DOMAIN_$(_service))
_path     = $(if $(_domain),$(_domain),$(shell grep 'path = .*/$(_service)$$' .gitmodules | head -1 | sed 's/.*path = //'))

# Resolve ONE service/domain name to its submodule path(s)
_resolve_path = $(if $(DOMAIN_$(1)),$(DOMAIN_$(1)),$(shell grep 'path = .*/$(1)$$' .gitmodules | head -1 | sed 's/.*path = //'))

# Every goal word after the target
_services := $(wordlist 2, $(words $(MAKECMDGOALS)), $(MAKECMDGOALS))
_paths    := $(foreach s,$(_services),$(call _resolve_path,$(s)))
_unknown  := $(strip $(foreach s,$(_services),$(if $(call _resolve_path,$(s)),,$(s))))
_upaths   := $(sort $(_paths))

# Run a git submodule command using SSH if available, HTTPS otherwise
define _git
	@ssh -T -o ConnectTimeout=3 -o BatchMode=yes git@github.com 2>/dev/null; \
	SSHRC=$$?; \
	if [ $$SSHRC -eq 0 ] || [ $$SSHRC -eq 1 ]; then \
		echo "→ using SSH"; \
		git -c 'url.git@github.com:.insteadOf=https://github.com/' $(1); \
	else \
		echo "→ using HTTPS"; \
		git $(1); \
	fi
endef

# Checkout at declared branch in .gitmodules
define _checkout_declared
	@for dir in $(_upaths); do \
		name=$$(git config -f .gitmodules --get-regexp '^submodule\..*\.path$$' | awk -v d="$$dir" '$$2==d{print $$1}' | sed 's/\.path$$//'); \
		br=$$(git config -f .gitmodules --get "$$name.branch" 2>/dev/null); \
		if [ -n "$$br" ] && git -C $$dir checkout "$$br" 2>/dev/null; then :; \
		elif git -C $$dir checkout main 2>/dev/null; then :; \
		elif git -C $$dir checkout master 2>/dev/null; then :; \
		else echo "  WARN $$dir: no $${br:-main}/master branch"; fi; \
	done
endef

define _list_domains
	@echo "Available domains:"; \
	echo ""; \
	$(foreach d,$(DOMAINS),printf "  · %-20s %s\n" "$(d)" "$$(echo '$(notdir $(DOMAIN_$(d)))' | sed 's/ /, /g')";) \
	echo ""
endef

.PHONY: help setup update clear status sync use plugin-build

help:
	@echo "TSVAI Harness targets:"
	@echo "  make setup <domain|service>...      Clone at main/declared branch (accepts a list)"
	@echo "  make update <domain|service>...     Pull latest branch (accepts a list)"
	@echo "  make clear <domain|service>         Remove working tree (deinit)"
	@echo "  make status <domain|service>        Show status of submodule(s)"
	@echo "  make sync                           Fetch all submodule remotes"
	@echo "  make use <domain|service>...        Load context into AGENTS.md (accepts a list)"
	@echo "  make plugin-build                   Build plugin for Claude Code"
	@echo "  make plugin-setup                   Setup plugin environment"
	@echo "  make domains                        List available domains"
	@echo ""

domains:
	$(call _list_domains)

setup:
	@if [ -z "$(_services)" ]; then echo "Usage: make setup <domain|service>..."; exit 1; fi
	@if [ -n "$(_unknown)" ]; then echo "Unknown services: $(_unknown)"; exit 1; fi
	$(call _git,submodule update --init --remote $(_upaths))
	$(call _checkout_declared)

update:
	@if [ -z "$(_services)" ]; then echo "Usage: make update <domain|service>..."; exit 1; fi
	@if [ -n "$(_unknown)" ]; then echo "Unknown services: $(_unknown)"; exit 1; fi
	$(call _git,submodule update --remote $(_upaths))
	$(call _checkout_declared)

clear:
	@if [ -z "$(_service)" ]; then echo "Usage: make clear <domain|service>"; exit 1; fi
	@if [ -n "$(_unknown)" ]; then echo "Unknown service: $(_unknown)"; exit 1; fi
	$(call _git,submodule deinit -f $(_path))
	@rm -rf $(_path)

status:
	@if [ -z "$(_service)" ]; then \
		$(call _git,submodule status); \
	else \
		$(call _git,submodule status $(_path)); \
	fi

sync:
	$(call _git,submodule foreach git fetch origin)

use:
	@if [ -z "$(_services)" ]; then echo "Usage: make use <domain|service>..."; exit 1; fi
	@echo "Updating AGENTS.md for services: $(_services)"
	@echo "Remember to update AGENTS.md with your work"

plugin-setup:
	@echo "Setting up plugin environment..."
	@cd ai/plugin && bash scripts/setup.sh

plugin-build:
	@echo "Building plugin for Claude Code..."
	@cd ai/plugin && bash scripts/build-claude-code.sh

%:
	@:
