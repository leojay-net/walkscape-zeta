# WalkScape Solidity Contracts

A comprehensive blockchain-based gaming ecosystem built on ZetaChain network, featuring player progression, collectible artifacts, virtual pets, social colonies, and staking mechanics.

## 🌟 Features

- **Player Management**: Registration, XP tracking, health scores, and progress streaks
- **Artifact Collection**: Location-based NFT-like collectibles with rarity system
- **Pet System**: Mintable pets with feeding, evolution, and special traits
- **Colony System**: Social groups with shared XP and member management
- **Staking Rewards**: Long-term staking with growth multipliers and special rewards
- **Touch Grass Check-ins**: Location-based check-ins with streak bonuses

## 🚀 Quick Start

### Prerequisites

- [Foundry](https://getfoundry.sh/) installed
- ZETA for gas on ZetaChain Mainnet
- Private key with deployment permissions

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   make install
   ```

3. Build contracts:
   ```bash
   make build
   ```

4. Run tests:
   ```bash
   make test
   ```

### Deployment

Set your private key:
```bash
export PRIVATE_KEY=0x...
```

Deploy to ZetaChain testnet:
```bash
make zetachain-testnet
```

Or with test data:
```bash
make test-deploy
```

## 📋 Available Commands

| Command | Description |
|---------|-------------|
| `make help` | Show all available commands |
| `make build` | Build the contracts |
| `make test` | Run all tests |
| `make deploy` | Deploy to specified network |
| `make zetachain-testnet` | Deploy to ZetaChain testnet |
| `make test-deploy` | Deploy with test data |
| `make verify` | Verify deployed contract |
| `make clean` | Clean build artifacts |

## 🧪 Testing

Run comprehensive test suite:
```bash
make test
```

Run specific tests:
```bash
make test-match PATTERN=testPlayerRegistration
```

Generate gas report:
```bash
make gas-report
```

Generate coverage report:
```bash
make coverage
```

## 🔧 Configuration

### Environment Variables

- `PRIVATE_KEY`: Private key for deployment (required)
- `ADMIN_ADDRESS`: Admin address (optional, defaults to deployer)
- `ZETACHAIN_API_KEY`: API key for contract verification (optional)

### Network Configuration

The contracts are configured for ZetaChain mainnet:
- **RPC URL**: `https://zetachain-mainnet.g.alchemy.com/v2/<YOUR_KEY>`
- **Chain ID**: detected dynamically from RPC
- **Explorer**: See ZetaChain mainnet explorer

## 📖 Contract Architecture

### WalkScapeCore.sol

Main contract containing all game logic:

#### Core Structs
- `PlayerStats`: Player progression and statistics
- `ArtifactData`: Collectible artifact information
- `PetStats`: Virtual pet attributes and status
- `ColonyStats`: Social group information
- `StakeInfo`: Staking rewards and multipliers

#### Key Functions

**Player Management**
- `registerPlayer()`: Register new player
- `updateWalkXp()`: Update player XP
- `touchGrassCheckin()`: Location-based check-in

**Artifact System**
- `claimArtifact()`: Claim artifact at location
- `transferArtifact()`: Transfer artifact ownership
- `getPlayerArtifacts()`: Get player's artifacts

**Pet System**
- `mintPet()`: Mint new pet (costs 100 XP)
- `feedPet()`: Feed pet to maintain happiness
- `evolvePet()`: Evolve pet when requirements met

**Colony System**
- `createColony()`: Create new social group
- `joinColony()`: Join existing colony
- `leaveColony()`: Leave current colony

**Staking System**
- `stakeForGrowth()`: Stake tokens for rewards
- `harvestGrowthReward()`: Claim staking rewards

## 📊 Game Mechanics

### XP System
- Base XP gain: 10 per grass touch
- Streak bonus: +5 XP per streak level
- Pet minting cost: 100 XP

### Artifact Rarity
- Base rarity depends on player XP level
- Location-based randomness modifier
- Rarity levels: 1-5 stars

### Pet Evolution
- Requires level 10+ and 80+ happiness
- Unlocks special traits
- Resets level but increases evolution stage

### Staking Multipliers
- 100+ tokens: 1.5x multiplier
- 500+ tokens: 2x multiplier  
- 1000+ tokens: 3x multiplier

### Colony Benefits
- Shared XP accumulation
- Social interaction features
- Maximum 50 members per colony

## 🔍 Verification

After deployment, verify your contract:
```bash
make verify CONTRACT_ADDRESS=0x... NETWORK=zetachain-mainnet
```

## 🛠️ Development

### Local Development

Start local node:
```bash
make local-node
```

Deploy locally with test data:
```bash
make local-deploy
```

### Code Quality

Format code:
```bash
make format
```

Lint code:
```bash
make lint
```

## 📁 Project Structure

```
contracts/
├── src/
│   └── WalkScapeCore.sol     # Main game contract
├── test/
│   └── WalkScapeCore.t.sol   # Comprehensive test suite
├── script/
│   └── Deploy.s.sol          # Deployment scripts
├── foundry.toml              # Foundry configuration
├── Makefile                  # Development commands
└── deploy_zetachain.sh       # Deployment automation for ZetaChain
```

## 🔐 Security Considerations

- Uses OpenZeppelin security modules (ReentrancyGuard, Pausable, Ownable)
- Input validation on all public functions
- Proper access control for admin functions
- Safe arithmetic operations
- Comprehensive test coverage

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `make test`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For questions and support:
- Check the test files for usage examples
- Review the contract documentation
- Open an issue on GitHub

## 🚀 Deployment Example

Complete deployment process:

```bash
# Set environment
export PRIVATE_KEY=0x...

# Build and test
make build test

# Deploy to ZetaChain mainnet with verification
make zetachain-mainnet

# Or deploy with test data for development
make test-deploy

# Verify deployment
make contract-info CONTRACT_ADDRESS=0x...
```

The deployment will output:
- Contract address
- Admin address  
- Network information
- Next steps for frontend integration
