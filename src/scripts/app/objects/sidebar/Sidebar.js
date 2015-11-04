/**
   Sidebar
   @class
*/

import Pane from './Pane';

class Sidebar extends Phaser.Group {
  constructor (game, ... args) {
    super(game, ... args);

    this.background = null;
    this.panes      = new Map();

    this.init();
    this.calculateHitArea();
  }

  init () {
    this.background = this.game.add.image(0, 0, 'sidebar');
    this.background.fixedToCamera = true;
    this.add(this.background);
    this.x = this.game.width - this.background.width;
  }

  /**
     Calculate Hit Area
   */
  calculateHitArea () {
    this.hitArea = new Phaser.Rectangle(this.x, this.y, this.width, this.height);
  }

  /**
     Create Pane
     Create a new pane with the given name and layout, add it to the map
     and as a member of this group.
   */
  createPane (key, layout) {
    let pane = new Pane(this.game, this);
    pane.layout = layout;

    this.panes.set(key, pane);
    this.add(pane);

    return pane;
  }

  /**
     Show Pane
     Move pane onto screen
   */
  showPane (key) {
    let pane = this.panes.get(key);
    pane.open = true;
    pane.callAll('revive');
    //let xpos = this.game.width - this.background.width;
    //this.game.add.tween(this).to( { x: xpos }, 500, 'Linear', true);
  }

  /**
     Hide Pane
   */
  hidePane (key) {
    let pane = this.panes.get(key);
    pane.open = false;

    //let xpos = this.game.width;
    //this.game.add.tween(this).to( { x: xpos }, 500, 'Linear', true);
    //this.callAll('kill');
  }
}

export default Sidebar;
