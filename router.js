"use strict";
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
// var logger = require("./logger");
var qsparser = require('querystring');

var Router = function (options) {
	var that = this;
	options = options || {};
	this.routes = options.routes || {};
	this.prerunChain = [
		parseGetParameters,
		parsePostData,
		parseCookies
	];
	this.default_handler = options.default_handler || NotFoundHandler;
	this.error_handler = options.error_handler || ServerErrorHandler;


	this.route = function(request,response){
		var data = {};
		// Parse the request uri
		var uri = url.parse(request.url);

		// Loop over the routes
		for(var route in that.routes) {

			// Check for a match.
			var match = that.routes[route].re.exec(uri.pathname);
			if(match) {
				data.url = match;
				// Get the method handler
				var method = that.routes[route].handlers && that.routes[route].handlers[request.method.toUpperCase()];
				if(method) {
					// Pass control to the routed method.
					if(that.prerunChain.length > 0) {
						return that.runBefore(request, response, data, method);
					} else {
						return method(request, response, data);
					}
				}

				// Try the default route handler
				if(typeof(that.routes[route].default_handler) === 'function') {
					that.routes[route].default_handler(request, response);
				}
			}
		}

		// Try the default handler
		if(typeof(that.default_handler) === 'function') {
			return that.default_handler(request, response);
		}

		// No match, no default handler.
		that.error_handler(request,response);
	}
}

Router.prototype.setDefaultRouteHandler = function(path, handler) {

	// Get existing route entries or create new ones.
	var route = (this.routes[path]) ? this.routes[path] : {};

	// Set the default handler on the route.
	route.default_handler = handler;

	// Add the route to the routes.
	this.routes[path] = route;
}

Router.prototype.setRoutes = function(routes) {
	this.routes = routes;
}

Router.prototype.clearPrerunChain = function() {
	this.prerunChain = [];
};

Router.prototype.addPreHandling = function(fn) {
	this.prerunChain.push(fn);
}

Router.prototype.setDefaultHandler = function(fn) {
	this.default_handler = fn;
};

Router.prototype.runBefore = function(request, response, data, routeHandler) {
	var run_count = 0;
	var that = this;
	var next = function() {
		// if ( incoming_data ) {
		// 	data = incoming_data;
		// }
		if(that.prerunChain.length === run_count) {
			return routeHandler(request, response, data);
		}

		var now = that.prerunChain[run_count];
		run_count++;
		// var now = router.prerunChain.shift();
		if( typeof now != 'function' ) {
			throw new Error(now.toString() + " is not a function!");
		}

		return now(request, response, data, next);
	};
	next();
};

Router.prototype.setHandler = function(method, path, handler) {

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
};

Router.prototype.get     = function(path, handler) { return this.setHandler('GET', path, handler); };
Router.prototype.post    = function(path, handler) { return this.setHandler('POST', path, handler); };
Router.prototype.put     = function(path, handler) { return this.setHandler('PUT', path, handler); };
Router.prototype.delete  = function(path, handler) { return this.setHandler('DELETE', path, handler); };
Router.prototype.options = function(path, handler) { return this.setHandler('OPTIONS', path, handler); };
Router.prototype.head    = function(path, handler) { return this.setHandler('HEAD', path, handler); };

// Router.prototype.route = function(request, response) {
// 	var data = {};
// 	var that = this;
// 	console.log(this);
// 	// Parse the request uri
// 	var uri = url.parse(request.url);

// 	// Loop over the routes
// 	for(var route in that.routes) {

// 		// Check for a match.
// 		var match = that.routes[route].re.exec(uri.pathname);
// 		if(match) {
// 			data.url = match;
// 			// Get the method handler
// 			var method = that.routes[route].handlers && that.routes[route].handlers[request.method.toUpperCase()];
// 			if(method) {
// 				// Pass control to the routed method.
// 				if(that.prerunChain.length > 0) {
// 					return that.runBefore(request, response, data, method);
// 				} else {
// 					return method(request, response, data);
// 				}
// 			}

// 			// Try the default route handler
// 			if(typeof(that.routes[route].default_handler) === 'function') {
// 				that.routes[route].default_handler(request, response);
// 			}
// 		}
// 	}

// 	// Try the default handler
// 	if(typeof(that.default_handler) === 'function') {
// 		return that.default_handler(request, response);
// 	}

// 	// No match, no default handler.
// 	ServerErrorHandler(request,response);
// };

var NotFoundHandler = function(request, response) {

	response.writeHead(404, {'Content-Type': 'text/html'});

	response.write("<html>\n\t<head>\n\t<title>404 Not Found</title>\n\t</head>\n");
	response.write("<body><h1>Not Found</h1><p>The resource you requested, " + request.url + ", was not found on this server.</p></body>");
	response.write("</html>");
	response.end();
}

var ServerErrorHandler = function(request, response) {

	response.writeHead(500, {'Content-Type': 'text/html'});

	response.write("<html>\n\t<head>\n\t<title>500 Internal Server Error</title>\n\t</head>\n");
	response.write("<body><h1>Server Error</h1><p>The server has encountered an error processing this request.</p></body>");
	response.write("</html>");
	response.end();
};

var parseGetParameters = function(request, response, data, next) {
	var params = {};
	// add get params
	request.url.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m, key, value) {
		params[key] = value;
	});

	if(!data.get) {
		data.get = {};
	}
	if(!request.wt) {
		request.wt = {};
	}

	request.wt.query = params;
	data.get = params;
	return next();
};

