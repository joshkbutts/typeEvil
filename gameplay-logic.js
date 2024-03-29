const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const playerPosition = { x: 250, y: 450 };

var background = new Image();
background.src = "stages/hallway1.png";

var zombieBasic = new Image();
zombieBasic.src = "sprites/zombie_grab.png";

var zombieCop = new Image();
zombieCop.src = "sprites/zombie_cop.png";

var zombieGirl = new Image();
zombieGirl.src = "sprites/zombie_girl.png"

var character = new Image();
character.src = "sprites/character.png";

var hitConfirm = new Image();
hitConfirm.src = "sprites/hit-confirm-sprite-sheet.png"

const zombieArray = [zombieBasic, zombieCop, zombieGirl]

const render = () => {
  ctx.clearRect(0, 0, 600, 600);

  if (state.gameStarted) {
    ctx.fillStyle = 'green';
    ctx.font = '30px serif';
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    // render words/zombies
    state.activeWords.forEach(word => {
      ctx.fillText(word.word, word.x, word.y);
      ctx.drawImage(zombieArray[1], word.x, word.y, 80, 130);
      // ctx.drawImage(zombieArray[Math.floor(Math.random() * 2)], word.x, word.y, 80, 130);
      if (word.word.startsWith(state.currentInput)) {
        state.selectedWord = word
        ctx.fillStyle = 'red';
        ctx.fillText(state.currentInput, word.x, word.y);
        ctx.fillStyle = 'green';
      }
    });

    // render negative health bar
    ctx.beginPath();
    ctx.rect(20, 480, 100, 20);
    ctx.fillStyle = 'red'
    ctx.fill();

    // render health bar
    ctx.beginPath();
    ctx.rect(20, 480, state.health, 20);
    ctx.fillStyle = 'green'
    ctx.fill();

    // render current input
    ctx.fillStyle = 'white';
    ctx.fillText(state.currentInput, 20, 550);
    ctx.fillText(state.score, 20, 580);

    // render player
    // ctx.fillRect(playerPosition.x, playerPosition.y, 20, 20);
    ctx.drawImage(character, playerPosition.x, playerPosition.y, 60, 140);
  } else {
    ctx.fillStyle = 'white';
    ctx.font = '52px serif';
    ctx.fillText("type:Evil", 50, 200);
    ctx.font = '32px serif';
    ctx.fillText("Type to survive", 50, 250);
    ctx.fillText("Press any key to start", 50, 280);
  }
}

const allWords = [
  { word: 'hello' },
  { word: 'zombie' },
  { word: 'evil' },
  { word: 'resident' },
  { word: 'typing' }
]

function randomNumber(min, max) {
  return Math.random() * (max - min) + min;
}

let randomX = () => {
  return randomNumber(1, 550)
}

let randomY = () => {
  return randomNumber(1, 50)
}

const spawnWords = () => {
  for (let i = 0; i < state.zombieCount; i++) {
    if (i === 0) {
      allWords[i].x = randomX()
      allWords[i].y = randomY()
      state.activeWords.push(allWords[i])
    } else {
      // need to create logic here that separates zombies from not stacking on top of eachother 

      // not sure if this is the place but there also needs to be logic that when 
      // ALL OF THE ZOMBIES ARE STACKED ON TOP OF PLAYER THE WORDS ARE SEPARATED SO YOU CAN READ THEM

      allWords[i].x = randomX()
      allWords[i].y = randomY()
      state.activeWords.push(allWords[i])
    }
  }
}

var state = {
  activeWords: [],
  selectedWord: undefined,
  currentInput: '',
  score: 0,
  level: 1,
  zombieCount: 1,
  gameStarted: false,
  lastTime: undefined,
  health: 100,
  isInvincible: false,
  timeOfBite: 0,
  stageTransition: 600,
}

spawnWords()

document.addEventListener('keydown', event => {
  if (!state.gameStarted) {
    state.gameStarted = true;
    document.getElementById('menu-music').pause();
    document.getElementById('game-music').play();
    return;
  }

  if (event.key === 'Backspace') {
    state.currentInput = state.currentInput.slice(0, -1);
    event.preventDefault();
    return false;
  } else if (event.key === 'Tab' || event.key === '/') {
    event.preventDefault();
    return false;
  } else if (event.key.length > 1) {
    return false;
  }
  else {
    state.currentInput += event.key;
    document.getElementById('gunshot').play();
    hitConfirmAnimation();
  }

  if (state.currentInput === state.selectedWord.word) {
    state.activeWords.splice(state.activeWords.indexOf(state.selectedWord), 1)
    state.currentInput = ''
    state.score++
  }

  if (state.activeWords.length === 0) {
    state.level++
    state.zombieCount++
    spawnWords()
  }

  if (state.level === 5) {

    // attempting to create logic here that does the straight up
    // star wars transition between levels

    ctx.beginPath();
    ctx.rect(600, 600, state.stageTransition, 600)
    ctx.fillStyle = 'black'
    ctx.fill();
    background.src = "stages/hallway2.png";
    state.zombieCount = 1
  }

  render()
});

var lastTime = performance.now();

// hit confirm animation 

function hitConfirmAnimation() {
  // Define the number of columns and rows in the sprite
  let numColumns = 6;
  let numRows = 1;

  // Define the size of a frame
  let frameWidth = hitConfirm.width / numColumns;;
  let frameHeight = hitConfirm.height / numRows;;

  // The sprite image frame starts from 0
  let currentFrame = 0;

  setInterval(function () {
    // Pick a new frame
    currentFrame++;

    // Make the frames loop
    let maxFrame = numColumns * numRows - 1;
    if (currentFrame > maxFrame) {
      currentFrame = 0;
    }

    // Update rows and columns
    let column = currentFrame % numColumns;
    let row = Math.floor(currentFrame / numColumns);

    // Clear and draw
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(hitConfirm, column * frameWidth, row * frameHeight, frameWidth, frameHeight, 10, 30);

    //Wait for next step in the loop
  }, 100);
}

function animate(timestamp) {
  window.requestAnimationFrame(animate)

  let timeDifference = timestamp - state.lastTime;
  let timeModifier = (timeDifference / 20)
  state.lastTime = timestamp;

  if (state.gameStarted) {
    state.activeWords.forEach(word => {
      // move zombie near player.
      let xDist = playerPosition.x - word.x;
      let yDist = playerPosition.y - word.y;
      let vectorDistance = Math.sqrt(xDist ** 2 + yDist ** 2);
      word.x += (xDist / vectorDistance) * 0.5 * timeModifier;
      word.y += (yDist / vectorDistance) * 0.5 * timeModifier;

      // Zombie Attacking Player Logic
      if (word.x >= playerPosition.x - 20 && word.y >= playerPosition.y - 20) {
        if (!state.isInvincible) {
          state.isInvincible = true;
          document.getElementById('player-hit').play();
          state.health -= 10;
          state.timeOfBite = setInterval(function () {
            state.isInvincible = false;
          }, 5000)
        }
        if (state.health <= 0) {
          alert('YOU ARE DEAD...')
        }
      }
    });
  }

  render();
}

function startGame() {
  document.getElementById('landing').style.display = 'none';
  document.getElementById('game-content').style.display = 'block';
  document.getElementById('menu-music').play();

  state.lastTime = performance.now();
  window.requestAnimationFrame(animate);
}

document.getElementById('start-btn').addEventListener('click', startGame);