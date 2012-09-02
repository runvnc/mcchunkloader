if window?
  exports = window.exports
  require = window.require

dataview = require 'dataview'

tags = 
  '_0' : 'TAG_End'
  '_1' : 'TAG_Byte'
  '_2' : 'TAG_Short'
  '_3' : 'TAG_Int'
  '_4' : 'TAG_Long'
  '_5' : 'TAG_Float'
  '_6' : 'TAG_Double'
  '_7' : 'TAG_Byte_Array'
  '_8' : 'TAG_String'
  '_9' : 'TAG_List'
  '_10' : 'TAG_Compound'   

class TAG
  constructor: (@reader) =>
  readName: =>
    tagName = new TAG_String(@reader)
    @name = tagName.read()
    @name

class TAG_End extends TAG
  readName: => 'END'
  read: => 1 

class TAG_Unknown extends TAG
  read: => 'unknown tag type'
  
class TAG_Int extends TAG 
  read: => @reader.getInt32()

class TAG_Float extends TAG
  read: => @reader.getFloat32()

class TAG_Double extends TAG
  read: => @reader.getFloat64()

class TAG_Byte extends TAG
  read: @reader.getInt8()

class TAG_Short extends TAG
  read: @reader.getInt16()

class TAG_String extends TAG
  read: =>
    if not @reader? then return 0
    length = @reader.getInt16()
    @reader.getString length

class TAG_Long extends TAG
  read: => @reader.getFloat64()

class TAG_List extends TAG
  read: =>
    type = @reader.getInt8()
    length = @reader.getInt32()
    var arr = []
    for i in [0..length-1]
      tag = @reader.read type, '_'+i.toString()
      arr.push tag    
    arr

class TAG_Byte_Array extends TAG
  read: =>
    type = 1
    length = @reader.getInt32()
    @reader.getUint8 length

class TAG_Compound extends TAG
  read: =>
    obj ={}     
    do 
      tag = @reader.read()
      if ((tag !== null) && (typeof(tag) !== 'undefined') && !tag['END']) {
        for (var k in tag) {
          obj[k] = tag[k];
        }
      }
      i++;
    } while ((tag !== null) && (typeof(tag) !== 'undefined') && !tag['END'] && i<16);
    return obj;    
  };

  this.decode = function() {
    
  };
}

TAG_String.prototype.readName = readName;
TAG_Byte.prototype.readName = readName;
TAG_Short.prototype.readName = readName;
TAG_Int.prototype.readName = readName;
TAG_Long.prototype.readName = readName;
TAG_Compound.prototype.readName = readName;
TAG_List.prototype.readName = readName;
TAG_Float.prototype.readName = readName;
TAG_Double.prototype.readName = readName;
TAG_Byte_Array.prototype.readName = readName;

function NBTReader(data) {
  this.position = 0;
  this.data = data;
  
  this.read = function(typespec) {
    var type = null;
    if (!typespec) {
      type = this.readBytes(1);
      if (type.length === 0) return null;
    } else {
      type = typespec;
    }
  
    var typeStr = '_'+type.toString();
    var name = tags[typeStr];

    var tag = null;
  
    switch(name) {
      case 'TAG_End':
        tag = new TAG_End(this);        
        break;  
      case 'TAG_Byte':
        tag = new TAG_Byte(this);
        break;
      case 'TAG_Short':
        tag = new TAG_Short(this);
        break;
      case 'TAG_Int':
        tag = new TAG_Int(this);
        break;
      case 'TAG_Long':
        tag = new TAG_Long(this);
        break;
      case 'TAG_Float':
        tag = new TAG_Float(this);
        break;
      case 'TAG_Double':
        tag = new TAG_Double(this);
        break;
      case 'TAG_Byte_Array':
        tag = new TAG_Byte_Array(this);
        break;
      case 'TAG_String':
        tag = new TAG_String(this);
        break;
      case 'TAG_List':
        tag = new TAG_List(this);
        break;
      case 'TAG_Compound':
        tag = new TAG_Compound(this);
        break;
      default:  
        tag = new TAG_Unknown(this);
        break;
    }
    var ret = new Object();
    var name2 = '';
    if (!typespec) {
      name2 = tag.readName();
      if (name==='TAG_Compound' && name2==='')
        name2 = 'root';
      ret[name2] = tag.read();
    } else {
      ret = tag.read();
    }
    return ret;
  };

/*
  var cnt1 = 0;
  this.readBytes = function(count) {
    try {
      if (!this.data) {
        console.log('thisdata empty');
        return [];
      }
      if (this.data.length == 0) {
        console.log('thisdata empty');
        return [];
      }
      var ar;
      var start = this.position;
      if (start+count>this.data.length) {
        ar = this.data.slice(start);
      } else {
        ar = this.data.slice(start,start+count-1);
      }
      this.position = start + count;
      if (this.position>this.data.length) {
        this.position = this.data.length;
      }
      return ar;
    } catch (e) {
      alert(e);
      return [];
    }
  };
 what the fuck is the problem with using data.slice??
  */

  this.readBytes = function(count) {
    if (count>100) {
      var r = this.data.slice(this.position, this.position+count-1);
      this.position += count;
      return r;
    }

    var ret = new Array();
    var start = this.position;
    for (var i=start; i<this.data.length &
         i<start+count; i++) {
          ret.push(this.data[i]);
          this.i++;
          this.position++;
    }      
    return ret;  
  };
  

}




