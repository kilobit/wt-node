"use strict";
// node_modules/mocha/bin/mocha --ui tdd specs --require test/specs/chai.js --reporter spec test/router_test.js

var  chai = require('chai')
, url     = require('url')
, assert  = chai.assert;

// var router = require("../wt").router;
var Router = require("../wt").router;


suite("Router", function() {
	var router;
	setup(function(){
		router = new Router();
	});

	teardown(function(){
		router=null;
	});

	test("Router has required methods",function(){
		assert.isObject(router.routes,"Expected router.routes to be an object");
		assert.isArray(router.prerunChain, "Expected router.prerunChain to be an array");
		assert.isFunction(router.setDefaultHandler,"Expected router.setDefaultHandler to be function");
		assert.isFunction(router.setDefaultRouteHandler,"Expected router.setDefaultRouteHandler to be function");
		assert.isFunction(router.clearPrerunChain,"Expected router.clearPrerunChain to be function");
		assert.isFunction(router.addPreHandling,"Expected router.addPreHandling to be function");

		assert.isFunction(router.setHandler,"Expected router.setHandler to be function");

		assert.isFunction(router.setRoutes,"Expected router.setRoutes to be function");
		// assert.isFunction(router.parsePostData,"Expected router.parsePostData to be function");
		// assert.isFunction(router.parseGetParameters,"Expected router.parseGetParameters to be function");

		assert.isFunction(router.get,"Expected router.get to be function");
		assert.isFunction(router.post,"Expected router.post to be function");
		assert.isFunction(router.put,"Expected router.put to be function");
		assert.isFunction(router.delete,"Expected router.delete to be function");
		assert.isFunction(router.options,"Expected router.options to be function");
		assert.isFunction(router.head,"Expected router.head to be function");
		assert.isFunction(router.route,"Expected router.route to be function");

		assert.isFunction(router.default_handler,"Expected router.default_handler to be function");
	});

	test("router.get - set/run regex route",function(done){
		var route_regex = new RegExp(/(test|foo)\/bar\/(banana)/i);
		var url_obj = {
			url: 'test/bar/banana',
			method: 'get'
		};
		var handler = function(req,res,data) {
			assert.include(data.url,'test',"Expected 'test' in data.url");
			assert.include(data.url,'banana',"Expected 'banana' in data.url");
			done();
		};
		router.get(route_regex,handler);
		router.route(url_obj, {});
	});

	test("router.get - set/run route",function(done){
		var route = '/test/foo';
		var url_obj = {
			url: route,
			method: 'get'
		};
		var handler = function(req,res,data) {
			done();
		};
		router.get(route,handler);
		assert.equal(router.routes[route].handlers.GET,handler,"Expected route handler to be set for method.");
		router.route(url_obj, {});
	});

	test("router.post - set/run route",function(done){
		var route = '/test';
		var url_obj = {
			url: route,
			method: 'post',
			setEncoding: function(){},
			on: function(event_name, action){ action(); }
		};
		var handler = function() {
			done();
		};
		router.post(route,handler);
		assert.equal(router.routes[route].handlers.POST,handler,"Expected route handler to be set for method.");
		router.route(url_obj, {});
	});

	test("router.put - set/run route",function(done){
		var route = '/test';
		var url_obj = {
			url: route,
			method: 'put',
			setEncoding: function(){},
			on: function(event_name, action){ action(); }
		};
		var handler = function() {
			done();
		};
		router.put(route,handler);
		assert.equal(router.routes[route].handlers.PUT,handler,"Expected route handler to be set for method.");
		router.route(url_obj, {}, null);
	});

	test("router.delete - set/run route",function(done){
		var route = '/test';
		var url_obj = {
			url: route,
			method: 'delete'
		};
		var handler = function() {
			done();
		};
		router.delete(route,handler);
		assert.equal(router.routes[route].handlers.DELETE,handler,"Expected route handler to be set for method.");
		router.route(url_obj, {}, null);
	});

	test("router.options - set/run route",function(done){
		var route = '/test';
		var url_obj = {
			url: route,
			method: 'options'
		};
		var handler = function() {
			done();
		};
		router.options(route,handler);
		assert.equal(router.routes[route].handlers.OPTIONS,handler,"Expected route handler to be set for method.");
		router.route(url_obj, {}, null);
	});

	test("router.head - set/run route",function(done){
		var route = '/test';
		var url_obj = {
			url: route,
			method: 'head'
		};
		var handler = function() {
			done();
		};
		router.head(route,handler);
		assert.equal(router.routes[route].handlers.HEAD,handler,"Expected route handler to be set for method.");
		router.route(url_obj, {}, null);
	});

	test("setHandler - set/run new route",function(done){
		var route = '/setHandlerTest';
		var url_obj = {
			url: route,
			method: 'get'
		};
		var handler = function() {
			done();
		};
		router.setHandler(url_obj.method,route,handler);
		assert.equal(router.routes[route].handlers.GET,handler,"Expected route handler to be set for method.");
		router.route(url_obj, {});
	});

	test("router.addPreHandling - preHandler runs",function(done){
		var route = '/foo';
		var url_obj = {
			url: route,
			method: 'get'
		};
		var preHandler = function() {
			done();
		};
		router.get(route,function(){});
		router.addPreHandling(preHandler);
		router.route(url_obj, {}, null);
	});

	test("router.clearPrerunChain - preHandler runs",function(){
		var route = '/foo';
		var url_obj = {
			url: route,
			method: 'get'
		};
		router.get(route,function(){});
		router.clearPrerunChain();
		assert.deepEqual(router.prerunChain,[],"Expected prerunChain to be empty array");
		assert.equal(router.prerunChain.length,0,"Expected prerunChain to have length of 0");

		router.route(url_obj, {}, null);
	});

	test("parseGetParameters - success",function(done){
		var route = '/test/foo';
		var url_obj = {
			url: route + '?banana=panda',
			method: 'get'
		};
		var handler = function(req,res,data) {
			assert.equal(data.get.banana,'panda',"Expected banana param to be set as panda.");
			done();
		};
		router.get(route,handler);
		router.route(url_obj, {});
	});

	test.skip("parsePostData - success",function(done){
		var route = '/test/foo';
		var url_obj = {
			url: route + '',
			method: 'post',

			setEncoding: function(){}
		};
		var handler = function(req,res,data) {
			assert.equal(data.post.banana,'panda',"Expected banana param to be set as panda.");
			done();
		};
		router.post(route,handler);
		router.route(url_obj, {});
	});

	test("setDefaultHandler",function(){
		var defaultHandler = function() {
			console.log('setDefaultHandler test');
		};
		router.setDefaultHandler(defaultHandler);
		assert.equal(router.default_handler,defaultHandler,"Expected the default_handler to be the set function.");
	});

	test("parseCookies - no cookies", function (done) {
		var route = "/test/cookies";
		var mock_req = {
			url: route,
			method: 'get',
			headers: {}
		};

		var handler = function(req, res, data) {
			assert.isObject(data.cookies, "Expected data to include a cookies object");
			assert.deepEqual(data.cookies, {}, "Expected data.cookies to be an empty object");
			done();
		};

		router.get(route, handler);
		router.route(mock_req, {});
	});
	test("parseCookies - no headers", function (done) {
		var route = "/test/cookies";
		var mock_req = {
			url: route,
			method: 'get'
		};

		var handler = function(req, res, data) {
			assert.isObject(data.cookies, "Expected data to include a cookies object");
			assert.deepEqual(data.cookies, {}, "Expected data.cookies to be an empty object");
			done();
		};

		router.get(route, handler);
		router.route(mock_req, {});
	})

	test("parseCookies - success", function (done) {
		var route = "/test/cookies";
		var mock_req = {
			url: route,
			method: 'get',
			headers: {
				'cookie': 's_fid=70B3BE8552B5E41C-34303384468BE72E; localePreference={"Province":"AB","ProvinceFullName":"Alberta","City":"CALGARY","IsUnknown":false}; location={CGY}!{11}!{}!{CALGARY}!{AB}!{}!{}!{}!{}!{}!{204.209.209 .129}!{}!{}!{Shaw Communications}; service={phone}!{internet1000}!{allDigital}; utag_main=_st:1438011373463$ses_id :1438010119456%3Bexp-session; s_nr=1438009573367-Repeat; s_vnum=1869672822487%26vn%3D3; __utma=201145457 .965732408.1437672823.1438005611.1438009574.3; __utmz=201145457.1438009574.3.3.utmcsr=generated.wifi .shaw.ca|utmccn=(referral)|utmcmd=referral|utmcct=/B284A6FC45/; s_cc=true; s_sq=%5B%5BB%5D%5D; txGUID =70d71e71-99a2-4b2f-a367-49ba607d2c28'
			}
		};

		var handler = function(req, res, data) {
			assert.isObject(data.cookies, "Expected data to include a cookies object");
			assert.equal(data.cookies.s_fid, "70B3BE8552B5E41C-34303384468BE72E", "Expected data.cookies.s_fid in cookies object");
			assert.equal(data.cookies.localePreference, '{"Province":"AB","ProvinceFullName":"Alberta","City":"CALGARY","IsUnknown":false}', "Expected data.cookies.localePreference in cookies object");
			assert.equal(data.cookies.location, "{CGY}!{11}!{}!{CALGARY}!{AB}!{}!{}!{}!{}!{}!{204.209.209 .129}!{}!{}!{Shaw Communications}", "Expected data.cookies.location in cookies object");
			assert.equal(data.cookies.service, "{phone}!{internet1000}!{allDigital}", "Expected data.cookies.service in cookies object");
			assert.equal(data.cookies.utag_main, "_st:1438011373463$ses_id :1438010119456%3Bexp-session", "Expected data.cookies.utag_main in cookies object");
			assert.equal(data.cookies.__utma, "201145457 .965732408.1437672823.1438005611.1438009574.3", "Expected data.cookies.__utma in cookies object");
			assert.equal(data.cookies.txGUID, "70d71e71-99a2-4b2f-a367-49ba607d2c28", "Expected data.cookies.txGUID in cookies object");
			done();
		};

		router.get(route, handler);
		router.route(mock_req, {});
	});

});
