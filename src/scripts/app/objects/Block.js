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
    this.x        = x;
    this.y        = y;
    this.objects  = [];
    this.medium   = {
      type: 'air',
      volume: 10
    }
  }

  getFloor () {
    return this.level.getTile(this.x, this.y, 'floors', true);
  }

  getWall () {
    return this.level.getTile(this.x, this.y, 'walls', true);
  }

  passable () {
    return this.getWall().index === -1;
  }
}

export default Block;
