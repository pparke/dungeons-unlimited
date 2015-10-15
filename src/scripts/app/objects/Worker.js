/*
 * Worker
 */
import Mobile from './Mobile';
import PriorityQueue from '../util/PriorityQueue';

class Worker extends Mobile {

  constructor (game, ... args) {
    super(game, ... args);

    this.smoothed     = false;
    this.facing       = 'down';
    this.direction.x  = 0;
    this.direction.y  = 1;
    this.priorities   = new PriorityQueue();
    this.wants        = [];
    this.needs        = [];
    this.likes        = [];
    this.dislikes     = [];
    this.profession   = 'general';
    this.inventory    = {
      tools: []
    };
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
    //lastDispatch: 0,
    //signalRate: 1000,

    enter (self) {
      let facing = self.facing;
      let key = this.animKey;
      self.animations.play(`${facing}-${key}`);
      //self.body.velocity.x = 0;
      //self.body.velocity.y = 0;
      // notify listeners of idle state
      //self.events.idle.dispatch();
      //this.lastDispatch = new Date().getTime();
    },

    update (self) {
      //let now = new Date().getTime();
      //if (now > this.lastDispatch + this.signalRate) {
        self.events.idle.dispatch();
        //this.lastDispatch = new Date().getTime();
      //}
    },

    leave (self) {
      self.animations.stop();
    }
  },

  work: {
    animKey: 'idle',

    enter (self) {
      let facing = self.facing;
      let key = this.animKey;
      self.animations.play(`${facing}-${key}`);
    },

    update (self) {
      self.events.work.dispatch();
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
      self.events.step.dispatch();
      //self.body.velocity.x = self.direction.x * self.speed.walk;
      //self.body.velocity.y = self.direction.y * self.speed.walk;
    },

    leave (self) {
      self.animations.stop();
    }
  }
};


export default Worker;
