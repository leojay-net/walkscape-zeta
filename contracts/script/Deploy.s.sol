// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "forge-std/console.sol";
import "../src/WalkScapeCore.sol";


contract DeployWalkScapeCore is Script {
    function run() external {
        // Get admin address from environment or use deployer
        address admin = vm.envOr("ADMIN_ADDRESS", msg.sender);
        
        console.log("Deploying WalkScapeCore..");
        console.log("Admin address:", admin);
        console.log("Deployer address:", msg.sender);
        console.log("Chain ID:", block.chainid);
        
        vm.startBroadcast();
        
        // Deploy the contract
        WalkScapeCore walkscape = new WalkScapeCore(admin);
        
        vm.stopBroadcast();
        
        console.log("WalkScapeCore deployed at:", address(walkscape));
        
        // Log deployment info for frontend integration
        console.log("\n=== DEPLOYMENT INFO ===");
        console.log("Contract Address:", address(walkscape));
        console.log("Admin Address:", admin);
        console.log("Network:", block.chainid);
        console.log("Block Number:", block.number);
        console.log("========================\n");
        
        // Verify contract is working
        console.log("Verifying deployment...");
        
        // Check initial state
        console.log("Artifact Counter:", walkscape.artifactCounter());
        console.log("Pet Counter:", walkscape.petCounter());
        console.log("Colony Counter:", walkscape.colonyCounter());
        console.log("Total Staked:", walkscape.totalStaked());
        console.log("Owner:", walkscape.owner());
        
        // Test basic functionality
        console.log("Testing basic functionality...");
        
        vm.startPrank(admin);
        
        // Try to pause/unpause (admin function)
        walkscape.pause();
        console.log("Paused successfully");
        
        walkscape.unpause();
        console.log("Unpaused successfully");
        
        vm.stopPrank();
        
        console.log("Deployment verification complete!");
        
        // Save deployment info to file (if running locally)
        // string memory deploymentInfo = string(abi.encodePacked(
        //     "{\n",
        //     '  "contractAddress": "', vm.toString(address(walkscape)), '",\n',
        //     '  "adminAddress": "', vm.toString(admin), '",\n',
        //     '  "deployer": "', vm.toString(msg.sender), '",\n',
        //     '  "chainId": ', vm.toString(block.chainid), ',\n',
        //     '  "blockNumber": ', vm.toString(block.number), ',\n',
        //     '  "deployedAt": "', vm.toString(block.timestamp), '"\n',
        //     "}"
        // ));
        
        // vm.writeFile("deployment_info.json", deploymentInfo);
        // console.log("Deployment info saved to deployment_info.json");
    }
}

/**
 * @title Setup WalkScapeCore
 * @dev Post-deployment setup script for WalkScapeCore contract
 * Usage: forge script script/Deploy.s.sol:SetupWalkScapeCore --rpc-url <rpc_url> --private-key <private_key> --broadcast
 */
contract SetupWalkScapeCore is Script {
    function run() external {
        address contractAddress = vm.envAddress("CONTRACT_ADDRESS");
        
        console.log("Setting up WalkScapeCore at:", contractAddress);
        
        WalkScapeCore walkscape = WalkScapeCore(contractAddress);
        
        vm.startBroadcast();
        
        // Perform any additional setup if needed
        // For example, if there were initial configuration functions
        
        // Verify the contract is working
        console.log("Current owner:", walkscape.owner());
        console.log("Artifact counter:", walkscape.artifactCounter());
        console.log("Pet counter:", walkscape.petCounter());
        console.log("Colony counter:", walkscape.colonyCounter());
        
        vm.stopBroadcast();
        
        console.log("Setup complete!");
    }
}

/**
 * @title Register Test Players
 * @dev Script to register test players for development/testing
 * Usage: forge script script/Deploy.s.sol:RegisterTestPlayers --rpc-url <rpc_url> --private-key <private_key> --broadcast
 */
