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
    job.graphics = this.highlight(Array.from(job.blocks.keys()), 0xffff00);
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
     Highlight the blocks provided with the given color.

     @param {array} blocks - the blocks to highlight
     @param {string|number} color - the color to highlight in
     @return {Phaser.Graphics} the graphics object that was created
  */
  highlight (blocks, color) {
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
    let g = this.game.add.graphics(topLeft.worldX, topLeft.worldY);
    g.lineStyle(0, color, this.hlAlpha);
    g.beginFill(color, this.hlAlpha);
    blocks.forEach((block) => {
      let x = (block.x - topLeft.x) * block.width;
      let y = (block.y - topLeft.y) * block.height;
      g.drawRect(x, y, block.width, block.height);
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

    this.blocks = new Map();
    options.blocks.forEach((block) => {
      this.blocks.set(block, {
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
  work (block, ...args) {
    let task = this.blocks.get(block);
    if (!task) {
      console.log('task not found, block:', block)
      return;
    }
    // if started and not complete
    if (task.started && task.progress < 100) {
      task.progress += this.increment;
      if (this.action.perform) {
        this.action.perform.call(this, block, ...args);
      }
    }
    // if not started
    else if (!task.started) {
      task.started = true;
      if (this.action.begin) {
        this.action.begin.call(this, block, ...args);
      }
    }
    // if complete
    else if (!task.complete && task.progress >= 100) {
      task.complete = true;

      if (this.action.finish) {
        this.action.finish.call(this, block, ...args);
      }

      // check if there are any more tasks to do
      let jobDone= !Array.from(this.blocks.values()).some((val) => {
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
    let start = this.parent.level.blockAt(x, y);

    let blocks = Array.from(this.blocks.entries());
    // eliminate blocks that are complete
    blocks = blocks.map((entry) => {
      if (entry[1].complete) {
        return undefined;
      }
      return entry[0];
    }).filter((key) => {
      return key !== undefined;
    });

    // if there are no blocks left in the job, bail
    if (blocks.length === 0) {
      return { success: false, path: [], destination: null };
    }

    // then eliminate any blocks that are inaccessible
    blocks = blocks.filter((block) => {
      return this.parent.level.isAccessible(block.x, block.y);
    });

    // completely inaccessible, bail
    if (blocks.length === 0) {
      return { success: false, path: [], destination: null };
    }

    // get its passable neighbours
    blocks = blocks.reduce((all, block) => {
      let neighbs = this.parent.level.getBlockSurroundings(block, true, false).filter((t) => {
        return this.parent.level.isPassable(t.x, t.y);
      });
      all = all.concat(neighbs);
      return all;
    }, []);

    // sort the blocks according to distance
    blocks = blocks.sort((a, b) => {
      if (dest.distance(a) < dest.distance(b)) {
        return 1;
      }
      else if (dest.distance(a) > dest.distance(b)) {
        return -1;
      }
      return 0;
    });

    // try to find a route to any of the blocks, return the first found
    let path        = null;
    let destination = null;
    let success = blocks.some((block) => {
      let search = this.parent.astar.search(start, block);
      if (search.success) {
        path        = search.path;
        destination = block;
      }
      return search.success;
    });
    return { success: success, path: path, destination: destination };
  }

  /**
     Get the blocks that are adjacent to the given position and part of the job's
     block property.
     @param {number} x - the x position to start at
     @param {number} y - the y position to start at
     @return {array} an array containing the adjacent blocks
   */
  touching (x, y) {
    // block around which we will check
    let block = this.parent.level.blockAt(x, y);
    // neighbours of the above block
    let neighbs = this.parent.level.getBlockSurroundings(block, true, false);
    // blocks in the job
    let jobBlocks = Array.from(this.blocks.entries());
    // eliminate blocks that are complete
    jobBlocks = jobBlocks.map((entry) => {
      if (entry[1].complete) {
        return undefined;
      }
      return entry[0];
    });
    // check if any of the neighbouring blocks are part of the job
    let blocks = neighbs.filter((block) => {
      return jobBlocks.includes(block);
    });

    return blocks;
  }
}


export default JobList;
