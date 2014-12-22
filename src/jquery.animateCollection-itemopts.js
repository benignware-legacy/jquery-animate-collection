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
