type HSLColor = { h: number; s: number; l: number };
type RGBColor = { r: number; g: number; b: number };

const rainbz = (() => {
  const memo: HSLColor[][] = [];
  return (numSteps: number, saturation = 100, lightness = 50) => {
    if (memo[numSteps]) return memo[numSteps];

    const colors: HSLColor[] = [];
    for (let i = 0; i < numSteps; i++) {
      const hue = (i / numSteps) * 360;
      const color = { h: Math.floor(hue), s: saturation, l: lightness };
      colors.push(color);
    }
    memo[numSteps] = colors;
    return colors;
  };
})();

const clrmatrx = (numSteps = 30, saturation = 100, lightness = 50) => {
  const colors = rainbz(numSteps, saturation, lightness);
  const grid: HSLColor[][] = [];
  for (let y = 0; y < numSteps; y++) {
    const row: HSLColor[] = [];
    for (let x = 0; x < numSteps; x++) {
      const colorIndex = Math.floor((x / numSteps) * colors.length);
      const color = colors[colorIndex];
      row.push(color);
    }
    grid.push(row);
  }
  return grid;
};

const hsbToRgb = (
  hue: number,
  saturation: number,
  lightness: number
): RGBColor => {
  const chroma = (lightness * saturation) / 100;
  const huePrime = hue / 60;
  const secondLargestComponent = 1 - Math.abs((huePrime % 2) - 1);
  const intermediate = chroma * secondLargestComponent;
  const match = lightness - chroma;
  let red: number, green: number, blue: number;
  if (huePrime >= 0 && huePrime < 1) {
    red = chroma;
    green = intermediate;
    blue = 0;
  } else if (huePrime >= 1 && huePrime < 2) {
    red = intermediate;
    green = chroma;
    blue = 0;
  } else if (huePrime >= 2 && huePrime < 3) {
    red = 0;
    green = chroma;
    blue = intermediate;
  } else if (huePrime >= 3 && huePrime < 4) {
    red = 0;
    green = intermediate;
    blue = chroma;
  } else if (huePrime >= 4 && huePrime < 5) {
    red = intermediate;
    green = 0;
    blue = chroma;
  } else if (huePrime >= 5 && huePrime < 6) {
    red = chroma;
    green = 0;
    blue = intermediate;
  } else {
    red = 0;
    green = 0;
    blue = 0;
  }
  red = Math.round(((red + match) * 255) / 100);
  green = Math.round(((green + match) * 255) / 100);
  blue = Math.round(((blue + match) * 255) / 100);
  return { r: red, g: green, b: blue };
};

enum PaintMode {
  CLI = "cli",
  HTML = "html",
}
type PaintOptions = {
  angle?: number; // broken
  saturation?: number;
  lightness?: number;
  filler?: string; // fill empty cells
  mode?: PaintMode;
  skip?: string; // char to skip
};
const paint = (input: string, opts: PaintOptions = {}) => {
  // configuration
  const defaults = {
    angle: 180,
    saturation: 100,
    lightness: 86,
    filler: " ",
    mode: PaintMode.CLI,
  };
  Object.assign(defaults, opts);
  const { saturation, lightness, filler, mode } = defaults;

  // templates
  type TemplateOptions = {
    r: number;
    g: number;
    b: number;
    y: number;
    x: number;
    c: string;
    hex: string;
  };
  const template = (mode: PaintMode, opts: TemplateOptions) => {
    const { r, g, b, y, x, c, hex } = opts;
    return {
      cli: `\u001b[38;2;${r};${g};${b}m${c}\u001b[0m`,
      html: `<span class="y${y} x${x} c" style="color:#${hex}">${c}</span>`,
    }[mode];
  };

  // input to matrix
  const mtrx = input
    .split("\n")
    .filter((r) => r.length > 0)
    .map((r) => r.split(""));

  // maximum row length
  let steps = mtrx.length;
  mtrx.forEach((r) => {
    steps = Math.max(steps, r.length);
  });

  // matrix of colors for each cell
  const texture = clrmatrx(steps, saturation, lightness);
  // paint
  const out: string[] = [];
  for (let y = 0; y < mtrx.length; y++) {
    let row: string = "";
    for (let x = 0; x < mtrx[y].length; x++) {
      // colors are hue, saturation, lightness from texture
      const { h, s, l } = texture[y][x];
      // convert colors to rgb
      let { r, g, b } = hsbToRgb(h, s, l);
      // paint a pixel
      const c = mtrx?.[y]?.[x] || filler;
      let hex = "";
      // and output it
      if (mode == PaintMode.HTML) {
        const t = (v: number) => v.toString(16).padStart(2, "0");
        hex = `${t(r)}${t(g)}${t(b)}`;
      }
      if (c == opts.skip) {
        row += c;
      } else {
        row += template(mode, { r, g, b, y, x, c, hex });
      }
    }
    if (mode == "cli") {
      out.push(row);
    } else {
      out.push(`<span class="r r${y}">${row}</span>`);
    }
  }
  return out.join("\n");
};

