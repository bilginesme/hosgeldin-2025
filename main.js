// Phaser configuration object
const config = {
   type: Phaser.CANVAS, // Use WebGL if available, otherwise fallback to Canvas
   width: 400,        // Game width
   height: 800,       // Game height
   backgroundColor: '#aa1e22', //  background
   parent: 'game-container', // Attach to the wrapper element
   physics: {
       default: 'arcade',      // Arcade physics
       arcade: {
           gravity: { y: 0 },  // No gravity by default
           debug: false        // Disable debug mode
       }
   },
   scale: {
      mode: Phaser.Scale.FIT, // Ensures the game scales proportionally to fit the parent container
      autoCenter: Phaser.Scale.CENTER_BOTH, // Centers the game canvas
  },
   scene: {
       preload: preload,
       create: create,
       update: update
   }
};

// Create the Phaser game instance
const game = new Phaser.Game(config);
let currentScene;
var txtDiceResult;
var txtNumDiceTHrows;
var boardArray = []; 
var boardCellPositions = [];
var trophySlotPositions = []; 
var trophyMap = new Map();
var txtTrophies = [];

const numDiceThrowsMax = 10;
var numDiceThrows = 0;
var isGameOver = false;
var posPlayer = -1;
var imgDice;
var imgPawn;
var isDiceRollingNow = false;

const TrophyTypes = Object.freeze({
   NONE: 0,
   PARA: 1,
   AŞK: 2,
   BAŞARI: 3,
   SAĞLIK: 4,
   BONUS: 5
});

// Get the query parameters from the URL
const urlParams = new URLSearchParams(window.location.search);

// Get the 'name' parameter value
const nameOfThePlayer = urlParams.get('name');

function preload() {
   currentScene = this;

   const font = new FontFace('Luckiest Guy', 'url(assets/fonts/LuckiestGuy-Regular.ttf)');

   font.load().then(() => {
       // Add the font to the document
       document.fonts.add(font);
       console.log('Font loaded locally');
   }).catch(err => {
       console.error('Font failed to load:', err);
   });

   this.load.image('imgDot', 'assets/dot.png');   // bunu sonra silelim
   this.load.image('myImage', 'assets/new-year-2024.png');
   this.load.image('imgChristmasBall1', 'assets/christmas-ball-1.png');
   this.load.image('imgBoard', 'assets/board.png');
   this.load.image('imgBG', 'assets/bg.jpg');
   this.load.image('imgWhite', 'assets/bg-white.png');
   this.load.audio('backgroundMusic', 'assets/SilentJungleLong.mp3'); // Key: 'backgroundMusic', Path: 'assets/music.mp3'
   for(var i = 1; i <= 6; i++) {
      this.load.image('imgDice' + i, 'assets/dice-' + i + '.png');
   }

   this.load.image('imgTrophyMoney', 'assets/trophy-money.png');
   this.load.image('imgTrophyLove', 'assets/trophy-love.png');
   this.load.image('imgTrophyCareer', 'assets/trophy-career.png');
   this.load.image('imgTrophyHealth', 'assets/trophy-health.png');
   this.load.image('imgTrophyBonus', 'assets/trophy-bonus.png');

   this.load.image('imgPawn', 'assets/pawn-yellow.png');
}

