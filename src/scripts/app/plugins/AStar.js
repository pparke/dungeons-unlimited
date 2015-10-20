/*
 * AStar plugin
 */
import PriorityQueue from '../util/PriorityQueue';

class AStar extends Phaser.Plugin {

  constructor (game, parent, map) {
    super(game, parent);
    this.map              = map;
    this.currentHeuristic = 'closestFirst';
    this.graphics         = this.game.add.graphics(0, 0);
    this.debug            = true;

    this.heuristics = {
      // Best First
      bestFirst (a, b) {
        if (!b) {
          return 10000;
        }
        return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
      },

      closestFirst(a, b) {
        if (!b) {
          return 10000;
        }
        return Phaser.Point.distance(a, b);
      }
    };
  }

  /**
     Search
     Performs an a* search for the best path from
     start to goal.
     @param {Block} start - the start block
     @param {Block} goal - the goal block
     @return {Map} the sequence of blocks that make up the path
   */
  search (start, goal) {
    if (!start) { throw new Error('No start specified.'); }
    if (!goal) { throw new Error('No goal specified'); }
    let output = { success: false, path: null, iterations: 0 };
    // if the goal is impassable or inaccessible, bail
    if (!this.map.isPassable(goal.x, goal.y) || !this.map.isAccessible(goal.x, goal.y)) {
      return output;
    }

    this.graphics.clear();

    let frontier = new PriorityQueue();
    frontier.push(start, 0);
    let came_from = new Map();
    let cost_so_far = new Map();
    came_from.set(start, null);
    cost_so_far.set(start, 0);

    while (!frontier.empty() && output.iterations < 10000) {
      output.iterations++;
      let current = frontier.pop();

      // finish if the goal has been found
      if (current === goal) {
        output.success = true;
        if (this.debug) {
          this.markBlock(current, 0xFF0000, 0.3);
        }
        break;
      }
      let neighbs = this.neighbours(current);

      neighbs.forEach((next) => {
        let new_cost = cost_so_far.get(current) + this.cost(current, next);
        // if we haven't visited the block
        if (!came_from.has(next) || new_cost < cost_so_far.get(next)) {
          if (this.debug) {
            this.markBlock(next, 0x00FF00, 0.1);
          }

          // set the cost of the block
          cost_so_far.set(next, new_cost);
          // calculate the priority
          let priority = new_cost + this.heuristics[this.currentHeuristic](goal, next);
          // add the block to the frontier
          frontier.push(next, priority);
          // set the block that we came from to reach this one
          came_from.set(next, current);
        }
      });
    }

    // walk the successful route backwards to
    // generate the path
    if (output.success) {
      let step = goal;
      let path = [];
      while (step !== start) {
        path.unshift(step);
        step = came_from.get(step);
      }
      output.path = path;
    }

    return output;
  }

  /**
     Neighbours
     Returns an array containing the neighbouring blocks.
   */
  neighbours (block) {
    let ret = this.map.getBlockSurroundings(block, true, false);

    return ret.filter((block) => {
      // no block, no go
      if (!block) {
        return false;
      }
      return this.map.isPassable(block.x, block.y);
    });
  }

  /**
     Cost
     Determine the cost of movement from one block to the next.
   */
  cost (a, b) {
    return Phaser.Point.distance(a, b);
  }

  /**
     Mark Block
     Draw a rect over the block.
   */
  markBlock (block, color, alpha) {
    this.graphics.beginFill(color, alpha);
    this.graphics.drawRect(block.worldX, block.worldY, block.width, block.height);
    this.graphics.endFill();
  }
}


export default AStar;
