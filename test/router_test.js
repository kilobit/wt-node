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
			setEncoding: function(){}
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
			method: 'put'
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

});
