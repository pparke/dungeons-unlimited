/*
 * SelectBox
 */

// TODO: Change select box to snap to grid of same size as tiles
// and then run hit test on each of the grid squares to look for
// a tile
class SelectBox extends Phaser.Graphics {

  constructor (game, ... args) {
    super(game, ... args);

    this.selecting  = false;
    this.begin      = { x: 0, y: 0 };
    this.size       = { width: 0, height: 0 };
    this.grid       = { width: 16, height: 16 };
    this.color      = 0x00FF00;
    this.stroke     = 2;
    this.alpha      = 1;

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
        // snap the position to the grid
        let x = Math.ceil(pointer.worldX / this.grid.width) * this.grid.width;
        let y = Math.ceil(pointer.worldY / this.grid.height) * this.grid.height;
        // calculate the current width and height
        let width = Math.abs(x - this.begin.x);
        let height = Math.abs(y - this.begin.y);
        // only redraw the rect if the pointer position has changed
        if (width !== this.size.width || height !== this.size.height) {


          // reset the graphics and style
          this.reset();

          let topleft = { x: this.begin.x, y: this.begin.y };
          // account for selection to the left and/or upwards
          if (pointer.worldX < this.begin.x) {
            topleft.x = this.begin.x - width;
          }
          if (pointer.worldY < this.begin.y) {
            topleft.y = this.begin.y - height;
          }

          // update width and height
          this.size.width = width;
          this.size.height = height;

          this.drawRect(topleft.x, topleft.y, width, height);
        }

      }
      else {
        // account for selection to the left and/or upwards
        if (pointer.worldX < this.begin.x) {
          this.begin.x = this.begin.x - this.size.width;
        }
        if (pointer.worldY < this.begin.y) {
          this.begin.y = this.begin.y - this.size.height;
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
  clicked (pointer) {
    if (!this.selecting) {
      this.selecting = true;

      // snap to grid
      this.begin.x = Math.floor(pointer.worldX / this.grid.width) * this.grid.width;
      this.begin.y = Math.floor(pointer.worldY / this.grid.height) * this.grid.height;
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