// Create the game (initial setup)
function create() {
   numDiceThrows = 0;

   const imgWhite = this.add.image(this.scale.width / 2, this.scale.height / 2, 'imgWhite').setInteractive();;
   const imgBG = this.add.image(this.scale.width / 2, this.scale.height / 2, 'imgBG').setInteractive();;

   const imgBoard = this.add.image(10, 150, 'imgBoard').setInteractive();
   imgBoard.setOrigin(0, 0);

   const music = this.sound.add('backgroundMusic', {
   loop: true,  // Loop the music
   volume: 0.5  // Set the volume (0.0 to 1.0)
   });

    // Wait for user interaction to start audio
   this.input.once('pointerdown', (pointer) => {
      // Resume the audio context
      if (this.sound.context.state === 'suspended') {
            this.sound.context.resume();
      }

      // Play the music
      //music.play();
   });

   txtDiceResult = this.add.text(300, 750, 'RESULT', {
   fontSize: '12px',
   color: '#ffffff',
   fontFamily: 'Arial'
   }).setOrigin(0.5);

   txtNumDiceTHrows = this.add.text(350, 750, numDiceThrows.toString(), {
      fontSize: '12px',
      color: '#ffffff',
      fontFamily: 'Arial'
      }).setOrigin(0.5);

  createDice.call();
  createBoardArray.call();

  imgPawn = this.add.image(110, 770, 'imgPawn').setInteractive();
  imgPawn.setOrigin(0.5, 0.9);

  createChristmassBalls();

  this.add.text(75, 15, 'Merhaba ' + nameOfThePlayer, {
   fontFamily: 'Luckiest Guy',
   fontSize: '25px',
   color: '#ffffff'});

   this.add.text(75, 45, 'Bakalım 2025 Ne GETİRECEK!', {
      fontFamily: 'Luckiest Guy',
      fontSize: '20px',
      color: '#ffffff'});

   trophySlotPositions = [];
   trophySlotPositions.push({x: 100, y: 80});
   trophySlotPositions.push({x: 230, y: 80});
   trophySlotPositions.push({x: 100, y: 110});
   trophySlotPositions.push({x: 230, y: 110});

   trophySlotNature = [];
   trophySlotNature.push(0);
   trophySlotNature.push(1);
   trophySlotNature.push(2);
   trophySlotNature.push(3);

   txtTrophies = [];
   for( var i = 0; i < trophySlotPositions.length; i++) {
      txtTrophies.push(this.add.text(trophySlotPositions[i].x, trophySlotPositions[i].y, '',  {fontFamily: 'Luckiest Guy', fontSize: '20px', color: '#ffffff'}));
   }
}

function update(time, delta) {
   // Logic to update the game each frame
}

function createDice() {
   let scene = currentScene; // Use the global scene variable
   imgDice = scene.add.image(270, 320, 'imgDice1').setInteractive();
   imgDice.angle = 15;

   imgDice.on('pointerdown', () => {
      if(isDiceRollingNow) {
         console.log('Already running');
         return;
      }
      
      if(numDiceThrows >= numDiceThrowsMax) {
         alert('Game OVER');
         return;
      }

      startDiceRollAnimation();
      imgDice.setTint(0x000000); // Apply a tint to indicate press
      imgDice.setAlpha(0.8); 
   });

   imgDice.on('pointerup', () => {
      imgDice.clearTint();       // Remove the tint
      imgDice.setAlpha(1);       // Reset the scale
   });
}
 
function startDiceRollAnimation() {
   isDiceRollingNow = true;   
   const animationDuration = 2000; // Total duration in milliseconds
   const interval = 100; // Time interval in milliseconds
   let elapsedTime = 0;
 
   const finalRoll = Phaser.Math.Between(1, 6);

   // Start the animation with setInterval
   const timer = setInterval(() => {
     // Select a random dice texture
     const randomIndex = Phaser.Math.Between(1, 6);
     imgDice.setTexture('imgDice' + randomIndex);
 
     // Update elapsed time
     elapsedTime += interval;
     imgDice.angle+= 35;
     
     // Stop the animation after the specified duration
     if (elapsedTime >= animationDuration) {
       clearInterval(timer);
 
       // Optionally, set the final texture based on your game's logic
   
       imgDice.setTexture('imgDice' + finalRoll);
       isDiceRollingNow = false;

       diceRoll(finalRoll);
     }
   }, interval);
}

function diceRoll(diceNumber) {
   var posPlayerPrevious = posPlayer;

   posPlayer+= diceNumber;
   if(posPlayer > (boardArray.length - 1)) {
      posPlayer = posPlayer - (boardArray.length);
   }

   numDiceThrows++;
   txtNumDiceTHrows.setText(numDiceThrows);
   txtDiceResult.setText(posPlayer + ' -- ' + getTrophyName(boardArray[posPlayer]));
   if(boardArray[posPlayer] != 0) {
      var tt = boardArray[posPlayer];
    
      if (trophyMap.has(tt)) {
         trophyMap.set(tt, trophyMap.get(tt) + 1);
      } else {
         trophyMap.set(tt, 1);
      }
  
     //const sortedArray = Array.from(trophyMap).sort((a, b) => b[1] - a[1]); // Descending order
     //console.log(sortedArray);
     //trophyMap = new Map(sortedArray);

     trophyMap = sortTrophiesByHits(trophyMap);
     console.log(trophyMap);

     drawTrophies();
   }

   if(numDiceThrows == numDiceThrowsMax) {
      isGameOver = true;
   }

   let points = [];
   var startPos, endPos;

   if(posPlayerPrevious == -1) {
      startPos = 0;
      endPos = diceNumber;
   }
   else {
      startPos = posPlayerPrevious + 1;
      endPos = posPlayerPrevious + diceNumber + 1;
   } 

   for(var i = startPos; i < endPos; i++) {
      var boardCell;
      boardCell = boardCellPositions[i]
      points.push({x: boardCell.x, y: boardCell.y});
   }
   
   index = 0;
   movePawn(imgPawn, points);
}

