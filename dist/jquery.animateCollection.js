(function($, window) {

/*!
 * jquery.animateCollection - v0.0.1 - 
 * build: 2014-12-22
 */

var CSSMatrix = (function() { if (typeof CSSMatrix == 'undefined') { 
var module = {};
 (function (module) {

"use strict";

// a CSSMatrix shim
// http://www.w3.org/TR/css3-3d-transforms/#cssmatrix-interface
// http://www.w3.org/TR/css3-2d-transforms/#cssmatrix-interface

/**
 * CSSMatrix Shim
 * @constructor
 */
var CSSMatrix = function(){
	var a = [].slice.call(arguments),
		m = this;
	if (a.length) for (var i = a.length; i--;){
		if (Math.abs(a[i]) < CSSMatrix.SMALL_NUMBER) a[i] = 0;
	}
	m.setIdentity();
	if (a.length == 16){
		m.m11 = m.a = a[0];  m.m12 = m.b = a[1];  m.m13 = a[2];  m.m14 = a[3];
		m.m21 = m.c = a[4];  m.m22 = m.d = a[5];  m.m23 = a[6];  m.m24 = a[7];
		m.m31 = a[8];  m.m32 = a[9];  m.m33 = a[10]; m.m34 = a[11];
		m.m41 = m.e = a[12]; m.m42 = m.f = a[13]; m.m43 = a[14]; m.m44 = a[15];
	} else if (a.length == 6) {
		this.affine = true;
		m.m11 = m.a = a[0]; m.m12 = m.b = a[1]; m.m14 = m.e = a[4];
		m.m21 = m.c = a[2]; m.m22 = m.d = a[3]; m.m24 = m.f = a[5];
	} else if (a.length === 1 && typeof a[0] == 'string') {
		m.setMatrixValue(a[0]);
	} else if (a.length > 0) {
		throw new TypeError('Invalid Matrix Value');
	}
};

// decimal values in WebKitCSSMatrix.prototype.toString are truncated to 6 digits
CSSMatrix.SMALL_NUMBER = 1e-6;

// Transformations

// http://en.wikipedia.org/wiki/Rotation_matrix
CSSMatrix.Rotate = function(rx, ry, rz){
	rx *= Math.PI / 180;
	ry *= Math.PI / 180;
	rz *= Math.PI / 180;
	// minus sin() because of right-handed system
	var cosx = Math.cos(rx), sinx = - Math.sin(rx);
	var cosy = Math.cos(ry), siny = - Math.sin(ry);
	var cosz = Math.cos(rz), sinz = - Math.sin(rz);
	var m = new CSSMatrix();

	m.m11 = m.a = cosy * cosz;
	m.m12 = m.b = - cosy * sinz;
	m.m13 = siny;

	m.m21 = m.c = sinx * siny * cosz + cosx * sinz;
	m.m22 = m.d = cosx * cosz - sinx * siny * sinz;
	m.m23 = - sinx * cosy;

	m.m31 = sinx * sinz - cosx * siny * cosz;
	m.m32 = sinx * cosz + cosx * siny * sinz;
	m.m33 = cosx * cosy;

	return m;
};

CSSMatrix.RotateAxisAngle = function(x, y, z, angle){
	angle *= Math.PI / 360;

	var sinA = Math.sin(angle), cosA = Math.cos(angle), sinA2 = sinA * sinA;
	var length = Math.sqrt(x * x + y * y + z * z);

	if (length === 0){
		// bad vector length, use something reasonable
		x = 0;
		y = 0;
		z = 1;
	} else {
		x /= length;
		y /= length;
		z /= length;
	}

	var x2 = x * x, y2 = y * y, z2 = z * z;

	var m = new CSSMatrix();
	m.m11 = m.a = 1 - 2 * (y2 + z2) * sinA2;
	m.m12 = m.b = 2 * (x * y * sinA2 + z * sinA * cosA);
	m.m13 = 2 * (x * z * sinA2 - y * sinA * cosA);
	m.m21 = m.c = 2 * (y * x * sinA2 - z * sinA * cosA);
	m.m22 = m.d = 1 - 2 * (z2 + x2) * sinA2;
	m.m23 = 2 * (y * z * sinA2 + x * sinA * cosA);
	m.m31 = 2 * (z * x * sinA2 + y * sinA * cosA);
	m.m32 = 2 * (z * y * sinA2 - x * sinA * cosA);
	m.m33 = 1 - 2 * (x2 + y2) * sinA2;
	m.m14 = m.m24 = m.m34 = 0;
	m.m41 = m.e = m.m42 = m.f = m.m43 = 0;
	m.m44 = 1;

	return m;
};

CSSMatrix.ScaleX = function(x){
	var m = new CSSMatrix();
	m.m11 = m.a = x;
	return m;
};

CSSMatrix.ScaleY = function(y){
	var m = new CSSMatrix();
	m.m22 = m.d = y;
	return m;
};

CSSMatrix.ScaleZ = function(z){
	var m = new CSSMatrix();
	m.m33 = z;
	return m;
};

CSSMatrix.Scale = function(x, y, z){
	var m = new CSSMatrix();
	m.m11 = m.a = x;
	m.m22 = m.d = y;
	m.m33 = z;
	return m;
};

CSSMatrix.SkewX = function(angle){
	angle *= Math.PI / 180;
	var m = new CSSMatrix();
	m.m21 = m.c = Math.tan(angle);
	return m;
};

CSSMatrix.SkewY = function(angle){
	angle *= Math.PI / 180;
	var m = new CSSMatrix();
	m.m12 = m.b = Math.tan(angle);
	return m;
};

CSSMatrix.Translate = function(x, y, z){
	var m = new CSSMatrix();
	m.m41 = m.e = x;
	m.m42 = m.f = y;
	m.m43 = z;
	return m;
};

CSSMatrix.multiply = function(m1, m2){

	var m11 = m2.m11 * m1.m11 + m2.m12 * m1.m21 + m2.m13 * m1.m31 + m2.m14 * m1.m41,
		m12 = m2.m11 * m1.m12 + m2.m12 * m1.m22 + m2.m13 * m1.m32 + m2.m14 * m1.m42,
		m13 = m2.m11 * m1.m13 + m2.m12 * m1.m23 + m2.m13 * m1.m33 + m2.m14 * m1.m43,
		m14 = m2.m11 * m1.m14 + m2.m12 * m1.m24 + m2.m13 * m1.m34 + m2.m14 * m1.m44,

		m21 = m2.m21 * m1.m11 + m2.m22 * m1.m21 + m2.m23 * m1.m31 + m2.m24 * m1.m41,
		m22 = m2.m21 * m1.m12 + m2.m22 * m1.m22 + m2.m23 * m1.m32 + m2.m24 * m1.m42,
		m23 = m2.m21 * m1.m13 + m2.m22 * m1.m23 + m2.m23 * m1.m33 + m2.m24 * m1.m43,
		m24 = m2.m21 * m1.m14 + m2.m22 * m1.m24 + m2.m23 * m1.m34 + m2.m24 * m1.m44,

		m31 = m2.m31 * m1.m11 + m2.m32 * m1.m21 + m2.m33 * m1.m31 + m2.m34 * m1.m41,
		m32 = m2.m31 * m1.m12 + m2.m32 * m1.m22 + m2.m33 * m1.m32 + m2.m34 * m1.m42,
		m33 = m2.m31 * m1.m13 + m2.m32 * m1.m23 + m2.m33 * m1.m33 + m2.m34 * m1.m43,
		m34 = m2.m31 * m1.m14 + m2.m32 * m1.m24 + m2.m33 * m1.m34 + m2.m34 * m1.m44,

		m41 = m2.m41 * m1.m11 + m2.m42 * m1.m21 + m2.m43 * m1.m31 + m2.m44 * m1.m41,
		m42 = m2.m41 * m1.m12 + m2.m42 * m1.m22 + m2.m43 * m1.m32 + m2.m44 * m1.m42,
		m43 = m2.m41 * m1.m13 + m2.m42 * m1.m23 + m2.m43 * m1.m33 + m2.m44 * m1.m43,
		m44 = m2.m41 * m1.m14 + m2.m42 * m1.m24 + m2.m43 * m1.m34 + m2.m44 * m1.m44;

	return new CSSMatrix(
		m11, m12, m13, m14,
		m21, m22, m23, m24,
		m31, m32, m33, m34,
		m41, m42, m43, m44
	);
};

// w3c defined methods

/**
 * The setMatrixValue method replaces the existing matrix with one computed
 * from parsing the passed string as though it had been assigned to the
 * transform property in a CSS style rule.
 * @param {String} string The string to parse.
 */
CSSMatrix.prototype.setMatrixValue = function(string){
	string = String(string).trim();
	var m = this;
	m.setIdentity();
	if (string == 'none') return m;
	var type = string.slice(0, string.indexOf('(')), parts, i;
	if (type == 'matrix3d'){
		parts = string.slice(9, -1).split(',');
		for (i = parts.length; i--;) parts[i] = parseFloat(parts[i]);
		m.m11 = m.a = parts[0]; m.m12 = m.b = parts[1]; m.m13 = parts[2];  m.m14 = parts[3];
		m.m21 = m.c = parts[4]; m.m22 = m.d = parts[5]; m.m23 = parts[6];  m.m24 = parts[7];
		m.m31 = parts[8]; m.m32 = parts[9]; m.m33 = parts[10]; m.m34 = parts[11];
		m.m41 = m.e = parts[12]; m.m42 = m.f = parts[13]; m.m43 = parts[14]; m.m44 = parts[15];
	} else if (type == 'matrix'){
		m.affine = true;
		parts = string.slice(7, -1).split(',');
		for (i = parts.length; i--;) parts[i] = parseFloat(parts[i]);
		m.m11 = m.a = parts[0]; m.m12 = m.b = parts[2]; m.m41 = m.e = parts[4];
		m.m21 = m.c = parts[1]; m.m22 = m.d = parts[3]; m.m42 = m.f = parts[5];
	} else {
		throw new TypeError('Invalid Matrix Value');
	}
	return m;
};

/**
 * The multiply method returns a new CSSMatrix which is the result of this
 * matrix multiplied by the passed matrix, with the passed matrix to the right.
 * This matrix is not modified.
 *
 * @param {CSSMatrix} m2
 * @return {CSSMatrix} The result matrix.
 */
CSSMatrix.prototype.multiply = function(m2){
	return CSSMatrix.multiply(this, m2);
};

/**
 * The inverse method returns a new matrix which is the inverse of this matrix.
 * This matrix is not modified.
 *
 * method not implemented yet
 */
CSSMatrix.prototype.inverse = function(){
	throw new Error('the inverse() method is not implemented (yet).');
};

/**
 * The translate method returns a new matrix which is this matrix post
 * multiplied by a translation matrix containing the passed values. If the z
 * component is undefined, a 0 value is used in its place. This matrix is not
 * modified.
 *
 * @param {number} x X component of the translation value.
 * @param {number} y Y component of the translation value.
 * @param {number=} z Z component of the translation value.
 * @return {CSSMatrix} The result matrix
 */
CSSMatrix.prototype.translate = function(x, y, z){
	if (z == null) z = 0;
	return CSSMatrix.multiply(this, CSSMatrix.Translate(x, y, z));
};

/**
 * The scale method returns a new matrix which is this matrix post multiplied by
 * a scale matrix containing the passed values. If the z component is undefined,
 * a 1 value is used in its place. If the y component is undefined, the x
 * component value is used in its place. This matrix is not modified.
 *
 * @param {number} x The X component of the scale value.
 * @param {number=} y The Y component of the scale value.
 * @param {number=} z The Z component of the scale value.
 * @return {CSSMatrix} The result matrix
 */
CSSMatrix.prototype.scale = function(x, y, z){
	if (y == null) y = x;
	if (z == null) z = 1;
	return CSSMatrix.multiply(this, CSSMatrix.Scale(x, y, z));
};

/**
 * The rotate method returns a new matrix which is this matrix post multiplied
 * by each of 3 rotation matrices about the major axes, first X, then Y, then Z.
 * If the y and z components are undefined, the x value is used to rotate the
 * object about the z axis, as though the vector (0,0,x) were passed. All
 * rotation values are in degrees. This matrix is not modified.
 *
 * @param {number} rx The X component of the rotation value, or the Z component if the rotY and rotZ parameters are undefined.
 * @param {number=} ry The (optional) Y component of the rotation value.
 * @param {number=} rz The (optional) Z component of the rotation value.
 * @return {CSSMatrix} The result matrix
 */
CSSMatrix.prototype.rotate = function(rx, ry, rz){
	if (ry == null) ry = rx;
	if (rz == null) rz = rx;
	return CSSMatrix.multiply(this, CSSMatrix.Rotate(rx, ry, rz));
};

/**
 * The rotateAxisAngle method returns a new matrix which is this matrix post
 * multiplied by a rotation matrix with the given axis and angle. The right-hand
 * rule is used to determine the direction of rotation. All rotation values are
 * in degrees. This matrix is not modified.
 *
 * @param {number} x The X component of the axis vector.
 * @param {number=} y The Y component of the axis vector.
 * @param {number=} z The Z component of the axis vector.
 * @param {number} angle The angle of rotation about the axis vector, in degrees.
 * @return {CSSMatrix} The result matrix
 */
CSSMatrix.prototype.rotateAxisAngle = function(x, y, z, angle){
	if (y == null) y = x;
	if (z == null) z = x;
	return CSSMatrix.multiply(this, CSSMatrix.RotateAxisAngle(x, y, z, angle));
};

// Defined in WebKitCSSMatrix, but not in the w3c draft

/**
 * Specifies a skew transformation along the x-axis by the given angle.
 *
 * @param {number} angle The angle amount in degrees to skew.
 * @return {CSSMatrix} The result matrix
 */
CSSMatrix.prototype.skewX = function(angle){
	return CSSMatrix.multiply(this, CSSMatrix.SkewX(angle));
};

/**
 * Specifies a skew transformation along the x-axis by the given angle.
 *
 * @param {number} angle The angle amount in degrees to skew.
 * @return {CSSMatrix} The result matrix
 */
CSSMatrix.prototype.skewY = function(angle){
	return CSSMatrix.multiply(this, CSSMatrix.SkewY(angle));
};

/**
 * Returns a string representation of the matrix.
 * @return {string}
 */
CSSMatrix.prototype.toString = function(){
	var m = this;

	if (this.affine){
		return  'matrix(' + [
			m.a, m.b,
			m.c, m.d,
			m.e, m.f
		].join(', ') + ')';
	}
	// note: the elements here are transposed
	return  'matrix3d(' + [
		m.m11, m.m12, m.m13, m.m14,
		m.m21, m.m22, m.m23, m.m24,
		m.m31, m.m32, m.m33, m.m34,
		m.m41, m.m42, m.m43, m.m44
	].join(', ') + ')';
};


// Additional methods

/**
 * Set the current matrix to the identity form
 *
 * @return {CSSMatrix} this matrix
 */
CSSMatrix.prototype.setIdentity = function(){
	var m = this;
	m.m11 = m.a = 1; m.m12 = m.b = 0; m.m13 = 0; m.m14 = 0;
	m.m21 = m.c = 0; m.m22 = m.d = 1; m.m23 = 0; m.m24 = 0;
	m.m31 = 0; m.m32 = 0; m.m33 = 1; m.m34 = 0;
	m.m41 = m.e = 0; m.m42 = m.f = 0; m.m43 = 0; m.m44 = 1;
	return this;
};

/**
 * Transform a tuple (3d point) with this CSSMatrix
 *
 * @param {Tuple} an object with x, y, z and w properties
 * @return {Tuple} the passed tuple
 */
CSSMatrix.prototype.transform = function(t /* tuple */ ){
	var m = this;

	var x = m.m11 * t.x + m.m12 * t.y + m.m13 * t.z + m.m14 * t.w,
		y = m.m21 * t.x + m.m22 * t.y + m.m23 * t.z + m.m24 * t.w,
		z = m.m31 * t.x + m.m32 * t.y + m.m33 * t.z + m.m34 * t.w,
		w = m.m41 * t.x + m.m42 * t.y + m.m43 * t.z + m.m44 * t.w;

	t.x = x / w;
	t.y = y / w;
	t.z = z / w;

	return t;
};

CSSMatrix.prototype.toFullString = function(){
	var m = this;
	return [
		[m.m11, m.m12, m.m13, m.m14].join(', '),
		[m.m21, m.m22, m.m23, m.m24].join(', '),
		[m.m31, m.m32, m.m33, m.m34].join(', '),
		[m.m41, m.m42, m.m43, m.m44].join(', ')
	].join('\n');
};

module.exports = CSSMatrix;


})(module); 
 return module.exports; }
})();
(function($) {

  // Init collection-prefilter registry
  
  
  /**
   * Animates a collection of elements by making use of custom prefilters 
   */
  function animateCollection( prop, speed, easing, callback ) {
    var
      optall = jQuery.speed( speed, easing, callback ),
      collection = this,
      started = [],
      finished = [],
      collectionPrefilters = $.fn.animateCollection.prefilters ? $.map($.fn.animateCollection.prefilters, function(elem) {
        return elem.call(collection, prop, optall);
      }) : [],
      complete = optall.complete,
      allComplete = false;

    if (optall.queueAll) {
      optall.complete = function() {
        var args = arguments;
        finished.push(this);
        var all = collection.toArray();
        $.each(collection, function(index, elem) {
          // Add dependent elements
          var depends = getElemData(elem).meta.depends;
          all.push.apply(all, depends);
        });
        all = $.unique(all);
        if (!allComplete && finished.length === all.length) {
          allComplete = true;
          $.each(all, function(index, elem) {
            if ($.inArray(elem, collection) >= 0) {
              complete.apply(elem, args);
            } else {
              $(elem).dequeue();
            }
            // end animation
          });
        }
      };
    }

    /*
     * inline method that retrieves data from collection prefilters
     */
    function getElemData(elem) {
      var data = { props: typeof prop === 'object' ? prop : {}, opts: $.extend({}, optall), meta: { from: {}, depends: [] } };
      $.each(collectionPrefilters, function(index, filter) {
        var filterData = filter.get(elem);
        if (filterData) {
          $.extend(data.props, filterData.props);
          $.extend(data.opts, filterData.opts);
          $.extend(data.meta, filterData.meta);
        }
      });
      return data;
    }

    var doAnimation = function() {
      var elem = this;
      // get prefilter data
      var data = getElemData(elem);
      // handle new elems
      var newElems = $(data.meta.depends).filter(function() { return $.inArray(this, collection) < 0 && $.inArray(this, started) < 0;});
      if (newElems.length > 0) {
        if (optall.queue === false) {
          newElems.each( doAnimation );
        } else {
          newElems.queue( optall.queue, doAnimation );
        }
      }
      // Operate on a copy of prop so per-property easing won't be lost
      var anim = jQuery.Animation( this, $.extend( {}, data.props ), data.opts);
      // Empty animations resolves immediately
      // TODO: finishing resolves immediately
      if ( $.isEmptyObject( data.props ) ) {
        // stop empty animation
        anim.stop( true );
      } else {
        // animation started
      }
      started.push(anim);
    };
    doAnimation.finish = doAnimation;
    // return chainable object
    return optall.queue === false ?
      this.each( doAnimation ) :
      this.queue( optall.queue, doAnimation );
  }

  // Setup noConflict
  var originalAnimate = jQuery.fn.animate;
  animateCollection.noConflict = function() {
    $fn.animate = originalAnimate;
    return animateCollection;
  };
  
  animateCollection.prefilters = [];
  
  // Override original animate-plugin
  $.fn.extend({
    animateCollection: animateCollection, 
    animate: animateCollection
  });
  

})(jQuery);
/*!
 * jquery.animateCollection-blocks
 * provides support for animated code blocks with jquery-animateCollection
 */
(function($) {

  var pluginName = "animateCollection-blocks";

  // utils
  
  /**
   * Camelize a string
   */
  var camelize = (function() {
    var cache = {};
    return function(string) {
      return cache[string] = cache[string] || (function() {
        return string.replace(/(\-[a-z])/g, function($1){return $1.toUpperCase().replace('-','');});
      })();
    };
  })();

  /**
   * Hyphenate a string
   */
  var hyphenate = (function() {
    var cache = {};
    return function(string) {
      return cache[string] = cache[string] || (function() {
        return string.replace(/([A-Z])/g, function($1){return "-"+$1.toLowerCase();});
      })();
    };
  })();

  /**
   * Retrieves a vendor prefixed style name for the given property
   * @param styleName
   * @param hyphenated
   */ 
  var getVendorStyle = (function() {
    var cache = {};
    var vendorPrefixes = ['Webkit', 'Moz', 'O', 'Ms'], elem = document.createElement('div');
    return function (styleName, hyphenated) {
      var camelized = camelize(styleName);
      hyphenated = typeof hyphenated === 'boolean' ? hyphenated : false;
      var result = cache[camelized] = typeof cache[camelized] !== 'undefined' ? cache[camelized] : (function(camelized) {
        var result = null;
        document.documentElement.appendChild(elem);
        if (typeof (elem.style[camelized]) === 'string') {
          result = camelized;
        }
        if (!result) {
          var capitalized = camelized.substring(0, 1).toUpperCase() + camelized.substring(1);
          for (var i = 0; i < vendorPrefixes.length; i++) {
            var prop = vendorPrefixes[i] + capitalized;
            if (typeof elem.style[prop] === 'string') {
              result = prop;
              break;
            }
          }
        }
        elem.parentNode.removeChild(elem);
        return result;
      })(camelized);
      if (result && hyphenated) {
        result = hyphenate(result);
      }
      return result;
    };
  })();

  /**
   * Captures an array of style-values for the specified element and props
   * @params elem
   */    
  var getStyles = function(elem, props) {
    var result = {};
    for (var i = 0, prop; prop = props[i]; i++) {
      var style = getVendorStyle(prop, true);
      if (style) {
        result[prop] = $(elem).css(style);
      }
    }
    return result;
  };

  /**
   * Determines whether specified style is a class style
   * @param elem
   * @param prop
   */
  function isClassStyle(elem, prop) {
    var s = $.style(elem, prop);
    var a = $(elem).css(prop);
    $.style(elem, prop, "");
    var b = $(elem).css(prop);
    $.style(elem, prop, s);
    return a === b;
  }

  /**
   * Retrieves the position pf an element relative to a specified parent
   * @param elem
   * @param parent
   */
  function getPosition(elem, parent) {
    parent = typeof parent !== 'undefined' ? parent : document.body;
    if (elem === document.body) {
      return {left: 0, top: 0};
    }
    if (!elem.offsetParent) {
      return null;
    }
    var x = 0;
    var y = 0;
    while (elem && elem !== parent) {
      x+= elem.offsetLeft;
      y+= elem.offsetTop;
      elem = elem.offsetParent;
    }
    return {
      left: x, top: y
    };
  }


  /*
   * Capturing propsets
   */
  var propsets = {
    'text': [
      // text 
      'color',
      'fontSize',
      'fontSizeAdjust',
      'fontStretch',
      'letterSpacing',
      'lineHeight',
      'maxLines',
      'textDecorationColor',
      'textEmphasisColor',
      'textIndent',
      'textShadow',
      'textDecoration-color',
      'textSizeAdjust',
      'verticalAlign',
      'wordSpacing'
    ],
    'default': [
      // jquery animate
      'borderWidth',
      'borderBottomWidth',
      'borderLeftWidth',
      'borderRightWidth',
      'borderTopWidth',
      'borderSpacing',
      'margin',
      'marginBottom',
      'marginLeft',
      'marginRight',
      'marginTop',
      'opacity',
      'outlineWidth',
      'padding',
      'paddingBottom',
      'paddingLeft',
      'paddingRight',
      'paddingTop',
      'height',
      'width',
      'maxHeight',
      'maxWidth',
      'minHeight',
      'minWidth',
      'fontSize',
      'bottom',
      'left',
      'right',
      'top',
      'letterSpacing',
      'wordSpacing',
      'lineHeight',
      'textIndent',
      'transform'
    ]
  };

  /*
   * Normalizes plugin options
   */
  function optionPrefilter(options) {
    options = options || {};
    var opts = $.extend({}, options, {
      positionStyle: (function(positionStyle) {
        if (typeof positionStyle !== 'string') {
          positionStyle = 'auto';
        }
        if (typeof positionStyle === 'string') {
          if (positionStyle === "auto") {
            // When using auto check if fx.step.transform is enabled
            if (typeof $.fx.step.transform !== 'undefined') {
              positionStyle = 'transform';
            } else {
              positionStyle = 'position';
            }
          }
          if (positionStyle === "transform"  && (!getVendorStyle('transform') || !CSSMatrix)) {
            // Transforms not supported
            positionStyle = 'position';
          } else if (positionStyle !== 'position' && positionStyle !== 'auto') {
            positionStyle = 'none';
          }
        }
        return positionStyle;
      })(options.positionStyle),
      capture: (function(capture) {
        if (typeof capture === 'string') {
          capture = capture.replace(/^\s+|\s+$/g, '');
          if (capture === 'none') {
            // Capture none
            return [];
          }
          capture = capture.split(/\s+/);
          if ($.inArray('all', capture) >= 0) {
            return getProps();
          }
        }
        if (!capture) {
          return propsets['default'];
        }
        if (capture instanceof Array) {
          for (var i = 0; i < capture.length; i++) {
            var prop = capture[i];
            if (propsets[prop]) {
              capture.splice(i, 1);
              i++;
              capture = capture.concat(propsets[prop]);
            }
          }
        }
        return capture;
      })(options.capture)
    });
    return opts;
  }

  /*
   * Adds animated elements to an existing animated collection
   */
  function elemSelector(elems) {
    var result = elems;
    //result = result.add(elems.find("*"));
    //result = result.add(result.siblings());
    return result;
  }


  /**
   * Animated Blocks
   * 
   * Allows to define animations by executing a function
   */
  function AnimatedBlocks(properties, options) {
    
    var
      elems = [],
      items = null,
      collection = this,
      complete = options.complete,
      opts = optionPrefilter($.extend({
        positionStyle: 'auto',
        capture: 'default'
      }, options));
      
    options.queueAll =  typeof options.queueAll !== 'boolean' ? true : options.queueAll;
    options.complete = function() {
      var item = $(this).data(pluginName);
      if (item) {
        if (item && item.meta && item.meta.restore) {
          for (var prop in item.meta.restore) {
            if (prop === transitionStyle || isClassStyle(item.elem, prop)) {
              item.elem.style[prop] = item.meta.restore[prop];
              delete item.meta.restore[prop];
            }
          }
        }
      }
      $(this).data(pluginName, "");
      if (typeof complete === 'function') {
        complete.apply(this, arguments);
      }
    };
    var transformStyle = getVendorStyle('transform');
    var transitionStyle = getVendorStyle('transition');

    function init() {
      if (items) {
        return;
      }
      var
        i, elem, item, prop,
        exclude = [
          //'left',
          //'top',
          'bottom',
          'right',
          'position',
          'display',
          'font-family',
          'perspective-origin',
          'transform-origin',
          'order'
        ], capture = opts.capture;
      items = [];
      elems = elemSelector.call(collection, collection);
      // create item helper
      function initItem(elem) {
        var $elem = $(elem);
        var primary = $.inArray(elem, collection) >= 0;
        var item = {
          elem: elem,
          primary: primary,
          from: {},
          to: {},
          top: {},
          before: {},
          after: {},
          meta: {
            depends: primary ? elemSelector.call(collection, $elem).filter(function() { return this !== elem; }) : [],
            restore: {}
          },
          old: $(elem).data(pluginName),
          opts: $.extend({}, opts)
        };
        return item;
      }
      // setup items
      for (i = 0, elem; elem = elems[i]; i++) {
        items[i] = initItem(elem);
      }
      if (typeof properties === 'function') {
        var
          func = properties,
          //commonOffsetParent = getCommonOffsetParent(elems),
          commonOffsetParent = document.body;
        // capture positions
        for (i = 0, item; item = items[i]; i++) {
          if (item.primary) {
            item.before.position = getPosition(item.elem, commonOffsetParent);
          }
        }
        // capture styles
        for (i = 0, item; item = items[i]; i++) {
          item.before.css = getStyles(item.elem, capture);
        }
        // capture visibility
        for (i = 0, item; item = items[i]; i++) {
          item.before.visible = $(item.elem).is(':visible');
        }
        // restore styles
        for (i = 0, item; item = items[i]; i++) {
          if (item.old && item.old.meta) {
            for (prop in item.old.meta.restore) {
              item.elem.style[prop] =  item.old.meta.restore[prop];
              delete item.old.meta.restore[prop];
            }
          }
        }
        func.call(collection);
        // capture styles after
        for (i = 0, item; item = items[i]; i++) {
          item.after = {
            css: getStyles(item.elem, capture)
          };
        }
        // clean styles
        for (i = 0, item; item = items[i]; i++) {
          for (prop in item.after.css) {
            if (prop.indexOf('transition') < 0 && exclude.indexOf(prop) < 0 && item.before.css[prop] !== item.after.css[prop] && (!item.old || item.old.to[prop] !== item.after.css[prop])) {
              item.from[prop] = item.before.css[prop];
              item.to[prop] = item.after.css[prop];
            }
          }
        }
        // capture positions after
        for (i = 0, item; item = items[i]; i++) {
          if (item.primary) {
            item.after.position = getPosition(item.elem, commonOffsetParent);
          }
        }
        for (i = 0, item; item = items[i]; i++) {
          item.after.visible = $(item.elem).is(':visible');
        }
        // collect meta-data
        for (i = 0, item; item = items[i]; i++) {
          for (prop in item.to) {
            if (isClassStyle(item.elem, getVendorStyle(prop))) {
              // store class style
              item.meta.restore[getVendorStyle(prop)] = "";
            } else {
              // not a class-style
            }
          }
        }
        // hide/show items
        for (i = 0, item; item = items[i]; i++) {
          if (!item.before.visible && item.after.visible) {
            // show
            item.from.display = 'none';
            item.to.opacity = 'show';
          } else if (item.before.visible && !item.after.visible) {
            // hide
            item.from.display = '';
            item.to.opacity = 'hide';
          }
        }
        // get diff
        for (i = 0, item; item = items[i]; i++) {
          if (!item.primary) {
            continue;
          }
          var pos1 = item.before.position;
          var pos2 = item.after.position;
          if (pos1 == null && pos2 == null) {
            // elem is not added
          } else if (pos2 && pos1 == null) {
            // show
            //item.from.display = 'none';
            //item.to.opacity = 'show';
          } else if (pos1 && pos2 == null) {
            // hide
            /*item.to = {
              opacity: 'hide'
            };*/
          } else {
            // move
            var diff = {
              left: pos2.left - pos1.left,
              top: pos2.top - pos1.top
            };
            if (diff.left !== 0 || diff.top !== 0) {
              // apply values by method 
              if (opts.positionStyle === 'transform') {
                // transform
                var currentValue = $(item.elem).css(transformStyle);
                var nowMatrix = new CSSMatrix(currentValue);
                var translateLeft = nowMatrix.d, translateTop = nowMatrix.e;
                var translateMatrix = nowMatrix.translate(-diff.left, -diff.top);
                item.from[transformStyle] = translateMatrix.toString();
                item.to[transformStyle] = nowMatrix.toString();
                item.meta.restore[transformStyle] = (translateLeft !== 0 || translateTop !== 0) && currentValue !== 'none' ? currentValue : "";
                item.elem.style[transformStyle] = item.from[transformStyle];
              } else if (opts.positionStyle === 'position') {
                // position
                var positionStyleValue = $.css(item.elem, 'position');
                if (positionStyleValue === 'static') {
                  item.meta.restore.position = positionStyleValue;
                  item.from.position = 'relative';
                }
                // positioning left
                var leftStyleValue = positionStyleValue !== 'static' ? item.old && typeof item.old.meta.restore.left !== 'undefined' ? item.old.meta.restore.left : $.css(item.elem, 'left') : 0;
                var fromLeft = parseFloat(item.from.left);
                fromLeft = isNaN(fromLeft) ? 0 : fromLeft;
                item.from.left = ( - diff.left) + "px";
                item.to.left = "";
                item.meta.restore.left = leftStyleValue;
                // positioning top
                var topStyleValue = positionStyleValue !== 'static' ? item.old && typeof item.old.meta.restore.top !== 'undefined' ? item.old.meta.restore.top : $.css(item.elem, 'top') : 0;
                item.from.top = ( - diff.top) + "px";
                item.to.top = "";
                item.meta.restore.top = topStyleValue;
              }
            } else {
              // no diff in position
            }
          }
        }
        // remove old item and set data
        for (i = 0, item; item = items[i]; i++) {
          delete item.old;
          $(item.elem).css(item.from);
          $(item.elem).data(pluginName, item);
        }
      }
    }
    // return object
    return {
      get: function(elem) {
        if (!items) {
          init();
        }
        var index = $.inArray(elem, elems);
        if (index >= 0) {
          var item = items[index];
          if (item) {
            return {
              props: item.to,
              opts: item.opts,
              meta: {
                from: item.from,
                depends: item.meta.depends
              }
            };
          }
        }
        return null;
      }
    };
  }


  if (typeof $.fn.animateCollection !== "undefined") {
    // Register the plugin
    $.fn.animateCollection.prefilters.push(AnimatedBlocks);
  }

})(jQuery);

/*!
 * jquery.animateCollection-itemopts.js
 * provides support for item-specific options in jquery.animateCollection
 */
(function($) {

  /*
   * item opts plugin
   */
  function ItemOpts(properties, opts) {
    var collection = this;
    var elems = this.toArray();
    var items = null;

    function computeOptions(index, length, options) {
      var result = {};
      for (var opt in options) {
        var val = options[opt];
        if (typeof val === 'function') {
          result[opt] = val.call(this, index, length, options);
        } else if (typeof val === 'object') {
          result[opt] = computeOptions(index, val);
        } else if (typeof val === 'number') {
          result[opt] = val * index;
        }
      }
      return result;
    }

    function init() {
      if (items) {
        return;
      }
      items = [];
      // setup items
      for (var i = 0, elem; elem = elems[i]; i++) {
        items[i] = items[i] || {
          elem: elem,
          opts: $.extend({}, opts, computeOptions.call(collection, i, elems.length, opts.item))
        };
      }
    }
    // return object
    return {
      get: function(elem) {
        init();
        var index = $.inArray(elem, elems);
        if (index >= 0) {
          var item = items[index];
          if (item) {
            return {
              opts: item.opts
            };
          }
        }
        return null;
      }
    };
  }
  
  if (typeof $.fn.animateCollection !== "undefined") {
    // Register the plugin
    $.fn.animateCollection.prefilters.push(ItemOpts);
  }

})(jQuery);


})(jQuery, window);
