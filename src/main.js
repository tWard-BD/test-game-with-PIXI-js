// description: This example demonstrates how to use a Container to group and manipulate multiple sprites
import { Application, Assets, Container, Sprite } from 'pixi.js';

(async () => {
  // Create a new application
  const app = new Application();

  // Initialize the application
  await app.init({ background: '#1099bb', resizeTo: window });

  // Append the application canvas to the document body
  document.body.appendChild(app.canvas);

  const backgroundContainer = new Container();

  const backgroundTexture =  await Assets.load('/assets/background.png');

  const backgroundSprite = getBackgroundSprite(backgroundTexture, app);
  backgroundSprite.x = app.screen.left;

  const backgroundSprite2 = getBackgroundSprite(backgroundTexture, app);
  backgroundSprite2.x = app.screen.right;
  
  backgroundContainer.addChild(backgroundSprite);
  backgroundContainer.addChild(backgroundSprite2);

  const pipeContainer = new Container();

  const pipeTexture = await Assets.load('/assets/pipe.png');

  const pipePairs = [];

  loadPipePairs(pipeTexture, pipePairs, pipeContainer, app);

  // foreground container and sprites
  const foregroundContainer = new Container();
  const grassTexture = await Assets.load('/assets/grass.png');
  const birdTexture = await Assets.load('/assets/bird.png');
  
  const birdSprite = new Sprite(birdTexture);
  birdSprite.height = 50;
  birdSprite.width = 80;
  birdSprite.y = app.screen.height / 2;
  birdSprite.x = app.screen.width / 8;

  const grassSprite = getGrassSprite(grassTexture, app);
  grassSprite.x = app.screen.left;

  const grassSprite2 = getGrassSprite(grassTexture, app);
  grassSprite2.x = app.screen.right;

  const gameOverTexture = await Assets.load('/assets/game over.png');
  const gameOverSprite = new Sprite(gameOverTexture);
  gameOverSprite.visible = false;

  foregroundContainer.addChild(grassSprite);
  foregroundContainer.addChild(grassSprite2);
  foregroundContainer.addChild(birdSprite);
  foregroundContainer.addChild(gameOverSprite);

  app.stage.addChild(backgroundContainer);
  app.stage.addChild(pipeContainer);
  app.stage.addChild(foregroundContainer);

  //app.stage.eventMode = 'static';
  //app.stage.hitArea = app.screen;

  let hasStarted = false;
  let isGameOver = false;
  let birdFlySpeed = 40;
  let birdFallSpeed = 0.5;
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && !e.repeat) {
      //e.preventDefault();
      fly(birdSprite, birdFlySpeed);
      hasStarted = true;
    }
  });

  //app.stage.on('pointerdown', (event) =>{
  //  console.log('moved');
//
  //  fly(birdSprite, 4);
  //  console.log(birdSprite.y);
//
  //  setTimeout(fall(birdSprite, 0.1), 300);
  //  });
  let counter = 0;
  const speed = 3;    
  // Listen for animate update
  app.ticker.add((time) => {
    
    if (hasStarted) {
      fall(birdSprite, birdFallSpeed);

      // background movement
      moveSpriteToLeftRepeat(backgroundSprite, app, time, speed);
      moveSpriteToLeftRepeat(backgroundSprite2, app, time, speed);

      // grass movement
      moveSpriteToLeftRepeat(grassSprite, app, time, speed);
      moveSpriteToLeftRepeat(grassSprite2, app, time, speed);

      //moveSpriteToRightRepeat(birdSprite, app, time, speed);

      // pipe movement
      for(let i = 0; i < pipePairs.length; i++) {
        let pair = pipePairs[i]; 
        pair.topPipe.x -= speed * time.deltaTime;
        pair.bottomPipe.x -= speed * time.deltaTime;

        if (birdSprite.x <= topPipe.x) {
          // score counter
          counter++;
        }

        if (pair.topPipe.x <= -pair.topPipe.width) {
          pair.topPipe.x = app.screen.right;
          pair.bottomPipe.x = app.screen.right;

          setRandomPipeGap(pair, app);
        }

        if (checkForCollision(birdSprite, pair)) {
          isGameOver = true;
        }
      }
    }
    
    if (isGameOver) {

      hasStarted = false;

      gameOverSprite.y = app.screen.height / 2;
      gameOverSprite.x = app.screen.width / 2;
      //gameOverSprite.width = app.screen.height / 4;
      //gameOverSprite.height = app.screen.width / 2;
      gameOverSprite.visible = true;
      counter = 0;
      console.log(gameOverSprite.y);
      console.log(gameOverSprite.x);
    }
  });
})();

