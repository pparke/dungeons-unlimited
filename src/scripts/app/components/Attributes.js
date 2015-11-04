/**
   Attributes
   @class
 */
import Base from './Base';

class Attributes extends Base {

 constructor (game, attrList) {
   super(game);

   this.name = 'Attributes';
   // set the initial attribute keys and their values
   this._values = attrList.map((attr) => {
     return {
       name: attr,
       level: 1,
       progress: 0
     }
   });
 }

 /**
    After Target
    Perform any operations needed after target is set.
    @override
  */
 afterTarget () {
   // add events
   this.addEvent('attribute:level');
   this.addEvent('attribute:buff');
   this.addEvent('attribute:progress');
   // listen for walk events
   this.subscribe('attribute:level', this.level, this);
   this.subscribe('attribute:buff', this.buff, this);
   this.subscribe('attribute:progress', this.progress, this);
   // add local attributes reference
   this.target.attributes = this.values;
 }

 /**
    values
    Returns a map showing the current level of each attribute.
  */
 get values () {
   return this._values.reduce((map, val) => {
     map[val.name] = val.level;
     return map;
   }, {});
 }

 /**
    Level
    Permanently change an attribute
    @param {string} key - the attribute key
    @param {number} change - the amount to increase or decrease by
  */
 level (key, change) {
   this.values[key].level += change;
 }

 /**
    Buff
    Temporarily change an attribute
    @param {string} key - the attribute key
    @param {number} change - the amount to increase or decrease by
    @param {number} duration - the duration of the change
  */
 buff (key, change, duration) {
   this.level(key, change);
   this.game.time.events.add(duration, this.level, this, key, -change);
 }

 /**
    Progress
    Change the progress of an attribute.
    @param {string} key - the attribute key
    @param {number} amount - the amount of progress to change it by
  */
 progress (key, amount) {
   this.values[key].progress += amount;
   if (this.values[key].progress >= 100) {
     this.level(key, 1);
     this.values[key].progress = 0;
   }
 }
}

export default Attributes;
