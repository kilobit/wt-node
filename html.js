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
var sys = require("sys");
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
    jquery = require('./jquery');

    document = jsdom(html, null, null);
    window = document.createWindow();
    jquery.init(window);

    return window;
}

var form_defaults = { id: 'myform',
		      action: '/',
		      method: 'POST',
		      inputs: {} };

var attr_defaults = { type: 'text' };

function generateHTMLForm(values, attrs, window) {

    var window = (window) ? window : getJQueryWindow();
    window = (window.jQuery) ? window : getJQueryWindow();
    var $ = window.jQuery;

    var attributes = form_defaults.extend(attrs);

    var form = $('<form>').attr({id: attributes.id,
			       action: attributes.action,
			       method: attributes.method});

    for(var name in values) {
	var kvs = {'name': name, 'value': values[name]}.extend(attr_defaults);
	var input = $('<input>').attr(kvs);
	form.append(input);
    }

    logger.debug('Form Generated: ' + form[0].outerHTML);

    return form[0];
}

exports.withJQuery = withJQuery;
exports.getJQueryWindow = getJQueryWindow;
exports.generateHTMLForm = generateHTMLForm;