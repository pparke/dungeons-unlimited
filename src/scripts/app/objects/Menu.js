/*
 * Menu
 */


class Menu extends Phaser.Group {

  constructor (game, ... args) {
    super(game, ... args);

    this.open = false;

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

    // button styles
    this.buttonKeys = {
      image: 'GUI',
      blue: {
        over: 'blueButtonOver',
        out: 'blueButtonOut',
        down: 'blueButtonDown'
      },
      info: {
        over: 'infoButtonOver',
        out: 'infoButtonOut',
        down: 'infoButtonDown'
      },
      job: {
        over: 'jobButtonOver',
        out: 'jobButtonOut',
        down: 'jobButtonDown'
      }
    }
  }

  /**
     Create Button
   */
  createButton (x, y, action, context, text, key='blue') {
    let button = this.game.add.button(x, y, this.buttonKeys.image, action, context, this.buttonKeys[key].over, this.buttonKeys[key].out, this.buttonKeys[key].down);
    let centerX = button.x + button.width/2;
    let centerY = button.y + button.height/2;
    this.add(button);
    if (text) {
      // create the label for the button
      let label = this.game.add.retroFont(this.font.key, this.font.width, this.font.height, this.font.chars, this.font.charsPerRow, this.font.xSpacing, this.font.ySpacing, this.font.xOffset, this.font.yOffset);
      // this font supports lowercase chars
      label.autoUpperCase = this.font.upperCaseOnly;
      label.text = text;
      let image = this.game.add.image(centerX, centerY, label);
      image.anchor.set(0.5, 0.5);
      this.add(image);
    }

    return button;
  }

  /**
     Calculate Hit Area
   */
  calculateHitArea () {
    this.hitArea = new Phaser.Rectangle(this.x, this.y, this.width, this.height);
  }

  /**
     Show Menu
     Move menu to pointer, show menu
   */
  showMenu (x, y) {
    this.open = true;
    this.x = x;
    this.y = y;
    this.callAll('revive');
    this.hitArea.x = this.x;
    this.hitArea.y = this.y;
  }

  /**
     Hide Menu
   */
  hideMenu () {
    this.open = false;
    this.callAll('kill');
  }

}


export default Menu;
