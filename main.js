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
var isDiceRollingNow = false;

var isDecreeVisible = false;
var imgDecreeUp, imgDecreeDown, imgDecreePaper;
var txtDecree;

var soundPawn;
var soundBonus;
var soundTrophy;
var soundDice;

const TrophyTypes = Object.freeze({
   NONE: 0,
   PARA: 1,
   AŞK: 2,
   BAŞARI: 3,
   SAĞLIK: 4,
   BONUS: 5
});

const urlParams = new URLSearchParams(window.location.search);
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
   this.load.image('imgDashedLine', 'assets/dashed-line.png');
   this.load.audio('backgroundMusic', 'assets/SilentJungleLong.mp3'); // Key: 'backgroundMusic', Path: 'assets/music.mp3'
   for(var i = 1; i <= 6; i++) {
      this.load.image('imgDice' + i, 'assets/dice-' + i + '.png');
   }

   this.load.image('imgTrophyMoney', 'assets/trophy-money.png');
   this.load.image('imgTrophyLove', 'assets/trophy-love.png');
   this.load.image('imgTrophyCareer', 'assets/trophy-career.png');
   this.load.image('imgTrophyHealth', 'assets/trophy-health.png');
   this.load.image('imgTrophyBonus', 'assets/trophy-bonus.png');

   this.load.image('imgPawn', 'assets/pawn-red.png');

   this.load.image('imgDecreeUp', 'assets/decree-up.png');
   this.load.image('imgDecreeDown', 'assets/decree-down.png');
   this.load.image('imgDecreePaper', 'assets/decree-paper.png');

   this.load.audio('soundPawn', 'assets/sound/pawn.wav');
   this.load.audio('soundBonus', 'assets/sound/bonus.mp3');
   this.load.audio('soundTrophy', 'assets/sound/trophy.mp3');
   this.load.audio('soundDice', 'assets/sound/dice.mp3');
}


function create() {
   const imgWhite = this.add.image(this.scale.width / 2, this.scale.height / 2, 'imgWhite').setInteractive();;
   const imgBG = this.add.image(this.scale.width / 2, this.scale.height / 2, 'imgBG').setInteractive();;

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
         closeDecree();  
      }
   });

  createDice.call();
  createBoardArray.call();

  imgPawn = this.add.image(110, 770, 'imgPawn').setInteractive();
  imgPawn.setOrigin(0.5, 0.85);

  createChristmassBalls();

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
   //for( var i = 0; i < bonusSlotPositions.length; i++) {
   //   imgBonuses.push(this.add.image(bonusSlotPositions[i].x, bonusSlotPositions[i].y, 'imgTrophyBonus').setInteractive());
   //}

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

   bonusesObtained = [];

   imgDecreePaper = this.add.image(0, 0, 'imgDecreePaper').setInteractive();
   imgDecreeUp = this.add.image(0, 0, 'imgDecreeUp').setInteractive();
   imgDecreeDown = this.add.image(0, 0, 'imgDecreeDown').setInteractive();

   imgDecreePaper.setVisible(false);
   imgDecreeUp.setVisible(false);
   imgDecreeDown.setVisible(false);

   txtDecree = this.add.text(100, 250, '', {
      fontFamily: 'Luckiest Guy',
      fontSize: '20px',
      color: '#303040',
      wordWrap: { width: 220 },
      align: 'left'
  });
  txtDecree.setAlpha(0);

  var txtBilginEsme = this.add.text(290, 750, '© Bilgin Eşme 2025 ', {
   fontFamily: 'Tahoma',
   fontSize: '12px',
   color: '#FFFFFF'}).setInteractive();
   txtBilginEsme.setAlpha(0.8);
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

function diceRoll(diceNumber) {
   var posPlayerPrevious = posPlayer;

   posPlayer+= diceNumber;
   if(posPlayer > (boardArray.length - 1)) {
      posPlayer = posPlayer - (boardArray.length);
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

       const jokeText = scene.add.text(ball.x - 40, ball.y + 180, "Dikkat et \nkırılabilir!", { fontFamily: 'Luckiest Guy', fontSize: '16px', fill: '#fff' });
         scene.time.delayedCall(2000, () => jokeText.destroy()); // Remove the text after 2 seconds
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
           soundPawn.play();

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
       else {

         console.log('Display the trophy');
         if(boardArray[posPlayer] != 0) {
            var tt = boardArray[posPlayer];
          
            if (trophyMap.has(tt)) {
               trophyMap.set(tt, trophyMap.get(tt) + 1);
            } else {
               trophyMap.set(tt, 1);
            }
        
           trophyMap = sortTrophiesByHits(trophyMap);
           if(tt == TrophyTypes.BONUS) { addBonus(); }
           else { drawTrophies(); }
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
            strTrophy+= ' x2';
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

   openDecree('BONUS \n\n' + strBonus);

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
      console.log('Some bonus');

      scene.tweens.add({
         targets: img,
         scaleX: 3.0, // Scale up to 1.5 times its size
         scaleY: 3.0,
         duration: 500, // Duration of the scaling up
         yoyo: true, // Return to normal size
         ease: 'Power1', // Smooth easing effect
         onComplete: () => {
            console.log('Clicked and returned to normal size --> ' + idxSlot);
            openDecree('BONUS \n\n' + bonusesObtained[idxSlot]);
         }
   });

   });
}

function openDecree(strText) {
   let scene = currentScene; // Use the global scene variable
   var posYStart = 200;

   imgDecreeUp.x = scene.scale.width / 2;
   imgDecreeUp.y = posYStart;
   //imgDecreeUp.setAlpha(0.5);
   imgDecreeUp.setVisible(true);

   imgDecreeDown.x = imgDecreeUp.x;
   imgDecreeDown.y = imgDecreeUp.y + imgDecreeUp.height + 10;
   //imgDecreeDown.setAlpha(0.5);
   imgDecreeDown.setVisible(true);

   imgDecreePaper.x = imgDecreeUp.x;
   imgDecreePaper.y = imgDecreeUp.y + imgDecreeUp.height / 2 - 10;
   imgDecreePaper.setOrigin(0.5, 0);
   imgDecreePaper.setVisible(true);
   imgDecreePaper.scaleY = 0.05;

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
            onComplete: () => {
                console.log('Fade-in complete!');
            }
        });
        
     }
   });

   scene.tweens.add({
      targets: imgDecreeDown,
      y: 548, 
      duration: 800, 
      ease: 'Sine.easeInOut',
      repeat: 0, 
   });
}

function closeDecree() {
   let scene = currentScene; // Use the global scene variable
   console.log('Close decree');

   txtDecree.setText('');
   txtDecree.setAlpha(0);

   scene.tweens.add({
      targets: imgDecreePaper,
      scaleY: 0.05, 
      duration: 800, 
      ease: 'Sine.easeInOut',
      repeat: 0, 
      onComplete: () => {
         setTimeout(() => {
            console.log('This message appears after 2 seconds');
            isDecreeVisible = false;

            imgDecreeUp.setVisible(false);
            imgDecreeDown.setVisible(false);
            imgDecreePaper.setVisible(false);
        }, 500);
     }
   });

   scene.tweens.add({
      targets: imgDecreeDown,
      y: imgDecreeUp.y + imgDecreeUp.height + 5, 
      duration: 800, 
      ease: 'Sine.easeInOut',
      repeat: 0, 
   });

}
