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
var boardArray = []; 
var boardCellPositions = [];
var trophySlotPositions = []; 
var bonusSlotPositions = []; 
var trophyMap = new Map();
var txtTrophies = [];
var imgBonuses = [];
var defBonuses = [];
var bonusDefinitions = [];
var bonusesObtained = [];

var isGameOver = false;
var posPlayer = -1;
var imgDice;
var imgPawn;
var imgQuestionMark;
var isDiceRollingNow = false;

let isPawnMoving = false;
let posPawnInitial = { x:120, y:760 };

var isDecreeVisible = false;
var imgDecreeUp, imgDecreeDown, imgDecreePaper;
var imgOracle;
var txtDecree;

var soundPawn;
var soundBonus;
var soundTrophy;
var soundDice;
var soundGameOver;

const TrophyTypes = Object.freeze({
   NONE: 0,
   PARA: 1,
   AŞK: 2,
   BAŞARI: 3,
   SAĞLIK: 4,
   BONUS: 5
});

const DecreeTypes = Object.freeze({
   None: 0,
   Bonus: 1,
   GameStart: 2,
   GameEnd: 3,
   Info: 4
});

const urlParams = new URLSearchParams(window.location.search);
let nameOfThePlayer = urlParams.get('name');

function preload() {
   currentScene = this;

   // Create a "LOADING" text
   const loadingText = this.add.text(200, 300, "HOŞGELDİN 2025\nYÜKLENİYOR", {
      font: "32px Arial",
      fill: "#ffffff",
         align: "center"
   }).setOrigin(0.5, 0.5);

   const percentText = this.add.text(200, 370, "0%", {
      font: "24px Arial",
      fill: "#ffffff",
   }).setOrigin(0.5, 0.5);

   this.load.on("progress", (value) => {
      percentText.setText(parseInt(value * 100) + "%");
   });

   // Remove loading elements when complete
   this.load.on("complete", () => {
      loadingText.destroy();
      percentText.destroy();
   });

   const font = new FontFace('Luckiest Guy', 'url(assets/fonts/LuckiestGuy-Regular.ttf)');

    font.load().then(() => {
        // Add the font to the document
        document.fonts.add(font);
        console.log('Font loaded locally');
    }).catch(err => {
        console.error('Font failed to load:', err);
    });


   this.load.image('imgChristmasBall1', 'assets/christmas-ball-1.png');
   this.load.image('imgChristmasBall2', 'assets/christmas-ball-2.png');
   this.load.image('imgBoard', 'assets/board.png');
   this.load.image('imgBG', 'assets/bg.png');
   this.load.image('imgWhite', 'assets/bg-white.png');
   this.load.image('imgDashedLine', 'assets/dashed-line.png');
   this.load.image('imgOracle', 'assets/oracle.png');
   this.load.audio('backgroundMusic', 'assets/SilentJungleLong.mp3'); 
   

   for(var i = 1; i <= 6; i++) {
      this.load.image('imgDice' + i, 'assets/dice-' + i + '.png');
   }

   for(var i = 1; i <= 10; i++) {
      var strN = doubleDigit(i);
      this.load.image('imgFlake' + strN, 'assets/flake-' + strN + '.png');
   }

   this.load.image('imgTrophyMoney', 'assets/trophy-money.png');
   this.load.image('imgTrophyLove', 'assets/trophy-love.png');
   this.load.image('imgTrophyCareer', 'assets/trophy-career.png');
   this.load.image('imgTrophyHealth', 'assets/trophy-health.png');
   this.load.image('imgTrophyBonus', 'assets/trophy-bonus.png');

   this.load.image('imgPawn', 'assets/pawn-red.png');
   this.load.image('imgQuestionMark', 'assets/question-mark.png');

   this.load.image('imgDecreeUp', 'assets/decree-up.png');
   this.load.image('imgDecreeDown', 'assets/decree-down.png');
   this.load.image('imgDecreePaper', 'assets/decree-paper.png');

   this.load.audio('soundPawn', 'assets/sound/pawn.wav');
   this.load.audio('soundBonus', 'assets/sound/bonus.mp3');
   this.load.audio('soundTrophy', 'assets/sound/trophy.mp3');
   this.load.audio('soundDice', 'assets/sound/dice.mp3');
   this.load.audio('soundGameOver', 'assets/sound/game-over.mp3'); 
}
 
