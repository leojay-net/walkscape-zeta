import { Contract, BrowserProvider, JsonRpcProvider, getAddress, isAddress } from 'ethers';

// Contract ABI for WalkScapeCore (generated from Solidity contract)
export const WALKSCAPE_ABI = [
    {
        "type": "constructor",
        "inputs": [
            {
                "name": "_admin",
                "type": "address",
                "internalType": "address"
            }
        ],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "GRASS_TOUCH_COOLDOWN",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "MAX_COLONY_MEMBERS",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "MIN_HARVEST_TIME",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "PET_MINT_COST",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "STREAK_RESET_TIME",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "artifactCounter",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "artifacts",
        "inputs": [
            {
                "name": "",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "outputs": [
            {
                "name": "locationHash",
                "type": "bytes32",
                "internalType": "bytes32"
            },
            {
                "name": "artifactType",
                "type": "uint8",
                "internalType": "uint8"
            },
            {
                "name": "owner",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "claimedAt",
                "type": "uint64",
                "internalType": "uint64"
            },
            {
                "name": "rarity",
                "type": "uint8",
                "internalType": "uint8"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "claimArtifact",
        "inputs": [
            {
                "name": "locationHash",
                "type": "bytes32",
                "internalType": "bytes32"
            },
            {
                "name": "artifactType",
                "type": "uint8",
                "internalType": "uint8"
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "colonies",
        "inputs": [
            {
                "name": "",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "outputs": [
            {
                "name": "name",
                "type": "bytes32",
                "internalType": "bytes32"
            },
            {
                "name": "creator",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "memberCount",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "totalXp",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "createdAt",
                "type": "uint64",
                "internalType": "uint64"
            },
            {
                "name": "weeklyChallengeScore",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "colonyCounter",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "colonyMembers",
        "inputs": [
            {
                "name": "",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "",
                "type": "address",
                "internalType": "address"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "bool",
                "internalType": "bool"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "createColony",
        "inputs": [
            {
                "name": "name",
                "type": "bytes32",
                "internalType": "bytes32"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "evolvePet",
        "inputs": [
            {
                "name": "petId",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "feedPet",
        "inputs": [
            {
                "name": "petId",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "nutritionScore",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "getArtifactOwner",
        "inputs": [
            {
                "name": "artifactId",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "address",
                "internalType": "address"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "getColonyStats",
        "inputs": [
            {
                "name": "colonyId",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "tuple",
                "internalType": "struct WalkScapeCore.ColonyStats",
                "components": [
                    {
                        "name": "name",
                        "type": "bytes32",
                        "internalType": "bytes32"
                    },
                    {
                        "name": "creator",
                        "type": "address",
                        "internalType": "address"
                    },
                    {
                        "name": "memberCount",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "totalXp",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "createdAt",
                        "type": "uint64",
                        "internalType": "uint64"
                    },
                    {
                        "name": "weeklyChallengeScore",
                        "type": "uint256",
                        "internalType": "uint256"
                    }
                ]
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "getPetStats",
        "inputs": [
            {
                "name": "petId",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "tuple",
                "internalType": "struct WalkScapeCore.PetStats",
                "components": [
                    {
                        "name": "owner",
                        "type": "address",
                        "internalType": "address"
                    },
                    {
                        "name": "petType",
                        "type": "uint8",
                        "internalType": "uint8"
                    },
                    {
                        "name": "level",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "happiness",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "evolutionStage",
                        "type": "uint8",
                        "internalType": "uint8"
                    },
                    {
                        "name": "lastFed",
                        "type": "uint64",
                        "internalType": "uint64"
                    },
                    {
                        "name": "specialTraits",
                        "type": "uint256",
                        "internalType": "uint256"
                    }
                ]
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "getPlayerArtifacts",
        "inputs": [
            {
                "name": "player",
                "type": "address",
                "internalType": "address"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "uint256[]",
                "internalType": "uint256[]"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "getPlayerPets",
        "inputs": [
            {
                "name": "player",
                "type": "address",
                "internalType": "address"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "uint256[]",
                "internalType": "uint256[]"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "getPlayerStats",
        "inputs": [
            {
                "name": "player",
                "type": "address",
                "internalType": "address"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "tuple",
                "internalType": "struct WalkScapeCore.PlayerStats",
                "components": [
                    {
                        "name": "walksXp",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "healthScore",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "lastCheckin",
                        "type": "uint64",
                        "internalType": "uint64"
                    },
                    {
                        "name": "totalArtifacts",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "currentColony",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "petsOwned",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "grassTouchStreak",
                        "type": "uint256",
                        "internalType": "uint256"
                    }
                ]
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "getStakeInfo",
        "inputs": [
            {
                "name": "player",
                "type": "address",
                "internalType": "address"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "tuple",
                "internalType": "struct WalkScapeCore.StakeInfo",
                "components": [
                    {
                        "name": "amountStaked",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "stakeTimestamp",
                        "type": "uint64",
                        "internalType": "uint64"
                    },
                    {
                        "name": "growthMultiplier",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "lastHarvest",
                        "type": "uint64",
                        "internalType": "uint64"
                    }
                ]
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "harvestGrowthReward",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "joinColony",
        "inputs": [
            {
                "name": "colonyId",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "leaveColony",
        "inputs": [],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "locationClaimed",
        "inputs": [
            {
                "name": "",
                "type": "bytes32",
                "internalType": "bytes32"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "bool",
                "internalType": "bool"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "mintPet",
        "inputs": [
            {
                "name": "petType",
                "type": "uint8",
                "internalType": "uint8"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "owner",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "address",
                "internalType": "address"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "pause",
        "inputs": [],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "paused",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "bool",
                "internalType": "bool"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "petCounter",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "pets",
        "inputs": [
            {
                "name": "",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "outputs": [
            {
                "name": "owner",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "petType",
                "type": "uint8",
                "internalType": "uint8"
            },
            {
                "name": "level",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "happiness",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "evolutionStage",
                "type": "uint8",
                "internalType": "uint8"
            },
            {
                "name": "lastFed",
                "type": "uint64",
                "internalType": "uint64"
            },
            {
                "name": "specialTraits",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "playerColony",
        "inputs": [
            {
                "name": "",
                "type": "address",
                "internalType": "address"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "players",
        "inputs": [
            {
                "name": "",
                "type": "address",
                "internalType": "address"
            }
        ],
        "outputs": [
            {
                "name": "walksXp",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "healthScore",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "lastCheckin",
                "type": "uint64",
                "internalType": "uint64"
            },
            {
                "name": "totalArtifacts",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "currentColony",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "petsOwned",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "grassTouchStreak",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "registerPlayer",
        "inputs": [],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "registeredPlayers",
        "inputs": [
            {
                "name": "",
                "type": "address",
                "internalType": "address"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "bool",
                "internalType": "bool"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "renounceOwnership",
        "inputs": [],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "rescueTokens",
        "inputs": [
            {
                "name": "token",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "amount",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "stakeForGrowth",
        "inputs": [
            {
                "name": "amount",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "stakes",
        "inputs": [
            {
                "name": "",
                "type": "address",
                "internalType": "address"
            }
        ],
        "outputs": [
            {
                "name": "amountStaked",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "stakeTimestamp",
                "type": "uint64",
                "internalType": "uint64"
            },
            {
                "name": "growthMultiplier",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "lastHarvest",
                "type": "uint64",
                "internalType": "uint64"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "totalStaked",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "touchGrassCheckin",
        "inputs": [
            {
                "name": "locationHash",
                "type": "bytes32",
                "internalType": "bytes32"
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "transferArtifact",
        "inputs": [
            {
                "name": "to",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "artifactId",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "transferOwnership",
        "inputs": [
            {
                "name": "newOwner",
                "type": "address",
                "internalType": "address"
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "unpause",
        "inputs": [],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "updateHealthScore",
        "inputs": [
            {
                "name": "player",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "healthScore",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "updateWalkXp",
        "inputs": [
            {
                "name": "player",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "xpGained",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "event",
        "name": "ArtifactClaimed",
        "inputs": [
            {
                "name": "player",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "artifactId",
                "type": "uint256",
                "indexed": true,
                "internalType": "uint256"
            },
            {
                "name": "locationHash",
                "type": "bytes32",
                "indexed": false,
                "internalType": "bytes32"
            },
            {
                "name": "artifactType",
                "type": "uint8",
                "indexed": false,
                "internalType": "uint8"
            },
            {
                "name": "rarity",
                "type": "uint8",
                "indexed": false,
                "internalType": "uint8"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "ColonyCreated",
        "inputs": [
            {
                "name": "colonyId",
                "type": "uint256",
                "indexed": true,
                "internalType": "uint256"
            },
            {
                "name": "creator",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "name",
                "type": "bytes32",
                "indexed": false,
                "internalType": "bytes32"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "GrassTouched",
        "inputs": [
            {
                "name": "player",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "locationHash",
                "type": "bytes32",
                "indexed": false,
                "internalType": "bytes32"
            },
            {
                "name": "streak",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            },
            {
                "name": "xpGained",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "OwnershipTransferred",
        "inputs": [
            {
                "name": "previousOwner",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "newOwner",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "Paused",
        "inputs": [
            {
                "name": "account",
                "type": "address",
                "indexed": false,
                "internalType": "address"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "PetEvolved",
        "inputs": [
            {
                "name": "petId",
                "type": "uint256",
                "indexed": true,
                "internalType": "uint256"
            },
            {
                "name": "newEvolutionStage",
                "type": "uint8",
                "indexed": false,
                "internalType": "uint8"
            },
            {
                "name": "specialTraitsUnlocked",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "PetMinted",
        "inputs": [
            {
                "name": "owner",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "petId",
                "type": "uint256",
                "indexed": true,
                "internalType": "uint256"
            },
            {
                "name": "petType",
                "type": "uint8",
                "indexed": false,
                "internalType": "uint8"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "PlayerJoinedColony",
        "inputs": [
            {
                "name": "player",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "colonyId",
                "type": "uint256",
                "indexed": true,
                "internalType": "uint256"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "PlayerRegistered",
        "inputs": [
            {
                "name": "player",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "timestamp",
                "type": "uint64",
                "indexed": false,
                "internalType": "uint64"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "RewardHarvested",
        "inputs": [
            {
                "name": "player",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "rewardId",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            },
            {
                "name": "stakeDuration",
                "type": "uint64",
                "indexed": false,
                "internalType": "uint64"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "StakeUpdated",
        "inputs": [
            {
                "name": "player",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "amount",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            },
            {
                "name": "newTotal",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "Unpaused",
        "inputs": [
            {
                "name": "account",
                "type": "address",
                "indexed": false,
                "internalType": "address"
            }
        ],
        "anonymous": false
    },
    {
        "type": "error",
        "name": "EnforcedPause",
        "inputs": []
    },
    {
        "type": "error",
        "name": "ExpectedPause",
        "inputs": []
    },
    {
        "type": "error",
        "name": "OwnableInvalidOwner",
        "inputs": [
            {
                "name": "owner",
                "type": "address",
                "internalType": "address"
            }
        ]
    },
    {
        "type": "error",
        "name": "OwnableUnauthorizedAccount",
        "inputs": [
            {
                "name": "account",
                "type": "address",
                "internalType": "address"
            }
        ]
    },
    {
        "type": "error",
        "name": "ReentrancyGuardReentrantCall",
        "inputs": []
    }
];

// Types matching the Solidity contract
export interface PlayerStats {
    walksXp: bigint;
    healthScore: bigint;
    lastCheckin: number;
    totalArtifacts: bigint;
    currentColony: bigint;
    petsOwned: bigint;
    grassTouchStreak: bigint;
}

export interface PetStats {
    owner: string;
    petType: number;
    level: bigint;
    happiness: bigint;
    evolutionStage: number;
    lastFed: number;
    specialTraits: bigint;
}

export interface ColonyStats {
    name: string;
    creator: string;
    memberCount: bigint;
    totalXp: bigint;
    createdAt: number;
    weeklyChallengeScore: bigint;
}

export interface StakeInfo {
    amountStaked: bigint;
    stakeTimestamp: number;
    growthMultiplier: bigint;
    lastHarvest: number;
}

// Contract configuration from environment variables
// Normalize and checksum contract address to avoid ENS resolution attempts
const RAW_ADDR = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '').trim();
export const CONTRACT_ADDRESS = isAddress(RAW_ADDR) ? getAddress(RAW_ADDR) : (() => {
    if (RAW_ADDR) {
        // Log once in dev environments
        try { console.warn('Invalid NEXT_PUBLIC_CONTRACT_ADDRESS:', RAW_ADDR); } catch { }
    }
    // Fallback zero address to prevent ENS lookups on invalid input
    return '0x0000000000000000000000000000000000000000';
})();
export const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL!;
export const SUPPORTED_CHAIN_IDS = process.env.NEXT_PUBLIC_SUPPORTED_CHAIN_IDS?.split(',').map(id => parseInt(id.trim())) || [7000]; // Default to ZetaChain Mainnet

// Reader fallback provider (let ethers auto-detect network to avoid mismatch errors)
export const provider = new JsonRpcProvider(RPC_URL);

// Contract factory function
export function getContract(signerOrProvider?: BrowserProvider | JsonRpcProvider) {
    try {
        return new Contract(CONTRACT_ADDRESS, WALKSCAPE_ABI, signerOrProvider || provider);
    } catch (error) {
        console.error('Error creating contract instance:', error);
        throw error;
    }
}

// Utility functions
export function stringToBytes32(str: string): string {
    // Convert string to bytes32 for contract calls
    const bytes = new TextEncoder().encode(str);
    const padded = new Uint8Array(32);
    padded.set(bytes.slice(0, 32));
    return '0x' + Array.from(padded).map(b => b.toString(16).padStart(2, '0')).join('');
}

export function bytes32ToString(bytes32: string): string {
    // Convert bytes32 back to string
    const bytes = new Uint8Array(
        bytes32.slice(2).match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []
    );
    return new TextDecoder().decode(bytes).replace(/\0+$/, '');
}

// Artifact types enum
export enum ArtifactType {
    MUSHROOM = 0,
    FOSSIL = 1,
    GRAFFITI = 2,
    PIXEL_PLANT = 3
}

// ZetaChain configuration (update/extend if supporting more networks later)
export const ZETACHAIN_MAINNET_CONFIG = {
    chainId: 7000,
    name: 'ZetaChain Mainnet',
    currency: 'ZETA',
    explorerUrl: '',
    rpcUrl: RPC_URL
};

export const SUPPORTED_CHAINS = [ZETACHAIN_MAINNET_CONFIG];
