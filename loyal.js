//@setting UTF-8
"use strict";

/**
 * @name loyal
 * @version 0.2.6
 * @author changyuan.lcy
 * @nead jQuery 1.8+
 * @log 静态渲染支持函数式 0.1.3
 * @log 添加h-model 对控件raido checkbox 的value属性有者取值 0.1.4
 * @log 转移工具类函数到loyal下 0.1.5
 * @log 让loyal支持module.exports 0.1.6
 * @log h-text 绑定支持{}单括号模板表达式 0.1.7
 * @log 公开私有成员tool 0.1.8
 * @log 添加h-html 和 h-text 使用雷同，只是使用innerHTML 0.1.9
 * @log run函数添加作用域选择范围 0.2.0
 * @log 增强tool.paramToJson 的功能支持地址栏参数解析 0.2.1
 * @log fixed keyName转换为class 的bug 0.2.1
 * @log fixed watch-update 的bug 0.2.3
 * @log 新增 complete Funs 
 * @log 对模板引擎添加try catch 捕获错误信息 0.2.5
 * @log watch-update 的bug 0.2.6
*/

/*
 * todo
 * [1] 规范静态渲染，和动态渲染，
 * [2] watch 好需要好好考虑
 * [3] run 局部渲染
 * [4] 事件回调包括 helper on init complete 参数格式统一
 * [5] 正则统一管理
 * [6] 错误信息
*/



/** 
 * es5
 * @private 
*/
(function(){
    
    Array.prototype.last = function() {
        return this[this.length - 1]
    };
    Array.prototype.insert = function(index, item) {
        if (index < 0) {
            index = (this.length + 1) + index
        }
        this.splice(index, 0, item)
    };
    Array.prototype.clear = function(index, item) {
        var arr = [];
        for(var i=0;i<this.length;i++){
            if(this[i]){
                arr.push(this[i]);
            }
        }
        return arr;
    };
    if (!Object.keys) {
        Object.keys = (function() {
            var hasOwnProperty = Object.prototype.hasOwnProperty,
                hasDontEnumBug = !({
                    toString: null
                }).propertyIsEnumerable('toString'),
                dontEnums = ['toString', 'toLocaleString', 'valueOf', 'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable', 'constructor'],
                dontEnumsLength = dontEnums.length;
            return function(obj) {
                if (typeof obj !== 'object' && typeof obj !== 'function' || obj === null) throw new TypeError('Object.keys called on non-object');
                var result = [];
                for (var prop in obj) {
                    if (hasOwnProperty.call(obj, prop)) result.push(prop)
                }
                if (hasDontEnumBug) {
                    for (var i = 0; i < dontEnumsLength; i++) {
                        if (hasOwnProperty.call(obj, dontEnums[i])) result.push(dontEnums[i])
                    }
                }
                return result
            }
        })()
    };
    if (!window.console) {
        window.console = {};
        var funcs = ['assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error', 'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log', 'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd', 'timeStamp', 'trace', 'warn'];
        for (var i = 0; i < funcs.length; i++) {
            console[funcs[i]] = function() {}
        }
    }
})();





