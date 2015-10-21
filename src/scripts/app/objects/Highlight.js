/*
 * Highlight
 */


class Highlight extends Phaser.Graphics {

  constructor (game, ... args) {
    super(game, ... args);

    this.defaultColor = 0x00FF00;
    this.defaultAlpha = 1.0;

    this.graphicsMap = new Map();
  }

  /**
     Mark Block
     Draw a rect over a single block.
   */
  markBlock (block, color, alpha) {
    color = color || this.defaultColor;
    alpha = alpha || this.defaultAlpha;

    this.beginFill(color, alpha);
    let data = this.drawShape(new PIXI.Rectangle(block.worldX, block.worldY, block.width, block.height));
    this.endFill();

    this.graphicsMap.set(block, data);
  }

  /**
     Clear Block
     Clear the graphics on a block
     @param {Block} block - the block to clear
   */
  clearBlock (block) {
    if (this.graphicsMap.has(block)) {
      this.dirty = true;
      this.clearDirty = true;

      // the data to remove
      let data = this.graphicsMap.get(block);

      // find the index of the data
      let index;
      this.graphicsData.some((b, i) => {
        if (b === data) {
          index = i;
          return true;
        }
        return false;
      });

      // remove the data
      if (index !== undefined) {
        this.graphicsData.splice(index, 1);
      }
    }
  }

  /**
     Mark All
     Mark all the blocks provided with the given color.

     @param {array} blocks - the blocks to highlight
     @param {string|number} color - the color to highlight in
     @return {Phaser.Graphics} the graphics object that was created
  */
  markAll (blocks, color, alpha) {
    color = color || this.defaultColor;
    alpha = alpha || this.defaultAlpha;

    // make sure we're dealing with an array
    if (!Array.isArray(blocks)) {
      blocks = [blocks];
    }

    // get the top leftmost block
    let topLeft = blocks.reduce((tl, block) => {
      if (block.x <= tl.x && block.y <= tl.y) {
        return block;
      }
      return tl;
    }, blocks[0]);

    // anchor at the top left most block
    this.lineStyle(0, color, alpha);
    this.beginFill(color, alpha);
    blocks.forEach((block) => {
      let data = this.drawShape(new PIXI.Rectangle(block.worldX, block.worldY, block.width, block.height));
      this.graphicsMap.set(block, data);
    });

    this.endFill();

    return this;
  }

}


export default Highlight;
