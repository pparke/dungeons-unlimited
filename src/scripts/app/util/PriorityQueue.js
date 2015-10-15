

class PriorityQueue {

  constructor (arr) {
    this.heap = [ null ];

    if (arr) {
      arr.forEach((elem) => {
        this.push(elem.data, elem.priority);
      });
    }
  }

  /**
   * Empty
   * Returns a boolean indicating if there
   * are any nodes in the queue.
   */
  empty () {
    return this.heap.length === 1;
  }

  /**
   * Push
   * Create a new node, push it onto the heap,
   * and then bubble it up based on priority
   */
  push (data, priority) {
    let node = new Node(data, priority);
    this.bubble(this.heap.push(node) - 1);
  }

  /**
   * Pop
   * Remove and return the data of the highest
   * priority node.
   */
  pop () {
    // get the value
    let topVal = this.heap[1].data;
    // set the popped node to null
    this.heap[1] = this.heap.pop();
    // sink the nodes in the tree
    this.sink(1);
    // return the popped value
    return topVal;
  }

  /**
   * Bubble
   * Bubble node i up the binary tree based
   * on its priority.  Begins with i = heap.length
   *
   */
  bubble (i) {
    while (i > 1) {
      // binary tree, parent node
      let parentIndex = Math.floor(i/2);
      // don't bubble if equal
      if (!this.isHigherPriority(i, parentIndex)) { break; }
      // swap places to bubble
      this.swap(i, parentIndex);
      // keep reference to same element
      i = parentIndex;
    }
  }

  /**
   * Sink
   * Sink node i down the binary tree based
   * on its priority. Begins with i = 1
   */
  sink (i) {
    while ((i*2)+1 < this.heap.length) {
      let leftHigher = !this.isHigherPriority(i*2 + 1, i*2);
      let childIndex = leftHigher ? i*2 : i*2 + 1;

      if (this.isHigherPriority(i, childIndex)) { break; }

      this.swap(i, childIndex);
      i = childIndex;
    }
  }

  /**
   * Swap
   * Swaps places of two nodes on the heap.
   */
  swap (a, b) {
    let tmp = this.heap[a];
    this.heap[a] = this.heap[b];
    this.heap[b] = tmp;
  }

  /**
   * Is Higher Priority
   * Tests if the priority of a is less than that of b
   */
  isHigherPriority (a, b) {
    return this.heap[a].priority < this.heap[b].priority;
  }

}

class Node {

  constructor (data, priority) {
    this.data = data;
    this.priority = priority;
  }

  toString () {
    return this.priority;
  }
}

export default PriorityQueue;
