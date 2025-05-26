// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract LottoMoji is VRFConsumerBaseV2, Ownable {
    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
    uint64 private immutable i_subscriptionId;
    bytes32 private immutable i_gasLane;
    uint32 private immutable i_callbackGasLimit;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private constant NUM_WORDS = 4;

    // Prize distribution percentages (in basis points, 1% = 100)
    uint16 private constant FIRST_PRIZE_PERCENTAGE = 9000; // 90%
    uint16 private constant SECOND_PRIZE_PERCENTAGE = 400; // 4%
    uint16 private constant THIRD_PRIZE_PERCENTAGE = 600;  // 6%

    struct Ticket {
        address owner;
        uint256[] numbers;
    }

    struct Game {
        uint256 gameId;
        uint256[] winningNumbers;
        bool fulfilled;
        uint256 drawTimestamp;
        uint256 prizePool;
        address[] firstPrizeWinners;
        address[] secondPrizeWinners;
        address[] thirdPrizeWinners;
    }

    mapping(uint256 => Game) public games;
    mapping(uint256 => Ticket[]) public gameTickets;
    uint256 public currentGameId;
    mapping(uint256 => bytes32) public gameToRequestId;

    event GameStarted(uint256 indexed gameId, uint256 drawTimestamp);
    event WinningNumbersDrawn(uint256 indexed gameId, uint256[] numbers);
    event TicketBought(uint256 indexed gameId, address indexed player, uint256[] numbers);
    event PrizeClaimed(uint256 indexed gameId, address indexed winner, uint256 amount, uint8 prizeType);

    constructor(
        address vrfCoordinatorV2,
        uint64 subscriptionId,
        bytes32 gasLane,
        uint32 callbackGasLimit
    ) VRFConsumerBaseV2(vrfCoordinatorV2) Ownable(msg.sender) {
        i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorV2);
        i_subscriptionId = subscriptionId;
        i_gasLane = gasLane;
        i_callbackGasLimit = callbackGasLimit;
    }

    function startNewGame() external onlyOwner {
        currentGameId++;
        uint256 drawTimestamp = block.timestamp + 1 minutes;
        games[currentGameId] = Game({
            gameId: currentGameId,
            winningNumbers: new uint256[](0),
            fulfilled: false,
            drawTimestamp: drawTimestamp,
            prizePool: 0,
            firstPrizeWinners: new address[](0),
            secondPrizeWinners: new address[](0),
            thirdPrizeWinners: new address[](0)
        });

        emit GameStarted(currentGameId, drawTimestamp);
    }

    function buyTicket(uint256[] calldata numbers) external payable {
        require(numbers.length == 4, "Must select 4 numbers");
        require(block.timestamp < games[currentGameId].drawTimestamp, "Game closed");
        require(msg.value == 0.1 ether, "Incorrect payment amount"); // 0.1 GRASS for testing

        for(uint256 i = 0; i < numbers.length; i++) {
            require(numbers[i] < 20, "Invalid number");
        }

        gameTickets[currentGameId].push(Ticket({
            owner: msg.sender,
            numbers: numbers
        }));

        games[currentGameId].prizePool += msg.value;
        
        emit TicketBought(currentGameId, msg.sender, numbers);
    }

    function checkWinner(uint256[] memory ticketNumbers, uint256[] memory winningNumbers) 
        internal pure returns (uint8)
    {
        // Check for first prize (exact match in order)
        bool exactMatch = true;
        for(uint256 i = 0; i < 4; i++) {
            if(ticketNumbers[i] != winningNumbers[i]) {
                exactMatch = false;
                break;
            }
        }
        if(exactMatch) return 1;

        // Check for second prize (all numbers match in any order)
        bool[] memory found = new bool[](4);
        uint256 matches = 0;
        for(uint256 i = 0; i < 4; i++) {
            for(uint256 j = 0; j < 4; j++) {
                if(!found[j] && ticketNumbers[i] == winningNumbers[j]) {
                    found[j] = true;
                    matches++;
                    break;
                }
            }
        }
        if(matches == 4) return 2;

        // Check for third prize (3 numbers match in order)
        matches = 0;
        for(uint256 i = 0; i < 3; i++) {
            if(ticketNumbers[i] == winningNumbers[i]) {
                matches++;
            }
        }
        if(matches == 3) return 3;

        return 0; // No prize
    }

    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal override {
        uint256 gameId = currentGameId;
        Game storage game = games[gameId];
        require(!game.fulfilled, "Game already fulfilled");

        // Generate winning numbers (0-19 range)
        uint256[] memory winningNumbers = new uint256[](4);
        for(uint256 i = 0; i < 4; i++) {
            winningNumbers[i] = randomWords[i] % 20;
        }
        game.winningNumbers = winningNumbers;

        // Check all tickets for winners
        Ticket[] storage tickets = gameTickets[gameId];
        for(uint256 i = 0; i < tickets.length; i++) {
            uint8 prizeType = checkWinner(tickets[i].numbers, winningNumbers);
            if(prizeType == 1) {
                game.firstPrizeWinners.push(tickets[i].owner);
            } else if(prizeType == 2) {
                game.secondPrizeWinners.push(tickets[i].owner);
            } else if(prizeType == 3) {
                game.thirdPrizeWinners.push(tickets[i].owner);
            }
        }

        game.fulfilled = true;
        emit WinningNumbersDrawn(gameId, winningNumbers);

        // Distribute prizes
        distributePrizes(gameId);
    }

    function distributePrizes(uint256 gameId) internal {
        Game storage game = games[gameId];
        uint256 prizePool = game.prizePool;

        // Calculate prize amounts
        uint256 firstPrizeAmount = (prizePool * FIRST_PRIZE_PERCENTAGE) / 10000;
        uint256 secondPrizeAmount = (prizePool * SECOND_PRIZE_PERCENTAGE) / 10000;
        uint256 thirdPrizeAmount = (prizePool * THIRD_PRIZE_PERCENTAGE) / 10000;

        // Distribute first prize
        if(game.firstPrizeWinners.length > 0) {
            uint256 firstPrizeShare = firstPrizeAmount / game.firstPrizeWinners.length;
            for(uint256 i = 0; i < game.firstPrizeWinners.length; i++) {
                payable(game.firstPrizeWinners[i]).transfer(firstPrizeShare);
                emit PrizeClaimed(gameId, game.firstPrizeWinners[i], firstPrizeShare, 1);
            }
        }

        // Distribute second prize
        if(game.secondPrizeWinners.length > 0) {
            uint256 secondPrizeShare = secondPrizeAmount / game.secondPrizeWinners.length;
            for(uint256 i = 0; i < game.secondPrizeWinners.length; i++) {
                payable(game.secondPrizeWinners[i]).transfer(secondPrizeShare);
                emit PrizeClaimed(gameId, game.secondPrizeWinners[i], secondPrizeShare, 2);
            }
        }

        // Distribute third prize
        if(game.thirdPrizeWinners.length > 0) {
            uint256 thirdPrizeShare = thirdPrizeAmount / game.thirdPrizeWinners.length;
            for(uint256 i = 0; i < game.thirdPrizeWinners.length; i++) {
                payable(game.thirdPrizeWinners[i]).transfer(thirdPrizeShare);
                emit PrizeClaimed(gameId, game.thirdPrizeWinners[i], thirdPrizeShare, 3);
            }
        }
    }

    function requestRandomNumbers() external {
        require(block.timestamp >= games[currentGameId].drawTimestamp, "Draw time not reached");
        require(!games[currentGameId].fulfilled, "Game already drawn");

        bytes32 requestId = i_vrfCoordinator.requestRandomWords(
            i_gasLane,
            i_subscriptionId,
            REQUEST_CONFIRMATIONS,
            i_callbackGasLimit,
            NUM_WORDS
        );

        gameToRequestId[currentGameId] = requestId;
    }

    function getWinningNumbers(uint256 gameId) external view returns (uint256[] memory) {
        require(games[gameId].fulfilled, "Numbers not drawn yet");
        return games[gameId].winningNumbers;
    }

    receive() external payable {}
}