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