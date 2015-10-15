/**
   Base
   @class
 */
class Base {
  constructor (game) {
    this.name    = 'Base';
    this.game    = game;
    this.target  = null;
  }

  /**
    Set Target
    Initial setup of the component and target
    @param {object} target - the target the component should use
  */
  setTarget (target) {
    this.target = target;

    this.afterTarget();
  }

  /**
     After Target
     Perform any operations needed after target is set.
   */
  afterTarget () {

  }

  /**
     Update
     Called by the owner of the component.
   */
  update () {

  }

  /**
     Add Event
     Add a new event to the target if it doesn't already exist.
   */
  addEvent (event) {
    if (!this.target.events.hasOwnProperty(event)) {
      this.target.events[event] = new Phaser.Signal();
    }
  }

  /**
   Subscribe
   Subscribe to an event on the target this component is attached to.
   A component should create any Signals necessary on the target when
   it is first attached so that the target acts as a message bus between
   components that belong to it.

   @param {string} event - the key of the desired event
   @param {function} fn - the function to call
   @param {object} context - the context to call the function with
   @param {any} args - any other arguments to be passed to the function
  */
  subscribe (event, fn, context, ...args) {
    if (this.target.events.hasOwnProperty(event)) {
      this.target.events[event].add(fn, context, ...args);
    }
  }

  /**
     Publish
     Publish an event on the target this component is attached to.
     @param {string} event - the key of the event
     @param {any} args - arguments to pass to any listeners
  */
  publish (event, ...args) {
    if (this.target.events.hasOwnProperty(event)) {
      this.target.events[event].dispatch(...args)
    }
  }
}

export default Base;
