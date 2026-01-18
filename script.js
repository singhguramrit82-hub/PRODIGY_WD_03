// SELECT ELEMENTS
const cells = document.querySelectorAll(".cell");
const statusText = document.getElementById("status");
const resetBtn = document.getElementById("reset");
const boardElement = document.querySelector(".board");

// AUDIO SETUP
const clickSound = new Audio("./sounds/click.wav");
const winSound = new Audio("./sounds/win.wav");
const loseSound = new Audio("./sounds/lose.mp3");

// GAME STATE 
const mode = localStorage.getItem("mode");
const p1 = localStorage.getItem("p1") || "Player 1";
const p2 = localStorage.getItem("p2") || "Player 2";

let currentPlayer = "X";
let gameActive = true;
let gameState = ["", "", "", "", "", "", "", "", ""];

const winPatterns = [[0, 1, 2], [3, 4, 5], [6, 7, 8],[0, 3, 6], [1, 4, 7], [2, 5, 8],[0, 4, 8], [2, 4, 6]];

// INITIALIZE UI 
function updateStatusText() {
    let nameToShow = (currentPlayer === "X") ? p1 : p2;
    if (nameToShow.toLowerCase() === "you") {
        statusText.textContent = `Your Turn (${currentPlayer})`;
    } 
    else {
        statusText.textContent = `${nameToShow}'s Turn (${currentPlayer})`;
    }
}

// Start the game UI
updateStatusText();
updateHoverClass();

// EVENT LISTENERS
cells.forEach(cell => cell.addEventListener("click", handleClick));
resetBtn.addEventListener("click", resetGame);

// CORE FUNCTIONS 
function updateHoverClass() { // This looks at whose turn it is
    if (!boardElement){
      return;
    }
    boardElement.classList.remove("x-turn", "o-turn");
    if (gameActive) {
        boardElement.classList.add(currentPlayer === "X" ? "x-turn" : "o-turn");
    }
}

function playSound(sound) {
    sound.currentTime = 0;
    sound.play().catch(() => {});
}

function handleClick() {
    const index = this.dataset.index;

    if (!gameActive || gameState[index] !== "") return;

    playSound(clickSound);
    makeMove(index, currentPlayer);

    // Computer Logic
    if (gameActive && mode === "computer" && currentPlayer === "O") {
        statusText.textContent = "Computer is thinking...";
        setTimeout(() => {
            computerMove();
        }, 600);
    }
}

function makeMove(index, player) {
    if (gameState[index] !== "") return;

    gameState[index] = player;
    cells[index].textContent = player;
    cells[index].classList.add("filled");
    cells[index].setAttribute("data-player", player);

    const winningPattern = checkWin(player);

    if (winningPattern) {
      endGame(player, winningPattern);
      return;
    }

    if (!gameState.includes("")) {
      statusText.textContent = "It's a Draw 🤝";
      gameActive = false;
      boardElement.classList.remove("x-turn", "o-turn");
      return;
    }

    // Switch Player
    currentPlayer = (currentPlayer === "X") ? "O" : "X";
    updateStatusText(); 
    updateHoverClass();
}

function checkWin(player) {
    for (let pattern of winPatterns) {
        if (pattern.every(index => gameState[index] === player)) {
            return pattern;
        }
    }
    return null;
}

function endGame(player, pattern) {
    gameActive = false;
    boardElement.classList.remove("x-turn", "o-turn");
    
    pattern.forEach(index => cells[index].classList.add("win"));

    if (mode === "computer" && player === "O") {
        playSound(loseSound);
        statusText.textContent = "Computer Wins! 🤖";
    } 
    else {
        playSound(winSound);
        let winnerName = (player === "X") ? p1 : p2;
        
        if (winnerName.toLowerCase() === "you") {
            statusText.textContent = "You Win! 🎉";
        } 
        else {
            statusText.textContent = `${winnerName} Wins 🎉`;
        }
    }
}

// SMART AI 
function computerMove() {
    if (!gameActive) return;

    let move = findBestMove("O");                       // Try to win
    if (move === null) move = findBestMove("X");        // Try to block
    if (move === null && gameState[4] === "") move = 4; // Take center
    
    if (move === null) {
        let emptyCells = gameState.map((v, i) => v === "" ? i : null).filter(v => v !== null);
        move = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    }

    if (move !== null) {
        playSound(clickSound);
        makeMove(move, "O");
    }
}

function findBestMove(player) {
    for (let pattern of winPatterns) {
        const [a, b, c] = pattern;
        const values = [gameState[a], gameState[b], gameState[c]];
        if (values.filter(v => v === player).length === 2 && values.filter(v => v === "").length === 1) {
            return pattern[values.indexOf("")];
        }
    }
    return null;
}

// RESET 
function resetGame() {
    [clickSound, winSound, loseSound].forEach(s => { s.pause(); s.currentTime = 0; });
    
    gameActive = true;
    currentPlayer = "X";
    gameState = ["", "", "", "", "", "", "", "", ""];
    
    updateStatusText(); 
    
    cells.forEach(cell => {
        cell.textContent = "";
        cell.classList.remove("win");
        cell.removeAttribute("data-player");
    });

    updateHoverClass();
}