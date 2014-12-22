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
