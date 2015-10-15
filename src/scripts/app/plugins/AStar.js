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
     @param {Phaser.Tile} start - the start tile
     @param {Phaser.Tile} goal - the goal tile
     @return {Map} the sequence of tiles that make up the path
   */
  search (start, goal) {
    if (!start) { throw new Error('No start specified.'); }
    if (!goal) { throw new Error('No goal specified'); }
    let output = { success: false, path: null, iterations: 0 };
    console.log('checking if passable and accessible')
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

    console.log('beginning loop')
    while (!frontier.empty() && output.iterations < 10000) {
      output.iterations++;
      let current = frontier.pop();

      // finish if the goal has been found
      console.log('current and goal', current, goal)
      if (current === goal) {
        output.success = true;
        if (this.debug) {
          this.markTile(current, 0xFF0000, 0.3);
        }
        break;
      }
      let neighbs = this.neighbours(current);

      neighbs.forEach((next) => {
        let new_cost = cost_so_far.get(current) + this.cost(current, next);
        // if we haven't visited the tile
        if (!came_from.has(next) || new_cost < cost_so_far.get(next)) {
          console.log('adding to came from')
          if (this.debug) {
            this.markTile(next, 0x00FF00, 0.1);
          }

          // set the cost of the tile
          cost_so_far.set(next, new_cost);
          // calculate the priority
          let priority = new_cost + this.heuristics[this.currentHeuristic](goal, next);
          // add the tile to the frontier
          frontier.push(next, priority);
          // set the tile that we came from to reach this one
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
     Returns an array containing the neighbouring tiles.
   */
  neighbours (tile) {
    let ret = this.map.getTileSurroundings(tile, true, false);

    return ret.filter((tile) => {
      // no tile, no go
      if (!tile) {
        return false;
      }
      return this.map.isPassable(tile.x, tile.y);
    });
  }

  /**
     Cost
     Determine the cost of movement from one tile to the next.
   */
  cost (a, b) {
    return Phaser.Point.distance(a, b);
  }

  /**
     Mark Tile
     Draw a rect over the tile.
   */
  markTile (tile, color, alpha) {
    this.graphics.beginFill(color, alpha);
    this.graphics.drawRect(tile.worldX, tile.worldY, tile.width, tile.height);
    this.graphics.endFill();
  }
}


export default AStar;