function create() {
   const imgWhite = this.add.image(this.scale.width / 2, this.scale.height / 2, 'imgWhite').setInteractive();;
   const imgBG = this.add.image(this.scale.width / 2, this.scale.height / 2, 'imgBG').setInteractive();;
 
   var imgFlake01 = this.add.image(204, 46, 'imgFlake01').setInteractive();
   var imgFlake02 = this.add.image(95, 98, 'imgFlake02').setInteractive();
   var imgFlake03 = this.add.image(297, 132, 'imgFlake03').setInteractive();
   var imgFlake04 = this.add.image(125, 284, 'imgFlake04').setInteractive();
   var imgFlake05 = this.add.image(136, 477, 'imgFlake05').setInteractive();
   var imgFlake06 = this.add.image(339, 483, 'imgFlake06').setInteractive();
   var imgFlake07 = this.add.image(240, 648, 'imgFlake07').setInteractive();
   var imgFlake08 = this.add.image(50, 730, 'imgFlake08').setInteractive();
   var imgFlake09 = this.add.image(174, 760, 'imgFlake09').setInteractive();
   var imgFlake10 = this.add.image(363, 740, 'imgFlake10').setInteractive();

   const animateFlake = (flake) => {
      const flakeMe = () => {
          const randomOffset = Phaser.Math.Between(1, 4); // Random stretch
          const randomDuration = Phaser.Math.Between(1000, 3000); // Random duration
          const randomAngle = Phaser.Math.Between(-6, 6); // Random swing angle
          const randomAlpha = Phaser.Math.FloatBetween(0.6, 1.0); // Random swing angle

          // Tween to move the ball down
          this.tweens.add({
              targets: flake,
              y: flake.y + randomOffset, // Move down by random offset
              angle: randomAngle, // Add random swing
              duration: randomDuration, // Use random duration
              alpha: randomAlpha,
              ease: 'Sine.easeInOut', // Smooth easing
              onComplete: () => {
               const randomAlphaReturn = Phaser.Math.FloatBetween(0.6, 1.0); // Random swing angle
                  this.tweens.add({
                      targets: flake,
                      y: flake.y - randomOffset, // Move back up
                      duration: Phaser.Math.Between(1000, 3000), // Random duration for upward motion
                      angle: -randomAngle, // Swing to the opposite direction
                      alpha: randomAlphaReturn,
                      ease: 'Sine.easeInOut',
                      onComplete: flakeMe // Loop by calling moveBall again
                  });
              }
          });
      };

      flakeMe(); // Start the animation
  };

  animateFlake(imgFlake01);
  animateFlake(imgFlake02);
  animateFlake(imgFlake03);
  animateFlake(imgFlake04);
  animateFlake(imgFlake05);
  animateFlake(imgFlake06);
  animateFlake(imgFlake07);
  animateFlake(imgFlake08);
  animateFlake(imgFlake09);
  animateFlake(imgFlake10);

   const imgBoard = this.add.image(10, 150, 'imgBoard').setInteractive();
   imgBoard.setOrigin(0, 0);

   const music = this.sound.add('backgroundMusic', {
   loop: true,  // Loop the music
   volume: 0.5  // Set the volume (0.0 to 1.0)
   });

   soundPawn = this.sound.add('soundPawn', {loop: false,  volume: 0.5});
   soundBonus = this.sound.add('soundBonus', {loop: false,  volume: 0.5});
   soundTrophy = this.sound.add('soundTrophy', {loop: false,  volume: 0.5});
   soundDice = this.sound.add('soundDice', {loop: false,  volume: 0.3});
   soundGameOver = this.sound.add('soundGameOver', {loop: false,  volume: 0.3});

    // Wait for user interaction to start audio
   this.input.once('pointerdown', (pointer) => {
      // Resume the audio context
      if (this.sound.context.state === 'suspended') {
            this.sound.context.resume();
      }

      // Play the music
      //music.play();
   });

   this.input.on('pointerup', (pointer) => {
      if(isDecreeVisible) {
         // closeDecree();
         // REMOVE THIS IF NOT NEEDED  
      }
   });

   createDice.call();
   createBoardArray.call();
   
   imgPawn = this.add.image(posPawnInitial.x, posPawnInitial.y, 'imgPawn').setInteractive();
   imgPawn.setOrigin(0.5, 0.85);

   createChristmassBalls();

   if(!nameOfThePlayer || nameOfThePlayer == null) {
      nameOfThePlayer = '';
   }

   this.add.text(75, 15, 'Merhaba ' + nameOfThePlayer, {
   fontFamily: 'Luckiest Guy',
   fontSize: '25px',
   color: '#ffffff'});

   this.add.text(75, 45, 'Bakalım 2025 Ne GETİRECEK!', {
      fontFamily: 'Luckiest Guy',
      fontSize: '20px',
      color: '#ffffff'});

   const imgDashedLine = this.add.image(74, 78, 'imgDashedLine').setInteractive();
   imgDashedLine.setOrigin(0, 0);
   imgDashedLine.scale = 1.15;
   imgDashedLine.setAlpha(0.5);

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

   bonusSlotPositions = [];
   bonusSlotPositions.push({x: 200, y: 150});
   bonusSlotPositions.push({x: 240, y: 150});
   bonusSlotPositions.push({x: 280, y: 150});

   txtTrophies = [];
   for( var i = 0; i < trophySlotPositions.length; i++) {
      txtTrophies.push(this.add.text(trophySlotPositions[i].x, trophySlotPositions[i].y, '',  {fontFamily: 'Luckiest Guy', fontSize: '20px', color: '#ffffff'}));
   }

   imgBonuses = [];
   createBonusDefinitions();

   bonusesObtained = [];

   imgDecreePaper = this.add.image(0, 0, 'imgDecreePaper').setInteractive();
   imgDecreeUp = this.add.image(0, 0, 'imgDecreeUp').setInteractive();
   imgDecreeDown = this.add.image(0, 0, 'imgDecreeDown').setInteractive();

   imgDecreePaper.setVisible(false);
   imgDecreeUp.setVisible(false);
   imgDecreeDown.setVisible(false);

   txtDecree = this.add.text(100, 230, '', {
      fontFamily: 'Luckiest Guy',
      fontSize: '20px',
      color: '#303040',
      wordWrap: { width: 220 },
      align: 'left'
  });
  txtDecree.setAlpha(0);

  imgOracle = this.add.image(0, 0, 'imgOracle').setInteractive();;
  imgOracle.setVisible(false);

  var txtBilginEsme = this.add.text(215, 760, '© Bilgin Eşme 2024 ', {
   fontFamily: 'Arial',
   fontSize: '20px',
   color: '#FFFFFF'}).setInteractive();
   txtBilginEsme.setAlpha(0.8);

   txtBilginEsme.on('pointerdown', () => {
      if(!isDecreeVisible) {
         this.tweens.add({
            targets:  txtBilginEsme,
            scaleY: 1.6,
            duration: 100, // Duration of the scaling up
            yoyo: true, // Return to normal size
            ease: 'Power1', // Smooth easing effect
            onComplete: () => {
               soundPawn.play();
               openInfoWindow();
            }
         });
      }
   });

   let strTRext = 'ZAR ATARAK KUTUCUKLARDA İLERLEYİN VE SÜRPRİZLERİ YAKALAYIN.\n\nPLATFORMUN SONUNA GELDİĞİNİZDE OYUN BİTMİŞ OLACAK.';
   openDecree(strTRext, DecreeTypes.GameStart);
   //startTheGameEndAnimation();

   imgQuestionMark = this.add.image(50, 750, 'imgQuestionMark').setInteractive();
   imgQuestionMark.setOrigin(0.5, 0.5);
 
   const animateQuestionMark = (flake) => {
      const animateMe = () => {
          const randomDuration = Phaser.Math.Between(500, 900); // Random duration
          const randomAlpha = Phaser.Math.FloatBetween(0.6, 1.0); // Random swing angle

          // Tween to move the ball down
          this.tweens.add({
              targets: imgQuestionMark,
              duration: randomDuration, // Use random duration
              alpha: randomAlpha,
              ease: 'Sine.easeInOut', // Smooth easing
              onComplete: () => {
               const randomAlphaReturn = Phaser.Math.FloatBetween(0.6, 1.0); // Random swing angle
                  this.tweens.add({
                      targets: imgQuestionMark,
                      duration: Phaser.Math.Between(500, 900), // Random duration for upward motion
                      alpha: randomAlphaReturn,
                      ease: 'Sine.easeInOut',
                      onComplete: animateMe // Loop by calling moveBall again
                  });
              }
          });
      };

      animateMe(); // Start the animation
   };
   animateQuestionMark();

   imgQuestionMark.on('pointerdown', () => {
      if(!isDecreeVisible) {
         this.tweens.add({
            targets:  imgQuestionMark,
            scaleX: 1.5, 
            scaleY: 1.5,
            duration: 100, // Duration of the scaling up
            yoyo: true, // Return to normal size
            ease: 'Power1', // Smooth easing effect
            onComplete: () => {
               soundPawn.play();
               openInfoWindow();
            }
         });
      }
   });
}

