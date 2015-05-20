/*
	loyal v1.0  2015-04-22
	creator changyuan.lcy
*/
"use strict";
var $ = require("../lib/dmimi-mobile");

Array.prototype.last = function() {
	return this[this.length - 1];
};
Array.prototype.insert = function(index, item) {
	if (index < 0) {
		index = (this.length + 1) + index;
	}
	this.splice(index, 0, item);
};

window.loyal = function(project) {
	var self = this;
	var reg = {
		html: "data",
		attr: "(class)|(id)|(type)|(h-[a-z]+)|(href)|(style)|(src)|(controls)|(placeholder)|(height)|(width)|(value)",
		system: "text$|express|html|data",
		param: /\(([a-z\d,\s"']+)\)/,
		removeEx: /\([a-z\d,\s']*\)/
	};

	var domsArr = [];
	var funs = {};

	project.template = {};
	project.memory = {};
	project.data = project.data || {};


	project.render = function(model, data) {

		
		// The JSON template interpreted as HTML format string
		var string = (project.method.parse(model, data, true));
		
		// Static rendering
		var html = $.template(string,data,project.helper);

		return html;
	}

	/*
		Into the actual DOM tree is completed with run interface
		@part if there are param 
	*/
	project.run = function(model, data, name, type) {


		var html = project.render(model, data);
		
		if($.is(html)){ 
			if(model.repeat){
				var express = model.repeat.data
				.replace(/\s/g,"")
				.replace(/([a-zA-Z.']+)/g,function(v){
                    if(v.indexOf("'")!=-1){
                        return v;
                    }
                    return "this."+v;
                });
                var fun;
				eval('fun = function(){return '+express+'}');
                var data = fun.call(project.data);
				if( !data ){
					console.warn("render need data['"+name+"'] but is undefined");
				}
			} 
		}

		var name = (name || project.name);
		var dom = $("[h-name=" + name + "]");


		if($.is(dom)){ 
			throw "can not find dom has attrs 'h-name'='"+name+"' in the DOM tree" ; 
		}

		if(type){
			console.log(dom,type,html);
			dom[type]($(html));
		}else{
			dom.html(html);
		}

		project.method.bind(dom);

	};

	project.data.add = function(key, value, position) {
		var index;
		if(!project.data[key]){
			throw key+" is undefined in data";
		}
		if (position) {
			project.data[key].insert(position, value);
			index = position;
		} else {
			index = project.data[key].push(value);
		}

		project.data.nowData = value;
		project.method.change(key, "add");

		return index - 1;
	};
	
	project.data.remove = function(key, value) {

		if (key.indexOf(".") != -1 || key.indexOf("[") != -1) {
			var arr = key.match(/[a-zA-Z'\d]+/g);
			var end = arr.pop();
			var str = "";
			for (var i = 0; i < arr.length; i++) {
				str += "['" + arr[i] + "']"
			}
			eval("project.data" + str).splice(end, 1);
		} else {
			delete chat.data[key];
		}

		project.method.change(key, "remove");
	};

	// force 强制替换，触发change
	project.data.update = function(key, value, force) {
		if(key.constructor.name == "Array"){
			for(var i = 0; i<key.length; i++){
				project.data.update(key[i],value);
			}
			return;
		}
		if (key.indexOf(".") != -1 || key.indexOf("[") != -1) {

			var arr = key.match(/[a-zA-Z'\d]+/g);
			var end = arr.pop();
			var str = "";
			for (var i = 0; i < arr.length; i++) {
				str += "['" + arr[i] + "']"
			}
			if (eval("project.data" + str)[end] == value) {
				if (!force) {
					return false;
				}
			}

			eval("project.data" + str)[end] = value;

		} else {
			
			if (project.data[key] == value) {
				if (!force) {
					return false;
				}
			}

			project.data[key] = value;

		}

		project.method.change(key, "update");

		return value;
	};

	project.data.get = function(key, type) {
		var temp;
		var arr = [];

		if(key.test && key.compile && key.exec){
			// RegExp
			for(var i in project.data){
				if(i.match(key)){
					arr.push(i);
				}
			}
			return arr;
		}

		return project.data[key];
	};


	project.method = {
		doms: function(dom) {
			return domsArr.push(dom);
		},
		tryCatch: function(express, callback) {
			try {
				if (typeof eval(express) === "function") {
					callback();
				}
			} catch (e) {
				console.log("你定义的类里面找不到这个方法：" + express + " 或者函数执行有误", e);
			}
		},
		change: function(key, mold) {
			for (var i in funs) {

				if (i == "class") {
					for (var k = 0; k < funs[i].length; k++) {
						if (key == funs[i][k].key) {
							if (funs[i][k].express) {

								if (typeof funs[i][k].express == "function") {


									funs[i][k].el.attr("class", funs[i][k].express.apply(funs[i][k].el, funs[i][k].param));
								} else {
									funs[i][k].el.attr("class", eval(funs[i][k].express));
								}
							}
						}
					}
				}

				if (i == "checked") {
					for (var k = 0; k < funs[i].length; k++) {
						funs[i][k].el[0].checked = eval(funs[i][k].express);

					}
				}


				if (i == "value") {
					for (var k = 0; k < funs[i].length; k++) {

						if (key == funs[i][k].key) {
							funs[i][k].el[0].value = eval(funs[i][k].express);
						}
					}
				}


				if (i == "text") {
					for (var k = 0; k < funs[i].length; k++) {

						if (key == funs[i][k].key) {

							funs[i][k].el.text(eval(funs[i][k].express));
						}
					}
				}

				if (i == "style") {
					for (var k = 0; k < funs[i].length; k++) {

						if (key == funs[i][k].key) {

							funs[i][k].el.attr("style", funs[i][k].express());
						}
					}
				}



				if (i == "model") {
					for (var k = 0; k < funs[i].length; k++) {


						if (key == funs[i][k].key) {
							funs[i][k].express.apply(funs[i][k].el, [funs[i][k].param]);
						}
					}
				}

				if (i == "watch") {
					for (var k = 0; k < funs[i].length; k++) {
						if (key == funs[i][k].key) {
							if (mold) {
								if (funs[i][k].mold == mold) {
									funs[i][k].express.apply(funs[i][k].el, [funs[i][k].param]);
								}
							} else {
								funs[i][k].express.apply(funs[i][k].el, [funs[i][k].param]);
							}
						}
					}
				}
			}
		},
		bind: function(dom) {

			// {{ 即使渲染 }}
			// item.burnd | pasrse() 


			// 用于判断是函数，还是属性

			function jude(key, type) {

				if (key.indexOf("(") != -1 || type == "event") {
					return "project.event." + key;
				} else {
					return "project.data." + key;
				}
			}


			$.each(dom.find("[h-class]"), function() {

				var key = $(this).attr("h-class");
				var arr = [];
				var func;
				var param = [];
				var express;

				// 管道表达式

				if (key.indexOf("|") != -1) {
					arr = key.split("|");
					key = arr[0].replace(/\s/g, "");
					func = arr[1].replace(/\s/g, "");

					// 函数第一个参数
					param = [key];
				}

				if (func) {
					if (func.match(reg.param)) {
						param = param.concat(func.match(reg.param)[1].replace(/\s/g, ""));
					}
					express = eval(jude(func).replace(reg.removeEx, ""));

				} else {
					func = key;
					express = jude(func).replace(reg.removeEx, "");
				}
				key = key.replace(/\s/g, "");

				funs["class"] = funs["class"] || [];
				funs["class"].push({
					el: $(this),
					key: key,
					express: express,
					param: param
				});
			});

			$.each(dom.find("[h-checked]"), function() {

				var key = $(this).attr("h-checked");

				funs["checked"] = funs["checked"] || [];
				funs["checked"].push({
					el: $(this),
					key: key,
					express: jude(key)
				});
			});

			$.each(dom.find("[h-value]"), function() {

				var key = $(this).attr("h-value");

				funs["value"] = funs["value"] || [];
				funs["value"].push({
					el: $(this),
					key: key,
					express: jude(key)
				});
			});

			$.each(dom.find("[h-text]"), function() {

				var key = $(this).attr("h-text");
				var el = $(this);

				funs["text"] = funs["text"] || [];
				funs["text"].push({
					el: el,
					key: key,
					express: jude(key)
				});
			});

			// style 这里比较特殊， 由于 {{ }} 这种的会被模板引擎过滤。
			// 所以style 这里采用 { } 在保留关键字，应该会有好的解决办法 (??)
			$.each(dom.find("[h-style]"), function() {

				var key = $(this).attr("h-style");
				var el = $(this);
				var style = $(this).attr("style");
				var express = function() {
					var r = eval('/{[\\s]*' + key + '[\\s]*}/');
					var v = eval(jude(key));
					return style.replace(r, v);
				}

				funs["style"] = funs["style"] || [];
				funs["style"].push({
					el: el,
					key: key,
					express: express
				});
			});


			$.each(dom.find("[h-init]"), function() {

				var key = $(this).attr("h-init");


				var el = this;

				// 可能是多个函数
				var moreArr = key.split(";");

				for (var i = 0; i < moreArr.length; i++) {
					var func = moreArr[i];
					var param = "";

					if (func.match(reg.param)) {
						param = func.match(reg.param)[1];
					}
					var express = jude(func).replace(reg.removeEx, "");

					eval(express).apply(el, [param]);
				}

			});

			$.each(dom.find("[h-watch]"), function() {

				var key = $(this).attr("h-watch");
				var type = $(this).attr("type");
				var el = this;

				var arr = key.replace(/[\s\t]+/g, "").split("|");

				// 可能是多个函数
				var moreArr = arr[1].split(";");

				for (var i = 0; i < moreArr.length; i++) {
					var func = moreArr[i];
					if (!func) {
						throw ("func is undefined");
					}
					var param = "";

					if (func.match(reg.param)) {
						param = func.match(reg.param)[1];
					}
					var express = jude(func).replace(reg.removeEx, "");

					funs["watch"] = funs["watch"] || [];
					funs["watch"].push({
						el: el,
						key: arr[0],
						express: eval(express),
						param: param
					});
				}



			});
			$.each(dom.find("[h-watch-add]"), function() {
				var key = $(this).attr("h-watch-add");
				var type = $(this).attr("type");
				var el = this;
				var mold = "add";
				var arr = key.replace(/[\s\t]+/g, "").split("|");

				// 可能是多个函数
				var moreArr = arr[1].split(";");
				for (var i = 0; i < moreArr.length; i++) {
					var func = moreArr[i];
					if (!func) {
						throw ("func is undefined");
					}
					var param = "";

					if (func.match(reg.param)) {
						param = func.match(reg.param)[1];
					}
					var express = jude(func).replace(reg.removeEx, "");

					funs["watch"] = funs["watch"] || [];
					funs["watch"].push({
						mold: mold,
						el: el,
						key: arr[0],
						express: eval(express),
						param: param
					});
				}
			});
			$.each(dom.find("[h-watch-update]"), function() {

				var key = $(this).attr("h-watch-update");
				var type = $(this).attr("type");
				var el = this;
				var mold = "update";
				var arr = key.replace(/[\s\t]+/g, "").split("|");

				// 可能是多个函数
				var moreArr = arr[1].split(";");
				for (var i = 0; i < moreArr.length; i++) {
					var func = moreArr[i];
					if (!func) {
						throw ("func is undefined");
					}
					var param = "";

					if (func.match(reg.param)) {
						param = func.match(reg.param)[1];
					}
					var express = jude(func).replace(reg.removeEx, "");

					funs["watch"] = funs["watch"] || [];
					funs["watch"].push({
						mold: mold,
						el: el,
						key: arr[0],
						express: eval(express),
						param: param
					});
				}
			});

			$.each(dom.find("[h-model]"), function() {

				var key = $(this).attr("h-model");
				var type = $(this).attr("type");
				var el = this;
				//if(type.match(/(checkbox)|(radio)|/))

				$(this).on("change", function() {
					if (($(this).attr("type") || "").match(/(checkbox)|(radio)/)) {
						project.data[key] = $(this)[0].checked;
					} else if ($(this).attr("type") === "text") {
						project.data[key] = $(this).val();
					}else{
						project.data[key] = $(this).val();
					}

					project.method.change(key);
				});


				if (($(this).attr("type") || "").match(/(checkbox)|(radio)/)) {
					project.data[key] = $(this)[0].checked;
				} else if ($(this).attr("type") === "text") {
					project.data[key] = $(this).val();
				}else{
					project.data[key] = $(this).val();
				}

			});


			// 事件形绑定
			$.each(dom.find("[h-on]"), function() {
				var $el = $(this);
				var key = $el.attr("h-on");

				function doit(str){
					var arr = str.split(":");
					var type = arr[0].replace(/\s/g, "");
					var model = arr[1].replace(/\s/g, "");
					var param = "";
					var selector;

					if (model.match(reg.param)) {
						param = model.match(reg.param)[1].replace(/['"\s]*/g, "");
					}

					var express = jude(model, "event").replace(reg.removeEx, "");

					if (type.indexOf(",") != -1) {
						selector = type.split(",")[1].replace(/\s/g, "");
					}

					if (selector) {

						$el.on(type.split(",")[0], selector, function(e) {
							var el = this;
							var func = eval(express);

							if(func){
								eval(express).apply(el, [e, param]);
								project.method.change(key);
							}

						});
					} else {

						$el.on(type, function(e) {
							var el = this;

							//project.method.tryCatch(express, function() {
								eval(express).apply(el, [e, param]);
								return true;
							//});
							project.method.change(key);
						});
					}
				}
				// 多个事件绑定
				if(key.indexOf(";")!=-1){
					var arr = key.split(";");
					for(var i=0;i<arr.length;i++){
						
						doit(arr[i]);	
					}
				}else{
					doit(key);
				}
			});


		},
		parse: function(model, data) {

			function _eval(r) {
				return eval("/{" + r + "}/g");
			};




			function recursive(obj, hasClosed) {
				var string = "",
					repeat, tagName, childlens = {},
					attrs = {},
					systems = {},
					content = {};

				for (var name in obj) {


					var attr = name.match(reg.attr);
					if (attr) {
						attrs[name] = obj[name];
						continue;
					}

					var system = name.match(reg.system);

					if (system) {
						systems[name] = obj[name];
						continue;
					}
					if (typeof obj[name] == "string") {

						content[name] = obj[name];
						continue;
					}

					var html = name.match(reg.html);
					if (!html) {
						childlens[name] = obj[name];
					}
				}




				for (var name in attrs) {
					switch (name) {
					case "h-text":
					case "h-class":
						string += ' ' + name + '="' + attrs[name] + '"';
						break;

					default:
						string += ' ' + name + '="' + attrs[name] + '"';
						break;
					}


				}


				//标签未闭合
				if (!hasClosed) {
					string += '>';
				}

				for (var name in content) {
					string += content[name];
				}



				for (var name in systems) {
					switch (name) {
					case "text":

						string += systems[name];
						break;

					case "html":
						string += systems[name];
						break;

					case "data":
						break;
					}
				}

				for (var name in childlens) {

					if (name == "repeat") {

						string += "[" + childlens[name].data + "]" + recursive(childlens[name], true) + "[/" + childlens[name].data + "]";

					} else {
						string += '<' + name.replace(/-\d/, '') + recursive(childlens[name], false) + '</' + name.replace(/-\d/, '') + '>';
					}
				}

				return string;
			}

			return recursive(model, true);
		}
	};

	project.data = project.data || {};
	window.loyalSubClass = window.loyalSubClass || {};
	window.loyalSubClass[project.name] = project;

	return project;

};

loyal.init = function(){
	
	var subClass = window.loyalSubClass || {};

	$.each($("[h-controller]"),function(){
	
		var name = $(this).attr("h-controller");
	
		if(subClass[name]){
			subClass[name].init();
		}else{
			throw "can not find this model "+name;
		}
	
	});
};

window.loyal = loyal;


module.exports =  loyal;
