jquery-animate-collection
=========================

> Extend jquery-animate with collection-prefilters, animated code blocks and item-based options.

jquery.animateCollection provides a way of extending jquery-animate that allows for better control over single elements in an animated collection.

Usage
-----

jquery.animateCollection by default overrides the original $.animate-method. Simply call as usual.
If this behaviour is not wanted, you can call fn.animateCollection.noConflict() to restore the original method. You can still use fn.animateCollection. 

### Define a custom prefilter

Extend jquery.animate by defining a custom collection prefilter.
Here's a custom prefilter-boilerplate:

```js
/*!
 * jquery.animateCollection-prefilter.js
 * Example boilerplate
 */
(function($) {
  /*
   * custom collection prefilter for jquery.fx-collection
   */
  function Prefilter(properties, opts) {
    return {
      get: function(elem) {
        // return item-specific props and opts
        return {
          opts:  {...},
          props: {...}
        };
      }
    };
  }
  if (typeof $.fn.animateCollection !== "undefined") {
    // Register the plugin
    $.fn.animateCollection.prefilters.push(ItemOpts);
  }
})(jQuery);
```


### Basic Options

<table>
  <tr>
    <th>Option</th><th>Type</th><th>Description</th>
  </tr>
  <tr>
    <td>queueAll</td>
    <td>Boolean</td>
    <td>
      Specify whether to sync queuing of elements in the collection. Defaults to `false`. Plugins may override the default value to this option. 
    </td>
  </tr>
</table>

### Modules

Bundled with the plugin and baked into the distribution are the following prefilters: 

* Animated code blocks (`jquery.animateCollection.blocks`)
* Item options (`jquery.animateCollection.itemopts`)

Animated code blocks
====================

> Pass in a function to animate all items in the collection. 

#### CSS-manipulations

Animations reflect changes to inline style-properties
```js
$('.block').animate(function() {
  $(this).css({
    width: 100, 
    height: 100, 
    lineHeight: "96px"
  });
});
```

...and class assignments:

```js
$('.block').animate(function() {
  $(this).toggleClass('big');
});

```

#### DOM-manipulations

Animations also reflect dom-manipulations. 
The following example demonstrates how to shuffle items animated within the same parent.

```html
<div id="blocks" class="blocks">
  <div id="block1" class="block">1</div>
  <div id="block2" class="block">2</div>
  <div id="block3" class="block">3</div>
  <div id="block4" class="block">4</div>
  <div id="block5" class="block">5</div>
</div>
```        

```js
$('.block').animate(function() {
  var $blocks = $('.blocks');
  $blocks.append($blocks.children().first());
  $blocks.append($blocks.children().toArray().slice(1).reverse());
});
```

Options
-------

<table>
  <tr>
    <th>Option</th><th>Type</th><th>Description</th>
  </tr>
  <tr>
    <td>capture</td>
    <td>Array</td>
    <td>
      An array containing styles to be observed with animated blocks-
    </td>
  </tr>
  <tr>
    <td>positionStyle</td>
    <td>String</td>
    <td>
      Specify whether to use `absolute`- or `transform`-based positioning with animated blocks.
    </td>
  </tr>
</table>


Per-Item-Options
================
> This module allows to specify options based on the order that items appear in a collection.

```js
$('.block').animate({
  left: "+=50px"
}, {
  duration: 1000,
  item: {
    delay: 250
  }
});
```

Options
-------

<table>
  <tr>
    <th>Option</th><th>Type</th><th>Description</th>
  </tr>
  <tr>
    <td>item</td>
    <td>Object</td>
    <td>
      A set of numerical options that will be multiplied by collection index. If a function is provided, values can be computed at runtime.
    </td>
  </tr>
</table>
