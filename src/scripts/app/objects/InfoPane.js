/*
 * InfoPane
 */


class InfoPane extends Phaser.Group {

  constructor (game, ... args) {
    super(game, ... args);

    this.open       = false;
    this.background = null;

    this.details = {
      position:   { label: null, x: 0.15, y: 0.05 },
      name:       { label: null, x: 0.5,  y: 0.05 },
      blockType:  { label: null, x: 0.85, y: 0.05 },
    };

    // font settings
    this.font = {
      key: 'menuFont',
      width: 8,
      height: 9,
      chars: '!\"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{ | }~',
      charsPerRow: 94,
      xSpacing: 1,
      ySpacing: 0,
      xOffset: 0,
      yOffset: 0,
      upperCaseOnly: false
    };

    this.init();
    this.setupDetails();
  }

  init () {
    this.background = this.game.add.image(0, 0, 'infoPane');
    this.background.fixedToCamera = true;
    this.add(this.background);
    this.x = this.game.width;
    this.callAll('kill');
  }

  setupDetails () {
    for (let key of Object.keys(this.details)) {
      let value = this.details[key];
      this.createText(key, key, value.x, value.y);
    }
  }

  setupButtons () {
    // TODO: add close button and others, separate createButton from Menu so it can be used here
  }

  createText (key, text, centerX, centerY) {
    // convert from percent to coords
    if (centerX % 1 !== 0) {
      centerX = this.background.width * centerX;
    }
    if (centerY % 1 !== 0) {
      centerY = this.background.height * centerY;
    }
    // create the label
    let label = this.game.add.retroFont(this.font.key, this.font.width, this.font.height, this.font.chars, this.font.charsPerRow, this.font.xSpacing, this.font.ySpacing, this.font.xOffset, this.font.yOffset);
    // this font supports lowercase chars
    label.autoUpperCase = this.font.upperCaseOnly;
    label.text = text;
    this.details[key].label = label;
    let image = this.game.add.image(centerX, centerY, label);
    image.fixedToCamera = true;
    image.anchor.set(0.5, 0.5);
    this.add(image);
  }

  setDetails (details) {
    console.log(details)
    for (let key of Object.keys(details)) {
      console.log(key)
      if (this.details[key]) {
        let value = details[key];
        console.log(value)
        console.log(this.details[key])
        this.details[key].label.text = value;
        console.log('done setting')
      }
    }
  }

  /**
     Show Pane
     Move pane onto screen
   */
  showPane () {
    console.log('show pane')
    this.open = true;
    this.callAll('revive');
    let xpos = this.game.width - this.background.width;
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
