/*
 * Pane
 */


class Pane extends Phaser.Group {

  constructor (game, ... args) {
    super(game, ... args);

    this.layout = {};

    this.entries = [];
    this.items = new Map();

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
      upperCaseOnly: false,
    };

    // button styles
    this.buttonKeys = {
      image: 'GUI',
      inventory: {
        over: 'inventoryOver',
        out: 'inventoryOut',
        down: 'inventoryDown'
      }
    }

  }

  setupButtons (elems) {
    let container = this.layout.items.container;
    let element = this.layout.items.element;
    let numCols = Math.floor(container.width / (element.width + element.padding*2));
    elems.forEach((elem, i) => {
      let item = elem.item;
      let row = Math.floor(this.items.size / numCols);
      let col = this.items.size % numCols;
      let x = (col * element.width) + container.x + element.padding*2*col+element.padding;
      let y = (row * element.height) + container.y + element.padding*2*row+element.padding;
      console.log(item)
      let button  = this.createButton(x, y, elem.action, elem.context);
      let centerX = button.x + button.width/2;
      let centerY = button.y + button.height/2;
      let text    = this.createText(centerX, centerY + button.height/2 + this.font.height/2, item.name);
      let icon    = this.createIcon(centerX, centerY, item.key, item.frame);
      this.items.set(item.name, { button: button, text: text, icon: icon });
    });
  }

  /**
     Create Button
     Creates an item in the pane along with any specified icon or text.
   */
  createButton (x, y, action, context, icon, text, buttonKey='inventory') {
    let button = this.game.add.button(x, y, this.buttonKeys.image, action, context, this.buttonKeys[buttonKey].over, this.buttonKeys[buttonKey].out, this.buttonKeys[buttonKey].down);
    this.add(button);
    button.fixedToCamera = true;
    return button;
  }

  /**
     Create Text
   */
  createText (x, y, text) {
    // create the label for the button
    let label = this.game.add.retroFont(this.font.key, this.font.width, this.font.height, this.font.chars, this.font.charsPerRow, this.font.xSpacing, this.font.ySpacing, this.font.xOffset, this.font.yOffset);
    // this font supports lowercase chars
    label.autoUpperCase = this.font.upperCaseOnly;
    label.text = text;
    label.fixedToCamera = true;

    let image = this.game.add.image(x, y , label);
    image.anchor.set(0.5, 0.5);
    image.fixedToCamera = true;
    this.add(image);
    return { lable: label, image: image };
  }

  /**
     Create Icon
   */
  createIcon (x, y, key, frame) {
    let icon = this.game.add.sprite(x, y, key, frame);
    icon.anchor.set(0.5, 0.5);
    icon.fixedToCamera = true;
    this.add(icon);
    return icon;
  }

  /**
     Add Text
     Revives or creates a new text entry, sets it's text and positions it.
     @param {string} text - the text to display
     @param {number} x - the x position of the text
     @param {number} y - the y position of the text
   */
  addText (text, x, y) {
    // get the first dead entry
    let entry;
    this.entries.some((e) => {
      if (!e.image.alive) {
        entry = e;
        return true;
      }
      return false;
    });

    if (!entry) {
      entry = this.createText(text, x, y);
    }
    else {
      entry.label.text = text;
      entry.image.x = x;
      entry.image.y = y;
      entry.image.revive();
    }
  }

  /**
     Create Entry
     Create a new text entry with the given text and at the given position.
     @param {string} text - the text to display
     @param {number} centerX - the x position
     @param {number} centerY - the y position
     @return {object} the created entry
   */
  createEntry (text, centerX, centerY) {
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
    let entry = {};
    entry['label'] = label;
    let image = this.game.add.image(centerX, centerY, label);
    image.fixedToCamera = true;
    image.anchor.set(0.5, 0.5);
    entry['image'] = image;
    this.add(image);
    this.entries.push(entry);
    return entry;
  }
}


export default Pane;