function update(time, delta) {
   // Logic to update the game each frame
}

function createDice() {
   let scene = currentScene; // Use the global scene variable
   imgDice = scene.add.image(270, 320, 'imgDice1').setInteractive();
   imgDice.angle = 15;

   imgDice.on('pointerdown', () => {
      if(isDiceRollingNow || isDecreeVisible) {
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
   if(isGameOver || isPawnMoving)
      return;

   isDiceRollingNow = true;   
   const animationDuration = 1000; // Total duration in milliseconds
   const interval = 100; // Time interval in milliseconds
   let elapsedTime = 0;
 
   const finalRoll = Phaser.Math.Between(1, 6);
   soundDice.play();

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
       imgDice.setTexture('imgDice' + finalRoll);
       isDiceRollingNow = false;
       diceRoll(finalRoll);
     }
   }, interval);
}

const endGameLocation = { x:105, y:156 };

function diceRoll(diceNumber) {
   var posPlayerPrevious = posPlayer;

   posPlayer+= diceNumber;
   if(posPlayer > (boardArray.length - 1)) {
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
      if(!isGameOver) {
         endPos = posPlayerPrevious + diceNumber + 1;
      }
      else {
         endPos = boardArray.length;
      }
   } 

   for(var i = startPos; i < endPos; i++) {
      var boardCell;
      boardCell = boardCellPositions[i]
      points.push({x: boardCell.x, y: boardCell.y});
   }

   if(isGameOver) {
      points.push(endGameLocation);
   }
   
   index = 0;
   movePawn(imgPawn, points);
}

