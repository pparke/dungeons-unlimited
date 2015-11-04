/*
 * Meters
 */


class Meters extends Phaser.Group {

  constructor (game, ... args) {
    super(game, ... args);

    this.background   = null;
    this.atlasKey     = 'meters'
    this.meters       = new Map();

    this.numSections  = 3;
    this.colors       = [ 'Red', 'Blue', 'Green', 'Flesh', 'Snot', 'Brown', 'Blood', 'Orange', 'Grey'];
    this.levels       = [ 'full', 'half', 'quarter' ];
    this.containers   = ['soldier', 'wolf', 'unicorn', 'prince', 'snake', 'eagle', 'ram', 'frogBear', 'bull', 'crazyGoat', 'normalGoat'];
    this.offsets      = [0.1, 0.33, 0.64, 0.85];

    this.init();
  }

  init () {
    this.background = this.game.add.image(0, 0, 'meterPane');
    this.background.fixedToCamera = true;
    this.add(this.background);
    this.y = this.game.height - this.background.height+6;
  }

  /**
     Create Meter
     A meter consists of a container and a bar.
   */
  createMeter (x, y, container, color) {
    let bar = [];
    let full = this.levels[0];
    let xOffset = this.offsets[this.meters.size];
    for (let i = 0; i < this.numSections; i++) {
      let section = this.game.add.sprite(x + i*16, y, this.atlasKey, `${full}${color}Bar`, this);
      section.anchor.setTo(0.5, 0.5);
      section.fixedToCamera = true;
      section.cameraOffset.x += this.background.width*xOffset;
      section.cameraOffset.y = this.background.height/2;
      bar.push(section);
      this.add(section);
    }
    let cont = new Phaser.Sprite(this.game, x, y, this.atlasKey, container, color);
    cont.anchor.setTo(0.5, 0.5);
    cont.fixedToCamera = true;
    this.game.world.addAt(cont, 2);
    cont.cameraOffset.x = this.background.width*xOffset;
    cont.cameraOffset.y = this.background.height/2;
    this.add(cont);

    this.meters.set(`${color}${container}`, {
      container:  container,
      color:      color,
      bar:        bar,
      level:      9
    });
  }

  setMeterLevel (key, level) {
    let meter = this.meters.get(key);
    meter.level = level;
    // update the look of the bar
    //let barIndex = Math.floor((this.levels.length*this.numSections)/level);
    //meter.bar[]
  }

}


export default Meters;
