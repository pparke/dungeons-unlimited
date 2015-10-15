/*
 * JobList plugin
 */

class JobList extends Phaser.Plugin {

  constructor (game, parent, astar, level) {
    super(game, parent);

    this.astar = astar;
    this.level = level;
    this.list = [];

    this.typeColors = {

    };
    this.hlAlpha    = 0.3;
  }

  init () {
    // TODO: Stub
  }

  update () {
    // TODO: Stub
  }

  /**
     Add Job
     Add a new job to the list

     @param {object} options - the values to set on the job
   */
  addJob (options) {
    let job = new Job(this, options);
    job.graphics = this.highlight(Array.from(job.tiles.keys()), 0xffff00);
    this.list.push(job);
    return job;
  }

  /**
     Get Job
     Get the first job that matches all of the requirements

     @param {string} options.type - the type of job requested
     @param {array} options.tools - the tools required for the job
     @return {Job} the first job found that matches all requirements
   */
  getJob (options) {
    let firstJob = null;
    this.list.some((job, i) => {
      let match = job.type === options.type;
      if (options.tools) {
        // all tools required by the job must be in options.tools
        match = match && job.tools.every((tool) => {
          return options.tools.indexOf(tool) > -1;
        });
      }
      if (match) {
        firstJob = job;
        this.list.splice(i, 1);
      }
      return match;
    });

    return firstJob;
  }

  /**
     Return Job
     Returns a job to the list
     @param {Job} job - the job to add back to the list
   */
  returnJob (job) {
    // only add the job if it's not complete
    if (!job.complete) {
      this.list.push(job);
    }
  }

  /**
     Size
     Return the size of the job list.
     @return {number} size of job list
   */
  size () {
    return this.list.length;
  }

  /**
     Highlight
     Highlight the tiles provided with the given color.

     @param {array} tiles - the tiles to highlight
     @param {string|number} color - the color to highlight in
     @return {Phaser.Graphics} the graphics object that was created
  */
  highlight (tiles, color) {
    if (!Array.isArray(tiles)) {
      tiles = [tiles];
    }

    // get the top leftmost tile
    let topLeft = tiles.reduce((tl, tile) => {
      if (tile.x <= tl.x && tile.y <= tl.y) {
        return tile;
      }
      return tl;
    }, tiles[0]);

    // anchor at the top left most tile
    let g = this.game.add.graphics(topLeft.worldX, topLeft.worldY);
    g.lineStyle(0, color, this.hlAlpha);
    g.beginFill(color, this.hlAlpha);
    tiles.forEach((tile) => {
      let x = (tile.x - topLeft.x) * tile.width;
      let y = (tile.y - topLeft.y) * tile.height;
      g.drawRect(x, y, tile.width, tile.height);
    });

    g.endFill();

    return g;
  }
}

class Job {

  constructor (parent, options) {
    this.parent       = parent;
    this.game         = this.parent.game;
    this.type         = options.type        || 'general';
    this.name         = options.name        || 'idle';
    this.numWorkers   = options.numWorkers  || 1;
    this.maxWorkers   = options.maxWorkers  || 1;
    this.tools        = options.tools       || [];
    this.increment    = options.increment   || 1;
    this.action       = options.action;

    this.complete     = false;
    this.started      = false;
    this.progress     = 0;
    this.start        = 0;
    this.end          = 0;
    this.duration     = 0;
    this.graphics     = null;

    this.tiles = new Map();
    options.tiles.forEach((tile) => {
      this.tiles.set(tile, {
        progress: 0,
        started: false,
        complete: false
      });
    });
  }

  /**
     Begin
     Start the job, mark it as started, and record the start time
   */
  begin () {
    if (!this.started) {
      this.started = true;
      this.start = new Date().getTime();
    }
    else {
      console.warn('This job has already begun', this.type, this.name);
    }
  }

