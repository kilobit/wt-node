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

// html.js

var logger = require("./logger");
var jsdom = require("jsdom").jsdom;

var jquery = null;
function withJQuery(html, callback) {

    jquery = require('./jquery');

    document = jsdom(html, null, null);
    window = document.createWindow();
    jquery.init(window);
    var $ = window.jQuery;

    try {
	callback(window);
    }
    catch(e) {
	logger.error("" + e.name + ": " + e.message + "\n" + Error().stack);
	throw e;
    }
}

function getJQueryWindow(html) {

    document = jsdom(html, null, null);
    window = document.createWindow();
    jsdom.jQueryify(window, function() {console.log(window.$)});

    console.log(window.$);

    return window;
}

var form_defaults = { id: 'myform',
		      action: '/',
		      method: 'POST',
		      inputs: {} };

var attr_defaults = { type: 'text' };

function generateHTMLForm(values, attrs, window) {

    var document = window && window.document || jsdom();

    window = window || document.createWindow();

    var attributes = form_defaults.extend(attrs);

    var form = document.createElement('form');
    
    form.id = attributes.id;
    form.action = attributes.action;
    form.method = attributes.method;

    for(var name in values) {

	var kvs = {'name': name, 'value': values[name]}.extend(attr_defaults);

	var input = document.createElement("input");

	for(var attr in kvs) {
	    input.setAttribute(attr, kvs[attr]);
	}

	form.appendChild(input);
    }

    logger.debug('Form Generated: ' + form.outerHTML);

    return form;    
    

}

exports.withJQuery = withJQuery;
exports.getJQueryWindow = getJQueryWindow;
exports.generateHTMLForm = generateHTMLForm;
