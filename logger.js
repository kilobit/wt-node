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

/* logger.js */


const LOG_ERROR	= 0;
const LOG_WARN	= 1;
const LOG_MSG	= 2;
const LOG_INFO	= 3;
const LOG_DEBUG	= 4;

const DEFAULT_LEVEL = LOG_DEBUG;

var level = DEFAULT_LEVEL;
var out = process.stdout;

function log(msg, lvl) {
    if(lvl <= level) {
	out.write(msg + "\n");
    }
}

function error(msg)	{ log(msg, LOG_ERROR); }
function warn(msg)	{ log(msg, LOG_WARN); }
function msg(msg)	{ log(msg, LOG_MSG); }
function info(msg)	{ log(msg, LOG_INFO); }
function debug(msg)	{ log(msg, LOG_DEBUG); }

exports.LOG_ERROR	= LOG_ERROR;
exports.LOG_WARN	= LOG_WARN;
exports.LOG_MSG		= LOG_MSG;
exports.LOG_INFO	= LOG_INFO;
exports.LOG_DEBUG	= LOG_DEBUG;

exports.level = level; 
exports.log = log;

exports.error	= error;
exports.warn	= warn;
exports.msg	= msg;
exports.info	= info;
exports.debug	= debug;