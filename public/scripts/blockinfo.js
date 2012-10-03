(function() {
  var block, blockInfo, exports, key, n, require;

  if (typeof window !== "undefined" && window !== null) {
    require = window.require;
    exports = window.exports;
  }

  blockInfo = {
    '_-1': {
      id: -10,
      type: 'fill',
      rgba: [0.0, 0.0, 0.0, 1.0],
      t: [0, 0]
    },
    '_0': {
      id: 0,
      type: 'air',
      rgba: [1.0, 1.0, 1.0, 1.0],
      t: [0, 0]
    },
    '_1': {
      id: 1,
      type: 'stone',
      rgba: [0.4, 0.4, 0.4, 1.0],
      t: [1, 0]
    },
    '_2': {
      id: 2,
      type: 'grass',
      rgba: [0.0, 0.6, 0.0, 1.0],
      t: [8, 2]
    },
    '_2x': {
      id: 2,
      type: 'grassside',
      rgba: [0.0, 0.6, 0.0, 1.0],
      t: [3, 0]
    },
    '_3': {
      id: 3,
      type: 'dirt',
      rgba: [0.2, 0.0, 0.0, 1.0],
      t: [2, 0]
    },
    '_4': {
      id: 4,
      type: 'cobble',
      rgba: [84, 94, 88, 1.0],
      t: [0, 1]
    },
    '_5': {
      id: 5,
      type: 'wood',
      rgba: [0.38, 0.20, 0.20, 1.0],
      t: [4, 0]
    },
    '_8': {
      id: 8,
      type: 'water',
      rgba: [0.0, 0.0, 1.0, 1.0],
      t: [15, 13]
    },
    '_9': {
      id: 9,
      type: 'water2',
      rgba: [0.0, 0.0, 1.0, 1.0],
      t: [15, 13]
    },
    '_12': {
      id: 12,
      type: 'sand',
      rgba: [250, 250, 200, 1.0],
      t: [2, 1]
    },
    '_11': {
      id: 11,
      type: 'lava2',
      rgba: [250, 135, 17, 1.0],
      t: [15, 15]
    },
    '_10': {
      id: 10,
      type: 'lava',
      rgba: [250, 135, 20, 1.0],
      t: [15, 15]
    },
    '_13': {
      id: 13,
      type: 'gravel',
      rgba: [186, 179, 186, 1.0],
      t: [3, 1]
    },
    '_15': {
      id: 15,
      type: 'iron',
      rgba: [226, 192, 170, 1.0],
      t: [1, 2]
    },
    '_16': {
      id: 16,
      type: 'coal',
      rgba: [0.0, 0.0, 0.0, 1.0],
      t: [2, 2]
    },
    '_17': {
      id: 17,
      type: 'log',
      rgba: [0.18, 0.0, 0.0, 1.0],
      t: [4, 1]
    },
    '_18': {
      id: 18,
      type: 'leaves',
      rgba: [0.0, 0.30, 0.0, 1.0],
      t: [4, 3]
    },
    '_20': {
      id: 20,
      type: 'glass',
      rgba: [0.9, 0.9, 0.9, 0.3],
      t: [1, 3]
    },
    '_24': {
      id: 24,
      type: 'sandstone',
      rgba: [0.9, 0.9, 0.9, 0.3],
      t: [0, 13]
    },
    '_35': {
      id: 35,
      type: 'wool',
      rgba: [0.9, 0.9, 0.9, 0.3],
      t: [0, 4]
    },
    '_45': {
      id: 45,
      type: 'brick',
      rgba: [0.5, 0.0, 0.0, 1.0],
      t: [7, 0]
    },
    '_48': {
      id: 48,
      type: 'mossy',
      rgba: [165, 187, 181, 1.0],
      t: [4, 2]
    },
    '_50': {
      id: 50,
      type: 'torch',
      rgba: [0.92, 0.57, 0.13, 1.0],
      t: [0, 5],
      s: 1
    },
    '_52': {
      id: 52,
      type: 'spawner',
      rgba: [209, 240, 139, 1.0],
      t: [1, 4]
    },
    '_53': {
      id: 53,
      type: 'woodstairs',
      rgba: [0.38, 0.20, 0.20, 1.0],
      t: [4, 0]
    },
    '_56': {
      id: 56,
      type: 'diamond',
      rgba: [43, 199, 172, 1.0],
      t: [2, 3]
    },
    '_60': {
      id: 60,
      type: 'farmland',
      rgba: [0, 0, 0, 1.0],
      t: [6, 5]
    },
    '_64': {
      id: 64,
      type: 'woodendoor',
      rgba: [0, 0, 0, 1.0],
      t: [1, 6],
      s: 1
    },
    '_64x': {
      id: 64,
      type: 'woodendoor',
      rgba: [0, 0, 0, 1.0],
      t: [1, 5],
      s: 1
    },
    '_67': {
      id: 67,
      type: 'cobblestairs',
      rgba: [84, 94, 88, 240],
      t: [0, 1]
    },
    '_78': {
      id: 78,
      type: 'snow',
      rgba: [0.98, 0.98, 0.98, 1.0],
      t: [2, 4]
    },
    '_79': {
      id: 79,
      type: 'ice',
      rgba: [41, 169, 255, 1.0],
      t: [3, 4]
    },
    '_80': {
      id: 80,
      type: 'snowb',
      rgba: [0.99, 0.99, 0.99, 1.0],
      t: [4, 4]
    },
    '_85': {
      id: 85,
      type: 'fence',
      rgba: [0.38, 0.20, 0.20, 1.0],
      t: [4, 0]
    },
    '_102': {
      id: 102,
      type: 'glasspane',
      rgba: [0.0, 0.0, 0.0, 1.0],
      t: [1, 3],
      s: 1
    }
  };

  for (key in blockInfo) {
    block = blockInfo[key];
    if (block.rgba[0] > 1 || block.rgba[1] > 1 || block.rgba[2] > 1) {
      for (n = 0; n <= 2; n++) {
        block.rgba[n] = block.rgba[n] / 255.0;
      }
    }
  }

  /*
  to find texture coord:
  
  first of all, what is x and y position of 
  subtexture for that block?
  
  blocks = { 1: stone, rgb, [0,0]
  
  upper left = 
  x / 16,  y/16
  
  lower right = (x+1/16), (y+1/16)
  */

  exports.blockInfo = blockInfo;

}).call(this);
