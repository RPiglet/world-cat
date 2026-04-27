// ============================================================
// World Cat - Maximum-Detail 2D Pixel Art Sprite System
// PX=2 fine pixel grid, 24x40 field players, 28x40 goalkeepers
// Rich 16-bit aesthetic with 4x pixel density
// ============================================================

const Sprites = (() => {

  // ---- Color Utilities ----
  function hexToRgb(hex) {
    if (hex.startsWith('rgb')) {
      const m = hex.match(/(\d+)/g);
      return { r: +m[0], g: +m[1], b: +m[2] };
    }
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
  }

  function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(v => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0')).join('');
  }

  function darken(hex, amount) {
    const { r, g, b } = hexToRgb(hex);
    const f = 1 - amount;
    return rgbToHex(Math.floor(r * f), Math.floor(g * f), Math.floor(b * f));
  }

  function lighten(hex, amount) {
    const { r, g, b } = hexToRgb(hex);
    return rgbToHex(
      Math.floor(r + (255 - r) * amount),
      Math.floor(g + (255 - g) * amount),
      Math.floor(b + (255 - b) * amount)
    );
  }

  function blendColors(hex1, hex2, t) {
    const c1 = hexToRgb(hex1);
    const c2 = hexToRgb(hex2);
    return rgbToHex(
      Math.floor(c1.r + (c2.r - c1.r) * t),
      Math.floor(c1.g + (c2.g - c1.g) * t),
      Math.floor(c1.b + (c2.b - c1.b) * t)
    );
  }

  function makeRamp(base) {
    return {
      highlight: lighten(base, 0.4),
      mid: base,
      shadow: darken(base, 0.3),
      deep: darken(base, 0.55),
    };
  }

  // ---- Pixel Drawing Helpers ----
  const PX = 2;

  function drawPixelMap(ctx, baseX, baseY, map, scale) {
    const s = PX * scale;
    for (let row = 0; row < map.length; row++) {
      const r = map[row];
      for (let col = 0; col < r.length; col++) {
        const c = r[col];
        if (c) {
          ctx.fillStyle = c;
          ctx.fillRect(
            Math.floor((baseX + col) * s),
            Math.floor((baseY + row) * s),
            Math.ceil(s),
            Math.ceil(s)
          );
        }
      }
    }
  }

  function dither(c1, c2, row, col) {
    return ((row + col) & 1) ? c2 : c1;
  }

  // Deterministic pseudo-random
  function hashInt(x) {
    return ((x * 2654435761) >>> 0);
  }

  // ---- Uniform Colors ----
  const CAT_UNIFORM = {
    shirt: '#2d8a4e',
    shirtLight: '#4cc270',
    shirtMid: '#2d8a4e',
    shirtDark: '#1a6636',
    shirtDeep: '#0e4422',
    number: '#ffffff',
    numberOutline: '#1a6636',
    collar: '#1a6636',
    shorts: '#ffffff',
    shortsMid: '#eeeeee',
    shortsDark: '#cccccc',
    shortsDeep: '#aaaaaa',
    waistband: '#2d8a4e',
    socks: '#2d8a4e',
    socksCuff: '#4cc270',
    socksDark: '#1a6636',
    boots: '#333333',
    bootsHighlight: '#555555',
    bootsDark: '#1a1a1a',
    bootsSole: '#111111',
  };

  const MOUSE_UNIFORM = {
    shirt: '#f0f0f0',
    shirtLight: '#ffffff',
    shirtMid: '#f0f0f0',
    shirtDark: '#d0d0d0',
    shirtDeep: '#b0b0b0',
    number: '#222222',
    numberOutline: '#666666',
    collar: '#cccccc',
    shorts: '#222222',
    shortsMid: '#2a2a2a',
    shortsDark: '#151515',
    shortsDeep: '#0a0a0a',
    waistband: '#f0f0f0',
    socks: '#f0f0f0',
    socksCuff: '#ffffff',
    socksDark: '#cccccc',
    boots: '#222222',
    bootsHighlight: '#444444',
    bootsDark: '#111111',
    bootsSole: '#080808',
  };

  const CAT_GK = {
    shirt: '#ddcc00',
    shirtLight: '#ffee44',
    shirtMid: '#ddcc00',
    shirtDark: '#aa9900',
    shirtDeep: '#887700',
    number: '#222222',
    numberOutline: '#887700',
    collar: '#aa9900',
    accent: '#2d8a4e',
    shorts: '#ffffff',
    shortsMid: '#eeeeee',
    shortsDark: '#cccccc',
    shortsDeep: '#aaaaaa',
    waistband: '#ddcc00',
    socks: '#ddcc00',
    socksCuff: '#ffee44',
    socksDark: '#aa9900',
    boots: '#333333',
    bootsHighlight: '#555555',
    bootsDark: '#1a1a1a',
    bootsSole: '#111111',
    glove: '#44dd44',
    gloveLight: '#66ff66',
    gloveDark: '#22aa22',
  };

  const MOUSE_GK = {
    shirt: '#888888',
    shirtLight: '#aaaaaa',
    shirtMid: '#888888',
    shirtDark: '#666666',
    shirtDeep: '#444444',
    number: '#ffffff',
    numberOutline: '#444444',
    collar: '#666666',
    accent: '#222222',
    shorts: '#222222',
    shortsMid: '#2a2a2a',
    shortsDark: '#151515',
    shortsDeep: '#0a0a0a',
    waistband: '#888888',
    socks: '#888888',
    socksCuff: '#aaaaaa',
    socksDark: '#666666',
    boots: '#222222',
    bootsHighlight: '#444444',
    bootsDark: '#111111',
    bootsSole: '#080808',
    glove: '#44dd44',
    gloveLight: '#66ff66',
    gloveDark: '#22aa22',
  };

  // ---- Jersey Number Glyphs (4x6) ----
  const NUMBER_GLYPHS = {
    '0': [[1,1,1,1],[1,0,0,1],[1,0,0,1],[1,0,0,1],[1,0,0,1],[1,1,1,1]],
    '1': [[0,1,1,0],[1,1,1,0],[0,0,1,0],[0,0,1,0],[0,0,1,0],[1,1,1,1]],
    '2': [[1,1,1,1],[0,0,0,1],[1,1,1,1],[1,0,0,0],[1,0,0,0],[1,1,1,1]],
    '3': [[1,1,1,1],[0,0,0,1],[0,1,1,1],[0,0,0,1],[0,0,0,1],[1,1,1,1]],
    '4': [[1,0,0,1],[1,0,0,1],[1,1,1,1],[0,0,0,1],[0,0,0,1],[0,0,0,1]],
    '5': [[1,1,1,1],[1,0,0,0],[1,1,1,1],[0,0,0,1],[0,0,0,1],[1,1,1,1]],
    '6': [[1,1,1,1],[1,0,0,0],[1,1,1,1],[1,0,0,1],[1,0,0,1],[1,1,1,1]],
    '7': [[1,1,1,1],[0,0,0,1],[0,0,1,0],[0,0,1,0],[0,1,0,0],[0,1,0,0]],
    '8': [[1,1,1,1],[1,0,0,1],[1,1,1,1],[1,0,0,1],[1,0,0,1],[1,1,1,1]],
    '9': [[1,1,1,1],[1,0,0,1],[1,1,1,1],[0,0,0,1],[0,0,0,1],[1,1,1,1]],
  };

  function drawJerseyNumber(ctx, bx, by, num, color, outlineColor, scale) {
    const str = String(num);
    const totalW = str.length * 5 - 1;
    let ox = -Math.floor(totalW / 2);
    const s = PX * scale;
    for (let i = 0; i < str.length; i++) {
      const glyph = NUMBER_GLYPHS[str[i]];
      if (!glyph) { ox += 5; continue; }
      for (let r = 0; r < 6; r++) {
        for (let c = 0; c < 4; c++) {
          if (glyph[r][c]) {
            if (outlineColor) {
              ctx.fillStyle = outlineColor;
              ctx.fillRect(Math.floor((bx + ox + c) * s) - 1, Math.floor((by + r) * s) - 1,
                Math.ceil(s) + 2, Math.ceil(s) + 2);
            }
          }
        }
      }
      ox += 5;
    }
    ox = -Math.floor(totalW / 2);
    for (let i = 0; i < str.length; i++) {
      const glyph = NUMBER_GLYPHS[str[i]];
      if (!glyph) { ox += 5; continue; }
      for (let r = 0; r < 6; r++) {
        for (let c = 0; c < 4; c++) {
          if (glyph[r][c]) {
            ctx.fillStyle = color;
            ctx.fillRect(Math.floor((bx + ox + c) * s), Math.floor((by + r) * s),
              Math.ceil(s), Math.ceil(s));
          }
        }
      }
      ox += 5;
    }
  }

  // ===========================================================
  // ---- Cat Character Sprite Maps (24w x 40h) ----
  // Maximum detail: multi-shade fur, detailed eyes with specular,
  // whiskers, rich shirt with fold lines, jersey numbers,
  // separated legs with socks and boots, tail
  // ===========================================================

  function buildCatStand(fur, furDark, furLight, furDeep, eyeColor, pattern, uniform, number) {
    const _ = null;
    const f = fur, fd = furDark, fl = furLight, fdd = furDeep;
    const e = eyeColor, eDark = darken(eyeColor, 0.35), eLight = lighten(eyeColor, 0.3);
    const wht = '#ffffff', blk = '#111111', nose = '#ff8899', noseHi = '#ffaabb', noseDk = '#dd6677';
    const mouth = '#cc6677', whisker = '#ccbbaa';
    const earIn = lighten(fur, 0.35), earInD = lighten(fur, 0.15);
    const sh = uniform.shirt, shL = uniform.shirtLight, shM = uniform.shirtMid, shD = uniform.shirtDark, shDD = uniform.shirtDeep;
    const col = uniform.collar;
    const numC = uniform.number, numO = uniform.numberOutline;
    const srt = uniform.shorts, srtM = uniform.shortsMid, srtD = uniform.shortsDark, srtDD = uniform.shortsDeep;
    const wb = uniform.waistband;
    const sk = uniform.socks, skC = uniform.socksCuff, skD = uniform.socksDark;
    const bt = uniform.boots, btH = uniform.bootsHighlight, btD = uniform.bootsDark, btS = uniform.bootsSole;
    const pf = (pattern === 'striped' || pattern === 'tabby') ? fd : f;
    const pf2 = (pattern === 'striped' || pattern === 'tabby') ? fdd : fd;
    const fold1 = darken(uniform.shirt, 0.12);
    const fold2 = darken(uniform.shirt, 0.22);

    const map = [];
    // Row 0: Ear tips
    map.push([_,_,_,_,_,fdd,_,_,_,_,_,_,_,_,_,_,_,_,fdd,_,_,_,_,_]);
    // Row 1: Ears upper
    map.push([_,_,_,_,fdd,fd,_,_,_,_,_,_,_,_,_,_,_,_,fd,fdd,_,_,_,_]);
    // Row 2: Ears mid
    map.push([_,_,_,fdd,earIn,fd,_,_,_,_,_,_,_,_,_,_,_,_,fd,earIn,fdd,_,_,_]);
    // Row 3: Ears base
    map.push([_,_,_,fd,earInD,f,_,_,_,_,_,_,_,_,_,_,_,_,f,earInD,fd,_,_,_]);
    // Row 4: Skull top
    map.push([_,_,_,_,fd,f,f,f,f,f,f,f,f,f,f,f,f,f,f,fd,_,_,_,_]);
    // Row 5: Forehead upper with highlight
    map.push([_,_,_,fd,fl,fl,f,f,f,pf,f,f,f,f,pf,f,f,f,fl,fl,fd,_,_,_]);
    // Row 6: Forehead lower
    map.push([_,_,fd,fl,f,f,f,pf,f,f,f,f,f,f,f,f,pf,f,f,f,fl,fd,_,_]);
    // Row 7: Upper eye area
    map.push([_,_,fd,f,f,fd,fd,fd,f,f,f,fd,f,f,f,fd,fd,fd,f,f,f,fd,_,_]);
    // Row 8: Eyes row 1 - outline top
    map.push([_,_,f,f,blk,blk,blk,blk,f,f,f,f,f,f,f,f,blk,blk,blk,blk,f,f,_,_]);
    // Row 9: Eyes row 2 - sclera + iris
    map.push([_,_,fd,f,blk,wht,wht,blk,f,f,fd,f,f,fd,f,f,blk,wht,wht,blk,f,fd,_,_]);
    // Row 10: Eyes row 3 - iris + pupil + specular
    map.push([_,_,fd,f,blk,e,eDark,blk,f,f,f,nose,noseHi,f,f,f,blk,eDark,e,blk,f,fd,_,_]);
    // Row 11: Eyes row 4 - bottom outline + nose
    map.push([_,_,f,f,blk,blk,wht,blk,f,f,f,noseDk,nose,f,f,f,blk,wht,blk,blk,f,f,_,_]);
    // Row 12: Below eyes - nose bottom
    map.push([_,_,fd,f,f,f,f,f,f,f,f,f,noseDk,f,f,f,f,f,f,f,f,f,fd,_]);
    // Row 13: Mouth + whiskers
    map.push([whisker,whisker,_,fd,f,f,f,mouth,f,f,f,f,f,f,f,f,mouth,f,f,f,f,fd,_,whisker]);
    // Row 14: Chin + lower whiskers
    map.push([_,whisker,whisker,_,fd,f,f,f,f,f,f,f,f,f,f,f,f,f,f,fd,_,whisker,whisker,_]);
    // Row 15: Neck upper
    map.push([_,_,_,_,_,_,_,fd,f,f,fd,fd,fd,fd,f,f,fd,_,_,_,_,_,_,_]);
    // Row 16: Neck lower
    map.push([_,_,_,_,_,_,_,_,fd,f,fd,fd,fd,f,fd,_,_,_,_,_,_,_,_,_]);
    // Row 17: Collar
    map.push([_,_,_,_,_,col,col,col,col,col,col,col,col,col,col,col,col,col,col,_,_,_,_,_]);
    // Row 18: Upper chest / shoulders
    map.push([_,_,_,_,shL,shL,shL,sh,sh,sh,sh,sh,sh,sh,sh,sh,sh,shD,shD,shD,_,_,_,_]);
    // Row 19: Chest with arms start
    map.push([_,_,_,f,shL,shL,sh,sh,sh,fold1,sh,sh,sh,sh,fold1,sh,sh,sh,shD,shD,f,_,_,_]);
    // Row 20: Mid chest with arms
    map.push([_,_,f,fd,shL,sh,sh,sh,sh,sh,sh,sh,sh,sh,sh,sh,sh,sh,sh,shD,fd,f,_,_]);
    // Row 21: Jersey number area top
    map.push([_,_,_,f,sh,sh,fold1,numC,numC,numC,numC,numC,numC,numC,numC,numC,numC,fold1,sh,sh,f,_,_,_]);
    // Row 22: Jersey number area mid
    map.push([_,_,_,_,sh,sh,sh,numC,sh,sh,sh,sh,sh,sh,sh,sh,numC,sh,sh,sh,_,_,_,_]);
    // Row 23: Jersey number area bottom
    map.push([_,_,_,_,sh,fold1,sh,numC,numC,numC,numC,numC,numC,numC,numC,numC,numC,sh,fold1,sh,_,_,_,_]);
    // Row 24: Fold detail
    map.push([_,_,_,_,sh,sh,fold2,sh,sh,sh,fold1,sh,sh,fold1,sh,sh,sh,fold2,sh,sh,_,_,_,_]);
    // Row 25: Sleeve cuff visible
    map.push([_,_,_,_,_,shD,sh,sh,sh,sh,sh,sh,sh,sh,sh,sh,sh,sh,shD,_,_,_,_,_]);
    // Row 26: Lower shirt
    map.push([_,_,_,_,_,shD,shD,sh,sh,sh,sh,sh,sh,sh,sh,sh,sh,shDD,shD,_,_,_,_,_]);
    // Row 27: Shirt bottom
    map.push([_,_,_,_,_,_,shDD,shD,sh,sh,sh,sh,sh,sh,sh,sh,shD,shDD,_,_,_,_,_,_]);
    // Row 28: Shirt/waistband transition
    map.push([_,_,_,_,_,_,_,wb,wb,wb,wb,wb,wb,wb,wb,wb,wb,_,_,_,_,_,_,_]);
    // Row 29: Waistband
    map.push([_,_,_,_,_,_,srt,srt,srt,srt,srt,srt,srt,srt,srt,srt,srt,srt,_,_,_,_,_,_]);
    // Row 30: Shorts upper
    map.push([_,_,_,_,_,_,srt,srt,srtM,srtM,srtD,srtM,srtM,srtD,srtM,srtM,srt,srt,_,_,_,_,_,_]);
    // Row 31: Shorts mid
    map.push([_,_,_,_,_,_,srt,srt,srtM,srtD,_,_,_,_,srtD,srtM,srt,srt,_,_,_,_,_,_]);
    // Row 32: Shorts lower
    map.push([_,_,_,_,_,_,srt,srtD,srtDD,_,_,_,_,_,_,srtDD,srtD,srt,_,_,_,_,_,_]);
    // Row 33: Shorts hem
    map.push([_,_,_,_,_,_,_,srtDD,srtD,_,_,_,_,_,_,srtD,srtDD,_,_,_,_,_,_,_]);
    // Row 34: Sock cuff
    map.push([_,_,_,_,_,_,_,skC,skC,_,_,_,_,_,_,skC,skC,_,_,_,_,_,_,_]);
    // Row 35: Socks upper
    map.push([_,_,_,_,_,_,_,sk,skD,_,_,_,_,_,_,skD,sk,_,_,_,_,_,_,_]);
    // Row 36: Socks lower
    map.push([_,_,_,_,_,_,_,sk,skD,_,_,_,_,_,_,skD,sk,_,_,_,_,_,_,_]);
    // Row 37: Socks bottom
    map.push([_,_,_,_,_,_,_,skD,sk,_,_,_,_,_,_,sk,skD,_,_,_,_,_,_,_]);
    // Row 38: Boot top
    map.push([_,_,_,_,_,_,btH,bt,btD,_,_,_,_,_,_,btD,bt,btH,_,_,_,_,_,_]);
    // Row 39: Boot mid + toe highlight
    map.push([_,_,_,_,_,btH,btH,bt,btD,_,_,_,_,_,_,btD,bt,btH,btH,_,_,_,_,_]);
    // (overflow) Boot sole - we keep within 40 rows, compact the bottom
    // Actually let's use row 39 as sole
    map[39] = [_,_,_,_,_,btS,btS,btS,btS,_,_,_,_,_,_,btS,btS,btS,btS,_,_,_,_,_];
    // Replace row 38 as boot body
    map[38] = [_,_,_,_,_,_,btH,bt,btD,_,_,_,_,_,_,btD,bt,btH,_,_,_,_,_,_];

    return map;
  }

  function buildCatRun(fur, furDark, furLight, furDeep, eyeColor, pattern, uniform, number) {
    const _ = null;
    const f = fur, fd = furDark, fl = furLight, fdd = furDeep;
    const e = eyeColor, eDark = darken(eyeColor, 0.35);
    const wht = '#ffffff', blk = '#111111', nose = '#ff8899', noseHi = '#ffaabb';
    const whisker = '#ccbbaa';
    const earIn = lighten(fur, 0.35), earInD = lighten(fur, 0.15);
    const sh = uniform.shirt, shL = uniform.shirtLight, shD = uniform.shirtDark, shDD = uniform.shirtDeep;
    const col = uniform.collar;
    const srt = uniform.shorts, srtM = uniform.shortsMid, srtD = uniform.shortsDark, srtDD = uniform.shortsDeep;
    const wb = uniform.waistband;
    const sk = uniform.socks, skC = uniform.socksCuff, skD = uniform.socksDark;
    const bt = uniform.boots, btH = uniform.bootsHighlight, btD = uniform.bootsDark, btS = uniform.bootsSole;
    const pf = (pattern === 'striped' || pattern === 'tabby') ? fd : f;
    const fold1 = darken(uniform.shirt, 0.12);

    const map = [];
    // Tilted 2-3px right for forward lean, dynamic mid-stride
    // Row 0: Ear tips (shifted right 2px)
    map.push([_,_,_,_,_,_,fdd,_,_,_,_,_,_,_,_,_,_,_,_,fdd,_,_,_,_]);
    // Row 1: Ears
    map.push([_,_,_,_,_,fdd,fd,_,_,_,_,_,_,_,_,_,_,_,fd,fdd,_,_,_,_]);
    // Row 2: Ears mid
    map.push([_,_,_,_,fdd,earIn,fd,_,_,_,_,_,_,_,_,_,_,_,fd,earIn,fdd,_,_,_]);
    // Row 3: Head top (shifted right 2px for lean)
    map.push([_,_,_,_,_,fd,f,f,f,f,f,f,f,f,f,f,f,f,fd,_,_,_,_,_]);
    // Row 4: Forehead
    map.push([_,_,_,_,fd,fl,f,f,pf,f,f,f,f,f,f,pf,f,fl,fd,_,_,_,_,_]);
    // Row 5: Upper face
    map.push([_,_,_,_,fd,f,f,pf,f,f,f,f,f,f,f,f,pf,f,f,fd,_,_,_,_]);
    // Row 6: Eye outline top
    map.push([_,_,_,_,f,blk,blk,blk,blk,f,f,fd,f,f,f,blk,blk,blk,blk,f,_,_,_,_]);
    // Row 7: Eyes with iris
    map.push([_,_,_,_,fd,blk,wht,e,blk,f,f,f,f,f,f,blk,e,wht,blk,fd,_,_,_,_]);
    // Row 8: Eyes bottom + nose
    map.push([_,_,_,_,fd,blk,blk,blk,blk,f,f,nose,noseHi,f,f,blk,blk,blk,blk,fd,_,_,_,_]);
    // Row 9: Mouth
    map.push([_,_,whisker,_,_,fd,f,f,f,f,f,f,f,f,f,f,f,f,fd,_,_,whisker,_,_]);
    // Row 10: Chin
    map.push([_,_,_,whisker,_,_,fd,f,f,f,f,f,f,f,f,f,f,fd,_,_,whisker,_,_,_]);
    // Row 11: Neck (leaning forward)
    map.push([_,_,_,_,_,_,_,_,fd,fd,fd,fd,fd,f,_,_,_,_,_,_,_,_,_,_]);
    // Row 12: Collar
    map.push([_,_,_,_,_,_,col,col,col,col,col,col,col,col,col,_,_,_,_,_,_,_,_,_]);
    // Row 13: Upper shirt (leaning forward)
    map.push([_,_,_,_,_,shL,shL,sh,sh,sh,sh,sh,sh,sh,sh,shD,_,_,_,_,_,_,_,_]);
    // Row 14: Shirt with arm forward
    map.push([_,_,_,fd,_,shL,sh,sh,fold1,sh,sh,sh,fold1,sh,sh,shD,_,fd,_,_,_,_,_,_]);
    // Row 15: Mid shirt
    map.push([_,_,_,_,fd,sh,sh,sh,sh,sh,sh,sh,sh,sh,sh,shD,fd,_,_,_,_,_,_,_]);
    // Row 16: Shirt body
    map.push([_,_,_,_,_,sh,sh,fold1,sh,sh,sh,sh,sh,sh,fold1,sh,_,_,_,_,_,_,_,_]);
    // Row 17: Lower shirt
    map.push([_,_,_,_,_,_,shD,sh,sh,sh,sh,sh,sh,sh,shDD,_,_,_,_,_,_,_,_,_]);
    // Row 18: Waistband
    map.push([_,_,_,_,_,_,_,wb,wb,wb,wb,wb,wb,wb,_,_,_,_,_,_,_,_,_,_]);
    // Row 19: Shorts
    map.push([_,_,_,_,_,_,srt,srt,srtM,srtD,srtM,srtM,srt,srt,_,_,_,_,_,_,_,_,_,_]);
    // Row 20: Shorts split
    map.push([_,_,_,_,_,srt,srt,srtD,_,_,_,_,srtD,srt,srt,_,_,_,_,_,_,_,_,_]);
    // Row 21: Shorts hem
    map.push([_,_,_,_,srtDD,srtD,_,_,_,_,_,_,_,_,srtD,srtDD,_,_,_,_,_,_,_,_]);
    // Row 22: Left leg forward, right leg back (wide stride)
    map.push([_,_,_,skC,sk,_,_,_,_,_,_,_,_,_,_,_,sk,skC,_,_,_,_,_,_]);
    // Row 23: Socks
    map.push([_,_,skC,skD,_,_,_,_,_,_,_,_,_,_,_,_,_,skD,skC,_,_,_,_,_]);
    // Row 24: Socks lower
    map.push([_,sk,skD,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,skD,sk,_,_,_,_]);
    // Row 25: Extended stride
    map.push([sk,skD,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,skD,sk,_,_,_]);
    // Row 26: Boots
    map.push([btH,bt,btD,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,bt,btH,_,_]);
    // Row 27: Soles
    map.push([btS,btS,btS,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,btS,btS,btS,_]);
    // Row 28: Tail streaming behind
    map.push([_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,f,pf,_]);
    // Row 29: Tail
    map.push([_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,fd,_]);
    // Rows 30-39: padding
    for (let i = 0; i < 10; i++) map.push([_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_]);

    return map;
  }

  function buildCatKick(fur, furDark, furLight, furDeep, eyeColor, pattern, uniform, number) {
    const _ = null;
    const f = fur, fd = furDark, fl = furLight, fdd = furDeep;
    const e = eyeColor, eDark = darken(eyeColor, 0.35);
    const wht = '#ffffff', blk = '#111111', nose = '#ff8899', noseHi = '#ffaabb';
    const whisker = '#ccbbaa';
    const earIn = lighten(fur, 0.35);
    const sh = uniform.shirt, shL = uniform.shirtLight, shD = uniform.shirtDark, shDD = uniform.shirtDeep;
    const col = uniform.collar;
    const numC = uniform.number;
    const srt = uniform.shorts, srtM = uniform.shortsMid, srtD = uniform.shortsDark, srtDD = uniform.shortsDeep;
    const wb = uniform.waistband;
    const sk = uniform.socks, skC = uniform.socksCuff, skD = uniform.socksDark;
    const bt = uniform.boots, btH = uniform.bootsHighlight, btD = uniform.bootsDark, btS = uniform.bootsSole;
    const pf = (pattern === 'striped' || pattern === 'tabby') ? fd : f;
    const fold1 = darken(uniform.shirt, 0.15);

    // 28 wide to accommodate extended kicking leg
    const W = 28;
    const row = () => new Array(W).fill(_);
    const map = [];

    // Row 0: Ear tip (leaning back 3-4px)
    let r = row(); r[3]=fdd; r[4]=fd; r[13]=fd; r[14]=fdd; map.push(r);
    // Row 1: Ears
    r = row(); r[2]=fdd; r[3]=earIn; r[4]=fd; r[12]=fd; r[13]=earIn; r[14]=fdd; map.push(r);
    // Row 2: Head top (leaning back)
    r = row(); r[2]=fd; r[3]=f; r[4]=f; r[5]=f; r[6]=f; r[7]=f; r[8]=f; r[9]=f; r[10]=f; r[11]=f; r[12]=f; r[13]=fd; map.push(r);
    // Row 3: Forehead
    r = row(); r[1]=fd; r[2]=fl; r[3]=f; r[4]=pf; r[5]=f; r[6]=f; r[7]=f; r[8]=f; r[9]=pf; r[10]=f; r[11]=fl; r[12]=fd; map.push(r);
    // Row 4: Eyes top
    r = row(); r[1]=f; r[2]=blk; r[3]=blk; r[4]=blk; r[5]=blk; r[6]=f; r[7]=fd; r[8]=f; r[9]=blk; r[10]=blk; r[11]=blk; r[12]=blk; r[13]=f; map.push(r);
    // Row 5: Eyes iris
    r = row(); r[1]=fd; r[2]=blk; r[3]=wht; r[4]=e; r[5]=blk; r[6]=f; r[7]=f; r[8]=f; r[9]=blk; r[10]=e; r[11]=wht; r[12]=blk; r[13]=fd; map.push(r);
    // Row 6: Nose
    r = row(); r[1]=fd; r[2]=f; r[3]=f; r[4]=f; r[5]=f; r[6]=f; r[7]=nose; r[8]=noseHi; r[9]=f; r[10]=f; r[11]=f; r[12]=f; r[13]=fd; map.push(r);
    // Row 7: Mouth + whiskers
    r = row(); r[0]=whisker; r[1]=_; r[2]=fd; r[3]=f; r[4]=f; r[5]=f; r[6]=f; r[7]=f; r[8]=f; r[9]=f; r[10]=f; r[11]=f; r[12]=fd; r[13]=_; r[14]=whisker; map.push(r);
    // Row 8: Chin
    r = row(); r[2]=_; r[3]=fd; r[4]=f; r[5]=f; r[6]=f; r[7]=f; r[8]=f; r[9]=f; r[10]=f; r[11]=fd; map.push(r);
    // Row 9: Neck
    r = row(); r[4]=fd; r[5]=f; r[6]=fd; r[7]=fd; r[8]=fd; r[9]=f; map.push(r);
    // Row 10: Collar
    r = row(); r[3]=col; r[4]=col; r[5]=col; r[6]=col; r[7]=col; r[8]=col; r[9]=col; r[10]=col; map.push(r);
    // Row 11: Upper shirt (leaning back, arms spread for balance)
    r = row(); r[1]=f; r[2]=_; r[3]=shL; r[4]=sh; r[5]=sh; r[6]=sh; r[7]=sh; r[8]=sh; r[9]=sh; r[10]=shD; r[11]=_; r[12]=f; map.push(r);
    // Row 12: Shirt
    r = row(); r[0]=f; r[1]=_; r[2]=_; r[3]=sh; r[4]=sh; r[5]=fold1; r[6]=sh; r[7]=fold1; r[8]=sh; r[9]=sh; r[10]=shD; r[11]=_; r[12]=_; r[13]=f; map.push(r);
    // Row 13: Shirt with number
    r = row(); r[3]=sh; r[4]=numC; r[5]=numC; r[6]=numC; r[7]=numC; r[8]=numC; r[9]=sh; r[10]=shD; map.push(r);
    // Row 14: Lower shirt
    r = row(); r[3]=shD; r[4]=sh; r[5]=sh; r[6]=sh; r[7]=sh; r[8]=sh; r[9]=shDD; map.push(r);
    // Row 15: Waistband
    r = row(); r[4]=wb; r[5]=wb; r[6]=wb; r[7]=wb; r[8]=wb; r[9]=wb; map.push(r);
    // Row 16: Shorts (kick pose)
    r = row(); r[3]=srt; r[4]=srtM; r[5]=srtD; r[6]=srtM; r[7]=srt; r[8]=_; r[9]=_; map.push(r);
    // Row 17: Shorts split
    r = row(); r[3]=srt; r[4]=srt; r[5]=_; r[6]=_; r[7]=_; r[8]=srt; map.push(r);
    // Row 18: Support leg sock + kicking leg extends right
    r = row(); r[3]=skC; r[4]=skD; r[9]=skC; r[10]=sk; r[11]=sk; map.push(r);
    // Row 19: Support leg
    r = row(); r[3]=sk; r[4]=skD; r[11]=skD; r[12]=sk; r[13]=sk; map.push(r);
    // Row 20: Support leg lower
    r = row(); r[3]=sk; r[4]=skD; r[13]=sk; r[14]=skD; r[15]=sk; map.push(r);
    // Row 21: Kicking leg far out
    r = row(); r[3]=sk; r[4]=skD; r[15]=sk; r[16]=skD; r[17]=sk; map.push(r);
    // Row 22: Boot planted + kick boot
    r = row(); r[3]=bt; r[4]=btD; r[17]=btH; r[18]=bt; r[19]=btD; map.push(r);
    // Row 23: Soles
    r = row(); r[2]=btH; r[3]=bt; r[4]=btS; r[18]=btS; r[19]=btS; r[20]=btS; map.push(r);
    // Row 24: Tail up for balance
    r = row(); r[0]=f; r[1]=pf; map.push(r);
    // Row 25: Tail
    r = row(); r[1]=f; r[2]=fd; map.push(r);
    // Rows 26-39: padding
    for (let i = 0; i < 14; i++) map.push(row());

    return map;
  }

  function buildCatCelebrate(fur, furDark, furLight, furDeep, eyeColor, pattern, uniform, number) {
    const _ = null;
    const f = fur, fd = furDark, fl = furLight, fdd = furDeep;
    const e = eyeColor;
    const wht = '#ffffff', blk = '#111111', nose = '#ff8899', noseHi = '#ffaabb';
    const smile = '#cc4455', whisker = '#ccbbaa';
    const earIn = lighten(fur, 0.35);
    const sh = uniform.shirt, shL = uniform.shirtLight, shD = uniform.shirtDark, shDD = uniform.shirtDeep;
    const col = uniform.collar;
    const numC = uniform.number;
    const srt = uniform.shorts, srtM = uniform.shortsMid, srtD = uniform.shortsDark;
    const wb = uniform.waistband;
    const sk = uniform.socks, skC = uniform.socksCuff, skD = uniform.socksDark;
    const bt = uniform.boots, btH = uniform.bootsHighlight, btD = uniform.bootsDark;
    const pf = (pattern === 'striped' || pattern === 'tabby') ? fd : f;

    const map = [];
    // Row 0-3: Arms raised ABOVE head (6-8px above ears), fists
    map.push([_,_,f,fd,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,fd,f,_]);
    map.push([_,_,f,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,f,_]);
    map.push([_,_,f,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,f,_]);
    map.push([_,_,f,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,f,_]);
    // Row 4: Arms + ear tips
    map.push([_,_,f,_,_,_,fdd,fd,_,_,_,_,_,_,_,_,fd,fdd,_,_,_,_,f,_]);
    // Row 5: Ears
    map.push([_,_,f,_,_,fdd,earIn,fd,_,_,_,_,_,_,_,_,fd,earIn,fdd,_,_,_,f,_]);
    // Row 6: Head top (tilted up)
    map.push([_,_,_,_,fd,f,f,f,f,f,f,f,f,f,f,f,f,f,f,fd,_,_,_,_]);
    // Row 7: Forehead
    map.push([_,_,_,fd,fl,f,f,f,f,f,f,f,f,f,f,f,f,f,fl,fd,_,_,_,_]);
    // Row 8: Eyes squinted (happy)
    map.push([_,_,_,f,f,blk,blk,f,f,f,f,f,f,f,f,f,f,blk,blk,f,f,_,_,_]);
    // Row 9: Nose
    map.push([_,_,_,fd,f,f,f,f,f,f,f,nose,noseHi,f,f,f,f,f,f,f,fd,_,_,_]);
    // Row 10: Big smile (O-shape mouth open)
    map.push([_,_,whisker,_,fd,f,f,smile,smile,smile,smile,smile,smile,smile,smile,smile,f,f,fd,_,whisker,_,_,_]);
    // Row 11: Chin
    map.push([_,_,_,_,_,fd,f,f,f,f,f,f,f,f,f,f,f,f,fd,_,_,_,_,_]);
    // Row 12: Neck
    map.push([_,_,_,_,_,_,_,_,fd,fd,fd,fd,fd,fd,fd,_,_,_,_,_,_,_,_,_]);
    // Row 13: Collar
    map.push([_,_,_,_,_,_,col,col,col,col,col,col,col,col,col,col,col,_,_,_,_,_,_,_]);
    // Row 14: Shirt (arms up so sleeves visible at top)
    map.push([_,_,_,_,_,shL,sh,sh,sh,sh,sh,sh,sh,sh,sh,sh,sh,sh,shD,_,_,_,_,_]);
    // Row 15: Shirt
    map.push([_,_,_,_,_,sh,sh,numC,numC,numC,numC,numC,numC,numC,numC,numC,sh,sh,shD,_,_,_,_,_]);
    // Row 16: Shirt
    map.push([_,_,_,_,_,sh,sh,sh,numC,sh,sh,sh,sh,sh,numC,sh,sh,sh,shD,_,_,_,_,_]);
    // Row 17: Lower shirt
    map.push([_,_,_,_,_,_,shD,sh,sh,sh,sh,sh,sh,sh,sh,sh,sh,shDD,_,_,_,_,_,_]);
    // Row 18: Waistband
    map.push([_,_,_,_,_,_,_,wb,wb,wb,wb,wb,wb,wb,wb,wb,wb,_,_,_,_,_,_,_]);
    // Row 19: Shorts
    map.push([_,_,_,_,_,_,_,srt,srtM,srtD,srtM,srt,srt,srtM,srtD,srtM,srt,_,_,_,_,_,_,_]);
    // Row 20: Jump gap (2px off baseline)
    map.push([_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_]);
    // Row 21: Socks
    map.push([_,_,_,_,_,_,_,_,skC,sk,_,_,_,_,sk,skC,_,_,_,_,_,_,_,_]);
    // Row 22: Socks
    map.push([_,_,_,_,_,_,_,_,sk,skD,_,_,_,_,skD,sk,_,_,_,_,_,_,_,_]);
    // Row 23: Boots
    map.push([_,_,_,_,_,_,_,_,btH,bt,_,_,_,_,bt,btH,_,_,_,_,_,_,_,_]);
    // Row 24: Boots
    map.push([_,_,_,_,_,_,_,btH,bt,btD,_,_,_,_,btD,bt,btH,_,_,_,_,_,_,_]);
    // Row 25: Air gap
    map.push([_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_]);
    // Row 26: Tail (happy, up)
    map.push([_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,f,pf,_,_,_,_]);
    // Row 27: Tail
    map.push([_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,f,fd,_,_,_,_,_]);
    // Rows 28-39: padding
    for (let i = 0; i < 12; i++) map.push([_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_]);

    return map;
  }

  function buildCatSad(fur, furDark, furLight, furDeep, eyeColor, pattern, uniform, number) {
    const _ = null;
    const f = fur, fd = furDark, fl = furLight, fdd = furDeep;
    const e = eyeColor;
    const wht = '#ffffff', blk = '#111111', nose = '#ff8899', mouth = '#886677';
    const earIn = lighten(fur, 0.35);
    const sh = uniform.shirt, shL = uniform.shirtLight, shD = uniform.shirtDark, shDD = uniform.shirtDeep;
    const col = uniform.collar;
    const numC = uniform.number;
    const srt = uniform.shorts, srtM = uniform.shortsMid, srtD = uniform.shortsDark;
    const wb = uniform.waistband;
    const sk = uniform.socks, skC = uniform.socksCuff, skD = uniform.socksDark;
    const bt = uniform.boots, btH = uniform.bootsHighlight, btD = uniform.bootsDark, btS = uniform.bootsSole;
    const pf = (pattern === 'striped' || pattern === 'tabby') ? fd : f;

    const map = [];
    // Row 0: Droopy ears (pointing outward/down)
    map.push([_,_,_,fdd,fd,_,_,_,_,_,_,_,_,_,_,_,_,_,_,fd,fdd,_,_,_]);
    // Row 1: Ears drooping
    map.push([_,_,fd,earIn,fd,_,_,_,_,_,_,_,_,_,_,_,_,_,_,fd,earIn,fd,_,_]);
    // Row 2-3: Head dropped 3px (empty space)
    map.push([_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_]);
    map.push([_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_]);
    // Row 4: Head top
    map.push([_,_,_,_,_,fd,f,f,f,f,f,f,f,f,f,f,f,f,fd,_,_,_,_,_]);
    // Row 5: Forehead (narrowed for sad)
    map.push([_,_,_,_,fd,f,fd,f,f,f,f,f,f,f,f,f,f,fd,f,fd,_,_,_,_]);
    // Row 6: Brow furrowed
    map.push([_,_,_,_,f,f,f,fd,fd,fd,fd,fd,fd,fd,fd,fd,fd,f,f,f,_,_,_,_]);
    // Row 7: Eyes looking down
    map.push([_,_,_,_,f,f,wht,e,f,f,f,f,f,f,f,f,e,wht,f,f,_,_,_,_]);
    // Row 8: Nose
    map.push([_,_,_,_,fd,f,f,f,f,f,f,nose,f,f,f,f,f,f,f,fd,_,_,_,_]);
    // Row 9: Sad mouth (downturned)
    map.push([_,_,_,_,_,fd,f,mouth,f,f,f,f,f,f,f,mouth,f,fd,_,_,_,_,_,_]);
    // Row 10: Chin
    map.push([_,_,_,_,_,_,fd,f,f,f,f,f,f,f,f,f,f,fd,_,_,_,_,_,_]);
    // Row 11: Neck (hunched)
    map.push([_,_,_,_,_,_,_,_,fd,fd,fd,fd,fd,fd,fd,_,_,_,_,_,_,_,_,_]);
    // Row 12: Collar
    map.push([_,_,_,_,_,_,col,col,col,col,col,col,col,col,col,col,col,_,_,_,_,_,_,_]);
    // Row 13: Shirt (slumped shoulders, narrower by 2px each side)
    map.push([_,_,_,_,_,_,_,shD,sh,sh,sh,sh,sh,sh,sh,sh,shD,_,_,_,_,_,_,_]);
    // Row 14: Shirt with number
    map.push([_,_,_,_,_,_,_,sh,sh,numC,numC,numC,numC,numC,numC,sh,shD,_,_,_,_,_,_,_]);
    // Row 15: Shirt
    map.push([_,_,_,_,_,_,_,sh,sh,sh,numC,sh,sh,numC,sh,sh,shD,_,_,_,_,_,_,_]);
    // Row 16: Lower shirt
    map.push([_,_,_,_,_,_,_,_,shD,sh,sh,sh,sh,sh,sh,shDD,_,_,_,_,_,_,_,_]);
    // Row 17: Waistband
    map.push([_,_,_,_,_,_,_,_,wb,wb,wb,wb,wb,wb,wb,wb,_,_,_,_,_,_,_,_]);
    // Row 18: Shorts
    map.push([_,_,_,_,_,_,_,_,srt,srtM,srtD,srtM,srtM,srtD,srtM,srt,_,_,_,_,_,_,_,_]);
    // Row 19: Shorts
    map.push([_,_,_,_,_,_,_,_,srt,srt,_,_,_,_,srt,srt,_,_,_,_,_,_,_,_]);
    // Row 20: Socks (feet together, limp)
    map.push([_,_,_,_,_,_,_,_,skC,sk,_,_,_,_,sk,skC,_,_,_,_,_,_,_,_]);
    // Row 21: Socks
    map.push([_,_,_,_,_,_,_,_,sk,skD,_,_,_,_,skD,sk,_,_,_,_,_,_,_,_]);
    // Row 22: Socks
    map.push([_,_,_,_,_,_,_,_,sk,skD,_,_,_,_,skD,sk,_,_,_,_,_,_,_,_]);
    // Row 23: Boots
    map.push([_,_,_,_,_,_,_,_,btH,bt,_,_,_,_,bt,btH,_,_,_,_,_,_,_,_]);
    // Row 24: Boots
    map.push([_,_,_,_,_,_,_,btH,bt,btD,_,_,_,_,btD,bt,btH,_,_,_,_,_,_,_]);
    // Row 25: Soles
    map.push([_,_,_,_,_,_,_,btS,btS,btS,_,_,_,_,btS,btS,btS,_,_,_,_,_,_,_]);
    // Row 26: Tail droopy
    map.push([_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,f,_,_,_,_,_]);
    // Row 27: Tail
    map.push([_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,fd,f,_,_,_,_]);
    // Row 28: Tail tip
    map.push([_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,fd,pf,_,_,_]);
    // Rows 29-39: padding
    for (let i = 0; i < 11; i++) map.push([_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_]);

    return map;
  }

  // ===========================================================
  // ---- Mouse Character Sprite Maps (24w x 40h) ----
  // ===========================================================

  function buildMouseStand(fur, furDark, furLight, furDeep, eyeColor, earColor, uniform, number) {
    const _ = null;
    const f = fur, fd = furDark, fl = furLight, fdd = furDeep;
    const e = eyeColor;
    const ear = earColor, earIn = '#ffbbcc', earInD = '#ffaaaa';
    const wht = '#ffffff', blk = '#111111', nose = '#ff9999', noseHi = '#ffbbbb', mouth = '#cc7788';
    const sh = uniform.shirt, shL = uniform.shirtLight, shD = uniform.shirtDark, shDD = uniform.shirtDeep;
    const col = uniform.collar;
    const numC = uniform.number;
    const srt = uniform.shorts, srtM = uniform.shortsMid, srtD = uniform.shortsDark, srtDD = uniform.shortsDeep;
    const wb = uniform.waistband;
    const sk = uniform.socks, skC = uniform.socksCuff, skD = uniform.socksDark;
    const bt = uniform.boots, btH = uniform.bootsHighlight, btD = uniform.bootsDark, btS = uniform.bootsSole;
    const fold1 = darken(uniform.shirt, 0.12);

    const map = [];
    // Row 0: Large round ears (semicircle tops, 5px wide each side)
    map.push([_,_,_,ear,ear,ear,ear,_,_,_,_,_,_,_,_,_,_,ear,ear,ear,ear,_,_,_]);
    // Row 1: Ear inner
    map.push([_,_,ear,earIn,earIn,earIn,ear,_,_,_,_,_,_,_,_,_,_,ear,earIn,earIn,earIn,ear,_,_]);
    // Row 2: Ear lower
    map.push([_,_,ear,earInD,earIn,earInD,ear,_,_,_,_,_,_,_,_,_,_,ear,earInD,earIn,earInD,ear,_,_]);
    // Row 3: Ear base
    map.push([_,_,_,ear,ear,ear,_,_,_,_,_,_,_,_,_,_,_,_,ear,ear,ear,_,_,_]);
    // Row 4: Skull top
    map.push([_,_,_,_,_,fd,f,f,f,f,f,f,f,f,f,f,f,f,fd,_,_,_,_,_]);
    // Row 5: Forehead
    map.push([_,_,_,_,fd,fl,f,f,f,f,f,f,f,f,f,f,f,f,fl,fd,_,_,_,_]);
    // Row 6: Upper face
    map.push([_,_,_,fd,fl,f,f,f,f,f,f,f,f,f,f,f,f,f,f,fl,fd,_,_,_]);
    // Row 7: Eye outline top
    map.push([_,_,_,f,f,blk,blk,blk,blk,f,f,f,f,f,f,blk,blk,blk,blk,f,f,_,_,_]);
    // Row 8: Eyes with iris (round pupils for mice)
    map.push([_,_,_,fd,f,blk,wht,wht,blk,f,f,fd,fd,f,f,blk,wht,wht,blk,f,fd,_,_,_]);
    // Row 9: Eyes iris + pupil
    map.push([_,_,_,fd,f,blk,e,blk,blk,f,f,f,f,f,f,blk,blk,e,blk,f,fd,_,_,_]);
    // Row 10: Below eyes + nose
    map.push([_,_,_,f,f,blk,wht,blk,blk,f,f,nose,noseHi,f,f,blk,blk,wht,blk,f,f,_,_,_]);
    // Row 11: Nose bottom area
    map.push([_,_,_,_,fd,f,f,f,f,f,f,f,nose,f,f,f,f,f,f,f,fd,_,_,_]);
    // Row 12: Mouth
    map.push([_,_,_,_,_,fd,f,f,mouth,f,f,f,f,f,f,mouth,f,f,fd,_,_,_,_,_]);
    // Row 13: Chin
    map.push([_,_,_,_,_,_,fd,f,f,f,f,f,f,f,f,f,f,fd,_,_,_,_,_,_]);
    // Row 14: Jaw
    map.push([_,_,_,_,_,_,_,fd,f,f,f,f,f,f,f,f,fd,_,_,_,_,_,_,_]);
    // Row 15: Neck upper
    map.push([_,_,_,_,_,_,_,_,fd,f,fd,fd,fd,f,fd,_,_,_,_,_,_,_,_,_]);
    // Row 16: Neck lower
    map.push([_,_,_,_,_,_,_,_,_,fd,fd,fd,fd,fd,_,_,_,_,_,_,_,_,_,_]);
    // Row 17: Collar
    map.push([_,_,_,_,_,col,col,col,col,col,col,col,col,col,col,col,col,col,col,_,_,_,_,_]);
    // Row 18: Shoulders
    map.push([_,_,_,_,shL,shL,shL,sh,sh,sh,sh,sh,sh,sh,sh,sh,sh,shD,shD,shD,_,_,_,_]);
    // Row 19: Chest with arms
    map.push([_,_,_,f,shL,shL,sh,sh,sh,fold1,sh,sh,sh,sh,fold1,sh,sh,sh,shD,shD,f,_,_,_]);
    // Row 20: Mid chest
    map.push([_,_,f,fd,shL,sh,sh,sh,sh,sh,sh,sh,sh,sh,sh,sh,sh,sh,sh,shD,fd,f,_,_]);
    // Row 21: Number area
    map.push([_,_,_,f,sh,sh,fold1,numC,numC,numC,numC,numC,numC,numC,numC,numC,numC,fold1,sh,sh,f,_,_,_]);
    // Row 22: Number mid
    map.push([_,_,_,_,sh,sh,sh,numC,sh,sh,sh,sh,sh,sh,sh,sh,numC,sh,sh,sh,_,_,_,_]);
    // Row 23: Number bottom
    map.push([_,_,_,_,sh,fold1,sh,numC,numC,numC,numC,numC,numC,numC,numC,numC,numC,sh,fold1,sh,_,_,_,_]);
    // Row 24: Fold detail
    map.push([_,_,_,_,_,shD,sh,sh,sh,sh,fold1,sh,sh,fold1,sh,sh,sh,sh,shD,_,_,_,_,_]);
    // Row 25: Lower shirt
    map.push([_,_,_,_,_,shD,shD,sh,sh,sh,sh,sh,sh,sh,sh,sh,sh,shDD,shD,_,_,_,_,_]);
    // Row 26: Shirt bottom
    map.push([_,_,_,_,_,_,shDD,shD,sh,sh,sh,sh,sh,sh,sh,sh,shD,shDD,_,_,_,_,_,_]);
    // Row 27: Waistband
    map.push([_,_,_,_,_,_,_,wb,wb,wb,wb,wb,wb,wb,wb,wb,wb,_,_,_,_,_,_,_]);
    // Row 28: Shorts upper
    map.push([_,_,_,_,_,_,srt,srt,srtM,srtM,srtD,srtM,srtM,srtD,srtM,srtM,srt,srt,_,_,_,_,_,_]);
    // Row 29: Shorts mid
    map.push([_,_,_,_,_,_,srt,srt,srtM,srtD,_,_,_,_,srtD,srtM,srt,srt,_,_,_,_,_,_]);
    // Row 30: Shorts hem
    map.push([_,_,_,_,_,_,_,srtDD,srtD,_,_,_,_,_,_,srtD,srtDD,_,_,_,_,_,_,_]);
    // Row 31: Sock cuff
    map.push([_,_,_,_,_,_,_,skC,skC,_,_,_,_,_,_,skC,skC,_,_,_,_,_,_,_]);
    // Row 32: Socks
    map.push([_,_,_,_,_,_,_,sk,skD,_,_,_,_,_,_,skD,sk,_,_,_,_,_,_,_]);
    // Row 33: Socks
    map.push([_,_,_,_,_,_,_,sk,skD,_,_,_,_,_,_,skD,sk,_,_,_,_,_,_,_]);
    // Row 34: Socks bottom
    map.push([_,_,_,_,_,_,_,skD,sk,_,_,_,_,_,_,sk,skD,_,_,_,_,_,_,_]);
    // Row 35: Boot top
    map.push([_,_,_,_,_,_,btH,bt,btD,_,_,_,_,_,_,btD,bt,btH,_,_,_,_,_,_]);
    // Row 36: Boot body
    map.push([_,_,_,_,_,btH,btH,bt,btD,_,_,_,_,_,_,btD,bt,btH,btH,_,_,_,_,_]);
    // Row 37: Sole
    map.push([_,_,_,_,_,btS,btS,btS,btS,_,_,_,_,_,_,btS,btS,btS,btS,_,_,_,_,_]);
    // Row 38: Thin mouse tail
    map.push([_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,f,fd,_,_,_,_]);
    // Row 39: Tail end
    map.push([_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,f,fd,_,_,_]);

    return map;
  }

  function buildMouseRun(fur, furDark, furLight, furDeep, eyeColor, earColor, uniform, number) {
    const _ = null;
    const f = fur, fd = furDark, fl = furLight, fdd = furDeep;
    const e = eyeColor;
    const ear = earColor, earIn = '#ffbbcc';
    const wht = '#ffffff', blk = '#111111', nose = '#ff9999', noseHi = '#ffbbbb';
    const sh = uniform.shirt, shL = uniform.shirtLight, shD = uniform.shirtDark, shDD = uniform.shirtDeep;
    const col = uniform.collar;
    const srt = uniform.shorts, srtM = uniform.shortsMid, srtD = uniform.shortsDark;
    const wb = uniform.waistband;
    const sk = uniform.socks, skC = uniform.socksCuff, skD = uniform.socksDark;
    const bt = uniform.boots, btH = uniform.bootsHighlight, btD = uniform.bootsDark, btS = uniform.bootsSole;

    const map = [];
    // Ears (bouncing, slightly tilted forward)
    map.push([_,_,_,_,ear,ear,ear,ear,_,_,_,_,_,_,_,_,_,ear,ear,ear,ear,_,_,_]);
    map.push([_,_,_,ear,earIn,earIn,ear,_,_,_,_,_,_,_,_,_,_,ear,earIn,earIn,ear,_,_,_]);
    map.push([_,_,_,_,ear,ear,_,_,_,_,_,_,_,_,_,_,_,_,ear,ear,_,_,_,_]);
    // Head (forward lean)
    map.push([_,_,_,_,_,fd,f,f,f,f,f,f,f,f,f,f,f,fd,_,_,_,_,_,_]);
    map.push([_,_,_,_,fd,fl,f,f,f,f,f,f,f,f,f,f,fl,fd,_,_,_,_,_,_]);
    // Eyes
    map.push([_,_,_,_,f,blk,wht,wht,e,f,f,f,f,e,wht,wht,blk,f,_,_,_,_,_,_]);
    map.push([_,_,_,_,fd,blk,blk,blk,blk,f,f,f,f,blk,blk,blk,blk,fd,_,_,_,_,_,_]);
    // Nose
    map.push([_,_,_,_,fd,f,f,f,f,f,nose,noseHi,f,f,f,f,f,fd,_,_,_,_,_,_]);
    // Chin
    map.push([_,_,_,_,_,fd,f,f,f,f,f,f,f,f,f,f,fd,_,_,_,_,_,_,_]);
    // Neck
    map.push([_,_,_,_,_,_,_,_,fd,fd,fd,fd,f,_,_,_,_,_,_,_,_,_,_,_]);
    // Collar
    map.push([_,_,_,_,_,_,col,col,col,col,col,col,col,_,_,_,_,_,_,_,_,_,_,_]);
    // Shirt
    map.push([_,_,_,_,_,shL,sh,sh,sh,sh,sh,sh,sh,shD,_,_,_,_,_,_,_,_,_,_]);
    map.push([_,_,_,fd,_,sh,sh,sh,sh,sh,sh,sh,sh,sh,shD,_,fd,_,_,_,_,_,_,_]);
    map.push([_,_,_,_,_,sh,sh,sh,sh,sh,sh,sh,sh,sh,shD,fd,_,_,_,_,_,_,_,_]);
    map.push([_,_,_,_,_,_,shD,sh,sh,sh,sh,sh,sh,shDD,_,_,_,_,_,_,_,_,_,_]);
    // Waistband
    map.push([_,_,_,_,_,_,_,wb,wb,wb,wb,wb,wb,_,_,_,_,_,_,_,_,_,_,_]);
    // Shorts
    map.push([_,_,_,_,_,_,srt,srt,srtM,srtD,srtM,srt,srt,_,_,_,_,_,_,_,_,_,_,_]);
    map.push([_,_,_,_,_,srt,srt,srtD,_,_,_,_,srtD,srt,_,_,_,_,_,_,_,_,_,_]);
    // Running legs (wide stride)
    map.push([_,_,_,skC,sk,_,_,_,_,_,_,_,_,_,sk,skC,_,_,_,_,_,_,_,_]);
    map.push([_,_,sk,skD,_,_,_,_,_,_,_,_,_,_,_,skD,sk,_,_,_,_,_,_,_]);
    map.push([_,sk,skD,_,_,_,_,_,_,_,_,_,_,_,_,_,skD,sk,_,_,_,_,_,_]);
    // Boots
    map.push([btH,bt,btD,_,_,_,_,_,_,_,_,_,_,_,_,_,_,bt,btH,_,_,_,_,_]);
    map.push([btS,btS,btS,_,_,_,_,_,_,_,_,_,_,_,_,_,_,btS,btS,btS,_,_,_,_]);
    // Tail
    map.push([_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,f,fd,_,_,_]);
    map.push([_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,f,_,_,_]);
    // Padding
    for (let i = 0; i < 15; i++) map.push([_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_]);

    return map;
  }

  function buildMouseKick(fur, furDark, furLight, furDeep, eyeColor, earColor, uniform, number) {
    const _ = null;
    const f = fur, fd = furDark, fl = furLight;
    const e = eyeColor;
    const ear = earColor, earIn = '#ffbbcc';
    const wht = '#ffffff', blk = '#111111', nose = '#ff9999', noseHi = '#ffbbbb';
    const sh = uniform.shirt, shL = uniform.shirtLight, shD = uniform.shirtDark, shDD = uniform.shirtDeep;
    const col = uniform.collar;
    const numC = uniform.number;
    const srt = uniform.shorts, srtM = uniform.shortsMid, srtD = uniform.shortsDark;
    const wb = uniform.waistband;
    const sk = uniform.socks, skC = uniform.socksCuff, skD = uniform.socksDark;
    const bt = uniform.boots, btH = uniform.bootsHighlight, btD = uniform.bootsDark, btS = uniform.bootsSole;

    // 28 wide for kicking leg extension
    const W = 28;
    const row = () => new Array(W).fill(_);
    const map = [];

    // Row 0-1: Ears
    let r = row(); r[3]=ear; r[4]=ear; r[5]=ear; r[6]=ear; r[11]=ear; r[12]=ear; r[13]=ear; r[14]=ear; map.push(r);
    r = row(); r[2]=ear; r[3]=earIn; r[4]=earIn; r[5]=ear; r[11]=ear; r[12]=earIn; r[13]=earIn; r[14]=ear; map.push(r);
    r = row(); r[3]=ear; r[4]=ear; r[12]=ear; r[13]=ear; map.push(r);
    // Row 3: Head
    r = row(); r[3]=fd; r[4]=f; r[5]=f; r[6]=f; r[7]=f; r[8]=f; r[9]=f; r[10]=f; r[11]=f; r[12]=fd; map.push(r);
    // Row 4: Forehead
    r = row(); r[2]=fd; r[3]=fl; r[4]=f; r[5]=f; r[6]=f; r[7]=f; r[8]=f; r[9]=f; r[10]=f; r[11]=fl; r[12]=fd; map.push(r);
    // Row 5: Eyes
    r = row(); r[2]=f; r[3]=blk; r[4]=wht; r[5]=e; r[6]=f; r[7]=f; r[8]=f; r[9]=e; r[10]=wht; r[11]=blk; r[12]=f; map.push(r);
    // Row 6: Eyes lower
    r = row(); r[2]=fd; r[3]=f; r[4]=blk; r[5]=blk; r[6]=f; r[7]=f; r[8]=f; r[9]=blk; r[10]=blk; r[11]=f; r[12]=fd; map.push(r);
    // Row 7: Nose
    r = row(); r[2]=fd; r[3]=f; r[4]=f; r[5]=f; r[6]=f; r[7]=nose; r[8]=noseHi; r[9]=f; r[10]=f; r[11]=f; r[12]=fd; map.push(r);
    // Row 8: Chin
    r = row(); r[3]=fd; r[4]=f; r[5]=f; r[6]=f; r[7]=f; r[8]=f; r[9]=f; r[10]=f; r[11]=fd; map.push(r);
    // Row 9: Neck
    r = row(); r[5]=fd; r[6]=fd; r[7]=fd; r[8]=fd; map.push(r);
    // Row 10: Collar
    r = row(); r[4]=col; r[5]=col; r[6]=col; r[7]=col; r[8]=col; r[9]=col; map.push(r);
    // Row 11: Shirt
    r = row(); r[1]=f; r[3]=shL; r[4]=sh; r[5]=sh; r[6]=sh; r[7]=sh; r[8]=sh; r[9]=shD; r[11]=f; map.push(r);
    // Row 12: Shirt
    r = row(); r[3]=sh; r[4]=sh; r[5]=numC; r[6]=numC; r[7]=numC; r[8]=sh; r[9]=shD; map.push(r);
    // Row 13: Lower shirt
    r = row(); r[3]=shD; r[4]=sh; r[5]=sh; r[6]=sh; r[7]=sh; r[8]=sh; r[9]=shDD; map.push(r);
    // Row 14: Waistband
    r = row(); r[4]=wb; r[5]=wb; r[6]=wb; r[7]=wb; r[8]=wb; map.push(r);
    // Row 15: Shorts
    r = row(); r[3]=srt; r[4]=srtM; r[5]=srtD; r[6]=srtM; r[7]=srt; map.push(r);
    // Row 16: Shorts split
    r = row(); r[3]=srt; r[4]=srt; r[8]=srt; map.push(r);
    // Row 17-20: Kicking leg extended right 8-10px
    r = row(); r[3]=skC; r[4]=skD; r[9]=skC; r[10]=sk; r[11]=sk; map.push(r);
    r = row(); r[3]=sk; r[4]=skD; r[11]=skD; r[12]=sk; r[13]=sk; map.push(r);
    r = row(); r[3]=sk; r[4]=skD; r[14]=sk; r[15]=skD; r[16]=sk; map.push(r);
    // Row 21: Boots
    r = row(); r[3]=bt; r[4]=btD; r[16]=btH; r[17]=bt; r[18]=btD; map.push(r);
    r = row(); r[2]=btH; r[3]=bt; r[4]=btS; r[17]=btS; r[18]=btS; r[19]=btS; map.push(r);
    // Row 23: Tail
    r = row(); r[20]=f; r[21]=fd; map.push(r);
    // Padding
    for (let i = 0; i < 17; i++) map.push(row());

    return map;
  }

  function buildMouseCelebrate(fur, furDark, furLight, furDeep, eyeColor, earColor, uniform, number) {
    const _ = null;
    const f = fur, fd = furDark, fl = furLight;
    const e = eyeColor;
    const ear = earColor, earIn = '#ffbbcc';
    const wht = '#ffffff', blk = '#111111', nose = '#ff9999', smile = '#cc4466';
    const sh = uniform.shirt, shL = uniform.shirtLight, shD = uniform.shirtDark, shDD = uniform.shirtDeep;
    const col = uniform.collar;
    const numC = uniform.number;
    const srt = uniform.shorts, srtM = uniform.shortsMid, srtD = uniform.shortsDark;
    const wb = uniform.waistband;
    const sk = uniform.socks, skC = uniform.socksCuff, skD = uniform.socksDark;
    const bt = uniform.boots, btH = uniform.bootsHighlight, btD = uniform.bootsDark;

    const map = [];
    // Arms raised above head
    map.push([_,_,f,fd,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,fd,f,_]);
    map.push([_,_,f,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,f,_]);
    map.push([_,_,f,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,f,_]);
    map.push([_,_,f,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,f,_]);
    // Ears (bouncing up)
    map.push([_,_,f,_,ear,ear,ear,_,_,_,_,_,_,_,_,_,_,ear,ear,ear,_,_,f,_]);
    map.push([_,_,f,ear,earIn,earIn,ear,_,_,_,_,_,_,_,_,_,_,ear,earIn,earIn,ear,_,f,_]);
    // Head (happy)
    map.push([_,_,_,_,fd,f,f,f,f,f,f,f,f,f,f,f,f,f,f,fd,_,_,_,_]);
    map.push([_,_,_,fd,f,f,f,f,f,f,f,f,f,f,f,f,f,f,f,f,fd,_,_,_]);
    // Eyes squinted
    map.push([_,_,_,f,f,f,blk,blk,f,f,f,f,f,f,f,f,blk,blk,f,f,f,_,_,_]);
    // Nose
    map.push([_,_,_,fd,f,f,f,f,f,f,f,nose,nose,f,f,f,f,f,f,f,fd,_,_,_]);
    // Big smile
    map.push([_,_,_,_,fd,f,smile,smile,smile,smile,smile,smile,smile,smile,smile,smile,smile,f,fd,_,_,_,_,_]);
    // Chin
    map.push([_,_,_,_,_,fd,f,f,f,f,f,f,f,f,f,f,f,f,fd,_,_,_,_,_]);
    // Neck
    map.push([_,_,_,_,_,_,_,_,fd,fd,fd,fd,fd,_,_,_,_,_,_,_,_,_,_,_]);
    // Collar + shirt
    map.push([_,_,_,_,_,_,col,col,col,col,col,col,col,col,col,col,_,_,_,_,_,_,_,_]);
    map.push([_,_,_,_,_,shL,sh,sh,sh,sh,sh,sh,sh,sh,sh,sh,shD,_,_,_,_,_,_,_]);
    map.push([_,_,_,_,_,sh,numC,numC,numC,numC,numC,numC,numC,numC,numC,sh,sh,shD,_,_,_,_,_,_]);
    map.push([_,_,_,_,_,shD,sh,sh,sh,sh,sh,sh,sh,sh,sh,sh,shDD,_,_,_,_,_,_,_]);
    // Waistband
    map.push([_,_,_,_,_,_,_,wb,wb,wb,wb,wb,wb,wb,wb,_,_,_,_,_,_,_,_,_]);
    // Shorts
    map.push([_,_,_,_,_,_,_,srt,srtM,srtD,srtM,srt,srt,srtM,srtD,_,_,_,_,_,_,_,_,_]);
    // Jump gap
    map.push([_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_]);
    // Socks
    map.push([_,_,_,_,_,_,_,_,skC,sk,_,_,_,_,sk,skC,_,_,_,_,_,_,_,_]);
    map.push([_,_,_,_,_,_,_,_,sk,skD,_,_,_,_,skD,sk,_,_,_,_,_,_,_,_]);
    // Boots
    map.push([_,_,_,_,_,_,_,_,btH,bt,_,_,_,_,bt,btH,_,_,_,_,_,_,_,_]);
    map.push([_,_,_,_,_,_,_,btH,bt,btD,_,_,_,_,btD,bt,btH,_,_,_,_,_,_,_]);
    // Air gap
    map.push([_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_]);
    // Tail
    map.push([_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,f,fd,_,_,_,_]);
    // Padding
    for (let i = 0; i < 14; i++) map.push([_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_]);

    return map;
  }

  function buildMouseSad(fur, furDark, furLight, furDeep, eyeColor, earColor, uniform, number) {
    const _ = null;
    const f = fur, fd = furDark, fl = furLight;
    const e = eyeColor;
    const ear = earColor, earIn = '#ffbbcc';
    const wht = '#ffffff', blk = '#111111', nose = '#ff9999', mouth = '#997788';
    const sh = uniform.shirt, shL = uniform.shirtLight, shD = uniform.shirtDark, shDD = uniform.shirtDeep;
    const col = uniform.collar;
    const numC = uniform.number;
    const srt = uniform.shorts, srtM = uniform.shortsMid, srtD = uniform.shortsDark;
    const wb = uniform.waistband;
    const sk = uniform.socks, skC = uniform.socksCuff, skD = uniform.socksDark;
    const bt = uniform.boots, btH = uniform.bootsHighlight, btD = uniform.bootsDark, btS = uniform.bootsSole;

    const map = [];
    // Droopy ears
    map.push([ear,ear,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,ear,ear]);
    map.push([ear,earIn,ear,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,ear,earIn,ear]);
    map.push([_,ear,ear,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,ear,ear,_]);
    // Head dropped
    map.push([_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_]);
    map.push([_,_,_,_,_,_,fd,f,f,f,f,f,f,f,f,f,f,fd,_,_,_,_,_,_]);
    map.push([_,_,_,_,_,fd,f,fd,f,f,f,f,f,f,f,f,fd,f,fd,_,_,_,_,_]);
    // Brow furrowed
    map.push([_,_,_,_,_,f,f,f,fd,fd,fd,fd,fd,fd,fd,f,f,f,_,_,_,_,_,_]);
    // Eyes looking down
    map.push([_,_,_,_,_,f,wht,e,f,f,f,f,f,f,f,e,wht,f,_,_,_,_,_,_]);
    // Nose
    map.push([_,_,_,_,_,fd,f,f,f,f,f,nose,nose,f,f,f,f,fd,_,_,_,_,_,_]);
    // Sad mouth
    map.push([_,_,_,_,_,_,fd,f,mouth,f,f,f,f,f,mouth,f,fd,_,_,_,_,_,_,_]);
    // Chin
    map.push([_,_,_,_,_,_,_,fd,f,f,f,f,f,f,f,fd,_,_,_,_,_,_,_,_]);
    // Neck
    map.push([_,_,_,_,_,_,_,_,_,fd,fd,fd,fd,_,_,_,_,_,_,_,_,_,_,_]);
    // Collar
    map.push([_,_,_,_,_,_,col,col,col,col,col,col,col,col,col,_,_,_,_,_,_,_,_,_]);
    // Shirt (slumped)
    map.push([_,_,_,_,_,_,_,shD,sh,sh,sh,sh,sh,sh,sh,sh,shD,_,_,_,_,_,_,_]);
    map.push([_,_,_,_,_,_,_,sh,numC,numC,numC,numC,numC,numC,numC,sh,shD,_,_,_,_,_,_,_]);
    map.push([_,_,_,_,_,_,_,_,shD,sh,sh,sh,sh,sh,sh,shDD,_,_,_,_,_,_,_,_]);
    // Waistband
    map.push([_,_,_,_,_,_,_,_,wb,wb,wb,wb,wb,wb,wb,_,_,_,_,_,_,_,_,_]);
    // Shorts
    map.push([_,_,_,_,_,_,_,_,srt,srtM,srtD,srtM,srt,srt,_,_,_,_,_,_,_,_,_,_]);
    map.push([_,_,_,_,_,_,_,_,srt,srt,_,_,srt,srt,_,_,_,_,_,_,_,_,_,_]);
    // Socks
    map.push([_,_,_,_,_,_,_,_,skC,sk,_,_,sk,skC,_,_,_,_,_,_,_,_,_,_]);
    map.push([_,_,_,_,_,_,_,_,sk,skD,_,_,skD,sk,_,_,_,_,_,_,_,_,_,_]);
    map.push([_,_,_,_,_,_,_,_,sk,skD,_,_,skD,sk,_,_,_,_,_,_,_,_,_,_]);
    // Boots
    map.push([_,_,_,_,_,_,_,_,btH,bt,_,_,bt,btH,_,_,_,_,_,_,_,_,_,_]);
    map.push([_,_,_,_,_,_,_,btH,bt,btD,_,_,btD,bt,btH,_,_,_,_,_,_,_,_,_]);
    map.push([_,_,_,_,_,_,_,btS,btS,btS,_,_,btS,btS,btS,_,_,_,_,_,_,_,_,_]);
    // Tail limp
    map.push([_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,f,_,_,_,_,_,_]);
    map.push([_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,fd,f,_,_,_,_,_]);
    // Padding
    for (let i = 0; i < 13; i++) map.push([_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_]);

    return map;
  }

  // ===========================================================
  // ---- Goalkeeper Sprite Maps (28w x 40h) ----
  // Bulkier frame, prominent gloves, dramatic dive poses
  // ===========================================================

  function buildGKStand(fur, furDark, furLight, eyeColor, gkUni, isCat, earInfo) {
    const _ = null;
    const f = fur, fd = furDark, fl = furLight, fdd = darken(fur, 0.55);
    const e = eyeColor, eDark = darken(eyeColor, 0.35);
    const wht = '#ffffff', blk = '#111111', nose = isCat ? '#ff8899' : '#ff9999';
    const noseHi = isCat ? '#ffaabb' : '#ffbbbb';
    const earIn = isCat ? lighten(fur, 0.35) : '#ffbbcc';
    const ear = earInfo || fur;
    const whisker = '#ccbbaa';
    const sh = gkUni.shirt, shL = gkUni.shirtLight, shD = gkUni.shirtDark, shDD = gkUni.shirtDeep;
    const col = gkUni.collar;
    const numC = gkUni.number || '#222222';
    const srt = gkUni.shorts, srtM = gkUni.shortsMid || srt, srtD = gkUni.shortsDark;
    const sk = gkUni.socks, skC = gkUni.socksCuff || lighten(sk, 0.3), skD = gkUni.socksDark;
    const bt = gkUni.boots, btH = gkUni.bootsHighlight, btD = gkUni.bootsDark, btS = gkUni.bootsSole;
    const gl = gkUni.glove || '#44dd44', glL = gkUni.gloveLight || '#66ff66', glD = gkUni.gloveDark || '#22aa22';
    const glF = darken(gl, 0.15); // glove finger segments

    const map = [];

    if (isCat) {
      // Cat GK ears (4px tall pointed)
      map.push([_,_,_,_,_,_,_,fdd,fd,_,_,_,_,_,_,_,_,_,_,fd,fdd,_,_,_,_,_,_,_]);
      map.push([_,_,_,_,_,_,fdd,earIn,fd,_,_,_,_,_,_,_,_,_,_,fd,earIn,fdd,_,_,_,_,_,_]);
      map.push([_,_,_,_,_,_,fd,earIn,f,_,_,_,_,_,_,_,_,_,_,f,earIn,fd,_,_,_,_,_,_]);
      map.push([_,_,_,_,_,_,f,earIn,f,_,_,_,_,_,_,_,_,_,_,f,earIn,f,_,_,_,_,_,_]);
      // Head
      map.push([_,_,_,_,_,_,fd,f,f,f,f,f,f,f,f,f,f,f,f,f,f,fd,_,_,_,_,_,_]);
      map.push([_,_,_,_,_,fd,fl,f,f,f,f,f,f,f,f,f,f,f,f,f,fl,fd,_,_,_,_,_,_]);
      // Eyes
      map.push([_,_,_,_,_,f,blk,blk,blk,blk,f,f,fd,f,f,blk,blk,blk,blk,f,f,_,_,_,_,_,_,_]);
      map.push([_,_,_,_,_,fd,blk,wht,e,blk,f,f,f,f,f,blk,e,wht,blk,fd,_,_,_,_,_,_,_,_]);
      // Nose + whiskers
      map.push([_,_,_,_,_,fd,f,f,f,f,f,f,nose,noseHi,f,f,f,f,f,f,fd,_,_,_,_,_,_,_]);
      map.push([_,_,_,whisker,_,_,fd,f,f,f,f,f,f,f,f,f,f,f,f,fd,_,_,whisker,_,_,_,_,_]);
    } else {
      // Mouse GK ears (large round)
      map.push([_,_,_,_,_,ear,ear,ear,ear,_,_,_,_,_,_,_,_,_,_,ear,ear,ear,ear,_,_,_,_,_]);
      map.push([_,_,_,_,ear,earIn,earIn,earIn,ear,_,_,_,_,_,_,_,_,_,_,ear,earIn,earIn,earIn,ear,_,_,_,_]);
      map.push([_,_,_,_,_,ear,ear,ear,_,_,_,_,_,_,_,_,_,_,_,_,ear,ear,ear,_,_,_,_,_]);
      // Spacer
      map.push([_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_]);
      // Head
      map.push([_,_,_,_,_,_,fd,f,f,f,f,f,f,f,f,f,f,f,f,f,fd,_,_,_,_,_,_,_]);
      map.push([_,_,_,_,_,fd,fl,f,f,f,f,f,f,f,f,f,f,f,f,fl,fd,_,_,_,_,_,_,_]);
      // Eyes
      map.push([_,_,_,_,_,f,blk,wht,wht,e,f,f,f,f,e,wht,wht,blk,f,_,_,_,_,_,_,_,_,_]);
      map.push([_,_,_,_,_,fd,f,blk,blk,blk,f,f,f,f,blk,blk,blk,f,fd,_,_,_,_,_,_,_,_,_]);
      // Nose
      map.push([_,_,_,_,_,fd,f,f,f,f,f,f,nose,nose,f,f,f,f,f,fd,_,_,_,_,_,_,_,_]);
      map.push([_,_,_,_,_,_,fd,f,f,f,f,f,f,f,f,f,f,f,fd,_,_,_,_,_,_,_,_,_]);
    }

    // Neck
    map.push([_,_,_,_,_,_,_,_,_,_,fd,fd,fd,fd,fd,fd,_,_,_,_,_,_,_,_,_,_,_,_]);
    // Collar
    map.push([_,_,_,_,_,_,_,col,col,col,col,col,col,col,col,col,col,col,_,_,_,_,_,_,_,_,_,_]);
    // Shirt upper
    map.push([_,_,_,_,_,_,shL,shL,sh,sh,sh,sh,sh,sh,sh,sh,sh,shD,shD,_,_,_,_,_,_,_,_,_]);
    // Shirt with gloves at sides (chunky 4-5px gloves)
    map.push([_,_,_,glL,gl,glF,sh,sh,sh,sh,sh,sh,sh,sh,sh,sh,sh,sh,glF,gl,glL,_,_,_,_,_,_,_]);
    // Shirt with number + gloves
    map.push([_,_,glL,gl,glD,shD,sh,sh,numC,numC,numC,numC,numC,numC,numC,sh,sh,shD,glD,gl,glL,_,_,_,_,_,_,_]);
    // Lower shirt with gloves
    map.push([_,_,_,gl,glD,_,shD,sh,sh,sh,sh,sh,sh,sh,sh,sh,sh,shDD,_,glD,gl,_,_,_,_,_,_,_]);
    // Shorts (wider stance 8-10px apart)
    map.push([_,_,_,_,_,_,_,srt,srt,srtM,srtD,srt,srt,srtD,srtM,srt,srt,_,_,_,_,_,_,_,_,_,_,_]);
    map.push([_,_,_,_,_,_,srt,srt,_,_,_,_,_,_,_,_,srt,srt,_,_,_,_,_,_,_,_,_,_]);
    // Socks (wide stance)
    map.push([_,_,_,_,_,_,skC,sk,_,_,_,_,_,_,_,_,_,sk,skC,_,_,_,_,_,_,_,_,_]);
    map.push([_,_,_,_,_,_,sk,skD,_,_,_,_,_,_,_,_,_,skD,sk,_,_,_,_,_,_,_,_,_]);
    // Boots (wide)
    map.push([_,_,_,_,_,btH,bt,btD,_,_,_,_,_,_,_,_,_,btD,bt,btH,_,_,_,_,_,_,_,_]);
    map.push([_,_,_,_,btH,bt,bt,btD,_,_,_,_,_,_,_,_,_,btD,bt,bt,btH,_,_,_,_,_,_,_]);
    map.push([_,_,_,_,btS,btS,btS,btS,_,_,_,_,_,_,_,_,_,btS,btS,btS,btS,_,_,_,_,_,_,_]);
    // Padding to 40
    while (map.length < 40) map.push(new Array(28).fill(_));

    return map;
  }

  function buildGKDiveLeft(fur, furDark, furLight, eyeColor, gkUni, isCat, earInfo) {
    const _ = null;
    const f = fur, fd = furDark, fl = furLight;
    const e = eyeColor;
    const wht = '#ffffff', blk = '#111111', nose = isCat ? '#ff8899' : '#ff9999';
    const sh = gkUni.shirt, shL = gkUni.shirtLight, shD = gkUni.shirtDark;
    const srt = gkUni.shorts, srtD = gkUni.shortsDark;
    const sk = gkUni.socks, skD = gkUni.socksDark;
    const bt = gkUni.boots, btD = gkUni.bootsDark;
    const gl = gkUni.glove || '#44dd44', glL = gkUni.gloveLight || '#66ff66', glD = gkUni.gloveDark || '#22aa22';

    // Fully horizontal dive left - 32px wide
    const W = 32;
    const row = () => new Array(W).fill(_);
    const map = [];

    // Row 0-2: Gloves reaching left (chunky 5px wide)
    let r = row(); r[0]=glL; r[1]=gl; r[2]=gl; r[3]=glD; r[4]=glD; map.push(r);
    r = row(); r[0]=gl; r[1]=glD; r[2]=glD; r[3]=gl; r[4]=glL; map.push(r);
    r = row(); r[0]=glL; r[1]=gl; r[2]=gl; r[3]=glD; r[4]=glD; map.push(r);
    // Row 3-4: Arms reaching
    r = row(); r[3]=f; r[4]=f; r[5]=f; r[6]=f; map.push(r);
    r = row(); r[4]=f; r[5]=f; r[6]=f; r[7]=f; map.push(r);
    // Row 5-8: Head (sideways)
    r = row(); r[6]=f; r[7]=f; r[8]=f; r[9]=f; r[10]=f; r[11]=f; map.push(r);
    r = row(); r[6]=f; r[7]=wht; r[8]=e; r[9]=f; r[10]=f; r[11]=f; r[12]=f; map.push(r);
    r = row(); r[6]=fd; r[7]=f; r[8]=nose; r[9]=f; r[10]=f; r[11]=f; map.push(r);
    r = row(); r[7]=fd; r[8]=f; r[9]=f; r[10]=fd; map.push(r);
    // Row 9-12: Body (horizontal)
    r = row(); r[9]=sh; r[10]=shL; r[11]=sh; r[12]=sh; r[13]=sh; r[14]=sh; r[15]=sh; r[16]=sh; map.push(r);
    r = row(); r[9]=sh; r[10]=sh; r[11]=sh; r[12]=sh; r[13]=sh; r[14]=sh; r[15]=sh; r[16]=sh; r[17]=sh; map.push(r);
    r = row(); r[9]=shD; r[10]=sh; r[11]=sh; r[12]=sh; r[13]=sh; r[14]=sh; r[15]=sh; r[16]=shD; map.push(r);
    // Row 13-14: Shorts
    r = row(); r[16]=srt; r[17]=srtD; r[18]=srt; map.push(r);
    r = row(); r[17]=srt; r[18]=srtD; r[19]=srt; map.push(r);
    // Row 15-18: Legs
    r = row(); r[19]=sk; r[20]=sk; r[21]=sk; map.push(r);
    r = row(); r[21]=sk; r[22]=sk; r[23]=sk; map.push(r);
    r = row(); r[23]=sk; r[24]=sk; r[25]=sk; map.push(r);
    // Row 18-19: Boots
    r = row(); r[25]=bt; r[26]=btD; r[27]=bt; map.push(r);
    r = row(); r[26]=bt; r[27]=btD; r[28]=bt; map.push(r);

    while (map.length < 40) map.push(row());
    return map;
  }

  function buildGKDiveRight(fur, furDark, furLight, eyeColor, gkUni, isCat, earInfo) {
    const leftMap = buildGKDiveLeft(fur, furDark, furLight, eyeColor, gkUni, isCat, earInfo);
    return leftMap.map(row => [...row].reverse());
  }

  function buildGKCatch(fur, furDark, furLight, eyeColor, gkUni, isCat, earInfo) {
    const _ = null;
    const f = fur, fd = furDark, fl = furLight;
    const e = eyeColor;
    const wht = '#ffffff', blk = '#111111', nose = isCat ? '#ff8899' : '#ff9999';
    const earIn = isCat ? lighten(fur, 0.35) : '#ffbbcc';
    const ear = earInfo || fur;
    const sh = gkUni.shirt, shL = gkUni.shirtLight, shD = gkUni.shirtDark, shDD = gkUni.shirtDeep;
    const col = gkUni.collar;
    const srt = gkUni.shorts, srtD = gkUni.shortsDark;
    const sk = gkUni.socks, skD = gkUni.socksDark;
    const bt = gkUni.boots, btH = gkUni.bootsHighlight, btD = gkUni.bootsDark;
    const gl = gkUni.glove || '#44dd44', glL = gkUni.gloveLight || '#66ff66', glD = gkUni.gloveDark || '#22aa22';
    const smile = '#cc4455';

    const W = 28;
    const row = () => new Array(W).fill(_);
    const map = [];

    // Gloves holding ball
    let r;
    r = row(); r[8]=gl; r[9]=glL; r[10]=gl; r[11]=glL; r[12]=gl; r[13]=glL; r[14]=gl; map.push(r);
    r = row(); r[7]=gl; r[8]=glD; r[9]=gl; r[10]=gl; r[11]=gl; r[12]=gl; r[13]=glD; r[14]=gl; map.push(r);
    r = row(); r[8]=gl; r[9]=glD; r[10]=glD; r[11]=glD; r[12]=glD; r[13]=gl; map.push(r);
    // Arms
    r = row(); r[8]=f; r[9]=f; r[11]=_; r[12]=f; r[13]=f; map.push(r);
    // Ears
    if (isCat) {
      r = row(); r[7]=fd; r[8]=fd; r[14]=fd; r[15]=fd; map.push(r);
      r = row(); r[6]=fd; r[7]=earIn; r[8]=fd; r[14]=fd; r[15]=earIn; r[16]=fd; map.push(r);
    } else {
      r = row(); r[5]=ear; r[6]=ear; r[7]=ear; r[14]=ear; r[15]=ear; r[16]=ear; map.push(r);
      r = row(); r[5]=ear; r[6]=earIn; r[7]=ear; r[14]=ear; r[15]=earIn; r[16]=ear; map.push(r);
    }
    // Head (triumphant)
    r = row(); r[6]=fd; r[7]=f; r[8]=f; r[9]=f; r[10]=f; r[11]=f; r[12]=f; r[13]=f; r[14]=f; r[15]=fd; map.push(r);
    r = row(); r[6]=fd; r[7]=f; r[8]=wht; r[9]=wht; r[10]=e; r[11]=f; r[12]=e; r[13]=wht; r[14]=wht; r[15]=f; r[16]=fd; map.push(r);
    r = row(); r[6]=fd; r[7]=f; r[8]=wht; r[9]=blk; r[10]=blk; r[11]=f; r[12]=blk; r[13]=blk; r[14]=wht; r[15]=f; r[16]=fd; map.push(r);
    r = row(); r[7]=fd; r[8]=f; r[9]=f; r[10]=nose; r[11]=nose; r[12]=f; r[13]=f; r[14]=f; r[15]=fd; map.push(r);
    r = row(); r[7]=_; r[8]=fd; r[9]=smile; r[10]=smile; r[11]=smile; r[12]=smile; r[13]=smile; r[14]=fd; map.push(r);
    r = row(); r[8]=_; r[9]=fd; r[10]=f; r[11]=f; r[12]=f; r[13]=fd; map.push(r);
    // Neck
    r = row(); r[10]=fd; r[11]=fd; r[12]=fd; map.push(r);
    // Collar + shirt
    r = row(); r[8]=col; r[9]=col; r[10]=col; r[11]=col; r[12]=col; r[13]=col; map.push(r);
    r = row(); r[7]=shL; r[8]=sh; r[9]=sh; r[10]=sh; r[11]=sh; r[12]=sh; r[13]=sh; r[14]=shD; map.push(r);
    r = row(); r[7]=sh; r[8]=sh; r[9]=sh; r[10]=sh; r[11]=sh; r[12]=sh; r[13]=sh; r[14]=sh; r[15]=shD; map.push(r);
    r = row(); r[7]=shD; r[8]=sh; r[9]=sh; r[10]=sh; r[11]=sh; r[12]=sh; r[13]=sh; r[14]=shDD; map.push(r);
    // Shorts
    r = row(); r[8]=srt; r[9]=srt; r[10]=srtD; r[11]=srt; r[12]=srt; map.push(r);
    r = row(); r[8]=srt; r[9]=srt; r[11]=srt; r[12]=srt; map.push(r);
    // Socks
    r = row(); r[8]=sk; r[9]=sk; r[12]=sk; r[13]=sk; map.push(r);
    r = row(); r[8]=sk; r[9]=skD; r[12]=skD; r[13]=sk; map.push(r);
    // Boots
    r = row(); r[8]=btH; r[9]=bt; r[12]=bt; r[13]=btH; map.push(r);
    r = row(); r[7]=btH; r[8]=bt; r[9]=btD; r[12]=btD; r[13]=bt; r[14]=btH; map.push(r);

    while (map.length < 40) map.push(row());
    return map;
  }

  function buildGKMiss(fur, furDark, furLight, eyeColor, gkUni, isCat, earInfo) {
    const _ = null;
    const f = fur, fd = furDark, fl = furLight;
    const e = eyeColor;
    const wht = '#ffffff', blk = '#111111', nose = isCat ? '#ff8899' : '#ff9999';
    const sh = gkUni.shirt, shL = gkUni.shirtLight, shD = gkUni.shirtDark;
    const srt = gkUni.shorts, srtD = gkUni.shortsDark;
    const sk = gkUni.socks, skD = gkUni.socksDark;
    const bt = gkUni.boots, btD = gkUni.bootsDark;
    const gl = gkUni.glove || '#44dd44', glL = gkUni.gloveLight || '#66ff66', glD = gkUni.gloveDark || '#22aa22';

    // Face-down sprawled
    const W = 32;
    const row = () => new Array(W).fill(_);
    const map = [];

    // Right reaching arm + glove
    let r;
    r = row(); r[24]=glL; r[25]=gl; r[26]=gl; r[27]=glD; r[28]=glD; map.push(r);
    r = row(); r[23]=f; r[24]=f; r[25]=gl; r[26]=glD; map.push(r);
    r = row(); r[22]=f; r[23]=f; map.push(r);
    // Head face-down
    r = row(); r[17]=f; r[18]=f; r[19]=f; r[20]=f; r[21]=f; map.push(r);
    r = row(); r[16]=f; r[17]=fd; r[18]=fd; r[19]=fd; r[20]=f; map.push(r);
    r = row(); r[16]=fd; r[17]=f; r[18]=f; r[19]=fd; map.push(r);
    // Body on ground
    r = row(); r[10]=sh; r[11]=shL; r[12]=sh; r[13]=sh; r[14]=sh; r[15]=sh; r[16]=sh; r[17]=sh; map.push(r);
    r = row(); r[9]=sh; r[10]=sh; r[11]=sh; r[12]=sh; r[13]=sh; r[14]=sh; r[15]=sh; r[16]=sh; r[17]=sh; map.push(r);
    r = row(); r[9]=shD; r[10]=sh; r[11]=sh; r[12]=sh; r[13]=sh; r[14]=sh; r[15]=shD; map.push(r);
    // Shorts
    r = row(); r[7]=srt; r[8]=srtD; r[9]=srt; map.push(r);
    // Legs sprawled
    r = row(); r[4]=sk; r[5]=sk; r[6]=sk; map.push(r);
    r = row(); r[2]=bt; r[3]=btD; map.push(r);
    // Other leg
    r = row(); r[10]=sk; r[11]=sk; r[12]=sk; map.push(r);
    r = row(); r[12]=bt; r[13]=btD; map.push(r);
    // Left reaching glove
    r = row(); r[0]=gl; r[1]=glL; r[2]=glD; map.push(r);
    r = row(); r[1]=gl; r[3]=f; r[4]=f; map.push(r);

    while (map.length < 40) map.push(row());
    return map;
  }

  // ===========================================================
  // ---- Character Drawing Functions ----
  // ===========================================================

  function drawCatCharacter(ctx, x, y, scale, player, pose) {
    const fur = player.furColor || '#ff9944';
    const furDark = darken(fur, 0.3);
    const furLight = lighten(fur, 0.3);
    const furDeep = darken(fur, 0.5);
    const eyeColor = player.eyeColor || '#33cc33';
    const pattern = player.pattern || 'solid';
    const number = player.number || 10;

    let map;
    switch (pose) {
      case 'run':
        map = buildCatRun(fur, furDark, furLight, furDeep, eyeColor, pattern, CAT_UNIFORM, number);
        break;
      case 'kick':
        map = buildCatKick(fur, furDark, furLight, furDeep, eyeColor, pattern, CAT_UNIFORM, number);
        break;
      case 'celebrate':
        map = buildCatCelebrate(fur, furDark, furLight, furDeep, eyeColor, pattern, CAT_UNIFORM, number);
        break;
      case 'sad':
        map = buildCatSad(fur, furDark, furLight, furDeep, eyeColor, pattern, CAT_UNIFORM, number);
        break;
      default:
        map = buildCatStand(fur, furDark, furLight, furDeep, eyeColor, pattern, CAT_UNIFORM, number);
    }

    const s = PX * scale;
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    drawPixelMap(ctx, x / s, y / s, map, scale);
    ctx.restore();
  }

  function drawMouseCharacter(ctx, x, y, scale, player, pose) {
    const fur = player.furColor || '#cccccc';
    const furDark = darken(fur, 0.3);
    const furLight = lighten(fur, 0.3);
    const furDeep = darken(fur, 0.5);
    const eyeColor = player.eyeColor || '#111111';
    const earColor = player.earColor || '#ddbbcc';
    const number = player.number || 10;

    let map;
    switch (pose) {
      case 'run':
        map = buildMouseRun(fur, furDark, furLight, furDeep, eyeColor, earColor, MOUSE_UNIFORM, number);
        break;
      case 'kick':
        map = buildMouseKick(fur, furDark, furLight, furDeep, eyeColor, earColor, MOUSE_UNIFORM, number);
        break;
      case 'celebrate':
        map = buildMouseCelebrate(fur, furDark, furLight, furDeep, eyeColor, earColor, MOUSE_UNIFORM, number);
        break;
      case 'sad':
        map = buildMouseSad(fur, furDark, furLight, furDeep, eyeColor, earColor, MOUSE_UNIFORM, number);
        break;
      default:
        map = buildMouseStand(fur, furDark, furLight, furDeep, eyeColor, earColor, MOUSE_UNIFORM, number);
    }

    const s = PX * scale;
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    drawPixelMap(ctx, x / s, y / s, map, scale);
    ctx.restore();
  }

  function drawGoalkeeper(ctx, x, y, scale, team, player, pose) {
    const isCat = team === 'cats';
    const fur = player.furColor || (isCat ? '#ff9944' : '#cccccc');
    const furDark = darken(fur, 0.3);
    const furLight = lighten(fur, 0.3);
    const eyeColor = player.eyeColor || (isCat ? '#33cc33' : '#111111');
    const gkUni = isCat ? CAT_GK : MOUSE_GK;
    const earInfo = isCat ? null : (player.earColor || '#ddbbcc');

    let map;
    switch (pose) {
      case 'diveLeft':
        map = buildGKDiveLeft(fur, furDark, furLight, eyeColor, gkUni, isCat, earInfo);
        break;
      case 'diveRight':
        map = buildGKDiveRight(fur, furDark, furLight, eyeColor, gkUni, isCat, earInfo);
        break;
      case 'catch':
        map = buildGKCatch(fur, furDark, furLight, eyeColor, gkUni, isCat, earInfo);
        break;
      case 'miss':
        map = buildGKMiss(fur, furDark, furLight, eyeColor, gkUni, isCat, earInfo);
        break;
      default:
        map = buildGKStand(fur, furDark, furLight, eyeColor, gkUni, isCat, earInfo);
    }

    const s = PX * scale;
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    drawPixelMap(ctx, x / s, y / s, map, scale);
    ctx.restore();
  }

  // ===========================================================
  // ---- Ball (12x12 with rich shading) ----
  // ===========================================================

  function drawBall(ctx, x, y, scale) {
    const s = PX * scale;
    const bx = x / s;
    const by = y / s;
    const _ = null;
    const w = '#f8f8f8', wm = '#e8e8e8', ws = '#d0d0d0', wd = '#b8b8b8';
    const b = '#333333', bm = '#222222', bd = '#111111';
    const hi = '#ffffff';
    const sh = '#999999';

    const ballMap = [
      [_,  _,  _,  _,  w,  wm, wm, w,  _,  _,  _,  _],
      [_,  _,  _,  hi, w,  w,  w,  w,  ws, _,  _,  _],
      [_,  _,  hi, w,  b,  b,  b,  b,  w,  ws, _,  _],
      [_,  hi, w,  b,  bm, w,  w,  bm, b,  w,  ws, _],
      [w,  w,  w,  b,  w,  wm, wm, w,  b,  w,  ws, sh],
      [wm, w,  b,  bm, wm, wm, wm, wm, bm, b,  ws, sh],
      [wm, w,  b,  bm, wm, wm, wm, wm, bm, b,  ws, sh],
      [w,  ws, w,  b,  w,  wm, wm, w,  b,  ws, sh, sh],
      [_,  ws, ws, b,  bm, w,  w,  bm, b,  ws, sh, _],
      [_,  _,  ws, ws, b,  b,  b,  b,  ws, sh, _,  _],
      [_,  _,  _,  sh, ws, ws, ws, sh, sh, _,  _,  _],
      [_,  _,  _,  _,  sh, sh, sh, sh, _,  _,  _,  _],
    ];

    ctx.save();
    ctx.imageSmoothingEnabled = false;
    drawPixelMap(ctx, bx, by, ballMap, scale);
    ctx.restore();
  }

  // ===========================================================
  // ---- Goal (rich cylindrical posts, fine mesh net) ----
  // ===========================================================

  function drawGoal(ctx, x, y, width, height) {
    ctx.save();
    ctx.imageSmoothingEnabled = false;

    const postW = 8;
    const barH = 8;
    const postHi = '#ffffff';
    const postMid = '#eeeef0';
    const postShd = '#bbbbcc';
    const postDeep = '#999aaa';
    const netColor = 'rgba(210, 210, 220, 0.45)';
    const netDark = 'rgba(170, 170, 185, 0.35)';
    const netBack = 'rgba(180, 180, 195, 0.25)';

    // Net background with depth fog
    ctx.fillStyle = 'rgba(0, 0, 0, 0.10)';
    ctx.fillRect(x + postW, y + barH, width - postW * 2, height - barH);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.06)';
    ctx.fillRect(x + postW + 4, y + barH + 4, width - postW * 2 - 8, height - barH - 8);

    // Net mesh - vertical lines (10-12px apart)
    const netSpacingV = 10;
    ctx.lineWidth = 1;
    for (let nx = x + postW + netSpacingV; nx < x + width - postW; nx += netSpacingV) {
      ctx.strokeStyle = netColor;
      ctx.beginPath();
      ctx.moveTo(nx, y + barH);
      ctx.lineTo(nx, y + height);
      ctx.stroke();
      // Depth perspective lines
      ctx.strokeStyle = netBack;
      ctx.beginPath();
      ctx.moveTo(nx, y + barH);
      ctx.lineTo(nx + 5, y + barH - 20);
      ctx.stroke();
    }

    // Horizontal net lines (8-10px apart) with sag
    const netSpacingH = 8;
    for (let ny = y + barH + netSpacingH; ny < y + height; ny += netSpacingH) {
      ctx.strokeStyle = netColor;
      ctx.beginPath();
      const sagAmount = (ny - y - barH) * 0.018;
      for (let nx = x + postW; nx <= x + width - postW; nx += 2) {
        const localSag = Math.sin((nx - x) / (width) * Math.PI) * sagAmount;
        if (nx === x + postW) ctx.moveTo(nx, ny + localSag);
        else ctx.lineTo(nx, ny + localSag);
      }
      ctx.stroke();
    }

    // Diagonal depth lines
    for (let nx = x + postW + netSpacingV; nx < x + width - postW; nx += netSpacingV) {
      for (let ny = y + barH; ny < y + height; ny += netSpacingH) {
        ctx.strokeStyle = 'rgba(180, 180, 195, 0.15)';
        ctx.beginPath();
        ctx.moveTo(nx, ny);
        ctx.lineTo(nx + 3, ny - 8);
        ctx.stroke();
      }
    }

    // Net attachment at posts
    for (let ny = y + barH; ny < y + height; ny += netSpacingH) {
      ctx.fillStyle = 'rgba(180, 180, 190, 0.5)';
      ctx.fillRect(x + postW - 1, ny, 2, 2);
      ctx.fillRect(x + width - postW - 1, ny, 2, 2);
    }

    // Crossbar with cylindrical shading
    for (let cy = 0; cy < barH; cy++) {
      const t = cy / barH;
      let color;
      if (t < 0.15) color = postHi;
      else if (t < 0.35) color = postMid;
      else if (t < 0.6) color = postMid;
      else if (t < 0.8) color = postShd;
      else color = postDeep;
      ctx.fillStyle = color;
      ctx.fillRect(x, y + cy, width, 1);
    }

    // Left post
    for (let cx = 0; cx < postW; cx++) {
      const t = cx / postW;
      let color;
      if (t < 0.2) color = postHi;
      else if (t < 0.4) color = postMid;
      else if (t < 0.65) color = postMid;
      else if (t < 0.85) color = postShd;
      else color = postDeep;
      ctx.fillStyle = color;
      ctx.fillRect(x + cx, y, 1, height);
    }

    // Right post
    for (let cx = 0; cx < postW; cx++) {
      const t = cx / postW;
      let color;
      if (t < 0.15) color = postDeep;
      else if (t < 0.35) color = postShd;
      else if (t < 0.6) color = postMid;
      else if (t < 0.8) color = postMid;
      else color = postHi;
      ctx.fillStyle = color;
      ctx.fillRect(x + width - postW + cx, y, 1, height);
    }

    // Post caps (2px bright white)
    ctx.fillStyle = postHi;
    ctx.fillRect(x - 2, y - 4, postW + 4, 6);
    ctx.fillRect(x + width - postW - 2, y - 4, postW + 4, 6);
    ctx.fillStyle = postMid;
    ctx.fillRect(x - 1, y - 3, postW + 2, 4);
    ctx.fillRect(x + width - postW - 1, y - 3, postW + 2, 4);
    ctx.fillStyle = postShd;
    ctx.fillRect(x - 2, y + 1, postW + 4, 1);
    ctx.fillRect(x + width - postW - 2, y + 1, postW + 4, 1);

    ctx.restore();
  }

  // ===========================================================
  // ---- Stadium Background (cached to offscreen canvas) ----
  // 6-stop sky, fluffy clouds, concrete tiers, dense crowd,
  // ad boards, rich pitch with mowing stripes, floodlights
  // ===========================================================

  let _stadiumCache = null;
  let _stadiumCacheW = 0;
  let _stadiumCacheH = 0;

  function drawStadium(ctx, canvasWidth, canvasHeight) {
    if (_stadiumCache && _stadiumCacheW === canvasWidth && _stadiumCacheH === canvasHeight) {
      ctx.drawImage(_stadiumCache, 0, 0);
      return;
    }

    ctx.save();
    ctx.imageSmoothingEnabled = false;

    const horizonY = canvasHeight * 0.35;
    const pitchTop = canvasHeight * 0.45;

    // === SKY: 6-stop gradient ===
    const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY + 10);
    skyGrad.addColorStop(0, '#061848');
    skyGrad.addColorStop(0.15, '#0a3080');
    skyGrad.addColorStop(0.35, '#1960b0');
    skyGrad.addColorStop(0.55, '#3890d8');
    skyGrad.addColorStop(0.75, '#70b8e8');
    skyGrad.addColorStop(1, '#a8d8f0');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, canvasWidth, horizonY + 10);

    // Warm sun glow
    const sunGrad = ctx.createRadialGradient(canvasWidth * 0.45, horizonY * 0.08, 5, canvasWidth * 0.45, horizonY * 0.08, horizonY * 0.4);
    sunGrad.addColorStop(0, 'rgba(255, 255, 220, 0.25)');
    sunGrad.addColorStop(0.5, 'rgba(255, 255, 200, 0.08)');
    sunGrad.addColorStop(1, 'rgba(255, 255, 200, 0)');
    ctx.fillStyle = sunGrad;
    ctx.fillRect(0, 0, canvasWidth, horizonY);

    // === Clouds (3-4 with 3-shade rendering) ===
    drawCloud(ctx, canvasWidth * 0.12, horizonY * 0.10, 70, 24);
    drawCloud(ctx, canvasWidth * 0.38, horizonY * 0.05, 90, 30);
    drawCloud(ctx, canvasWidth * 0.65, horizonY * 0.14, 60, 20);
    drawCloud(ctx, canvasWidth * 0.85, horizonY * 0.08, 50, 16);

    // === Stadium Structure ===
    const backStandTop = horizonY * 0.22;
    const backStandBot = horizonY * 0.78;
    const backStandLeft = canvasWidth * 0.10;
    const backStandRight = canvasWidth * 0.90;

    // Roof overhang with shadow
    ctx.fillStyle = '#4a5a6a';
    ctx.fillRect(backStandLeft - 8, backStandTop - 18, backStandRight - backStandLeft + 16, 20);
    ctx.fillStyle = '#3d4d5d';
    ctx.fillRect(backStandLeft - 8, backStandTop - 2, backStandRight - backStandLeft + 16, 4);

    // Shadow cast onto top tier
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.fillRect(backStandLeft, backStandTop + 2, backStandRight - backStandLeft, 6);

    // Back stand: 5 concrete tiers with 3D step shading
    const tierCount = 5;
    const tierH = (backStandBot - backStandTop) / tierCount;
    for (let t = 0; t < tierCount; t++) {
      const ty = backStandTop + t * tierH;
      const baseR = 125 + t * 12;
      const baseG = 115 + t * 10;
      const baseB = 105 + t * 8;
      // Top of tier (lighter)
      ctx.fillStyle = `rgb(${baseR + 15}, ${baseG + 12}, ${baseB + 10})`;
      ctx.fillRect(backStandLeft, ty, backStandRight - backStandLeft, tierH * 0.4);
      // Middle
      ctx.fillStyle = `rgb(${baseR}, ${baseG}, ${baseB})`;
      ctx.fillRect(backStandLeft, ty + tierH * 0.4, backStandRight - backStandLeft, tierH * 0.3);
      // Bottom (darker)
      ctx.fillStyle = `rgb(${baseR - 15}, ${baseG - 12}, ${baseB - 10})`;
      ctx.fillRect(backStandLeft, ty + tierH * 0.7, backStandRight - backStandLeft, tierH * 0.3);
      // Concrete speckle texture (deterministic)
      for (let sx = backStandLeft; sx < backStandRight; sx += 5) {
        const h = hashInt(sx * 31 + t * 97 + 4321);
        if ((h & 31) < 3) {
          ctx.fillStyle = (h & 1) ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
          ctx.fillRect(sx, ty + (h % Math.max(1, Math.floor(tierH))), 2, 1);
        }
      }
      // Structural columns (darker vertical lines every 40-50px)
      for (let cx = backStandLeft + 40; cx < backStandRight; cx += 45) {
        ctx.fillStyle = `rgb(${baseR - 25}, ${baseG - 22}, ${baseB - 20})`;
        ctx.fillRect(cx, ty, 2, tierH);
      }
    }

    // Metal railing
    ctx.fillStyle = '#c0ccdd';
    ctx.fillRect(backStandLeft, backStandBot, backStandRight - backStandLeft, 2);
    ctx.fillStyle = '#e0eeff';
    ctx.fillRect(backStandLeft, backStandBot, backStandRight - backStandLeft, 1);
    for (let rx = backStandLeft; rx < backStandRight; rx += 25) {
      ctx.fillStyle = '#a0b0c0';
      ctx.fillRect(rx, backStandBot - 8, 2, 10);
      ctx.fillStyle = '#c0d0e0';
      ctx.fillRect(rx, backStandBot - 8, 1, 10);
    }

    // Side stands
    drawStandSection(ctx, 0, horizonY * 0.30, canvasWidth * 0.12, horizonY * 0.95);
    drawStandSection(ctx, canvasWidth * 0.88, horizonY * 0.30, canvasWidth, horizonY * 0.95);

    // === DENSE CROWD (85-90% fill) ===
    drawCrowdBlock(ctx, backStandLeft + 2, backStandTop + 3, (backStandRight - backStandLeft) / 2 - 4, backStandBot - backStandTop - 6, 0.4, 'green');
    drawCrowdBlock(ctx, (backStandLeft + backStandRight) / 2, backStandTop + 3, (backStandRight - backStandLeft) / 2 - 2, backStandBot - backStandTop - 6, 0.4, 'white');
    drawCrowdBlock(ctx, 2, horizonY * 0.35, canvasWidth * 0.10, horizonY * 0.55, 0.3, 'green');
    drawCrowdBlock(ctx, canvasWidth * 0.90, horizonY * 0.35, canvasWidth * 0.10, horizonY * 0.55, 0.3, 'white');

    // === Floodlights ===
    drawFloodlight(ctx, canvasWidth * 0.05, horizonY * 0.01, 0.9);
    drawFloodlight(ctx, canvasWidth * 0.95, horizonY * 0.01, 0.9);
    drawFloodlight(ctx, canvasWidth * 0.18, horizonY * 0.06, 0.65);
    drawFloodlight(ctx, canvasWidth * 0.82, horizonY * 0.06, 0.65);

    // === Ad boards ===
    const adY = horizonY + 2;
    const adH = 10;
    const adColors = ['#cc2233', '#2255bb', '#33aa44', '#ddaa11', '#cc44aa', '#2299cc', '#ee6622', '#7744bb', '#44aa88', '#dd6644'];
    let adX = canvasWidth * 0.04;
    const adTotalW = canvasWidth * 0.92;
    const adWidth = adTotalW / adColors.length;
    for (let i = 0; i < adColors.length; i++) {
      ctx.fillStyle = adColors[i];
      ctx.fillRect(adX, adY, adWidth - 3, adH);
      ctx.fillStyle = darken(adColors[i], 0.35);
      ctx.fillRect(adX, adY + adH - 2, adWidth - 3, 2);
      ctx.fillStyle = lighten(adColors[i], 0.2);
      ctx.fillRect(adX, adY, adWidth - 3, 1);
      for (let tx = adX + 5; tx < adX + adWidth - 8; tx += 4) {
        const th = hashInt(tx * 17 + i * 53);
        if ((th & 3) < 3) {
          ctx.fillStyle = 'rgba(255,255,255,0.5)';
          ctx.fillRect(tx, adY + 3 + ((th >> 3) & 1), 2, 1);
        }
      }
      adX += adWidth;
    }

    // === PITCH ===
    const pitchY = adY + adH + 2;
    const pitchH = canvasHeight - pitchY;

    // Base 3-stop green gradient
    const pitchGrad = ctx.createLinearGradient(0, pitchY, 0, canvasHeight);
    pitchGrad.addColorStop(0, '#1e7a32');
    pitchGrad.addColorStop(0.5, '#2a9a42');
    pitchGrad.addColorStop(1, '#239038');
    ctx.fillStyle = pitchGrad;
    ctx.fillRect(0, pitchY, canvasWidth, pitchH);

    // Mowing stripes (alternating 25px bands, 5-8% contrast)
    const stripeWidth = 25;
    for (let sx = 0; sx < canvasWidth; sx += stripeWidth * 2) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.07)';
      ctx.fillRect(sx, pitchY, stripeWidth, pitchH);
    }

    // Grass texture (deterministic hash-based)
    for (let gy = pitchY; gy < canvasHeight; gy += 4) {
      for (let gx = 0; gx < canvasWidth; gx += 4) {
        const h = hashInt(gx * 7 + gy * 13 + 12345);
        if ((h & 15) < 2) {
          ctx.fillStyle = (h & 1) ? 'rgba(0, 60, 0, 0.08)' : 'rgba(80, 200, 80, 0.06)';
          ctx.fillRect(gx, gy, 2, 2);
        }
      }
    }

    // === Pitch markings (2px white lines) ===
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.lineWidth = 2;

    const centerX = canvasWidth / 2;

    // Penalty box
    const penBoxW = canvasWidth * 0.45;
    const penBoxH = pitchH * 0.35;
    const penBoxX = (canvasWidth - penBoxW) / 2;
    ctx.strokeRect(penBoxX, pitchY, penBoxW, penBoxH);

    // 6-yard box
    const sixYardW = canvasWidth * 0.25;
    const sixYardH = pitchH * 0.15;
    const sixYardX = (canvasWidth - sixYardW) / 2;
    ctx.strokeRect(sixYardX, pitchY, sixYardW, sixYardH);

    // Penalty spot (6px filled circle)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.beginPath();
    ctx.arc(centerX, pitchY + penBoxH * 0.75, 3, 0, Math.PI * 2);
    ctx.fill();

    // Penalty arc (partial circle)
    ctx.beginPath();
    ctx.arc(centerX, pitchY + penBoxH * 0.75, penBoxH * 0.35, 0.3 * Math.PI, 0.7 * Math.PI);
    ctx.stroke();

    // Center circle at bottom
    ctx.beginPath();
    ctx.arc(centerX, canvasHeight, canvasWidth * 0.12, -Math.PI, 0);
    ctx.stroke();

    // Corner flags
    drawCornerFlag(ctx, 4, pitchY + 2);
    drawCornerFlag(ctx, canvasWidth - 8, pitchY + 2);

    // Grass tufts near touchline
    for (let fx = 6; fx < canvasWidth; fx += 30) {
      const fh = hashInt(fx * 41 + 13);
      if ((fh & 3) === 0) {
        ctx.fillStyle = '#228833';
        ctx.fillRect(fx, canvasHeight - 3, 1, 3);
        ctx.fillRect(fx + 1, canvasHeight - 2, 1, 2);
      }
    }

    ctx.restore();

    // Cache to offscreen canvas
    try {
      const offscreen = document.createElement('canvas');
      offscreen.width = canvasWidth;
      offscreen.height = canvasHeight;
      const octx = offscreen.getContext('2d');
      octx.drawImage(ctx.canvas, 0, 0);
      _stadiumCache = offscreen;
      _stadiumCacheW = canvasWidth;
      _stadiumCacheH = canvasHeight;
    } catch (e) {
      // If caching fails, continue without cache
    }
  }

  // --- Stadium helper: Cloud (3-shade fluffy) ---
  function drawCloud(ctx, cx, cy, w, h) {
    const cloudHi = '#ffffff';
    const cloudMid = '#ddeeff';
    const cloudShd = '#bbccdd';

    // Shadow layer (bottom)
    ctx.fillStyle = cloudShd;
    ctx.fillRect(cx - w * 0.35, cy + h * 0.3, w * 0.7, h * 0.25);
    ctx.fillRect(cx - w * 0.25, cy + h * 0.45, w * 0.5, h * 0.15);

    // Mid body
    ctx.fillStyle = cloudMid;
    ctx.fillRect(cx - w * 0.4, cy - h * 0.05, w * 0.8, h * 0.5);
    ctx.fillRect(cx - w * 0.3, cy - h * 0.15, w * 0.6, h * 0.3);

    // Top bumps (bright highlights)
    ctx.fillStyle = cloudHi;
    ctx.fillRect(cx - w * 0.32, cy - h * 0.35, w * 0.38, h * 0.35);
    ctx.fillRect(cx + w * 0.02, cy - h * 0.25, w * 0.32, h * 0.28);
    ctx.fillRect(cx - w * 0.48, cy - h * 0.12, w * 0.28, h * 0.22);
    ctx.fillRect(cx + w * 0.22, cy - h * 0.08, w * 0.2, h * 0.18);
  }

  // --- Stadium helper: Stand section ---
  function drawStandSection(ctx, x1, y1, x2, y2) {
    const w = x2 - x1;
    const h = y2 - y1;
    const tierCount = 4;
    const tierH = h / tierCount;
    for (let t = 0; t < tierCount; t++) {
      const ty = y1 + t * tierH;
      const baseR = 130 + t * 12;
      const baseG = 118 + t * 10;
      const baseB = 106 + t * 8;
      ctx.fillStyle = `rgb(${baseR + 10}, ${baseG + 8}, ${baseB + 6})`;
      ctx.fillRect(x1, ty, w, tierH * 0.5);
      ctx.fillStyle = `rgb(${baseR}, ${baseG}, ${baseB})`;
      ctx.fillRect(x1, ty + tierH * 0.5, w, tierH * 0.3);
      ctx.fillStyle = `rgb(${baseR - 12}, ${baseG - 10}, ${baseB - 8})`;
      ctx.fillRect(x1, ty + tierH * 0.8, w, tierH * 0.2);
    }
    ctx.fillStyle = '#b0c0d0';
    ctx.fillRect(x1, y2, w, 2);
  }

  // --- Stadium helper: Floodlight with glow ---
  function drawFloodlight(ctx, x, y, size) {
    const mastW = Math.max(4, 5 * size);
    const mastH = 70 * size;
    const panelW = 22 * size;
    const panelH = 12 * size;

    // Mast (3-shade gray, 4px wide)
    ctx.fillStyle = '#667788';
    ctx.fillRect(x - mastW / 2, y, mastW, mastH);
    ctx.fillStyle = '#99aabb';
    ctx.fillRect(x - mastW / 2, y, Math.max(1, mastW * 0.25), mastH);
    ctx.fillStyle = '#556677';
    ctx.fillRect(x + mastW / 2 - Math.max(1, mastW * 0.25), y, Math.max(1, mastW * 0.25), mastH);

    // Light panel (bright yellow/white rectangle)
    ctx.fillStyle = '#dddde8';
    ctx.fillRect(x - panelW / 2, y, panelW, panelH);
    ctx.fillStyle = '#ffffee';
    ctx.fillRect(x - panelW / 2 + 2, y + 2, panelW - 4, panelH - 4);
    ctx.fillStyle = '#fffff8';
    ctx.fillRect(x - panelW / 4, y + 3, panelW / 2, panelH - 6);

    // Light glow cone
    ctx.fillStyle = 'rgba(255, 255, 230, 0.06)';
    ctx.beginPath();
    ctx.moveTo(x - panelW / 2, y + panelH);
    ctx.lineTo(x - panelW * 2, y + mastH);
    ctx.lineTo(x + panelW * 2, y + mastH);
    ctx.lineTo(x + panelW / 2, y + panelH);
    ctx.fill();
    ctx.fillStyle = 'rgba(255, 255, 240, 0.04)';
    ctx.beginPath();
    ctx.moveTo(x - panelW / 3, y + panelH);
    ctx.lineTo(x - panelW * 1.2, y + mastH);
    ctx.lineTo(x + panelW * 1.2, y + mastH);
    ctx.lineTo(x + panelW / 3, y + panelH);
    ctx.fill();
  }

  function drawCornerFlag(ctx, x, y) {
    ctx.fillStyle = '#cccccc';
    ctx.fillRect(x, y - 12, 1, 16);
    ctx.fillStyle = '#eeeeee';
    ctx.fillRect(x + 1, y - 12, 1, 16);
    // Flag triangle
    ctx.fillStyle = '#ee3344';
    ctx.fillRect(x + 2, y - 12, 5, 2);
    ctx.fillRect(x + 2, y - 10, 4, 2);
    ctx.fillRect(x + 2, y - 8, 3, 1);
    ctx.fillRect(x + 2, y - 7, 2, 1);
  }

  // ===========================================================
  // ---- Crowd (DENSE, 85-90% fill, deterministic seeded) ----
  // ===========================================================

  function drawCrowdBlock(ctx, x, y, w, h, density, teamBias) {
    const fanW = 4;
    const fanH = 5;
    const headH = 2;

    // 15+ shirt colors
    const baseColors = [
      '#cc2233', '#2255bb', '#33aa44', '#ddaa11', '#cc44aa',
      '#2299cc', '#ee6622', '#8866aa', '#44bb88', '#ffaa33',
      '#dd6688', '#5588cc', '#993355', '#779944', '#aa5533',
    ];
    const greenColors = ['#2d8a4e', '#3da85e', '#4cc270', '#1a6636', '#228844'];
    const whiteColors = ['#ffffff', '#f0f0f0', '#eeeeee', '#dddddd', '#e8e8e8'];
    // 4 skin tone variations
    const skinTones = ['#ffddbb', '#eebb88', '#cc9966', '#ddaa77'];

    const cols = Math.floor(w / fanW);
    const rows = Math.floor(h / (fanH + 1));

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const hash = hashInt(col * 7 + row * 13 + 42);
        if ((hash & 7) > 6) continue; // ~87% fill

        const fx = x + col * fanW;
        const fy = y + row * (fanH + 1);

        // Determine shirt color with team bias
        let colorPool;
        if (teamBias === 'green' && (hash & 3) < 2) {
          colorPool = greenColors;
        } else if (teamBias === 'white' && (hash & 3) < 2) {
          colorPool = whiteColors;
        } else {
          colorPool = baseColors;
        }
        const colorIdx = (hash >> 3) % colorPool.length;
        ctx.fillStyle = colorPool[colorIdx];
        ctx.fillRect(fx, fy + headH, fanW - 1, fanH - headH);

        // Head (2px skin-toned circle)
        const skinIdx = (hash >> 6) % skinTones.length;
        ctx.fillStyle = skinTones[skinIdx];
        ctx.fillRect(fx + 1, fy, fanW - 2, headH);

        // Arms raised (1px dots above head)
        if ((hash & 31) < (4 + density * 12)) {
          ctx.fillStyle = skinTones[skinIdx];
          ctx.fillRect(fx + fanW - 1, fy - 1, 1, 2);
        }

        // Scarves (2-3px colored lines)
        if ((hash & 63) < 5) {
          const scarfColor = (hash & 1) ? '#2d8a4e' : '#ffffff';
          ctx.fillStyle = scarfColor;
          ctx.fillRect(fx, fy - 2, 3, 1);
        }

        // Banners (4x6 team-colored blocks)
        if ((hash & 127) < 2 && col < cols - 2) {
          const bannerColor = (hash & 1) ? '#2d8a4e' : '#f0f0f0';
          ctx.fillStyle = bannerColor;
          ctx.fillRect(fx, fy - 3, 6, 3);
          ctx.fillStyle = darken(bannerColor, 0.3);
          ctx.fillRect(fx, fy, 6, 1);
        }
      }
    }
  }

  function drawCrowd(ctx, x, y, width, height, excitement) {
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    drawCrowdBlock(ctx, x, y, width, height, excitement, null);

    if (excitement > 0.5) {
      const extraFans = Math.floor(excitement * 10);
      for (let i = 0; i < extraFans; i++) {
        const fx = x + ((i * 37 + 11) % Math.floor(width));
        const fy = y + ((i * 19 + 7) % Math.max(1, Math.floor(height - 8)));
        const scarfColor = i % 2 === 0 ? '#2d8a4e' : '#ffffff';
        ctx.fillStyle = scarfColor;
        ctx.fillRect(fx, fy - 3, 7, 2);
        ctx.fillRect(fx + 7, fy - 4, 3, 2);
      }
    }

    ctx.restore();
  }

  // ===========================================================
  // ---- Pixel Text (5x7 font) ----
  // Supports A-Z, 0-9, space, : - . ! ? / ( ) ' # +
  // ===========================================================

  const CHAR_W = 5;
  const CHAR_H = 7;
  const PIXEL_FONT = {
    'A': ['01110','10001','10001','11111','10001','10001','10001'],
    'B': ['11110','10001','10001','11110','10001','10001','11110'],
    'C': ['01110','10001','10000','10000','10000','10001','01110'],
    'D': ['11100','10010','10001','10001','10001','10010','11100'],
    'E': ['11111','10000','10000','11110','10000','10000','11111'],
    'F': ['11111','10000','10000','11110','10000','10000','10000'],
    'G': ['01110','10001','10000','10111','10001','10001','01110'],
    'H': ['10001','10001','10001','11111','10001','10001','10001'],
    'I': ['11111','00100','00100','00100','00100','00100','11111'],
    'J': ['00111','00010','00010','00010','00010','10010','01100'],
    'K': ['10001','10010','10100','11000','10100','10010','10001'],
    'L': ['10000','10000','10000','10000','10000','10000','11111'],
    'M': ['10001','11011','10101','10101','10001','10001','10001'],
    'N': ['10001','11001','10101','10011','10001','10001','10001'],
    'O': ['01110','10001','10001','10001','10001','10001','01110'],
    'P': ['11110','10001','10001','11110','10000','10000','10000'],
    'Q': ['01110','10001','10001','10001','10101','10010','01101'],
    'R': ['11110','10001','10001','11110','10100','10010','10001'],
    'S': ['01111','10000','10000','01110','00001','00001','11110'],
    'T': ['11111','00100','00100','00100','00100','00100','00100'],
    'U': ['10001','10001','10001','10001','10001','10001','01110'],
    'V': ['10001','10001','10001','10001','01010','01010','00100'],
    'W': ['10001','10001','10001','10101','10101','11011','10001'],
    'X': ['10001','10001','01010','00100','01010','10001','10001'],
    'Y': ['10001','10001','01010','00100','00100','00100','00100'],
    'Z': ['11111','00001','00010','00100','01000','10000','11111'],
    '0': ['01110','10001','10011','10101','11001','10001','01110'],
    '1': ['00100','01100','00100','00100','00100','00100','01110'],
    '2': ['01110','10001','00001','00010','00100','01000','11111'],
    '3': ['01110','10001','00001','00110','00001','10001','01110'],
    '4': ['00010','00110','01010','10010','11111','00010','00010'],
    '5': ['11111','10000','11110','00001','00001','10001','01110'],
    '6': ['00110','01000','10000','11110','10001','10001','01110'],
    '7': ['11111','00001','00010','00100','01000','01000','01000'],
    '8': ['01110','10001','10001','01110','10001','10001','01110'],
    '9': ['01110','10001','10001','01111','00001','00010','01100'],
    ':': ['00000','00100','00000','00000','00000','00100','00000'],
    '-': ['00000','00000','00000','11111','00000','00000','00000'],
    '.': ['00000','00000','00000','00000','00000','00000','00100'],
    '!': ['00100','00100','00100','00100','00100','00000','00100'],
    '?': ['01110','10001','00001','00110','00100','00000','00100'],
    '/': ['00001','00010','00010','00100','01000','01000','10000'],
    '(': ['00010','00100','01000','01000','01000','00100','00010'],
    ')': ['01000','00100','00010','00010','00010','00100','01000'],
    "'": ['00100','00100','01000','00000','00000','00000','00000'],
    '#': ['01010','01010','11111','01010','11111','01010','01010'],
    '+': ['00000','00100','00100','11111','00100','00100','00000'],
    ' ': ['00000','00000','00000','00000','00000','00000','00000'],
  };

  function drawPixelText(ctx, text, x, y, size, color, align) {
    ctx.save();
    ctx.imageSmoothingEnabled = false;

    const str = String(text).toUpperCase();
    const charSpacing = 1;
    const totalW = str.length * (CHAR_W + charSpacing) - charSpacing;

    let startX = x;
    if (align === 'center') startX = x - (totalW * size) / 2;
    else if (align === 'right') startX = x - totalW * size;

    // Shadow pass
    const shadowColor = darken(color.startsWith('#') ? color : '#ffffff', 0.65);
    for (let ci = 0; ci < str.length; ci++) {
      const glyph = PIXEL_FONT[str[ci]];
      if (!glyph) continue;
      const cx = startX + ci * (CHAR_W + charSpacing) * size;
      for (let row = 0; row < CHAR_H; row++) {
        for (let col = 0; col < CHAR_W; col++) {
          if (glyph[row][col] === '1') {
            ctx.fillStyle = shadowColor;
            ctx.fillRect(cx + col * size + 1, y + row * size + 1, size, size);
          }
        }
      }
    }

    // Main text
    for (let ci = 0; ci < str.length; ci++) {
      const glyph = PIXEL_FONT[str[ci]];
      if (!glyph) continue;
      const cx = startX + ci * (CHAR_W + charSpacing) * size;
      for (let row = 0; row < CHAR_H; row++) {
        for (let col = 0; col < CHAR_W; col++) {
          if (glyph[row][col] === '1') {
            ctx.fillStyle = color;
            ctx.fillRect(cx + col * size, y + row * size, size, size);
          }
        }
      }
    }

    ctx.restore();
  }

  // ===========================================================
  // ---- UI Frame (JRPG style) ----
  // Three styles: menu (blue), hud (green/teal), result (gold)
  // ===========================================================

  function drawUIFrame(ctx, x, y, w, h, style) {
    ctx.save();
    ctx.imageSmoothingEnabled = false;

    let outerDark, borderLight, borderMid, borderDark, fillColor, innerLight, innerDark, cornerColor, cornerDark;

    if (style === 'hud') {
      outerDark = '#112222';
      borderLight = '#44aa99';
      borderMid = '#338877';
      borderDark = '#226655';
      fillColor = 'rgba(10, 35, 30, 0.88)';
      innerLight = '#66ccbb';
      innerDark = '#113322';
      cornerColor = '#88eedd';
      cornerDark = '#44aa99';
    } else if (style === 'result') {
      outerDark = '#332200';
      borderLight = '#ccaa44';
      borderMid = '#aa7722';
      borderDark = '#886622';
      fillColor = 'rgba(40, 30, 10, 0.90)';
      innerLight = '#eedd66';
      innerDark = '#443311';
      cornerColor = '#ffee88';
      cornerDark = '#ddaa44';
    } else {
      // 'menu' default
      outerDark = '#11113a';
      borderLight = '#5577cc';
      borderMid = '#3355aa';
      borderDark = '#223388';
      fillColor = 'rgba(15, 15, 50, 0.92)';
      innerLight = '#7799ee';
      innerDark = '#111133';
      cornerColor = '#88bbff';
      cornerDark = '#4477cc';
    }

    // Outer 1px dark line
    ctx.fillStyle = outerDark;
    ctx.fillRect(x, y, w, h);

    // 3px gradient border (brighter top-left, darker bottom-right)
    const bw = 3;
    ctx.fillStyle = borderLight;
    ctx.fillRect(x + 1, y + 1, w - 2, 1);
    ctx.fillStyle = borderMid;
    ctx.fillRect(x + 1, y + 2, w - 2, 1);
    ctx.fillStyle = borderDark;
    ctx.fillRect(x + 1, y + 3, w - 2, 1);
    ctx.fillStyle = borderDark;
    ctx.fillRect(x + 1, y + h - 4, w - 2, 1);
    ctx.fillStyle = borderMid;
    ctx.fillRect(x + 1, y + h - 3, w - 2, 1);
    ctx.fillStyle = borderLight;
    ctx.fillRect(x + 1, y + h - 2, w - 2, 1);
    ctx.fillStyle = borderLight;
    ctx.fillRect(x + 1, y + 1, 1, h - 2);
    ctx.fillStyle = borderMid;
    ctx.fillRect(x + 2, y + 1, 1, h - 2);
    ctx.fillStyle = borderDark;
    ctx.fillRect(x + 3, y + 1, 1, h - 2);
    ctx.fillStyle = borderDark;
    ctx.fillRect(x + w - 4, y + 1, 1, h - 2);
    ctx.fillStyle = borderMid;
    ctx.fillRect(x + w - 3, y + 1, 1, h - 2);
    ctx.fillStyle = borderLight;
    ctx.fillRect(x + w - 2, y + 1, 1, h - 2);

    // Inner 1px bright highlight on top and left
    ctx.fillStyle = innerLight;
    ctx.fillRect(x + bw + 1, y + bw + 1, w - bw * 2 - 2, 1);
    ctx.fillRect(x + bw + 1, y + bw + 1, 1, h - bw * 2 - 2);
    // Inner 1px dark on bottom and right
    ctx.fillStyle = innerDark;
    ctx.fillRect(x + bw + 1, y + h - bw - 2, w - bw * 2 - 2, 1);
    ctx.fillRect(x + w - bw - 2, y + bw + 1, 1, h - bw * 2 - 2);

    // Semi-transparent fill with subtle vertical gradient
    ctx.fillStyle = fillColor;
    ctx.fillRect(x + bw + 2, y + bw + 2, w - bw * 2 - 4, h - bw * 2 - 4);
    const fillGrad = ctx.createLinearGradient(x, y, x, y + h);
    fillGrad.addColorStop(0, 'rgba(255,255,255,0.06)');
    fillGrad.addColorStop(0.5, 'rgba(255,255,255,0.02)');
    fillGrad.addColorStop(1, 'rgba(0,0,0,0.12)');
    ctx.fillStyle = fillGrad;
    ctx.fillRect(x + bw + 2, y + bw + 2, w - bw * 2 - 4, h - bw * 2 - 4);

    // 4x4 diamond corner ornaments with bright center
    const corners = [
      [x + 1, y + 1],
      [x + w - 6, y + 1],
      [x + 1, y + h - 6],
      [x + w - 6, y + h - 6]
    ];
    for (const [cx, cy] of corners) {
      ctx.fillStyle = cornerDark;
      ctx.fillRect(cx + 1, cy, 2, 1);
      ctx.fillRect(cx, cy + 1, 4, 1);
      ctx.fillRect(cx, cy + 2, 4, 1);
      ctx.fillRect(cx + 1, cy + 3, 2, 1);
      ctx.fillStyle = cornerColor;
      ctx.fillRect(cx + 1, cy + 1, 2, 2);
    }

    // Extra star ornaments for 'result' style
    if (style === 'result') {
      ctx.fillStyle = cornerColor;
      for (let sx = x + 14; sx < x + w - 14; sx += 20) {
        ctx.fillRect(sx, y + 1, 1, 1);
        ctx.fillRect(sx - 1, y + 2, 3, 1);
        ctx.fillRect(sx, y + 3, 1, 1);
      }
      for (let sx = x + 14; sx < x + w - 14; sx += 20) {
        ctx.fillRect(sx, y + h - 2, 1, 1);
        ctx.fillRect(sx - 1, y + h - 3, 3, 1);
        ctx.fillRect(sx, y + h - 4, 1, 1);
      }
    }

    ctx.restore();
  }

  // ===========================================================
  // ---- Flag (cloth banner with fold shading) ----
  // ===========================================================

  function drawFlag(ctx, x, y, team, scale) {
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    const s = scale || 1;

    // Flagpole (dark wood with golden ball finial)
    const poleH = 32 * s;
    ctx.fillStyle = '#6b5544';
    ctx.fillRect(x, y - poleH, Math.ceil(2 * s), poleH);
    ctx.fillStyle = '#8a7766';
    ctx.fillRect(x, y - poleH, Math.ceil(1 * s), poleH);
    // Golden ball finial
    ctx.fillStyle = '#ffcc44';
    ctx.fillRect(x - Math.ceil(1 * s), y - poleH - Math.ceil(3 * s), Math.ceil(4 * s), Math.ceil(4 * s));
    ctx.fillStyle = '#ffee88';
    ctx.fillRect(x, y - poleH - Math.ceil(2 * s), Math.ceil(2 * s), Math.ceil(2 * s));
    ctx.fillStyle = '#ddaa22';
    ctx.fillRect(x + Math.ceil(2 * s), y - poleH - Math.ceil(2 * s), Math.ceil(1 * s), Math.ceil(3 * s));

    // Banner with 3 vertical shading bands (light/mid/dark for fabric fold)
    const bannerW = 18 * s;
    const bannerH = 14 * s;
    const bx = x + Math.ceil(2 * s);
    const by = y - poleH;

    if (team === 'cats') {
      const bandW = bannerW / 3;
      ctx.fillStyle = '#3da85e'; // light fold
      ctx.fillRect(bx, by, bandW, bannerH);
      ctx.fillStyle = '#2d8a4e'; // mid
      ctx.fillRect(bx + bandW, by, bandW, bannerH);
      ctx.fillStyle = '#1e6e3a'; // dark fold
      ctx.fillRect(bx + bandW * 2, by, bandW, bannerH);
      // White paw emblem
      const pw = bx + bannerW * 0.35;
      const ph = by + bannerH * 0.25;
      const ps = Math.max(1, Math.floor(s));
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(pw + ps, ph + 2 * ps, 2 * ps, 2 * ps);
      ctx.fillRect(pw, ph, ps, ps);
      ctx.fillRect(pw + ps, ph - ps, ps, ps);
      ctx.fillRect(pw + 2 * ps, ph, ps, ps);
      ctx.fillRect(pw + 3 * ps, ph + ps, ps, ps);
    } else {
      const bandW = bannerW / 3;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(bx, by, bandW, bannerH);
      ctx.fillStyle = '#eeeeee';
      ctx.fillRect(bx + bandW, by, bandW, bannerH);
      ctx.fillStyle = '#dddddd';
      ctx.fillRect(bx + bandW * 2, by, bandW, bannerH);
      // Yellow cheese wedge emblem
      const cw = bx + bannerW * 0.3;
      const ch = by + bannerH * 0.2;
      const cs = Math.max(1, Math.floor(s));
      ctx.fillStyle = '#ffcc22';
      ctx.fillRect(cw, ch, 4 * cs, 3 * cs);
      ctx.fillRect(cw + cs, ch + 3 * cs, 2 * cs, cs);
      ctx.fillStyle = '#eebb00';
      ctx.fillRect(cw + cs, ch + cs, cs, cs);
      ctx.fillStyle = '#dd9900';
      ctx.fillRect(cw + 3 * cs, ch, cs, cs);
    }

    ctx.fillStyle = team === 'cats' ? '#1a5530' : '#bbbbbb';
    ctx.fillRect(bx, by + bannerH, bannerW, Math.ceil(s));

    ctx.restore();
  }

  // ===========================================================
  // ---- Coin (gold disk, 8-frame rotation, sparkle) ----
  // ===========================================================

  function drawCoin(ctx, x, y, scale, frame) {
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    const s = PX * (scale || 1);

    const phase = ((frame || 0) % 8);
    const phaseInt = Math.floor(phase) % 8;

    // Width squish for 3D rotation
    const squishFactors = [1.0, 0.85, 0.5, 0.15, 0.15, 0.5, 0.85, 1.0];
    const squish = squishFactors[phaseInt];
    const showFront = phaseInt < 4;

    // 4 gold shades
    const goldHi = '#ffe066';
    const goldMid = '#ddaa22';
    const goldShd = '#aa7711';
    const goldDeep = '#664400';

    const coinR = 7;
    const coinW = Math.max(1, Math.floor(coinR * 2 * squish));
    const coinX = x - Math.floor(coinW * s / 2);
    const coinY = y;
    const coinH = coinR * 2;

    // Draw coin body with sphere shading
    for (let cy = 0; cy < coinH; cy++) {
      const rowDist = Math.abs(cy - coinR + 0.5) / coinR;
      const rowW = Math.floor(coinW * Math.sqrt(Math.max(0, 1 - rowDist * rowDist)));
      if (rowW <= 0) continue;
      const rowX = coinX + Math.floor((coinW - rowW) * s / 2);

      let color;
      if (cy < coinH * 0.2) color = goldHi;
      else if (cy < coinH * 0.5) color = goldMid;
      else if (cy < coinH * 0.75) color = goldShd;
      else color = goldDeep;

      ctx.fillStyle = color;
      ctx.fillRect(rowX, coinY + cy * s, rowW * s, s);
    }

    // Edge highlight
    if (squish > 0.3) {
      ctx.fillStyle = goldHi;
      ctx.fillRect(coinX + 1, coinY + 2 * s, Math.ceil(s), (coinH - 4) * s);
    }

    // Emblem on face
    if (squish > 0.4) {
      const emblemX = coinX + Math.floor(coinW * s * 0.28);
      const emblemY = coinY + Math.floor(coinH * s * 0.22);
      const emblemS = Math.max(1, Math.floor(squish * s));

      if (showFront) {
        // Cat paw
        ctx.fillStyle = goldDeep;
        ctx.fillRect(emblemX + emblemS, emblemY + 2 * emblemS, 2 * emblemS, emblemS);
        ctx.fillRect(emblemX, emblemY, emblemS, emblemS);
        ctx.fillRect(emblemX + 2 * emblemS, emblemY, emblemS, emblemS);
        ctx.fillRect(emblemX + emblemS, emblemY - emblemS, emblemS, emblemS);
      } else {
        // Cheese wedge
        ctx.fillStyle = goldDeep;
        ctx.fillRect(emblemX, emblemY, 3 * emblemS, 2 * emblemS);
        ctx.fillRect(emblemX + emblemS, emblemY + 2 * emblemS, emblemS, emblemS);
        ctx.fillStyle = goldMid;
        ctx.fillRect(emblemX + emblemS, emblemY + emblemS, emblemS, emblemS);
      }
    }

    // Sparkle effect
    const sparkleTime = (Date.now() / 100) % 16;
    if (sparkleTime < 4) {
      ctx.fillStyle = '#ffffff';
      const sx = coinX + Math.floor(coinW * s * 0.18);
      const sy = coinY + 2 * s;
      ctx.fillRect(sx, sy, s, s);
      ctx.fillRect(sx - s, sy, s * 3, 1);
      ctx.fillRect(sx, sy - s, 1, s * 3);
      if (sparkleTime < 2) {
        ctx.fillRect(sx + s * 2, sy - s, s, s);
      }
    }

    ctx.restore();
  }

  // ===========================================================
  // ---- Power Meter (metallic frame, 16 segments) ----
  // ===========================================================

  function drawPowerMeter(ctx, x, y, width, height, value, locked) {
    ctx.save();
    ctx.imageSmoothingEnabled = false;

    // Metallic frame (2px with highlight top/left, shadow bottom/right)
    ctx.fillStyle = '#2a3344';
    ctx.fillRect(x - 2, y - 2, width + 4, height + 4);
    ctx.fillStyle = '#8899aa';
    ctx.fillRect(x - 1, y - 1, width + 2, 1);
    ctx.fillRect(x - 1, y - 1, 1, height + 2);
    ctx.fillStyle = '#1a2233';
    ctx.fillRect(x - 1, y + height, width + 2, 1);
    ctx.fillRect(x + width, y - 1, 1, height + 2);
    ctx.fillStyle = '#556677';
    ctx.fillRect(x, y, width, height);
    ctx.fillStyle = '#aabbcc';
    ctx.fillRect(x, y, width, 1);
    ctx.fillRect(x, y, 1, height);
    ctx.fillStyle = '#334455';
    ctx.fillRect(x, y + height - 1, width, 1);
    ctx.fillRect(x + width - 1, y, 1, height);

    const borderW = 3;
    const innerX = x + borderW;
    const innerY = y + borderW;
    const innerW = width - borderW * 2;
    const innerH = height - borderW * 2;

    ctx.fillStyle = '#0a0a18';
    ctx.fillRect(innerX, innerY, innerW, innerH);

    // 16 segments with 4-band internal shading
    const segments = 16;
    const segW = innerW / segments;
    const fillSegments = Math.floor(value * segments);

    for (let i = 0; i < segments; i++) {
      const sx = innerX + i * segW;

      ctx.fillStyle = '#151520';
      ctx.fillRect(sx + 0.5, innerY + 0.5, segW - 1.5, innerH - 1);

      if (i <= fillSegments || locked) {
        // Colors: 1-5 green, 6-10 yellow, 11-16 red
        let r, g, b;
        if (i < 5) {
          r = 34; g = 204; b = 68;
        } else if (i < 10) {
          r = 221; g = 204; b = 0;
        } else {
          r = 221; g = 34; b = 68;
        }

        if (i <= fillSegments) {
          // 4-band shading per segment
          ctx.fillStyle = `rgb(${Math.min(255, r + 60)}, ${Math.min(255, g + 60)}, ${Math.min(255, b + 60)})`;
          ctx.fillRect(sx + 0.5, innerY + 1, segW - 1.5, Math.floor(innerH * 0.25));
          ctx.fillStyle = `rgb(${Math.min(255, r + 20)}, ${Math.min(255, g + 20)}, ${Math.min(255, b + 20)})`;
          ctx.fillRect(sx + 0.5, innerY + Math.floor(innerH * 0.25), segW - 1.5, Math.floor(innerH * 0.25));
          ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
          ctx.fillRect(sx + 0.5, innerY + Math.floor(innerH * 0.5), segW - 1.5, Math.floor(innerH * 0.25));
          ctx.fillStyle = `rgb(${Math.floor(r * 0.5)}, ${Math.floor(g * 0.5)}, ${Math.floor(b * 0.5)})`;
          ctx.fillRect(sx + 0.5, innerY + Math.floor(innerH * 0.75), segW - 1.5, Math.ceil(innerH * 0.25) - 1);
        }
      }
    }

    // White triangular indicator with black outline
    const indicatorX = innerX + innerW * Math.min(1, Math.max(0, value));
    if (!locked) {
      ctx.fillStyle = '#000000';
      ctx.fillRect(indicatorX - 4, y - 6, 9, 3);
      ctx.fillRect(indicatorX - 3, y - 3, 7, 2);
      ctx.fillRect(indicatorX - 2, y - 1, 5, 2);
      ctx.fillRect(indicatorX - 1, y + 1, 3, 2);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(indicatorX - 3, y - 5, 7, 2);
      ctx.fillRect(indicatorX - 2, y - 3, 5, 2);
      ctx.fillRect(indicatorX - 1, y - 1, 3, 2);
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.fillRect(indicatorX, y, 1, height);
    } else {
      // Locked: gold indicator + lock icon
      ctx.fillStyle = 'rgba(255, 204, 0, 0.25)';
      ctx.fillRect(indicatorX - 6, y - 2, 13, height + 4);
      ctx.fillStyle = '#ffcc00';
      ctx.fillRect(indicatorX - 2, y - 4, 5, height + 8);
      ctx.fillStyle = '#ffee44';
      ctx.fillRect(indicatorX - 1, y - 3, 3, height + 6);
      ctx.fillStyle = '#ffcc00';
      ctx.fillRect(indicatorX - 3, y - 12, 7, 6);
      ctx.fillStyle = '#ffee44';
      ctx.fillRect(indicatorX - 2, y - 14, 5, 3);
      ctx.fillStyle = '#0a0a18';
      ctx.fillRect(indicatorX - 1, y - 10, 3, 2);
    }

    ctx.restore();
  }

  // ===========================================================
  // ---- Direction Arrow (metallic frame, 3 labeled zones) ----
  // ===========================================================

  function drawDirectionArrow(ctx, x, y, width, value, locked) {
    ctx.save();
    ctx.imageSmoothingEnabled = false;

    const height = 28;
    const borderW = 3;

    // Metallic frame
    ctx.fillStyle = '#2a3344';
    ctx.fillRect(x - 2, y - 2, width + 4, height + 4);
    ctx.fillStyle = '#8899aa';
    ctx.fillRect(x - 1, y - 1, width + 2, 1);
    ctx.fillRect(x - 1, y - 1, 1, height + 2);
    ctx.fillStyle = '#1a2233';
    ctx.fillRect(x - 1, y + height, width + 2, 1);
    ctx.fillRect(x + width, y - 1, 1, height + 2);
    ctx.fillStyle = '#556677';
    ctx.fillRect(x, y, width, height);
    ctx.fillStyle = '#aabbcc';
    ctx.fillRect(x, y, width, 1);
    ctx.fillRect(x, y, 1, height);
    ctx.fillStyle = '#334455';
    ctx.fillRect(x, y + height - 1, width, 1);
    ctx.fillRect(x + width - 1, y, 1, height);

    const innerX = x + borderW;
    const innerY = y + borderW;
    const innerW = width - borderW * 2;
    const innerH = height - borderW * 2;

    ctx.fillStyle = '#0a0a18';
    ctx.fillRect(innerX, innerY, innerW, innerH);

    // Three labeled zones (LEFT | CENTER | RIGHT)
    const zoneW = innerW / 5;
    const zoneColors = [
      'rgba(40, 50, 120, 0.45)',
      'rgba(40, 70, 100, 0.35)',
      'rgba(40, 100, 60, 0.45)',
      'rgba(40, 70, 100, 0.35)',
      'rgba(40, 50, 120, 0.45)',
    ];

    for (let i = 0; i < 5; i++) {
      ctx.fillStyle = zoneColors[i];
      ctx.fillRect(innerX + i * zoneW, innerY, zoneW, innerH);
    }

    // Zone divider lines
    ctx.fillStyle = '#334455';
    for (let i = 1; i < 5; i++) {
      ctx.fillRect(innerX + i * zoneW, innerY, 1, innerH);
    }

    // Center marker
    ctx.fillStyle = '#556677';
    ctx.fillRect(innerX + innerW / 2 - 1, innerY, 2, innerH);

    // Zone labels
    drawPixelText(ctx, 'L', innerX + zoneW * 0.5, y + height + 2, 1, '#7788aa', 'center');
    drawPixelText(ctx, 'C', innerX + zoneW * 2.5, y + height + 2, 1, '#7788aa', 'center');
    drawPixelText(ctx, 'R', innerX + zoneW * 4.5, y + height + 2, 1, '#7788aa', 'center');

    // Moving downward-pointing chevron indicator
    const arrowX = innerX + innerW * Math.min(1, Math.max(0, value));

    if (!locked) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.fillRect(arrowX - 6, innerY, 12, innerH);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(arrowX - 1, y - 3, 3, height + 6);
      // Downward chevron
      ctx.fillStyle = '#000000';
      ctx.fillRect(arrowX - 5, y + height + 2, 11, 2);
      ctx.fillRect(arrowX - 4, y + height + 4, 9, 2);
      ctx.fillRect(arrowX - 3, y + height + 6, 7, 2);
      ctx.fillRect(arrowX - 2, y + height + 8, 5, 2);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(arrowX - 4, y + height + 1, 9, 2);
      ctx.fillRect(arrowX - 3, y + height + 3, 7, 2);
      ctx.fillRect(arrowX - 2, y + height + 5, 5, 2);
      ctx.fillRect(arrowX - 1, y + height + 7, 3, 2);
    } else {
      // Locked: active zone brighter
      let zoneIdx = Math.floor(value * 5);
      if (zoneIdx >= 5) zoneIdx = 4;
      const zoneX = innerX + zoneIdx * zoneW;
      ctx.fillStyle = 'rgba(255, 204, 0, 0.35)';
      ctx.fillRect(zoneX, innerY, zoneW, innerH);
      for (let i = 0; i < 5; i++) {
        if (i !== zoneIdx) {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
          ctx.fillRect(innerX + i * zoneW, innerY, zoneW, innerH);
        }
      }

      ctx.fillStyle = '#ffcc00';
      ctx.fillRect(arrowX - 2, y - 4, 5, height + 8);
      ctx.fillStyle = '#ffee44';
      ctx.fillRect(arrowX - 1, y - 3, 3, height + 6);

      // Direction name text
      let dirText;
      if (value < 0.2) dirText = 'LEFT';
      else if (value < 0.4) dirText = 'MID-L';
      else if (value < 0.6) dirText = 'CENTER';
      else if (value < 0.8) dirText = 'MID-R';
      else dirText = 'RIGHT';

      drawPixelText(ctx, dirText, x + width / 2, y - 18, 2, '#ffcc00', 'center');
    }

    ctx.restore();
  }

  // ===========================================================
  // ---- Timer (HUD frame, MM:SS, red flash under 3s) ----
  // ===========================================================

  function drawTimer(ctx, x, y, seconds) {
    ctx.save();
    ctx.imageSmoothingEnabled = false;

    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const timeStr = String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0');

    const boxW = 78;
    const boxH = 30;
    drawUIFrame(ctx, x - boxW / 2, y, boxW, boxH, 'hud');

    // Time text color
    let textColor = '#ffffff';
    if (seconds <= 10) textColor = '#ff4444';
    else if (seconds <= 30) textColor = '#ffcc44';

    drawPixelText(ctx, timeStr, x, y + 7, 2, textColor, 'center');

    // Red flash under 3 seconds (alternate bright/dim)
    if (seconds <= 3) {
      const flash = Math.sin(Date.now() * 0.015) > 0;
      if (flash) {
        ctx.fillStyle = 'rgba(255, 0, 0, 0.25)';
        ctx.fillRect(x - boxW / 2, y, boxW, boxH);
      }
    }

    // Tick bar
    if (seconds > 0) {
      const barW = boxW - 14;
      const barH = 3;
      const barX = x - barW / 2;
      const barY = y + boxH - 8;
      ctx.fillStyle = '#112222';
      ctx.fillRect(barX, barY, barW, barH);
      const frac = Math.min(1, seconds / 60);
      const barColor = seconds <= 10 ? '#ff3333' : '#44ccaa';
      ctx.fillStyle = barColor;
      ctx.fillRect(barX, barY, barW * frac, barH);
      ctx.fillStyle = seconds <= 10 ? '#ff6666' : '#66eebb';
      ctx.fillRect(barX, barY, barW * frac, 1);
    }

    ctx.restore();
  }

  // ===========================================================
  // ---- Public API ----
  // ===========================================================

  return {
    drawCatCharacter,
    drawMouseCharacter,
    drawGoalkeeper,
    drawBall,
    drawGoal,
    drawStadium,
    drawCrowd,
    drawPixelText,
    drawUIFrame,
    drawFlag,
    drawCoin,
    drawPowerMeter,
    drawDirectionArrow,
    drawTimer,

    CAT_UNIFORM,
    MOUSE_UNIFORM,
    CAT_GK,
    MOUSE_GK,
    PX,
  };

})();

// Export for module systems (Node/bundler) or keep as global
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Sprites;
}
