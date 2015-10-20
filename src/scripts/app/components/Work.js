/**
   Work
   @class
 */
import Base from './Base';

class Work extends Base {

 constructor (game, jobList) {
   super(game);

   this.name            = 'Work';
   this.jobList         = jobList;
   this.currentJob      = null;
   this.workingBlock     = null;
   this.workSpeed       = 500;
   this.working         = false;
   this.jobSearchSpeed  = 1000;
   this.lookingForJob   = false;

 }

 /**
    After Target
    Perform any operations needed after target is set.
    @override
  */
 afterTarget () {
   // add a jobs array to the target
   this.target.jobs = [];
   this.addEvent('idle');
   this.addEvent('arrived');
   this.addEvent('work');
   // listen for idle events
   this.subscribe('idle', this.findWork, this);
   this.subscribe('arrived', this.arrivedAtJob, this);
   this.subscribe('work', this.performWork, this);
 }

 /**
    Find Work
    Find a new job that the target of this component can perform.
  */
 findWork () {
   if (this.lookingForJob) {
     return;
   }

   let job = this.jobList.getJob({
     type: this.target.profession,
     tools: this.target.inventory.tools
   });

   if (job) {
     console.log('%s Component found job %s %s', this.name, job.name, job.type);
     // get the path to the job
     this.walkToJob(job);
   }
   else {
     console.log('%s Component failed to find job', this.name);
     // set cooldown period between looking for jobs
     this.lookingForJob = true;
     this.game.time.events.add(this.jobSearchSpeed, () => { this.lookingForJob = false; });
   }
 }

 /**
    Walk to Job
    Find a path to the provided job and send signal to begin moving
    to the site.  If a path can't be found, return the job to the list.
    @param {Job} job - the job to move to
  */
 walkToJob (job) {
   let search = job.locate(this.target.position.x, this.target.position.y);
   if (search.success) {
     this.currentJob = job;
     this.publish('walk', search.path, search.destination, 'arrived');
   }
   else {
     console.log('No path to job');
     console.log('job', job)
     this.jobList.returnJob(job);
     this.currentJob = null;
     this.target.changeState('idle');
     // TODO: look for new job?
   }
 }

 /**
    Arrived At Job
    Change state to work and begin the job.
  */
 arrivedAtJob () {
   console.log('arrived at job')
   this.target.changeState('work');
   // if the job hasn't been started, start it
   if (!this.currentJob.started) {
     this.currentJob.begin();
   }
   // get a new tile to work on
   this.getNewTile();
 }

 /**
    Get New Tile
    Gets a new tile from the surrounding tiles that are part of
    the job and assigns it to workingBlock
  */
 getNewTile () {
   // get the first accessible tile in the job
   let block = this.currentJob.touching(this.target.x, this.target.y)[0];

   if (block) {
     this.workingBlock = block;
   }
   // if there is no tile within range
   else {
     this.walkToJob(this.currentJob);
   }
 }

 /**
    Perform Work
    Performs the current job
 */
  performWork () {
    if (this.working) {
      return;
    }
    else if (!this.currentJob) {
      console.log('No current job.');
      this.target.changeState('idle');
      return;
    }
    // if the current job has been started and is not complete
    else if (this.currentJob.started && !this.currentJob.complete) {
      this.working = true;

      let taskDone = this.currentJob.work(this.workingBlock);

      if (!taskDone) {
        // continue working
        this.game.time.events.add(this.workSpeed, () => { this.working = false; });
      }
      else {
        this.working = false;
        this.getNewTile();
      }
    }
    else if (this.currentJob.complete) {
      console.log('Job Complete');
      this.target.changeState('idle');
    }
  }
}

export default Work;
