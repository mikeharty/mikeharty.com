class Rainbz {
  NBSP = " ";
  grid = [];
  gridWidth = 0;
  grid = [];
  sp = null;
  interval = 0;
  colors = [];
  defaultOpts = {
    frameRate: 28,
    palette: { size: 100, saturation: 50, lightness: 50, min: 160, max: 280 },
    phrase: "418: I'm a teapot",
  };
  constructor(t, e) {
    (e = { ...this.defaultOpts, ...e }),
      (this.container = t),
      (this.frameRate = e.frameRate),
      (this.interval = 1e3 / e.frameRate),
      (this.colors = this.makePalette(e.palette)),
      (this.phrase = e.phrase),
      this.gridify(t);
  }
  gridify(t) {
    t = Array.from(t.children);
    (this.gridWidth = Math.max(...t.map((t) => t.textContent.length))),
      (this.grid = t.map((t) => {
        let e = t.textContent;
        const s = Array.from(t.children);
        return (
          e.length < this.gridWidth &&
            (e += this.NBSP.repeat(this.gridWidth - e.length)),
          e.includes(this.phrase) &&
            (e.replace(this.phrase, this.NBSP.repeat(this.phrase.length)),
            (this.sp = t.querySelector(".h"))),
          e.split("").map((t) => (t != this.NBSP && s.pop()) || null)
        );
      }));
  }
  loop(r = 0) {
    var t;
    this.enabled &&
      ((t = Date.now()),
      this.grid.forEach((t) => {
        t.forEach((t, e) => {
          var s,
            a = this.getColor(r, e);
          null !== t &&
            "h" != t.className &&
            ((s = 10 * Math.cos(-(r + e) / 10)),
            (e = 10 * Math.sin(-(r + e) / 10)),
            (t.style.color = `hsl(${a.h}deg ${a.s}% ${a.l}%)`),
            (t.style.textShadow = `${s}px ${e}px 8px hsl(${a.h}deg ${a.s}% ${a.l}%)`));
        });
      }),
      null !== this.sp &&
        (this.sp.style.transform = `rotateX(-${r % 1800}deg)`),
      (t = Date.now() - t),
      setTimeout(() => this.loop(r + 1), Math.max(0, this.interval - t)));
  }
  start() {
    this.enabled
      ? console.log("already rainbz")
      : ((this.enabled = !0), this.loop());
  }
  stop() {
    this.enabled = !1;
  }
  updatePalette(t) {
    (t = { ...this.defaultOpts.palette, ...t }),
      (this.colors = this.makePalette(t));
  }
  getColor(t, e) {
    t = this.colors[(t + e) % this.colors.length];
    return this.colors.push(this.colors.shift()), t;
  }
  makePalette(t) {
    var { min: e, max: s, size: a, saturation: r, lightness: h } = t,
      i = [];
    let l = !1;
    for (let t = 0; t < a; t++) {
      var o = Math.floor((t / a) * 2 * (s - e)),
        o = { h: (l = s <= o + e ? !0 : l) ? e + o : s - o, s: r, l: h };
      i.push(o);
    }
    return i;
  }
  rotateMatrix(s, a) {
    var r = [];
    for (let e = 0; e < s.length; e++) {
      r[e] = [];
      for (let t = 0; t < s[e].length; t++) {
        var h = Math.floor(t * Math.cos(a) - e * Math.sin(a)),
          i = Math.floor(t * Math.sin(a) + e * Math.cos(a));
        (r[i] = r[i] || []), (r[i][h] = s?.[e]?.[t] || null);
      }
    }
    return r;
  }
}
