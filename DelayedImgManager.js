define([
	"dojo/on",
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/query",
	"dojo/Deferred",
	"dojo/_base/array",
	"dojo/_base/window",
	"dijit/_Widget",
	"dojo/dom-geometry",
	"dojo/window",
	"dojo/dom-attr",
	"dojo/NodeList-dom"
	], function( on, declare, lang, query, Deferred,  array, winCore, _Widget, domGeom, win, attr ){

		return declare("delayed-img-manager.DelayedImgManager", null, {
			// summary:
			//		Instantiate this dijit to manage scrolling of an element and setting 
			//		up img src attributes in it. Defaults to managing the body scroll and
			//		img children of body, but container and scrollContainer can be
			//		reassigned to handle specific situations, for example elements nested
			//		within specific parts of the DOM.

			// container:
			//		The dom node that contains <img> nodes we 
			//		care about.
			container: winCore.body(),
			// scrollContainer:
			//		The dom node whose scroll event we listen to.
			scrollContainer: winCore.global,
			// threshold:
			//		Number of pixels an img has to come to being
			//		in view to be considered swappable.
			threshold: 100,
			// disconnectOnEmpty:
			//		Should be disconnect our event listeners when
			//		no img nodes are left to manage?  Use when you
			//		are sure your dom isn't going to change.
			disconnectOnEmpty : true,
			// imgList:
			//		Our internal list of img nodes we are watching.
			imgList: [],

			constructor: function(args){
				lang.mixin(this, args);
			},
			startup: function() {
				// summary:
				//		Scan for img nodes and swap any that
				//		are currently in view.
				this.inherited(arguments);
				this.scan();
				this.onScroll();
			},
			scan : function(){
				// summary:
				//		Queries the dom for img nodes and sets up event listeners.
				this.imgList = query('img[data-src]', this.container);
				// TODO ADD a DEBOUNCER!!
				this.hScroll = on(this.scrollContainer, 'scroll', lang.hitch(this, "onScroll"));
				this.hResize = on(this.scrollContainer, 'resize', lang.hitch(this, "onScroll"));
			},
			onScroll: function(e) {
				console.log( "scroll" );
				// examine all our images to see if any are now in-view
				var box = domGeom.position(this.scrollContainer, true); //win.getBox();
				var nodeToRemove = [];
				array.forEach(this.imgList, lang.hitch(this,
					function(n, index, arr) {
						if( typeof n !== "undefined" ){
							var ds = attr.get(n, 'data-src');
							if (ds && ds !== null) {

								var position = domGeom.position( n ),
									imgTop = n.offsetTop,
									parent = n.parentNode;
								do {
								    if (parent != this.scrollContainer) {
								        imgTop += parent.offsetTop;
								    }
								    parent = parent.parentNode;
								} while (parent && parent != this.scrollContainer);
								imgTop -= this.scrollContainer.scrollTop;


								var imgBottom = imgTop + position.h;

								if( (imgTop > ( 0 - this.threshold ) && imgTop < ( box.h + this.threshold ) ) || ( imgBottom > ( 0 - this.threshold ) && imgBottom < ( box.h + this.threshold ) ) ){
									n.src = attr.get(n, 'data-src');
									attr.remove(n, 'data-src');
									nodeToRemove.push( n );
								} else {
									console.log("Not yet in view: ", n, " position: ", position);
								}

							}
						}
					}));
				array.forEach( nodeToRemove, function(nodeToSplice){
					this.imgList.splice(this.imgList.indexOf(nodeToSplice), 1);
				}, this );

				if(this.disconnectOnEmpty && this.imgList.length == 0){
					this.destroy();
				}
			},
			destroy: function() {
				if (this.hScroll) {
					this.hScroll.remove();
					this.hScroll = undefined;
				}
				if (this.hResize) {
					this.hResize.remove();
					this.hResize = undefined;
				}
			}
		});
	});
