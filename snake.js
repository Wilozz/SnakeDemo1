(function () {
  'use strict';

  var CELL = 20;
  var TICK_MS = 120;
  var SNAKE_COLOR = '#2ecc40';
  var HEAD_COLOR = '#1f9e2e';
  var APPLE_COLOR = '#e74c3c';

  var canvas = document.getElementById('board');
  var ctx = canvas.getContext('2d');
  var scoreEl = document.getElementById('score');
  var cols = canvas.width / CELL;
  var rows = canvas.height / CELL;

  var snake, direction, nextDirection, apple, score, timer, running;

  function reset() {
    var midX = Math.floor(cols / 2);
    var midY = Math.floor(rows / 2);
    snake = [
      { x: midX, y: midY },
      { x: midX - 1, y: midY },
      { x: midX - 2, y: midY }
    ];
    direction = { x: 1, y: 0 };
    nextDirection = direction;
    score = 0;
    scoreEl.textContent = score;
    apple = placeApple();
  }

  function isOnSnake(x, y) {
    return snake.some(function (part) {
      return part.x === x && part.y === y;
    });
  }

  function placeApple() {
    var free = [];
    for (var x = 0; x < cols; x++) {
      for (var y = 0; y < rows; y++) {
        if (!isOnSnake(x, y)) {
          free.push({ x: x, y: y });
        }
      }
    }
    if (free.length === 0) {
      return null;
    }
    return free[Math.floor(Math.random() * free.length)];
  }

  function step() {
    direction = nextDirection;
    var head = {
      x: snake[0].x + direction.x,
      y: snake[0].y + direction.y
    };

    var hitWall = head.x < 0 || head.y < 0 || head.x >= cols || head.y >= rows;
    // The tail moves away this tick unless the snake is about to eat.
    var ate = apple && head.x === apple.x && head.y === apple.y;
    var body = ate ? snake : snake.slice(0, -1);
    var hitSelf = body.some(function (part) {
      return part.x === head.x && part.y === head.y;
    });

    if (hitWall || hitSelf) {
      gameOver();
      return;
    }

    snake.unshift(head);
    if (ate) {
      score += 1;
      scoreEl.textContent = score;
      apple = placeApple();
      if (!apple) {
        draw();
        gameOver('You win!');
        return;
      }
    } else {
      snake.pop();
    }
    draw();
  }

  function drawCell(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * CELL + 1, y * CELL + 1, CELL - 2, CELL - 2);
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (apple) {
      drawCell(apple.x, apple.y, APPLE_COLOR);
    }
    snake.forEach(function (part, i) {
      drawCell(part.x, part.y, i === 0 ? HEAD_COLOR : SNAKE_COLOR);
    });
  }

  function drawMessage(text, subtext) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.font = '28px sans-serif';
    ctx.fillText(text, canvas.width / 2, canvas.height / 2 - 10);
    ctx.font = '16px sans-serif';
    ctx.fillText(subtext, canvas.width / 2, canvas.height / 2 + 20);
  }

  function start() {
    if (running) {
      return;
    }
    reset();
    draw();
    running = true;
    timer = setInterval(step, TICK_MS);
  }

  function gameOver(message) {
    clearInterval(timer);
    running = false;
    drawMessage(message || 'Game over', 'Score: ' + score + ' - press Space to play again');
  }

  var KEYS = {
    ArrowUp: { x: 0, y: -1 },
    w: { x: 0, y: -1 },
    ArrowDown: { x: 0, y: 1 },
    s: { x: 0, y: 1 },
    ArrowLeft: { x: -1, y: 0 },
    a: { x: -1, y: 0 },
    ArrowRight: { x: 1, y: 0 },
    d: { x: 1, y: 0 }
  };

  document.addEventListener('keydown', function (event) {
    if (event.key === ' ') {
      event.preventDefault();
      start();
      return;
    }
    var dir = KEYS[event.key];
    if (!dir) {
      return;
    }
    event.preventDefault();
    // Ignore reversing straight into the snake's own neck.
    if (dir.x === -direction.x && dir.y === -direction.y) {
      return;
    }
    nextDirection = dir;
  });

  reset();
  draw();
  drawMessage('Snake', 'Press Space to start');
})();
