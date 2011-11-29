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

// wt.js

// Set up all includes etc necessary for the wt libraries.

var html = require("./html");
var logger = require("./logger");
var router = require("./router");
var utils = require("./utils");

exports.html = html;
exports.logger = logger;
exports.router = router;
exports.utils = utils;
