// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol";
import "openzeppelin-contracts/contracts/utils/Pausable.sol";
import "openzeppelin-contracts/contracts/access/Ownable.sol";
import "openzeppelin-contracts/contracts/utils/structs/EnumerableSet.sol";

/**
 * @title WalkScapeCore
 * @dev Main WalkScape game system combining all components
 * @author WalkScape Team
 */
contract WalkScapeCore is ReentrancyGuard, Pausable, Ownable {
    using EnumerableSet for EnumerableSet.UintSet;

    // ========== STRUCTS ==========

    struct PlayerStats {
        uint256 walksXp;
        uint256 healthScore;
        uint64 lastCheckin;
        uint256 totalArtifacts;
        uint256 currentColony;
        uint256 petsOwned;
        uint256 grassTouchStreak;
    }

    struct ArtifactData {
        bytes32 locationHash;
        uint8 artifactType; // 0: mushroom, 1: fossil, 2: graffiti, 3: pixel_plant
        address owner;
        uint64 claimedAt;
        uint8 rarity; // 1-5 stars
    }

    struct PetStats {
        address owner;
        uint8 petType;
        uint256 level;
        uint256 happiness;
        uint8 evolutionStage;
        uint64 lastFed;
        uint256 specialTraits;
    }

    struct ColonyStats {
        bytes32 name;
        address creator;
        uint256 memberCount;
        uint256 totalXp;
        uint64 createdAt;
        uint256 weeklyChallengeScore;
    }

    struct StakeInfo {
        uint256 amountStaked;
        uint64 stakeTimestamp;
        uint256 growthMultiplier;
        uint64 lastHarvest;
    }

    // ========== STATE VARIABLES ==========

    // Player management
    mapping(address => PlayerStats) public players;
    mapping(address => bool) public registeredPlayers;
    
    // Artifacts system (NFT-like)
    mapping(uint256 => ArtifactData) public artifacts;
    uint256 public artifactCounter = 1;
    mapping(bytes32 => bool) public locationClaimed;
    mapping(address => EnumerableSet.UintSet) private playerArtifacts;
    
    // Pets system
    mapping(uint256 => PetStats) public pets;
    uint256 public petCounter = 1;
    mapping(address => EnumerableSet.UintSet) private playerPets;
    
    // Colony system
    mapping(uint256 => ColonyStats) public colonies;
    uint256 public colonyCounter = 1;
    mapping(uint256 => mapping(address => bool)) public colonyMembers;
    mapping(address => uint256) public playerColony;
    
    // Staking system
    mapping(address => StakeInfo) public stakes;
    uint256 public totalStaked;
    
    // Constants
    uint256 public constant PET_MINT_COST = 100;
    uint256 public constant MIN_HARVEST_TIME = 1 days;
    uint256 public constant GRASS_TOUCH_COOLDOWN = 4 hours;
    uint256 public constant STREAK_RESET_TIME = 24 hours;
    uint256 public constant MAX_COLONY_MEMBERS = 50;

    // ========== EVENTS ==========

    event PlayerRegistered(address indexed player, uint64 timestamp);
    event ArtifactClaimed(
        address indexed player,
        uint256 indexed artifactId,
        bytes32 locationHash,
        uint8 artifactType,
        uint8 rarity
    );
    event PetMinted(address indexed owner, uint256 indexed petId, uint8 petType);
    event PetEvolved(uint256 indexed petId, uint8 newEvolutionStage, uint256 specialTraitsUnlocked);
    event ColonyCreated(uint256 indexed colonyId, address indexed creator, bytes32 name);
    event PlayerJoinedColony(address indexed player, uint256 indexed colonyId);
    event GrassTouched(
        address indexed player,
        bytes32 locationHash,
        uint256 streak,
        uint256 xpGained
    );
    event StakeUpdated(address indexed player, uint256 amount, uint256 newTotal);
    event RewardHarvested(address indexed player, uint256 rewardId, uint64 stakeDuration);

    // ========== CONSTRUCTOR ==========

    constructor(address _admin) Ownable(_admin) {
        // Contract is ready to use
    }

    // ========== MODIFIERS ==========

    modifier onlyRegisteredPlayer(address player) {
        require(registeredPlayers[player], "Player not registered");
        _;
    }

    modifier onlyRegistered() {
        require(registeredPlayers[msg.sender], "Player not registered");
        _;
    }

    // ========== PLAYER MANAGEMENT ==========

    /**
     * @dev Register a new player
     */
    function registerPlayer() external whenNotPaused {
        require(!registeredPlayers[msg.sender], "Player already registered");
        
        PlayerStats memory newPlayer = PlayerStats({
            walksXp: 0,
            healthScore: 100,
            lastCheckin: uint64(block.timestamp),
            totalArtifacts: 0,
            currentColony: 0,
            petsOwned: 0,
            grassTouchStreak: 0
        });
        
        players[msg.sender] = newPlayer;
        registeredPlayers[msg.sender] = true;
        
        emit PlayerRegistered(msg.sender, uint64(block.timestamp));
    }

    /**
     * @dev Get player statistics
     */
    function getPlayerStats(address player) external view returns (PlayerStats memory) {
        require(registeredPlayers[player], "Player not registered");
        return players[player];
    }

    /**
     * @dev Update player's walking XP
     */
    function updateWalkXp(address player, uint256 xpGained) external onlyOwner onlyRegisteredPlayer(player) {
        players[player].walksXp += xpGained;
        
        // Update colony XP if player is in a colony
        uint256 colonyId = playerColony[player];
        if (colonyId > 0) {
            colonies[colonyId].totalXp += xpGained;
        }
    }

    /**
     * @dev Update player's health score
     */
    function updateHealthScore(address player, uint256 healthScore) external onlyOwner onlyRegisteredPlayer(player) {
        players[player].healthScore = healthScore;
    }

    /**
     * @dev Touch grass check-in system
     */
    function touchGrassCheckin(bytes32 locationHash) external onlyRegistered whenNotPaused {
        PlayerStats storage playerStats = players[msg.sender];
        uint64 currentTime = uint64(block.timestamp);
        
        // Handle streak logic
        if (playerStats.lastCheckin == 0) {
            playerStats.grassTouchStreak = 1;
        } else {
            uint64 timeDiff = currentTime - playerStats.lastCheckin;
            
            if (timeDiff > STREAK_RESET_TIME) {
                playerStats.grassTouchStreak = 1;
            } else if (timeDiff >= GRASS_TOUCH_COOLDOWN) {
                playerStats.grassTouchStreak += 1;
            }
        }
        
        playerStats.lastCheckin = currentTime;
        
        uint256 xpGained = 10 + (playerStats.grassTouchStreak * 5);
        playerStats.walksXp += xpGained;
        
        
        uint256 colonyId = playerColony[msg.sender];
        if (colonyId > 0) {
            colonies[colonyId].totalXp += xpGained;
        }
        
        emit GrassTouched(msg.sender, locationHash, playerStats.grassTouchStreak, xpGained);
    }

    // ========== ARTIFACTS SYSTEM ==========

    /**
     * @dev Claim an artifact at a location
     */
    function claimArtifact(bytes32 locationHash, uint8 artifactType) external onlyRegistered whenNotPaused {
        require(!locationClaimed[locationHash], "Location already claimed");
        require(artifactType <= 3, "Invalid artifact type");
        
        uint256 artifactId = artifactCounter;
        
        uint8 rarity = _calculateArtifactRarity(players[msg.sender].walksXp, locationHash);
        
        ArtifactData memory artifact = ArtifactData({
            locationHash: locationHash,
            artifactType: artifactType,
            owner: msg.sender,
            claimedAt: uint64(block.timestamp),
            rarity: rarity
        });
        
        artifacts[artifactId] = artifact;
        locationClaimed[locationHash] = true;
        artifactCounter++;
        
        playerArtifacts[msg.sender].add(artifactId);
        players[msg.sender].totalArtifacts++;
        
        emit ArtifactClaimed(msg.sender, artifactId, locationHash, artifactType, rarity);
    }

    /**
     * @dev Get artifact owner
     */
    function getArtifactOwner(uint256 artifactId) external view returns (address) {
        return artifacts[artifactId].owner;
    }

    /**
     * @dev Get all artifacts owned by a player
     */
    function getPlayerArtifacts(address player) external view returns (uint256[] memory) {
        return playerArtifacts[player].values();
    }

    /**
     * @dev Transfer artifact to another player
     */
    function transferArtifact(address to, uint256 artifactId) external onlyRegistered {
        require(artifacts[artifactId].owner == msg.sender, "Not artifact owner");
        require(registeredPlayers[to], "Recipient not registered");

        artifacts[artifactId].owner = to;
     
        playerArtifacts[msg.sender].remove(artifactId);
        playerArtifacts[to].add(artifactId);
        
        players[msg.sender].totalArtifacts--;
        players[to].totalArtifacts++;
    }

    // ========== PETS SYSTEM ==========

    /**
     * @dev Mint a new pet
     */
    function mintPet(uint8 petType) external onlyRegistered whenNotPaused returns (uint256) {
        require(petType <= 2, "Invalid pet type");
        require(players[msg.sender].walksXp >= PET_MINT_COST, "Insufficient XP for pet");
        
        uint256 petId = petCounter;
        
        PetStats memory pet = PetStats({
            owner: msg.sender,
            petType: petType,
            level: 1,
            happiness: 100,
            evolutionStage: 0,
            lastFed: uint64(block.timestamp),
            specialTraits: 0
        });
        
        pets[petId] = pet;
        petCounter++;
        
        playerPets[msg.sender].add(petId);
        players[msg.sender].petsOwned++;
        players[msg.sender].walksXp -= PET_MINT_COST;
        
        emit PetMinted(msg.sender, petId, petType);
        return petId;
    }

    /**
     * @dev Feed a pet
     */
    function feedPet(uint256 petId, uint256 nutritionScore) external onlyRegistered {
        require(pets[petId].owner == msg.sender, "Not pet owner");
        
        PetStats storage pet = pets[petId];
        
        if (nutritionScore >= 80) {
            pet.happiness = pet.happiness <= 80 ? pet.happiness + 20 : 100;
        } else if (nutritionScore >= 50) {
            pet.happiness = pet.happiness <= 90 ? pet.happiness + 10 : 100;
        } else {
            pet.happiness = pet.happiness > 10 ? pet.happiness - 10 : pet.happiness;
        }
        
        pet.lastFed = uint64(block.timestamp);
    }

    /**
     * @dev Evolve a pet
     */
    function evolvePet(uint256 petId) external onlyRegistered {
        PetStats storage pet = pets[petId];
        require(pet.owner == msg.sender, "Not pet owner");
        require(pet.level >= 10, "Pet level too low");
        require(pet.happiness >= 80, "Pet not happy enough");
        require(pet.evolutionStage < 3, "Max evolution reached");
        
        pet.evolutionStage++;
        pet.level = 1; 

        uint256 newTraits = pet.evolutionStage == 1 ? 1 : 
                           pet.evolutionStage == 2 ? 3 : 
                           pet.evolutionStage == 3 ? 7 : 15;
        pet.specialTraits = newTraits;
        
        emit PetEvolved(petId, pet.evolutionStage, newTraits);
    }

    /**
     * @dev Get pet statistics
     */
    function getPetStats(uint256 petId) external view returns (PetStats memory) {
        return pets[petId];
    }

    /**
     * @dev Get all pets owned by a player
     */
    function getPlayerPets(address player) external view returns (uint256[] memory) {
        return playerPets[player].values();
    }

    // ========== COLONY SYSTEM ==========

    /**
     * @dev Create a new colony
     */
    function createColony(bytes32 name) external onlyRegistered whenNotPaused returns (uint256) {
        require(playerColony[msg.sender] == 0, "Already in a colony");
        
        uint256 colonyId = colonyCounter;
        
        ColonyStats memory colony = ColonyStats({
            name: name,
            creator: msg.sender,
            memberCount: 1,
            totalXp: 0,
            createdAt: uint64(block.timestamp),
            weeklyChallengeScore: 0
        });
        
        colonies[colonyId] = colony;
        colonyCounter++;
        playerColony[msg.sender] = colonyId;
        colonyMembers[colonyId][msg.sender] = true;
        players[msg.sender].currentColony = colonyId;
        
        emit ColonyCreated(colonyId, msg.sender, name);
        return colonyId;
    }

    /**
     * @dev Join an existing colony
     */
    function joinColony(uint256 colonyId) external onlyRegistered whenNotPaused {
        require(playerColony[msg.sender] == 0, "Already in a colony");
        require(colonyId < colonyCounter && colonyId > 0, "Colony does not exist");
        require(colonies[colonyId].memberCount < MAX_COLONY_MEMBERS, "Colony is full");
        
        colonies[colonyId].memberCount++;
        playerColony[msg.sender] = colonyId;
        colonyMembers[colonyId][msg.sender] = true;
        players[msg.sender].currentColony = colonyId;
        
        emit PlayerJoinedColony(msg.sender, colonyId);
    }

    /**
     * @dev Leave current colony
     */
    function leaveColony() external onlyRegistered {
        uint256 colonyId = playerColony[msg.sender];
        require(colonyId > 0, "Not in a colony");
        
        colonies[colonyId].memberCount--;
        playerColony[msg.sender] = 0;
        colonyMembers[colonyId][msg.sender] = false;
        players[msg.sender].currentColony = 0;
    }

    /**
     * @dev Get colony statistics
     */
    function getColonyStats(uint256 colonyId) external view returns (ColonyStats memory) {
        require(colonyId < colonyCounter && colonyId > 0, "Colony does not exist");
        return colonies[colonyId];
    }

    // ========== STAKING SYSTEM ==========

    /**
     * @dev Stake tokens for growth rewards
     */
    function stakeForGrowth(uint256 amount) external onlyRegistered whenNotPaused {
        require(amount > 0, "Cannot stake zero");
        
        StakeInfo storage stakeInfo = stakes[msg.sender];
        stakeInfo.amountStaked += amount;
        stakeInfo.stakeTimestamp = uint64(block.timestamp);
        stakeInfo.growthMultiplier = _calculateGrowthMultiplier(stakeInfo.amountStaked);
        
        totalStaked += amount;
        
        emit StakeUpdated(msg.sender, amount, stakeInfo.amountStaked);
    }

    /**
     * @dev Harvest growth rewards
     */
    function harvestGrowthReward() external onlyRegistered nonReentrant returns (uint256) {
        StakeInfo storage stakeInfo = stakes[msg.sender];
        require(stakeInfo.amountStaked > 0, "No stake found");
        
        uint64 currentTime = uint64(block.timestamp);
        uint64 stakeDuration = currentTime - stakeInfo.stakeTimestamp;
        require(stakeDuration >= MIN_HARVEST_TIME, "Must stake for at least 1 day");
        
        uint256 rewardId = _mintGrowthReward(msg.sender, stakeDuration, stakeInfo.growthMultiplier);
        
        stakeInfo.lastHarvest = currentTime;
        
        emit RewardHarvested(msg.sender, rewardId, stakeDuration);
        return rewardId;
    }

    /**
     * @dev Get stake information for a player
     */
    function getStakeInfo(address player) external view returns (StakeInfo memory) {
        return stakes[player];
    }

    // ========== INTERNAL FUNCTIONS ==========

    /**
     * @dev Calculate artifact rarity based on player XP and location
     */
    function _calculateArtifactRarity(uint256 playerXp, bytes32 locationHash) internal pure returns (uint8) {
        uint8 baseRarity = playerXp >= 1000 ? 3 : playerXp >= 500 ? 2 : 1;
        
        uint256 randomFactor = uint256(locationHash) % 100;
        if (randomFactor < 5) return baseRarity + 2; 
        if (randomFactor < 20) return baseRarity + 1; 
        return baseRarity;
    }

    /**
     * @dev Calculate growth multiplier based on staked amount
     */
    function _calculateGrowthMultiplier(uint256 stakedAmount) internal pure returns (uint256) {
        if (stakedAmount >= 1000) return 300; 
        if (stakedAmount >= 500) return 200;
        if (stakedAmount >= 100) return 150; 
        return 100;
    }

    /**
     * @dev Mint a growth reward pet
     */
    function _mintGrowthReward(
        address player,
        uint64 stakeDuration,
        uint256 multiplier
    ) internal returns (uint256) {
        uint8 rewardType = (stakeDuration >= 7 days && multiplier >= 200) ? 2 : // Legendary pet
                          (stakeDuration >= 3 days) ? 1 : // Rare pet
                          0; 
        
        uint256 petId = petCounter;
        
        PetStats memory pet = PetStats({
            owner: player,
            petType: rewardType,
            level: 1,
            happiness: 100,
            evolutionStage: 0,
            lastFed: uint64(block.timestamp),
            specialTraits: rewardType == 2 ? 15 : 0 // Legendary gets special traits
        });
        
        pets[petId] = pet;
        petCounter++;
        
        // Add to player's collection
        playerPets[player].add(petId);
        players[player].petsOwned++;
        
        return petId;
    }

    // ========== ADMIN FUNCTIONS ==========

    /**
     * @dev Pause the contract
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause the contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Emergency function to rescue stuck tokens (if any are sent accidentally)
     */
    function rescueTokens(address token, uint256 amount) external onlyOwner {
        if (token == address(0)) {
            payable(owner()).transfer(amount);
        } else {
            (bool success, ) = token.call(abi.encodeWithSignature("transfer(address,uint256)", owner(), amount));
            require(success, "Token transfer failed");
        }
    }
}
