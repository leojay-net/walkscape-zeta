#!/bin/bash

# WalkScape ZetaChain Deployment Script
# This script deploys the WalkScapeCore contract to ZetaChain Mainnet

set -e

# Load environment variables
if [ -f .env ]; then
    source .env
fi

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 WalkScape ZetaChain Deployment Script${NC}"
echo "========================================="

# Check required environment variables
if [ -z "$PRIVATE_KEY" ]; then
    echo -e "${RED}❌ Error: PRIVATE_KEY not set in environment${NC}"
    echo "Please set PRIVATE_KEY in your .env file"
    exit 1
fi

# Default to ZetaChain Mainnet if not specified
if [ -z "$ZETACHAIN_MAINNET_RPC_URL" ]; then
    export ZETACHAIN_MAINNET_RPC_URL="https://zetachain-mainnet.g.alchemy.com/v2/<YOUR_KEY>"
    echo -e "${YELLOW}⚠️  Using default ZetaChain Mainnet RPC: $ZETACHAIN_MAINNET_RPC_URL${NC}"
fi

NETWORK="ZetaChain Mainnet"
# Chain ID fetched dynamically below
EXPECTED_CHAIN_ID=""

echo -e "${BLUE}📡 Network: $NETWORK${NC}"
echo -e "${BLUE}🔗 RPC URL: $ZETACHAIN_MAINNET_RPC_URL${NC}"

# Verify network connection
echo -e "${YELLOW}🔍 Verifying network connection...${NC}"
CHAIN_ID_HEX=$(curl -s -X POST -H "Content-Type: application/json" \
    --data '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' \
    "$ZETACHAIN_MAINNET_RPC_URL" | grep -o '"result":"[^\"]*"' | cut -d'"' -f4)

if [ -z "$CHAIN_ID_HEX" ]; then
    echo -e "${RED}❌ Error: Cannot connect to ZetaChain RPC${NC}"
    exit 1
fi

