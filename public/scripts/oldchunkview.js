//requires log
//requires nbt
//requires jquery
//requires util
//requires blockinfo

var ChunkSizeY = 128;
var ChunkSizeZ = 16;
var ChunkSizeX = 16;
var ymin;

//var minx = -4;
//var minz = -4;
//var maxx = 4;
//var maxz = 4;
//var ymin = 5;

function ChunkView(chunk, ymin, showStuff, rotcent,
                   sminx, sminz, smaxx, smaxz) {
  this.ymin = ymin;
  this.blocks = chunk.blocks;
  this.pos = chunk.location;
  this.showStuff = showStuff;
  this.rotcent = rotcent;
  this.sminx = sminx;
  this.sminz = sminz;
  this.smaxx = smaxx;
  this.smaxz = smaxz;
  this.cubeCount =0;

  var filled = [];

  this.b36 = function(n) {
    var r = "";
    
    if (n == 0) {
      r = '0';
    } else {
      if (n < 0) {
        r = '-' + baseConverter(Math.abs(n), 10, 36);
      } else {
        r = baseConverter(n, 10, 36);
      }
    }
    r = r.toLowerCase();
    return r;
  }

  this.transNeighbors = function(x, y, z) {
    for (i = x - 1; i < x + 2 & i < ChunkSizeX; i++) {
      for (j = y - 1; j < y + 2; j++) {
        for (k = z - 1; k < z + 2 & k < ChunkSizeZ; k++) {
	        if (!(i == x && j == y && k == z)) {
	          var index = j + (k * ChunkSizeY + (i * ChunkSizeY * ChunkSizeZ));
	          var blockID = this.blocks[index];
	          if (blockID === 0)             
	            return true;
	        }
        }
      }
    }
    return false;
  }

  this.extractChunk = function() {
    this.vertices = [];
    this.colors = [];
    this.indices = [];
    this.textcoords = [];
    this.filled = [];

    for (x = 0; x < ChunkSizeX; x++) {
      for (z = 0; z < ChunkSizeZ; z++) {
        for (y = this.ymin; y <= 127; y++) {
	        var blockID = this.blocks[y + (z * ChunkSizeY + (x * ChunkSizeY * ChunkSizeZ))];
                if (blockID == undefined) {
                  blockID = 0;
                }
	        var blockType = blockInfo['_-1'];
	        blockID = '_' + blockID.toString();
	         
	        if (blockInfo[blockID]) {
	          blockType = blockInfo[blockID];
	        }
	        else {
	          blockType = blockInfo['_-1'];
	          log('unknown block type ' + blockID);
	        }
	        var show = false;
	
	        //if ((y>64) & blockType.id ===1) 
	        //  show = true;
                
                
                if (y<60 && this.showStuff == 'diamondsmoss') {
                  show = ( blockType.id == 48 ||
                           blockType.id == 56 ||
                           blockType.id == 4);      
                } else {                  
	          if (blockType.id !== 0) show = this.transNeighbors(x, y, z);
                }
	        
	        if (show) {
	          this.addBlock([x,y,z]);
	        }
        } // y
      } // z
    } // x 
    this.renderPoints();
  }

  this.addBlock = function(position) {
    var verts = [
      position[0],
      position[1],
      position[2]
    ];
    
    this.filled.push(verts);
  }

  this.calcPoint = function(pos) {
    var verts = [];
    
    if (this.rotcent) {
      var xmod = 15 * ChunkSizeX;
      var zmod = 15 * ChunkSizeZ;
    } else {
      // var xmod = (minx + (maxx - minx) / 2.0) * ChunkSizeX;
      //var zmod = (minz + (maxz - minz) / 2.0) * ChunkSizeZ;
      var xmod = (this.sminx + (this.smaxx - this.sminx) / 2.0) * ChunkSizeX;
      var zmod = (this.sminz + (this.smaxz - this.sminz) / 2.0) * ChunkSizeZ;
    }

    verts.push(((-1 * xmod) + pos[0] + (this.pos.x) * ChunkSizeX * 1.00000) / 40.00);
    verts.push(((pos[1] + 1) * 1.0) / 40.0);
    verts.push(((-1 * zmod) + pos[2] + (this.pos.z) * ChunkSizeZ * 1.00000) / 40.00);
    return verts;
  }

  this.renderPoints = function() {
    for (var i=0; i<this.filled.length; i++) {
      var verts = this.filled[i];
      this.addTexturedBlock(verts);
      //this.addPoint(verts);
    }
    flushLog();
  }

  this.getBlockType = function(x, y, z) {
    var blockType = blockInfo['_-1'];
    var id = this.blocks[y + (z * ChunkSizeY + (x * ChunkSizeY * ChunkSizeZ))];
    var blockID = '_-1';
    if (id) blockID = '_' + id.toString();
    if (blockInfo[blockID]) {
      blockType = blockInfo[blockID];
    }
    return blockType;
  }

  this.getBlockInfo = function(p) {
    var blockType = blockInfo['_-1'];
    var id = this.blocks[p[1] + (p[2] * ChunkSizeY + (p[0] * ChunkSizeY * ChunkSizeZ))];
    var blockID = '_-1';
    if (id) blockID = '_' + id.toString();
    if (blockInfo[blockID]) {
      return blockInfo[blockID]
    } else {
      return blockInfo['_-1'];
    }
  }


  this.getColor = function(pos) {
    var t = this.getBlockType(pos[0], pos[1], pos[2]);
    return t.rgba;
  }

  //need to draw quads
  //for exposed faces  
  //maybe just draw all faces 
  //instead of adding a single point
  //I need to add 8 points
  
var s = 0;

  this.hasNeighbor = function(p, offset0, offset1, offset2) {
    var n = [p[0] + offset0, p[1]+offset1, p[2]+offset2];
    s++; 
    if (s % 20 == 0) wr('calling getBlockType for (' + n[0] + ',' + n[1] + ',' + n[2] + ') offset (' + offset0 + ',' + offset1 + ',' + offset2 + ')');

    var info = this.getBlockType(n[0], n[1], n[2]);
    //return false;
    if (s % 20 == 0) wr('info.id is ' + info.id + ' hasneighbor is ' + (info.id > 0 ));
    return (info.id > 0);
  }

  this.addTexturedBlock = function(p) {
    //var a = this.calcPoint(p);
    var a = p;
    var blockInfo = this.getBlockInfo(p);    
    
    //front face
    this.addCubePoint(a, -1.0, -1.0, 1.0);
    this.addCubePoint(a, 1.0, -1.0, 1.0);
    this.addCubePoint(a, 1.0, 1.0, 1.0);
    this.addCubePoint(a, -1.0, 1.0, 1.0); 

    //back face
    this.addCubePoint(a, -1.0, -1.0, -1.0);
    this.addCubePoint(a, -1.0, 1.0, -1.0);
    this.addCubePoint(a, 1.0, 1.0, -1.0);
    this.addCubePoint(a, 1.0, -1.0, -1.0);

    //top face
    this.addCubePoint(a, -1.0, 1.0, -1.0);
    this.addCubePoint(a, -1.0, 1.0, 1.0);
    this.addCubePoint(a, 1.0, 1.0, 1.0);
    this.addCubePoint(a, 1.0, 1.0, -1.0); 

    //bottom face
    this.addCubePoint(a, -1.0, -1.0, -1.0);
    this.addCubePoint(a, 1.0, -1.0, -1.0);
    this.addCubePoint(a, 1.0, -1.0, 1.0);
    this.addCubePoint(a, -1.0, -1.0, 1.0); 
 
    //right face
    this.addCubePoint(a, 1.0, -1.0, -1.0);
    this.addCubePoint(a, 1.0, 1.0, -1.0);
    this.addCubePoint(a, 1.0, 1.0, 1.0);
    this.addCubePoint(a, 1.0, -1.0, 1.0); 

    //left face
    this.addCubePoint(a, -1.0, -1.0, -1.0);
    this.addCubePoint(a, -1.0, -1.0, 1.0);
    this.addCubePoint(a, -1.0, 1.0, 1.0);
    this.addCubePoint(a, -1.0, 1.0, -1.0); 

    this.addFaces(this.cubeCount * 24, blockInfo, p); //24
    this.cubeCount++;
  }
                             
  this.addCubePoint = function(a, xdelta, ydelta, zdelta) {
    var p2 = [ a[0] + xdelta * 0.5,
               a[1] + ydelta * 0.5,
               a[2] + zdelta * 0.5 ];
    
    var p3 = this.calcPoint(p2);
     
    //var p3 = [ p2[0] + xdelta * 0.05,
    //           p2[1] + ydelta * 0.05,
    //           p2[2] + zdelta * 0.05 ];
    //var p3 = this.calcPoint(p2);
    this.vertices.push(p3[0]);
    this.vertices.push(p3[1]);
    this.vertices.push(p3[2]);
  }

  this.typeToCoords = function(type) {
    if (type.t) {
      var x = type.t[0];
      var y = type.t[1];
      return [ x/16.0, y/16.0,
               (x+1.0)/16.0, y/16.0,
               (x+1.0)/16.0, (y+1.0)/16.0,
               x/16.0, (y+1.0)/16.0 ]; 
    } else {
      return [ 0.0, 0.0,
               0.0, 0.0,
               0.0, 0.0,
               0.0, 0.0];

    }
  }

  this.addFaces = function(i, blockInfo, p) {
    var coords = this.typeToCoords(blockInfo)
    
    var show = {};
    show.front = !(this.hasNeighbor(p, 0,0,1) );
    show.back =  !(this.hasNeighbor(p, 0,0,-1) );
    show.top =   !(this.hasNeighbor(p, 0,1,0) );
    show.bottom = !(this.hasNeighbor(p, 0,-1,0) );
    show.left = !(this.hasNeighbor(p, -1,0,0) );
    show.right = !(this.hasNeighbor(p, 1,0,0) );

    var totfaces = 0;
    if (show.front) totfaces++;
    if (show.back) totfaces++;
    if (show.top) totfaces++;
    if (show.bottom) totfaces++;
    if (show.left) totfaces++;
    if (show.right) totfaces++;
    wr('showing total ' + totfaces + ' faces');

    if (show.front)
      this.indices.push.apply(this.indices,[i+0, i+1, i+2,i+0,i+2,i+3]);    // Front face
    if (show.back)
      this.indices.push.apply(this.indices,[i+4,i+5,i+6, i+4,i+6,i+7]);    // Back face
    if (show.top)
      this.indices.push.apply(this.indices,[i+8, i+9, i+10,i+8,i+10,i+11]); //,  // Top face
    if (show.bottom)
      this.indices.push.apply(this.indices,[i+12,i+13,i+14,i+12,i+14,i+15]); // Bottom face
    if (show.right)
      this.indices.push.apply(this.indices,[i+16,i+17,i+18,i+16,i+18,i+19]); // Right face
    if (show.left)
      this.indices.push.apply(this.indices,[i+20,i+21,i+22,i+20,i+22,i+23]);  //y/ Left face
    /* 
    this.indices.push.apply(this.indices,[
        i+0, i+1, i+2,      i+0, i+2, i+3,    // Front face
        i+4, i+5, i+6,      i+4, i+6, i+7,    // Back face
        i+8, i+9, i+10,     i+8, i+10, i+11, //,  // Top face
        i+12, i+13, i+14,   i+12, i+14, i+15, // Bottom face
        i+16, i+17, i+18,   i+16, i+18, i+19, // Right face
        i+20, i+21, i+22,   i+20, i+22, i+23  //y/ Left face
    ]);
    */

    //if (show.front) 
     this.textcoords.push.apply(this.textcoords, coords);
    //if (show.back) 
      this.textcoords.push.apply(this.textcoords, coords);
    //if (show.top) 
      this.textcoords.push.apply(this.textcoords, coords);
    //if (show.bottom) 
       this.textcoords.push.apply(this.textcoords, coords);
    //if (show.right) 
      this.textcoords.push.apply(this.textcoords, coords);
    //if (show.left) 
      this.textcoords.push.apply(this.textcoords, coords);
    //this.textcoords = this.textcoords.concat(coords);
    //this.textcoords = this.textcoords.concat(coords);
    //this.textcoords = this.textcoords.concat(coords);
    //this.textcoords = this.textcoords.concat(coords);
    //this.textcoords = this.textcoords.concat(coords);
    //this.textcoords = this.textcoords.concat(coords);
    
/*
    this.textcoords = this.textcoords.concat([
          // Front face
          0.0, 0.0,
          1.0, 0.0,
          1.0, 1.0,
          0.0, 1.0,
 
          // Back face
          1.0, 0.0,

          1.0, 1.0,
          0.0, 1.0,
          0.0, 0.0,
 
          / Top face
          0.0, 1.0,
          0.0, 0.0,
          1.0, 0.0,
          1.0, 1.0 //,
 
          // Bottom face
        //  1.0, 1.0,
        //  0.0, 1.0,
        //  0.0, 0.0,
        //  1.0, 0.0,
 
          // Right face
        //  1.0, 0.0,
        //  1.0, 1.0,
        //  0.0, 1.0,
        //  0.0, 0.0,
 
          // Left face
         // 0.0, 0.0,
         // 1.0, 0.0,
         // 1.0, 1.0,
         // 0.0, 1.0,
        ]);
*/
  }
 

  this.addPoint = function(p) {
    var a = this.calcPoint(p);
    var c1 = this.getColor(p);
    this.vertices.push(a[0]);
    this.vertices.push(a[1]);
    this.vertices.push(a[2]);

    this.colors.push(c1[0]);
    this.colors.push(c1[1]);
    this.colors.push(c1[2]);
    this.colors.push(c1[3]);
  }

  convertColors();
}