function createBoardArray() {
   boardArray[0] = 0;
   boardArray[1] = 0;
   boardArray[2] = 0;
   boardArray[3] = TrophyTypes.SAĞLIK;
   boardArray[4] = 0;
   boardArray[5] = TrophyTypes.AŞK;
   boardArray[6] = 0;
   boardArray[7] = 0;
   boardArray[8] = 0;
   boardArray[9] = 0;
   boardArray[10] = 0;
   boardArray[11] = TrophyTypes.PARA;
   boardArray[12] = 0;
   boardArray[13] = 0;
   boardArray[14] = TrophyTypes.BONUS;
   boardArray[15] = 0;
   boardArray[16] = 0;
   boardArray[17] = 0;
   boardArray[18] = TrophyTypes.BAŞARI;
   boardArray[19] = 0;
   boardArray[20] = 0;
   boardArray[21] = TrophyTypes.AŞK;
   boardArray[22] = 0;
   boardArray[23] = TrophyTypes.SAĞLIK;
   boardArray[24] = 0;
   boardArray[25] = TrophyTypes.PARA;
   boardArray[26] = TrophyTypes.BONUS;
   boardArray[27] = TrophyTypes.BAŞARI;
   boardArray[28] = 0;
   boardArray[29] = TrophyTypes.AŞK;
   boardArray[30] = TrophyTypes.BONUS;

   boardCellPositions[0] = {x: 54, y:660 };
   boardCellPositions[1] = {x: 102, y:654 };
   boardCellPositions[2] = {x: 140, y:667 };
   boardCellPositions[3] = {x: 173, y:686 };
   boardCellPositions[4] = {x: 214, y:705 };
   boardCellPositions[5] = {x: 259, y:713 };
   boardCellPositions[6] = {x: 302, y:689 };
   boardCellPositions[7] = {x: 327, y:629 };
   boardCellPositions[8] = {x: 323, y:567 };
   boardCellPositions[9] = {x: 285, y:523 };
   boardCellPositions[10] = {x: 234, y:515 };
   boardCellPositions[11] = {x: 193, y:524 };
   boardCellPositions[12] = {x: 147, y:542 };
   boardCellPositions[13] = {x: 104, y:556 };
   boardCellPositions[14] = {x: 59, y:551 };
   boardCellPositions[15] = {x: 30, y:499 };
   boardCellPositions[16] = {x: 37, y:433 };
   boardCellPositions[17] = {x: 77, y:388 };
   boardCellPositions[18] = {x: 127, y:379 };
   boardCellPositions[19] = {x: 170, y:396 };
   boardCellPositions[20] = {x: 211, y:415 };
   boardCellPositions[21] = {x: 261, y:430 };
   boardCellPositions[22] = {x: 309, y:419 };
   boardCellPositions[23] = {x: 353, y:369 };
   boardCellPositions[24] = {x: 369, y:306 };
   boardCellPositions[25] = {x: 352, y:247 };
   boardCellPositions[26] = {x: 307, y:222 };
   boardCellPositions[27] = {x: 265, y:220 };
   boardCellPositions[28] = {x: 218, y:227 };
   boardCellPositions[29] = {x: 168, y:223 };
   boardCellPositions[30] = {x: 133, y:193 };

   for( var i = 0 ; i < boardCellPositions.length; i++) {
      var pos = boardCellPositions[i];
      var trophy = boardArray[i];
      var strImg = '';

      if(trophy == TrophyTypes.PARA) {
         strImg = 'imgTrophyMoney';
      }
      else if(trophy == TrophyTypes.AŞK) {
         strImg = 'imgTrophyLove';
      }
      else if(trophy == TrophyTypes.SAĞLIK) {
         strImg = 'imgTrophyHealth';
      }
      else if(trophy == TrophyTypes.BAŞARI) {
         strImg = 'imgTrophyCareer';
      }
      else if(trophy == TrophyTypes.BONUS) {
         strImg = 'imgTrophyBonus';
      }

      if(strImg != '') {
         var img = currentScene.add.image(pos.x, pos.y, strImg).setInteractive();
         img.setOrigin(0.5, 0.9);
      }
   }
}

