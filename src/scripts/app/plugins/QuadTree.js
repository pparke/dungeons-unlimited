/*
 * QuadTree plugin
 */

class QuadTree extends Phaser.Plugin {

  constructor (game, parent, bounds, maxDepth, maxItems) {
    super(game, parent);

    this.bounds   = bounds;
    this.root     = new Node(bounds, 0, maxDepth, maxItems);
  }

  init () {
    // TODO: Stub
  }

  update () {
    // TODO: Stub
  }

  render () {

    this.root.drawBounds(this.game)
    //this.game.debug.geom(this.bounds, 'rgba(255, 0, 0, 1)');
  }

  insert (items) {
    // make sure we are working with an array
    if (!Array.isArray(items)) {
      items = [items];
    }

    items.forEach((item) => {
      this.root.insert(item);
    })
  }

  retrieve (item) {
    let collisions = [];
    return this.root.retrieve(collisions, item);
  }

  clear () {
    this.root.clear();
  }

}

class Node {

  constructor (bounds, depth, maxDepth, maxItems) {
    this.bounds       = bounds;
    this.depth        = depth || 0;
    this.items        = [];
    this.nodes        = [];
    this.maxDepth     = maxDepth || 4;
    this.maxItems     = maxItems || 4;
  }

  drawBounds (game) {
    game.debug.geom( this.bounds, 'rgba(255, 0, 0, 1)', false);
    this.nodes.forEach((node) => {
      node.drawBounds(game);
    });
  }

  /**
     Insert
     Attempt to insert the item into the node, if the node
     is over capacity, split the node and add all contained
     items to the resulting child nodes.

     @param {Phaser.Rectangle} item - the item to insert
   */
  insert (item) {
    if (this.nodes.length > 0) {
      // find out which quad it belongs in
      let index = this.getIndex(item);
      // insert into node if it fits
      if (index > -1) {
        this.nodes[index].insert(item);
      }
    }

    this.items.push(item);

    if (this.items.length > this.maxItems && this.depth < this.maxDepth) {
      if (this.nodes.length === 0) {
        this.split();
        this.items = this.items.map((item) => {
          // try to insert the item into a child node
          let index = this.getIndex(item);
          if (index > -1) {
            this.nodes[index].insert(item);
            // remove from items
            return null;
          }
          // won't fit, keep in items
          return item;
        }).filter((item) => {
          return !!item;
        });
      }
    }
  }

  /**
     Split
     Split this node into 4 sub nodes.
   */
  split () {
    let subWidth = Math.floor(this.bounds.width/2);
    let subHeight = Math.floor(this.bounds.height/2);
    let quads = [
      { x: this.bounds.x + subWidth,  y: this.bounds.y },
      { x: this.bounds.x,             y: this.bounds.y },
      { x: this.bounds.x,             y: this.bounds.y + subHeight },
      { x: this.bounds.x + subWidth,  y: this.bounds.y + subHeight }
    ];

    quads.forEach((quad) => {
      this.nodes.push(new Node(new Phaser.Rectangle(quad.x, quad.y, subWidth, subHeight), this.depth+1, this.maxDepth, this.maxItems));
    });
  }

  /**
     Retrieve
     Return all items that could collide with this item.

     @param {Phaser.Rectangle} item - the item to check collisions for.
   */
  retrieve (collisions, item) {
    let index = this.getIndex(item);
    if (index > -1 && this.nodes.length > 0) {
      collisions = this.nodes[index].retrieve(collisions, item);
    }

    collisions.push(...this.items);

    return collisions;
  }

  /**
     Clear
     Clear all child nodes.
   */
  clear () {
    while (this.nodes.length > 0) {
      let node = this.nodes.pop();
      node.clear();
    }
  }

  /**
     Get Index
     Gets the index of the child node that the item belongs in or
     returns -1 if the item does not fit fully within a child node

     @param {Phaser.Rectangle} item - the item to test
   */
  getIndex (item) {
    let index = -1;
    // fully in top half
    let topQuad     = item.bottom < this.bounds.centerY;
    // fully in bottom half
    let bottomQuad  = item.y > this.bounds.centerY;

    if (item.right < this.bounds.centerX) {
      if (topQuad) {
        index = 1;
      }
      else {
        index = 2;
      }
    }
    else if (item.x > this.bounds.centerX) {
      if (topQuad) {
        index = 0;
      }
      else {
        index = 3;
      }
    }

    return index;
  }
}


export default QuadTree;
