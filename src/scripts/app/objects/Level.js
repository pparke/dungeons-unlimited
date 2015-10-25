/*
 * Level
 */
import Block from './Block';

class Level extends Phaser.Tilemap {

  constructor (game, ... args) {
    super(game, ... args);

    this.blocks = [];

    this.centerX = this.width/2;
    this.centerY = this.height/2;

    let floors = this.create('floors', this.width, this.height, this.tileWidth, this.tileHeight);
    //this.createBlankLayer('objects', this.width, this.height, this.tileWidth, this.tileHeight);
    let walls = this.createBlankLayer('walls', this.width, this.height, this.tileWidth, this.tileHeight);

    floors.renderSettings.enableScrollDelta = true;
    walls.renderSettings.enableScrollDelta = true;

    this.setLayer('floors');

    floors.resizeWorld();

    this.tileNames = new Map();
    this.collisionIndexes = [];
    this.collisionGroup = this.game.physics.p2.createCollisionGroup();

    this.createBlocks();
  }

  /**
     Create Blocks
     Create the blocks that represent the grid elements containing the floor,
     walls, objects, and other additional properties.
   */
  createBlocks () {
    for (let y = 0; y < this.height; y++) {
      this.blocks.push([]);
      for (let x = 0; x < this.width; x++) {
        let block = new Block(this.game, this, x, y);
        this.blocks[y].push(block);
      }
    }
  }

  /**
     Get Block
     Return the block at the given x y coordinate.
     @return {Block} the requested block
   */
  getBlock (x, y) {
    return this.blocks[y][x];
  }

  /**
     Tile Count
     Count the total number of tiles.
   */
  tileCount () {
    return this.tilesets.reduce((count, tileset) => {
      count += tileset.total;
      return count;
    }, 1);
  }

  /**
     Is Passable
     Test if the tile can be passed through.
     @param {number} x - the x coord of the tile in tile units
     @param {number} y - the y coord of the tile in tile units
     @return {boolean} true if the tile is passable
   */
  isPassable (x, y) {
    //return this.getTile(x, y, 'walls', true).index === -1;
    return this.getBlock(x, y).passable();
  }

  /**
     Is Accessible
     Test to see if any of the tiles surrounding this tile will
     allow a mob to stand next to the tile

     @param {number} x - the x coord of the tile in tile units
     @param {number} y - the y coord of the tile in tile units
     @return {boolean} true if any of the surrounding tiles are clear
   */
  isAccessible (x, y) {
    let block = this.getBlock(x, y);
    let blocks = this.getBlockSurroundings(block, true, false);
    // test if any of the surrounding blocks are passable
    return blocks.some((block) => {
      return this.isPassable(block.x, block.y);
    });
  }

  /**
     Get Layer Object
     Get the layer object associated with the given key.

     @param {string|number} key - the key for the desired layer
     @return {object} the layer object (not a TilemapLayer)
   */
  getLayerObject (key) {
    key = this.getLayer(key);
    return this.layers[key];
  }


  /**
     Add Tileset
     Add a new tileset image and its corresponding map
     of keys and indices

     @param {string} tileset
     @param {string} imageKey
     @param {string} mapKey
     @param {string|number} layer
     @param {array} collisions
   */
   addTileset (tileset, imageKey, mapKey, layer, collisions, collisionGroup) {
     // count the number of tiles so we know the offset to use
     let numTiles = this.tileCount();

     this.addTilesetImage(tileset, imageKey, this.tileWidth, this.tileHeight, 0, 0, numTiles);

     let tileNames = JSON.parse(this.game.cache.getText(mapKey));

     // increment the index to account for the other tilesets
     // and add to the tileNames map
     for (let key of Object.keys(tileNames)) {
       // only increment if it is a valid index, else set to -1 for no tile/collision
       let index = tileNames[key] >= 0 ? tileNames[key] + numTiles : -1;
       // permute all of the possible keys for this tile
       // based on the presence of wildcard characters in the key
       let keys = this.permuteKey(key);
       keys.forEach((k) => {
         this.tileNames.set(k, index);
       });
     }


     if (collisions) {
       // shift the collision indexes by the number of tiles
       // and add the unique ones to the array of collision indexes
       collisions.forEach((idx) => {
         let index = idx + numTiles;
         if (this.collisionIndexes.indexOf(index) === -1) {
           this.collisionIndexes.push(index);
         }
       });

       this.updateCollisionBodies(layer, collisions, collisionGroup);
     }
   }

