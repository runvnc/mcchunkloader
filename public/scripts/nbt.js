(function() {
  var NBTReader, TAG, TAG_Byte, TAG_Byte_Array, TAG_Compound, TAG_Double, TAG_End, TAG_Float, TAG_Int, TAG_Int_Array, TAG_List, TAG_Long, TAG_Short, TAG_String, TAG_Unknown, dataview, exports, require, tags,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  if (typeof window !== "undefined" && window !== null) {
    exports = window.exports;
    require = window.require;
  }

  dataview = require('dataview');

  tags = {
    '_0': 'TAG_End',
    '_1': 'TAG_Byte',
    '_2': 'TAG_Short',
    '_3': 'TAG_Int',
    '_4': 'TAG_Long',
    '_5': 'TAG_Float',
    '_6': 'TAG_Double',
    '_7': 'TAG_Byte_Array',
    '_8': 'TAG_String',
    '_9': 'TAG_List',
    '_10': 'TAG_Compound',
    '_11': 'TAG_Int_Array'
  };

  TAG = (function() {

    function TAG(reader) {
      this.reader = reader;
      this.readName = __bind(this.readName, this);
    }

    TAG.prototype.readName = function() {
      var tagName;
      tagName = new TAG_String(this.reader);
      this.name = tagName.read();
      return this.name;
    };

    return TAG;

  })();

  TAG_End = (function(_super) {

    __extends(TAG_End, _super);

    function TAG_End() {
      this.read = __bind(this.read, this);
      this.readName = __bind(this.readName, this);
      TAG_End.__super__.constructor.apply(this, arguments);
    }

    TAG_End.prototype.readName = function() {
      return 'END';
    };

    TAG_End.prototype.read = function() {
      return '=END=';
    };

    return TAG_End;

  })(TAG);

  TAG_Unknown = (function(_super) {

    __extends(TAG_Unknown, _super);

    function TAG_Unknown() {
      this.read = __bind(this.read, this);
      TAG_Unknown.__super__.constructor.apply(this, arguments);
    }

    TAG_Unknown.prototype.read = function() {
      return 'unknown tag type';
    };

    return TAG_Unknown;

  })(TAG);

  TAG_Int = (function(_super) {

    __extends(TAG_Int, _super);

    function TAG_Int() {
      this.read = __bind(this.read, this);
      TAG_Int.__super__.constructor.apply(this, arguments);
    }

    TAG_Int.prototype.read = function() {
      return this.reader.getInt32();
    };

    return TAG_Int;

  })(TAG);

  TAG_Float = (function(_super) {

    __extends(TAG_Float, _super);

    function TAG_Float() {
      this.read = __bind(this.read, this);
      TAG_Float.__super__.constructor.apply(this, arguments);
    }

    TAG_Float.prototype.read = function() {
      return this.reader.getFloat32();
    };

    return TAG_Float;

  })(TAG);

  TAG_Double = (function(_super) {

    __extends(TAG_Double, _super);

    function TAG_Double() {
      this.read = __bind(this.read, this);
      TAG_Double.__super__.constructor.apply(this, arguments);
    }

    TAG_Double.prototype.read = function() {
      return this.reader.getFloat64();
    };

    return TAG_Double;

  })(TAG);

  TAG_Byte = (function(_super) {

    __extends(TAG_Byte, _super);

    function TAG_Byte() {
      TAG_Byte.__super__.constructor.apply(this, arguments);
    }

    TAG_Byte.prototype.read = TAG_Byte.reader.getInt8();

    return TAG_Byte;

  })(TAG);

  TAG_Short = (function(_super) {

    __extends(TAG_Short, _super);

    function TAG_Short() {
      TAG_Short.__super__.constructor.apply(this, arguments);
    }

    TAG_Short.prototype.read = TAG_Short.reader.getInt16();

    return TAG_Short;

  })(TAG);

  TAG_String = (function(_super) {

    __extends(TAG_String, _super);

    function TAG_String() {
      this.read = __bind(this.read, this);
      TAG_String.__super__.constructor.apply(this, arguments);
    }

    TAG_String.prototype.read = function() {
      var length;
      if (!(this.reader != null)) return 0;
      length = this.reader.getInt16();
      return this.reader.getString(length);
    };

    return TAG_String;

  })(TAG);

  TAG_Long = (function(_super) {

    __extends(TAG_Long, _super);

    function TAG_Long() {
      this.read = __bind(this.read, this);
      TAG_Long.__super__.constructor.apply(this, arguments);
    }

    TAG_Long.prototype.read = function() {
      return this.reader.getFloat64();
    };

    return TAG_Long;

  })(TAG);

  TAG_List = (function(_super) {

    __extends(TAG_List, _super);

    function TAG_List() {
      this.read = __bind(this.read, this);
      TAG_List.__super__.constructor.apply(this, arguments);
    }

    TAG_List.prototype.read = function() {
      var arr, i, length, tag, type, _ref;
      type = this.reader.getInt8();
      length = this.reader.getInt32();
      arr = [];
      for (i = 0, _ref = length - 1; 0 <= _ref ? i <= _ref : i >= _ref; 0 <= _ref ? i++ : i--) {
        tag = this.reader.read(type, '_' + i.toString());
        arr.push(tag);
      }
      return arr;
    };

    return TAG_List;

  })(TAG);

  TAG_Byte_Array = (function(_super) {

    __extends(TAG_Byte_Array, _super);

    function TAG_Byte_Array() {
      this.read = __bind(this.read, this);
      TAG_Byte_Array.__super__.constructor.apply(this, arguments);
    }

    TAG_Byte_Array.prototype.read = function() {
      var length, type;
      type = 1;
      length = this.reader.getInt32();
      return this.reader.getInt8(length);
    };

    return TAG_Byte_Array;

  })(TAG);

  TAG_Int_Array = (function(_super) {

    __extends(TAG_Int_Array, _super);

    function TAG_Int_Array() {
      this.read = __bind(this.read, this);
      TAG_Int_Array.__super__.constructor.apply(this, arguments);
    }

    TAG_Int_Array.prototype.read = function() {
      var length;
      length = this.reader.getInt32();
      return this.reader.getInt32(length);
    };

    return TAG_Int_Array;

  })(TAG);

  TAG_Compound = (function(_super) {

    __extends(TAG_Compound, _super);

    function TAG_Compound() {
      this.read = __bind(this.read, this);
      TAG_Compound.__super__.constructor.apply(this, arguments);
    }

    TAG_Compound.prototype.read = function() {
      var i, key, obj, tag, val;
      obj = {};
      i = 0;
      tag = 'dummy';
      while ((tag != null) && tag !== '=END=' && i < 16) {
        tag = this.reader.read();
        if ((tag != null) && tag !== '=END=') {
          for (key in tag) {
            val = tag[key];
            obj[key] = val;
          }
        }
        i++;
      }
      return obj;
    };

    return TAG_Compound;

  })(TAG);

  NBTReader = (function(_super) {

    __extends(NBTReader, _super);

    function NBTReader() {
      this.read = __bind(this.read, this);
      NBTReader.__super__.constructor.apply(this, arguments);
    }

    NBTReader.prototype.read = function(typespec) {
      var name, name2, ret, tag, type, typeStr;
      type = null;
      if (!(typespec != null)) {
        type = this.getUint8();
        if (!(type != null)) return null;
      } else {
        type = typespec;
      }
      typeStr = '_' + type.toString();
      name = tags[typeStr];
      switch (name) {
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
        case 'TAG_Int_Array':
          tag = new TAG_Int_Array(this);
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
      }
      ret = {};
      name2 = '';
      if (!(typespec != null)) {
        name2 = tag.readName();
        if (name === 'TAG_Compound' && name2 === '') name2 = 'root';
        ret[name2] = tag.read();
      } else {
        ret = tag.read();
      }
      return ret;
    };

    return NBTReader;

  })(dataview.jDataView);

  exports.NBTReader = NBTReader;

}).call(this);
