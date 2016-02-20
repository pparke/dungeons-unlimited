/*
 * Item
 */
class Item extends Phaser.Sprite {

  constructor (game, ... args) {
    super(game, ... args);

    this.name   = 'Item';
    this.key    = 'objects';
    this.frame  = 'pot';
    this.block  = null;
    this.uuid   = this.game.randomData.uuid();
  }

  /**
     Setup
     Set the items properties.
     @param {object} options - the properties to set
   */
  setup (options) {
    this.name = options.name;
    this.key = options.key;
    this.frame = options.frame;
    this.anchor.setTo(0.5, 0.5);
  }

  /**
     Place
     Place an item at the specified block.  Will add the item to
     the list of items on the block and remove it from it's previous
     block if there is one.
     @param {Item} item - the item to place
     @param {Block} block - the block to place it on
   */
  static place (item, block) {
    // remove from the scene
    item.kill();
    // remove the item from the previous block
    if (item.block) {
      item.block.items = item.block.items.filter((blockItem) => {
        return blockItem.uuid !== item.uuid;
      });
    }

    // set the block reference
    item.block = block;

    item.block.items.push(item);

    // move to the block
    item.position.x = block.middleX;
    item.position.y = block.middleY;

    // add back to the scene
    item.revive();

    console.log(item);
  }

}


export default Item;
