# WalkScape

A blockchain-powered location-based exploration game built on ZetaChain that connects the real world with digital adventures. Touch grass, discover artifacts, grow digital pets, and build communities while exploring your surroundings.

## What is WalkScape?

WalkScape transforms everyday outdoor activities into an engaging blockchain game where:
- **Physical exploration** earns you digital rewards
- **Real-world locations** become collectible artifacts  
- **AI-powered environment detection** enhances your discoveries
- **Social communities** connect explorers worldwide
- **Digital pets** grow and evolve based on your adventures

## Getting Started

### Prerequisites
- **ZetaChain-Compatible Wallet**: MetaMask, WalletConnect, or any EVM-compatible wallet
- **Mobile Device**: Smartphone with GPS and camera capabilities
- **Internet Connection**: For blockchain transactions and AI analysis
- **Browser**: Modern web browser with wallet extension support

### Quick Start
1. **Connect Wallet**: Link your ZetaChain-compatible wallet to begin
2. **Register**: Complete one-time blockchain registration on ZetaChain
3. **Enable Location**: Grant GPS permissions for location verification
4. **Start Exploring**: Head outdoors and begin your WalkScape journey

## How to Play

### Touch Grass System
- **Daily Check-ins**: Visit outdoor locations to maintain your streak
- **XP Rewards**: Earn 15 XP for each successful grass touch
- **Streak Building**: Consecutive days increase your explorer level
- **AI Validation**: Smart environment detection ensures authentic outdoor experiences

### Artifact Discovery
- **Location Scanning**: Use your device's camera to scan surroundings
- **AI Environment Analysis**: Google Gemini Vision API identifies optimal artifact types
- **Collectible Types**: Mushrooms, Fossils, Graffiti, and Pixel Plants
- **Rarity System**: Discover common to legendary artifacts based on exploration patterns

### Digital Pet System
- **Pet Minting**: Spend 100 XP to create unique digital companions
- **Care & Feeding**: Maintain pet happiness through regular interaction
- **Evolution Stages**: Watch pets transform as they level up
- **Special Traits**: Rare attributes unlock through dedicated care

### Social Colonies
- **Community Building**: Create or join exploration communities
- **Shared Goals**: Collaborate on weekly challenges and achievements
- **Leaderboards**: Compete with fellow explorers for top rankings
- **Social Benefits**: Colony membership provides XP bonuses and exclusive rewards

### Growth Staking
- **Token Staking**: Lock tokens to accelerate pet growth
- **Legendary Traits**: Staked pets develop unique special abilities
- **Reward Harvesting**: Earn returns based on staking duration and performance
- **Risk Management**: Choose staking periods that match your commitment level

## AI Integration

WalkScape leverages advanced AI to create intelligent, location-aware gameplay:

### Google Gemini Vision API
- **Environment Recognition**: Analyzes camera feeds to identify indoor vs outdoor environments
- **Artifact Suggestions**: Recommends optimal artifact types based on surroundings
- **Smart Validation**: Ensures Touch Grass functionality only works in appropriate outdoor settings
- **Confidence Scoring**: Provides reliability metrics for AI analysis results

### Intelligent Features
- **Auto-Selection**: AI automatically selects most likely artifact types
- **Environment Filtering**: Prevents indoor Touch Grass attempts
- **Enhanced Discovery**: Improved artifact claiming accuracy through visual analysis
- **Fallback Systems**: Mock analysis ensures functionality even when AI services are unavailable

## Technical Architecture

### Blockchain Layer
- **ZetaChain Integration**: Full smart contract interaction via Solidity
- **Wallet Support**: MetaMask and compatible wallet support
- **Transaction Management**: Reliable confirmation and error handling
- **Gas Optimization**: Efficient contract calls and batch operations

### Frontend Stack
- **Next.js 15**: React framework with App Router and Turbopack
- **TypeScript**: Type-safe development with full blockchain integration
- **Tailwind CSS**: Responsive, mobile-first design system
- **Professional UI**: Clean green, white, and gray color scheme

### Location Services
- **GPS Integration**: High-accuracy location detection with fallback options
- **Privacy Protection**: Minimal location data storage with user consent
- **Offline Support**: Cached functionality for intermittent connectivity
- **Cross-Platform**: Works on iOS, Android, and desktop browsers

## Design Philosophy

### Professional Aesthetics
- **Clean Interface**: Removed emoji-heavy design for professional appeal
- **Consistent Colors**: Standardized green/white/gray palette throughout
- **Intuitive Navigation**: Clear information hierarchy and user flows
- **Mobile Optimization**: Touch-friendly interface for on-the-go exploration

### User Experience
- **Progressive Disclosure**: Simple onboarding with advanced features revealed gradually
- **Visual Feedback**: Clear confirmation of actions and transaction states
- **Error Recovery**: Helpful error messages with actionable solutions
- **Performance**: Fast loading times and responsive interactions

## 💻 Development Setup

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd walkscape_frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
```

### Environment Configuration
```bash
# Required environment variables
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...  # Deployed WalkScape contract
NEXT_PUBLIC_RPC_URL=https://...     # ZetaChain RPC endpoint
NEXT_PUBLIC_GEMINI_API_KEY=...      # Google Gemini API key for AI features
```

### Development Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript validation
```

