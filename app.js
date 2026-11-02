const navButtons = document.querySelectorAll('.nav-btn, .primary-btn, .secondary-btn, .card-btn');
const sections = document.querySelectorAll('.section-panel');

const showSection = (targetId) => {
  sections.forEach((section) => {
    const active = section.id === targetId;
    section.classList.toggle('active', active);
  });

  navButtons.forEach((button) => {
    const target = button.dataset.section;
    if (target === targetId) {
      button.classList.add('active');
    } else if (button.classList.contains('nav-btn')) {
      button.classList.remove('active');
    }
  });
};

navButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const sectionId = button.dataset.section;
    if (sectionId) {
      showSection(sectionId);
    }
  });
});

const boardEl = document.getElementById('chessBoard');
const chessStatus = document.getElementById('chessStatus');
const chessResetBtn = document.getElementById('chessReset');

const pieceGlyphs = {
  wP: '♙',
  wR: '♖',
  wN: '♘',
  wB: '♗',
  wQ: '♕',
  wK: '♔',
  bP: '♟',
  bR: '♜',
  bN: '♞',
  bB: '♝',
  bQ: '♛',
  bK: '♚'
};

const initialBoard = [
  ['bR', 'bN', 'bB', 'bQ', 'bK', 'bB', 'bN', 'bR'],
  ['bP', 'bP', 'bP', 'bP', 'bP', 'bP', 'bP', 'bP'],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  ['wP', 'wP', 'wP', 'wP', 'wP', 'wP', 'wP', 'wP'],
  ['wR', 'wN', 'wB', 'wQ', 'wK', 'wB', 'wN', 'wR']
];

let board = cloneBoard(initialBoard);
let selected = null;
let turn = 'white';

function cloneBoard(source) {
  return source.map((row) => [...row]);
}

function isWhite(piece) {
  return !!piece && piece[0] === 'w';
}

function isBlack(piece) {
  return !!piece && piece[0] === 'b';
}

function getPieceColor(piece) {
  if (!piece) return null;
  return piece[0] === 'w' ? 'white' : 'black';
}

function getPieceType(piece) {
  if (!piece) return null;
  return piece[1];
}

function inBounds(row, col) {
  return row >= 0 && row < 8 && col >= 0 && col < 8;
}

function moveIsWithinBoard(row, col) {
  return row >= 0 && row < 8 && col >= 0 && col < 8;
}

function getValidMoves(row, col) {
  const piece = board[row][col];
  if (!piece) return [];

  const color = getPieceColor(piece);
  const type = getPieceType(piece);
  const moves = [];

  const addDirectional = (dr, dc) => {
    let r = row + dr;
    let c = col + dc;
    while (moveIsWithinBoard(r, c)) {
      const target = board[r][c];
      if (!target) {
        moves.push([r, c]);
      } else if (getPieceColor(target) !== color) {
        moves.push([r, c]);
        break;
      } else {
        break;
      }
      r += dr;
      c += dc;
    }
  };

  if (type === 'P') {
    const direction = color === 'white' ? -1 : 1;
    const startRow = color === 'white' ? 6 : 1;
    const front = row + direction;

    if (inBounds(front, col) && !board[front][col]) {
      moves.push([front, col]);
      if (row === startRow) {
        const twoSteps = row + direction * 2;
        if (inBounds(twoSteps, col) && !board[twoSteps][col]) {
          moves.push([twoSteps, col]);
        }
      }
    }

    [-1, 1].forEach((dir) => {
      const targetRow = row + direction;
      const targetCol = col + dir;
      if (inBounds(targetRow, targetCol)) {
        const target = board[targetRow][targetCol];
        if (target && getPieceColor(target) !== color) {
          moves.push([targetRow, targetCol]);
        }
      }
    });
  }

  if (type === 'N') {
    const offsets = [
      [-2, -1], [-2, 1], [-1, -2], [-1, 2],
      [1, -2], [1, 2], [2, -1], [2, 1]
    ];

    offsets.forEach(([dr, dc]) => {
      const r = row + dr;
      const c = col + dc;
      if (inBounds(r, c)) {
        const target = board[r][c];
        if (!target || getPieceColor(target) !== color) {
          moves.push([r, c]);
        }
      }
    });
  }

  if (type === 'B' || type === 'R' || type === 'Q') {
    if (type === 'B' || type === 'Q') {
      addDirectional(1, 1);
      addDirectional(1, -1);
      addDirectional(-1, 1);
      addDirectional(-1, -1);
    }
    if (type === 'R' || type === 'Q') {
      addDirectional(1, 0);
      addDirectional(-1, 0);
      addDirectional(0, 1);
      addDirectional(0, -1);
    }
  }

  if (type === 'K') {
    [-1, 0, 1].forEach((dr) => {
      [-1, 0, 1].forEach((dc) => {
        if (dr === 0 && dc === 0) return;
        const r = row + dr;
        const c = col + dc;
        if (inBounds(r, c)) {
          const target = board[r][c];
          if (!target || getPieceColor(target) !== color) {
            moves.push([r, c]);
          }
        }
      });
    });
  }

  return moves;
}

