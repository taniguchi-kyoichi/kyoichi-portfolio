.PHONY: help install dev build check preview clean deploy cf-preview update

# Use mise to run bun commands (falls back to bun if mise is not available)
BUN := $(shell command -v mise >/dev/null 2>&1 && echo "mise exec -- bun" || echo "bun")
BUNX := $(shell command -v mise >/dev/null 2>&1 && echo "mise exec -- bunx" || echo "bunx")

# Default target
help:
	@echo "Usage: make [target]"
	@echo ""
	@echo "Development:"
	@echo "  install    Install dependencies"
	@echo "  dev        Start development server"
	@echo "  build      Build for production"
	@echo "  check      Run type checking"
	@echo "  preview    Preview production build locally"
	@echo ""
	@echo "Deployment:"
	@echo "  deploy     Deploy to Cloudflare Pages"
	@echo "  cf-preview Preview with Cloudflare Workers locally"
	@echo ""
	@echo "Maintenance:"
	@echo "  clean      Remove build artifacts"
	@echo "  update     Update dependencies"

# Development
install:
	$(BUN) install

dev:
	$(BUN) run dev

build:
	$(BUN) run build

check:
	$(BUN) run check

preview:
	$(BUN) run preview

# Deployment
deploy:
	$(BUN) run build
	$(BUNX) wrangler pages deploy .svelte-kit/cloudflare --commit-message "$$(git log -1 --pretty=%s)"

cf-preview:
	$(BUN) run build
	$(BUNX) wrangler pages dev .svelte-kit/cloudflare

# Maintenance
clean:
	rm -rf .svelte-kit build node_modules/.vite

update:
	$(BUN) update