var parsePostData = function(request, response, data, next) {
	if (!data) {
		data = {};
	}
	if (!request.wt) {
		request.wt = {};
	}

	request.wt.data = {};
	data.post = {};
	if (request.method.toUpperCase() !== "POST") {
		return next();
	}

	if( request.headers && request.headers['content-type'] && request.headers['content-type'].indexOf('application/x-www-form-urlencoded') == -1) {
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
			request.wt.data = postData;
			data.post = postData;
			return next();
			// return routeMethod(request, response, postData);
		}
		var parsed_post_data = qsparser.parse(postData);
		request.wt.data = parsed_post_data;
		data.post = parsed_post_data;
		return next();
	});
};

var parseCookies = function(request, response, data, next) {
	data.cookies = {};

	if(!request.headers || !request.headers.cookie) {
		return next();
	}

    var cookies_array = request.headers.cookie.split(";");

    cookies_array.forEach(function( cookie ) {
        var parts = cookie.split('=');
        data.cookies[parts.shift().trim()] = decodeURI(parts.join('='));
    });

	return next();
};

module.exports = Router;
/*
(function() {

	router.routes = {};
	router.prerunChain = [];
	router.default_handler;

	router.setDefaultHandler = function(handler) {
		router.default_handler = handler;
	}

	router.setDefaultRouteHandler = function(path, handler) {

		// Get existing route entries or create new ones.
		var route = (router.routes[path]) ? router.routes[path] : {};

		// Set the default handler on the route.
		route.default_handler = handler;

		// Add the route to the routes.
		router.routes[path] = route;
	}


	router.clearPrerunChain = function () {
		console.log(router.prerunChain);
		return router.prerunChain = [];
		console.log(router.prerunChain);
	}
	router.addPreHandling = function(fname) {
		router.prerunChain.push(fname);
	}

	router.setHandler = function(method, path, handler) {

		// Get existing route entries or create new ones.
		var route = (router.routes[path]) ? router.routes[path] : {};
		var handlers = (route.handlers) ? route.handlers : {};

		// Pre Compile the regex
		if(typeof(route.re === 'undefined')) {route.re = new RegExp(path);}

		// Set the handler on the route
		handlers[method.toUpperCase()] = handler;
		route.handlers = handlers;

		// Add the route to the routes.
		router.routes[path] = route;
	}

	router.setRoutes = function(routes) {
		router.routes = routes;
	}

	router.runBefore = function(request, response, data, routeHandler) {
		var run_count = 0;
		var next = function() {
			if(router.prerunChain.length === run_count) {
				return routeHandler(request, response, data);
			}

			var now = router.prerunChain[run_count];
			run_count++;
			// var now = router.prerunChain.shift();
			if( typeof now != 'function' ) {
				throw new Error(now.toString() + " is not a function!");
			}

			return now(request, response, data, next);
		};
		next();
	};

	router.parsePostData = function(request, response, data, next) {
		if (!request.wt) {
			request.wt = {};
		}

		if (request.method == "GET") {
			request.wt.data = {};
			return next();
		}

		if( request.headers && request.headers['content-type'] && request.headers['content-type'].indexOf('application/x-www-form-urlencoded') == -1) {
			request.wt.data = {};
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
				request.wt.data = postData;
				return next();
				// return routeMethod(request, response, postData);
			}
			data = qsparser.parse(postData);
			request.wt.data = data;
			return next();
		});
	};

	router.parseGetParameters = function(request, response, data, next) {
		var params = {};
		// add get params
		request.url.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m, key, value) {
			params[key] = value;
		});

		if(!request.wt) {
			request.wt = {};
		}

		request.wt.query = params;
		return next();
	};

	// Convenience methods for setting handlers.
	router.get		    = function(path, handler) { return router.setHandler('GET', path, handler); }
	router.post		   = function(path, handler, data) { return router.setHandler('POST', path, handler); }
	router.put		    = function(path, handler) { return router.setHandler('PUT', path, handler); }
	router.delete	  = function(path, handler) { return router.setHandler('DELETE', path, handler); }
	router.options	 = function(path, handler) { return router.setHandler('OPTIONS', path, handler); }
	router.head		   = function(path, handler) { return router.setHandler('HEAD', path, handler); }

	// Route requests based on the routes list.
	router.route = function(request, response) {
		var data = {};
		// Parse the request uri
		uri = url.parse(request.url);

		// Loop over the routes
		for(var route in router.routes) {

			// Check for a match.
			match = router.routes[route].re.exec(uri.pathname);
			if(match) {
				data['flow'] = match[0].split('/');
				// Get the method handler
				method = router.routes[route].handlers && router.routes[route].handlers[request.method.toUpperCase()];
				if(method) {
					// Pass control to the routed method.
					if(router.prerunChain.length > 0) {
						return router.runBefore(request, response, data, method);
					} else {
						return method(request, response, data);
					}
				}

				// Try the default route handler
				if(typeof(router.routes[route].default_handler) === 'function') {
					router.routes[route].default_handler(request, response);
				}
			}
		}

		// Try the default handler
		if(typeof(router.default_handler) === 'function') {
			return router.default_handler(request, response);
		}

		// No match, no default handler.
		response.writeHead(500, {'Content-Type': 'text/plain'});
		response.end('Failed to route!\n' + request.url);
	}

	NotFoundHandler = function(request, response) {

		// router.clearPrerunChain();

		response.writeHead(500, {'Content-Type': 'text/html'});

		response.write("<html>\n\t<head>\n\t<title>404 Not Found</title>\n\t</head>\n");
		response.write("<body>\n\t<h1>Not Found</h1>\n\t" +
		"<p>The resource you requested, " + request.url +
		", was not found on this server.<\p>\n</body>");

		response.end();
	}

	router.setDefaultHandler(NotFoundHandler);

})();

for(var name in router) {
	exports[name] = router[name];
}

*/

