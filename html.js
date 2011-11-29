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