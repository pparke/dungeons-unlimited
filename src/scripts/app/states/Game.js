/*
 * Game state
 * ============================================================================
 *
 * The main game state
 */
import Player     from '../objects/Player';
import Worker     from '../objects/Worker';
import Level      from '../objects/Level';
import AStar      from '../plugins/AStar';
import JobList    from '../plugins/JobList';
import Work       from '../components/Work';
import Walk       from '../components/Walk';
import Controls   from '../objects/Controls';
import Denizens   from '../objects/Denizens';

export default class Game extends Phaser.State {

  init () {
    this.level      = null;
    this.player     = null;
    this.denizens   = null;
    this.jobList    = null;
    this.astar      = null;
  }

  create () {
    // make sure pixels appear sharp
    this.game.stage.smoothed = false;
    this.game.physics.startSystem(Phaser.Physics.P2JS);

    // create the player's collision group used to test
    // collisions with walls and other tiles
    this.playerCollisionGroup = this.physics.p2.createCollisionGroup();
    this.workerCollisionGroup = this.physics.p2.createCollisionGroup();

    // setup the level
    this.setupLevel();

    // create the pathfinding object
    this.astar = new AStar(this.game, this, this.level);
    // create the job list
    this.jobList = new JobList(this.game, this, this.astar, this.level);
    // create the denizen list
    this.denizens = new Denizens(this.game);

    // make sure objects in collison groups will collide
    // with the world boundaries
    this.game.physics.p2.updateBoundsCollisionGroup();

    // setup player
    this.setupPlayer();

    // setup workers
    this.setupWorkers();

    // setup controls manager
    this.controls = new Controls(this.game, this.level, this.jobList, this.denizens);

  }

  update () {
    this.controls.update();
  }

  render () {
    this.game.debug.text(this.game.time.fps || '--', 2, 14, '#00ff00');
    this.game.debug.text('Jobs: ' + this.jobList.size(), 30, 14, '#ffffff');
    this.game.debug.text('Select: ' + this.controls.selectionMode, 110, 14, '#ccffff');
  }


  //---------------------------------------------------------------------------

  /**
     Setup Level
   */
  setupLevel () {
    console.log('creating level');
    this.level = new Level(this.game, null, 16, 16, 64, 64);

    this.level.addTileset('floors', 'floors', 'floorKeys');
    //this.level.addTileset('objects', 'objects', 'objectKeys');
    let collisions = [];
    collisions = collisions.concat([ 0, 1 ], Phaser.ArrayUtils.numberArray(3, 31), Phaser.ArrayUtils.numberArray(33, 48));
    //this.level.addTileset('walls', 'walls', 'wallKeys');
    this.level.addTileset('walls', 'walls', 'wallKeys', 'walls', collisions, this.playerCollisionGroup);

    this.level.drawFloor(0, 0, this.level.width, this.level.height, 'stoneMossFloor');
    this.level.addWall(0, 0, this.level.width, this.level.height);
    this.level.removeWall(this.level.centerX-10, this.level.centerY-10, 20, 20);
    this.level.addWall(this.level.centerX-9, this.level.centerY+5, 5, 5);

    //this.level.drawRect(5, 5, 5, 5,   'e,e,e|w,w,w|e,e,e', 'walls', true);
    //this.level.drawRect(12, 12, 1, 2, 'e,e,e|w,w,w|e,e,e', 'walls', true);
    //this.level.addWall(20, 0, 20, 21, 'walls', true);
    //this.level.addWall(0, 21, 20, 20, 'walls', true);
    //this.level.addWall(20, 20, 20, 20, 'walls', true);

    console.log('[info] # of tiles: ', this.level.tileNames.size);

    this.level.updateCollisionBodies('walls', [ this.playerCollisionGroup, this.workerCollisionGroup ]);
  }

  /**
   *  Setup Player
   */
  setupPlayer () {
    this.player = new Player(this.game, this.level.centerX*16, this.level.centerY*16, 'player2', 'down0000');
    this.game.world.addAt(this.player, 2);
    this.player.anchor.setTo(0.5, 0.5);
    this.player.animations.add('left-idle',   [ 'left0000', 'left0001' ], 2, true);
    this.player.animations.add('right-idle',  [ 'right0000', 'right0001' ], 2, true);
    this.player.animations.add('up-idle',     [ 'up0000', 'up0001' ], 2, true);
    this.player.animations.add('down-idle',   [ 'down0000', 'down0001' ], 2, true);
    this.player.animations.add('left-walk',   [ 'left0002', 'left0003' ], 4, true);
    this.player.animations.add('right-walk',  [ 'right0002', 'right0003' ], 4, true);
    this.player.animations.add('up-walk',     [ 'up0002', 'up0003' ], 4, true);
    this.player.animations.add('down-walk',   [ 'down0002', 'down0003' ], 4, true);

    this.player.animations.play('down-idle');

    //this.player.body.setCollisionGroup(this.playerCollisionGroup);
    //this.player.body.collides([ this.level.collisionGroup, this.workerCollisionGroup ]);

    // set the camera to follow the player
    //this.game.camera.follow(this.player, Phaser.Camera.FOLLOW_TOPDOWN);
  }

  /**
     Setup Workers
   */
  setupWorkers () {

    for (let i = 0; i < 4; i++) {
      let x = this.level.centerX * 16 - 24;
      let y = this.level.centerY * 16 + (i*16) + 8;
      let worker = new Worker(this.game, x, y, 'player1', 'down0000');
      this.game.world.addAt(worker, 2);
      worker.anchor.setTo(0.5, 0.5);
      worker.animations.add('left-idle',   [ 'left0000', 'left0001' ], 2, true);
      worker.animations.add('right-idle',  [ 'right0000', 'right0001' ], 2, true);
      worker.animations.add('up-idle',     [ 'up0000', 'up0001' ], 2, true);
      worker.animations.add('down-idle',   [ 'down0000', 'down0001' ], 2, true);
      worker.animations.add('left-walk',   [ 'left0002', 'left0003' ], 4, true);
      worker.animations.add('right-walk',  [ 'right0002', 'right0003' ], 4, true);
      worker.animations.add('up-walk',     [ 'up0002', 'up0003' ], 4, true);
      worker.animations.add('down-walk',   [ 'down0002', 'down0003' ], 4, true);
      worker.addComponent(new Work(this.game, this.jobList));
      worker.addComponent(new Walk(this.game, this.level));
      worker.changeState('idle');
      //worker.body.setCollisionGroup(this.workerCollisionGroup);
      //worker.body.collides([ this.level.collisionGroup, this.playerCollisionGroup, this.workerCollisionGroup ]);
      this.denizens.addTo(worker, 'workers');
    }
  }

  /**
   *  Setup Input
   */
  setupKeyboard () {


  }



}
