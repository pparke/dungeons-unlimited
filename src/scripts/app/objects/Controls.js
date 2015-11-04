/**
   Controls
   @class
*/
import SelectBox  from './SelectBox';
import Menu       from './Menu';
import Sidebar    from './sidebar/Sidebar';
import Meters     from './Meters';
import Block      from './Block';

import * as jobCommands from '../commands/commands';

class Controls {
  constructor (game, level, jobList, denizens, ...args) {
    this.game     = game;
    this.level    = level;
    this.jobList  = jobList;
    this.denizens = denizens;

    this.tileArea = new Phaser.Rectangle(0, 0, this.level.displayWidth, this.level.displayHeight);

    // add the selection graphics
    this.selection = new SelectBox(this.game, 0, 0);
    this.game.add.existing(this.selection);

    this.selectionModes = [ 'job', 'info' ];
    this.selectionMode  = 'job';
    this.currentItem    = 'pot';
    this.jobCommands    = jobCommands;
    this._jobCommand     = 'dig';
    this.menu           = new Menu(this.game);
    this.sidebar        = new Sidebar(this.game);
    this.meterPane      = new Meters(this.game);

    this.meterPane.createMeter(0, 0, 'crazyGoat', 'Red');
    this.meterPane.createMeter(0, 0, 'snake', 'Blue');
    this.meterPane.createMeter(0, 0, 'eagle', 'Snot');
    this.meterPane.createMeter(0, 0, 'ram', 'Blood');

    this.inputKeys = {
      w:      this.game.input.keyboard.addKey(Phaser.Keyboard.W),
      a:      this.game.input.keyboard.addKey(Phaser.Keyboard.A),
      s:      this.game.input.keyboard.addKey(Phaser.Keyboard.S),
      d:      this.game.input.keyboard.addKey(Phaser.Keyboard.D),
      i:      this.game.input.keyboard.addKey(Phaser.Keyboard.I),
      j:      this.game.input.keyboard.addKey(Phaser.Keyboard.J),
      up:     this.game.input.keyboard.addKey(Phaser.Keyboard.UP),
      down:   this.game.input.keyboard.addKey(Phaser.Keyboard.DOWN),
      left:   this.game.input.keyboard.addKey(Phaser.Keyboard.LEFT),
      right:  this.game.input.keyboard.addKey(Phaser.Keyboard.RIGHT)
    };

    this.keyMap = {
      up:     'w',
      down:   's',
      left:   'a',
      right:  'd',
      job:    'j',
      info:   'i'
    };

    // setup key bindings
    this.setupKeys();


    // setup the menu
    this.setupMenu();
    this.setupSidebar();
    this.setupMouse();
  }

  update () {
    this.pollKeys();
  }

  //---------------------------------------------------------------------------

  /**
     Setup Keys
     Set up the key callbacks
   */
  setupKeys () {
    this.inputKeys[this.keyMap['job']].onDown.add(() => {
      this.selectionMode = 'job';
    });

    this.inputKeys[this.keyMap['info']].onDown.add(() => {
      this.selectionMode = 'info';
    });
  }

  /**
     Setup Menu
     Set up the right click menu
   */
  setupMenu () {
    let dy = 17;
    // create buttons for the action categories
    this.menu.createButton(24, 0, () => this.selectionMode = 'info', this, null, 'info');
    this.menu.createButton(41, 0, () => this.selectionMode = 'job', this, null, 'job');
    // create buttons for each command
    for (let key of Object.keys(this.jobCommands)) {
      let button = this.menu.createButton(0, dy, () => this.jobCommand = key, this, this.jobCommands[key].name);
      dy += button.height + 1;
    }
    // set the hit area for the menu
    this.menu.calculateHitArea();
    // menu is closed by default
    this.menu.hideMenu();
  }

  /**
     Setup Sidebar
   */
  setupSidebar () {
    let bgWidth = this.sidebar.background.width;
    let bgHeight = this.sidebar.background.height;
    let pane = this.sidebar.createPane('placeItems', {
      lineSpacing: 16,
      title:      { x: 0.5 * bgWidth, y: 0.05 * bgHeight },
      items:      {
        container: {
          x: 0.05 * bgWidth,
          y: 0.2 * bgHeight,
          width: bgWidth,
          height: bgHeight - 64
        },
        element: {
          width: 32,
          height: 32,
          padding: 12,
          buttonKey: 'inventory'
        }
      }
    });

    pane.setupItems([
      {
        name: 'pot',
        action () {
          console.log('clicked')
        },
        context: this,
        key: 'objects',
        frame: 'pot',
        text: 'Pot'
      },
      {
        name: 'chest',
        action () {
          console.log('clicked')
        },
        context: this,
        key: 'objects',
        frame: 'chest',
        text: 'Chest'
      },
      {
        name: 'goldLarge',
        action () {
          console.log('clicked')
        },
        context: this,
        key: 'objects',
        frame: 'goldLarge',
        text: 'Gold'
      },
      {
        name: 'gems',
        action () {
          console.log('clicked')
        },
        context: this,
        key: 'objects',
        frame: 'gems',
        text: 'Gems'
      },
      {
        name: 'sign',
        action () {
          console.log('clicked')
        },
        context: this,
        key: 'objects',
        frame: 'sign',
        text: 'Sign'
      }
    ])
  }

