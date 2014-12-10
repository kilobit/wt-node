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

// utils.js

var logger = require("./logger");

function loadBody(request, callback) {
    
    var body = typeof(request.body) !== 'undefined' ? request.body : "";
    request.on('data', function (data) {
	body += data;
    });

    request.on('end', function() {
	request.body = body;
	callback(body);
    });
}

var parsers = {'application/json': function(data) { return JSON.parse(data); }};

function parseBody(request, callback) {
    
    loadBody(request, function(body) {
	
	var content_type = (typeof(request.headers["content-type"]) !== 'undefined') ? request.headers["content-type"] : 'text/plain';

	var parser = parsers[content_type];
	if(typeof(parser) === 'function') {
	    logger.debug("Parsing: " + body);

	    try {
		request.body = parser(body);
	    }
	    catch(e) {
		logger.error("utils.js (" + request.connection.remoteAddress + 
			     "): Error while parsing body: " + e.name + ": " + 
			     e.message + ":\n" + body);
		callback(e, null);
	    }
	    callback(null, request.body);
	}
	else {
	    callback(null, body);
	}
    });
}

function error(response, code, reason, message) {

    var c = (typeof(code) !== 'undefined') ? code : 500;
    var r = (typeof(reason) !== 'undefined') ? reason : "Internal Server Error";

    response.writeHead(c, r, {'Content-Type': 'text/html'});

    response.write("<html>\n<head>\n\t<title>" + c + " " + r + "</title>\n</head>\n");
    response.write("<body>\n\t<h1>" + c + " " + r + "</h1>\n");
    response.write("\t<p>" + message + "</p>\n</body>\n<html>");

    response.end();

    logger.msg("Returned Error: " + c + " - " + r + " - " + message);
}

exports.loadBody = loadBody;
exports.parseBody = parseBody;
exports.error = error;