function createBoardArray() {
   let scene = currentScene; // Use the global scene variable

   boardArray[0] = 0;
   boardArray[1] = 0;
   boardArray[2] = 0;
   boardArray[3] = TrophyTypes.SAĞLIK;
   boardArray[4] = 0;
   boardArray[5] = TrophyTypes.AŞK;
   boardArray[6] = 0;
   boardArray[7] = 0;
   boardArray[8] = TrophyTypes.PARA;
   boardArray[9] = 0;
   boardArray[10] = 0;
   boardArray[11] = TrophyTypes.BAŞARI;
   boardArray[12] = 0;
   boardArray[13] = 0;
   boardArray[14] = 0;
   boardArray[15] = TrophyTypes.BONUS;
   boardArray[16] = 0;
   boardArray[17] = 0;
   boardArray[18] = TrophyTypes.PARA;
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
   boardCellPositions[15] = {x: 32, y:515 };
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
         let trophyImage = currentScene.add.image(pos.x, pos.y, strImg).setInteractive();
         let trophyName = getTrophyName(trophy);
         trophyImage.setOrigin(0.5, 0.9);

         trophyImage.on('pointerdown', () => {
            scene.tweens.add({
               targets: trophyImage,
               scaleX: 2.0, 
               scaleY: 2.0,
               duration: 250, // Duration of the scaling up
               yoyo: true, // Return to normal size
               ease: 'Power1', // Smooth easing effect
               onComplete: () => {
                  let trophyText = scene.add.text(trophyImage.x, trophyImage.y - 50, trophyName, {fontFamily: 'Luckiest Guy', fontSize: '20px', color: '#ffffff'});
                  trophyText.setOrigin(0.5, 0.5);

                  scene.tweens.add({
                     targets: trophyText,
                     scaleX: 1,
                     scaleY: 1,
                     alpha: 1,
                     duration: 1000, 
                     ease: 'Bounce.easeOut',
                     onStart: () => {
                        trophyText.setScale(0); 
                        trophyText.setAlpha(1); 
                     },
                     onComplete: () => {
                        scene.tweens.add({
                           targets: trophyText,
                           alpha: 0,
                           duration: 2000, 
                           ease: 'Power1',
                           onComplete: () => {
                              trophyText.destroy(); 
                           }
                        });
                     }
                  });
               }
         });
      
         });
      }
   }
}

