/* Copyright (C) 2011 Kilobit */

/*   WT is free software: you can redistribute it and/or modify
 *   it under the terms of the GNU General Public License as published by
 *   the Free Software Foundation, either version 3 of the License, or
 *   (at your option) any later version.
 *
 *   WT is distributed in the hope that it will be useful,
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *   GNU General Public License for more details.
 *
 *   You should have received a copy of the GNU General Public License
 *   along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

// router.js

var url = require("url");
var logger = require("./logger");
var qsparser = require('querystring');

var router = {};

(function(){

    router.routes = {};
    router.prerunChain = [];

    router.setDefaultHandler = function(handler) {
	this.default_handler = handler;
    }

    router.setDefaultRouteHandler = function(path, handler) {

	// Get existing route entries or create new ones.
	var route = (this.routes[path]) ? this.routes[path] : {};

	// Set the default handler on the route.
	route.default_handler = handler;

	// Add the route to the routes.
	this.routes[path] = route;
    }

    router.addPreHandling = function(fname) {
    	router.prerunChain.push(fname);
    }

    router.setHandler = function(method, path, handler) {

	// Get existing route entries or create new ones.
	var route = (this.routes[path]) ? this.routes[path] : {};
	var handlers = (route.handlers) ? route.handlers : {};

	// Pre Compile the regex
	if(typeof(route.re === 'undefined')) {route.re = new RegExp(path);}

	// Set the handler on the route
	handlers[method.toUpperCase()] = handler;
	route.handlers = handlers;

	// Add the route to the routes.
	this.routes[path] = route;
    }

    router.setRoutes = function(routes) {
	this.routes = routes;
    }

	router.runBefore = function(request, response, data, routeHandler) {

		var next = function() {
			if(router.prerunChain.length === 0) {
				return routeHandler(request, response, data);
			}
			var now = router.prerunChain.shift();
			if( typeof now != 'function' ) {
				throw new Error(now.toString() + " is not a function!");
			}

			return now(request, response, data, next);
		};
		next();
	};

    router.parsePostData = function(request, response, data, next) {
		if (request.method == "GET") {
			return next();
		}
		var postData = "";
		request.setEncoding("utf8");
		request.on("data", function(data) {
			postData += data;
		});
		request.on("end", function() {
			// Pass control to the routed method.
			if (postData.match(/<(.*)>(.*)<\/(.*)>/)) {
				return routeMethod(request, response, postData);
			}
			data = qsparser.parse(postData);
			request.data = data;
			return next();
		});
    };
    router.parseGetParameters = function(request, response, data, next) {
		var params = {};
		// add get params
		request.url.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m, key, value) {
			params[key] = value;
		});

		request.query = params;
		data = data;
		return next();
	};

    // Convenience methods for setting handlers.
    router.get		= function(path, handler) { return this.setHandler('GET', path, handler); }
    router.post		= function(path, handler, data) { return this.setHandler('POST', path, handler); }
    router.put		= function(path, handler) { return this.setHandler('PUT', path, handler); }
    router.delete	= function(path, handler) { return this.setHandler('DELETE', path, handler); }
    router.options	= function(path, handler) { return this.setHandler('OPTIONS', path, handler); }
    router.head		= function(path, handler) { return this.setHandler('HEAD', path, handler); }

    // Route requests based on the routes list.
    router.route = function(request, response, data) {


	// Parse the request uri
	uri = url.parse(request.url);

	// Loop over the routes
	for(var route in this.routes) {

	    // Check for a match.
	    match = this.routes[route].re.exec(uri.pathname);
	    if(match) {
		// Get the method handler
		//console.log("Method: " + request.method);
		method = this.routes[route].handlers && this.routes[route].handlers[request.method.toUpperCase()];
		if(method) {
		    // Pass control to the routed method.
		    if(router.prerunChain.length > 0) {
		    	return router.runBefore(request, response, data, method);
		    } else {
		    	return method(request, response, data);
		    }
		}

		// Try the default route handler
		if(typeof(this.routes[route].default_handler) === 'function') {
		    this.routes[route].default_handler(request, response);
		}
	    }
	}

	// Try the default handler
	//console.log(typeof(this.default_handler));
	if(typeof(this.default_handler) === 'function') {
	    return this.default_handler(request, response);
	}

	// No match, no default handler.
	response.writeHead(500, {'Content-Type': 'text/plain'});
	response.end('Failed to route!\n' + request.url);
    }

    NotFoundHandler = function(request, response) {

	response.writeHead(500, {'Content-Type': 'text/html'});

	response.write("<html>\n\t<head>\n\t<title>404 Not Found</title>\n\t</head>\n");
	response.write("<body>\n\t<h1>Not Found</h1>\n\t" +
		       "<p>The resource you requested, " + request.url +
		       ", was not found on this server.<\p>\n</body>");

	response.end();
    }

    router.setDefaultHandler(NotFoundHandler);

})();

//console.log(router);

for(var name in router) {
    exports[name] = router[name];
}

//Object.prototype.foo = 'bar';

// Object.defineProperty(Object.prototype, "extend", {
//     enumerable: false,
//     value: function(from) {
//         var props = Object.getOwnPropertyNames(from);
//         var dest = this;
//         props.forEach(function(name) {
//             if (name in dest) {
//                 var destination = Object.getOwnPropertyDescriptor(from, name);
//                 Object.defineProperty(dest, name, destination);
//             }
//         });
//         return this;
//     }
// });


