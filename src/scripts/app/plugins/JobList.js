/*
 * JobList plugin
 */
 import Highlight from '../objects/Highlight';

class JobList extends Phaser.Plugin {

  constructor (game, parent, astar, level) {
    super(game, parent);

    this.astar      = astar;
    this.level      = level;
    this.list       = [];
    this.highlight  = new Highlight(game);

    this.game.add.existing(this.highlight);

    this.typeColors = {

    };
    this.hlAlpha    = 0.3;
  }

  /**
     Add Job
     Add a new job to the list

     @param {object} options - the values to set on the job
   */
  addJob (options) {
    let job = new Job(this, options);
    job.highlight = this.highlight.markAll(Array.from(job.blocks.keys()), 0xffff00, this.hlAlpha);
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
      // make sure the job isn't complete
      if (job.complete) {
        return false;
      }
      // check the job type
      if (job.type !== options.type) {
        return false;
      }
      // check if the maximum number of workers has been reached
      if (job.numWorkers >= job.maxWorkers) {
        return false;
      }
      // make sure a task is available
      if (job.numTasks === 0) {
        return false;
      }
      // check the required tools
      if (options.tools) {
        // all tools required by the job must be in options.tools
        if (!job.tools.every((tool) => { return options.tools.indexOf(tool) > -1; })) {
          return false;
        }
      }
      // we can take the job
      firstJob = job;
      job.numWorkers += 1;
      //this.list.splice(i, 1);
      return true;
    });

    return firstJob;
  }

  /**
     Return Job
     Returns a job to the list
     @param {Job} job - the job to add back to the list
   */
  returnJob (job) {
    job.numWorkers -= 1;
  }

  /**
     Remove Job
     Removes a job from the list
     @param {Job} job - the job to remove
   */
  removeJob (job) {
    let index = this.list.indexOf(job)
    if (index > -1) {
      this.list.splice(index, 1);
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
}

class Job {

  constructor (parent, options) {
    this.parent       = parent;
    this.game         = this.parent.game;
    this.type         = options.type        || 'general';
    this.name         = options.name        || 'idle';
    this.numWorkers   = 0;
    this.numTasks     = 0;
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
    this.highlight    = null;

    this.emitters     = [];

    this.blocks = new Map();
    options.blocks.forEach((block) => {
      // if the block is not already involved in
      // another job, add it to the blocks map
      if (!this.parent.list.some((job) => {
        return job.blocks.has(block);
      })) {
        this.numTasks += 1;
        this.blocks.set(block, {
          progress: 0,
          claimed: false,
          started: false,
          complete: false,
          emitter: null
        });
      }
    });
  }

  /**
     Claim
     Claim a task so that it can be worked on exclusively
     by 1 mob.
     @param {Block} block - the block to claim
   */
  claimTask (block) {
    let task = this.blocks.get(block);
    if (task && !task.claimed) {
      this.numTasks -= 1;
      task.claimed = true;
      return true;
    }
    return false;
  }

  /**
     Get Emitter
     Get the first available emitter or create
     a new one if none are available.
   */
  getEmitter () {
    let emitter;
    // get the first dead emitter
    this.emitters.some((em) => {
      if (!em.alive) {
        console.log('found dead emitter')
        emitter = em;
        // wake it up
        emitter.revive();
        return true;
      }
      return false;
    });

    if (!emitter){
      console.log('creating new emitter')
      // create a new one and add to the pool
      emitter = this.game.add.emitter(0, 0);
      this.emitters.push(emitter);
    }

    return emitter;
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

      // clear the highlight on the block
      this.highlight.clearBlock(block);

      // check if there are any more tasks to do
      let jobDone = !Array.from(this.blocks.values()).some((val) => {
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
      // clean up any emitters that may have been created
      this.emitters.forEach((em) => {
        em.kill();
        em.destroy();
      });
      this.emitters = [];
      // TODO: add job management on JobList to record history and take
      // care of clean up
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

    // eliminate blocks that are claimed or complete
    blocks = blocks.map((entry) => {
      if (entry[1].claimed || entry[1].complete) {
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

    // get its passable neighbours, these are the positions where we can work from
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
    // eliminate blocks that are claimed or complete
    jobBlocks = jobBlocks.map((entry) => {
      if (entry[1].claimed || entry[1].complete) {
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