   /**
      Permute Key
      Calculates all of the combinations of replacements for wildcard
      characters in the key.

      @param {string} key - the key to work on
      @return {array} an array containing all of the possible keys
    */
   permuteKey (key) {
     let q = key.indexOf('?');
     if (q === -1) {
       return [key];
     }
     let keys = [];
     // add keys with the ? replaced with both e and w recursively
     keys = keys.concat(this.permuteKey(key.slice(0, q) + 'e' + key.slice(q+1)));
     keys = keys.concat(this.permuteKey(key.slice(0, q) + 'w' + key.slice(q+1)));

     return keys;
   }

   /**
      Get Tile Index

      @param {string|number} key - the string or number to convert to the tile index
      @return {number} the tile index
   */
   getTileIndex (key) {
     let tileIndex;

     if (typeof key === 'number') {
       tileIndex = key;
     }
     else if (typeof key === 'string') {
       tileIndex = this.tileNames.get(key);
     }

     return tileIndex;
   }

   /**
      Get Grid Pos
      Get the position of the point in grid units
      @param {Phaser.Point} point - the point to modify
   */
   getGridPos (point) {
     return new Phaser.Point(Phaser.Math.snapToFloor(point.x, this.tileWidth), Phaser.Math.snapToFloor(point.y, this.tileHeight));
   }

   /**
      Get World Rect
      Convert a rect in grid units to world units.
      @param {Phaser.Rectangle} rect - the rect to convert
    */
   getWorldRect (rect) {
     return new Phaser.Rectangle(rect.x * this.tileWidth, rect.y * this.tileHeight, rect.width * this.tileWidth, rect.height * this.tileHeight);
   }

   /**
     Update Collision Bodies
     Update all of the collision settings for the tiles based
     on the stored collision indices for the tilemap and
     convert the tilemap to collision bodies and add the bodies
     to the collision group for this tilemap.  Set collides with
     the specified collision group.

     @param {string|number} layer - the layer to set collision on
     @param {P2 Collision Group} collisionGroup - the group to collide with
   */
   updateCollisionBodies (layer, collisionGroup) {
     let numTiles = this.tileCount();

     // set the tiles with matching indexes to collide
     this.setCollision(this.collisionIndexes, true, layer);

     // convert tilemap to collision bodies
     // convertTilemap(map, layer, addToWorld, optimize)
     let tileBodies = this.convertTilemap(layer, true);

     //this.layerMap[layer].bodies = tileBodies;

     // set collision groups
     tileBodies.forEach((body) => {
       body.debug = false;
       body.setCollisionGroup(this.collisionGroup);
       body.collides(collisionGroup);
     });
   }

  /**
     Draw Rect
     Draw either an outline or a filled rectangle using the
     specified tile.

     @param {number} x - the x position to start at
     @param {number} y - the y position to start at
     @param {number} width - the width of the rectangle
     @param {number} height - the height of the rectangle
     @param {string} tile - the key of the tile to use
     @param {string|number} layer - the layer to draw onto
     @param {boolean} fill - whether to fill in the rectangle
   */
  drawRect (x, y, width, height, tile, layer, fill) {
    let tileIndex = this.getTileIndex(tile);

    if (fill) {
      this.fill(tileIndex, x, y, width, height, layer);
    }
    else {
      // top
      this.fill(tileIndex, x, y, width, 1, layer);
      // right
      this.fill(tileIndex, x+width, y, 1, height, layer);
      // bottom
      this.fill(tileIndex, x+1, y+height, width, 1, layer);
      // left
      this.fill(tileIndex, x, y+1, 1, height, layer);
    }
  }

  drawFloor (x, y, width, height, key) {
    let blocks = this.getBlocks(x, y, width, height);

    // fill the specified area with solid wall
    let tileIndex = this.getTileIndex(key);
    blocks.forEach((block) => {
      block.getFloor().index = tileIndex;
      // update all of the changed and surrounding tile indices
      let surroundings = this.getBlockSurroundings(block, true, false);
      surroundings.forEach((b) => {
        if (b) {
          //this.updateFloorIndex();
        }
      });
    });
  }

