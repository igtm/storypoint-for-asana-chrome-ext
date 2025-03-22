.DEFAULT_GOAL := help

.PHONY: help zip
help:
	@grep -E '^[a-z0-9A-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

build: ## build for distribution
	yarn build

zip: build ## zip for distribution
	zip -r package.zip dist