function renderBoard() {
  boardEl.innerHTML = '';
  const validMoves = selected ? new Set(getValidMoves(selected.row, selected.col).map(([r, c]) => `${r}-${c}`)) : new Set();

  for (let row = 0; row < 8; row += 1) {
    for (let col = 0; col < 8; col += 1) {
      const square = document.createElement('button');
      square.className = `square ${(row + col) % 2 === 0 ? 'light' : 'dark'}`;
      square.type = 'button';
      square.dataset.row = String(row);
      square.dataset.col = String(col);

      if (selected && selected.row === row && selected.col === col) {
        square.classList.add('selected');
      }

      const moveKey = `${row}-${col}`;
      if (validMoves.has(moveKey)) {
        square.classList.add('valid-move');
      }

      const piece = board[row][col];
      if (piece) {
        square.textContent = pieceGlyphs[piece];
      }

      square.addEventListener('click', () => handleSquareClick(row, col));
      boardEl.appendChild(square);
    }
  }
}

function resetBoard() {
  board = cloneBoard(initialBoard);
  selected = null;
  turn = 'white';
  chessStatus.textContent = 'White to move';
  renderBoard();
}

function handleSquareClick(row, col) {
  const piece = board[row][col];

  if (selected) {
    const { row: selectedRow, col: selectedCol } = selected;
    const validMoves = getValidMoves(selectedRow, selectedCol);
    const isValidMove = validMoves.some(([r, c]) => r === row && c === col);

    if (isValidMove) {
      const movingPiece = board[selectedRow][selectedCol];
      board[row][col] = movingPiece;
      board[selectedRow][selectedCol] = null;
      turn = turn === 'white' ? 'black' : 'white';
      chessStatus.textContent = `${turn === 'white' ? 'White' : 'Black'} to move`;
      selected = null;
      renderBoard();
      return;
    }
  }

  if (piece && getPieceColor(piece) === turn) {
    selected = { row, col };
    renderBoard();
    return;
  }

  selected = null;
  renderBoard();
}

chessResetBtn.addEventListener('click', resetBoard);
renderBoard();

const tetrisCanvas = document.getElementById('tetrisCanvas');
const ctx = tetrisCanvas.getContext('2d');
const scoreEl = document.getElementById('score');
const linesEl = document.getElementById('lines');
const levelEl = document.getElementById('level');
const startBtn = document.getElementById('tetrisStart');
const pauseBtn = document.getElementById('tetrisPause');
const restartBtn = document.getElementById('tetrisRestart');

const COLS = 10;
const ROWS = 20;
const BLOCK = 30;
const EMPTY = 0;

const SHAPES = {
  I: [[1, 1, 1, 1]],
  J: [[1, 0, 0], [1, 1, 1]],
  L: [[0, 0, 1], [1, 1, 1]],
  O: [[1, 1], [1, 1]],
  S: [[0, 1, 1], [1, 1, 0]],
  T: [[0, 1, 0], [1, 1, 1]],
  Z: [[1, 1, 0], [0, 1, 1]]
};

const COLORS = {
  I: '#2fc3f2',
  J: '#4d7ef7',
  L: '#f7ad45',
  O: '#f3db4c',
  S: '#48d584',
  T: '#ae7df4',
  Z: '#ff5d73'
};

let board = createMatrix(COLS, ROWS);
let score = 0;
let lines = 0;
let level = 1;
let gameOver = false;
let paused = false;
let dropInterval = 700;
let dropTimer = null;
let activePiece = null;

function createMatrix(width, height) {
  return Array.from({ length: height }, () => Array(width).fill(EMPTY));
}

function randomPiece() {
  const keys = Object.keys(SHAPES);
  const type = keys[Math.floor(Math.random() * keys.length)];
  const matrix = SHAPES[type].map((row) => [...row]);
  return {
    type,
    matrix,
    x: Math.floor((COLS - matrix[0].length) / 2),
    y: 0
  };
}

function collide(boardState, piece) {
  for (let y = 0; y < piece.matrix.length; y += 1) {
    for (let x = 0; x < piece.matrix[y].length; x += 1) {
      if (piece.matrix[y][x] === 0) continue;
      const boardX = piece.x + x;
      const boardY = piece.y + y;

      if (boardX < 0 || boardX >= COLS || boardY >= ROWS) {
        return true;
      }

      if (boardY >= 0 && boardState[boardY][boardX]) {
        return true;
      }
    }
  }
  return false;
}