  /**
     Work
   */
  work (tile, ...args) {
    let task = this.tiles.get(tile);
    if (!task) {
      console.log('task not found, tile:', tile)
      return;
    }
    // if started and not complete
    if (task.started && task.progress < 100) {
      task.progress += this.increment;
      if (this.action.perform) {
        this.action.perform.call(this, tile, ...args);
      }
    }
    // if not started
    else if (!task.started) {
      task.started = true;
      if (this.action.begin) {
        this.action.begin.call(this, tile, ...args);
      }
    }
    // if complete
    else if (!task.complete && task.progress >= 100) {
      task.complete = true;

      if (this.action.finish) {
        this.action.finish.call(this, tile, ...args);
      }

      // check if there are any more tasks to do
      let jobDone= !Array.from(this.tiles.values()).some((val) => {
        return !val.complete;
      });

      if (jobDone) {
        this.finish();
      }
    }

    return task.complete;
  }

  /**
     Finish
     Set job to complete, record end time, calculate duration
     and remove highlight graphics.
   */
  finish () {
    if (this.started && !this.complete) {
      this.complete = true;
      this.end = new Date().getTime();
      this.duration = this.end - this.start;
      // clean up graphics
      this.graphics.destroy();

    }
    else if (!this.started) {
      console.warn('This job has not been started yet', this.type, this.name);
    }
    else if (this.complete) {
      console.warn('This job has already finished', this.type, this.name);
    }
  }

  /**
     Locate
     Locate the starting position for the job.

     @param {number} x - the x position to start at
     @param {number} y - the y position to start at
     @return {object} contains keys success and path indicating success of search and the path if there is one
   */
  locate (x, y) {

    let dest = new Phaser.Point(x, y);
    let start = this.parent.level.tileAt(x, y);

    let tiles = Array.from(this.tiles.entries());
    // eliminate tiles that are complete
    tiles = tiles.map((entry) => {
      if (entry[1].complete) {
        return undefined;
      }
      return entry[0];
    }).filter((key) => {
      return key !== undefined;
    });

    // if there are no tiles left in the job, bail
    if (tiles.length === 0) {
      return { success: false, path: [], destination: null };
    }

    // then eliminate any tiles that are inaccessible
    tiles = tiles.filter((tile) => {
      return this.parent.level.isAccessible(tile.x, tile.y);
    });

    // completely inaccessible, bail
    if (tiles.length === 0) {
      return { success: false, path: [], destination: null };
    }

    // get its passable neighbours
    tiles = tiles.reduce((all, tile) => {
      let neighbs = this.parent.level.getTileSurroundings(tile, true, false).filter((t) => {
        return this.parent.level.isPassable(t.x, t.y);
      });
      all = all.concat(neighbs);
      return all;
    }, []);

    // sort the tiles according to distance
    tiles = tiles.sort((a, b) => {
      if (dest.distance(a) < dest.distance(b)) {
        return 1;
      }
      else if (dest.distance(a) > dest.distance(b)) {
        return -1;
      }
      return 0;
    });

    // try to find a route to any of the tiles, return the first found
    let path        = null;
    let destination = null;
    let success = tiles.some((tile) => {
      let search = this.parent.astar.search(start, tile);
      if (search.success) {
        path        = search.path;
        destination = tile;
      }
      return search.success;
    });
    return { success: success, path: path, destination: destination };
  }

  /**
     Get the tiles that are adjacent to the given position and part of the job's
     tile property.
     @param {number} x - the x position to start at
     @param {number} y - the y position to start at
     @return {array} an array containing the adjacent tiles
   */
  touching (x, y) {
    // tile around which we will check
    let tile = this.parent.level.tileAt(x, y);
    // neighbours of the above tile
    let neighbs = this.parent.level.getTileSurroundings(tile, true, false);
    let jobTiles = Array.from(this.tiles.keys());
    // check if any of the neighbouring tiles are part of the job
    let tiles = neighbs.filter((tile) => {
      return jobTiles.includes(tile);
    });

    return tiles;
  }
}


export default JobList;
