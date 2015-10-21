/*
 * InfoPane
 */


class InfoPane extends Phaser.Group {

  constructor (game, ... args) {
    super(game, ... args);

    this.open       = false;
    this.background = null;
    this.init();
  }

  init () {
    this.background = this.game.add.image(0, 0, 'infoPane');
    this.width = this.background.width;
    this.add(this.background);
    this.x = this.game.width;
    this.callAll('kill');
  }

  /**
     Show Pane
     Move pane onto screen
   */
  showPane () {
    console.log('show pane')
    this.open = true;
    this.callAll('revive');
    let xpos = this.game.width - this.width;
    this.game.add.tween(this).to( { x: xpos }, 500, 'Linear', true);
    console.log(this)
  }

  /**
     Hide Pane
   */
  hidePane () {
    this.open = false;
    let xpos = this.game.width;
    this.game.add.tween(this).to( { x: xpos }, 500, 'Linear', true);
    this.callAll('kill');
  }


}


export default InfoPane;