/** 
 * main
 * @class
 * 
*/
(function($){
    if(!$){
        throw "loyal need jQuery"
    }
    function loyal(project, parent) {
        var self = this;

        /** 
         * REG
         * @static 
        */
        var REG = {
            html: "data",
            attr: "(^class$)|(^id$)|(^type$)|(^h-[a-z]+)|(^href$)|(^style$)|(^src$)|(^controls$)|(^placeholder$)|(^height$)|(^width$)|(^value$)|(^for$)|(^data-)|(^name$)|(^checked$)|(^target$)",
            system: "text$|express|html|data$|protocol",
            param: /\(([^)]+)\)/,
            removeEx: /\([^)]*\)/,
            prop: /[a-zA-Z'"]+/g,

            // test it is template conditions
            tpl:/^{{[^\}]+}}$/
        };

        /** 
         * project
         * @private 
        */
        var project = project || {};

        /** 
         * extend
         * @private 
        */
        var extend = function(dest, src, merge) {
            var keys = Object.keys(src);
            var i = 0;
            while (i < keys.length) {
                if (!merge || (merge && dest[keys[i]] === undefined)) {
                    dest[keys[i]] = src[keys[i]]
                }
                i++
            }
            return dest
        }

        /** 
         * uuid
         * @private 
        */
        var returnUUID = function(){
            loyal.uuid = loyal.uuid || 0;
            loyal.uuid++;
            return loyal.uuid;
        }

        /** 
         * add some funs 
         * @exports 
        */
        var tool = loyal.tool;

        /** 
         * child
         * @private 
        */
        function Internal(options) {
            var self = this;
            var domsArr = [];
            this.funs = {};
            this.controller = options.controller;
            if (this.controller) {
                this.wrap = $("[h-controller=" + self.controller + "]")
            } else {
                this.wrap = $("body")
            }
            this.memory = {};

            this.data = extend({}, options.data || {});
            if (!options.init) {
                options.init = function() {
                    this.run()
                }
            }
            if(options.view && !tool.isObject(options.view)){
                throw "property view must be object";
            }
            if(options.data && !tool.isObject(options.data)){
                throw "property data must be object";
            }
            if(options.name && !tool.isString(options.name)){
                throw "property name must be string";
            }
            if(options.event && !tool.isObject(options.event)){
                throw "property event must be object";
            }
            if(options.helper && !tool.isObject(options.helper)){
                throw "property helper must be object";
            }

            this.uuid = returnUUID();
            this.view = options.view || {};
            this.helper = options.helper;
            this.event = options.event;
            this.name = options.name;
            this.plugin = [];
            this.custom = options.custom;
            this.net = options.net || {};
            this.exports = options.exports || {};
            this.nodes = {};
            this.completeFunList = [];

            this.route = function(page){
                window.location.href = "#"+page;
            }
            this.view.protocol = function() {
                return extend({}, JSON.parse(JSON.stringify(options.view)))
            }
            this.render = function(model, data) {
                var string = (this.method.parse(model, data, true));
                try{
                    var html = tool.template(string, data, this.helper, self);
                }catch(e){
                    console.log(e);
                    var html = "解析模板错误";
                }
                var dom = $(html);
                if (window.customTags) {
                    window.parseCustomTags(window.customTags)
                }
                return html;
            }
            this.init = function(json) {
                if(options.title){
                    document.title = options.title;
                }
                options.init.call(this, json)
            };
            this.route = function(param) {
                window.location.href = window.location.href + "/" + param
            }

            /**
             * @exports run
             * @param {object} view json tpl
             * @param {object} data json Data
             * @param {string} name dom target where it want to push in
             * @param {string} type insertType append or after and before ...
             * @param {object} wrap dom scope
            */
            this.run = function(view, data, name, type, wrap) {
                if (!view) {
                    view = self.view;
                }
                if (!data) {
                    data = self.data;
                }
                var html = this.render(view, data);
                var newDom = null;
                if (!html) {
                    if (view.repeat) {
                        var express = view.repeat.data.replace(/\s/g, "").replace(/([a-zA-Z.']+)/g, function(v) {
                            if (v.indexOf("'") != -1) {
                                return v;
                            }
                            return "this." + v;
                        });
                        var fun;
                        eval('fun = function(){return ' + express + '}');
                        var data = fun.call(self.data);
                        if (!data) {
                            console.warn("render need data['" + name + "'] but is undefined")
                        }
                    }
                }
                // 插入作用范围，首先是设定，其次是自己本身，最后是controller
                wrap = wrap || this.dom || this.wrap;
                if (!name) {
                    var dom = wrap.find("[h-name=" + this.name + "]");
                    this.dom = dom
                } else {
                    if (typeof name == "object") {
                        var dom = name
                    } else {
                        var dom = wrap.find("[h-name=" + name + "]")
                    }
                }
                if (!dom[0]) {
                    console.warn("can not find dom has attrs 'h-name'='" + name + "' in the DOM tree");
                    return
                }
                if (type && type.match(/replace/)) {
                    newDom = $(html);
                    dom.after(newDom);
                    dom.remove();
                    dom = newDom
                } else if (type && type.match(/(^append$)|(^after$)|(^before$)|(^prepend$)/)) {
                    dom[type]($(html))
                } else {
                    dom.html(html)
                }
                this.method.bind(dom);
                $.each(dom.find("[h-plugin]"), function() {
                    var pluginName = $(this).attr("h-plugin");
                    if (!pluginName) return;
                    var num = pluginName.split("-")[1];
                    var name = pluginName.split("-")[0];
                    self.plugin[num].el = this;
                    self.plugin[num] = loyal.pluginSup[name](self.plugin[num]);
                    self.plugin[num].init()
                });
                self.complete = true
                self.completeFunList.forEach(function(item){
                    item[0].apply(self,item[1]);
                });
            };



            /**
             * @exports getView
             * @param {string} key,
             * @return {object}
            */
            this.getView = function(key,obj){
                var temp = tool.findKey(obj||this.view,key);
                return temp;
            }
            /**
             * @exports getViewParent
             * @param {string} key,
             * @return {object}
            */
            this.getViewParent = function(key,obj){
                var temp = tool.findKey(obj||this.view,key,true);
                return temp;
            }

            /**
             * @exports data.add
             * @param {string} key, 
             * @param {all} value, 
             * @param {int} position, array index
            */
            this.data.add = function(key, value, position) {
                var index;
                if (!self.data[key]) {
                    throw key + " is undefined in data";
                }
                if (position || position == 0) {
                    self.data[key].insert(position, value);
                    index = position
                } else {
                    index = self.data[key].push(value)
                }
                self.data.nowData = value;
                self.method.change(key, "add");
                return index - 1;
            };

            /**
             * @exports data.remove
             * @param {string} key, 
             * @param {all} value, 
            */
            this.data.remove = function(key, value) {
                if (key.indexOf(".") != -1 || key.indexOf("[") != -1) {
                    var arr = key.match(REG.prop);
                    var end = arr.pop();
                    var str = "";
                    for (var i = 0; i < arr.length; i++) {
                        str += "['" + arr[i] + "']"
                    }
                    eval("self.data" + str).splice(end, 1)
                } else {
                    delete chat.data[key]
                }
                self.method.change(key, "remove")
            };

            /**
             * @exports data.update
             * @param {string} key, 
             * @param {all} value, 
             * @param {boolean} norepeatBoolean, to control forced change
            */
            this.data.update = function(key, value, norepeatBoolean) {
                if (key.constructor === Array) {
                    for (var i = 0; i < key.length; i++) {
                        self.data.update(key[i], value);
                    }
                    return
                }
                if (key.indexOf(".") != -1 || key.indexOf("[") != -1) {
                    var arr = key.match(REG.prop);
                    var end = arr.pop();
                    var str = "";
                    for (var i = 0; i < arr.length; i++) {
                        str += "['" + arr[i] + "']"
                    }
                    if (norepeatBoolean) {
                        if (eval("self.data" + str)[end] == value) {
                            return value;
                        }
                    }
                    eval("self.data" + str)[end] = value;
                } else {
                    if (norepeatBoolean) {
                        if (self.data[key] == value) {
                            return value
                        }
                    }
                    self.data[key] = value;
                }
                self.method.change(key, "update");
                return value
            };

            /**
             * @exports data.get
             * @param {string} key, support RegExp
            */
            this.data.get = function(key) {
                var temp;
                var arr = [];
                if (key.test && key.compile && key.exec) {
                    for (var i in self.data) {
                        if (i.match(key)) {
                            arr.push(i)
                        }
                    }
                    return arr
                }
                return self.data[key]
            };

            /**
             * @exports data.clear
             * @param {string} key, support RegExp
            */
            this.data.clear = function(){
                for(var i in self.data){
                    if(typeof(self.data[i])!=="function"){
                        delete self.data[i];
                    }
                }
            }

            
            /**
             * @exports method
             * @return {object}, @class
            */
            this.method = {
                doms: function(dom) {
                    return domsArr.push(dom)
                },
                tryCatch: function(express, callback) {
                    try {
                        if (typeof eval(express) === "function") {
                            callback()
                        }
                    } catch (e) {
                        console.log("你定义的类里面找不到这个方法：" + express + " 或者函数执行有误", e)
                    }
                },
                change: function(key, mold) {
                    var funs = self.funs;
                    for (var i in funs) {
                        if (i == "class") {
                            for (var k = 0; k < funs[i].length; k++) {
                                if (key == funs[i][k].key) {
                                    if (funs[i][k].express) {
                                        if (typeof funs[i][k].express == "function") {
                                            funs[i][k].el.attr("class", funs[i][k].express.apply(self, funs[i][k].param.concat(funs[i][k].el)))
                                        } else {
                                            funs[i][k].el.attr("class", eval(funs[i][k].express))
                                        }
                                    }
                                }
                            }
                        }
                        if (i == "checked") {
                            for (var k = 0; k < funs[i].length; k++) {
                                if(key == funs[i][k].key){
                                    funs[i][k].el[0].checked = eval(funs[i][k].express)
                                }
                            }
                        }
                        if (i == "value") {
                            for (var k = 0; k < funs[i].length; k++) {
                                if (key == funs[i][k].key) {
                                    if(funs[i][k].el[0].nodeName.toLowerCase() == "img"){
                                        funs[i][k].el[0].src = eval(funs[i][k].express);
                                    }else{
                                        funs[i][k].el[0].value = eval(funs[i][k].express)
                                    }
                                }
                            }
                        }
                        if (i == "text") {
                            for (var k = 0; k < funs[i].length; k++) {
                                if (key == funs[i][k].key) {
                                    if(funs[i][k].text){
                                        funs[i][k].el.text(funs[i][k].text.replace(/{[^}]*}/,eval(funs[i][k].express)));
                                    }else{
                                        funs[i][k].el.text(eval(funs[i][k].express));
                                    }
                                }
                            }
                        }
                        if (i == "html") {
                            for (var k = 0; k < funs[i].length; k++) {
                                if (key == funs[i][k].key) {
                                    if(funs[i][k].text){
                                        funs[i][k].el.html(funs[i][k].text.replace(/{[^}]*}/,eval(funs[i][k].express)));
                                    }else{
                                        funs[i][k].el.html(eval(funs[i][k].express));
                                    }
                                }
                            }
                        }
                        if (i == "style") {
                            for (var k = 0; k < funs[i].length; k++) {
                                if (key == funs[i][k].key) {
                                    funs[i][k].el.attr("style", funs[i][k].express())
                                }
                            }
                        }
                        if (i == "model") {
                            for (var k = 0; k < funs[i].length; k++) {
                                if (key == funs[i][k].key) {
                                    funs[i][k].express.apply(funs[i][k].el, [funs[i][k].param])
                                }
                            }
                        }
                        if (i == "_watch") {
                            for (var k = 0; k < funs[i].length; k++) {
                                if (key == funs[i][k].key) {
                                    if (mold) {
                                        if (funs[i][k].mold == mold) {
                                            if (!funs[i][k].express) {
                                                console.warn("express is undefined, the express is create by key and it's type");
                                                return
                                            }
                                            funs[i][k].express.apply(self, [funs[i][k].el, funs[i][k].param])
                                        }
                                    } else {
                                        funs[i][k].express.apply(self, [funs[i][k].el, funs[i][k].param])
                                    }
                                }
                            }
                        }
                    }
                },

                /** 
                 * bind 
                 * @export
                 * @param {object} dom, dom 
                */
                bind: function(dom) {
                    function funsAdd(arr, options) {
                        arr = arr || [];
                        var isHas = false;
                        if (!options.mold) {
                            options.mold = 1
                        }
                        if (!options.express) {
                            options.express = 1
                        }
                        arr.forEach(function(item, i) {
                            if (item.key == options.key && item.mold == options.mold && item.express.toString() == options.express.toString()) {
                                arr[i] = null;
                                arr[i] = options;
                                isHas = true
                            }
                        });
                        if (!isHas) {
                            arr.push(options)
                        }
                        return arr
                    }
                    var funs = self.funs;

                    function jude(key, type) {
                        if (key.indexOf("(") != -1 || type == "event") {
                            return "self.event." + key
                        } else {
                            return "self.data." + key
                        }
                    }
                    $.each(dom.find("[h-class]"), function() {
                        if (this.loyalBind_class) {
                            return
                        }
                        this.loyalBind_class = true;
                        var key = $(this).attr("h-class");
                        var arr = [];
                        var func;
                        var param = [];
                        var express;
                        if (key.indexOf("|") != -1) {
                            arr = key.split("|");
                            key = arr[0].replace(/\s/g, "");
                            func = arr[1].replace(/\s/g, "");
                            param = [key]
                        }
                        if (func) {
                            if (func.match(REG.param)) {
                                param = param.concat(func.match(REG.param)[1].replace(/\s/g, ""))
                            }
                            express = eval(jude(func).replace(REG.removeEx, ""))
                        } else {
                            func = key;
                            express = jude(func).replace(REG.removeEx, "")
                        }
                        key = key.replace(/\s/g, "");
                        funs["class"] = funsAdd(funs["class"], {
                            el: $(this),
                            key: key,
                            express: express,
                            param: param
                        });
                        $(this).removeAttr("h-class")
                    });

                    $.each(dom.find("[h-checked]"), function() {

                        if(this.loyalBind_checked){
                            return;
                        }
                        this.loyalBind_checked = true;

                        var key = $(this).attr("h-checked");

                         funs["checked"] = funsAdd(funs["checked"],{
                            el: $(this),
                            key: key,
                            express: jude(key)
                        });


                        $(this).removeAttr("h-checked");
                    });

                    $.each(dom.find("[h-value]"), function() {
                        if (this.loyalBind_value) {
                            return
                        }
                        this.loyalBind_value = true;
                        var key = $(this).attr("h-value");
                        funs["value"] = funsAdd(funs["value"], {
                            el: $(this),
                            key: key,
                            express: jude(key)
                        });
                        $(this).removeAttr("h-value")
                    });
                    $.each(dom.find("[h-html]"), function() {
                        if (this.loyalBind_html) {
                            return
                        }
                        this.loyalBind_html = true;
                        var key = $(this).attr("h-html");
                        var text;
                        var express;
                        if(key.match(/{[^}]*}/)){
                            // has {{}} tpl
                            text = key;
                            key = key.match(/{[^}]*}/)[0].replace(/[{}]/g,"");
                        }

                        express = jude(key);
                        var el = $(this);
                        funs["html"] = funsAdd(funs["html"], {
                            el: el,
                            key: key,
                            express: express,
                            text:text
                        });
                        $(this).removeAttr("h-html")
                    });

                    $.each(dom.find("[h-text]"), function() {
                        if (this.loyalBind_text) {
                            return
                        }
                        this.loyalBind_text = true;
                        var key = $(this).attr("h-text");
                        var text;
                        var express;
                        if(key.match(/{[^}]*}/)){
                            // has {{}} tpl
                            text = key;
                            key = key.match(/{[^}]*}/)[0].replace(/[{}]/g,"");
                        }

                        express = jude(key);
                        var el = $(this);
                        funs["text"] = funsAdd(funs["text"], {
                            el: el,
                            key: key,
                            express: express,
                            text:text
                        });
                        $(this).removeAttr("h-text")
                    });



                    $.each(dom.find("[h-style]"), function() {
                        if (this.loyalBind_style) {
                            return
                        }
                        this.loyalBind_style = true;
                        var key = $(this).attr("h-style");
                        var el = $(this);
                        var style = $(this).attr("style");
                        var express = function() {
                                var r = eval('/{[\\s]*' + key + '[\\s]*}/');
                                var v = eval(jude(key));
                                return style.replace(r, v)
                            }
                        funs["style"] = funsAdd(funs["style"], {
                            el: el,
                            key: key,
                            express: express
                        });
                        $(this).removeAttr("h-style")
                    });
                    $.each(dom.find("[h-init]"), function() {
                        if (this.loyalBind_init) {
                            return
                        }
                        this.loyalBind_init = true;
                        var key = $(this).attr("h-init");
                        var el = this;
                        var moreArr = key.split(";");
                        for (var i = 0; i < moreArr.length; i++) {
                            var func = moreArr[i];
                            var param = [key];
                            if (func.match(REG.param)) {
                                param = param.concat(func.match(REG.param)[1].replace(/\s/g, ""))
                            }
                            var express = jude(func).replace(REG.removeEx, "");
                            eval(express).apply(self, [el, param])
                        }
                        $(this).removeAttr("h-init")
                    });

                    // 渲染完成之后才执行的函数
                    $.each(dom.find("[h-complete]"), function() {

                        var key = $(this).attr("h-complete");
                        var el = this;
                        var param = [el];
                        if (key.match(REG.param)) {
                            param = param.concat(key.match(REG.param)[1].replace(/\s/g, ""))
                        }
                        var express = jude(key).replace(REG.removeEx, "");
                        var funs = eval(express);
                        self.completeFunList.push([funs,param]);
                    });


                    $.each(dom.find("[h-watch]"), function() {
                        if (this.loyalBind_watch) {
                            return
                        }
                        this.loyalBind_watch = true;
                        var key = $(this).attr("h-watch");
                        var type = $(this).attr("type");
                        var el = $(this);
                        var arr = key.replace(/[\s\t]+/g, "").split("|");
                        var moreArr = arr[1].split(";");
                        for (var i = 0; i < moreArr.length; i++) {
                            var func = moreArr[i];
                            if (!func) {
                                throw ("func is undefined");
                            }
                            var param = [key];
                            if (func.match(REG.param)) {
                                param = param.concat(func.match(REG.param)[1].replace(/\s/g, ""))
                            }
                            var express = jude(func).replace(REG.removeEx, "");
                            funs["_watch"] = funsAdd(funs["_watch"], {
                                el: el,
                                key: arr[0],
                                express: eval(express),
                                param: param
                            })
                        }
                        $(this).removeAttr("h-watch")
                    });
                    $.each(dom.find("[h-watch-add]"), function() {
                        if (this.loyalBind_watch_add) {
                            return
                        }
                        this.loyalBind_watch_add = true;
                        var key = $(this).attr("h-watch-add");
                        var type = $(this).attr("type");
                        var el = $(this);
                        var mold = "add";
                        var arr = key.replace(/[\s\t]+/g, "").split("|");
                        var moreArr = arr[1].split(";");
                        for (var i = 0; i < moreArr.length; i++) {
                            var func = moreArr[i];
                            if (!func) {
                                throw ("func is undefined");
                            }
                            var param = [key];
                            if (func.match(REG.param)) {
                                param = param.concat(func.match(REG.param)[1].replace(/\s/g, ""))
                            }
                            var express = jude(func).replace(REG.removeEx, "");
                            funs["_watch"] = funsAdd(funs["_watch"], {
                                mold: mold,
                                el: el,
                                key: arr[0],
                                express: eval(express),
                                param: param
                            })
                        }
                        $(this).removeAttr("h-watch-add")
                    });
                    $.each($.merge(dom, dom.find("[h-watch-update]")), function() {
                        if (this.loyalBind_watch_update) {
                            return
                        }
                        this.loyalBind_watch_update = true;
                        var key = $(this).attr("h-watch-update");
                        if (!key) {
                            return
                        }
                        var type = $(this).attr("type");
                        var el = $(this);
                        var mold = "update";
                        var arr = key.replace(/[\s\t]+/g, "").split("|");
                        var key_name = arr[0].replace(/\s/g, "");
                        var param = [key_name];
                        if(!arr[1]){
                            throw "h-watch-update error"+arr;
                        }
                        var moreArr = arr[1].split(";");
                        for (var i = 0; i < moreArr.length; i++) {
                            var func = moreArr[i];
                            if (!func) {
                                throw ("func is undefined");
                            }
                            if (func.match(REG.param)) {
                                param = param.concat(func.match(REG.param)[1].replace(/\s/g, ""))
                            }
                            var express = jude(func).replace(REG.removeEx, "");
                            funs["_watch"] = funsAdd(funs["_watch"], {
                                mold: mold,
                                el: el,
                                key: arr[0],
                                express: eval(express),
                                param: param
                            })
                        }
                        $(this).removeAttr("h-watch-update")
                    });
                    $.each(dom.find("[h-hide]"), function() {
                        var key = $(this).attr("h-hide");
                        if(key&&key!="0"){
                            $(this).hide();
                        }else{
                            $(this).show();
                        }
                    });
                    $.each(dom.find("[h-model]"), function() {
                        if (this.loyalBind_model) {
                            return
                        }
                        this.loyalBind_model = true;
                        var key = $(this).attr("h-model");
                        var type = $(this).attr("type");
                        var el = this;
                        var arr = [];
                        var param;
                        var func;
                        var express;
                        if (key.indexOf("|") != -1) {
                            arr = key.split("|");
                            key = arr[0].replace(/\s/g, "");
                            func = arr[1].replace(/\s/g, "");
                            param = [key]
                        }
                        if (func) {
                            if (func.match(REG.param)) {
                                param = param.concat(func.match(REG.param)[1].replace(/\s/g, ""))
                            }
                            express = jude(func).replace(REG.removeEx, "")
                        } else {}
                        key = key.replace(/\s/g, "");
                        $(this).on("change", function() {
                            if (($(this).attr("type") || "").match(/(checkbox)|(radio)/)) {
                                if($(this).val()){
                                    console.log($(this).val())
                                    self.data[key] = $(this).val();
                                }else{
                                    self.data[key] = $(this)[0].checked;
                                }
                            } else if ($(this).attr("type") === "text") {
                                self.data[key] = $(this).val()
                            } else {
                                self.data[key] = $(this).val()
                            }
                            if (express) {
                                eval(express).apply(self, [this].concat(param))
                            }
                            self.method.change(key)
                        });
                        if (($(this).attr("type") || "").match(/(checkbox)|(radio)/)) {
                            if($(this).val()){
                                self.data[key] = $(this).val();
                            }else{
                                self.data[key] = $(this)[0].checked;
                            }
                        } else if ($(this).attr("type") === "text") {
                            self.data[key] = $(this).val()
                        } else {
                            self.data[key] = $(this).val()
                        }
                        self.nodes[key] = this;
                        $(this).removeAttr("h-model")
                    });
                    $.each($.merge(dom, dom.find("[h-on]")), function() {
                        if (this.loyalBind_on) {
                            return
                        }
                        this.loyalBind_on = true;
                        var $el = $(this);
                        var key = $el.attr("h-on");
                        //$(this).removeAttr("h-on");
                        if (!key) return;

                        function doit(str) {
                            var type = str.match(/([^:]+):/)[0].replace(":","");
                            var model = str.replace(type,"").replace(":","");
                            var param = "";
                            var selector;
                            if (model.match(REG.param)) {
                                param = model.match(REG.param)[1].replace(/['"\s]*/g, "");
                                param = param.split(",")
                            }
                            var express = jude(model, "event").replace(REG.removeEx, "");
                            if (type.indexOf(",") != -1) {
                                selector = type.split(",")[1].replace(/\s/g, "")
                            }
                            if (selector) {
                                $el.on(type.split(",")[0], selector, function(e) {
                                    var el = this;
                                    var func = eval(express);
                                    if (func) {
                                        if(typeof func != "function"){
                                            throw (self.name||"self")+".event."+model+" is undefined";
                                        }
                                        eval(express).apply(self, [el, e].concat(param));
                                        self.method.change(key)
                                    }
                                })
                            } else {
                                $el.on(type, function(e) {
                                    var el = this;
                                    if(typeof eval(express) != "function"){
                                        throw (self.name||"self")+".event."+model+" is undefined";
                                    }
                                    eval(express).apply(self, [el, e].concat(param));
                                    return true;
                                    self.method.change(key)
                                })
                            }
                        }
                        if (key.indexOf(";") != -1) {
                            var arr = key.split(";");
                            for (var i = 0; i < arr.length; i++) {
                                doit(arr[i])
                            }
                        } else {
                            doit(key)
                        }
                    })
                },

                /** 
                 * parse 
                 * @private
                */
                parse: function(model, data) {
                    function _eval(r) {
                        return eval("/{" + r + "}/g")
                    };

                    function recursive(obj, hasClosed) {
                        var string = "",
                            repeat, tagName, childlens = {},
                            attrs = {},
                            systems = {},
                            content = {};
                        for (var name in obj) {
                            var attr = name.match(REG.attr);
                            if (attr) {
                                attrs[name] = obj[name];
                                continue
                            }
                            var system = name.match(REG.system);
                            if (system) {
                                systems[name] = obj[name];
                                continue
                            }
                            if (typeof obj[name] == "string") {
                                content[name] = obj[name];
                                continue
                            }
                            var html = name.match(REG.html);
                            if (!html) {
                                childlens[name] = obj[name]
                            }
                        }
                        for (var name in attrs) {
                            switch (name) {
                            case "h-text":
                            case "h-class":
                                string += ' ' + name + '="' + attrs[name] + '"';
                                break;
                            case "h-plugin":
                                var setting = attrs[name]();
                                self.plugin.push(setting);
                                var uuid = self.plugin.length - 1;
                                string += ' ' + name + '="' + setting.name + "-" + uuid + '"';
                                break;
                            default:
                                if(typeof attrs[name] == "function"){
                                    attrs[name] = attrs[name].call(self);
                                }
                                string += ' ' + name + '="' + attrs[name] + '"';
                                break
                            }
                        }
                        if (!hasClosed) {
                            string += '>'
                        }
                        for (var name in content) {
                            string += content[name]
                        }
                        for (var name in systems) {
                            switch (name) {
                            case "text":
                                if(typeof systems[name] == "function"){
                                    systems[name] = systems[name].call(self);
                                }
                                string += systems[name];
                                break;
                            case "html":
                                string += systems[name];
                                break;
                            case "data":
                                break
                            }
                        }
                        for (var name in childlens) {
                            if (name == "repeat") {
                                string += "[" + childlens[name].data + "]" + recursive(childlens[name], true) + "[/" + childlens[name].data + "]"
                            } else {
                                // it is a class .can sett nodeName div
                                if(name.indexOf(".")==0 || (name.indexOf("_")==0 && name.length>1)){
                                    var className ;
                                    if(name.indexOf(".")==0 ){
                                       className = name.replace(/^./,"");
                                    }else{
                                        if(name.indexOf("_")==0){
                                            className = name.replace(/^_/,"");
                                        }
                                    }
                                    className = className.replace(/(-|_)[\d._]+$/g, '');
                                    /**
                                     * because it is in loop .if you set new prop it will to go again;
                                     * now i am through != 
                                    */

                                    if(childlens[name].class){
                                        if(childlens[name].class.indexOf(className)==-1){
                                            childlens[name].class = className+" " +childlens[name].class;
                                        }
                                    }else{

                                        childlens[name].class = className;
                                    }
                                    string += '<div' + recursive(childlens[name], false) + '</div>';
                                }else{
                                    string += '<' + name.replace(/(-|_)[\d._]+$/g, '') + recursive(childlens[name], false) + '</' + name.replace(/(-|_)[\d._]+$/g, '') + '>'
                                }
                            }
                        }
                        return string
                    }
                    return recursive(model, true)
                }
            }
        }
        Internal.protocolName = project.name;

        /**
         * @private 
        */
        Internal.prototype._default = project;

        /**
         * @exports 
        */
        Internal.prototype.clone = function(name){
            if(!name){
                throw "name must be have";
            }

            var deepClone = function(sObj){   
                if(typeof sObj !== "object"){   
                    return sObj;   
                }
                var s = {};
                if(sObj.constructor == Array){ 
                    s = [];
                }
                for(var i in sObj){   
                    s[i] = deepClone(sObj[i]);   
                }   
                return s;   
            } 

            var newObject = deepClone(this._default);
                newObject.name = name;
            return loyal(newObject);
        }

        var options = {};
        extend(options, project);
        var exports = new Internal(options);
        
        window.loyalSubClass = window.loyalSubClass || {};
        window.loyalSubClass[exports.name] = exports;

        return exports;
    }
    loyal.tool = (function(){
        var tool = {
            upId:function(){
                this.i = this.i || 0;
                this.i++;
                return this.i;
            },
            isObject:function(obj) {
                var type = typeof obj;
                return !!obj && (type == 'object' || type == 'function');
            },
            isString:function(obj){
                if(typeof obj=="string"){
                    return true;
                }else{
                    return false;
                }
            },
            isArray: function(obj) { 
                return Object.prototype.toString.call(obj) === '[object Array]'; 
            },
            isEmpty:function(obj){
                if(obj == null || obj == "" || JSON.stringify(obj) == "[]" || JSON.stringify(obj) == "{}" || obj == "undefined" || obj == undefined ){
                    return true;
                }else{
                    return false;
                }
            },
            findKey:function(object,key,parent){
                var self = this;
                var value;
                function find(obj){
                    for(var i in obj){
                        if(i==key){
                            if(parent){
                                value = obj;
                                break;
                            }
                            value = obj[i];
                        }else{
                            if(self.isObject(obj[i])){
                                find(obj[i]);
                            }
                        }
                    }
                }
                find(object);
                return value;
            },
            deepGet:function(object, path, defaultValue){
                var self = this;

                function baseGet(object, path, pathKey) {
                    if (object == null) {
                        return;
                    }
                    if (pathKey !== undefined && pathKey in toObject(object)) {
                        path = [pathKey];
                    }
                    var index = 0,
                    length = path.length;

                    while (object != null && index < length) {
                        object = object[path[index++]];
                    }
                    return (index && index == length) ? object : undefined;
                }

                function toObject(value) {
                    return self.isObject(value) ? value : Object(value);
                }

                function baseToString(value) {
                    if (typeof value == 'string') {
                        return value;
                    }
                    return value == null ? '' : (value + '');
                }



                /** Used to match property names within property paths. */
                var rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\n\\]|\\.)*?)\2)\]/g;

                /** Used to match backslashes in property paths. */
                var reEscapeChar = /\\(\\)?/g;

                function toPath(value) {
                    if (self.isArray(value)) {
                        return value;
                    }
                    var result = [];
                    baseToString(value).replace(rePropName, function(match, number, quote, string) {
                        result.push(quote ? string.replace(reEscapeChar, '$1') : (number || match));
                    });
                    return result;
                }
                
                var result = object == null ? undefined : baseGet(object, toPath(path), path + '');
                return result === undefined ? defaultValue : result;
                
            },
            urlParam: function(name, url) {
                var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
                var r = (url || window.location.search).substr(1).match(reg);
                if (r != null) return unescape(r[2]);
                return null;
            },
            paramToJson:function(str){
                if(!str){
                    str = window.location.href;
                }
                if(str.indexOf("?")!=-1){
                    str = str.split("?")[1];
                }
                var arr = str.split("&"),arr2 = [],temp = {},i;
                for(i=0;i<arr.length;i++){
                    arr2 = arr[i].split("=");
                    temp[arr2[0]]=arr2[1];
                }
                return temp;
            },
            encode: function(str) {
                return str.replace(/\W/g, "_")
            },
            xss: function(s) {
                var div = document.createElement('div');
                div.appendChild(document.createTextNode(s));
                return div.innerHTML
            },
            htmlCode: function(s) {
                var div = document.createElement('div');
                div.innerHTML = s;
                return div.innerHTML;
            },
            htmlDecode:function(s){
                var div = document.createElement('div');
                div.innerHTML = s;
                return div.innerText || div.textContent;
            },
            textCode: function(s) {
                var div = document.createElement('div');
                div.innerHTML = s;
                div.innerHTML = div.innerText || div.textContent;
                return div.innerText || div.textContent
            },
            template: function(str, json, custom, proxy) {
                var str = str;
                json = json || {};
                var _eval = function(r) {
                        return eval("/{{[\\s]*" + r + "[\\s]*}}/g")
                    };
                var reg = {
                    futher: /{([a-zA-Z\d]+\.[a-zA-Z\d]+)}/g,
                    isfunction: /\([^)]*\)/g,
                    hasParam: /\([^)]+\)/g,
                    removeEx: /\([^)]*\)/g,
                    charatcter: /[\?\:\=\-\+\*]+/g
                }
                function runFunction(fnStr, arr) {
                    var str = fnStr.replace(reg.removeEx, "");
                    var htmlCode = false;
                    var textCode = false;

                    if(fnStr.indexOf("#")==0){
                        htmlCode = true;
                        str = str.replace("#","");
                    }
                    if(fnStr.indexOf("$")==0){
                        textCode = true;
                        str = str.replace("$","");
                    }
                    var fun = eval("custom." + str);

                    if (!fun) {
                        console.warn("helper."+str+" is undefined");
                        return str;
                    }


                    if(htmlCode){
                        return tool.htmlCode(fun.call(proxy, arr))
                    }
                    if(textCode){
                        return tool.textCode(fun.call(proxy, arr))
                    }
                    return tool.xss(fun.call(proxy, arr));
                };

                function compile(type, options) {
                    var newStr = options[0];
                    var obj = options[1];
                    var i = options[2];
                    if (typeof obj == "string" || typeof obj == "number") {
                        obj = {
                            value: obj,
                            i: i
                        }
                    }
                    function getParam(fnStr, name) {
                        var arr = [];
                        var param = fnStr.match(reg.hasParam);

                        // 这里的name 是指被处理的参数值
                        if(name){
                            var param1 = parseItem(name, obj, i);
                            if (typeof param1 == "object") {
                                arr.push(parseItem(name, obj, i))
                            } else {
                                arr.push(parseItem(name, obj, i))
                            }
                        }
                        
                        if (param) {
                            var param = param[0].replace(/[\(\)]+/g, "").split(",");
                            for (var k = 0; k < param.length; k++) {
                                if (param[k] == "i") {
                                    arr.push(String(i))
                                } else if (param[k] == "item") {
                                    if (obj.item) {
                                        arr.push(obj.item)
                                    } else {
                                        arr.push(obj)
                                    }
                                } else {
                                    if (param[k].indexOf("item.") != -1) {
                                        value = parseItem(param[k], obj, i);
                                        if (value) {
                                            arr.push(value)
                                        }
                                    } else {
                                        if (obj[param[k]]) {
                                            arr.push(String(obj[param[k]]))
                                        } else {
                                            arr.push(param[k])
                                        }
                                    }
                                }
                            }
                        }
                        return arr
                    };

                    function parseItem(v) {
                        var v1, v2;

                        function doit() {
                            v1 = v.replace(/\s/g, "");
                            if (type == "list") {
                                if (v1.replace("item.", "").indexOf(".") != -1) {
                                    var arr = v1.replace("item.", "").match(/[a-zA-Z'\d_-]+/g);
                                    var str = "";
                                    for (var j = 0; j < arr.length; j++) {
                                        str += "['" + arr[j] + "']"
                                    }
                                    v2 = eval('obj' + str)
                                } else {
                                    if (v1 == "i") {
                                        v2 = i;
                                        return
                                    }
                                    v2 = obj[v1.replace("item.", "")]
                                }
                            } else {
                                if (v1.indexOf(".") != -1) {
                                    var arr = v1.match(/[a-zA-Z'\d_-]+/g);
                                    var str = "";
                                    for (var j = 0; j < arr.length; j++) {
                                        str += "['" + arr[j] + "']"
                                    }
                                    v2 = eval('obj' + str)
                                } else {
                                    v2 = obj[v1.replace(/\s/g, "")]
                                }
                            }
                        }
                        doit();
                        if (v2 || v2 == 0) {
                            return v2
                        } else {
                            return ""
                        }
                    }

                    /**
                     * 解析{{name}} 这样的，看看里面是什么样的结构
                    */
                    return newStr.replace(/{{[^}]*}}/g, function(v) {
                        var v1, v2, v3 = [];
                        var fn;
                        var param;
                        var htmlCode;
                        var textCode;
                        var htmlDecode;

                        v = v.replace(/[\{\}\s]/g, "");
                        
                        if (v.indexOf("#") == 0) {
                            htmlCode = true
                        }
                        if (v.indexOf("&") == 0) {
                            htmlDecode = true
                        }
                        
                        if (v.indexOf("$") == 0) {
                            textCode = true
                        }
                        if (v.indexOf("|") != -1) {

                            /** 说明是管道模式，提取出执行函数 */
                            fn = v.split("|")[1].replace(/\s/g, "");
                            v1 = v.split("|")[0].replace(/\s/g, "");
                            var arr = getParam(fn, v1, i);
                            return runFunction(fn, arr)

                        } else if (v.match(reg.charatcter)) {
                            /**
                             * 这里指的是符合表达式写法的模板，比如 return a==2?'1':'0';
                             * 
                            */

                            /** list 代表是数组类型[]的渲染 */
                            if (type == "list") {

                                /** 指定一个属性i，因为数组便利都是有i的，这里的i就是index */
                                obj.i = i;

                                /** 
                                 * 因为模板里面为了简便写法，都是写的item.xxx 而不是 data[i].xxx，
                                 * item代表了一个数组中的某一元素
                                 * 这里由于是需要得到正确属性获取路径，需要剔除item. 如果有
                                */
                                v = v.replace(/item./g, "");
                            }
                            
                            /**
                             * 将string 表达式中的变量指向当前的对象， 比如原来是name ，那么改为this.name
                             * 最后将string 表达式通过 new Function 执行
                            */
                            v = v.replace(/\s/g, "").replace(/([a-zA-Z.']+)/g, function(v) {
                                if (v.indexOf("'") != -1) {
                                    return v
                                }
                                return "this." + v
                            });


                            /**
                             * 执行的时候把上下文对象指定为obj
                            */
                            return new Function('return ' + v).call(obj);

                        } else if (v.match(reg.isfunction)) {
                            var fn = v;
                            var arr = getParam(fn, null, i);
                            return runFunction(fn, arr)
                        } else {
                            if (v == "i" && i) {
                                if (htmlCode) {
                                    return tool.htmlCode(i)
                                }
                                if (htmlDecode) {
                                    return tool.htmlDecode(i);
                                }
                                if (textCode) {
                                    return tool.textCode(i)
                                }
                                return i
                            } else {
                                if (htmlCode) {
                                    v = v.replace(/^#{1}/, "");
                                    return tool.htmlCode(parseItem(v, obj, i))
                                }
                                if (htmlDecode) {
                                    v = v.replace(/^&{1}/, "");
                                    return tool.htmlDecode(parseItem(v, obj, i))
                                }
                                if (textCode) {
                                    v = v.replace(/^\${1}/, "");
                                    return tool.textCode(parseItem(v, obj, i))
                                }
                                return tool.xss(parseItem(v, obj, i))
                            }
                        }
                    })
                }
                function render(str) {
                    str = str.replace(/\[[^\[]+\[[^\]]+]/g, function(listStr) {
                        var name = listStr.match(/\[[^\]]+\]/)[0].replace(/[\[\]]+/g, "");
                        var content = listStr.replace(/\[[^\]]+\]/g, "");
                        var newStr = "";
                        var express = name.replace(/\s/g, "").replace(/([a-zA-Z.']+)/g, function(v) {
                            if (v.indexOf("'") != -1) {
                                return v
                            }
                            return "this." + v
                        });
                        var fn1 = new Function('return ' + express);
                        var data = fn1.call(json);
                        if (data) {
                            for (var i = 0; i < data.length; i++) {
                                newStr += compile("list", [content, data[i], i]);
                            }
                        }
                        return (newStr);
                    });
                    str = compile("normal", [str, json, json.i]);
                    return (str);
                };
                return render(str);
            },
            date: function(date, f) {
                if (!date || date[0] == "") {
                    date = new Date();
                }
                var f = f || "yyyy-MM-dd hh:mm:ss";
                if (date == "刚刚") {
                    return date;
                }
                if (typeof date != "object") {
                    if (!String(date).match(/\d*/)) {
                        f = date;
                        date = new Date()
                    } else {
                        date = new Date(Number(date))
                    }
                }
                var d1 = new Date(date);
                if (f == "human") {
                    var dd = new Date();
                    if ((+d1) > dd.setMinutes(dd.getMinutes() - 1)) {
                        f = "刚刚"
                    }
                    var dd = new Date();
                    if ((+d1) < dd.setMinutes(dd.getMinutes() - 1) && (+d1) > dd.setHours(dd.getHours() - 1)) {
                        dd = new Date();
                        f = parseInt((dd - d1) / (60000)) + "分钟前"
                    }
                    var dd = new Date();
                    if ((+d1) < dd.setHours(dd.getHours() - 1)) {
                        f = "hh:mm"
                    }
                    var dd = new Date();
                    if ((+d1) < dd.setDate(dd.getDate() - 1)) {
                        f = "昨天 hh:mm"
                    }
                    var dd = new Date();
                    if ((+d1) < dd.setDate(dd.getDate() - 2)) {
                        f = "前天 hh:mm"
                    }
                    var dd = new Date();
                    if ((+d1) < dd.setDate(dd.getDate() - 3)) {
                        f = "MM-dd"
                    }
                }
                var o = {
                    "M+": date.getMonth() + 1,
                    "d+": date.getDate(),
                    "h+": date.getHours(),
                    "m+": date.getMinutes(),
                    "s+": date.getSeconds(),
                    "q+": Math.floor((date.getMonth() + 3) / 3),
                    "S": date.getMilliseconds()
                };
                if (/(y+)/.test(f)) f = f.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
                for (var k in o) if (new RegExp("(" + k + ")").test(f)) f = f.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
                return f
            }
        };
        return tool;
    })();
    loyal.pluginSup = {};
    loyal.plugin = function(name, func) {
        loyal.pluginSup[name] = func
    }
    window.loyal = loyal;
    try{
        module.exports = loyal;
    }catch(e){

    }
})($);