# Convert hex to decimal
EXPECTED_CHAIN_ID=$((16#${CHAIN_ID_HEX#0x}))

echo -e "${GREEN}✅ Network connection verified (Chain ID: $EXPECTED_CHAIN_ID)${NC}"

# Build contracts
echo -e "${YELLOW}🔨 Building contracts...${NC}"
forge build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error: Contract build failed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Contracts built successfully${NC}"

# Deploy contract
echo -e "${YELLOW}🚢 Deploying WalkScapeCore contract...${NC}"

# Resolve deployer/admin addresses for logging and metadata
DEPLOYER_ADDRESS=$(cast wallet address --private-key "$PRIVATE_KEY" 2>/dev/null || echo "")
if [ -z "$ADMIN_ADDRESS" ]; then
    ADMIN_ADDRESS="$DEPLOYER_ADDRESS"
fi
echo "Admin address: $ADMIN_ADDRESS"

DEPLOY_CMD="forge script script/Deploy.s.sol:DeployWalkScapeCore \
    --rpc-url $ZETACHAIN_MAINNET_RPC_URL \
    --private-key $PRIVATE_KEY \
    --broadcast \
    --legacy
    --slow"

# Optional: allow overriding gas price if the RPC rejects ultra-low defaults
if [ ! -z "$GAS_PRICE_GWEI" ]; then
    GAS_PRICE_WEI=$(cast to-wei "$GAS_PRICE_GWEI" gwei)
    DEPLOY_CMD="$DEPLOY_CMD --gas-price $GAS_PRICE_WEI"
    echo -e "${YELLOW}⛽ Using custom gas price: ${GAS_PRICE_GWEI} gwei${NC}"
fi

# Add verification if API key is provided
if [ ! -z "$ZETACHAIN_API_KEY" ]; then
    DEPLOY_CMD="$DEPLOY_CMD --verify --etherscan-api-key $ZETACHAIN_API_KEY"
fi

echo -e "${BLUE}📝 Running deployment command...${NC}"
eval $DEPLOY_CMD

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Contract deployment finished (script)${NC}"

    # Read the latest broadcast file instead of re-broadcasting
    BROADCAST_FILE="broadcast/Deploy.s.sol/$EXPECTED_CHAIN_ID/run-latest.json"
    CONTRACT_ADDRESS=""
    TX_HASH=""

    if [ -f "$BROADCAST_FILE" ]; then
        CONTRACT_ADDRESS=$(awk -F '"' '/"contractAddress":/ {print $4; exit}' "$BROADCAST_FILE" | tr '[:lower:]' '[:upper:]')
        TX_HASH=$(awk -F '"' '/"hash":/ {if ($4!="" && $4!="null") {print $4; exit}}' "$BROADCAST_FILE")
    fi

    if [ -n "$CONTRACT_ADDRESS" ]; then
        echo -e "${GREEN}📍 Contract Address: $CONTRACT_ADDRESS${NC}"

        # Verify code is present on-chain before finalizing
        CODE_HEX=$(curl -s -X POST -H "Content-Type: application/json" \
            --data '{"jsonrpc":"2.0","method":"eth_getCode","params":["'$CONTRACT_ADDRESS'","latest"],"id":1}' \
            "$ZETACHAIN_MAINNET_RPC_URL" | grep -o '"result":"[^\"]*"' | cut -d'"' -f4)

        if [ "$CODE_HEX" = "0x" ] || [ -z "$CODE_HEX" ]; then
            echo -e "${YELLOW}⚠️  No code found at $CONTRACT_ADDRESS yet.${NC}"
            echo -e "${YELLOW}   The mempool may still hold the tx or it was rejected. If you saw 'already known', re-run with a higher gas price, e.g.:${NC}"
            echo -e "${YELLOW}   GAS_PRICE_GWEI=1 ${0} zetachain-mainnet${NC}"
        fi

        # Update .env file with contract address
        if [ -f .env ]; then
            if grep -q '^CONTRACT_ADDRESS=' .env; then
                sed -i.bak "s/^CONTRACT_ADDRESS=.*/CONTRACT_ADDRESS=$CONTRACT_ADDRESS/" .env
            else
                echo "CONTRACT_ADDRESS=$CONTRACT_ADDRESS" >> .env
            fi
            echo -e "${GREEN}✅ Updated .env file with contract address${NC}"
        fi

        # Create deployment info JSON
        cat > deployment_info.json << EOF
{
  "contractAddress": "$CONTRACT_ADDRESS",
  "network": "$NETWORK",
  "rpcUrl": "$ZETACHAIN_MAINNET_RPC_URL",
  "chainId": $EXPECTED_CHAIN_ID,
  "deployedAt": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "adminAddress": "$ADMIN_ADDRESS",
  "transactionHash": "$TX_HASH"
}
EOF
        echo -e "${GREEN}✅ Created deployment_info.json${NC}"

        # Setup instructions
        echo -e "${BLUE}📋 Next Steps:${NC}"
        echo "1. Update your frontend .env file:"
        echo "   NEXT_PUBLIC_CONTRACT_ADDRESS=$CONTRACT_ADDRESS"
        echo "   NEXT_PUBLIC_RPC_URL=$ZETACHAIN_MAINNET_RPC_URL"
        echo ""
        echo "2. Test your deployment:"
        echo "   forge script script/Deploy.s.sol:VerifyDeployment --rpc-url $ZETACHAIN_MAINNET_RPC_URL"
        echo ""
        echo "3. Setup test players (optional):"
        echo "   forge script script/Deploy.s.sol:RegisterTestPlayers --rpc-url $ZETACHAIN_MAINNET_RPC_URL --private-key $PRIVATE_KEY --broadcast"
    else
        echo -e "${YELLOW}⚠️  Could not find a contract address in $BROADCAST_FILE${NC}"
        echo -e "${YELLOW}   Tip: If you saw 'already known', try re-running with a higher gas price, e.g.: GAS_PRICE_GWEI=1 ${0} zetachain-mainnet${NC}"
    fi
else
    echo -e "${RED}❌ Error: Contract deployment failed${NC}"
    exit 1
fi

echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