function createChristmassBalls() {
   let scene = currentScene; // Use the global scene variable
   imgChristmasBall1 = scene.add.image(50, -20, 'imgChristmasBall1').setInteractive();
   imgChristmasBall1.setOrigin(0.5, 0);

   imgChristmasBall2 = scene.add.image(370, -20, 'imgChristmasBall1').setInteractive();
   imgChristmasBall2.setOrigin(0.5, 0);
   imgChristmasBall2.scale = 0.7;

   const animateBall = (ball) => {
      const moveBall = () => {
          const randomOffset = Phaser.Math.Between(5, 20); // Random stretch
          const randomDuration = Phaser.Math.Between(1000, 3000); // Random duration
          const randomAngle = Phaser.Math.Between(-3, 3); // Random swing angle

          // Tween to move the ball down
          scene.tweens.add({
              targets: ball,
              y: ball.y + randomOffset, // Move down by random offset
              angle: randomAngle, // Add random swing
              duration: randomDuration, // Use random duration
              ease: 'Sine.easeInOut', // Smooth easing
              onComplete: () => {
                  // Move the ball back up with new randomness
                  scene.tweens.add({
                      targets: ball,
                      y: ball.y - randomOffset, // Move back up
                      duration: Phaser.Math.Between(1000, 3000), // Random duration for upward motion
                      angle: -randomAngle, // Swing to the opposite direction
                      ease: 'Sine.easeInOut',
                      onComplete: moveBall // Loop by calling moveBall again
                  });
              }
          });
      };

      moveBall(); // Start the animation
  };

  const addJumpInteraction = (ball) => {
   ball.setInteractive(); // Enable input on the ball
   ball.on('pointerdown', () => {
       scene.tweens.add({
           targets: ball,
           y: ball.y - Phaser.Math.Between(20, 60),
           angle: Phaser.Math.Between(-3, 3),
           duration: 300, // Fast jump
           ease: 'Power2',
           yoyo: true, // Return back
           onComplete: () => {
               animateBall(ball); // Resume the normal animation
           }
       });

       const jokeText = scene.add.text(ball.x + 40, ball.y + 120, "Dikkat et \nkırılabilir!", { fontSize: '16px', fill: '#fff' });
         scene.time.delayedCall(2000, () => jokeText.destroy()); // Remove the text after 1 second
   });
};

  // Start the animation
  animateBall(imgChristmasBall1);
  animateBall(imgChristmasBall2);

  addJumpInteraction(imgChristmasBall1);
}

function getTrophyName(value) {
   for (const [key, val] of Object.entries(TrophyTypes)) {
       if (val === value) {
           return key; // Return the trophy name
       }
   }
   return null; // Return null if value is not found
}

let index = 0; // Define outside

function movePawn(pawn, points) {
   let scene = currentScene; // Use the global scene variable

   function moveToNextPoint() {
       if (index < points.length) {
           let point = points[index];

           scene.tweens.add({
               targets: pawn,
               x: point.x,
               y: point.y,
               duration: 1000,
               ease: 'Power2',
               onComplete: () => {
                   index++; // Increment the index
                   moveToNextPoint(); // Call recursively
               }
           });
       }
   }

   moveToNextPoint();
}

function sortTrophiesByHits(tM) {
   const sortedArray = Array.from(tM).sort((a, b) => b[1] - a[1]); // Descending order
   return new Map(sortedArray);
}

function drawTrophies() {
   let scene = currentScene; // Use the global scene variable

   for( var i = 0; i < trophySlotPositions.length; i++) {
      txtTrophies[i].setText('');
   }


   var idxSlot = 0;
   trophyMap.forEach((value, key) => {
      console.log(`Trophy: ${key}, Count: ${value}`);

      var strTrophy = getTrophyName(key);

      if(value == 2) {
         strTrophy+= ' x2';
      }
      else if(value == 3) {
         strTrophy+= ' x2';
      }
      else if(value == 4) {
         strTrophy+= ' x4';
      }

      console.log(key);
      console.log(value);
      console.log(idxSlot);
      console.log(strTrophy);

      txtTrophies[idxSlot].setText(strTrophy);

      idxSlot++;
  });


}
