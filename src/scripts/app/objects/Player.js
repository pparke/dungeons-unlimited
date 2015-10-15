/*
 * Player
 */
import Mobile from './Mobile';

class Player extends Mobile {

  constructor (game, ... args) {
    super(game, ... args);

    this.smoothed     = false;
    this.facing       = 'down';
    this.direction.x  = 0;
    this.direction.y  = 1;
    this.controls     = {};
    this.cursors      = [ 'up', 'down', 'left', 'right' ];
    this.directions   = {
      up:     { x: 0,   y: -1 },
      down:   { x: 0,   y: 1 },
      left:   { x: -1,  y: 0 },
      right:  { x: 1,   y: 0 }
    };

    this.addStates(states);
    //this.modifyPhysics();
  }

  /**
     Moving
     Check if any of the cursors are down, excluding the ones
     specified.
   */
  moving (exclude) {
    let cursors = this.cursors;
    if (exclude) {
      cursors = cursors.filter((dir) => {
        return dir !== exclude;
      });
    }

    // return true if any of the cursors is down
    return cursors.some((dir) => {
      return this.controls[dir].isDown;
    });
  }

  /**
     Set Controls
     Add callbacks to each of the directional controls
     to trigger a change of direction and state.
   */
  setControls (controls) {
    this.controls = controls;
    // setup the directional controls
    this.cursors.forEach((direction) => {
      this.controls[direction].onDown.add((key) => {
        this.facing     = direction;
        this.direction  = this.directions[direction];
        this.changeState('walk');
      });
      this.controls[direction].onUp.add((key) => {
        if (!this.moving()) {
          this.changeState('idle');
        }
      });
    });
  }

  /**
     Modify Physics
     Change the physics settings for this body
   */
  modifyPhysics () {
    this.body.fixedRotation = true;
    this.body.setRectangle(10, 13, -1, 0, 0);
  }


}

var states = {
  idle: {
    animKey: 'idle',

    enter (self) {
      let facing = self.facing;
      let key = this.animKey;
      self.animations.play(`${facing}-${key}`);
      //self.body.velocity.x = 0;
      //self.body.velocity.y = 0;
    },

    update (self) {

    },

    leave (self) {
      self.animations.stop();
    }
  },

  walk: {
    animKey: 'walk',

    enter (self) {
      let facing = self.facing;
      let key = this.animKey;
      self.animations.play(`${facing}-${key}`);
    },

    update (self) {
      self.body.velocity.x = self.direction.x * self.speed.walk;
      self.body.velocity.y = self.direction.y * self.speed.walk;
    },

    leave (self) {
      self.animations.stop();
    }
  }
};

export default Player;