function merge(boardState, piece) {
  piece.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value) {
        const targetY = piece.y + y;
        const targetX = piece.x + x;
        if (targetY >= 0) {
          boardState[targetY][targetX] = piece.type;
        }
      }
    });
  });
}

function clearLines() {
  let cleared = 0;

  for (let y = ROWS - 1; y >= 0; y -= 1) {
    if (board[y].every((cell) => cell !== EMPTY)) {
      board.splice(y, 1);
      board.unshift(Array(COLS).fill(EMPTY));
      cleared += 1;
      y += 1;
    }
  }

  if (cleared > 0) {
    lines += cleared;
    score += [0, 100, 300, 500, 800][cleared] * level;
    level = Math.floor(lines / 10) + 1;
    dropInterval = Math.max(120, 700 - (level - 1) * 60);
    updateHud();
  }
}

function rotateMatrix(matrix) {
  return matrix[0].map((_, index) => matrix.map((row) => row[index]).reverse());
}

function rotatePiece() {
  if (!activePiece || paused || gameOver) return;
  const rotated = rotateMatrix(activePiece.matrix);
  const oldMatrix = activePiece.matrix;
  activePiece.matrix = rotated;

  if (collide(board, activePiece)) {
    activePiece.matrix = oldMatrix;
  }
}

function movePiece(offsetX, offsetY) {
  if (!activePiece || paused || gameOver) return;
  activePiece.x += offsetX;
  activePiece.y += offsetY;

  if (collide(board, activePiece)) {
    activePiece.x -= offsetX;
    activePiece.y -= offsetY;

    if (offsetY > 0) {
      merge(board, activePiece);
      clearLines();
      spawnPiece();
    }
  }
}

function spawnPiece() {
  activePiece = randomPiece();
  if (collide(board, activePiece)) {
    gameOver = true;
    paused = true;
    chessStatus.textContent = 'Game over';
  }
}

function updateHud() {
  scoreEl.textContent = String(score);
  linesEl.textContent = String(lines);
  levelEl.textContent = String(level);
}

function drawCell(x, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x * BLOCK, y * BLOCK, BLOCK, BLOCK);
  ctx.strokeStyle = 'rgba(255,255,255,0.12)';
  ctx.strokeRect(x * BLOCK, y * BLOCK, BLOCK, BLOCK);
}

function drawBoard() {
  ctx.clearRect(0, 0, tetrisCanvas.width, tetrisCanvas.height);

  for (let y = 0; y < ROWS; y += 1) {
    for (let x = 0; x < COLS; x += 1) {
      const cell = board[y][x];
      if (cell) {
        drawCell(x, y, COLORS[cell]);
      } else {
        ctx.strokeStyle = 'rgba(255,255,255,0.04)';
        ctx.strokeRect(x * BLOCK, y * BLOCK, BLOCK, BLOCK);
      }
    }
  }

  if (activePiece) {
    activePiece.matrix.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value) {
          const drawX = activePiece.x + x;
          const drawY = activePiece.y + y;
          if (drawY >= 0) {
            drawCell(drawX, drawY, COLORS[activePiece.type]);
          }
        }
      });
    });
  }
}

function tick() {
  if (!paused && !gameOver) {
    movePiece(0, 1);
    drawBoard();
  }
}

function startGame() {
  if (!activePiece) {
    spawnPiece();
  }
  paused = false;
  gameOver = false;
  drawBoard();
  clearInterval(dropTimer);
  dropTimer = setInterval(tick, dropInterval);
}

function pauseGame() {
  paused = !paused;
  if (!paused) {
    clearInterval(dropTimer);
    dropTimer = setInterval(tick, dropInterval);
  } else {
    clearInterval(dropTimer);
  }
}

function resetTetris() {
  board = createMatrix(COLS, ROWS);
  score = 0;
  lines = 0;
  level = 1;
  dropInterval = 700;
  gameOver = false;
  paused = false;
  activePiece = null;
  updateHud();
  clearInterval(dropTimer);
  spawnPiece();
  drawBoard();
}

startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', pauseGame);
restartBtn.addEventListener('click', resetTetris);

document.addEventListener('keydown', (event) => {
  if (!activePiece || gameOver) return;

  const key = event.key.toLowerCase();

  if (key === 'arrowleft' || key === 'a') movePiece(-1, 0);
  if (key === 'arrowright' || key === 'd') movePiece(1, 0);
  if (key === 'arrowdown' || key === 's') movePiece(0, 1);
  if (key === 'arrowup' || key === 'w') rotatePiece();
  if (event.code === 'Space') {
    event.preventDefault();
    while (!collide(board, activePiece)) {
      activePiece.y += 1;
    }
    activePiece.y -= 1;
    merge(board, activePiece);
    clearLines();
    spawnPiece();
    drawBoard();
  }

  drawBoard();
});

updateHud();
resetTetris();