const teapot = `
                                  
                  
               ⡿⠛⠛
             ⡿⠧⠀⠀⠿⢿
   ⠿⠿⢿    ⡿⠿⣧⣤⣤⣤⣤⣤⣤⣾⠿
 ⡟⢀⣴⣶⣤⣼⠟⠛⠷⠶⢤⣤⣤⣤⣤⣤⣤⡤⠶⠾⠛⠻  ⠁⠀⢀⣨⣿
 ⡇⢸   ⠏⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠹ ⠀⠀
 ⡇⠸   ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⡶⠶⠟⠀⠀⢿
  ⣦⣈⢹⣧⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣼⡏⠀⠀⠀⠀⠀⢸
       ⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢻⣇⠀⠀⠀⠀⣠
        ⣦⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣻⣷⣶⣾
          ⡻⠶⣶⣤⣤⣤⣤⣤⣴⡶⠶⢟
            ⣦⣄⣀⣀⣀⣀⣀⣀⣤`;
const ima = "imateapot";
export const CliTeapot = `${paint(teapot, {
  mode: PaintMode.CLI,
})}\n            \u001b[38;2;255;171;112m${ima}\u001b[0m`;
const HtmlTeapot = `${paint(teapot, { mode: PaintMode.HTML })}
<span class="r r13" "style="color:#FFAB70"><span class="c y12 x3">             ${ima}</span></span>`;

export const Home = `
<html>
  <head>
    <meta charset="utf-8">
    <title>i'm a teapot</title>
    <style type="text/css">
      #teapot {
        font-family: monospace;
        font-size: 1.5em;
        width: 405px;
        margin: 100px auto;
      }
    </style>
  </head>
  <body style="background:#000;color:#fff">
    <pre id="teapot">${HtmlTeapot}</pre>
    <script type="text/javascript">
      const rainbz = (() => {
        const memo = [];
        return (numSteps, saturation = 100, lightness = 50) => {
          if (memo[numSteps]) return memo[numSteps];
      
          const colors = [];
          for (let i = 0; i < numSteps; i++) {
            const hue = (i / numSteps) * 360;
            const color = { h: Math.floor(hue), s: saturation, l: lightness };
            colors.push(color);
          }
          memo[numSteps] = colors;
          return colors;
        };
      })();
      const rotateMatrix = (matrix, angle) => {
        const newMatrix = [];
        for (let i = 0; i < matrix.length; i++) {
          newMatrix.push([]);
          for (let j = 0; j < matrix[i].length; j++) {
            const x = j * Math.cos(angle) - i * Math.sin(angle);
            const y = j * Math.sin(angle) + i * Math.cos(angle);
            const row = Math.floor(y);
            const col = Math.floor(x);
            if (row >= 0 && row < matrix.length && col >= 0 && col < matrix[row].length) {
              newMatrix[i].push(matrix[row][col]);
            } else {
              newMatrix[i].push(0);
            }
          }
        }
        return newMatrix;
      };
      
      const rollz = (grid, interval, angle = 360) => {
        let toggle = true
        let colorIndex = 0;
        let handle = null;

        const skip = Array.from(Array(grid.length), _ => Array(grid[0].children.length).fill(0));
        for(let i = 0; i < grid.length; i++) {
          for(let j = 0; j < grid[i].children.length; j++) {
            if(!(grid?.[i]?.children?.[j]) || grid[i].children[j].innerText == ' ') { skip[i][j] = 1; }
          }
        }

        const start = () => {
          handle = setInterval(() => {
            colorIndex = (colorIndex + 1) % grid[0].children.length;
            const colors = rainbz(grid[0].children.length, 100, 50, angle).slice(colorIndex).concat(rainbz(grid[0].children.length, 100, 50, angle).slice(0, colorIndex));
            for (let i = 0; i < grid.length; i++) {
              for (let j = 0; j < grid[i].children.length; j++) {
                if(skip[i][j]) { continue; }
                grid[i].children[j].style.color = \`hsl(\${colors[j].h}deg \${colors[j].s}% \${colors[j].l}%)\`;
                grid[i].children[j].style.textShadow = \`0 2px 10px hsl(\${colors[j].h}deg \${colors[j].s}% \${colors[j].l}%)\`;
              }
            }
          }, interval);
        }

        start();
        return () => { 
          toggle = !toggle;
          if(!toggle && handle) {
            clearInterval(handle)
            handle = null;
          } else { start(); }
        }
      }
      
      window.toggle = rollz(document.getElementById('teapot').children, 66);
      
    </script>
  </body>
</html>`;