function moveSpriteToLeftRepeat(sprite, app, time, x) {
  sprite.x -= x * time.deltaTime;

  //console.log(sprite.x);
  //console.log(-sprite.width);
  if (sprite.x <= -sprite.width) {
    sprite.x = app.screen.right;
  }
}

function fly(bird, y) {
  bird.y -= y;
}

function fall(bird, y) {
  bird.y += y;
}

function moveSpriteToRightRepeat(sprite, app, time, x) {
  sprite.x += x * time.deltaTime;

  if (sprite.x == -sprite.width) {
    sprite.x = app.screen.left;
  }
}

function checkForCollision(bird, pipePair) {
  const birdBounds = bird.getBounds();
  const topPipeBounds = pipePair.topPipe.getBounds();
  const bottomPipeBounds = pipePair.bottomPipe.getBounds();

  const topPipeHasCollided = hasCollided(birdBounds, topPipeBounds);

  const bottomPipeHasCollided = hasCollided(birdBounds, bottomPipeBounds);
  //console.log(topPipeHasCollided);
  //console.log(bottomPipeHasCollided);
  return topPipeHasCollided || bottomPipeHasCollided;
}

function hasCollided(birdBounds, pipeBounds) {
  return (
      birdBounds.x < pipeBounds.x + pipeBounds.width
      && birdBounds.y < pipeBounds.y + pipeBounds.height
      && pipeBounds.x < birdBounds.x + birdBounds.width
      && pipeBounds.y < birdBounds.y + birdBounds.height
  );
}

function getBackgroundSprite(texture, app) {
  const sprite = new Sprite(texture);
  
  sprite.y = app.screen.top;
  sprite.width = app.screen.right;
  sprite.height = app.screen.height;

  return sprite;
}

function getGrassSprite(texture, app) {
  const sprite = new Sprite(texture);

  sprite.anchor.set(0, 1);
  sprite.y = app.screen.bottom;
  sprite.width = app.screen.right;  
  sprite.height = app.screen.height / 8;

  return sprite;
}

function loadPipePairs(texture, pairs, pipeContainer, app) {
  const pairsCount = 5;

  for (let i = 0; i < pairsCount; i++) {
    const topPipe = new Sprite(texture);
    const bottomPipe = new Sprite(texture);

    topPipe.width = 100;
    topPipe.height = 600;

    bottomPipe.width = 100;
    bottomPipe.height = 600;
    
    topPipe.anchor.set(0.5);
    bottomPipe.anchor.set(0.5);
    topPipe.rotation = Math.PI;
    
    const pair = { topPipe, bottomPipe, x: app.screen.width + i * 400 };
    setRandomPipeGap(pair, app);

    topPipe.x = pair.x + topPipe.width / 2;
    bottomPipe.x = pair.x + bottomPipe.width / 2;

    pipeContainer.addChild(topPipe, bottomPipe);
    pairs.push(pair);
  }
}

function setRandomPipeGap(pair, app) {
  const gapY = 160;
  const minY = 80;
  const maxY = app.screen.height - gapY - 80 - (app.screen.height / 8);
  const randomStartY = minY + Math.random() * (maxY - minY);
   
  pair.topPipe.y = randomStartY - pair.topPipe.height / 2;
  pair.bottomPipe.y = randomStartY + gapY + pair.bottomPipe.height / 2;
}