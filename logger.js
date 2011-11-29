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