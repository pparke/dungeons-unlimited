
import Block from '../objects/Block';

export default {
  type:       'general',
  name:       'Wall',
  blocks:     [],
  increment:  34,
  action: {
    begin (block) {
      this.emitter = this.game.add.emitter(block.middleX, block.middleY);
      this.emitter.makeParticles('dust');
      this.emitter.setRotation(0, 0);
      this.emitter.setAlpha(0.3, 0.8);
      this.emitter.setScale(0.5, 1);
      this.emitter.gravity = -2;
    },

    perform (block) {
      // explode, lifetime, n/a, num particles
      this.emitter.start(true, 500, null, 10);
    },

    finish (block) {
      this.emitter.kill();
      this.emitter.destroy();
      console.log(this.parent.level.addWall(block.x, block.y, 1, 1));
    }
  },

  test (block) {
    let wall = Block.getWall(block);
    if (wall.index === -1) {
      return true;
    }
    return false;
  }
};
