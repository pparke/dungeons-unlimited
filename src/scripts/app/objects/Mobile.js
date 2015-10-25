/*
 * Mobile
 */

class Mobile extends Phaser.Sprite {

  constructor (game, ... args) {
    super(game, ... args);

    this.speed   = {
      walk: 50,
      run: 80
    };
    this.heading        = 0;
    this.direction      = {
      x: 0,
      y: 1
    };
    this.currentState   = null;
    this.states         = {};
    this.components     = {};

    //this.setupPhysics();
  }

  setupPhysics () {
    // enable physics on the player
    this.game.physics.p2.enable(this, true);
    // collide with world bounds
    this.body.collideWorldBounds = true;
  }

  addStates (...states) {
    if (states.length > 0) {
      Object.assign(this.states, ...states);
    }
  }

  /**
     Add Component
     Add a component to the mob.
     @param {Component.Base} component - the component to add
     @return {Component.Base} the component that was added
   */
  addComponent (component) {
    // save a reference to the component
    this.components[component.name] = component;
    // initialize the component
    this.components[component.name].setTarget(this);

    return component;
  }


  /**
     Change State
     Checks to see if changing to a new state,
     checks if it was given a valid state,
     calls leave on current state if there is one,
     sets state and calls enter on it

     @param {string} state - the state to change to
     @param {multiple} args - additional arguments to pass to the state on enter
   */
  changeState (state, ...args) {
    /*
    if (state === this.currentState) {
      return;
    }*/

    if (!state || !this.states[state]) {
      console.log('invalid state');
      return;
    }

    if (this.currentState && this.states[this.currentState]) {
      this.states[this.currentState].leave(this);
    }

    this.currentState = state;
    this.states[this.currentState].enter(this, ...args);
  }

  /**
     Get Rect
     Gets a rectangle describing the current position of the mob.
   */
  getRect () {
    return new Phaser.Rectangle(this.x, this.y, this.width, this.height);
  }


  /**
     Update
     Updates the current state if there is one
   */
  update () {
    // update current state
    let state = this.states[this.currentState];
    if (state && state.update) {
      state.update(this);
    }
  }


}

export default Mobile;