contract RegisterTestPlayers is Script {
    function run() external {
        address contractAddress = vm.envAddress("CONTRACT_ADDRESS");
        
        console.log("Registering test players for WalkScapeCore at:", contractAddress);
        
        WalkScapeCore walkscape = WalkScapeCore(contractAddress);
        
        // Create test addresses
        address player1 = makeAddr("testPlayer1");
        address player2 = makeAddr("testPlayer2");
        address player3 = makeAddr("testPlayer3");
        
        console.log("Test Player 1:", player1);
        console.log("Test Player 2:", player2);
        console.log("Test Player 3:", player3);
        
        vm.startBroadcast();
        
        // Register players
        vm.prank(player1);
        walkscape.registerPlayer();
        console.log("Player 1 registered");
        
        vm.prank(player2);
        walkscape.registerPlayer();
        console.log("Player 2 registered");
        
        vm.prank(player3);
        walkscape.registerPlayer();
        console.log("Player 3 registered");
        
        // Give them some initial XP for testing
        walkscape.updateWalkXp(player1, 500);
        walkscape.updateWalkXp(player2, 300);
        walkscape.updateWalkXp(player3, 200);
        
        console.log("Initial XP granted to test players");
        
        // Create a test colony
        vm.prank(player1);
        uint256 colonyId = walkscape.createColony("Test Colony");
        console.log("Test colony created with ID:", colonyId);
        
        // Player 2 joins the colony
        vm.prank(player2);
        walkscape.joinColony(colonyId);
        console.log("Player 2 joined test colony");
        
        // Let players claim some test artifacts
        vm.prank(player1);
        walkscape.claimArtifact("test_location_1", 0);
        console.log("Player 1 claimed test artifact");
        
        vm.prank(player2);
        walkscape.claimArtifact("test_location_2", 1);
        console.log("Player 2 claimed test artifact");
        
        // Let players mint test pets
        vm.prank(player1);
        walkscape.mintPet(0);
        console.log("Player 1 minted test pet");
        
        vm.prank(player2);
        walkscape.mintPet(1);
        console.log("Player 2 minted test pet");
        
        vm.stopBroadcast();
        
        console.log("Test players setup complete!");
        
        // Output test data
        console.log("\n=== TEST DATA ===");
        console.log("Contract:", contractAddress);
        console.log("Test Player 1 (has colony, pet, artifact):", player1);
        console.log("Test Player 2 (in colony, pet, artifact):", player2);
        console.log("Test Player 3 (basic player):", player3);
        console.log("Test Colony ID:", colonyId);
        console.log("================\n");
    }
}

/**
 * @title Verify Deployment
 * @dev Script to verify a deployed WalkScapeCore contract
 * Usage: forge script script/Deploy.s.sol:VerifyDeployment --rpc-url <rpc_url>
 */
contract VerifyDeployment is Script {
    function run() external {
        address contractAddress = vm.envAddress("CONTRACT_ADDRESS");
        
        console.log("Verifying WalkScapeCore deployment at:", contractAddress);
        
        WalkScapeCore walkscape = WalkScapeCore(contractAddress);
        
        // Check contract state
        console.log("=== CONTRACT STATE ===");
        console.log("Owner:", walkscape.owner());
        console.log("Artifact Counter:", walkscape.artifactCounter());
        console.log("Pet Counter:", walkscape.petCounter());
        console.log("Colony Counter:", walkscape.colonyCounter());
        console.log("Total Staked:", walkscape.totalStaked());
        console.log("Pet Mint Cost:", walkscape.PET_MINT_COST());
        console.log("Min Harvest Time:", walkscape.MIN_HARVEST_TIME());
        console.log("Max Colony Members:", walkscape.MAX_COLONY_MEMBERS());
        console.log("======================");
        
        // Test read functions (these don't require transactions)
        try walkscape.getPlayerStats(address(0x1)) {
            console.log("ERROR: Should have reverted for unregistered player");
        } catch {
            console.log("Correctly reverts for unregistered player");
        }
        
        console.log("Contract verification complete - all systems operational");
    }
}
