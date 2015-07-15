//@setting UTF-8
"use strict";

/**
 * @name loyal
 * @version 0.0.5
 * @author changyuan.lcy
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
 * add some funs 
 * @private 
*/
(function($) {
    if (!$) {
        throw "loyal need a base framework jQuery or zepto or dmimi ";
    }
    var temp = {
        urlParam: function(name, url) {
            var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
            var r = (url || window.location.search).substr(1).match(reg);
            if (r != null) return unescape(r[2]);
            return null
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
            return div.innerHTML
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
                var fun = eval("custom." + str);
                if (!fun) {
                    console.warn(str);
                    return
                }
                return fun.call(proxy, arr)
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
                    var param1 = parseItem(name, obj, i);
                    if (typeof param1 == "object") {
                        arr.push(parseItem(name, obj, i))
                    } else {
                        arr.push(parseItem(name, obj, i))
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
                                var arr = v1.replace("item.", "").match(/[a-zA-Z'\d]+/g);
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
                                var arr = v1.match(/[a-zA-Z'\d]+/g);
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
                return newStr.replace(/{{[^}]*}}/g, function(v) {
                    var v1, v2, v3 = [];
                    var fn;
                    var param;
                    var htmlCode;
                    var textCode;

                    v = v.replace(/[\{\}\s]/g, "");
                    
                    if (v.indexOf("#") == 0) {
                        htmlCode = true
                    }
                    
                    if (v.indexOf("$") == 0) {
                        textCode = true
                    }
                    if (v.indexOf("|") != -1) {
                        fn = v.split("|")[1].replace(/\s/g, "");
                        v1 = v.split("|")[0].replace(/\s/g, "");
                        var arr = getParam(fn, v1, i);
                        return runFunction(fn, arr)
                    } else if (v.match(reg.charatcter)) {
                        if (type == "list") {
                            obj.i = i;
                            v = v.replace(/item./g, "")
                        }
                        v = v.replace(/\s/g, "").replace(/([a-zA-Z.']+)/g, function(v) {
                            if (v.indexOf("'") != -1) {
                                return v
                            }
                            return "this." + v
                        });
                        var fn1 = new Function('return ' + v);
                        return fn1.call(obj)
                    } else if (v.match(reg.isfunction)) {
                        return runFunction(v, [i])
                    } else {
                        if (v == "i" && i) {
                            if (htmlCode) {
                                return $.htmlCode(i)
                            }
                            if (textCode) {
                                return $.textCode(i)
                            }
                            return i
                        } else {
                            if (htmlCode) {
                                v = v.replace(/^#{1}/, "");
                                return $.htmlCode(parseItem(v, obj, i))
                            }
                            if (textCode) {
                                v = v.replace(/^\${1}/, "");
                                return $.textCode(parseItem(v, obj, i))
                            }
                            return $.xss(parseItem(v, obj, i))
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
    }
    for (var i in temp) {
        $[i] = temp[i]
    }
})($);



/** 
 * main
 * @class
*/
function loyal(project, parent) {
    var self = this;

    /** 
     * REG
     * @private 
    */
    var REG = {
        html: "data",
        attr: "(^class$)|(^id$)|(^type$)|(^h-[a-z]+)|(^href$)|(^style$)|(^src$)|(^controls$)|(^placeholder$)|(^height$)|(^width$)|(^value$)|(^for$)|(^data-)|(^name$)|(^checked$)|(^target$)",
        system: "text$|express|html|data$|protocol",
        param: /\(([^)]+)\)/,
        removeEx: /\([^)]*\)/,
        prop: /[a-zA-Z'"]+/g
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
        this.uuid = returnUUID();
        this.view = options.view || {};
        this.helper = options.helper;
        this.event = options.event;
        this.name = options.name;
        this.plugin = [];
        this.custom = options.custom;
        this.net = options.net || {};
        this.exports = options.exports || {};
        this.models = {};
        this.view.protocol = function() {
            return extend({}, JSON.parse(JSON.stringify(options.view)))
        }
        this.render = function(model, data) {
            var string = (this.method.parse(model, data, true));
            var html = $.template(string, data, this.helper, self);
            var dom = $(html);
            if (window.customTags) {
                window.parseCustomTags(window.customTags)
            }
            return html
        }
        this.init = function(json) {
            options.init.call(this, json)
        };
        this.route = function(param) {
            window.location.href = window.location.href + "/" + param
        }

        /**
         * @exports run
         * @param {object} model, it is view
         * @param {object} data, it is json Data
         * @param {string} name, where it want to push in
         * @param {string} type, is  append or after and before ...
         * @param {object} wrap, dom
        */
        this.run = function(model, data, name, type, wrap) {
            if (!model) {
                model = self.view
            }
            if (!data) {
                data = self.data
            }
            var html = this.render(model, data);
            if (!html) {
                if (model.repeat) {
                    var express = model.repeat.data.replace(/\s/g, "").replace(/([a-zA-Z.']+)/g, function(v) {
                        if (v.indexOf("'") != -1) {
                            return v
                        }
                        return "this." + v
                    });
                    var fun;
                    eval('fun = function(){return ' + express + '}');
                    var data = fun.call(self.data);
                    if (!data) {
                        console.warn("render need data['" + name + "'] but is undefined")
                    }
                }
            }
            wrap = wrap || this.wrap;
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
                var newDom = $(html);
                console.log(dom);
                dom.after(newDom);
                dom.remove();
                var dom = newDom
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
        };

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
            if (position) {
                self.data[key].insert(position, value);
                index = position
            } else {
                index = self.data[key].push(value)
            }
            self.data.nowData = value;
            self.method.change(key, "add");
            return index - 1
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
                    self.data.update(key[i], value)
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
                        return value
                    }
                }
                eval("self.data" + str)[end] = value
            } else {
                if (norepeatBoolean) {
                    if (self.data[key] == value) {
                        return value
                    }
                }
                self.data[key] = value
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
                            funs[i][k].el[0].checked = eval(funs[i][k].express)
                        }
                    }
                    if (i == "value") {
                        for (var k = 0; k < funs[i].length; k++) {
                            if (key == funs[i][k].key) {
                                funs[i][k].el[0].value = eval(funs[i][k].express)
                            }
                        }
                    }
                    if (i == "text") {
                        for (var k = 0; k < funs[i].length; k++) {
                            if (key == funs[i][k].key) {
                                funs[i][k].el.text(eval(funs[i][k].express))
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
                    if (i == "watch") {
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
                    if (this.loyalBind_checked) {
                        return
                    }
                    this.loyalBind_checked = true;
                    var key = $(this).attr("h-checked");
                    funsAdd(funs["checked"], {
                        el: $(this),
                        key: key,
                        express: jude(key)
                    });
                    $(this).removeAttr("h-checked")
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
                $.each(dom.find("[h-text]"), function() {
                    if (this.loyalBind_text) {
                        return
                    }
                    this.loyalBind_text = true;
                    var key = $(this).attr("h-text");
                    var el = $(this);
                    funs["text"] = funsAdd(funs["text"], {
                        el: el,
                        key: key,
                        express: jude(key)
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
                        funs["watch"] = funsAdd(funs["watch"], {
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
                        funs["watch"] = funsAdd(funs["watch"], {
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
                        funs["watch"] = funsAdd(funs["watch"], {
                            mold: mold,
                            el: el,
                            key: arr[0],
                            express: eval(express),
                            param: param
                        })
                    }
                    $(this).removeAttr("h-watch-update")
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
                            self.data[key] = $(this)[0].checked
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
                        self.data[key] = $(this)[0].checked
                    } else if ($(this).attr("type") === "text") {
                        self.data[key] = $(this).val()
                    } else {
                        self.data[key] = $(this).val()
                    }
                    self.models[key] = this;
                    $(this).removeAttr("h-model")
                });
                $.each($.merge(dom, dom.find("[h-on]")), function() {
                    if (this.loyalBind_on) {
                        return
                    }
                    this.loyalBind_on = true;
                    var $el = $(this);
                    var key = $el.attr("h-on");
                    $(this).removeAttr("h-on");
                    if (!key) return;

                    function doit(str) {
                        var arr = str.split(":");
                        var type = arr[0].replace(/\s/g, "");
                        var model = arr[1].replace(/\s/g, "");
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
                                    eval(express).apply(self, [el, e].concat(param));
                                    self.method.change(key)
                                }
                            })
                        } else {
                            $el.on(type, function(e) {
                                var el = this;
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
                            string += '<' + name.replace(/-\d/, '') + recursive(childlens[name], false) + '</' + name.replace(/-\d/, '') + '>'
                        }
                    }
                    return string
                }
                return recursive(model, true)
            }
        }
    }
    Internal.protocolName = project.name;
    Internal.prototype.__default = project;
    var options = {};
    if (parent) {
        extend(options, parent.__default);
        extend(options, project)
    } else {
        extend(options, project);
        if (window.loyalSubClass && window.loyalSubClass[project.name]) {
            extend(options, project, window.loyalSubClass[project.name])
        }
    }
    var exports = new Internal(options);
    window.loyalSubClass = window.loyalSubClass || {};
    window.loyalSubClass[exports.name] = exports;
    return exports
};

loyal.pluginSup = {};
loyal.plugin = function(name, func) {
    loyal.pluginSup[name] = func
}
'function' === typeof define ? define(function() {
    return loyal
}) : window.loyal = loyal;
if (window.module) {
    module.exports = loyal
}