  /**
     Add Wall
     @param {number} x - the x position to start at
     @param {number} y - the y position to start at
     @param {number} width - the width of the wall
     @param {number} height - the height of the wall
   */
  addWall (x, y, width, height) {
    let blocks = this.getBlocks(x, y, width, height);

    // fill the specified area with solid wall
    let tileIndex = this.getTileIndex('w,w,w|w,w,w|w,w,w');
    blocks.forEach((block) => {
      block.getWall().index = tileIndex;
      this.getLayerObject('walls').dirty = true;
    });

    let edgeBlocks = [];

    if (blocks.length === 1) {
      edgeBlocks = this.getBlockSurroundings(blocks[0], true, true);
    }
    else {
      // top
      edgeBlocks = edgeBlocks.concat(this.getBlocks(x - 1, y - 1, width, 2, 'walls', -1));
      // right
      edgeBlocks = edgeBlocks.concat(this.getBlocks(x + width - 1, y - 1, 2, height, 'walls', -1));
      // bottom
      edgeBlocks = edgeBlocks.concat(this.getBlocks(x + 1, y + height - 1, width, 2, 'walls', -1));
      // left
      edgeBlocks = edgeBlocks.concat(this.getBlocks(x - 1, y, 2, height + 1, 'walls', -1));
    }

    edgeBlocks.forEach((block) => {
      this.updateWallIndex(block);
    });

    return blocks;
  }

  /**
     Remove Wall
     Remove a section of wall
     @param {number} x - the x position to start at
     @param {number} y - the y position to start at
     @param {number} width - the width of the wall
     @param {number} height - the height of the wall
   */
  removeWall (x, y, width, height) {
    let blocks = this.getBlocks(x, y, width, height, 'walls', -1);

    blocks.forEach((block) => {
      if (block.body) {
        block.body.removeFromWorld();
      }
      this.removeTile(block.x, block.y, 'walls');
    });

    let surroundingBlocks = [];

    if (blocks.length === 1) {
      surroundingBlocks = this.getBlockSurroundings(blocks[0], true, true);
    }
    else {
      // top
      surroundingBlocks = surroundingBlocks.concat(this.getBlocks(x - 1, y - 1, width + 1, 1, 'walls', -1));
      // right
      surroundingBlocks = surroundingBlocks.concat(this.getBlocks(x + width, y - 1, 1, height + 1, 'walls', -1));
      // bottom
      surroundingBlocks = surroundingBlocks.concat(this.getBlocks(x, y + height, width + 1, 1, 'walls', -1));
      // left
      surroundingBlocks = surroundingBlocks.concat(this.getBlocks(x - 1, y, 1, height + 1, 'walls', -1));
    }

    surroundingBlocks.forEach((block) => {
      this.updateWallIndex(block);
    });
  }

  /**
     Update Wall Index
     Updates a wall's index based on its surroundings.
   */
  updateWallIndex (block) {
    let surroundings = this.getBlockSurroundings(block);
    // convert the surroudings into a key
    let key = surroundings.map((row) => {
      return row.map((b) => {
        if (!b) {
          return 'e';
        }
        return b.getWall().index > -1 ? 'w' : 'e';
      }).join(',');
    }).join('|');
    let index = this.getTileIndex(key);
    if (index === undefined) {
      console.log('index is undefined', index, this);
    }
    else {
      block.getWall().index = index;
    }

    return block;
  }

  /**
     Get Blocks
     Get a flat array containing all of the blocks in the specified area

     @param {number} x - the x coordinate to start at
     @param {number} y - the y coordinate to start at
     @param {number} width - the width of the area
     @param {number} height - height of the area
     @param {string} layerKey - the tile layer in the block to examine
     @param {number} removeType - do not include blocks whose tile in the specified layer matches this index
     @return {array} a flat array containing all the blocks
   */
  getBlocks (x, y, width, height, layerKey, removeType) {
    x = x < 0 ? 0 : x;
    y = y < 0 ? 0 : y;
    width = width === 0 ? 1 : width;
    height = height === 0 ? 1 : height;
    let xEnd = x + width > this.width ? this.width : x + width;
    let yEnd = y + height > this.height ? this.height : y + height;

    let blocks = this.blocks.slice(y, yEnd).reduce((accum, row) => {
      return accum.concat(row.slice(x, xEnd));
    }, []);

    if (layerKey) {
      if (removeType === undefined) { removeType = -1; }
      blocks = blocks.filter((block) => {
        return block.getWall().index !== removeType;
      });
    }

    return blocks;
  }