function createBonusDefinitions() {
   bonusDefinitions = [];

   bonusDefinitions.push('UZUN BİR SEYAHAT.');
   bonusDefinitions.push('BEKLENMEDİK YERDEN GELEN PARA.');
   bonusDefinitions.push('UZUN SÜREDİR GÖRMEDİĞİN BİR ARKADAŞI GÖRECEKSİN.');
   bonusDefinitions.push('UĞUR GETİRECEK BİR GÖKKUŞAĞI.');
   bonusDefinitions.push('BİR HAYALİN GERÇEKLEŞECEK.');
   bonusDefinitions.push('YENİ BİR ÇEVREYE KATILACAKSIN.');
   bonusDefinitions.push('HAYATINI DEĞİŞTİRECEK HARİKA BİR FİLM İZLEYECEKSİN.');
   bonusDefinitions.push('HAYATINI DEĞİŞTİRECEK HARİKA BİR KİTAP OKUYACAKSIN.');
   bonusDefinitions.push('HİÇ TAHMİN ETMEDİĞİN BİRİNDEN HEDİYE ALACAKSIN.');
   bonusDefinitions.push('UZUN SÜREDİR KAYIP OLAN ÇOK SEVDİĞİN BİR EŞYANI BULACAKSIN.');
   bonusDefinitions.push('BU YIL ÇOK GÜZEL YERLERDE PARK YERİ BULACAKSIN.');
   bonusDefinitions.push('ÇOK HOŞ BİR FESTİVALE KATILACAKSIN.');
   bonusDefinitions.push('TANIMADIĞIN BİRİNDEN ÇOK BÜYÜK BİR İYİLİK GÖRECEKSİN.');
   bonusDefinitions.push('UZUN SÜERDİR ÇÖZEMEDİĞİN BİR ŞEYİ SONUNDA ÇÖZECEKSİN.');
}

