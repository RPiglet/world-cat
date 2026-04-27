/* World Cat - Input Handling */

const Input = {
  // Current mouse/touch position relative to canvas
  x: 0,
  y: 0,
  clicked: false,
  justClicked: false,  // true for one frame after click

  // Canvas reference
  canvas: null,
  scale: 1,
  offsetX: 0,
  offsetY: 0,

  init(canvas) {
    this.canvas = canvas;

    // Mouse events
    canvas.addEventListener('mousemove', (e) => this.handleMove(e));
    canvas.addEventListener('mousedown', (e) => this.handleDown(e));
    canvas.addEventListener('mouseup', (e) => this.handleUp(e));

    // Touch events
    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      this.handleMove(touch);
      this.handleDown(touch);
    }, { passive: false });

    canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      this.handleMove(touch);
    }, { passive: false });

    canvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      this.handleUp(e);
    }, { passive: false });
  },

  handleMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    this.x = (e.clientX - rect.left) / this.scale;
    this.y = (e.clientY - rect.top) / this.scale;
  },

  handleDown(e) {
    if (e.clientX !== undefined) {
      const rect = this.canvas.getBoundingClientRect();
      this.x = (e.clientX - rect.left) / this.scale;
      this.y = (e.clientY - rect.top) / this.scale;
    }
    this.clicked = true;
    this.justClicked = true;
  },

  handleUp(e) {
    this.clicked = false;
  },

  // Call at end of frame
  endFrame() {
    this.justClicked = false;
  },

  // Check if point is inside rectangle
  isInRect(x, y, w, h) {
    return this.x >= x && this.x <= x + w && this.y >= y && this.y <= y + h;
  },

  // Check if click happened inside rectangle
  clickedInRect(x, y, w, h) {
    return this.justClicked && this.isInRect(x, y, w, h);
  }
};
