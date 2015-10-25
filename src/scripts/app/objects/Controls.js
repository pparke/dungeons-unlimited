/**
   Controls
   @class
*/
import SelectBox  from './SelectBox';
import Menu       from './Menu';
import InfoPane   from './InfoPane';

class Controls {
  constructor (game, level, jobList, denizens, ...args) {
    this.game     = game;
    this.level    = level;
    this.jobList  = jobList;
    this.denizens = denizens;

    // add the selection graphics
    this.selection = new SelectBox(this.game, 0, 0);
    this.game.add.existing(this.selection);

    this.selectionModes = [ 'job', 'info' ];
    this.selectionMode  = 'job';
    this.jobCommands    = jobCommands;
    this.jobCommand     = 'dig';
    this.menu           = new Menu(this.game);
    this.infoPane       = new InfoPane(this.game);

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
      else {
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
     Assign Job
     Add a job command to the job list.
     @param {array} blocks - the array of blocks to apply the job to
     @param {array} mobs - the array of mobs to apply the job to
   */
  assignJob (blocks, mobs) {
    let command = this.jobCommands[this.jobCommand];
    // filter blocks based on job requirements
    command.blocks = blocks.filter(command.test);
    // only add job if there are blocks to work on
    if (command.blocks.length > 0) {
      let job = this.jobList.addJob(command);
    }
  }

  /**
     Get Info
     Get information about the selected blocks.
     @param {Block} block - the block to examine
     @param {Mobile} mob - the mob to examine
   */
  getInfo (block={}, mob={}) {
    this.infoPane.setDetails({
      name:       mob.name || '',
      blockType:  block.name || '',
      position:   `${block.x} ${block.y}`
    });
    this.infoPane.showPane();
    console.log(this.level.getBlock(block.x, block.y).getWall());
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

var jobCommands = {
  dig: {
    type:       'general',
    name:       'Dig',
    blocks:     [],
    increment:  10,
    maxWorkers: 2,
    action: {
      begin (block) {
        let task = this.blocks.get(block);
        task.emitter = this.getEmitter();
        task.emitter.x = block.middleX;
        task.emitter.y = block.middleY;
        task.emitter.makeParticles('dust');
        task.emitter.setRotation(0, 0);
        task.emitter.setAlpha(0.3, 0.8);
        task.emitter.setScale(0.5, 1);
        task.emitter.gravity = -2;
      },

      perform (block) {
        let task = this.blocks.get(block);
        // explode, lifetime, n/a, num particles
        task.emitter.start(true, 500, null, 10);
      },

      finish (block) {
        let task = this.blocks.get(block);
        task.emitter.kill();
        //this.emitter.destroy();
        this.parent.level.removeWall(block.x, block.y, 1, 1, 'walls', true);
      }
    },

    test (block) {
      let wall = block.getWall();
      if (wall.index > -1) {
        return true;
      }
      return false;
    }
  },

  buildWall: {
    type:       'general',
    name:       'Wall',
    blocks:     [],
    increment:  34,
    action: {
      begin (block) {
        this.emitter = this.game.add.emitter(block.middleX, block.middleY);
        this.emitter.makeParticles('dust');
        this.emitter.setRotation(0, 0);
        this.emitter.setAlpha(0.3, 0.8);
        this.emitter.setScale(0.5, 1);
        this.emitter.gravity = -2;
      },

      perform (block) {
        // explode, lifetime, n/a, num particles
        this.emitter.start(true, 500, null, 10);
      },

      finish (block) {
        this.emitter.kill();
        this.emitter.destroy();
        console.log(this.parent.level.addWall(block.x, block.y, 1, 1));
      }
    },

    test (block) {
      let wall = block.getWall();
      if (wall.index === -1) {
        return true;
      }
      return false;
    }
  }
};

export default Controls;
