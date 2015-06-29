/*! Picturefill - v2.3.1 - 2015-04-09
* http://scottjehl.github.io/picturefill
* Copyright (c) 2015 https://github.com/scottjehl/picturefill/blob/master/Authors.txt; Licensed MIT */
/*! matchMedia() polyfill - Test a CSS media type/query in JS. Authors & copyright (c) 2012: Scott Jehl, Paul Irish, Nicholas Zakas, David Knight. Dual MIT/BSD license */

window.matchMedia || (window.matchMedia = function() {
	"use strict";

	// For browsers that support matchMedium api such as IE 9 and webkit
	var styleMedia = (window.styleMedia || window.media);

	// For those that don't support matchMedium
	if (!styleMedia) {
		var style       = document.createElement('style'),
			script      = document.getElementsByTagName('script')[0],
			info        = null;

		style.type  = 'text/css';
		style.id    = 'matchmediajs-test';

		script.parentNode.insertBefore(style, script);

		// 'style.currentStyle' is used by IE <= 8 and 'window.getComputedStyle' for all other browsers
		info = ('getComputedStyle' in window) && window.getComputedStyle(style, null) || style.currentStyle;

		styleMedia = {
			matchMedium: function(media) {
				var text = '@media ' + media + '{ #matchmediajs-test { width: 1px; } }';

				// 'style.styleSheet' is used by IE <= 8 and 'style.textContent' for all other browsers
				if (style.styleSheet) {
					style.styleSheet.cssText = text;
				} else {
					style.textContent = text;
				}

				// Test if media query is true or false
				return info.width === '1px';
			}
		};
	}

	return function(media) {
		return {
			matches: styleMedia.matchMedium(media || 'all'),
			media: media || 'all'
		};
	};
}());
/*! Picturefill - Responsive Images that work today.
*  Author: Scott Jehl, Filament Group, 2012 ( new proposal implemented by Shawn Jansepar )
*  License: MIT/GPLv2
*  Spec: http://picture.responsiveimages.org/
*/
(function( w, doc, image ) {
	// Enable strict mode
	"use strict";

	function expose(picturefill) {
		/* expose picturefill */
		if ( typeof module === "object" && typeof module.exports === "object" ) {
			// CommonJS, just export
			module.exports = picturefill;
		} else if ( typeof define === "function" && define.amd ) {
			// AMD support
			define( "picturefill", function() { return picturefill; } );
		}
		if ( typeof w === "object" ) {
			// If no AMD and we are in the browser, attach to window
			w.picturefill = picturefill;
		}
	}

	// If picture is supported, well, that's awesome. Let's get outta here...
	if ( w.HTMLPictureElement ) {
		expose(function() { });
		return;
	}

	// HTML shim|v it for old IE (IE9 will still need the HTML video tag workaround)
	doc.createElement( "picture" );

	// local object for method references and testing exposure
	var pf = w.picturefill || {};

	var regWDesc = /\s+\+?\d+(e\d+)?w/;

	// namespace
	pf.ns = "picturefill";

	// srcset support test
	(function() {
		pf.srcsetSupported = "srcset" in image;
		pf.sizesSupported = "sizes" in image;
		pf.curSrcSupported = "currentSrc" in image;
	})();

	// just a string trim workaround
	pf.trim = function( str ) {
		return str.trim ? str.trim() : str.replace( /^\s+|\s+$/g, "" );
	};

	/**
	 * Gets a string and returns the absolute URL
	 * @param src
	 * @returns {String} absolute URL
	 */
	pf.makeUrl = (function() {
		var anchor = doc.createElement( "a" );
		return function(src) {
			anchor.href = src;
			return anchor.href;
		};
	})();

	/**
	 * Shortcut method for https://w3c.github.io/webappsec/specs/mixedcontent/#restricts-mixed-content ( for easy overriding in tests )
	 */
	pf.restrictsMixedContent = function() {
		return w.location.protocol === "https:";
	};
	/**
	 * Shortcut method for matchMedia ( for easy overriding in tests )
	 */

	pf.matchesMedia = function( media ) {
		return w.matchMedia && w.matchMedia( media ).matches;
	};

	// Shortcut method for `devicePixelRatio` ( for easy overriding in tests )
	pf.getDpr = function() {
		return ( w.devicePixelRatio || 1 );
	};

	/**
	 * Get width in css pixel value from a "length" value
	 * http://dev.w3.org/csswg/css-values-3/#length-value
	 */
	pf.getWidthFromLength = function( length ) {
		var cssValue;
		// If a length is specified and doesn’t contain a percentage, and it is greater than 0 or using `calc`, use it. Else, abort.
        if ( !(length && length.indexOf( "%" ) > -1 === false && ( parseFloat( length ) > 0 || length.indexOf( "calc(" ) > -1 )) ) {
            return false;
        }

		/**
		 * If length is specified in  `vw` units, use `%` instead since the div we’re measuring
		 * is injected at the top of the document.
		 *
		 * TODO: maybe we should put this behind a feature test for `vw`? The risk of doing this is possible browser inconsistancies with vw vs %
		 */
		length = length.replace( "vw", "%" );

		// Create a cached element for getting length value widths
		if ( !pf.lengthEl ) {
			pf.lengthEl = doc.createElement( "div" );

			// Positioning styles help prevent padding/margin/width on `html` or `body` from throwing calculations off.
			pf.lengthEl.style.cssText = "border:0;display:block;font-size:1em;left:0;margin:0;padding:0;position:absolute;visibility:hidden";

			// Add a class, so that everyone knows where this element comes from
			pf.lengthEl.className = "helper-from-picturefill-js";
		}

		pf.lengthEl.style.width = "0px";

        try {
		    pf.lengthEl.style.width = length;
        } catch ( e ) {}

		doc.body.appendChild(pf.lengthEl);

		cssValue = pf.lengthEl.offsetWidth;

		if ( cssValue <= 0 ) {
			cssValue = false;
		}

		doc.body.removeChild( pf.lengthEl );

		return cssValue;
	};

    pf.detectTypeSupport = function( type, typeUri ) {
        // based on Modernizr's lossless img-webp test
        // note: asynchronous
        var image = new w.Image();
        image.onerror = function() {
            pf.types[ type ] = false;
            picturefill();
        };
        image.onload = function() {
            pf.types[ type ] = image.width === 1;
            picturefill();
        };
        image.src = typeUri;

        return "pending";
    };
	// container of supported mime types that one might need to qualify before using
	pf.types = pf.types || {};

	pf.initTypeDetects = function() {
        // Add support for standard mime types
        pf.types[ "image/jpeg" ] = true;
        pf.types[ "image/gif" ] = true;
        pf.types[ "image/png" ] = true;
        pf.types[ "image/svg+xml" ] = doc.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#Image", "1.1");
        pf.types[ "image/webp" ] = pf.detectTypeSupport("image/webp", "data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA=");
    };

	pf.verifyTypeSupport = function( source ) {
		var type = source.getAttribute( "type" );
		// if type attribute exists, return test result, otherwise return true
		if ( type === null || type === "" ) {
			return true;
		} else {
				var pfType = pf.types[ type ];
			// if the type test is a function, run it and return "pending" status. The function will rerun picturefill on pending elements once finished.
			if ( typeof pfType === "string" && pfType !== "pending") {
				pf.types[ type ] = pf.detectTypeSupport( type, pfType );
				return "pending";
			} else if ( typeof pfType === "function" ) {
				pfType();
				return "pending";
			} else {
				return pfType;
			}
		}
	};

	// Parses an individual `size` and returns the length, and optional media query
	pf.parseSize = function( sourceSizeStr ) {
		var match = /(\([^)]+\))?\s*(.+)/g.exec( sourceSizeStr );
		return {
			media: match && match[1],
			length: match && match[2]
		};
	};

	// Takes a string of sizes and returns the width in pixels as a number
	pf.findWidthFromSourceSize = function( sourceSizeListStr ) {
		// Split up source size list, ie ( max-width: 30em ) 100%, ( max-width: 50em ) 50%, 33%
		//                            or (min-width:30em) calc(30% - 15px)
		var sourceSizeList = pf.trim( sourceSizeListStr ).split( /\s*,\s*/ ),
			winningLength;

		for ( var i = 0, len = sourceSizeList.length; i < len; i++ ) {
			// Match <media-condition>? length, ie ( min-width: 50em ) 100%
			var sourceSize = sourceSizeList[ i ],
				// Split "( min-width: 50em ) 100%" into separate strings
				parsedSize = pf.parseSize( sourceSize ),
				length = parsedSize.length,
				media = parsedSize.media;

			if ( !length ) {
				continue;
			}
			// if there is no media query or it matches, choose this as our winning length
			if ( (!media || pf.matchesMedia( media )) &&
				// pass the length to a method that can properly determine length
				// in pixels based on these formats: http://dev.w3.org/csswg/css-values-3/#length-value
				(winningLength = pf.getWidthFromLength( length )) ) {
				break;
			}
		}

		//if we have no winningLength fallback to 100vw
		return winningLength || Math.max(w.innerWidth || 0, doc.documentElement.clientWidth);
	};

	pf.parseSrcset = function( srcset ) {
		/**
		 * A lot of this was pulled from Boris Smus’ parser for the now-defunct WHATWG `srcset`
		 * https://github.com/borismus/srcset-polyfill/blob/master/js/srcset-info.js
		 *
		 * 1. Let input (`srcset`) be the value passed to this algorithm.
		 * 2. Let position be a pointer into input, initially pointing at the start of the string.
		 * 3. Let raw candidates be an initially empty ordered list of URLs with associated
		 *    unparsed descriptors. The order of entries in the list is the order in which entries
		 *    are added to the list.
		 */
		var candidates = [];

		while ( srcset !== "" ) {
			srcset = srcset.replace( /^\s+/g, "" );

			// 5. Collect a sequence of characters that are not space characters, and let that be url.
			var pos = srcset.search(/\s/g),
				url, descriptor = null;

			if ( pos !== -1 ) {
				url = srcset.slice( 0, pos );

				var last = url.slice(-1);

				// 6. If url ends with a U+002C COMMA character (,), remove that character from url
				// and let descriptors be the empty string. Otherwise, follow these substeps
				// 6.1. If url is empty, then jump to the step labeled descriptor parser.

				if ( last === "," || url === "" ) {
					url = url.replace( /,+$/, "" );
					descriptor = "";
				}
				srcset = srcset.slice( pos + 1 );

				// 6.2. Collect a sequence of characters that are not U+002C COMMA characters (,), and
				// let that be descriptors.
				if ( descriptor === null ) {
					var descpos = srcset.indexOf( "," );
					if ( descpos !== -1 ) {
						descriptor = srcset.slice( 0, descpos );
						srcset = srcset.slice( descpos + 1 );
					} else {
						descriptor = srcset;
						srcset = "";
					}
				}
			} else {
				url = srcset;
				srcset = "";
			}

			// 7. Add url to raw candidates, associated with descriptors.
			if ( url || descriptor ) {
				candidates.push({
					url: url,
					descriptor: descriptor
				});
			}
		}
		return candidates;
	};

	pf.parseDescriptor = function( descriptor, sizesattr ) {
		// 11. Descriptor parser: Let candidates be an initially empty source set. The order of entries in the list
		// is the order in which entries are added to the list.
		var sizes = sizesattr || "100vw",
			sizeDescriptor = descriptor && descriptor.replace( /(^\s+|\s+$)/g, "" ),
			widthInCssPixels = pf.findWidthFromSourceSize( sizes ),
			resCandidate;

			if ( sizeDescriptor ) {
				var splitDescriptor = sizeDescriptor.split(" ");

				for (var i = splitDescriptor.length - 1; i >= 0; i--) {
					var curr = splitDescriptor[ i ],
						lastchar = curr && curr.slice( curr.length - 1 );

					if ( ( lastchar === "h" || lastchar === "w" ) && !pf.sizesSupported ) {
						resCandidate = parseFloat( ( parseInt( curr, 10 ) / widthInCssPixels ) );
					} else if ( lastchar === "x" ) {
						var res = curr && parseFloat( curr, 10 );
						resCandidate = res && !isNaN( res ) ? res : 1;
					}
				}
			}
		return resCandidate || 1;
	};

	/**
	 * Takes a srcset in the form of url/
	 * ex. "images/pic-medium.png 1x, images/pic-medium-2x.png 2x" or
	 *     "images/pic-medium.png 400w, images/pic-medium-2x.png 800w" or
	 *     "images/pic-small.png"
	 * Get an array of image candidates in the form of
	 *      {url: "/foo/bar.png", resolution: 1}
	 * where resolution is http://dev.w3.org/csswg/css-values-3/#resolution-value
	 * If sizes is specified, resolution is calculated
	 */
	pf.getCandidatesFromSourceSet = function( srcset, sizes ) {
		var candidates = pf.parseSrcset( srcset ),
			formattedCandidates = [];

		for ( var i = 0, len = candidates.length; i < len; i++ ) {
			var candidate = candidates[ i ];

			formattedCandidates.push({
				url: candidate.url,
				resolution: pf.parseDescriptor( candidate.descriptor, sizes )
			});
		}
		return formattedCandidates;
	};

	/**
	 * if it's an img element and it has a srcset property,
	 * we need to remove the attribute so we can manipulate src
	 * (the property's existence infers native srcset support, and a srcset-supporting browser will prioritize srcset's value over our winning picture candidate)
	 * this moves srcset's value to memory for later use and removes the attr
	 */
	pf.dodgeSrcset = function( img ) {
		if ( img.srcset ) {
			img[ pf.ns ].srcset = img.srcset;
			img.srcset = "";
			img.setAttribute( "data-pfsrcset", img[ pf.ns ].srcset );
		}
	};

	// Accept a source or img element and process its srcset and sizes attrs
	pf.processSourceSet = function( el ) {
		var srcset = el.getAttribute( "srcset" ),
			sizes = el.getAttribute( "sizes" ),
			candidates = [];

		// if it's an img element, use the cached srcset property (defined or not)
		if ( el.nodeName.toUpperCase() === "IMG" && el[ pf.ns ] && el[ pf.ns ].srcset ) {
			srcset = el[ pf.ns ].srcset;
		}

		if ( srcset ) {
			candidates = pf.getCandidatesFromSourceSet( srcset, sizes );
		}
		return candidates;
	};

	pf.backfaceVisibilityFix = function( picImg ) {
		// See: https://github.com/scottjehl/picturefill/issues/332
		var style = picImg.style || {},
			WebkitBackfaceVisibility = "webkitBackfaceVisibility" in style,
			currentZoom = style.zoom;

		if (WebkitBackfaceVisibility) {
			style.zoom = ".999";

			WebkitBackfaceVisibility = picImg.offsetWidth;

			style.zoom = currentZoom;
		}
	};

	pf.setIntrinsicSize = (function() {
		var urlCache = {};
		var setSize = function( picImg, width, res ) {
            if ( width ) {
			    picImg.setAttribute( "width", parseInt(width / res, 10) );
            }
		};
		return function( picImg, bestCandidate ) {
			var img;
			if ( !picImg[ pf.ns ] || w.pfStopIntrinsicSize ) {
				return;
			}
			if ( picImg[ pf.ns ].dims === undefined ) {
				picImg[ pf.ns].dims = picImg.getAttribute("width") || picImg.getAttribute("height");
			}
			if ( picImg[ pf.ns].dims ) { return; }

			if ( bestCandidate.url in urlCache ) {
				setSize( picImg, urlCache[bestCandidate.url], bestCandidate.resolution );
			} else {
				img = doc.createElement( "img" );
				img.onload = function() {
					urlCache[bestCandidate.url] = img.width;

                    //IE 10/11 don't calculate width for svg outside document
                    if ( !urlCache[bestCandidate.url] ) {
                        try {
                            doc.body.appendChild( img );
                            urlCache[bestCandidate.url] = img.width || img.offsetWidth;
                            doc.body.removeChild( img );
                        } catch(e){}
                    }

					if ( picImg.src === bestCandidate.url ) {
						setSize( picImg, urlCache[bestCandidate.url], bestCandidate.resolution );
					}
					picImg = null;
					img.onload = null;
					img = null;
				};
				img.src = bestCandidate.url;
			}
		};
	})();

	pf.applyBestCandidate = function( candidates, picImg ) {
		var candidate,
			length,
			bestCandidate;

		candidates.sort( pf.ascendingSort );

		length = candidates.length;
		bestCandidate = candidates[ length - 1 ];

		for ( var i = 0; i < length; i++ ) {
			candidate = candidates[ i ];
			if ( candidate.resolution >= pf.getDpr() ) {
				bestCandidate = candidate;
				break;
			}
		}

		if ( bestCandidate ) {

			bestCandidate.url = pf.makeUrl( bestCandidate.url );

			if ( picImg.src !== bestCandidate.url ) {
				if ( pf.restrictsMixedContent() && bestCandidate.url.substr(0, "http:".length).toLowerCase() === "http:" ) {
					if ( window.console !== undefined ) {
						console.warn( "Blocked mixed content image " + bestCandidate.url );
					}
				} else {
					picImg.src = bestCandidate.url;
					// currentSrc attribute and property to match
					// http://picture.responsiveimages.org/#the-img-element
					if ( !pf.curSrcSupported ) {
						picImg.currentSrc = picImg.src;
					}

					pf.backfaceVisibilityFix( picImg );
				}
			}

			pf.setIntrinsicSize(picImg, bestCandidate);
		}
	};

	pf.ascendingSort = function( a, b ) {
		return a.resolution - b.resolution;
	};

	/**
	 * In IE9, <source> elements get removed if they aren't children of
	 * video elements. Thus, we conditionally wrap source elements
	 * using <!--[if IE 9]><video style="display: none;"><![endif]-->
	 * and must account for that here by moving those source elements
	 * back into the picture element.
	 */
	pf.removeVideoShim = function( picture ) {
		var videos = picture.getElementsByTagName( "video" );
		if ( videos.length ) {
			var video = videos[ 0 ],
				vsources = video.getElementsByTagName( "source" );
			while ( vsources.length ) {
				picture.insertBefore( vsources[ 0 ], video );
			}
			// Remove the video element once we're finished removing its children
			video.parentNode.removeChild( video );
		}
	};

	/**
	 * Find all `img` elements, and add them to the candidate list if they have
	 * a `picture` parent, a `sizes` attribute in basic `srcset` supporting browsers,
	 * a `srcset` attribute at all, and they haven’t been evaluated already.
	 */
	pf.getAllElements = function() {
		var elems = [],
			imgs = doc.getElementsByTagName( "img" );

		for ( var h = 0, len = imgs.length; h < len; h++ ) {
			var currImg = imgs[ h ];

			if ( currImg.parentNode.nodeName.toUpperCase() === "PICTURE" ||
			( currImg.getAttribute( "srcset" ) !== null ) || currImg[ pf.ns ] && currImg[ pf.ns ].srcset !== null ) {
				elems.push( currImg );
			}
		}
		return elems;
	};

	pf.getMatch = function( img, picture ) {
		var sources = picture.childNodes,
			match;

		// Go through each child, and if they have media queries, evaluate them
		for ( var j = 0, slen = sources.length; j < slen; j++ ) {
			var source = sources[ j ];

			// ignore non-element nodes
			if ( source.nodeType !== 1 ) {
				continue;
			}

			// Hitting the `img` element that started everything stops the search for `sources`.
			// If no previous `source` matches, the `img` itself is evaluated later.
			if ( source === img ) {
				return match;
			}

			// ignore non-`source` nodes
			if ( source.nodeName.toUpperCase() !== "SOURCE" ) {
				continue;
			}
			// if it's a source element that has the `src` property set, throw a warning in the console
			if ( source.getAttribute( "src" ) !== null && typeof console !== undefined ) {
				console.warn("The `src` attribute is invalid on `picture` `source` element; instead, use `srcset`.");
			}

			var media = source.getAttribute( "media" );

			// if source does not have a srcset attribute, skip
			if ( !source.getAttribute( "srcset" ) ) {
				continue;
			}

			// if there's no media specified, OR w.matchMedia is supported
			if ( ( !media || pf.matchesMedia( media ) ) ) {
				var typeSupported = pf.verifyTypeSupport( source );

				if ( typeSupported === true ) {
					match = source;
					break;
				} else if ( typeSupported === "pending" ) {
					return false;
				}
			}
		}

		return match;
	};

	function picturefill( opt ) {
		var elements,
			element,
			parent,
			firstMatch,
			candidates,
			options = opt || {};

		elements = options.elements || pf.getAllElements();

		// Loop through all elements
		for ( var i = 0, plen = elements.length; i < plen; i++ ) {
			element = elements[ i ];
			parent = element.parentNode;
			firstMatch = undefined;
			candidates = undefined;

			// immediately skip non-`img` nodes
			if ( element.nodeName.toUpperCase() !== "IMG" ) {
				continue;
			}

			// expando for caching data on the img
			if ( !element[ pf.ns ] ) {
				element[ pf.ns ] = {};
			}

			// if the element has already been evaluated, skip it unless
			// `options.reevaluate` is set to true ( this, for example,
			// is set to true when running `picturefill` on `resize` ).
			if ( !options.reevaluate && element[ pf.ns ].evaluated ) {
				continue;
			}

			// if `img` is in a `picture` element
			if ( parent && parent.nodeName.toUpperCase() === "PICTURE" ) {

				// IE9 video workaround
				pf.removeVideoShim( parent );

				// return the first match which might undefined
				// returns false if there is a pending source
				// TODO the return type here is brutal, cleanup
				firstMatch = pf.getMatch( element, parent );

				// if any sources are pending in this picture due to async type test(s)
				// remove the evaluated attr and skip for now ( the pending test will
				// rerun picturefill on this element when complete)
				if ( firstMatch === false ) {
					continue;
				}
			} else {
				firstMatch = undefined;
			}

			// Cache and remove `srcset` if present and we’re going to be doing `picture`/`srcset`/`sizes` polyfilling to it.
			if ( ( parent && parent.nodeName.toUpperCase() === "PICTURE" ) ||
			( !pf.sizesSupported && ( element.srcset && regWDesc.test( element.srcset ) ) ) ) {
				pf.dodgeSrcset( element );
			}

			if ( firstMatch ) {
				candidates = pf.processSourceSet( firstMatch );
				pf.applyBestCandidate( candidates, element );
			} else {
				// No sources matched, so we’re down to processing the inner `img` as a source.
				candidates = pf.processSourceSet( element );

				if ( element.srcset === undefined || element[ pf.ns ].srcset ) {
					// Either `srcset` is completely unsupported, or we need to polyfill `sizes` functionality.
					pf.applyBestCandidate( candidates, element );
				} // Else, resolution-only `srcset` is supported natively.
			}

			// set evaluated to true to avoid unnecessary reparsing
			element[ pf.ns ].evaluated = true;
		}
	}

	/**
	 * Sets up picture polyfill by polling the document and running
	 * the polyfill every 250ms until the document is ready.
	 * Also attaches picturefill on resize
	 */
	function runPicturefill() {
		pf.initTypeDetects();
		picturefill();
		var intervalId = setInterval( function() {
			// When the document has finished loading, stop checking for new images
			// https://github.com/ded/domready/blob/master/ready.js#L15
			picturefill();

			if ( /^loaded|^i|^c/.test( doc.readyState ) ) {
				clearInterval( intervalId );
				return;
			}
		}, 250 );

		var resizeTimer;
		var handleResize = function() {
	        picturefill({ reevaluate: true });
	    };
		function checkResize() {
		    clearTimeout(resizeTimer);
		    resizeTimer = setTimeout( handleResize, 60 );
		}

		if ( w.addEventListener ) {
			w.addEventListener( "resize", checkResize, false );
		} else if ( w.attachEvent ) {
			w.attachEvent( "onresize", checkResize );
		}
	}

	runPicturefill();

	/* expose methods for testing */
	picturefill._ = pf;

	expose( picturefill );

} )( window, window.document, new window.Image() );

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJwaWN0dXJlZmlsbC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKiEgUGljdHVyZWZpbGwgLSB2Mi4zLjEgLSAyMDE1LTA0LTA5XG4qIGh0dHA6Ly9zY290dGplaGwuZ2l0aHViLmlvL3BpY3R1cmVmaWxsXG4qIENvcHlyaWdodCAoYykgMjAxNSBodHRwczovL2dpdGh1Yi5jb20vc2NvdHRqZWhsL3BpY3R1cmVmaWxsL2Jsb2IvbWFzdGVyL0F1dGhvcnMudHh0OyBMaWNlbnNlZCBNSVQgKi9cbi8qISBtYXRjaE1lZGlhKCkgcG9seWZpbGwgLSBUZXN0IGEgQ1NTIG1lZGlhIHR5cGUvcXVlcnkgaW4gSlMuIEF1dGhvcnMgJiBjb3B5cmlnaHQgKGMpIDIwMTI6IFNjb3R0IEplaGwsIFBhdWwgSXJpc2gsIE5pY2hvbGFzIFpha2FzLCBEYXZpZCBLbmlnaHQuIER1YWwgTUlUL0JTRCBsaWNlbnNlICovXG5cbndpbmRvdy5tYXRjaE1lZGlhIHx8ICh3aW5kb3cubWF0Y2hNZWRpYSA9IGZ1bmN0aW9uKCkge1xuXHRcInVzZSBzdHJpY3RcIjtcblxuXHQvLyBGb3IgYnJvd3NlcnMgdGhhdCBzdXBwb3J0IG1hdGNoTWVkaXVtIGFwaSBzdWNoIGFzIElFIDkgYW5kIHdlYmtpdFxuXHR2YXIgc3R5bGVNZWRpYSA9ICh3aW5kb3cuc3R5bGVNZWRpYSB8fCB3aW5kb3cubWVkaWEpO1xuXG5cdC8vIEZvciB0aG9zZSB0aGF0IGRvbid0IHN1cHBvcnQgbWF0Y2hNZWRpdW1cblx0aWYgKCFzdHlsZU1lZGlhKSB7XG5cdFx0dmFyIHN0eWxlICAgICAgID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKSxcblx0XHRcdHNjcmlwdCAgICAgID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3NjcmlwdCcpWzBdLFxuXHRcdFx0aW5mbyAgICAgICAgPSBudWxsO1xuXG5cdFx0c3R5bGUudHlwZSAgPSAndGV4dC9jc3MnO1xuXHRcdHN0eWxlLmlkICAgID0gJ21hdGNobWVkaWFqcy10ZXN0JztcblxuXHRcdHNjcmlwdC5wYXJlbnROb2RlLmluc2VydEJlZm9yZShzdHlsZSwgc2NyaXB0KTtcblxuXHRcdC8vICdzdHlsZS5jdXJyZW50U3R5bGUnIGlzIHVzZWQgYnkgSUUgPD0gOCBhbmQgJ3dpbmRvdy5nZXRDb21wdXRlZFN0eWxlJyBmb3IgYWxsIG90aGVyIGJyb3dzZXJzXG5cdFx0aW5mbyA9ICgnZ2V0Q29tcHV0ZWRTdHlsZScgaW4gd2luZG93KSAmJiB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShzdHlsZSwgbnVsbCkgfHwgc3R5bGUuY3VycmVudFN0eWxlO1xuXG5cdFx0c3R5bGVNZWRpYSA9IHtcblx0XHRcdG1hdGNoTWVkaXVtOiBmdW5jdGlvbihtZWRpYSkge1xuXHRcdFx0XHR2YXIgdGV4dCA9ICdAbWVkaWEgJyArIG1lZGlhICsgJ3sgI21hdGNobWVkaWFqcy10ZXN0IHsgd2lkdGg6IDFweDsgfSB9JztcblxuXHRcdFx0XHQvLyAnc3R5bGUuc3R5bGVTaGVldCcgaXMgdXNlZCBieSBJRSA8PSA4IGFuZCAnc3R5bGUudGV4dENvbnRlbnQnIGZvciBhbGwgb3RoZXIgYnJvd3NlcnNcblx0XHRcdFx0aWYgKHN0eWxlLnN0eWxlU2hlZXQpIHtcblx0XHRcdFx0XHRzdHlsZS5zdHlsZVNoZWV0LmNzc1RleHQgPSB0ZXh0O1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHN0eWxlLnRleHRDb250ZW50ID0gdGV4dDtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vIFRlc3QgaWYgbWVkaWEgcXVlcnkgaXMgdHJ1ZSBvciBmYWxzZVxuXHRcdFx0XHRyZXR1cm4gaW5mby53aWR0aCA9PT0gJzFweCc7XG5cdFx0XHR9XG5cdFx0fTtcblx0fVxuXG5cdHJldHVybiBmdW5jdGlvbihtZWRpYSkge1xuXHRcdHJldHVybiB7XG5cdFx0XHRtYXRjaGVzOiBzdHlsZU1lZGlhLm1hdGNoTWVkaXVtKG1lZGlhIHx8ICdhbGwnKSxcblx0XHRcdG1lZGlhOiBtZWRpYSB8fCAnYWxsJ1xuXHRcdH07XG5cdH07XG59KCkpO1xuLyohIFBpY3R1cmVmaWxsIC0gUmVzcG9uc2l2ZSBJbWFnZXMgdGhhdCB3b3JrIHRvZGF5LlxuKiAgQXV0aG9yOiBTY290dCBKZWhsLCBGaWxhbWVudCBHcm91cCwgMjAxMiAoIG5ldyBwcm9wb3NhbCBpbXBsZW1lbnRlZCBieSBTaGF3biBKYW5zZXBhciApXG4qICBMaWNlbnNlOiBNSVQvR1BMdjJcbiogIFNwZWM6IGh0dHA6Ly9waWN0dXJlLnJlc3BvbnNpdmVpbWFnZXMub3JnL1xuKi9cbihmdW5jdGlvbiggdywgZG9jLCBpbWFnZSApIHtcblx0Ly8gRW5hYmxlIHN0cmljdCBtb2RlXG5cdFwidXNlIHN0cmljdFwiO1xuXG5cdGZ1bmN0aW9uIGV4cG9zZShwaWN0dXJlZmlsbCkge1xuXHRcdC8qIGV4cG9zZSBwaWN0dXJlZmlsbCAqL1xuXHRcdGlmICggdHlwZW9mIG1vZHVsZSA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgbW9kdWxlLmV4cG9ydHMgPT09IFwib2JqZWN0XCIgKSB7XG5cdFx0XHQvLyBDb21tb25KUywganVzdCBleHBvcnRcblx0XHRcdG1vZHVsZS5leHBvcnRzID0gcGljdHVyZWZpbGw7XG5cdFx0fSBlbHNlIGlmICggdHlwZW9mIGRlZmluZSA9PT0gXCJmdW5jdGlvblwiICYmIGRlZmluZS5hbWQgKSB7XG5cdFx0XHQvLyBBTUQgc3VwcG9ydFxuXHRcdFx0ZGVmaW5lKCBcInBpY3R1cmVmaWxsXCIsIGZ1bmN0aW9uKCkgeyByZXR1cm4gcGljdHVyZWZpbGw7IH0gKTtcblx0XHR9XG5cdFx0aWYgKCB0eXBlb2YgdyA9PT0gXCJvYmplY3RcIiApIHtcblx0XHRcdC8vIElmIG5vIEFNRCBhbmQgd2UgYXJlIGluIHRoZSBicm93c2VyLCBhdHRhY2ggdG8gd2luZG93XG5cdFx0XHR3LnBpY3R1cmVmaWxsID0gcGljdHVyZWZpbGw7XG5cdFx0fVxuXHR9XG5cblx0Ly8gSWYgcGljdHVyZSBpcyBzdXBwb3J0ZWQsIHdlbGwsIHRoYXQncyBhd2Vzb21lLiBMZXQncyBnZXQgb3V0dGEgaGVyZS4uLlxuXHRpZiAoIHcuSFRNTFBpY3R1cmVFbGVtZW50ICkge1xuXHRcdGV4cG9zZShmdW5jdGlvbigpIHsgfSk7XG5cdFx0cmV0dXJuO1xuXHR9XG5cblx0Ly8gSFRNTCBzaGltfHYgaXQgZm9yIG9sZCBJRSAoSUU5IHdpbGwgc3RpbGwgbmVlZCB0aGUgSFRNTCB2aWRlbyB0YWcgd29ya2Fyb3VuZClcblx0ZG9jLmNyZWF0ZUVsZW1lbnQoIFwicGljdHVyZVwiICk7XG5cblx0Ly8gbG9jYWwgb2JqZWN0IGZvciBtZXRob2QgcmVmZXJlbmNlcyBhbmQgdGVzdGluZyBleHBvc3VyZVxuXHR2YXIgcGYgPSB3LnBpY3R1cmVmaWxsIHx8IHt9O1xuXG5cdHZhciByZWdXRGVzYyA9IC9cXHMrXFwrP1xcZCsoZVxcZCspP3cvO1xuXG5cdC8vIG5hbWVzcGFjZVxuXHRwZi5ucyA9IFwicGljdHVyZWZpbGxcIjtcblxuXHQvLyBzcmNzZXQgc3VwcG9ydCB0ZXN0XG5cdChmdW5jdGlvbigpIHtcblx0XHRwZi5zcmNzZXRTdXBwb3J0ZWQgPSBcInNyY3NldFwiIGluIGltYWdlO1xuXHRcdHBmLnNpemVzU3VwcG9ydGVkID0gXCJzaXplc1wiIGluIGltYWdlO1xuXHRcdHBmLmN1clNyY1N1cHBvcnRlZCA9IFwiY3VycmVudFNyY1wiIGluIGltYWdlO1xuXHR9KSgpO1xuXG5cdC8vIGp1c3QgYSBzdHJpbmcgdHJpbSB3b3JrYXJvdW5kXG5cdHBmLnRyaW0gPSBmdW5jdGlvbiggc3RyICkge1xuXHRcdHJldHVybiBzdHIudHJpbSA/IHN0ci50cmltKCkgOiBzdHIucmVwbGFjZSggL15cXHMrfFxccyskL2csIFwiXCIgKTtcblx0fTtcblxuXHQvKipcblx0ICogR2V0cyBhIHN0cmluZyBhbmQgcmV0dXJucyB0aGUgYWJzb2x1dGUgVVJMXG5cdCAqIEBwYXJhbSBzcmNcblx0ICogQHJldHVybnMge1N0cmluZ30gYWJzb2x1dGUgVVJMXG5cdCAqL1xuXHRwZi5tYWtlVXJsID0gKGZ1bmN0aW9uKCkge1xuXHRcdHZhciBhbmNob3IgPSBkb2MuY3JlYXRlRWxlbWVudCggXCJhXCIgKTtcblx0XHRyZXR1cm4gZnVuY3Rpb24oc3JjKSB7XG5cdFx0XHRhbmNob3IuaHJlZiA9IHNyYztcblx0XHRcdHJldHVybiBhbmNob3IuaHJlZjtcblx0XHR9O1xuXHR9KSgpO1xuXG5cdC8qKlxuXHQgKiBTaG9ydGN1dCBtZXRob2QgZm9yIGh0dHBzOi8vdzNjLmdpdGh1Yi5pby93ZWJhcHBzZWMvc3BlY3MvbWl4ZWRjb250ZW50LyNyZXN0cmljdHMtbWl4ZWQtY29udGVudCAoIGZvciBlYXN5IG92ZXJyaWRpbmcgaW4gdGVzdHMgKVxuXHQgKi9cblx0cGYucmVzdHJpY3RzTWl4ZWRDb250ZW50ID0gZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHcubG9jYXRpb24ucHJvdG9jb2wgPT09IFwiaHR0cHM6XCI7XG5cdH07XG5cdC8qKlxuXHQgKiBTaG9ydGN1dCBtZXRob2QgZm9yIG1hdGNoTWVkaWEgKCBmb3IgZWFzeSBvdmVycmlkaW5nIGluIHRlc3RzIClcblx0ICovXG5cblx0cGYubWF0Y2hlc01lZGlhID0gZnVuY3Rpb24oIG1lZGlhICkge1xuXHRcdHJldHVybiB3Lm1hdGNoTWVkaWEgJiYgdy5tYXRjaE1lZGlhKCBtZWRpYSApLm1hdGNoZXM7XG5cdH07XG5cblx0Ly8gU2hvcnRjdXQgbWV0aG9kIGZvciBgZGV2aWNlUGl4ZWxSYXRpb2AgKCBmb3IgZWFzeSBvdmVycmlkaW5nIGluIHRlc3RzIClcblx0cGYuZ2V0RHByID0gZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuICggdy5kZXZpY2VQaXhlbFJhdGlvIHx8IDEgKTtcblx0fTtcblxuXHQvKipcblx0ICogR2V0IHdpZHRoIGluIGNzcyBwaXhlbCB2YWx1ZSBmcm9tIGEgXCJsZW5ndGhcIiB2YWx1ZVxuXHQgKiBodHRwOi8vZGV2LnczLm9yZy9jc3N3Zy9jc3MtdmFsdWVzLTMvI2xlbmd0aC12YWx1ZVxuXHQgKi9cblx0cGYuZ2V0V2lkdGhGcm9tTGVuZ3RoID0gZnVuY3Rpb24oIGxlbmd0aCApIHtcblx0XHR2YXIgY3NzVmFsdWU7XG5cdFx0Ly8gSWYgYSBsZW5ndGggaXMgc3BlY2lmaWVkIGFuZCBkb2VzbuKAmXQgY29udGFpbiBhIHBlcmNlbnRhZ2UsIGFuZCBpdCBpcyBncmVhdGVyIHRoYW4gMCBvciB1c2luZyBgY2FsY2AsIHVzZSBpdC4gRWxzZSwgYWJvcnQuXG4gICAgICAgIGlmICggIShsZW5ndGggJiYgbGVuZ3RoLmluZGV4T2YoIFwiJVwiICkgPiAtMSA9PT0gZmFsc2UgJiYgKCBwYXJzZUZsb2F0KCBsZW5ndGggKSA+IDAgfHwgbGVuZ3RoLmluZGV4T2YoIFwiY2FsYyhcIiApID4gLTEgKSkgKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuXHRcdC8qKlxuXHRcdCAqIElmIGxlbmd0aCBpcyBzcGVjaWZpZWQgaW4gIGB2d2AgdW5pdHMsIHVzZSBgJWAgaW5zdGVhZCBzaW5jZSB0aGUgZGl2IHdl4oCZcmUgbWVhc3VyaW5nXG5cdFx0ICogaXMgaW5qZWN0ZWQgYXQgdGhlIHRvcCBvZiB0aGUgZG9jdW1lbnQuXG5cdFx0ICpcblx0XHQgKiBUT0RPOiBtYXliZSB3ZSBzaG91bGQgcHV0IHRoaXMgYmVoaW5kIGEgZmVhdHVyZSB0ZXN0IGZvciBgdndgPyBUaGUgcmlzayBvZiBkb2luZyB0aGlzIGlzIHBvc3NpYmxlIGJyb3dzZXIgaW5jb25zaXN0YW5jaWVzIHdpdGggdncgdnMgJVxuXHRcdCAqL1xuXHRcdGxlbmd0aCA9IGxlbmd0aC5yZXBsYWNlKCBcInZ3XCIsIFwiJVwiICk7XG5cblx0XHQvLyBDcmVhdGUgYSBjYWNoZWQgZWxlbWVudCBmb3IgZ2V0dGluZyBsZW5ndGggdmFsdWUgd2lkdGhzXG5cdFx0aWYgKCAhcGYubGVuZ3RoRWwgKSB7XG5cdFx0XHRwZi5sZW5ndGhFbCA9IGRvYy5jcmVhdGVFbGVtZW50KCBcImRpdlwiICk7XG5cblx0XHRcdC8vIFBvc2l0aW9uaW5nIHN0eWxlcyBoZWxwIHByZXZlbnQgcGFkZGluZy9tYXJnaW4vd2lkdGggb24gYGh0bWxgIG9yIGBib2R5YCBmcm9tIHRocm93aW5nIGNhbGN1bGF0aW9ucyBvZmYuXG5cdFx0XHRwZi5sZW5ndGhFbC5zdHlsZS5jc3NUZXh0ID0gXCJib3JkZXI6MDtkaXNwbGF5OmJsb2NrO2ZvbnQtc2l6ZToxZW07bGVmdDowO21hcmdpbjowO3BhZGRpbmc6MDtwb3NpdGlvbjphYnNvbHV0ZTt2aXNpYmlsaXR5OmhpZGRlblwiO1xuXG5cdFx0XHQvLyBBZGQgYSBjbGFzcywgc28gdGhhdCBldmVyeW9uZSBrbm93cyB3aGVyZSB0aGlzIGVsZW1lbnQgY29tZXMgZnJvbVxuXHRcdFx0cGYubGVuZ3RoRWwuY2xhc3NOYW1lID0gXCJoZWxwZXItZnJvbS1waWN0dXJlZmlsbC1qc1wiO1xuXHRcdH1cblxuXHRcdHBmLmxlbmd0aEVsLnN0eWxlLndpZHRoID0gXCIwcHhcIjtcblxuICAgICAgICB0cnkge1xuXHRcdCAgICBwZi5sZW5ndGhFbC5zdHlsZS53aWR0aCA9IGxlbmd0aDtcbiAgICAgICAgfSBjYXRjaCAoIGUgKSB7fVxuXG5cdFx0ZG9jLmJvZHkuYXBwZW5kQ2hpbGQocGYubGVuZ3RoRWwpO1xuXG5cdFx0Y3NzVmFsdWUgPSBwZi5sZW5ndGhFbC5vZmZzZXRXaWR0aDtcblxuXHRcdGlmICggY3NzVmFsdWUgPD0gMCApIHtcblx0XHRcdGNzc1ZhbHVlID0gZmFsc2U7XG5cdFx0fVxuXG5cdFx0ZG9jLmJvZHkucmVtb3ZlQ2hpbGQoIHBmLmxlbmd0aEVsICk7XG5cblx0XHRyZXR1cm4gY3NzVmFsdWU7XG5cdH07XG5cbiAgICBwZi5kZXRlY3RUeXBlU3VwcG9ydCA9IGZ1bmN0aW9uKCB0eXBlLCB0eXBlVXJpICkge1xuICAgICAgICAvLyBiYXNlZCBvbiBNb2Rlcm5penIncyBsb3NzbGVzcyBpbWctd2VicCB0ZXN0XG4gICAgICAgIC8vIG5vdGU6IGFzeW5jaHJvbm91c1xuICAgICAgICB2YXIgaW1hZ2UgPSBuZXcgdy5JbWFnZSgpO1xuICAgICAgICBpbWFnZS5vbmVycm9yID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBwZi50eXBlc1sgdHlwZSBdID0gZmFsc2U7XG4gICAgICAgICAgICBwaWN0dXJlZmlsbCgpO1xuICAgICAgICB9O1xuICAgICAgICBpbWFnZS5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHBmLnR5cGVzWyB0eXBlIF0gPSBpbWFnZS53aWR0aCA9PT0gMTtcbiAgICAgICAgICAgIHBpY3R1cmVmaWxsKCk7XG4gICAgICAgIH07XG4gICAgICAgIGltYWdlLnNyYyA9IHR5cGVVcmk7XG5cbiAgICAgICAgcmV0dXJuIFwicGVuZGluZ1wiO1xuICAgIH07XG5cdC8vIGNvbnRhaW5lciBvZiBzdXBwb3J0ZWQgbWltZSB0eXBlcyB0aGF0IG9uZSBtaWdodCBuZWVkIHRvIHF1YWxpZnkgYmVmb3JlIHVzaW5nXG5cdHBmLnR5cGVzID0gcGYudHlwZXMgfHwge307XG5cblx0cGYuaW5pdFR5cGVEZXRlY3RzID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIC8vIEFkZCBzdXBwb3J0IGZvciBzdGFuZGFyZCBtaW1lIHR5cGVzXG4gICAgICAgIHBmLnR5cGVzWyBcImltYWdlL2pwZWdcIiBdID0gdHJ1ZTtcbiAgICAgICAgcGYudHlwZXNbIFwiaW1hZ2UvZ2lmXCIgXSA9IHRydWU7XG4gICAgICAgIHBmLnR5cGVzWyBcImltYWdlL3BuZ1wiIF0gPSB0cnVlO1xuICAgICAgICBwZi50eXBlc1sgXCJpbWFnZS9zdmcreG1sXCIgXSA9IGRvYy5pbXBsZW1lbnRhdGlvbi5oYXNGZWF0dXJlKFwiaHR0cDovL3d3dy53My5vcmcvVFIvU1ZHMTEvZmVhdHVyZSNJbWFnZVwiLCBcIjEuMVwiKTtcbiAgICAgICAgcGYudHlwZXNbIFwiaW1hZ2Uvd2VicFwiIF0gPSBwZi5kZXRlY3RUeXBlU3VwcG9ydChcImltYWdlL3dlYnBcIiwgXCJkYXRhOmltYWdlL3dlYnA7YmFzZTY0LFVrbEdSaDRBQUFCWFJVSlFWbEE0VEJFQUFBQXZBQUFBQUFmUS8vNzN2LytCaU9oL0FBQT1cIik7XG4gICAgfTtcblxuXHRwZi52ZXJpZnlUeXBlU3VwcG9ydCA9IGZ1bmN0aW9uKCBzb3VyY2UgKSB7XG5cdFx0dmFyIHR5cGUgPSBzb3VyY2UuZ2V0QXR0cmlidXRlKCBcInR5cGVcIiApO1xuXHRcdC8vIGlmIHR5cGUgYXR0cmlidXRlIGV4aXN0cywgcmV0dXJuIHRlc3QgcmVzdWx0LCBvdGhlcndpc2UgcmV0dXJuIHRydWVcblx0XHRpZiAoIHR5cGUgPT09IG51bGwgfHwgdHlwZSA9PT0gXCJcIiApIHtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRcdHZhciBwZlR5cGUgPSBwZi50eXBlc1sgdHlwZSBdO1xuXHRcdFx0Ly8gaWYgdGhlIHR5cGUgdGVzdCBpcyBhIGZ1bmN0aW9uLCBydW4gaXQgYW5kIHJldHVybiBcInBlbmRpbmdcIiBzdGF0dXMuIFRoZSBmdW5jdGlvbiB3aWxsIHJlcnVuIHBpY3R1cmVmaWxsIG9uIHBlbmRpbmcgZWxlbWVudHMgb25jZSBmaW5pc2hlZC5cblx0XHRcdGlmICggdHlwZW9mIHBmVHlwZSA9PT0gXCJzdHJpbmdcIiAmJiBwZlR5cGUgIT09IFwicGVuZGluZ1wiKSB7XG5cdFx0XHRcdHBmLnR5cGVzWyB0eXBlIF0gPSBwZi5kZXRlY3RUeXBlU3VwcG9ydCggdHlwZSwgcGZUeXBlICk7XG5cdFx0XHRcdHJldHVybiBcInBlbmRpbmdcIjtcblx0XHRcdH0gZWxzZSBpZiAoIHR5cGVvZiBwZlR5cGUgPT09IFwiZnVuY3Rpb25cIiApIHtcblx0XHRcdFx0cGZUeXBlKCk7XG5cdFx0XHRcdHJldHVybiBcInBlbmRpbmdcIjtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHJldHVybiBwZlR5cGU7XG5cdFx0XHR9XG5cdFx0fVxuXHR9O1xuXG5cdC8vIFBhcnNlcyBhbiBpbmRpdmlkdWFsIGBzaXplYCBhbmQgcmV0dXJucyB0aGUgbGVuZ3RoLCBhbmQgb3B0aW9uYWwgbWVkaWEgcXVlcnlcblx0cGYucGFyc2VTaXplID0gZnVuY3Rpb24oIHNvdXJjZVNpemVTdHIgKSB7XG5cdFx0dmFyIG1hdGNoID0gLyhcXChbXildK1xcKSk/XFxzKiguKykvZy5leGVjKCBzb3VyY2VTaXplU3RyICk7XG5cdFx0cmV0dXJuIHtcblx0XHRcdG1lZGlhOiBtYXRjaCAmJiBtYXRjaFsxXSxcblx0XHRcdGxlbmd0aDogbWF0Y2ggJiYgbWF0Y2hbMl1cblx0XHR9O1xuXHR9O1xuXG5cdC8vIFRha2VzIGEgc3RyaW5nIG9mIHNpemVzIGFuZCByZXR1cm5zIHRoZSB3aWR0aCBpbiBwaXhlbHMgYXMgYSBudW1iZXJcblx0cGYuZmluZFdpZHRoRnJvbVNvdXJjZVNpemUgPSBmdW5jdGlvbiggc291cmNlU2l6ZUxpc3RTdHIgKSB7XG5cdFx0Ly8gU3BsaXQgdXAgc291cmNlIHNpemUgbGlzdCwgaWUgKCBtYXgtd2lkdGg6IDMwZW0gKSAxMDAlLCAoIG1heC13aWR0aDogNTBlbSApIDUwJSwgMzMlXG5cdFx0Ly8gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3IgKG1pbi13aWR0aDozMGVtKSBjYWxjKDMwJSAtIDE1cHgpXG5cdFx0dmFyIHNvdXJjZVNpemVMaXN0ID0gcGYudHJpbSggc291cmNlU2l6ZUxpc3RTdHIgKS5zcGxpdCggL1xccyosXFxzKi8gKSxcblx0XHRcdHdpbm5pbmdMZW5ndGg7XG5cblx0XHRmb3IgKCB2YXIgaSA9IDAsIGxlbiA9IHNvdXJjZVNpemVMaXN0Lmxlbmd0aDsgaSA8IGxlbjsgaSsrICkge1xuXHRcdFx0Ly8gTWF0Y2ggPG1lZGlhLWNvbmRpdGlvbj4/IGxlbmd0aCwgaWUgKCBtaW4td2lkdGg6IDUwZW0gKSAxMDAlXG5cdFx0XHR2YXIgc291cmNlU2l6ZSA9IHNvdXJjZVNpemVMaXN0WyBpIF0sXG5cdFx0XHRcdC8vIFNwbGl0IFwiKCBtaW4td2lkdGg6IDUwZW0gKSAxMDAlXCIgaW50byBzZXBhcmF0ZSBzdHJpbmdzXG5cdFx0XHRcdHBhcnNlZFNpemUgPSBwZi5wYXJzZVNpemUoIHNvdXJjZVNpemUgKSxcblx0XHRcdFx0bGVuZ3RoID0gcGFyc2VkU2l6ZS5sZW5ndGgsXG5cdFx0XHRcdG1lZGlhID0gcGFyc2VkU2l6ZS5tZWRpYTtcblxuXHRcdFx0aWYgKCAhbGVuZ3RoICkge1xuXHRcdFx0XHRjb250aW51ZTtcblx0XHRcdH1cblx0XHRcdC8vIGlmIHRoZXJlIGlzIG5vIG1lZGlhIHF1ZXJ5IG9yIGl0IG1hdGNoZXMsIGNob29zZSB0aGlzIGFzIG91ciB3aW5uaW5nIGxlbmd0aFxuXHRcdFx0aWYgKCAoIW1lZGlhIHx8IHBmLm1hdGNoZXNNZWRpYSggbWVkaWEgKSkgJiZcblx0XHRcdFx0Ly8gcGFzcyB0aGUgbGVuZ3RoIHRvIGEgbWV0aG9kIHRoYXQgY2FuIHByb3Blcmx5IGRldGVybWluZSBsZW5ndGhcblx0XHRcdFx0Ly8gaW4gcGl4ZWxzIGJhc2VkIG9uIHRoZXNlIGZvcm1hdHM6IGh0dHA6Ly9kZXYudzMub3JnL2Nzc3dnL2Nzcy12YWx1ZXMtMy8jbGVuZ3RoLXZhbHVlXG5cdFx0XHRcdCh3aW5uaW5nTGVuZ3RoID0gcGYuZ2V0V2lkdGhGcm9tTGVuZ3RoKCBsZW5ndGggKSkgKSB7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8vaWYgd2UgaGF2ZSBubyB3aW5uaW5nTGVuZ3RoIGZhbGxiYWNrIHRvIDEwMHZ3XG5cdFx0cmV0dXJuIHdpbm5pbmdMZW5ndGggfHwgTWF0aC5tYXgody5pbm5lcldpZHRoIHx8IDAsIGRvYy5kb2N1bWVudEVsZW1lbnQuY2xpZW50V2lkdGgpO1xuXHR9O1xuXG5cdHBmLnBhcnNlU3Jjc2V0ID0gZnVuY3Rpb24oIHNyY3NldCApIHtcblx0XHQvKipcblx0XHQgKiBBIGxvdCBvZiB0aGlzIHdhcyBwdWxsZWQgZnJvbSBCb3JpcyBTbXVz4oCZIHBhcnNlciBmb3IgdGhlIG5vdy1kZWZ1bmN0IFdIQVRXRyBgc3Jjc2V0YFxuXHRcdCAqIGh0dHBzOi8vZ2l0aHViLmNvbS9ib3Jpc211cy9zcmNzZXQtcG9seWZpbGwvYmxvYi9tYXN0ZXIvanMvc3Jjc2V0LWluZm8uanNcblx0XHQgKlxuXHRcdCAqIDEuIExldCBpbnB1dCAoYHNyY3NldGApIGJlIHRoZSB2YWx1ZSBwYXNzZWQgdG8gdGhpcyBhbGdvcml0aG0uXG5cdFx0ICogMi4gTGV0IHBvc2l0aW9uIGJlIGEgcG9pbnRlciBpbnRvIGlucHV0LCBpbml0aWFsbHkgcG9pbnRpbmcgYXQgdGhlIHN0YXJ0IG9mIHRoZSBzdHJpbmcuXG5cdFx0ICogMy4gTGV0IHJhdyBjYW5kaWRhdGVzIGJlIGFuIGluaXRpYWxseSBlbXB0eSBvcmRlcmVkIGxpc3Qgb2YgVVJMcyB3aXRoIGFzc29jaWF0ZWRcblx0XHQgKiAgICB1bnBhcnNlZCBkZXNjcmlwdG9ycy4gVGhlIG9yZGVyIG9mIGVudHJpZXMgaW4gdGhlIGxpc3QgaXMgdGhlIG9yZGVyIGluIHdoaWNoIGVudHJpZXNcblx0XHQgKiAgICBhcmUgYWRkZWQgdG8gdGhlIGxpc3QuXG5cdFx0ICovXG5cdFx0dmFyIGNhbmRpZGF0ZXMgPSBbXTtcblxuXHRcdHdoaWxlICggc3Jjc2V0ICE9PSBcIlwiICkge1xuXHRcdFx0c3Jjc2V0ID0gc3Jjc2V0LnJlcGxhY2UoIC9eXFxzKy9nLCBcIlwiICk7XG5cblx0XHRcdC8vIDUuIENvbGxlY3QgYSBzZXF1ZW5jZSBvZiBjaGFyYWN0ZXJzIHRoYXQgYXJlIG5vdCBzcGFjZSBjaGFyYWN0ZXJzLCBhbmQgbGV0IHRoYXQgYmUgdXJsLlxuXHRcdFx0dmFyIHBvcyA9IHNyY3NldC5zZWFyY2goL1xccy9nKSxcblx0XHRcdFx0dXJsLCBkZXNjcmlwdG9yID0gbnVsbDtcblxuXHRcdFx0aWYgKCBwb3MgIT09IC0xICkge1xuXHRcdFx0XHR1cmwgPSBzcmNzZXQuc2xpY2UoIDAsIHBvcyApO1xuXG5cdFx0XHRcdHZhciBsYXN0ID0gdXJsLnNsaWNlKC0xKTtcblxuXHRcdFx0XHQvLyA2LiBJZiB1cmwgZW5kcyB3aXRoIGEgVSswMDJDIENPTU1BIGNoYXJhY3RlciAoLCksIHJlbW92ZSB0aGF0IGNoYXJhY3RlciBmcm9tIHVybFxuXHRcdFx0XHQvLyBhbmQgbGV0IGRlc2NyaXB0b3JzIGJlIHRoZSBlbXB0eSBzdHJpbmcuIE90aGVyd2lzZSwgZm9sbG93IHRoZXNlIHN1YnN0ZXBzXG5cdFx0XHRcdC8vIDYuMS4gSWYgdXJsIGlzIGVtcHR5LCB0aGVuIGp1bXAgdG8gdGhlIHN0ZXAgbGFiZWxlZCBkZXNjcmlwdG9yIHBhcnNlci5cblxuXHRcdFx0XHRpZiAoIGxhc3QgPT09IFwiLFwiIHx8IHVybCA9PT0gXCJcIiApIHtcblx0XHRcdFx0XHR1cmwgPSB1cmwucmVwbGFjZSggLywrJC8sIFwiXCIgKTtcblx0XHRcdFx0XHRkZXNjcmlwdG9yID0gXCJcIjtcblx0XHRcdFx0fVxuXHRcdFx0XHRzcmNzZXQgPSBzcmNzZXQuc2xpY2UoIHBvcyArIDEgKTtcblxuXHRcdFx0XHQvLyA2LjIuIENvbGxlY3QgYSBzZXF1ZW5jZSBvZiBjaGFyYWN0ZXJzIHRoYXQgYXJlIG5vdCBVKzAwMkMgQ09NTUEgY2hhcmFjdGVycyAoLCksIGFuZFxuXHRcdFx0XHQvLyBsZXQgdGhhdCBiZSBkZXNjcmlwdG9ycy5cblx0XHRcdFx0aWYgKCBkZXNjcmlwdG9yID09PSBudWxsICkge1xuXHRcdFx0XHRcdHZhciBkZXNjcG9zID0gc3Jjc2V0LmluZGV4T2YoIFwiLFwiICk7XG5cdFx0XHRcdFx0aWYgKCBkZXNjcG9zICE9PSAtMSApIHtcblx0XHRcdFx0XHRcdGRlc2NyaXB0b3IgPSBzcmNzZXQuc2xpY2UoIDAsIGRlc2Nwb3MgKTtcblx0XHRcdFx0XHRcdHNyY3NldCA9IHNyY3NldC5zbGljZSggZGVzY3BvcyArIDEgKTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0ZGVzY3JpcHRvciA9IHNyY3NldDtcblx0XHRcdFx0XHRcdHNyY3NldCA9IFwiXCI7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR1cmwgPSBzcmNzZXQ7XG5cdFx0XHRcdHNyY3NldCA9IFwiXCI7XG5cdFx0XHR9XG5cblx0XHRcdC8vIDcuIEFkZCB1cmwgdG8gcmF3IGNhbmRpZGF0ZXMsIGFzc29jaWF0ZWQgd2l0aCBkZXNjcmlwdG9ycy5cblx0XHRcdGlmICggdXJsIHx8IGRlc2NyaXB0b3IgKSB7XG5cdFx0XHRcdGNhbmRpZGF0ZXMucHVzaCh7XG5cdFx0XHRcdFx0dXJsOiB1cmwsXG5cdFx0XHRcdFx0ZGVzY3JpcHRvcjogZGVzY3JpcHRvclxuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIGNhbmRpZGF0ZXM7XG5cdH07XG5cblx0cGYucGFyc2VEZXNjcmlwdG9yID0gZnVuY3Rpb24oIGRlc2NyaXB0b3IsIHNpemVzYXR0ciApIHtcblx0XHQvLyAxMS4gRGVzY3JpcHRvciBwYXJzZXI6IExldCBjYW5kaWRhdGVzIGJlIGFuIGluaXRpYWxseSBlbXB0eSBzb3VyY2Ugc2V0LiBUaGUgb3JkZXIgb2YgZW50cmllcyBpbiB0aGUgbGlzdFxuXHRcdC8vIGlzIHRoZSBvcmRlciBpbiB3aGljaCBlbnRyaWVzIGFyZSBhZGRlZCB0byB0aGUgbGlzdC5cblx0XHR2YXIgc2l6ZXMgPSBzaXplc2F0dHIgfHwgXCIxMDB2d1wiLFxuXHRcdFx0c2l6ZURlc2NyaXB0b3IgPSBkZXNjcmlwdG9yICYmIGRlc2NyaXB0b3IucmVwbGFjZSggLyheXFxzK3xcXHMrJCkvZywgXCJcIiApLFxuXHRcdFx0d2lkdGhJbkNzc1BpeGVscyA9IHBmLmZpbmRXaWR0aEZyb21Tb3VyY2VTaXplKCBzaXplcyApLFxuXHRcdFx0cmVzQ2FuZGlkYXRlO1xuXG5cdFx0XHRpZiAoIHNpemVEZXNjcmlwdG9yICkge1xuXHRcdFx0XHR2YXIgc3BsaXREZXNjcmlwdG9yID0gc2l6ZURlc2NyaXB0b3Iuc3BsaXQoXCIgXCIpO1xuXG5cdFx0XHRcdGZvciAodmFyIGkgPSBzcGxpdERlc2NyaXB0b3IubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcblx0XHRcdFx0XHR2YXIgY3VyciA9IHNwbGl0RGVzY3JpcHRvclsgaSBdLFxuXHRcdFx0XHRcdFx0bGFzdGNoYXIgPSBjdXJyICYmIGN1cnIuc2xpY2UoIGN1cnIubGVuZ3RoIC0gMSApO1xuXG5cdFx0XHRcdFx0aWYgKCAoIGxhc3RjaGFyID09PSBcImhcIiB8fCBsYXN0Y2hhciA9PT0gXCJ3XCIgKSAmJiAhcGYuc2l6ZXNTdXBwb3J0ZWQgKSB7XG5cdFx0XHRcdFx0XHRyZXNDYW5kaWRhdGUgPSBwYXJzZUZsb2F0KCAoIHBhcnNlSW50KCBjdXJyLCAxMCApIC8gd2lkdGhJbkNzc1BpeGVscyApICk7XG5cdFx0XHRcdFx0fSBlbHNlIGlmICggbGFzdGNoYXIgPT09IFwieFwiICkge1xuXHRcdFx0XHRcdFx0dmFyIHJlcyA9IGN1cnIgJiYgcGFyc2VGbG9hdCggY3VyciwgMTAgKTtcblx0XHRcdFx0XHRcdHJlc0NhbmRpZGF0ZSA9IHJlcyAmJiAhaXNOYU4oIHJlcyApID8gcmVzIDogMTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRyZXR1cm4gcmVzQ2FuZGlkYXRlIHx8IDE7XG5cdH07XG5cblx0LyoqXG5cdCAqIFRha2VzIGEgc3Jjc2V0IGluIHRoZSBmb3JtIG9mIHVybC9cblx0ICogZXguIFwiaW1hZ2VzL3BpYy1tZWRpdW0ucG5nIDF4LCBpbWFnZXMvcGljLW1lZGl1bS0yeC5wbmcgMnhcIiBvclxuXHQgKiAgICAgXCJpbWFnZXMvcGljLW1lZGl1bS5wbmcgNDAwdywgaW1hZ2VzL3BpYy1tZWRpdW0tMngucG5nIDgwMHdcIiBvclxuXHQgKiAgICAgXCJpbWFnZXMvcGljLXNtYWxsLnBuZ1wiXG5cdCAqIEdldCBhbiBhcnJheSBvZiBpbWFnZSBjYW5kaWRhdGVzIGluIHRoZSBmb3JtIG9mXG5cdCAqICAgICAge3VybDogXCIvZm9vL2Jhci5wbmdcIiwgcmVzb2x1dGlvbjogMX1cblx0ICogd2hlcmUgcmVzb2x1dGlvbiBpcyBodHRwOi8vZGV2LnczLm9yZy9jc3N3Zy9jc3MtdmFsdWVzLTMvI3Jlc29sdXRpb24tdmFsdWVcblx0ICogSWYgc2l6ZXMgaXMgc3BlY2lmaWVkLCByZXNvbHV0aW9uIGlzIGNhbGN1bGF0ZWRcblx0ICovXG5cdHBmLmdldENhbmRpZGF0ZXNGcm9tU291cmNlU2V0ID0gZnVuY3Rpb24oIHNyY3NldCwgc2l6ZXMgKSB7XG5cdFx0dmFyIGNhbmRpZGF0ZXMgPSBwZi5wYXJzZVNyY3NldCggc3Jjc2V0ICksXG5cdFx0XHRmb3JtYXR0ZWRDYW5kaWRhdGVzID0gW107XG5cblx0XHRmb3IgKCB2YXIgaSA9IDAsIGxlbiA9IGNhbmRpZGF0ZXMubGVuZ3RoOyBpIDwgbGVuOyBpKysgKSB7XG5cdFx0XHR2YXIgY2FuZGlkYXRlID0gY2FuZGlkYXRlc1sgaSBdO1xuXG5cdFx0XHRmb3JtYXR0ZWRDYW5kaWRhdGVzLnB1c2goe1xuXHRcdFx0XHR1cmw6IGNhbmRpZGF0ZS51cmwsXG5cdFx0XHRcdHJlc29sdXRpb246IHBmLnBhcnNlRGVzY3JpcHRvciggY2FuZGlkYXRlLmRlc2NyaXB0b3IsIHNpemVzIClcblx0XHRcdH0pO1xuXHRcdH1cblx0XHRyZXR1cm4gZm9ybWF0dGVkQ2FuZGlkYXRlcztcblx0fTtcblxuXHQvKipcblx0ICogaWYgaXQncyBhbiBpbWcgZWxlbWVudCBhbmQgaXQgaGFzIGEgc3Jjc2V0IHByb3BlcnR5LFxuXHQgKiB3ZSBuZWVkIHRvIHJlbW92ZSB0aGUgYXR0cmlidXRlIHNvIHdlIGNhbiBtYW5pcHVsYXRlIHNyY1xuXHQgKiAodGhlIHByb3BlcnR5J3MgZXhpc3RlbmNlIGluZmVycyBuYXRpdmUgc3Jjc2V0IHN1cHBvcnQsIGFuZCBhIHNyY3NldC1zdXBwb3J0aW5nIGJyb3dzZXIgd2lsbCBwcmlvcml0aXplIHNyY3NldCdzIHZhbHVlIG92ZXIgb3VyIHdpbm5pbmcgcGljdHVyZSBjYW5kaWRhdGUpXG5cdCAqIHRoaXMgbW92ZXMgc3Jjc2V0J3MgdmFsdWUgdG8gbWVtb3J5IGZvciBsYXRlciB1c2UgYW5kIHJlbW92ZXMgdGhlIGF0dHJcblx0ICovXG5cdHBmLmRvZGdlU3Jjc2V0ID0gZnVuY3Rpb24oIGltZyApIHtcblx0XHRpZiAoIGltZy5zcmNzZXQgKSB7XG5cdFx0XHRpbWdbIHBmLm5zIF0uc3Jjc2V0ID0gaW1nLnNyY3NldDtcblx0XHRcdGltZy5zcmNzZXQgPSBcIlwiO1xuXHRcdFx0aW1nLnNldEF0dHJpYnV0ZSggXCJkYXRhLXBmc3Jjc2V0XCIsIGltZ1sgcGYubnMgXS5zcmNzZXQgKTtcblx0XHR9XG5cdH07XG5cblx0Ly8gQWNjZXB0IGEgc291cmNlIG9yIGltZyBlbGVtZW50IGFuZCBwcm9jZXNzIGl0cyBzcmNzZXQgYW5kIHNpemVzIGF0dHJzXG5cdHBmLnByb2Nlc3NTb3VyY2VTZXQgPSBmdW5jdGlvbiggZWwgKSB7XG5cdFx0dmFyIHNyY3NldCA9IGVsLmdldEF0dHJpYnV0ZSggXCJzcmNzZXRcIiApLFxuXHRcdFx0c2l6ZXMgPSBlbC5nZXRBdHRyaWJ1dGUoIFwic2l6ZXNcIiApLFxuXHRcdFx0Y2FuZGlkYXRlcyA9IFtdO1xuXG5cdFx0Ly8gaWYgaXQncyBhbiBpbWcgZWxlbWVudCwgdXNlIHRoZSBjYWNoZWQgc3Jjc2V0IHByb3BlcnR5IChkZWZpbmVkIG9yIG5vdClcblx0XHRpZiAoIGVsLm5vZGVOYW1lLnRvVXBwZXJDYXNlKCkgPT09IFwiSU1HXCIgJiYgZWxbIHBmLm5zIF0gJiYgZWxbIHBmLm5zIF0uc3Jjc2V0ICkge1xuXHRcdFx0c3Jjc2V0ID0gZWxbIHBmLm5zIF0uc3Jjc2V0O1xuXHRcdH1cblxuXHRcdGlmICggc3Jjc2V0ICkge1xuXHRcdFx0Y2FuZGlkYXRlcyA9IHBmLmdldENhbmRpZGF0ZXNGcm9tU291cmNlU2V0KCBzcmNzZXQsIHNpemVzICk7XG5cdFx0fVxuXHRcdHJldHVybiBjYW5kaWRhdGVzO1xuXHR9O1xuXG5cdHBmLmJhY2tmYWNlVmlzaWJpbGl0eUZpeCA9IGZ1bmN0aW9uKCBwaWNJbWcgKSB7XG5cdFx0Ly8gU2VlOiBodHRwczovL2dpdGh1Yi5jb20vc2NvdHRqZWhsL3BpY3R1cmVmaWxsL2lzc3Vlcy8zMzJcblx0XHR2YXIgc3R5bGUgPSBwaWNJbWcuc3R5bGUgfHwge30sXG5cdFx0XHRXZWJraXRCYWNrZmFjZVZpc2liaWxpdHkgPSBcIndlYmtpdEJhY2tmYWNlVmlzaWJpbGl0eVwiIGluIHN0eWxlLFxuXHRcdFx0Y3VycmVudFpvb20gPSBzdHlsZS56b29tO1xuXG5cdFx0aWYgKFdlYmtpdEJhY2tmYWNlVmlzaWJpbGl0eSkge1xuXHRcdFx0c3R5bGUuem9vbSA9IFwiLjk5OVwiO1xuXG5cdFx0XHRXZWJraXRCYWNrZmFjZVZpc2liaWxpdHkgPSBwaWNJbWcub2Zmc2V0V2lkdGg7XG5cblx0XHRcdHN0eWxlLnpvb20gPSBjdXJyZW50Wm9vbTtcblx0XHR9XG5cdH07XG5cblx0cGYuc2V0SW50cmluc2ljU2l6ZSA9IChmdW5jdGlvbigpIHtcblx0XHR2YXIgdXJsQ2FjaGUgPSB7fTtcblx0XHR2YXIgc2V0U2l6ZSA9IGZ1bmN0aW9uKCBwaWNJbWcsIHdpZHRoLCByZXMgKSB7XG4gICAgICAgICAgICBpZiAoIHdpZHRoICkge1xuXHRcdFx0ICAgIHBpY0ltZy5zZXRBdHRyaWJ1dGUoIFwid2lkdGhcIiwgcGFyc2VJbnQod2lkdGggLyByZXMsIDEwKSApO1xuICAgICAgICAgICAgfVxuXHRcdH07XG5cdFx0cmV0dXJuIGZ1bmN0aW9uKCBwaWNJbWcsIGJlc3RDYW5kaWRhdGUgKSB7XG5cdFx0XHR2YXIgaW1nO1xuXHRcdFx0aWYgKCAhcGljSW1nWyBwZi5ucyBdIHx8IHcucGZTdG9wSW50cmluc2ljU2l6ZSApIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0aWYgKCBwaWNJbWdbIHBmLm5zIF0uZGltcyA9PT0gdW5kZWZpbmVkICkge1xuXHRcdFx0XHRwaWNJbWdbIHBmLm5zXS5kaW1zID0gcGljSW1nLmdldEF0dHJpYnV0ZShcIndpZHRoXCIpIHx8IHBpY0ltZy5nZXRBdHRyaWJ1dGUoXCJoZWlnaHRcIik7XG5cdFx0XHR9XG5cdFx0XHRpZiAoIHBpY0ltZ1sgcGYubnNdLmRpbXMgKSB7IHJldHVybjsgfVxuXG5cdFx0XHRpZiAoIGJlc3RDYW5kaWRhdGUudXJsIGluIHVybENhY2hlICkge1xuXHRcdFx0XHRzZXRTaXplKCBwaWNJbWcsIHVybENhY2hlW2Jlc3RDYW5kaWRhdGUudXJsXSwgYmVzdENhbmRpZGF0ZS5yZXNvbHV0aW9uICk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRpbWcgPSBkb2MuY3JlYXRlRWxlbWVudCggXCJpbWdcIiApO1xuXHRcdFx0XHRpbWcub25sb2FkID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0dXJsQ2FjaGVbYmVzdENhbmRpZGF0ZS51cmxdID0gaW1nLndpZHRoO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vSUUgMTAvMTEgZG9uJ3QgY2FsY3VsYXRlIHdpZHRoIGZvciBzdmcgb3V0c2lkZSBkb2N1bWVudFxuICAgICAgICAgICAgICAgICAgICBpZiAoICF1cmxDYWNoZVtiZXN0Q2FuZGlkYXRlLnVybF0gKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvYy5ib2R5LmFwcGVuZENoaWxkKCBpbWcgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cmxDYWNoZVtiZXN0Q2FuZGlkYXRlLnVybF0gPSBpbWcud2lkdGggfHwgaW1nLm9mZnNldFdpZHRoO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvYy5ib2R5LnJlbW92ZUNoaWxkKCBpbWcgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gY2F0Y2goZSl7fVxuICAgICAgICAgICAgICAgICAgICB9XG5cblx0XHRcdFx0XHRpZiAoIHBpY0ltZy5zcmMgPT09IGJlc3RDYW5kaWRhdGUudXJsICkge1xuXHRcdFx0XHRcdFx0c2V0U2l6ZSggcGljSW1nLCB1cmxDYWNoZVtiZXN0Q2FuZGlkYXRlLnVybF0sIGJlc3RDYW5kaWRhdGUucmVzb2x1dGlvbiApO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRwaWNJbWcgPSBudWxsO1xuXHRcdFx0XHRcdGltZy5vbmxvYWQgPSBudWxsO1xuXHRcdFx0XHRcdGltZyA9IG51bGw7XG5cdFx0XHRcdH07XG5cdFx0XHRcdGltZy5zcmMgPSBiZXN0Q2FuZGlkYXRlLnVybDtcblx0XHRcdH1cblx0XHR9O1xuXHR9KSgpO1xuXG5cdHBmLmFwcGx5QmVzdENhbmRpZGF0ZSA9IGZ1bmN0aW9uKCBjYW5kaWRhdGVzLCBwaWNJbWcgKSB7XG5cdFx0dmFyIGNhbmRpZGF0ZSxcblx0XHRcdGxlbmd0aCxcblx0XHRcdGJlc3RDYW5kaWRhdGU7XG5cblx0XHRjYW5kaWRhdGVzLnNvcnQoIHBmLmFzY2VuZGluZ1NvcnQgKTtcblxuXHRcdGxlbmd0aCA9IGNhbmRpZGF0ZXMubGVuZ3RoO1xuXHRcdGJlc3RDYW5kaWRhdGUgPSBjYW5kaWRhdGVzWyBsZW5ndGggLSAxIF07XG5cblx0XHRmb3IgKCB2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKyApIHtcblx0XHRcdGNhbmRpZGF0ZSA9IGNhbmRpZGF0ZXNbIGkgXTtcblx0XHRcdGlmICggY2FuZGlkYXRlLnJlc29sdXRpb24gPj0gcGYuZ2V0RHByKCkgKSB7XG5cdFx0XHRcdGJlc3RDYW5kaWRhdGUgPSBjYW5kaWRhdGU7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGlmICggYmVzdENhbmRpZGF0ZSApIHtcblxuXHRcdFx0YmVzdENhbmRpZGF0ZS51cmwgPSBwZi5tYWtlVXJsKCBiZXN0Q2FuZGlkYXRlLnVybCApO1xuXG5cdFx0XHRpZiAoIHBpY0ltZy5zcmMgIT09IGJlc3RDYW5kaWRhdGUudXJsICkge1xuXHRcdFx0XHRpZiAoIHBmLnJlc3RyaWN0c01peGVkQ29udGVudCgpICYmIGJlc3RDYW5kaWRhdGUudXJsLnN1YnN0cigwLCBcImh0dHA6XCIubGVuZ3RoKS50b0xvd2VyQ2FzZSgpID09PSBcImh0dHA6XCIgKSB7XG5cdFx0XHRcdFx0aWYgKCB3aW5kb3cuY29uc29sZSAhPT0gdW5kZWZpbmVkICkge1xuXHRcdFx0XHRcdFx0Y29uc29sZS53YXJuKCBcIkJsb2NrZWQgbWl4ZWQgY29udGVudCBpbWFnZSBcIiArIGJlc3RDYW5kaWRhdGUudXJsICk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHBpY0ltZy5zcmMgPSBiZXN0Q2FuZGlkYXRlLnVybDtcblx0XHRcdFx0XHQvLyBjdXJyZW50U3JjIGF0dHJpYnV0ZSBhbmQgcHJvcGVydHkgdG8gbWF0Y2hcblx0XHRcdFx0XHQvLyBodHRwOi8vcGljdHVyZS5yZXNwb25zaXZlaW1hZ2VzLm9yZy8jdGhlLWltZy1lbGVtZW50XG5cdFx0XHRcdFx0aWYgKCAhcGYuY3VyU3JjU3VwcG9ydGVkICkge1xuXHRcdFx0XHRcdFx0cGljSW1nLmN1cnJlbnRTcmMgPSBwaWNJbWcuc3JjO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdHBmLmJhY2tmYWNlVmlzaWJpbGl0eUZpeCggcGljSW1nICk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0cGYuc2V0SW50cmluc2ljU2l6ZShwaWNJbWcsIGJlc3RDYW5kaWRhdGUpO1xuXHRcdH1cblx0fTtcblxuXHRwZi5hc2NlbmRpbmdTb3J0ID0gZnVuY3Rpb24oIGEsIGIgKSB7XG5cdFx0cmV0dXJuIGEucmVzb2x1dGlvbiAtIGIucmVzb2x1dGlvbjtcblx0fTtcblxuXHQvKipcblx0ICogSW4gSUU5LCA8c291cmNlPiBlbGVtZW50cyBnZXQgcmVtb3ZlZCBpZiB0aGV5IGFyZW4ndCBjaGlsZHJlbiBvZlxuXHQgKiB2aWRlbyBlbGVtZW50cy4gVGh1cywgd2UgY29uZGl0aW9uYWxseSB3cmFwIHNvdXJjZSBlbGVtZW50c1xuXHQgKiB1c2luZyA8IS0tW2lmIElFIDldPjx2aWRlbyBzdHlsZT1cImRpc3BsYXk6IG5vbmU7XCI+PCFbZW5kaWZdLS0+XG5cdCAqIGFuZCBtdXN0IGFjY291bnQgZm9yIHRoYXQgaGVyZSBieSBtb3ZpbmcgdGhvc2Ugc291cmNlIGVsZW1lbnRzXG5cdCAqIGJhY2sgaW50byB0aGUgcGljdHVyZSBlbGVtZW50LlxuXHQgKi9cblx0cGYucmVtb3ZlVmlkZW9TaGltID0gZnVuY3Rpb24oIHBpY3R1cmUgKSB7XG5cdFx0dmFyIHZpZGVvcyA9IHBpY3R1cmUuZ2V0RWxlbWVudHNCeVRhZ05hbWUoIFwidmlkZW9cIiApO1xuXHRcdGlmICggdmlkZW9zLmxlbmd0aCApIHtcblx0XHRcdHZhciB2aWRlbyA9IHZpZGVvc1sgMCBdLFxuXHRcdFx0XHR2c291cmNlcyA9IHZpZGVvLmdldEVsZW1lbnRzQnlUYWdOYW1lKCBcInNvdXJjZVwiICk7XG5cdFx0XHR3aGlsZSAoIHZzb3VyY2VzLmxlbmd0aCApIHtcblx0XHRcdFx0cGljdHVyZS5pbnNlcnRCZWZvcmUoIHZzb3VyY2VzWyAwIF0sIHZpZGVvICk7XG5cdFx0XHR9XG5cdFx0XHQvLyBSZW1vdmUgdGhlIHZpZGVvIGVsZW1lbnQgb25jZSB3ZSdyZSBmaW5pc2hlZCByZW1vdmluZyBpdHMgY2hpbGRyZW5cblx0XHRcdHZpZGVvLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoIHZpZGVvICk7XG5cdFx0fVxuXHR9O1xuXG5cdC8qKlxuXHQgKiBGaW5kIGFsbCBgaW1nYCBlbGVtZW50cywgYW5kIGFkZCB0aGVtIHRvIHRoZSBjYW5kaWRhdGUgbGlzdCBpZiB0aGV5IGhhdmVcblx0ICogYSBgcGljdHVyZWAgcGFyZW50LCBhIGBzaXplc2AgYXR0cmlidXRlIGluIGJhc2ljIGBzcmNzZXRgIHN1cHBvcnRpbmcgYnJvd3NlcnMsXG5cdCAqIGEgYHNyY3NldGAgYXR0cmlidXRlIGF0IGFsbCwgYW5kIHRoZXkgaGF2ZW7igJl0IGJlZW4gZXZhbHVhdGVkIGFscmVhZHkuXG5cdCAqL1xuXHRwZi5nZXRBbGxFbGVtZW50cyA9IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBlbGVtcyA9IFtdLFxuXHRcdFx0aW1ncyA9IGRvYy5nZXRFbGVtZW50c0J5VGFnTmFtZSggXCJpbWdcIiApO1xuXG5cdFx0Zm9yICggdmFyIGggPSAwLCBsZW4gPSBpbWdzLmxlbmd0aDsgaCA8IGxlbjsgaCsrICkge1xuXHRcdFx0dmFyIGN1cnJJbWcgPSBpbWdzWyBoIF07XG5cblx0XHRcdGlmICggY3VyckltZy5wYXJlbnROb2RlLm5vZGVOYW1lLnRvVXBwZXJDYXNlKCkgPT09IFwiUElDVFVSRVwiIHx8XG5cdFx0XHQoIGN1cnJJbWcuZ2V0QXR0cmlidXRlKCBcInNyY3NldFwiICkgIT09IG51bGwgKSB8fCBjdXJySW1nWyBwZi5ucyBdICYmIGN1cnJJbWdbIHBmLm5zIF0uc3Jjc2V0ICE9PSBudWxsICkge1xuXHRcdFx0XHRlbGVtcy5wdXNoKCBjdXJySW1nICk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBlbGVtcztcblx0fTtcblxuXHRwZi5nZXRNYXRjaCA9IGZ1bmN0aW9uKCBpbWcsIHBpY3R1cmUgKSB7XG5cdFx0dmFyIHNvdXJjZXMgPSBwaWN0dXJlLmNoaWxkTm9kZXMsXG5cdFx0XHRtYXRjaDtcblxuXHRcdC8vIEdvIHRocm91Z2ggZWFjaCBjaGlsZCwgYW5kIGlmIHRoZXkgaGF2ZSBtZWRpYSBxdWVyaWVzLCBldmFsdWF0ZSB0aGVtXG5cdFx0Zm9yICggdmFyIGogPSAwLCBzbGVuID0gc291cmNlcy5sZW5ndGg7IGogPCBzbGVuOyBqKysgKSB7XG5cdFx0XHR2YXIgc291cmNlID0gc291cmNlc1sgaiBdO1xuXG5cdFx0XHQvLyBpZ25vcmUgbm9uLWVsZW1lbnQgbm9kZXNcblx0XHRcdGlmICggc291cmNlLm5vZGVUeXBlICE9PSAxICkge1xuXHRcdFx0XHRjb250aW51ZTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gSGl0dGluZyB0aGUgYGltZ2AgZWxlbWVudCB0aGF0IHN0YXJ0ZWQgZXZlcnl0aGluZyBzdG9wcyB0aGUgc2VhcmNoIGZvciBgc291cmNlc2AuXG5cdFx0XHQvLyBJZiBubyBwcmV2aW91cyBgc291cmNlYCBtYXRjaGVzLCB0aGUgYGltZ2AgaXRzZWxmIGlzIGV2YWx1YXRlZCBsYXRlci5cblx0XHRcdGlmICggc291cmNlID09PSBpbWcgKSB7XG5cdFx0XHRcdHJldHVybiBtYXRjaDtcblx0XHRcdH1cblxuXHRcdFx0Ly8gaWdub3JlIG5vbi1gc291cmNlYCBub2Rlc1xuXHRcdFx0aWYgKCBzb3VyY2Uubm9kZU5hbWUudG9VcHBlckNhc2UoKSAhPT0gXCJTT1VSQ0VcIiApIHtcblx0XHRcdFx0Y29udGludWU7XG5cdFx0XHR9XG5cdFx0XHQvLyBpZiBpdCdzIGEgc291cmNlIGVsZW1lbnQgdGhhdCBoYXMgdGhlIGBzcmNgIHByb3BlcnR5IHNldCwgdGhyb3cgYSB3YXJuaW5nIGluIHRoZSBjb25zb2xlXG5cdFx0XHRpZiAoIHNvdXJjZS5nZXRBdHRyaWJ1dGUoIFwic3JjXCIgKSAhPT0gbnVsbCAmJiB0eXBlb2YgY29uc29sZSAhPT0gdW5kZWZpbmVkICkge1xuXHRcdFx0XHRjb25zb2xlLndhcm4oXCJUaGUgYHNyY2AgYXR0cmlidXRlIGlzIGludmFsaWQgb24gYHBpY3R1cmVgIGBzb3VyY2VgIGVsZW1lbnQ7IGluc3RlYWQsIHVzZSBgc3Jjc2V0YC5cIik7XG5cdFx0XHR9XG5cblx0XHRcdHZhciBtZWRpYSA9IHNvdXJjZS5nZXRBdHRyaWJ1dGUoIFwibWVkaWFcIiApO1xuXG5cdFx0XHQvLyBpZiBzb3VyY2UgZG9lcyBub3QgaGF2ZSBhIHNyY3NldCBhdHRyaWJ1dGUsIHNraXBcblx0XHRcdGlmICggIXNvdXJjZS5nZXRBdHRyaWJ1dGUoIFwic3Jjc2V0XCIgKSApIHtcblx0XHRcdFx0Y29udGludWU7XG5cdFx0XHR9XG5cblx0XHRcdC8vIGlmIHRoZXJlJ3Mgbm8gbWVkaWEgc3BlY2lmaWVkLCBPUiB3Lm1hdGNoTWVkaWEgaXMgc3VwcG9ydGVkXG5cdFx0XHRpZiAoICggIW1lZGlhIHx8IHBmLm1hdGNoZXNNZWRpYSggbWVkaWEgKSApICkge1xuXHRcdFx0XHR2YXIgdHlwZVN1cHBvcnRlZCA9IHBmLnZlcmlmeVR5cGVTdXBwb3J0KCBzb3VyY2UgKTtcblxuXHRcdFx0XHRpZiAoIHR5cGVTdXBwb3J0ZWQgPT09IHRydWUgKSB7XG5cdFx0XHRcdFx0bWF0Y2ggPSBzb3VyY2U7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdH0gZWxzZSBpZiAoIHR5cGVTdXBwb3J0ZWQgPT09IFwicGVuZGluZ1wiICkge1xuXHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiBtYXRjaDtcblx0fTtcblxuXHRmdW5jdGlvbiBwaWN0dXJlZmlsbCggb3B0ICkge1xuXHRcdHZhciBlbGVtZW50cyxcblx0XHRcdGVsZW1lbnQsXG5cdFx0XHRwYXJlbnQsXG5cdFx0XHRmaXJzdE1hdGNoLFxuXHRcdFx0Y2FuZGlkYXRlcyxcblx0XHRcdG9wdGlvbnMgPSBvcHQgfHwge307XG5cblx0XHRlbGVtZW50cyA9IG9wdGlvbnMuZWxlbWVudHMgfHwgcGYuZ2V0QWxsRWxlbWVudHMoKTtcblxuXHRcdC8vIExvb3AgdGhyb3VnaCBhbGwgZWxlbWVudHNcblx0XHRmb3IgKCB2YXIgaSA9IDAsIHBsZW4gPSBlbGVtZW50cy5sZW5ndGg7IGkgPCBwbGVuOyBpKysgKSB7XG5cdFx0XHRlbGVtZW50ID0gZWxlbWVudHNbIGkgXTtcblx0XHRcdHBhcmVudCA9IGVsZW1lbnQucGFyZW50Tm9kZTtcblx0XHRcdGZpcnN0TWF0Y2ggPSB1bmRlZmluZWQ7XG5cdFx0XHRjYW5kaWRhdGVzID0gdW5kZWZpbmVkO1xuXG5cdFx0XHQvLyBpbW1lZGlhdGVseSBza2lwIG5vbi1gaW1nYCBub2Rlc1xuXHRcdFx0aWYgKCBlbGVtZW50Lm5vZGVOYW1lLnRvVXBwZXJDYXNlKCkgIT09IFwiSU1HXCIgKSB7XG5cdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBleHBhbmRvIGZvciBjYWNoaW5nIGRhdGEgb24gdGhlIGltZ1xuXHRcdFx0aWYgKCAhZWxlbWVudFsgcGYubnMgXSApIHtcblx0XHRcdFx0ZWxlbWVudFsgcGYubnMgXSA9IHt9O1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBpZiB0aGUgZWxlbWVudCBoYXMgYWxyZWFkeSBiZWVuIGV2YWx1YXRlZCwgc2tpcCBpdCB1bmxlc3Ncblx0XHRcdC8vIGBvcHRpb25zLnJlZXZhbHVhdGVgIGlzIHNldCB0byB0cnVlICggdGhpcywgZm9yIGV4YW1wbGUsXG5cdFx0XHQvLyBpcyBzZXQgdG8gdHJ1ZSB3aGVuIHJ1bm5pbmcgYHBpY3R1cmVmaWxsYCBvbiBgcmVzaXplYCApLlxuXHRcdFx0aWYgKCAhb3B0aW9ucy5yZWV2YWx1YXRlICYmIGVsZW1lbnRbIHBmLm5zIF0uZXZhbHVhdGVkICkge1xuXHRcdFx0XHRjb250aW51ZTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gaWYgYGltZ2AgaXMgaW4gYSBgcGljdHVyZWAgZWxlbWVudFxuXHRcdFx0aWYgKCBwYXJlbnQgJiYgcGFyZW50Lm5vZGVOYW1lLnRvVXBwZXJDYXNlKCkgPT09IFwiUElDVFVSRVwiICkge1xuXG5cdFx0XHRcdC8vIElFOSB2aWRlbyB3b3JrYXJvdW5kXG5cdFx0XHRcdHBmLnJlbW92ZVZpZGVvU2hpbSggcGFyZW50ICk7XG5cblx0XHRcdFx0Ly8gcmV0dXJuIHRoZSBmaXJzdCBtYXRjaCB3aGljaCBtaWdodCB1bmRlZmluZWRcblx0XHRcdFx0Ly8gcmV0dXJucyBmYWxzZSBpZiB0aGVyZSBpcyBhIHBlbmRpbmcgc291cmNlXG5cdFx0XHRcdC8vIFRPRE8gdGhlIHJldHVybiB0eXBlIGhlcmUgaXMgYnJ1dGFsLCBjbGVhbnVwXG5cdFx0XHRcdGZpcnN0TWF0Y2ggPSBwZi5nZXRNYXRjaCggZWxlbWVudCwgcGFyZW50ICk7XG5cblx0XHRcdFx0Ly8gaWYgYW55IHNvdXJjZXMgYXJlIHBlbmRpbmcgaW4gdGhpcyBwaWN0dXJlIGR1ZSB0byBhc3luYyB0eXBlIHRlc3Qocylcblx0XHRcdFx0Ly8gcmVtb3ZlIHRoZSBldmFsdWF0ZWQgYXR0ciBhbmQgc2tpcCBmb3Igbm93ICggdGhlIHBlbmRpbmcgdGVzdCB3aWxsXG5cdFx0XHRcdC8vIHJlcnVuIHBpY3R1cmVmaWxsIG9uIHRoaXMgZWxlbWVudCB3aGVuIGNvbXBsZXRlKVxuXHRcdFx0XHRpZiAoIGZpcnN0TWF0Y2ggPT09IGZhbHNlICkge1xuXHRcdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRmaXJzdE1hdGNoID0gdW5kZWZpbmVkO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBDYWNoZSBhbmQgcmVtb3ZlIGBzcmNzZXRgIGlmIHByZXNlbnQgYW5kIHdl4oCZcmUgZ29pbmcgdG8gYmUgZG9pbmcgYHBpY3R1cmVgL2BzcmNzZXRgL2BzaXplc2AgcG9seWZpbGxpbmcgdG8gaXQuXG5cdFx0XHRpZiAoICggcGFyZW50ICYmIHBhcmVudC5ub2RlTmFtZS50b1VwcGVyQ2FzZSgpID09PSBcIlBJQ1RVUkVcIiApIHx8XG5cdFx0XHQoICFwZi5zaXplc1N1cHBvcnRlZCAmJiAoIGVsZW1lbnQuc3Jjc2V0ICYmIHJlZ1dEZXNjLnRlc3QoIGVsZW1lbnQuc3Jjc2V0ICkgKSApICkge1xuXHRcdFx0XHRwZi5kb2RnZVNyY3NldCggZWxlbWVudCApO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoIGZpcnN0TWF0Y2ggKSB7XG5cdFx0XHRcdGNhbmRpZGF0ZXMgPSBwZi5wcm9jZXNzU291cmNlU2V0KCBmaXJzdE1hdGNoICk7XG5cdFx0XHRcdHBmLmFwcGx5QmVzdENhbmRpZGF0ZSggY2FuZGlkYXRlcywgZWxlbWVudCApO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Ly8gTm8gc291cmNlcyBtYXRjaGVkLCBzbyB3ZeKAmXJlIGRvd24gdG8gcHJvY2Vzc2luZyB0aGUgaW5uZXIgYGltZ2AgYXMgYSBzb3VyY2UuXG5cdFx0XHRcdGNhbmRpZGF0ZXMgPSBwZi5wcm9jZXNzU291cmNlU2V0KCBlbGVtZW50ICk7XG5cblx0XHRcdFx0aWYgKCBlbGVtZW50LnNyY3NldCA9PT0gdW5kZWZpbmVkIHx8IGVsZW1lbnRbIHBmLm5zIF0uc3Jjc2V0ICkge1xuXHRcdFx0XHRcdC8vIEVpdGhlciBgc3Jjc2V0YCBpcyBjb21wbGV0ZWx5IHVuc3VwcG9ydGVkLCBvciB3ZSBuZWVkIHRvIHBvbHlmaWxsIGBzaXplc2AgZnVuY3Rpb25hbGl0eS5cblx0XHRcdFx0XHRwZi5hcHBseUJlc3RDYW5kaWRhdGUoIGNhbmRpZGF0ZXMsIGVsZW1lbnQgKTtcblx0XHRcdFx0fSAvLyBFbHNlLCByZXNvbHV0aW9uLW9ubHkgYHNyY3NldGAgaXMgc3VwcG9ydGVkIG5hdGl2ZWx5LlxuXHRcdFx0fVxuXG5cdFx0XHQvLyBzZXQgZXZhbHVhdGVkIHRvIHRydWUgdG8gYXZvaWQgdW5uZWNlc3NhcnkgcmVwYXJzaW5nXG5cdFx0XHRlbGVtZW50WyBwZi5ucyBdLmV2YWx1YXRlZCA9IHRydWU7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFNldHMgdXAgcGljdHVyZSBwb2x5ZmlsbCBieSBwb2xsaW5nIHRoZSBkb2N1bWVudCBhbmQgcnVubmluZ1xuXHQgKiB0aGUgcG9seWZpbGwgZXZlcnkgMjUwbXMgdW50aWwgdGhlIGRvY3VtZW50IGlzIHJlYWR5LlxuXHQgKiBBbHNvIGF0dGFjaGVzIHBpY3R1cmVmaWxsIG9uIHJlc2l6ZVxuXHQgKi9cblx0ZnVuY3Rpb24gcnVuUGljdHVyZWZpbGwoKSB7XG5cdFx0cGYuaW5pdFR5cGVEZXRlY3RzKCk7XG5cdFx0cGljdHVyZWZpbGwoKTtcblx0XHR2YXIgaW50ZXJ2YWxJZCA9IHNldEludGVydmFsKCBmdW5jdGlvbigpIHtcblx0XHRcdC8vIFdoZW4gdGhlIGRvY3VtZW50IGhhcyBmaW5pc2hlZCBsb2FkaW5nLCBzdG9wIGNoZWNraW5nIGZvciBuZXcgaW1hZ2VzXG5cdFx0XHQvLyBodHRwczovL2dpdGh1Yi5jb20vZGVkL2RvbXJlYWR5L2Jsb2IvbWFzdGVyL3JlYWR5LmpzI0wxNVxuXHRcdFx0cGljdHVyZWZpbGwoKTtcblxuXHRcdFx0aWYgKCAvXmxvYWRlZHxeaXxeYy8udGVzdCggZG9jLnJlYWR5U3RhdGUgKSApIHtcblx0XHRcdFx0Y2xlYXJJbnRlcnZhbCggaW50ZXJ2YWxJZCApO1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0fSwgMjUwICk7XG5cblx0XHR2YXIgcmVzaXplVGltZXI7XG5cdFx0dmFyIGhhbmRsZVJlc2l6ZSA9IGZ1bmN0aW9uKCkge1xuXHQgICAgICAgIHBpY3R1cmVmaWxsKHsgcmVldmFsdWF0ZTogdHJ1ZSB9KTtcblx0ICAgIH07XG5cdFx0ZnVuY3Rpb24gY2hlY2tSZXNpemUoKSB7XG5cdFx0ICAgIGNsZWFyVGltZW91dChyZXNpemVUaW1lcik7XG5cdFx0ICAgIHJlc2l6ZVRpbWVyID0gc2V0VGltZW91dCggaGFuZGxlUmVzaXplLCA2MCApO1xuXHRcdH1cblxuXHRcdGlmICggdy5hZGRFdmVudExpc3RlbmVyICkge1xuXHRcdFx0dy5hZGRFdmVudExpc3RlbmVyKCBcInJlc2l6ZVwiLCBjaGVja1Jlc2l6ZSwgZmFsc2UgKTtcblx0XHR9IGVsc2UgaWYgKCB3LmF0dGFjaEV2ZW50ICkge1xuXHRcdFx0dy5hdHRhY2hFdmVudCggXCJvbnJlc2l6ZVwiLCBjaGVja1Jlc2l6ZSApO1xuXHRcdH1cblx0fVxuXG5cdHJ1blBpY3R1cmVmaWxsKCk7XG5cblx0LyogZXhwb3NlIG1ldGhvZHMgZm9yIHRlc3RpbmcgKi9cblx0cGljdHVyZWZpbGwuXyA9IHBmO1xuXG5cdGV4cG9zZSggcGljdHVyZWZpbGwgKTtcblxufSApKCB3aW5kb3csIHdpbmRvdy5kb2N1bWVudCwgbmV3IHdpbmRvdy5JbWFnZSgpICk7XG4iXSwiZmlsZSI6InBpY3R1cmVmaWxsLmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=