function createChristmassBalls() {
   let scene = currentScene; // Use the global scene variable
   imgChristmasBall1 = scene.add.image(50, -20, 'imgChristmasBall1').setInteractive();
   imgChristmasBall1.setOrigin(0.5, 0);

   imgChristmasBall2 = scene.add.image(360, -20, 'imgChristmasBall2').setInteractive();
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

       const jokeText = scene.add.text(ball.x - 50, ball.y + ball.height, "DİKKAT \nKIRILABİLİR!", { fontFamily: 'Luckiest Guy', fontSize: '16px', fill: '#fff' });
         scene.time.delayedCall(2000, () => jokeText.destroy()); // Remove the text after 2 seconds
   });
};

  // Start the animation
  animateBall(imgChristmasBall1);
  animateBall(imgChristmasBall2);

  addJumpInteraction(imgChristmasBall1);
  addJumpInteraction(imgChristmasBall2);
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
   isPawnMoving = true;

   function moveToNextPoint() {
       if (index < points.length) {
           let point = points[index];
           soundPawn.play();
           
           if(points.length == 1)
            isPawnMoving = false;
           
           scene.tweens.add({
               targets: pawn,
               x: point.x,
               y: point.y,
               duration: 700,
               ease: 'Power2',
               onComplete: () => {
                   index++; // Increment the index
                   if(index >= points.length - 1) {
                     isPawnMoving = false;
                   }
                     
                   moveToNextPoint(); // Call recursively
               }
           });
       }
       else {
         isPawnMoving = false;
         if(boardArray[posPlayer] > 0) {
            var tt = boardArray[posPlayer];
          
            if (trophyMap.has(tt)) {
               trophyMap.set(tt, trophyMap.get(tt) + 1);
            } else {
               trophyMap.set(tt, 1);
            }
        
           trophyMap = sortTrophiesByHits(trophyMap);
           if(tt == TrophyTypes.BONUS) { addBonus(); }
           else { 
            let trophyTextShadow = scene.add.text(205, 205, getTrophyName(tt), {fontFamily: 'Luckiest Guy', fontSize: '75px', color: '#505050'});
            trophyTextShadow.setOrigin(0.5, 0.5);

            let trophyText = scene.add.text(200, 200, getTrophyName(tt), {fontFamily: 'Luckiest Guy', fontSize: '75px', color: '#ffffff'});
            trophyText.setOrigin(0.5, 0.5);

            scene.tweens.add({
               targets: trophyText,
               scaleX: 1,
               scaleY: 1,
               alpha: 1,
               duration: 1000, 
               ease: 'Bounce.easeOut',
               onStart: () => {
                  trophyText.setScale(0); 
                  trophyText.setAlpha(1); 
               },
               onComplete: () => {
                  setTimeout(() => {
                     scene.tweens.add({
                        targets: trophyText,
                        alpha: 0,
                        duration: 2000, 
                        ease: 'Power1',
                        onComplete: () => {
                           trophyText.destroy(); 
                        }
                     });
                  }, 500);
               }
               });

               scene.tweens.add({
                  targets: trophyTextShadow,
                  scaleX: 1,
                  scaleY: 1,
                  alpha: 1,
                  duration: 1000, 
                  ease: 'Bounce.easeOut',
                  onStart: () => {
                     trophyTextShadow.setScale(0); 
                     trophyTextShadow.setAlpha(1); 
                  },
                  onComplete: () => {
                     setTimeout(() => {
                        scene.tweens.add({
                           targets: trophyTextShadow,
                           alpha: 0,
                           duration: 2000, 
                           ease: 'Power1',
                           onComplete: () => {
                              trophyTextShadow.destroy(); 
                           }
                        });
                     }, 500);
                  }
                  });

               drawTrophies(); 
            }
         }
         else {
            if(isGameOver) {
               startTheGameEndAnimation();
            }
         }
         
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
   soundTrophy.play();

   for( var i = 0; i < trophySlotPositions.length; i++) {
      txtTrophies[i].setText('');
   }

   var idxSlot = 0;
   trophyMap.forEach((value, key) => {
      if(key != TrophyTypes.BONUS) {
         var strTrophy = getTrophyName(key);
   
         if(value == 2) {
            strTrophy+= ' x2';
         }
         else if(value == 3) {
            strTrophy+= ' x3';
         }
         else if(value == 4) {
            strTrophy+= ' x4';
         }
   
         txtTrophies[idxSlot].setText(strTrophy);
         idxSlot++;
      }
  });
}

function addBonus() {
   let scene = currentScene; // Use the global scene variable
   
   var idxBonus = Phaser.Math.Between(0, bonusDefinitions.length-1);
   var strBonus = bonusDefinitions[idxBonus];
   
   soundBonus.play();

   bonusesObtained.push(strBonus);
   bonusDefinitions.splice(idxBonus, 1);

   openDecree(strBonus, DecreeTypes.Bonus);

   var idxSlot = imgBonuses.length;
   imgBonuses.push(scene.add.image(bonusSlotPositions[idxSlot].x, bonusSlotPositions[idxSlot].y, 'imgTrophyBonus').setInteractive());

   const animateStar = (star) => {
      scene.tweens.add({
          targets: star,
          angle: Phaser.Math.Between(-15, 15), // Rotate between -15 and 15 degrees
          scaleX: Phaser.Math.FloatBetween(0.8, 1.2), // Random scale on X axis
          scaleY: Phaser.Math.FloatBetween(0.8, 1.2), // Random scale on Y axis
          duration: Phaser.Math.Between(500, 1000), // Random duration between 1-2 seconds
          ease: 'Sine.easeInOut',
          repeat: -1, // Infinite loop
          yoyo: true // Reverse the animation back and forth
      });
  };

   var img = imgBonuses[imgBonuses.length - 1];
   animateStar(img);

   img.on('pointerdown', () => {
      scene.tweens.add({
         targets: img,
         scaleX: 3.0, 
         scaleY: 3.0,
         duration: 250, // Duration of the scaling up
         yoyo: true, // Return to normal size
         ease: 'Power1', // Smooth easing effect
         onComplete: () => {
            openDecree(bonusesObtained[idxSlot], DecreeTypes.Bonus);
         }
      });
   });
}

function openDecree(strText, decreeType) {
   if(isDecreeVisible)
      return;

   let scene = currentScene; // Use the global scene variable
   var posYStart = 200;

   imgDecreeUp.x = scene.scale.width / 2;
   imgDecreeUp.y = posYStart;
   imgDecreeUp.setVisible(true);

   imgDecreeDown.x = imgDecreeUp.x;
   imgDecreeDown.y = imgDecreeUp.y + imgDecreeUp.height + 10;
   imgDecreeDown.setVisible(true);

   imgDecreePaper.x = imgDecreeUp.x;
   imgDecreePaper.y = imgDecreeUp.y + imgDecreeUp.height / 2 - 10;
   imgDecreePaper.setOrigin(0.5, 0);
   imgDecreePaper.setVisible(true);
   imgDecreePaper.scaleY = 0.05;

   let buttonClose;
   let buttonReplay;
   let buttonShare;
   let buttonHomePage;

   scene.tweens.add({
      targets: imgDecreePaper,
      scaleY: 1, 
      duration: 800, 
      ease: 'Sine.easeInOut',
      repeat: 0, 
      onComplete: () => {
         isDecreeVisible = true;

         txtDecree.setText(strText);
         txtDecree.setAlpha(0);

         scene.tweens.add({
            targets: txtDecree,
            alpha: 1, // Fade to full visibility
            duration: 1000, // Duration of 1 second
            ease: 'Power1', // Easing for smooth animation
            onComplete: () => {}});

         if(decreeType == DecreeTypes.Bonus) {
            imgOracle.setVisible(true);
            imgOracle.setAlpha(0);
            imgOracle.x = 150;
            imgOracle.y = 460;
            imgOracle.scaleX = 0.65;
            imgOracle.scaleY = 0.65;
            scene.tweens.add({
               targets: imgOracle,
               alpha: 0.6, // Fade to full visibility
               duration: 1000, // Duration of 1 second
               ease: 'Power1', // Easing for smooth animation
               onComplete: () => {}});
         }
         else if(decreeType == DecreeTypes.GameEnd) {
            buttonReplay = currentScene.add.text(200, 480, 'YENİDEN OYNA', {fontFamily: 'Luckiest Guy', fontSize: '26px', color: '#006000'}).setInteractive();
            buttonReplay.setOrigin(0.5, 0.5);
         
            buttonReplay.on('pointerdown', () => {
               currentScene.tweens.add({
                  targets:  buttonReplay,
                  scaleX: 1.2, 
                  scaleY: 1.2,
                  duration: 100, // Duration of the scaling up
                  yoyo: true, // Return to normal size
                  ease: 'Power1', // Smooth easing effect
                  onComplete: () => {
                     buttonClose.setVisible(false);
                     buttonReplay.setVisible(false);
                     buttonShare.setVisible(false);
                     closeDecree();
                     playAgain();
                  }
               });
            });
         
            buttonShare = currentScene.add.text(200, 535, 'PAYLAŞ', {fontFamily: 'Luckiest Guy', fontSize: '26px', color: '#006000'}).setInteractive();
            buttonShare.setOrigin(0.5, 0.5);
         
            buttonShare.on('pointerdown', () => {
               currentScene.tweens.add({
                  targets:  buttonShare,
                  scaleX: 1.2, 
                  scaleY: 1.2,
                  duration: 100, // Duration of the scaling up
                  yoyo: true, // Return to normal size
                  ease: 'Power1', // Smooth easing effect
                  onComplete: () => {
                     buttonClose.setVisible(false);
                     buttonReplay.setVisible(false);
                     buttonShare.setVisible(false);
                     closeDecree();
                     shareGame();
                  }
               });
            });
         }
         else if(decreeType == DecreeTypes.Info) {
            buttonHomePage = currentScene.add.text(200, 475, 'besme@esme.org', {fontFamily: 'Luckiest Guy', fontSize: '24px', color: '#006000'}).setInteractive();
            buttonHomePage.setOrigin(0.5, 0.5);
         
            buttonHomePage.on('pointerdown', () => {
               currentScene.tweens.add({
                  targets:  buttonHomePage,
                  scaleX: 1.2, 
                  scaleY: 1.2,
                  duration: 100, // Duration of the scaling up
                  yoyo: true, // Return to normal size
                  ease: 'Power1', // Smooth easing effect
                  onComplete: () => {
                     buttonClose.setVisible(false);
                     buttonShare.setVisible(false);
                     buttonHomePage.setVisible(false);
                     closeDecree();

                     if (/iPhone|iPad|iPod/.test(navigator.userAgent) && !navigator.userAgent.includes("Mac OS")) {
                        alert("Sisteminizde e-posta uygulaması yüklü olmayabilir.");
                     }
                     else {
                        console.log('MAIL OK');
                     }

                     const subject = encodeURIComponent("Hosgeldin 2025");
                     const body = encodeURIComponent("Umarım oyunu beğenmişsinizidir.\n\nYorumlarınızı bekliyorum,\nBilgin Eşme");
                     const email = "besme@esme.org";
                     const mailtoLink = `mailto:${email}?subject=${subject}&body=${body}`;

                     window.open(mailtoLink, "_self");
                  }
               });
            });

            buttonShare = currentScene.add.text(200, 535, 'PAYLAŞ', {fontFamily: 'Luckiest Guy', fontSize: '26px', color: '#006000'}).setInteractive();
            buttonShare.setOrigin(0.5, 0.5);
            buttonShare.on('pointerdown', () => {
               currentScene.tweens.add({
                  targets:  buttonShare,
                  scaleX: 1.2, 
                  scaleY: 1.2,
                  duration: 100, // Duration of the scaling up
                  yoyo: true, // Return to normal size
                  ease: 'Power1', // Smooth easing effect
                  onComplete: () => {
                     buttonClose.setVisible(false);
                     buttonShare.setVisible(false);
                     buttonHomePage.setVisible(false);

                     closeDecree();
                     shareGame();
                  }
               });
            });
         }

         buttonClose = currentScene.add.text(200, 600, 'KAPAT', {fontFamily: 'Luckiest Guy', fontSize: '32px', color: '#006000'}).setInteractive();
         buttonClose.setOrigin(0.5, 0.5);
         buttonClose.setVisible(true);

         buttonClose.on('pointerdown', () => {
            currentScene.tweens.add({
               targets:  buttonClose,
               scaleX: 1.2, 
               scaleY: 1.2,
               duration: 100, // Duration of the scaling up
               yoyo: true, // Return to normal size
               ease: 'Power1', // Smooth easing effect
               onComplete: () => {
                  buttonClose.setVisible(false);

                  if(decreeType == DecreeTypes.GameEnd) {
                     buttonReplay.setVisible(false);
                     buttonShare.setVisible(false);
                  }
                  else if(decreeType == DecreeTypes.Info) {
                     buttonHomePage.setVisible(false);
                     buttonShare.setVisible(false);
                  }

                  closeDecree();
               }
            });
         });
     }
   });

   scene.tweens.add({
      targets: imgDecreeDown,
      y: 655, 
      duration: 800, 
      ease: 'Sine.easeInOut',
      repeat: 0, 
   });
}

function closeDecree() {
   let scene = currentScene; // Use the global scene variable

   txtDecree.setText('');
   txtDecree.setAlpha(0);
   imgOracle.setAlpha(0);
   imgOracle.setVisible(false);

   scene.tweens.add({
      targets: imgDecreePaper,
      scaleY: 0.05, 
      duration: 400, 
      ease: 'Sine.easeInOut',
      repeat: 0, 
      onComplete: () => {
         setTimeout(() => {
            isDecreeVisible = false;
            imgDecreeUp.setVisible(false);
            imgDecreeDown.setVisible(false);
            imgDecreePaper.setVisible(false);
        }, 300);
     }
   });

   scene.tweens.add({
      targets: imgDecreeDown,
      y: imgDecreeUp.y + imgDecreeUp.height + 5, 
      duration: 400, 
      ease: 'Sine.easeInOut',
      repeat: 0, 
   });
}

function doubleDigit(n) {
   var strResult = "";

   if(n < 100 && n > 0) {
       if(n < 10) 
           strResult = "0" + n;
       else
           strResult = n.toString();
   }

   return strResult;
}

function startTheGameEndAnimation() {
   soundGameOver.play();
   let strText = 'BAŞKA YILLAR, BAŞKA ZAMANLAR YA DA BAŞKA BİRİNİN ŞANSI İÇİN TEKRAR OYNAYABİLİRSİNİZ.\n\nOYUNU BİR ARKADAŞINIZLA DA PAYLAŞABİLİRSİNİZ';
   openDecree(strText, DecreeTypes.GameEnd);
}

function openInfoWindow() {
   openDecree('MERHABA, BEN BİLGİN EŞME.\n\nUMARIM ÇOK GÜZEL BİR YIL GEÇİRİRSİNİZ\n\nOYUNU ARKADAŞLARINIZLA PAYLAŞABİLİRSİNİZ.', DecreeTypes.Info);
}

function playAgain() {
   trophyMap = new Map();
   isGameOver = false;
   posPlayer = -1;
   isDiceRollingNow = false;

   imgPawn.x = posPawnInitial.x;
   imgPawn.y = posPawnInitial.y;

   drawTrophies();

   for(var i=0; i < imgBonuses.length; i++) {
      imgBonuses[i].setVisible(false);   
   }

   imgBonuses = [];
   bonusesObtained = [];
   createBonusDefinitions();
}

async function shareGame() {
   // Check if the Web Share API is supported
   if (navigator.share) {
      let title = 'Hoşgeldin 2025';
      let text = 'Yeni yıla eğlenceli bir giriş';
      let url = 'https://bilginesme.github.io/hosgeldin-2025/';

       try {
           await navigator.share({
               title: title,
               text: text,
               url: url
           });
           console.log('Thanks for sharing!');
       } catch (error) {
           console.error('Error sharing:', error);
       }
   } else {
       alert('Sharing is not supported on this device.');
   }
}