## 🎯 Game Mechanics Deep Dive

### Experience System
- **Base XP**: 15 XP per Touch Grass action
- **Streak Bonuses**: Multipliers for consecutive day streaks
- **Level Progression**: Square root formula for balanced advancement
- **Activity Rewards**: Additional XP for artifact discoveries and pet care

### Artifact Rarity Algorithm
```typescript
// Rarity calculation based on player stats and location
const rarity = calculateArtifactRarity(playerXP, locationHash);
// Returns: Common (0), Uncommon (1), Rare (2), Legendary (3)
```

### Pet Evolution Mechanics
- **Level Thresholds**: Evolution triggers at specific levels
- **Happiness Requirements**: High happiness scores enable evolution
- **Feeding Schedule**: Regular feeding maintains pet health
- **Special Traits**: Random trait assignment during evolution

### Colony Benefits
- **XP Sharing**: Members contribute to collective experience pools
- **Challenge Participation**: Weekly colony-wide objectives
- **Social Features**: Communication and coordination tools
- **Exclusive Rewards**: Colony-only artifacts and achievements

## 📱 Mobile Features

### Camera Integration
- **Real-time Analysis**: Live environment detection through device camera
- **Photo Capture**: Save location memories with integrated camera
- **AR Potential**: Foundation for future augmented reality features
- **Privacy Controls**: User-controlled image processing and storage

### Location Services
- **GPS Accuracy**: Multiple location providers for precise positioning
- **Battery Optimization**: Efficient location polling to preserve battery life
- **Permission Management**: Clear consent flow for location access
- **Offline Caching**: Store location data for later synchronization

## 🔧 Smart Contract Integration

### Key Contract Functions
```typescript
// Player management
register_player()                          // One-time registration
get_player_stats(address)                  // Retrieve player data

// Core gameplay
touch_grass_checkin(location_hash)         // Daily check-ins
claim_artifact(location_hash, type)        // Artifact collection

// Pet system
mint_pet(pet_type)                         // Create new pets
feed_pet(pet_id, nutrition)                // Pet care
get_player_pets(address)                   // List owned pets

// Social features
create_colony(name)                        // Start new colony
join_colony(colony_id)                     // Join existing colony

// Staking system
stake_for_growth(amount)                   // Lock tokens
harvest_growth_reward()                    // Claim rewards
```

### Transaction Handling
- **Confirmation Waiting**: Reliable transaction confirmation detection
- **Error Recovery**: Comprehensive error handling with user-friendly messages
- **Gas Estimation**: Automatic gas calculation for optimal transaction costs
- **Retry Logic**: Smart retry mechanisms for failed transactions

## 🌍 Deployment Guide

### Vercel Deployment (Recommended)
```bash
# Build and deploy
npm run build
vercel deploy

# Environment variables in Vercel dashboard:
# NEXT_PUBLIC_CONTRACT_ADDRESS
# NEXT_PUBLIC_RPC_URL  
# NEXT_PUBLIC_GEMINI_API_KEY
```

### Self-Hosted Deployment
```bash
# Build production bundle
npm run build

# Start production server
npm start

# Or use PM2 for process management
pm2 start npm --name "walkscape" -- start
```

## 🧪 Testing & Quality Assurance

### Contract Testing
- Comprehensive smart contract test suite in `/tests` directory
- Integration tests for all game mechanics
- Gas optimization verification
- Edge case handling validation

### Frontend Testing
- Component testing with React Testing Library
- End-to-end testing with Playwright
- Mobile device testing across iOS and Android
- AI integration testing with mock responses

## 🤝 Contributing

We welcome contributions to make WalkScape even better:

1. **Fork the Repository**: Create your own copy for development
2. **Create Feature Branch**: `git checkout -b feature/amazing-feature`
3. **Follow Standards**: Use TypeScript, ESLint, and existing patterns
4. **Test Thoroughly**: Ensure all features work across devices
5. **Submit Pull Request**: Detailed description of changes and testing

### Development Guidelines
- **Code Style**: Follow existing TypeScript and React patterns
- **Mobile First**: Always test on mobile devices
- **Accessibility**: Ensure features work with screen readers
- **Performance**: Optimize for low-end devices and slow connections

## 📄 License

This project is part of the WalkScape ecosystem. See individual license files for specific terms.

## � Resources

- **Smart Contract**: Located in `/contracts` directory (Solidity on ZetaChain)
- **AI Documentation**: See `/docs/AI_INTEGRATION.md` for detailed AI implementation
- **ZetaChain**: https://www.zetachain.com/
- **Reown AppKit**: [docs.reown.com/appkit](https://docs.reown.com/appkit)
- **Next.js Guide**: [nextjs.org/docs](https://nextjs.org/docs)
- **Google Gemini API**: [ai.google.dev](https://ai.google.dev/)

---

**WalkScape** - Where real-world exploration meets blockchain innovation. Start your journey today!
