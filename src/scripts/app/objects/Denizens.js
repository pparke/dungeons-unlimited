/*
 * Denizens
 */
import Mobile from './Mobile';

class Denizens extends Phaser.Group {

  constructor (game, ... args) {
    super(game, ... args);

    //this.parent   = parent;
    //this.level    = level;

    this.workers  = this.game.add.group();
    this.add(this.workers);
    this.monsters = this.game.add.group();
    this.add(this.monsters);
  }

  /**
     Add To
     Add a mob to one of the sub groups. The mob will
     also be added as a child of this group for easy
     access to all mobs.
     @param {Mobile} mob - the mob to add
     @param {string} group - the group to add it to
   */
  addTo (mob, group) {
    if (!this[group]) {
      throw new Error('[Denizens::addTo] incorrect group name given');
    }

    this[group].add(mob);

    return this;
  }

  /**
     Move
     Move one or more mobs to another group.
     @param {Array} mobs - the mobs to move
     @param {string} fromGroup - the group to move them out of
     @param {string} toGroup - the group to move them into
   */
  move (mobs, fromGroup, toGroup) {
    if (!Array.isArray(mobs)) {
      mobs = [mobs];
    }

    if (!this[fromGroup] || this[toGroup]) {
      throw new Error('[Denizens::move] incorrect group name given');
    }
    // remove
    mobs.forEach((mob) => {
      this[fromGroup].remove(mob);
      this[toGroup].add(mob);
    });

    return this;
  }

  /**
     Get all the mobs within the given rectangle.
     @param {Phaser.Rectangle} rect - the rectangle to test against
     @return {Array} an array containing any mobs within the rect
   */
  getMobs (rect) {
    let mobs = [];
    // for each of the groups of mobs
    this.children.forEach((child) => {
      // for each of the children in the group that are alive
      child.forEachAlive((mob) => {
        // only consider mobs
        if (mob instanceof Mobile) {
          // test if they are within the selection area
          if (rect.contains(mob.position.x, mob.position.y)) {
            mobs.push(mob);
          }
        }
      }, this);
    });

    return mobs;
  }

}


export default Denizens;
