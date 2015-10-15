/**
   Work
   @class
 */
import Base from './Base';

class Walk extends Base {

 constructor (game, level) {
   super(game);

   this.name          = 'Walk';
   this.level         = level;
   this.path          = [];
   this.step          = 0;
   this.destination   = null;
   this.speed         = 500;
   this.ease          = Phaser.Easing.Linear.None;
   this.moving        = false;
   this.onComplete    = null;
 }

 /**
    After Target
    Perform any operations needed after target is set.
    @override
  */
 afterTarget () {
   this.addEvent('walk');
   this.addEvent('step');
   // listen for walk events
   this.subscribe('walk', this.walkPath, this);
   this.subscribe('step', this.stepForward, this);
 }

 /**
    Walk Path
    Sets the path and destination and begins the chain of movements
    along that path.
    @param {array} path - an array containing the sequence of tiles to travel
    @param {Phaser.Tile} destination - the destination tile
  */
 walkPath (path, destination, onComplete) {
   console.log('%s Component received walk command, destination:', this.name, destination);
   this.target.changeState('walk');
   this.path = path;
   this.destination = destination;
   this.onComplete = onComplete;
   this.step = 0;
   if (path.length === 0) {
     return this.arrived();
   }
   /*
   let currentTile = this.level.tileAt(this.target.x, this.target.y);
   let nextTile = this.path[this.step];
   if (currentTile !== nextTile) {
     let tween = this.game.add.tween(this.target).to( {x: nextTile.worldX + nextTile.centerX, y: nextTile.worldY + nextTile.centerY}, this.speed, this.ease, true);
     tween.onComplete.addOnce(this.stepForward, this);
   }
   else {
     this.stepForward();
   }
   */
 }

 /**
    Step Forward
    Increments the step and starts the next movement, also sets recursive
    callback if the end of the path has not been reached yet.
  */
 stepForward () {
   if (this.moving) {
     return;
   }
   else if (this.step < this.path.length) {
     this.moving = true;
     let tile = this.path[this.step];
     let tween = this.game.add.tween(this.target)
      .to( {x: tile.worldX + tile.centerX, y: tile.worldY + tile.centerY}, this.speed, this.ease, true);
     tween.onComplete.addOnce(() => { this.moving = false; }, this);
     this.step += 1;
   }
   else {
     return this.arrived();
   }
 }

 arrived () {
   this.publish(this.onComplete);
 }

}

export default Walk;
