/**
   Controls
   @class
*/
import SelectBox  from './SelectBox';
import Menu       from './Menu';

class Controls {
  constructor (game, level, jobList, ...args) {
    this.game     = game;
    this.level    = level;
    this.jobList  = jobList;

    // add the selection graphics
    this.selection = new SelectBox(this.game, 0, 0);
    this.game.add.existing(this.selection);

    this.selectionModes = [ 'job', 'info' ];
    this.selectionMode  = 'job';
    this.jobCommands    = jobCommands;
    this.jobCommand     = 'dig';
    this.menu           = new Menu(this.game);

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
          this.selection.clicked(pointer);
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

  setupMenu () {
    let dy = 0;
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
     On Released
     The callback that handles the release event from the mouse
     @param {Phaser.Rectangle} rect - the selected area
   */
  onReleased (rect) {
    let tiles = this.level.getTiles(rect.x, rect.y, rect.width, rect.height, 'walls', false);

    if (tiles.length === 0) {
      return;
    }

    switch (this.selectionMode) {
    case 'job':
      this.assignJob(tiles);
      break;

    case 'info':
      this.getInfo(tiles);
      break;
    }
  }

  /**
     Assign Job
     Add a job command to the job list.
     @param {array} tiles - the array of tiles to apply the job to
   */
  assignJob (tiles) {
    let command = this.jobCommands[this.jobCommand];
    command.tiles = tiles;
    let job = this.jobList.addJob(command);
  }

  /**
     Get Info
     Get information about the selected tiles.
     @param {array} tiles - the array of tiles to examine
   */
  getInfo (tiles) {
    tiles.forEach((tile) => {
      console.log(this.level.getBlock(tile.x, tile.y));
    });
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
    else {
    }
  }

}

var jobCommands = {
  dig: {
    type:       'general',
    name:       'Dig',
    tiles:      [],
    increment:  34,
    action: {
      begin (tile) {
        this.emitter = this.game.add.emitter(tile.worldX + tile.centerX, tile.worldY + tile.centerY);
        this.emitter.makeParticles('dust');
        this.emitter.setRotation(0, 0);
        this.emitter.setAlpha(0.3, 0.8);
        this.emitter.setScale(0.5, 1);
        this.emitter.gravity = -2;
      },

      perform (tile) {
        // explode, lifetime, n/a, num particles
        this.emitter.start(true, 500, null, 10);
      },

      finish (tile) {
        this.emitter.kill();
        this.emitter.destroy();
        this.parent.level.removeWall(tile.x, tile.y, 1, 1, 'walls', true);
      }
    }
  },

  buildWall: {
    type:       'general',
    name:       'Wall',
    tiles:      [],
    increment:  34,
    action: {
      begin (tile) {
        this.emitter = this.game.add.emitter(tile.worldX + tile.centerX, tile.worldY + tile.centerY);
        this.emitter.makeParticles('dust');
        this.emitter.setRotation(0, 0);
        this.emitter.setAlpha(0.3, 0.8);
        this.emitter.setScale(0.5, 1);
        this.emitter.gravity = -2;
      },

      perform (tile) {
        // explode, lifetime, n/a, num particles
        this.emitter.start(true, 500, null, 10);
      },

      finish (tile) {
        this.emitter.kill();
        this.emitter.destroy();
        this.parent.level.drawWall(tile.x, tile.y, 1, 1, 'walls', true);
      }
    }
  }
};

export default Controls;
