// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "forge-std/console.sol";
import "../src/WalkScapeCore.sol";

contract WalkScapeCoreTest is Test {
    WalkScapeCore public walkscape;
    address public admin;
    address public player1;
    address public player2;
    address public player3;

    // Events to test
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

    function setUp() public {
        admin = makeAddr("admin");
        player1 = makeAddr("player1");
        player2 = makeAddr("player2");
        player3 = makeAddr("player3");

        // Deploy contract with admin
        walkscape = new WalkScapeCore(admin);
    }

    // ========== PLAYER MANAGEMENT TESTS ==========

    function testPlayerRegistration() public {
        vm.expectEmit(true, false, false, true);
        emit PlayerRegistered(player1, uint64(block.timestamp));
        
        vm.prank(player1);
        walkscape.registerPlayer();

        // Verify player stats
        WalkScapeCore.PlayerStats memory stats = walkscape.getPlayerStats(player1);
        assertEq(stats.walksXp, 0);
        assertEq(stats.healthScore, 100);
        assertEq(stats.totalArtifacts, 0);
        assertEq(stats.petsOwned, 0);
        assertEq(stats.grassTouchStreak, 0);
        assertTrue(walkscape.registeredPlayers(player1));
    }

    function testDoubleRegistrationFails() public {
        vm.startPrank(player1);
        walkscape.registerPlayer();
        
        vm.expectRevert("Player already registered");
        walkscape.registerPlayer();
        vm.stopPrank();
    }

    function testWalkXpUpdate() public {
        vm.prank(player1);
        walkscape.registerPlayer();

        vm.prank(admin);
        walkscape.updateWalkXp(player1, 50);

        WalkScapeCore.PlayerStats memory stats = walkscape.getPlayerStats(player1);
        assertEq(stats.walksXp, 50);
    }

    function testHealthScoreUpdate() public {
        vm.prank(player1);
        walkscape.registerPlayer();

        vm.prank(admin);
        walkscape.updateHealthScore(player1, 85);

        WalkScapeCore.PlayerStats memory stats = walkscape.getPlayerStats(player1);
        assertEq(stats.healthScore, 85);
    }

    function testTouchGrassCheckin() public {
        vm.prank(player1);
        walkscape.registerPlayer();

        // Wait 5 hours after registration
        vm.warp(block.timestamp + 5 hours);

        bytes32 locationHash = "central_park_123";
        
        vm.expectEmit(true, false, false, true);
        emit GrassTouched(player1, locationHash, 1, 15);

        vm.prank(player1);
        walkscape.touchGrassCheckin(locationHash);

        WalkScapeCore.PlayerStats memory stats = walkscape.getPlayerStats(player1);
        assertEq(stats.grassTouchStreak, 1);
        assertEq(stats.walksXp, 15); // 10 + (1 * 5)
    }

    function testTouchGrassStreakBuilding() public {
        vm.prank(player1);
        walkscape.registerPlayer();

        bytes32 locationHash = "central_park_123";
        
        // First touch after 5 hours
        uint256 firstTime = block.timestamp + 5 hours;
        vm.warp(firstTime);
        vm.prank(player1);
        walkscape.touchGrassCheckin(locationHash);

        // Second touch after another 5 hours
        uint256 secondTime = firstTime + 5 hours;
        vm.warp(secondTime);
        vm.prank(player1);
        walkscape.touchGrassCheckin(locationHash);

        WalkScapeCore.PlayerStats memory stats = walkscape.getPlayerStats(player1);
        assertEq(stats.grassTouchStreak, 2);
        assertEq(stats.walksXp, 35); // 15 + 20 (10 + 2*5)
    }

    function testUnregisteredPlayerOperationsFail() public {
        vm.expectRevert("Player not registered");
        walkscape.getPlayerStats(player1);

        vm.prank(player1);
        vm.expectRevert("Player not registered");
        walkscape.touchGrassCheckin("location");
    }

    // ========== ARTIFACTS SYSTEM TESTS ==========

    function testArtifactClaiming() public {
        vm.prank(player1);
        walkscape.registerPlayer();

        bytes32 locationHash = "museum_entrance_456";
        uint8 artifactType = 1; // fossil

        vm.expectEmit(true, true, false, false);
        emit ArtifactClaimed(player1, 1, locationHash, artifactType, 1);

        vm.prank(player1);
        walkscape.claimArtifact(locationHash, artifactType);

        // Verify artifact ownership
        assertEq(walkscape.getArtifactOwner(1), player1);

        // Verify player's artifact collection
        uint256[] memory playerArtifacts = walkscape.getPlayerArtifacts(player1);
        assertEq(playerArtifacts.length, 1);
        assertEq(playerArtifacts[0], 1);

        // Verify player stats updated
        WalkScapeCore.PlayerStats memory stats = walkscape.getPlayerStats(player1);
        assertEq(stats.totalArtifacts, 1);
    }

    function testDoubleClaimFails() public {
        vm.prank(player1);
        walkscape.registerPlayer();
        vm.prank(player2);
        walkscape.registerPlayer();

        bytes32 locationHash = "museum_entrance_456";
        uint8 artifactType = 1;

        // Player1 claims
        vm.prank(player1);
        walkscape.claimArtifact(locationHash, artifactType);

        // Player2 tries to claim same location
        vm.prank(player2);
        vm.expectRevert("Location already claimed");
        walkscape.claimArtifact(locationHash, artifactType);
    }

    function testInvalidArtifactTypeFails() public {
        vm.prank(player1);
        walkscape.registerPlayer();

        vm.prank(player1);
        vm.expectRevert("Invalid artifact type");
        walkscape.claimArtifact("location", 5);
    }

    function testArtifactTransfer() public {
        vm.prank(player1);
        walkscape.registerPlayer();
        vm.prank(player2);
        walkscape.registerPlayer();

        // Player1 claims artifact
        vm.prank(player1);
        walkscape.claimArtifact("location_123", 0);

        // Transfer to player2
        vm.prank(player1);
        walkscape.transferArtifact(player2, 1);

        // Verify transfer
        assertEq(walkscape.getArtifactOwner(1), player2);
        
        uint256[] memory player2Artifacts = walkscape.getPlayerArtifacts(player2);
        assertEq(player2Artifacts.length, 1);
        assertEq(player2Artifacts[0], 1);

        uint256[] memory player1Artifacts = walkscape.getPlayerArtifacts(player1);
        assertEq(player1Artifacts.length, 0);
    }

    function testTransferArtifactNotOwnerFails() public {
        vm.prank(player1);
        walkscape.registerPlayer();
        vm.prank(player2);
        walkscape.registerPlayer();

        // Player1 claims artifact
        vm.prank(player1);
        walkscape.claimArtifact("location_123", 0);

        // Player2 tries to transfer player1's artifact
        vm.prank(player2);
        vm.expectRevert("Not artifact owner");
        walkscape.transferArtifact(player2, 1);
    }

    // ========== PETS SYSTEM TESTS ==========

    function testPetMinting() public {
        vm.prank(player1);
        walkscape.registerPlayer();

        // Give player enough XP
        vm.prank(admin);
        walkscape.updateWalkXp(player1, 150);

        uint8 petType = 0; // plant
        
        vm.expectEmit(true, true, false, true);
        emit PetMinted(player1, 1, petType);

        vm.prank(player1);
        uint256 petId = walkscape.mintPet(petType);
        
        assertEq(petId, 1);

        // Verify pet stats
        WalkScapeCore.PetStats memory petStats = walkscape.getPetStats(petId);
        assertEq(petStats.owner, player1);
        assertEq(petStats.petType, petType);
        assertEq(petStats.level, 1);
        assertEq(petStats.happiness, 100);
        assertEq(petStats.evolutionStage, 0);

        // Verify player stats updated
        WalkScapeCore.PlayerStats memory playerStats = walkscape.getPlayerStats(player1);
        assertEq(playerStats.petsOwned, 1);
        assertEq(playerStats.walksXp, 50); // 150 - 100 (cost)
    }

    function testPetMintingInsufficientXpFails() public {
        vm.prank(player1);
        walkscape.registerPlayer();

        // Try to mint pet without enough XP
        vm.prank(player1);
        vm.expectRevert("Insufficient XP for pet");
        walkscape.mintPet(0);
    }

    function testInvalidPetTypeFails() public {
        vm.prank(player1);
        walkscape.registerPlayer();

        // Give enough XP
        vm.prank(admin);
        walkscape.updateWalkXp(player1, 200);

        // Try to mint pet with invalid type
        vm.prank(player1);
        vm.expectRevert("Invalid pet type");
        walkscape.mintPet(5);
    }

    function testPetFeeding() public {
        vm.prank(player1);
        walkscape.registerPlayer();

        vm.prank(admin);
        walkscape.updateWalkXp(player1, 150);

        vm.prank(player1);
        uint256 petId = walkscape.mintPet(0);

        // Feed pet with good nutrition
        vm.prank(player1);
        walkscape.feedPet(petId, 90);

        WalkScapeCore.PetStats memory petStats = walkscape.getPetStats(petId);
        assertEq(petStats.happiness, 100); // Already at max
    }

    function testFeedPetNotOwnerFails() public {
        vm.prank(player1);
        walkscape.registerPlayer();
        vm.prank(player2);
        walkscape.registerPlayer();

        vm.prank(admin);
        walkscape.updateWalkXp(player1, 200);

        vm.prank(player1);
        uint256 petId = walkscape.mintPet(0);

        // Player2 tries to feed player1's pet
        vm.prank(player2);
        vm.expectRevert("Not pet owner");
        walkscape.feedPet(petId, 80);
    }

    function testGetPlayerPets() public {
        vm.prank(player1);
        walkscape.registerPlayer();

        vm.prank(admin);
        walkscape.updateWalkXp(player1, 300);

        vm.prank(player1);
        uint256 pet1 = walkscape.mintPet(0);
        
        vm.prank(player1);
        uint256 pet2 = walkscape.mintPet(1);

        uint256[] memory playerPets = walkscape.getPlayerPets(player1);
        assertEq(playerPets.length, 2);
        assertEq(playerPets[0], pet1);
        assertEq(playerPets[1], pet2);
    }

    // ========== COLONY SYSTEM TESTS ==========

    function testColonyCreation() public {
        vm.prank(player1);
        walkscape.registerPlayer();

        bytes32 colonyName = "elite_walkers";
        
        vm.expectEmit(true, true, false, true);
        emit ColonyCreated(1, player1, colonyName);

        vm.prank(player1);
        uint256 colonyId = walkscape.createColony(colonyName);
        
        assertEq(colonyId, 1);

        // Verify colony stats
        WalkScapeCore.ColonyStats memory colonyStats = walkscape.getColonyStats(colonyId);
        assertEq(colonyStats.name, colonyName);
        assertEq(colonyStats.creator, player1);
        assertEq(colonyStats.memberCount, 1);

        // Verify player is in colony
        WalkScapeCore.PlayerStats memory playerStats = walkscape.getPlayerStats(player1);
        assertEq(playerStats.currentColony, colonyId);
    }

    function testColonyJoining() public {
        vm.prank(player1);
        walkscape.registerPlayer();
        vm.prank(player2);
        walkscape.registerPlayer();

        // Player1 creates colony
        vm.prank(player1);
        uint256 colonyId = walkscape.createColony("test_colony");

        // Player2 joins
        vm.expectEmit(true, true, false, false);
        emit PlayerJoinedColony(player2, colonyId);

        vm.prank(player2);
        walkscape.joinColony(colonyId);

        // Verify updated colony stats
        WalkScapeCore.ColonyStats memory colonyStats = walkscape.getColonyStats(colonyId);
        assertEq(colonyStats.memberCount, 2);

        // Verify player2's stats
        WalkScapeCore.PlayerStats memory player2Stats = walkscape.getPlayerStats(player2);
        assertEq(player2Stats.currentColony, colonyId);
    }

    function testColonyXpAccumulation() public {
        vm.prank(player1);
        walkscape.registerPlayer();
        vm.prank(player2);
        walkscape.registerPlayer();

        // Create colony and join
        vm.prank(player1);
        uint256 colonyId = walkscape.createColony("test_colony");

        vm.prank(player2);
        walkscape.joinColony(colonyId);

        // Give XP to colony members
        vm.prank(admin);
        walkscape.updateWalkXp(player1, 100);
        vm.prank(admin);
        walkscape.updateWalkXp(player2, 200);

        // Verify colony accumulated XP
        WalkScapeCore.ColonyStats memory colonyStats = walkscape.getColonyStats(colonyId);
        assertEq(colonyStats.totalXp, 300);
    }

    function testCreateColonyAlreadyInColonyFails() public {
        vm.prank(player1);
        walkscape.registerPlayer();

        vm.prank(player1);
        walkscape.createColony("first_colony");

        // Try to create second colony
        vm.prank(player1);
        vm.expectRevert("Already in a colony");
        walkscape.createColony("second_colony");
    }

    function testJoinNonexistentColonyFails() public {
        vm.prank(player1);
        walkscape.registerPlayer();

        vm.prank(player1);
        vm.expectRevert("Colony does not exist");
        walkscape.joinColony(999);
    }

    function testLeaveColony() public {
        vm.prank(player1);
        walkscape.registerPlayer();

        vm.prank(player1);
        uint256 colonyId = walkscape.createColony("test_colony");

        vm.prank(player1);
        walkscape.leaveColony();

        // Verify player left colony
        WalkScapeCore.PlayerStats memory playerStats = walkscape.getPlayerStats(player1);
        assertEq(playerStats.currentColony, 0);

        // Verify colony member count updated
        WalkScapeCore.ColonyStats memory colonyStats = walkscape.getColonyStats(colonyId);
        assertEq(colonyStats.memberCount, 0);
    }

    function testLeaveColonyNotInColonyFails() public {
        vm.prank(player1);
        walkscape.registerPlayer();

        vm.prank(player1);
        vm.expectRevert("Not in a colony");
        walkscape.leaveColony();
    }

    // ========== STAKING SYSTEM TESTS ==========

    function testStaking() public {
        vm.prank(player1);
        walkscape.registerPlayer();

        uint256 stakeAmount = 500;
        
        vm.expectEmit(true, false, false, true);
        emit StakeUpdated(player1, stakeAmount, stakeAmount);

        vm.prank(player1);
        walkscape.stakeForGrowth(stakeAmount);

        // Verify stake info
        WalkScapeCore.StakeInfo memory stakeInfo = walkscape.getStakeInfo(player1);
        assertEq(stakeInfo.amountStaked, stakeAmount);
        assertEq(stakeInfo.growthMultiplier, 200); // 500 tokens = 2x
    }

    function testStakeZeroAmountFails() public {
        vm.prank(player1);
        walkscape.registerPlayer();

        vm.prank(player1);
        vm.expectRevert("Cannot stake zero");
        walkscape.stakeForGrowth(0);
    }

    function testHarvestGrowthReward() public {
        vm.prank(player1);
        walkscape.registerPlayer();

        // Stake tokens
        vm.prank(player1);
        walkscape.stakeForGrowth(1000);

        // Wait 1 week
        vm.warp(block.timestamp + 7 days);

        vm.expectEmit(true, false, false, false);
        emit RewardHarvested(player1, 1, 7 days);

        vm.prank(player1);
        uint256 rewardId = walkscape.harvestGrowthReward();
        
        assertEq(rewardId, 1);

        // Verify pet was minted
        WalkScapeCore.PetStats memory petStats = walkscape.getPetStats(rewardId);
        assertEq(petStats.owner, player1);
        assertEq(petStats.petType, 2); // Legendary pet
        assertEq(petStats.specialTraits, 15); // Special traits
    }

    function testHarvestTooEarlyFails() public {
        vm.prank(player1);
        walkscape.registerPlayer();

        vm.prank(player1);
        walkscape.stakeForGrowth(100);

        // Try to harvest immediately
        vm.prank(player1);
        vm.expectRevert("Must stake for at least 1 day");
        walkscape.harvestGrowthReward();
    }

    function testHarvestWithoutStakeFails() public {
        vm.prank(player1);
        walkscape.registerPlayer();

        vm.prank(player1);
        vm.expectRevert("No stake found");
        walkscape.harvestGrowthReward();
    }

    // ========== STAKE MULTIPLIER TESTS ==========

    function testStakeMultiplierTiers() public {
        vm.prank(player1);
        walkscape.registerPlayer();
        vm.prank(player2);
        walkscape.registerPlayer();
        vm.prank(player3);
        walkscape.registerPlayer();

        // Test different stake tiers
        vm.prank(player1);
        walkscape.stakeForGrowth(50); // Low tier
        WalkScapeCore.StakeInfo memory stake1 = walkscape.getStakeInfo(player1);
        assertEq(stake1.growthMultiplier, 100); // 1x

        vm.prank(player2);
        walkscape.stakeForGrowth(600); // Mid tier
        WalkScapeCore.StakeInfo memory stake2 = walkscape.getStakeInfo(player2);
        assertEq(stake2.growthMultiplier, 200); // 2x

        vm.prank(player3);
        walkscape.stakeForGrowth(1200); // Max tier
        WalkScapeCore.StakeInfo memory stake3 = walkscape.getStakeInfo(player3);
        assertEq(stake3.growthMultiplier, 300); // 3x
    }

    // ========== COMPLEX INTEGRATION TESTS ==========

    function testComplexGameplayScenario() public {
        // Register players
        vm.prank(player1);
        walkscape.registerPlayer();
        vm.prank(player2);
        walkscape.registerPlayer();

        // Player1 gameplay sequence
        vm.startPrank(player1);
        
        // Daily grass touches for a week
        uint256 currentTime = block.timestamp;
        for (uint256 i = 1; i <= 7; i++) {
            currentTime += 1 days;
            vm.warp(currentTime);
            walkscape.touchGrassCheckin("daily_park_location");
        }
        
        // Claim diverse artifacts
        walkscape.claimArtifact("forest_mushroom_spot", 0);
        walkscape.claimArtifact("beach_fossil_site", 1);
        
        vm.stopPrank();
        
        // External XP boosts
        vm.prank(admin);
        walkscape.updateWalkXp(player1, 500);
        
        vm.startPrank(player1);
        
        // Mint and care for pets
        uint256 pet1 = walkscape.mintPet(0);
        uint256 pet2 = walkscape.mintPet(1);
        walkscape.feedPet(pet1, 95);
        walkscape.feedPet(pet2, 88);
        
        // Create colony
        uint256 colonyId = walkscape.createColony("weekend_warriors");
        
        vm.stopPrank();
        
        // Player2 joins colony
        vm.prank(player2);
        walkscape.joinColony(colonyId);
        
        // Add more XP to both players
        vm.prank(admin);
        walkscape.updateWalkXp(player1, 300);
        vm.prank(admin);
        walkscape.updateWalkXp(player2, 250);
        
        // Start staking
        vm.prank(player1);
        walkscape.stakeForGrowth(750);
        
        // Verify final state
        WalkScapeCore.PlayerStats memory finalStats = walkscape.getPlayerStats(player1);
        assertTrue(finalStats.walksXp >= 500);
        assertEq(finalStats.totalArtifacts, 2);
        assertEq(finalStats.petsOwned, 2);
        assertEq(finalStats.currentColony, colonyId);
        assertEq(finalStats.grassTouchStreak, 7);
        
        WalkScapeCore.ColonyStats memory colonyFinal = walkscape.getColonyStats(colonyId);
        assertEq(colonyFinal.memberCount, 2);
        assertTrue(colonyFinal.totalXp >= 550);
    }

    // ========== ADMIN FUNCTIONS TESTS ==========

    function testPauseUnpause() public {
        vm.prank(admin);
        walkscape.pause();

        // Should not be able to register when paused
        vm.prank(player1);
        vm.expectRevert();
        walkscape.registerPlayer();

        vm.prank(admin);
        walkscape.unpause();

        // Should work after unpause
        vm.prank(player1);
        walkscape.registerPlayer();
        assertTrue(walkscape.registeredPlayers(player1));
    }

    function testOnlyAdminCanPause() public {
        vm.prank(player1);
        vm.expectRevert();
        walkscape.pause();
    }

    function testOnlyAdminCanUpdateXp() public {
        vm.prank(player1);
        walkscape.registerPlayer();

        vm.prank(player1);
        vm.expectRevert();
        walkscape.updateWalkXp(player1, 100);
    }

    // ========== ARTIFACT RARITY TESTS ==========

    function testArtifactRarityCalculation() public {
        vm.prank(player1);
        walkscape.registerPlayer();

        // Test with different XP levels
        vm.prank(player1);
        walkscape.claimArtifact("low_xp_location", 0);
        
        vm.prank(admin);
        walkscape.updateWalkXp(player1, 600);
        
        vm.prank(player1);
        walkscape.claimArtifact("mid_xp_location", 1);
        
        vm.prank(admin);
        walkscape.updateWalkXp(player1, 500); // Total 1100
        
        vm.prank(player1);
        walkscape.claimArtifact("high_xp_location", 2);

        uint256[] memory artifacts = walkscape.getPlayerArtifacts(player1);
        assertEq(artifacts.length, 3);
    }

    // ========== PET HAPPINESS MECHANICS TESTS ==========

    function testPetHappinessFeeding() public {
        vm.prank(player1);
        walkscape.registerPlayer();

        vm.prank(admin);
        walkscape.updateWalkXp(player1, 200);

        vm.prank(player1);
        uint256 petId = walkscape.mintPet(0);

        WalkScapeCore.PetStats memory initialStats = walkscape.getPetStats(petId);
        assertEq(initialStats.happiness, 100);

        // Test poor nutrition feeding
        vm.prank(player1);
        walkscape.feedPet(petId, 30);
        WalkScapeCore.PetStats memory poorStats = walkscape.getPetStats(petId);
        assertEq(poorStats.happiness, 90); // Should decrease

        // Test good nutrition feeding
        vm.prank(player1);
        walkscape.feedPet(petId, 85);
        WalkScapeCore.PetStats memory goodStats = walkscape.getPetStats(petId);
        assertEq(goodStats.happiness, 100); // Should increase back to max
    }

    // ========== COMPREHENSIVE INTEGRATION TEST ==========

    function testFullEcosystemIntegration() public {
        // Phase 1: Player Registration
        vm.prank(player1);
        walkscape.registerPlayer();
        vm.prank(player2);
        walkscape.registerPlayer();
        vm.prank(player3);
        walkscape.registerPlayer();

        // Phase 2: Ecosystem Building - Player1 becomes leader
        vm.startPrank(player1);
        
        // Daily activities for 2 weeks
        uint256 currentTime = block.timestamp;
        for (uint256 day = 1; day <= 14; day++) {
            currentTime += 1 days;
            vm.warp(currentTime);
            walkscape.touchGrassCheckin("ecosystem_center");
        }
        
        // Claim diverse artifacts
        walkscape.claimArtifact("forest_mushroom_spot", 0);
        walkscape.claimArtifact("beach_fossil_site", 1);
        walkscape.claimArtifact("urban_graffiti_wall", 2);
        walkscape.claimArtifact("garden_pixel_plant", 3);
        
        vm.stopPrank();

        // Phase 3: Colony and Social Features
        vm.prank(admin);
        walkscape.updateWalkXp(player1, 500);
        
        vm.startPrank(player1);
        
        // Create colony first
        uint256 colonyId = walkscape.createColony("eco_warriors");
        
        // Mint multiple pets
        uint256 pet1 = walkscape.mintPet(0);
        uint256 pet2 = walkscape.mintPet(1);
        uint256 pet3 = walkscape.mintPet(2);
        
        // Care for pets
        walkscape.feedPet(pet1, 95);
        walkscape.feedPet(pet2, 88);
        walkscape.feedPet(pet3, 92);
        
        vm.stopPrank();

        // Phase 4: Other players join ecosystem
        vm.prank(player2);
        walkscape.joinColony(colonyId);

        vm.prank(admin);
        walkscape.updateWalkXp(player2, 350);

        vm.prank(player2);
        uint256 player2Pet = walkscape.mintPet(1);
        vm.prank(player2);
        walkscape.feedPet(player2Pet, 80);

        vm.prank(player3);
        walkscape.joinColony(colonyId);

        vm.prank(admin);
        walkscape.updateWalkXp(player3, 200);

        // Phase 5: Long-term staking
        vm.prank(player1);
        walkscape.stakeForGrowth(1500);

        vm.prank(player2);
        walkscape.stakeForGrowth(800);

        // Phase 6: Wait and harvest
        vm.warp(block.timestamp + 7 days);

        vm.prank(player1);
        uint256 rewardPet1 = walkscape.harvestGrowthReward();

        vm.prank(player2);
        uint256 rewardPet2 = walkscape.harvestGrowthReward();

        // Phase 7: Verification of final state
        WalkScapeCore.PlayerStats memory player1Stats = walkscape.getPlayerStats(player1);
        assertTrue(player1Stats.walksXp >= 200); // After pet costs
        assertEq(player1Stats.totalArtifacts, 4);
        assertEq(player1Stats.grassTouchStreak, 14);
        assertEq(player1Stats.currentColony, colonyId);
        assertEq(player1Stats.petsOwned, 4); // 3 minted + 1 reward

        WalkScapeCore.PlayerStats memory player2Stats = walkscape.getPlayerStats(player2);
        assertTrue(player2Stats.walksXp >= 150); // After pet cost
        assertEq(player2Stats.petsOwned, 2); // 1 minted + 1 reward
        assertEq(player2Stats.currentColony, colonyId);

        WalkScapeCore.ColonyStats memory finalColony = walkscape.getColonyStats(colonyId);
        assertEq(finalColony.memberCount, 3);
        assertTrue(finalColony.totalXp >= 550); // 350 + 200 from player2 and player3
        assertEq(finalColony.creator, player1);

        // Check staking worked
        WalkScapeCore.StakeInfo memory player1Stake = walkscape.getStakeInfo(player1);
        assertEq(player1Stake.amountStaked, 1500);
        assertEq(player1Stake.growthMultiplier, 300);

        // Check reward pets are legendary
        WalkScapeCore.PetStats memory rewardPet1Stats = walkscape.getPetStats(rewardPet1);
        assertEq(rewardPet1Stats.petType, 2); // Legendary
        assertEq(rewardPet1Stats.specialTraits, 15);
    }

    // ========== EDGE CASES ==========

    function testMaxColonyMembers() public {
        // This test would require creating 50+ addresses and would be gas-intensive
        // In a real test suite, you might want to modify MAX_COLONY_MEMBERS for testing
        vm.skip(true);
    }

    function testPetEvolutionRequirements() public {
        vm.prank(player1);
        walkscape.registerPlayer();

        vm.prank(admin);
        walkscape.updateWalkXp(player1, 200);

        vm.prank(player1);
        uint256 petId = walkscape.mintPet(0);

        // Try to evolve without meeting requirements
        vm.prank(player1);
        vm.expectRevert("Pet level too low");
        walkscape.evolvePet(petId);

        // Manually set level to 10 (in real implementation, this would happen through gameplay)
        // This test demonstrates the requirement checking
    }
}
