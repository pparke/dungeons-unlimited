/*
 * SelectBox
 */

// TODO: Change select box to snap to grid of same size as tiles
// and then run hit test on each of the grid squares to look for
// a tile

let snapToFloor = Phaser.Math.snapToFloor;
let snapToCeil  = Phaser.Math.snapToCeil;

class SelectBox extends Phaser.Graphics {

  constructor (game, ... args) {
    super(game, ... args);

    this.selecting  = false;
    this.begin      = { x: 0, y: 0 };
    this.size       = { width: 0, height: 0 };
    this.grid       = { width: 16, height: 16 };
    this.lastPos    = { x: 0, y: 0 };
    this.color      = 0x00FF00;
    this.stroke     = 2;
    this.alpha      = 1;
    this.fixed      = false;

    this.lineStyle(this.stroke, this.color, this.alpha);
    this.events.onReleased = new Phaser.Signal();
  }

  /**
     Update
     If we are in the process of making a selection, update the width
     and height of the select box and redraw the graphics if anything
     has changed.
  */
  update () {
    if (this.selecting) {
      let pointer = this.game.input.activePointer;
      if (pointer.isDown) {


        if (this.fixed) {
          let x = snapToFloor(pointer.worldX, this.grid.width);
          let y = snapToFloor(pointer.worldY, this.grid.height);
          // only redraw the rect if the pointer position has changed
          if (x !== this.lastPos.x || y !== this.lastPos.y) {
            this.lastPos.x = x;
            this.lastPos.y = y;
            // reset the graphics and style
            this.reset();
            x = x - snapToFloor(this.size.width/2, this.grid.width);
            y = y - snapToFloor(this.size.height/2, this.grid.height);

            this.begin.x = x;
            this.begin.y = y;

            this.drawRect(x, y, this.size.width, this.size.height);
          }
        }
        else {
          let x, y, width, height;

          // determine the current x and y
          // calculate the current width and height
          if (pointer.worldX < this.begin.x) {
            x = snapToFloor(pointer.worldX, this.grid.width);
            width = this.begin.x - x;
          }
          else {
            x = snapToCeil(pointer.worldX, this.grid.width);
            width = x - this.begin.x;
          }
          if (pointer.worldY < this.begin.y) {
            y = snapToFloor(pointer.worldY, this.grid.height);
            height = this.begin.y - y;
          }
          else {
            y = snapToCeil(pointer.worldY, this.grid.height);
            height = y - this.begin.y;
          }

          // make sure that width and height are at least 1 grid block
          width = width || this.grid.width;
          height = height || this.grid.height;

          // only redraw the rect if the pointer position has changed
          if (x !== this.lastPos.x || y !== this.lastPos.y) {
            this.lastPos.x = x;
            this.lastPos.y = y;
            // reset the graphics and style
            this.reset();

            let topleft = { x: this.begin.x, y: this.begin.y };

            // account for selection to the left and/or upwards
            if (pointer.worldX < this.begin.x) {
              topleft.x = this.begin.x - width;
              width += this.grid.width;
            }
            if (pointer.worldY < this.begin.y) {
              topleft.y = this.begin.y - height;
              height += this.grid.height;
            }

            // update width and height
            this.size.width = width;
            this.size.height = height;

            this.drawRect(topleft.x, topleft.y, this.size.width, this.size.height);
          }
        }
      }
      else {
        if (!this.fixed) {
          // account for selection to the left and/or upwards
          if (pointer.worldX < this.begin.x) {
            this.begin.x = this.begin.x - this.size.width;
            this.begin.x += this.grid.width;
          }
          if (pointer.worldY < this.begin.y) {
            this.begin.y = this.begin.y - this.size.height;
            this.begin.y += this.grid.height;
          }
        }

        this.reset();
        this.selecting = false;
        // return the rectangle selected
        this.events.onReleased.dispatch(this.getRect());
      }
    }
  }

  /**
     Reset
     Clear all graphics and reset the line style
  */
  reset () {
    this.clear()
    this.lineStyle(this.stroke, this.color, this.alpha);
  }

  /**
     Clicked
     Begin the selection process and set the beginning coords of the box
  */
  clicked (pointer, size) {
    if (!this.selecting) {
      this.selecting = true;

      // snap to grid
      this.begin.x        = snapToFloor(pointer.worldX, this.grid.width);
      this.begin.y        = snapToFloor(pointer.worldY, this.grid.height);

      if (size) {
        this.fixed        = true;
        this.size.width   = size.width;
        this.size.height  = size.height;
      }
      else {
        this.fixed        = false;
        this.size.width   = 1;
        this.size.height  = 1;
      }
    }
  }

  /**
     Cancel
     Cancel the selection.
   */
  cancel () {
    this.reset();
    this.selecting = false;
  }



  /**
     Get Rect
     Get a new Phaser.Rectangle describing the selection area

     @return {Phaser.Rectangle} the area selected
   */
  getRect () {
    return new Phaser.Rectangle(this.begin.x/this.grid.width, this.begin.y/this.grid.height, this.size.width/this.grid.width, this.size.height/this.grid.height);
  }

  /**
     Get Centers
     Get the x and y coords for the center of each grid square that has been selected
  */
  getCenters () {
    let points = [];
    for (let y = this.begin.y + (this.grid.height/2); y < this.begin.y + this.size.height; y += this.grid.height) {
      for (let x = this.begin.x + (this.grid.width/2); x < this.begin.x + this.size.width; x += this.grid.width) {
        points.push(new Phaser.Point(x, y));
      }
    }

    return points;
  }

  /**
     Get Origins
     Get the x and y origin for each grid square that has been selected.
   */
   getOrigins () {
     let points = [];
     for (let y = this.begin.y; y < this.begin.y + this.size.height; y += this.grid.height) {
       for (let x = this.begin.x; x < this.begin.x + this.size.width; x += this.grid.width) {
         points.push(new Phaser.Point(x/this.grid.width, y/this.grid.height));
       }
     }

     return points;
   }

}


export default SelectBox;
