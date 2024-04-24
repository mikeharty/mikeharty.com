import fs from 'node:fs/promises';
import path from 'node:path';
import ENV from './env';

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

const hsbToRgb = (hue: number, saturation: number, lightness: number): RGBColor => {
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
  CLI = 'cli',
  HTML = 'html',
}
type PaintOptions = {
  angle?: number; // broken
  saturation?: number;
  lightness?: number;
  mode?: PaintMode;
};
const paint = (input: string, opts: PaintOptions = {}) => {
  // configuration
  const defaults = {
    angle: 180,
    saturation: 100,
    lightness: 86,
    mode: PaintMode.CLI,
  };
  Object.assign(defaults, opts);
  const { saturation, lightness, mode } = defaults;

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
      html: `<span class="y${y} x${x} c" style="color:#${hex};">${c}</span>`,
    }[mode];
  };

  // input to matrix
  const mtrx = input
    .split('\n')
    .filter((r) => r.length > 0)
    .map((r) => r.split(''));

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
    let row: string = '';
    for (let x = 0; x < mtrx[y].length; x++) {
      // colors are hue, saturation, lightness from texture
      const { h, s, l } = texture[y][x];
      // convert colors to rgb
      let { r, g, b } = hsbToRgb(h, s, l);
      // paint a pixel
      const c = mtrx?.[y]?.[x] || ' ';

      if (c == '!') {
        const end = mtrx[y].lastIndexOf('!');
        const sp = mtrx[y].slice(x + 1, end).join('');
        row += `<span class="hi">${sp}</span>`;
        x = end;
        continue;
      }

      let hex = '';
      if (mode == PaintMode.HTML) {
        const t = (v: number) => v.toString(16).padStart(2, '0');
        hex = `${t(r)}${t(g)}${t(b)}`;
      }

      if (c == ' ') {
        row += c;
      } else {
        row += template(mode, { r, g, b, y, x, c, hex });
      }
    }
    if (mode == 'cli') {
      out.push(row);
    } else {
      out.push(`<span class="r r${y}">${row}</span>`);
    }
  }
  return out.join('\n');
};
const teapot = `                                   .o,                                     
                                  o8o.c                                    
                                 )@8CoC(                                   
                                  8@ccC                            abb     
         .oooo.,                ..o@8@o..                        .8@@V     
      .oO*:.'"***coo,    .o88@88C\`cc:cc'C88@8@cc,              .\`88@\`      
     .o.:oo.....::ooOOCo'**@@8@88@CoCoC@88@8@@**cCO.          8oCCO\`       
     o:c8@@@@88@Coo88@88O8OOCO**8@8CcC8@8**ccccococoo.       8cooC8        
     8cc*8    '88o888O8OOCOCCoCoococc:c:c:::::c:c:ccoc'.   .8:c:c8         
     8o o8      8@@@88O8OOCOCCoooocccc:c:::::::c:cccco8@8@@8.:.:8\`         
     ;C.:C,    .@8@88O8OOCCoCoococc:c::.:.....:.::c:c@8CO8@.. ..8          
      ;o.:C;   8@@8@88O8OOCCoCoococc::.:.. . ..:.::cc@CCoc@..:.8\`          
       '8o:C8, @@8@88OOOOCCoCoocccc::.:..     ..:.::c8@8CO88o.c*           
        'C8CO8*@@@8@88O8OOCCoCoococc::.:.. . ..:.::cco'@8@@8@*\`            
         '@8CCO@@8@88O8OOCCoCoococc:c::.:.....:.::c:ccoc;88\`               
           '@88@@@@@88O8OOCOCCoooocccc:c:::::::c:ccccoooo8                 
             '@C@@@88O8OOCOCCoCoococc:c:c:::::c:c:ccocooC\`                 
               '*@@@8@88O8OOCOCCoCoocococccccccococooCo8\`                  
                 '8@@88O8OOCOCCoCoooocococococococoocC'                    
                   '*8@8@88O8OOCOCCCCoCoCoooooooCoCC8\`                     
                     "@8@888@8OOCOCCCCoCoCoCoCoCc8c\'                       
                       '8@a !418: I'm a teapot! cC8\`                         
                         *8@8C@8@@@8@@8@8CCCc**\`                           
 `;

export const CliTeapot = paint(teapot, { mode: PaintMode.CLI });
export const HtmlTeapot = paint(teapot, { mode: PaintMode.HTML });

export const renderHome = async () => {
  const home = await fs.readFile(path.join(ENV.TEMPLATE_DIR, 'home.html'), 'utf-8');
  const variablePattern = /\{%([^}]+)%\}/g;
  const variables = home.match(variablePattern);
  if (!variables) return home;
  const replacements = variables.map((v: string) => {
    const key = v.slice(2, -2).trim();
    const value = key === 'HtmlTeapot' ? HtmlTeapot : '';
    return [key, value];
  });
  let result = home;
  replacements.forEach(([key, value]: string[]) => {
    result = result.replace(new RegExp(`{% ${key} %}`, 'g'), value);
  });
  return result;
};