  /**
     Setup Mouse
   */
  setupMouse () {
    this.game.input.onDown.add(function (pointer, mouseEvent) {
      if (this.menu.open) {
        if (pointer.leftButton.isDown) {
          this.menu.hideMenu();
        }
        else if (pointer.rightButton.isDown) {
        }
      }
      // if the click was within the tile area
      else if (Phaser.Rectangle.containsPoint(this.tileArea, pointer.position)) {
        if (pointer.leftButton.isDown && pointer.rightButton.isUp) {
          // call the clicked event on the select box to begin
          // the selection process
          if (this.selectionMode === 'info') {
            this.selection.clicked(pointer, { width: 16, height: 16 });
          }
          else {
            this.selection.clicked(pointer);
          }
        }
        else if (pointer.leftButton.isDown && pointer.rightButton.isDown) {
          this.selection.cancel();
        }
        else if (pointer.rightButton.isDown) {
          this.menu.showMenu(pointer.worldX, pointer.worldY);
        }
      }
    }, this);

    // add handler for when the select box detects that the mouse
    // has been released and the selection is complete
    this.selection.events.onReleased.add( this.onReleased, this);
  }

  /**
     On Released
     The callback that handles the release event from the mouse
     @param {Phaser.Rectangle} rect - the selected area
   */
  onReleased (rect) {
    let blocks  = this.level.getBlocks(rect.x, rect.y, rect.width, rect.height);
    let mobs    = this.denizens.getMobs(this.level.getWorldRect(rect));

    console.log('mobs', mobs)

    if (blocks.length === 0) {
      return;
    }

    switch (this.selectionMode) {
    case 'job':
      this.assignJob(blocks, mobs);
      break;

    case 'info':
      this.getInfo(blocks[0], mobs[0]);
      break;
    }
  }

  /**
     Set Job Command
     Sets up the current job command and opens any required menus or ui elements.
     @param {string} key - the command key as it appears in the jobCommands map
   */
  set jobCommand (key) {
    this._jobCommand = key
  }

  get jobCommand () {
    return this._jobCommand;
  }

  /**
     Assign Job
     Add a job command to the job list.
     @param {array} blocks - the array of blocks to apply the job to
     @param {array} mobs - the array of mobs to apply the job to
   */
  assignJob (blocks, mobs) {
    let command = this.jobCommands[this.jobCommand];
    // filter blocks based on job requirements
    command.blocks = blocks.filter(command.test);

    // TODO: load contextual select menu in sidebar for jobs that need it

    // only add job if there are blocks to work on
    if (command.blocks.length > 0) {
      let job = this.jobList.addJob(command);
    }
  }

  /**
     Get Info
     TODO: get working with new sidebar
     Get information about the selected blocks.
     @param {Block} block - the block to examine
     @param {Mobile} mob - the mob to examine
   */
  getInfo (block={}, mob={}) {
    this.sidebar.setDetails({
      name:       mob.name || '',
      blockType:  block.name || '',
      position:   `${block.x} ${block.y}`,
      stats:      mob.attributes || {}
    });
    console.log(Block.getWall(block));
  }

  /**
     Poll Keys
   */
  pollKeys () {
    // camera movement
    if (this.inputKeys.w.isDown) {
      this.game.camera.y -= 4;
    }
    else if (this.inputKeys.s.isDown) {
      this.game.camera.y += 4;
    }
    if (this.inputKeys.d.isDown) {
      this.game.camera.x += 4;
    }
    else if (this.inputKeys.a.isDown) {
      this.game.camera.x -= 4;
    }
  }

  /**
     Poll Cursors
   */
  pollCursors () {
    if (this.cursors.up.isDown) {
    }
    else if (this.cursors.down.isDown) {
    }
    else if (this.cursors.left.isDown) {
    }
    else if (this.cursors.right.isDown) {
    }
  }

}

export default Controls;
