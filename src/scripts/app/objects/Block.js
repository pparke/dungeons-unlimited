/**
  Block
  @class
  @param {object} game - the game object
  @param {Level} level - reference to the level this block is in
  @param {number} x - the x coordinate of the block in tiles
  @param {number} y - the y coordinate of the block in tiles
*/
class Block {
  constructor (game, level, x, y, ...args) {
    this.game     = game;
    this.level    = level;
    this.name     = 'Block';
    this.x        = x;
    this.y        = y;
    this.width    = this.level.tileWidth;
    this.height   = this.level.tileHeight;
    this.worldX   = x * this.level.tileWidth;
    this.worldY   = y * this.level.tileHeight;
    this.middleX  = this.worldX + this.level.tileWidth / 2;
    this.middleY  = this.worldY + this.level.tileHeight / 2;
    this.mineral  = 'stone';
    this.items  = [];
    this.medium   = {
      type: 'air',
      volume: 10
    };
  }

  static getFloor (block) {
    return block.level.getTile(block.x, block.y, 'floors', true);
  }

  static getWall (block) {
    return block.level.getTile(block.x, block.y, 'walls', true);
  }

  static isPassable (block) {
    return Block.getWall(block).index === -1;
  }
}

export default Block;
