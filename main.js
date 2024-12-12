// Phaser configuration object
const config = {
   type: Phaser.CANVAS, // Use WebGL if available, otherwise fallback to Canvas
   width: 400,        // Game width
   height: 800,       // Game height
   backgroundColor: '#87CEEB', // Light sky blue background

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

// Preload assets (if any)
function preload() {
   this.load.image('myImage', 'assets/new-year-2024.png');
   this.load.image('dice', 'assets/dice.png');
   this.load.audio('backgroundMusic', 'assets/SilentJungleLong.mp3'); // Key: 'backgroundMusic', Path: 'assets/music.mp3'
}

// SilentJungleLong.mp3

// Create the game (initial setup)
function create() {
 
   this.add.text(100, 50, 'Welcome to Phaser.js!', {
       fontSize: '12px',
       color: '#ffffff',
       fontFamily: 'Arial'
   }).setOrigin(0.5);

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
      music.play();
  });

  // Add a visual prompt for interaction (optional)
  txtDiceResult = this.add.text(this.scale.width / 2, this.scale.height / 2, 'Tap to Start', {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial'
  }).setOrigin(0.5);

  txtDiceResult = this.add.text(300, 50, 'RESULT', {
   fontSize: '12px',
   color: '#ffffff',
   fontFamily: 'Arial'
   }).setOrigin(0.5);

  createDice.call(this);
}

// Update game state
function update(time, delta) {
   // Logic to update the game each frame
}

function createDice() {
   const dice = this.add.image(100, 100, 'dice').setInteractive();;
   dice.setScale(0.25); // Scales the image to 50%

   dice.on('pointerdown', () => {
      console.log('Button pressed!');
      diceRoll(this);
      dice.setTint(0x000000); // Apply a tint to indicate press
      dice.setAlpha(0.8); 
   });

   dice.on('pointerup', () => {
      dice.clearTint();       // Remove the tint
      dice.setAlpha(1);       // Reset the scale
   });
}

function diceRoll() {
   console.log('Dice rolled');

   var diceResult = Math.ceil(Math.random() * 6);
   console.log(diceResult);
   txtDiceResult.setText(diceResult);

}
