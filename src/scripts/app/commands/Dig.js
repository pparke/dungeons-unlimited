
import Block from '../objects/Block';

export default {
  type:       'general',
  name:       'Dig',
  blocks:     [],
  increment:  10,
  maxWorkers: 2,
  action: {
    begin (block) {
      let task = this.blocks.get(block);
      task.emitter = this.getEmitter();
      task.emitter.x = block.middleX;
      task.emitter.y = block.middleY;
      task.emitter.makeParticles('dust');
      task.emitter.setRotation(0, 0);
      task.emitter.setAlpha(0.3, 0.8);
      task.emitter.setScale(0.5, 1);
      task.emitter.gravity = -2;
    },

    perform (block) {
      let task = this.blocks.get(block);
      // explode, lifetime, n/a, num particles
      task.emitter.start(true, 500, null, 10);
    },

    finish (block) {
      let task = this.blocks.get(block);
      task.emitter.kill();
      //this.emitter.destroy();
      this.parent.level.removeWall(block.x, block.y, 1, 1, 'walls', true);
    }
  },

  test (block) {
    let wall = Block.getWall(block);
    if (wall.index > -1) {
      return true;
    }
    return false;
  }
};
