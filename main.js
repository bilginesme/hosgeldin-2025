// Phaser configuration object
const config = {
   type: Phaser.CANVAS, // Use WebGL if available, otherwise fallback to Canvas
   width: 400,        // Game width
   height: 800,       // Game height
   backgroundColor: '#f32408', //  background
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
var txtDiceResult;
var txtNumDiceTHrows;
var boardArray = []; 
const numDiceThrowsMax = 10;
var numDiceThrows = 0;
var isGameOver = false;
var posPlayer = -1;
var imgDice;
var isDiceRollingNow = false;

const TrophyTypes = Object.freeze({
   NONE: 0,
   MONEY: 1,
   LOVE: 2,
   CAREER: 3,
   HEALTH: 4,
   BONUS: 5
});

function preload() {
   this.load.image('myImage', 'assets/new-year-2024.png');
   this.load.image('imgBoard', 'assets/board.png');
   this.load.image('imgBG', 'assets/bg.png');
   this.load.image('imgWhite', 'assets/bg-white.png');
   this.load.image('dice', 'assets/dice.png');
   this.load.audio('backgroundMusic', 'assets/SilentJungleLong.mp3'); // Key: 'backgroundMusic', Path: 'assets/music.mp3'
   for(var i = 1; i <= 6; i++) {
      this.load.image('imgDice' + i, 'assets/dice-' + i + '.png');
   }
}

// Create the game (initial setup)
function create() {
   numDiceThrows = 0;


   this.add.text(100, 50, 'Welcome to Phaser.js!', {
       fontSize: '12px',
       color: '#ffffff',
       fontFamily: 'Arial'
   }).setOrigin(0.5);

   const imgWhite = this.add.image(this.scale.width / 2, this.scale.height / 2, 'imgWhite').setInteractive();;
   const imgBG = this.add.image(this.scale.width / 2, this.scale.height / 2, 'imgBG').setInteractive();;
   imgBG.setAlpha(0.5);

   const imgBoard = this.add.image(10, 190, 'imgBoard').setInteractive();
   imgBoard.setOrigin(0, 0);


   imgDice = this.add.image(260, 360, 'imgDice6').setInteractive();;

   imgDice.on('pointerdown', () => {
      if(isDiceRollingNow) {
         console.log('Already running');
         return;
      }
      
      startDiceRollAnimation(this);
      imgDice.setTint(0x000000); // Apply a tint to indicate press
      imgDice.setAlpha(0.8); 
   });

   imgDice.on('pointerup', () => {
      imgDice.clearTint();       // Remove the tint
      imgDice.setAlpha(1);       // Reset the scale
   });

   /*
   // Display the image at the center of the screen
   const image = this.add.image(this.scale.width / 2, this.scale.height / 2, 'myImage').setInteractive();;

   // Optional: Scale the image to fit better
   image.setScale(0.25); // Scales the image to 50%

   image.on('pointerdown', () => {
      console.log('Button pressed!');
      image.setTint(0x000000); // Apply a tint to indicate press
      image.setAlpha(0.8); 
  });

  image.on('pointerup', () => {
   image.clearTint();       // Remove the tint
   image.setAlpha(1);       // Reset the scale
   });
*/

   const music = this.sound.add('backgroundMusic', {
   loop: true,  // Loop the music
   volume: 0.5  // Set the volume (0.0 to 1.0)
   });

    // Wait for user interaction to start audio
   this.input.once('pointerdown', () => {
      // Resume the audio context
      if (this.sound.context.state === 'suspended') {
            this.sound.context.resume();
      }

      // Play the music
      //music.play();
   });

   // Add a visual prompt for interaction (optional)
   /*
   txtDiceResult = this.add.text(this.scale.width / 2, this.scale.height / 2, 'Tap to Start', {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial'
   }).setOrigin(0.5);
   */


   txtDiceResult = this.add.text(300, 50, 'RESULT', {
   fontSize: '12px',
   color: '#ffffff',
   fontFamily: 'Arial'
   }).setOrigin(0.5);

   txtNumDiceTHrows = this.add.text(350, 50, numDiceThrows.toString(), {
      fontSize: '12px',
      color: '#ffffff',
      fontFamily: 'Arial'
      }).setOrigin(0.5);

  createDice.call(this);
  createBoardArray.call(this);
}

function update(time, delta) {
   // Logic to update the game each frame
}

function createDice() {
   const dice = this.add.image(100, 100, 'dice').setInteractive();;
   dice.setScale(0.25); // Scales the image to 50%

   dice.on('pointerdown', () => {
      diceRoll(this);
      dice.setTint(0x000000); // Apply a tint to indicate press
      dice.setAlpha(0.8); 
   });

   dice.on('pointerup', () => {
      dice.clearTint();       // Remove the tint
      dice.setAlpha(1);       // Reset the scale
   });
}

function diceRollOBSOLETE() {
   if(isGameOver) {
      alert('Game over');
      return;
   }

   var diceResult = Math.ceil(Math.random() * 6);
   console.log(diceResult);
   txtDiceResult.setText(diceResult);

   posPlayer+= diceResult;
   if(posPlayer > (boardArray.length - 1)) {
      posPlayer = posPlayer - (boardArray.length);
   }

   console.log('posPlayer = ' + posPlayer);
   console.log('TROPHY = ' + getTrophyName(boardArray[posPlayer]));

   numDiceThrows++;
   txtNumDiceTHrows.setText(numDiceThrows);

   if(numDiceThrows == numDiceThrowsMax) {
      isGameOver = true;
   }
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
   posPlayer+= diceNumber;
   if(posPlayer > (boardArray.length - 1)) {
      posPlayer = posPlayer - (boardArray.length);
   }

   console.log('posPlayer = ' + posPlayer);
   console.log('TROPHY = ' + getTrophyName(boardArray[posPlayer]));

   numDiceThrows++;
   txtNumDiceTHrows.setText(numDiceThrows);


   txtDiceResult.setText(posPlayer + ' -- ' + getTrophyName(boardArray[posPlayer]));

   if(numDiceThrows == numDiceThrowsMax) {
      isGameOver = true;
   }
}

function createBoardArray() {
   boardArray[0] = 0;
   boardArray[1] = 0;
   boardArray[2] = 0;
   boardArray[3] = TrophyTypes.HEALTH;
   boardArray[4] = 0;
   boardArray[5] = TrophyTypes.LOVE;
   boardArray[6] = 0;
   boardArray[7] = 0;
   boardArray[8] = 0;
   boardArray[9] = 0;
   boardArray[10] = 0;
   boardArray[11] = TrophyTypes.MONEY;
   boardArray[12] = 0;
   boardArray[13] = 0;
   boardArray[14] = TrophyTypes.BONUS;
   boardArray[15] = 0;
   boardArray[16] = 0;
   boardArray[17] = 0;
   boardArray[18] = TrophyTypes.CAREER;
   boardArray[19] = 0;
   boardArray[20] = 0;
   boardArray[21] = TrophyTypes.LOVE;
   boardArray[22] = 0;
   boardArray[23] = TrophyTypes.HEALTH;
   boardArray[24] = 0;
   boardArray[25] = TrophyTypes.MONEY;
   boardArray[26] = TrophyTypes.BONUS;
   boardArray[27] = TrophyTypes.CAREER;
   boardArray[28] = 0;
   boardArray[29] = TrophyTypes.LOVE;
   boardArray[30] = TrophyTypes.BONUS;
}

function getTrophyName(value) {
   for (const [key, val] of Object.entries(TrophyTypes)) {
       if (val === value) {
           return key; // Return the trophy name
       }
   }
   return null; // Return null if value is not found
}