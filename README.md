delayed-img-manager
===================

Manages img nodes whose src is not assigned until they are scrolled into view.

When a large number of `<img>` nodes exist in the DOM, their src attributes tell the browser to perform a GET for the images which can clog available network resources and hog server bandwidth.  This dijit allows you to delay the loading of images until they're actually visible to the user.

Prepare your `<img>` nodes with `data-src` attributes instead of `src` attributes.  DelayedImgManager will change `data-src` into `src` when it sees that the `<img>` node has come into view.

    <img data-src="/some/image.jp">

