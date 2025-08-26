# WalkScape Solidity Contract Makefile
# Convenient commands for development, testing, and deployment

.DEFAULT_GOAL := help

# Colors
CYAN := \033[36m
GREEN := \033[32m
YELLOW := \033[33m
RED := \033[31m
RESET := \033[0m

# Variables
NETWORK ?= zetachain-mainnet
ADMIN_ADDRESS ?= $(shell cast wallet address --private-key $(PRIVATE_KEY) 2>/dev/null || echo "")

.PHONY: help install build test clean deploy verify setup local-deploy test-deploy format lint gas-report coverage

help: ## Show this help message
	@echo "$(CYAN)WalkScape Solidity Contract Commands$(RESET)"
	@echo "=================================="
	@echo ""
	@awk 'BEGIN {FS = ":.*##"} /^[a-zA-Z_-]+:.*##/ { printf "$(GREEN)%-20s$(RESET) %s\n", $$1, $$2 }' $(MAKEFILE_LIST)
	@echo ""
	@echo "$(YELLOW)Environment Variables:$(RESET)"
	@echo "  PRIVATE_KEY     - Private key for deployment (required)"
	@echo "  NETWORK         - Target network (default: zetachain-mainnet)"
	@echo "  ADMIN_ADDRESS   - Admin address (default: deployer address)"
	@echo ""
	@echo "$(YELLOW)Examples:$(RESET)"
	@echo "  make deploy NETWORK=zetachain-mainnet"
	@echo "  make test-deploy"
	@echo "  make verify NETWORK=zetachain-mainnet"

install: ## Install dependencies
	@echo "$(CYAN)Installing dependencies...$(RESET)"
	forge install
	@echo "$(GREEN)✅ Dependencies installed!$(RESET)"

build: ## Build the contracts
	@echo "$(CYAN)Building contracts...$(RESET)"
	forge build
	@echo "$(GREEN)✅ Build completed!$(RESET)"

test: ## Run all tests
	@echo "$(CYAN)Running tests...$(RESET)"
	forge test -vvv
	@echo "$(GREEN)✅ Tests completed!$(RESET)"

test-verbose: ## Run tests with maximum verbosity
	@echo "$(CYAN)Running tests with maximum verbosity...$(RESET)"
	forge test -vvvv

test-match: ## Run specific test (usage: make test-match PATTERN=testPlayerRegistration)
	@echo "$(CYAN)Running tests matching pattern: $(PATTERN)$(RESET)"
	forge test --match-test $(PATTERN) -vvv

test-contract: ## Run tests for specific contract (usage: make test-contract CONTRACT=WalkScapeCoreTest)
	@echo "$(CYAN)Running tests for contract: $(CONTRACT)$(RESET)"
	forge test --match-contract $(CONTRACT) -vvv

clean: ## Clean build artifacts
	@echo "$(CYAN)Cleaning build artifacts...$(RESET)"
	forge clean
	rm -f deployment_info.json
	@echo "$(GREEN)✅ Cleaned!$(RESET)"

format: ## Format code
	@echo "$(CYAN)Formatting code...$(RESET)"
	forge fmt
	@echo "$(GREEN)✅ Code formatted!$(RESET)"

lint: ## Lint code
	@echo "$(CYAN)Linting code...$(RESET)"
	forge fmt --check
	@echo "$(GREEN)✅ Code linting completed!$(RESET)"

gas-report: ## Generate gas usage report
	@echo "$(CYAN)Generating gas report...$(RESET)"
	forge test --gas-report
	@echo "$(GREEN)✅ Gas report generated!$(RESET)"

coverage: ## Generate test coverage report
	@echo "$(CYAN)Generating coverage report...$(RESET)"
	forge coverage
	@echo "$(GREEN)✅ Coverage report generated!$(RESET)"

coverage-report: ## Generate detailed HTML coverage report
	@echo "$(CYAN)Generating detailed coverage report...$(RESET)"
	forge coverage --report lcov
	genhtml lcov.info --branch-coverage --output-dir coverage/
	@echo "$(GREEN)✅ Detailed coverage report generated in coverage/ directory!$(RESET)"

# Local development commands
local-node: ## Start local Anvil node
	@echo "$(CYAN)Starting local Anvil node...$(RESET)"
	anvil --host 0.0.0.0 --port 8545

local-deploy: ## Deploy to local network
	@echo "$(CYAN)Deploying to local network...$(RESET)"
	./deploy_zetachain.sh local --setup --test-data
	@echo "$(GREEN)✅ Local deployment completed!$(RESET)"

# Network deployment commands
deploy: ## Deploy to specified network (usage: make deploy NETWORK=zetachain-mainnet)
	@echo "$(CYAN)Deploying to $(NETWORK)...$(RESET)"
	@if [ -z "$(PRIVATE_KEY)" ]; then \
		echo "$(RED)❌ Error: PRIVATE_KEY not set$(RESET)"; \
		exit 1; \
	fi
	./deploy_zetachain.sh $(NETWORK) --verify
	@echo "$(GREEN)✅ Deployment to $(NETWORK) completed!$(RESET)"

deploy-setup: ## Deploy and run setup (usage: make deploy-setup NETWORK=zetachain-mainnet)
	@echo "$(CYAN)Deploying to $(NETWORK) with setup...$(RESET)"
	@if [ -z "$(PRIVATE_KEY)" ]; then \
		echo "$(RED)❌ Error: PRIVATE_KEY not set$(RESET)"; \
		exit 1; \
	fi
	./deploy_zetachain.sh $(NETWORK) --verify --setup
	@echo "$(GREEN)✅ Deployment with setup to $(NETWORK) completed!$(RESET)"

test-deploy: ## Deploy to testnet with test data (usage: make test-deploy NETWORK=zetachain-mainnet)
	@echo "$(CYAN)Deploying to $(NETWORK) with test data...$(RESET)"
	@if [ -z "$(PRIVATE_KEY)" ]; then \
		echo "$(RED)❌ Error: PRIVATE_KEY not set$(RESET)"; \
		exit 1; \
	fi
	./deploy_zetachain.sh $(NETWORK) --verify --setup --test-data
	@echo "$(GREEN)✅ Test deployment to $(NETWORK) completed!$(RESET)"

# Verification commands
verify: ## Verify deployed contract (usage: make verify NETWORK=sepolia CONTRACT_ADDRESS=0x...)
	@echo "$(CYAN)Verifying contract on $(NETWORK)...$(RESET)"
	@if [ -z "$(CONTRACT_ADDRESS)" ]; then \
		echo "$(RED)❌ Error: CONTRACT_ADDRESS not set$(RESET)"; \
		exit 1; \
	fi
	CONTRACT_ADDRESS=$(CONTRACT_ADDRESS) forge script script/Deploy.s.sol:VerifyDeployment --rpc-url $(RPC_URL)
	@echo "$(GREEN)✅ Contract verification completed!$(RESET)"

# Quick deployment commands for different networks
zetachain-mainnet: ## Deploy to ZetaChain Mainnet
	@$(MAKE) deploy NETWORK=zetachain-mainnet

zetachain: ## Deploy to ZetaChain Mainnet (alias)
	@$(MAKE) deploy NETWORK=zetachain-mainnet

# Development workflow commands
dev-setup: build test ## Build and test (development setup)
	@echo "$(GREEN)✅ Development setup completed!$(RESET)"

pre-deploy: clean build test lint ## Full pre-deployment checks
	@echo "$(CYAN)Running pre-deployment checks...$(RESET)"
	@echo "$(GREEN)✅ All pre-deployment checks passed!$(RESET)"

full-test: clean build test gas-report coverage ## Run full test suite with reports
	@echo "$(GREEN)✅ Full test suite completed!$(RESET)"

# Utility commands
check-env: ## Check environment variables
	@echo "$(CYAN)Checking environment...$(RESET)"
	@echo "PRIVATE_KEY: $(if $(PRIVATE_KEY),✅ Set,❌ Not set)"
	@echo "ADMIN_ADDRESS: $(if $(ADMIN_ADDRESS),$(ADMIN_ADDRESS),❌ Not set (will use deployer))"
	@echo "NETWORK: $(NETWORK)"
	@echo "RPC_URL: $(if $(RPC_URL),$(RPC_URL),❌ Not set (will use default))"

contract-info: ## Show contract information (usage: make contract-info CONTRACT_ADDRESS=0x...)
	@echo "$(CYAN)Contract Information$(RESET)"
	@echo "==================="
	@if [ -z "$(CONTRACT_ADDRESS)" ]; then \
		echo "$(RED)❌ Error: CONTRACT_ADDRESS not set$(RESET)"; \
		exit 1; \
	fi
	@echo "Address: $(CONTRACT_ADDRESS)"
	@echo ""
	CONTRACT_ADDRESS=$(CONTRACT_ADDRESS) forge script script/Deploy.s.sol:VerifyDeployment

wallet-info: ## Show wallet information
	@echo "$(CYAN)Wallet Information$(RESET)"
	@echo "=================="
	@if [ -z "$(PRIVATE_KEY)" ]; then \
		echo "$(RED)❌ Error: PRIVATE_KEY not set$(RESET)"; \
		exit 1; \
	fi
	@echo "Address: $(shell cast wallet address --private-key $(PRIVATE_KEY))"
	@echo "Balance: $(shell cast balance $(shell cast wallet address --private-key $(PRIVATE_KEY)) --rpc-url $(RPC_URL) 2>/dev/null || echo "Unable to fetch balance") ZETA"

# Documentation
docs: ## Generate documentation
	@echo "$(CYAN)Generating documentation...$(RESET)"
	forge doc
	@echo "$(GREEN)✅ Documentation generated!$(RESET)"

docs-serve: ## Serve documentation locally
	@echo "$(CYAN)Serving documentation...$(RESET)"
	forge doc --serve --port 3001