  /**
     Get Block Surroundings
     Get the blocks surrounding and including this block as an array

     @param {Block} block - the block to get the surroundings of
     @return {array} an array containing the surrounding blocks and optionally the center block
   */
  getBlockSurroundings (block, flat, center = true) {
    if (!block) {
      if (flat) {
        return [];
      }
      else {
        return [[],[],[]];
      };
    }
    let blocks = [];
    let row1 = [];
    let row2 = [];
    let row3 = [];


    row1.push(this.getBlockNW(block.x, block.y));
    row1.push(this.getBlockN(block.x, block.y));
    row1.push(this.getBlockNE(block.x, block.y));
    row2.push(this.getBlockW(block.x, block.y));
    if (center) {
      row2.push(block);
    }
    row2.push(this.getBlockE(block.x, block.y));
    row3.push(this.getBlockSW(block.x, block.y));
    row3.push(this.getBlockS(block.x, block.y));
    row3.push(this.getBlockSE(block.x, block.y));

    if (flat) {
      blocks = blocks.concat(row1, row2, row3);
    }
    else {
      blocks.push(row1, row2, row3);
    }
    return blocks;
  }

  /**
     Block At
     Get the block at the given world coordinates.

     @param {number} x - the x coordinate
     @param {number} y - the y coordinate
     @return {Phaser.Tile} the tile at the given position
   */
  blockAt (x, y) {
    x = this.game.math.snapToFloor(x, this.tileWidth) / this.tileWidth;
    y = this.game.math.snapToFloor(y, this.tileHeight) / this.tileHeight;

    return this.getBlock(x, y);
  }


  getBlockNW (x, y) {
    if (x > 0 && y > 0) {
      x -= 1;
      y -= 1;
      return this.getBlock(x, y);
    }
    return null;
  }

  getBlockN (x, y) {
    if (y > 0) {
      y -= 1;
      return this.getBlock(x, y);
    }
    return null;
  }

  getBlockNE (x, y) {
    if (x < this.width - 1 && y > 0) {
      x += 1;
      y -= 1;
      return this.getBlock(x, y);
    }
    return null;
  }

  getBlockE (x, y) {
    if (x < this.width - 1) {
      x += 1;
      return this.getBlock(x, y);
    }
    return null;
  }

  getBlockSE (x, y) {
    if ((x < this.width - 1) && (y < this.height - 1)) {
      x += 1;
      y += 1;
      return this.getBlock(x, y);
    }
    return null;
  }

  getBlockS (x, y) {
    if (y < this.height - 1) {
      y += 1;
      return this.getBlock(x, y);
    }
    return null;
  }

  getBlockSW (x, y) {
    if (x > 0 && y < this.height - 1) {
      x -= 1;
      y += 1;
      return this.getBlock(x, y);
    }
    return null;
  }

  getBlockW (x, y) {
    if (x > 0) {
      x -= 1;
      return this.getBlock(x, y);
    }
    return null;
  }


  /**
    * TODO: update to work with Block class
    * Goes through all tiles in this Tilemap and the given TilemapLayer and converts those set to collide into physics bodies.
    * Only call this *after* you have specified all of the tiles you wish to collide with calls like Tilemap.setCollisionBetween, etc.
    * Every time you call this method it will destroy any previously created bodies and remove them from the world.
    * Therefore understand it's a very expensive operation and not to be done in a core game update loop.
    *
    * @method Level#convertTilemap
    * @param {number|string|Phaser.TilemapLayer} [layer] - The layer to operate on. If not given will default to map.currentLayer.
    * @param {boolean} [addToWorld=true] - If true it will automatically add each body to the world, otherwise it's up to you to do so.
    * @return {array} An array of the Phaser.Physics.P2.Body objects that were created.
    */
    convertTilemap (layerKey, addToWorld) {
      let layer = this.getLayerObject(layerKey);

      if (addToWorld === undefined) { addToWorld = true; }

      //  If the bodies array is already populated we need to nuke it
      this.game.physics.p2.clearTilemapLayerBodies(this, layerKey);

      let width = 0;
      let sx = 0;
      let sy = 0;

      layer.data.forEach((row) => {
        width = 0;

        row.forEach((tile) => {
          if (tile && tile.index > -1 && tile.collides) {
            let body;
            // add a reference to the body on the tile if one doesn't exist
            // or if it does, add the existing body back to the world
            if (!tile.body) {
              // create a new physics body at the x and y world coords of the tile
              body = this.game.physics.p2.createBody(tile.x * tile.width, tile.y * tile.height, 0, false);
              // add a bounding rect that matches the tile
              body.addRectangle(tile.width, tile.height, tile.width / 2, tile.height / 2, 0);
              // set the body property on the tile so that it can be controlled through the tile
              tile.body = body;
            }
            else {
              body = tile.body;
            }

            if (addToWorld) {
              this.game.physics.p2.addBody(body);
            }

            // add the body to the bodies array on the layer
            layer.bodies.push(body);
          }
        });
      });

      return layer.bodies;
    }

}


export default Level;
