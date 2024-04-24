const NBSP = ' ';

class Rainbz {
  grid = [];
  gridWidth = 0;
  grid = [];
  sp = null;
  interval = 0;
  colors = [];
  defaultOpts = {
    frameRate: 28,
    palette: {
      size: 100,
      saturation: 50,
      lightness: 50,
      min: 160,
      max: 280,
    },
    phrase: "418: I'm a teapot",
  };

  constructor(container, opts) {
    opts = { ...this.defaultOpts, ...opts };
    this.container = container;
    this.frameRate = opts.frameRate;
    this.interval = 1000 / opts.frameRate;
    this.colors = this.makePalette(opts.palette);
    this.phrase = opts.phrase;
    this.gridify(container);
  }

  gridify(container) {
    const rows = Array.from(container.children);
    this.gridWidth = Math.max(...rows.map((line) => line.textContent.length));
    this.grid = rows.map((row) => {
      let rowText = row.textContent;
      const rowElements = Array.from(row.children);
      if (rowText.length < this.gridWidth) {
        rowText += NBSP.repeat(this.gridWidth - rowText.length);
      }
      if (rowText.includes(this.phrase)) {
        rowText.replace(this.phrase, NBSP.repeat(this.phrase.length));
        this.sp = row.querySelector('.hi');
      }
      return rowText.split('').map((c) => (c == NBSP ? null : rowElements.pop() || null));
    });
  }

  loop(frame = 0) {
    if (!this.enabled) return;

    const start = Date.now();

    this.grid.forEach((row) => {
      row.forEach((col, x) => {
        const color = this.getColor(frame, x);
        if (col !== null && col.className != 'hi') {
          const shadowX = Math.cos(-(frame + x) / 10) * 10;
          const shadowY = Math.sin(-(frame + x) / 10) * 10;
          col.style.color = `hsl(${color.h}deg ${color.s}% ${color.l}%)`;
          col.style.textShadow = `${shadowX}px ${shadowY}px 8px hsl(${color.h}deg ${color.s}% ${color.l}%)`;
        }
      });
    });

    if (this.sp !== null) {
      this.sp.style.transform = `rotateX(-${frame % (360 * 5)}deg)`;
    }

    const renderTime = Date.now() - start;
    setTimeout(() => this.loop(frame + 1), Math.max(0, this.interval - renderTime));
  }

  start() {
    if (!this.enabled) {
      this.enabled = true;
      this.loop();
    } else {
      console.log('Rainbz already running');
    }
  }

  stop() {
    this.enabled = false;
  }

  updatePalette(opts) {
    opts = { ...this.defaultOpts.palette, ...opts };
    this.colors = this.makePalette(opts);
  }

  getColor(frame, x) {
    const color = this.colors[(frame + x) % this.colors.length];
    this.colors.push(this.colors.shift());
    return color;
  }

  makePalette(opts) {
    const { min, max, size, saturation, lightness } = opts;
    const colors = [];
    let down = false;
    for (let i = 0; i < size; i++) {
      let hue = Math.floor((i / size) * 2 * (max - min));
      if (hue + min >= max) {
        down = true;
      }
      hue = down ? min + hue : max - hue;
      const color = { h: hue, s: saturation, l: lightness };
      colors.push(color);
    }
    return colors;
  }

  rotateMatrix(matrix, angle) {
    const rotated = [];
    for (let y = 0; y < matrix.length; y++) {
      rotated[y] = [];
      for (let x = 0; x < matrix[y].length; x++) {
        const newX = Math.floor(x * Math.cos(angle) - y * Math.sin(angle));
        const newY = Math.floor(x * Math.sin(angle) + y * Math.cos(angle));
        rotated[newY] = rotated[newY] || [];
        rotated[newY][newX] = matrix?.[y]?.[x] || null;
      }
    }
    return rotated;
  }
}
