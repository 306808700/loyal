/*
	loyal v1.0  2015-04-22
	creator changyuan.lcy
*/
Array.prototype.last = function() {
	return this[this.length - 1];
};
Array.prototype.insert = function(index, item) {
	if (index < 0) {
		index = (this.length + 1) + index;
	}
	this.splice(index, 0, item);
};

//@setting UTF-8
/*  
    dm.js 
    dmimi 精简版
*/
var DM = (function(){
    return window.$ = window.DM = function(elem) {
        return DM._selector(elem);
    };
})();
(function($) {
    $.Dmimi = "dmimi-mobile 1.1";
    $._selector = function(selector, dom) {
        var doc = dom || document,
            arr, domTemp = [],
            i, len, nodes;
        if (!selector) {
            return $.classArray([]);
        }
        if (typeof selector == "function") {
            return $.ready(selector);
        }
        if (selector.Dmimi) {
            return selector;
        }
        if (typeof selector == "object" || selector.nodeType === 1 || selector.nodeType === 9) {
            if (selector == document) {
                selector = document.documentElement;
            }
            return $.classArray([selector]);
        }
        if (String(selector).match(/^</)) {
            return $.create("div",{},selector).children();
        }

        // 选择器错误验证提示
        if($._error(doc,doc.querySelectorAll(selector),selector)){
            return $.classArray([]);
        }


        return $.classArray(doc.querySelectorAll(selector));
    };
    $._error = function(doc,data,selector){
        if(!data[0]&&$.debugBoolean){
            console.warn("selector "+selector+"' is not find");
            return true;
        }
    }
    $.validateSelector = function(dom, object) {
        if(!dom) return false;
        var attributeFun = function(dom, object) {

                var n, v;
                if (object.attrName) {
                    if (!dom.getAttribute(object.attrName)) {
                        return false;
                    }
                }
                if (object.attrValue) {
                    v = dom.getAttribute(object.attrName);
                    if (object.attrName == "href") {
                        v = dom.getAttribute(object.attrName);
                        if (v.indexOf("#") != -1) {
                            v = "#" + v.split("#")[1];
                        }
                    }
                    if (v != object.attrValue) {
                        return false;
                    }
                }
                if (object.className) {

                    if (!DMIMI.hasClass(object.classValue, dom.className)) {
                        return false;
                    }
                }
                return true;
            };
        if (object.tagName) {
            if (dom.tagName != object.tagName.toUpperCase()) {
                return false;
            }
        }
        var arr = object.arr;
        var bool = true;
        for (var j = 0; j < arr.length; j++) {
            bool = attributeFun(dom, arr[j]);
            if (!bool) {
                break;
            }
        }
        return bool;
    };
    $.classArray = function(dom) {
        var toArray = function(s) {
                try {
                    return Array.prototype.slice.call(s);
                } catch (e) {
                    var arr = [];
                    for (var i = 0, len = s.length; i < len; i++) {
                        arr[i] = s[i];
                    }
                    return arr;
                }
            }
        var arr = toArray(dom);
        for (var i in $) {
            arr[i] = $[i];
        }
        return arr;
    };
    $.flag = function(html){
        var flag = document.createDocumentFragment(); 
        flag.innerHTML = html;
        return $(flag);
    }
    $.create = function(name,attrs,html){
        var ele = document.createElement(name);
        for(var i in attrs){
            ele.setAttribute(i,attrs[i]);
        }
        if(html){
            ele.innerHTML = html;
        }
        return $.classArray([ele]);
    };
    $.extend = function(a, b) {
        var _class = {};
        if (a) {
            if (typeof a == "function") {
                for (var name in b) {
                    a[name] = b[name];
                }
                return;
            }
            for (var name in a) {
                _class[name] = a[name];
            }
        }
        if (b) {
            for (var name in b) {
                _class[name] = b[name];
            }
        }
        return _class;
    };
    $.plugin = function(name, fn) {
        var obj = fn($);
        delete obj.init;
        var setFunction = function(key, obj) {
                $[key] = function() {
                    return obj[key].apply(this, arguments);
                }
            }
        for (var key in obj) {
            setFunction(key, obj);
        }
        $[name] = $.extend($[name], obj);
    };
    $.each = function(obj, callback) {
        if (typeof obj == "function") {
            callback = obj;
            obj = this;
        }
        if (!obj || obj.length == 0) {
            return;
        }
        var len = obj.length,
            i;
        for (i = 0; i < len; i++) {
            if (callback.apply(obj[i], [i, obj[i]]) == false) {
                break;
            }
        }
        return obj;
    }
})(DM);
DM.plugin("tool", function($) {
    var self;
    return ({
        
        index: function() {
            return this.prevAll().size();
        },
        size: function(object) {
            if(object){
                var len = 0;
                for(var i in object){
                    len++;
                }
                return len;
            }
            return this.length;
        },
        hidden:function(ele){
            if(ele[0].offsetWidth == 0  || ele.css("display")=="none"){
                return true;
            }
        },
        transform:function(type){
            return $.martix($(this).css("-webkit-transform"))[type];
        },
        css:function(prop,value){
            if(prop==undefined||null){
                return getComputedStyle(this[0]);
            }
            if(typeof prop=="string"&&!value){
                if(this[0]){
                    return getComputedStyle(this[0])[prop];
                }else{
                    return null;
                }
            }
            
            $.each(this,function(){
                if(value){
                    this.style[prop] = value;
                } else {
                    for(var i in prop){
                        if(i.match(/width|height/)){
                            if(String(prop[i]).indexOf("px")==-1&&!String(prop[i]).match(/auto|100%/)){
                                prop[i] = prop[i]+"px";
                            }
                        }
                        this.style[i] = prop[i];
                    }
                }
            });
            return this;
        },
        trim: function(data) {

            return data?data.replace(/^[\s\n\t]*|[\s\n\t]*$/g, ""):"";
        },
        html: function(data) {
            var ele = this;
            if (typeof data == "string" || typeof data == "number") {
          
                $.each(ele, function(index, dom) {
                    try{
                        this.innerHTML = data;
                    }catch(err){
                        this.innerText = data;
                    }
                });
                return ele;
            }
            if (typeof data == "boolean") {
                var temp = $("<div></div>");
                temp.append(ele.clone());
                return temp.html();
            }
            if (typeof data == "undefined") {
                var arr = [];
                $.each(ele, function() {
                    arr.push(this.innerHTML);
                });
                return arr.length == 1 ? arr.join("") : arr;
            }
            if(typeof data == "function"){
                ele.html(data.call(this));
            }
            if (data.Dmimi) {
                ele.html("").append(data);
                return ele;
            }
        },
        outHtml:function(){
            var ele = this;
            var div = $.create("div");
            div.append(ele);
            return div.html();
        },
        param:function(url){
            var str = url||window.location.href,temp = {};
            if(str.indexOf("?")!=-1){
                temp = $.paramToJson(str.split("?")[1].replace(/#/g,""));
            }
            return temp;
        },
        text: function(data) {
            if(!this[0]){
                return undefined;
            }
            if (data || data == "") {
                $.each(this, function() {
                    this.textContent = data;
                });
                return this;
            } else {
                return this[0].textContent;
            }
        },
        attr: function(name, value) {
            if (value != undefined) {
                $.each(this, function() {
                    this.setAttribute(name, value);
                });
                return this;
            } else {
                return this[0]?this[0].getAttribute(name):undefined;
            }
        },
        width: function(data) {
            if(this[0]==window){
                return this[0].innerWidth;
            }
            if(data){
                this[0].style.width = data;
                return this;
            }
            return this[0].offsetWidth;
        },
        height: function(data) {
            if(this[0]==window){
                return this[0].innerHeight;
            }
            if(data){
                this[0].style.height = data;
                return this;
            }
            return this[0].offsetHeight;
        },
        offsetLeft:function(){
            return this[0].offsetLeft;
        },
        offsetTop: function() {
            var ele = this;
            var offsetTop = ele[0].offsetTop;
            function up(p){
                if (p.css("position") == "relative" || p.css("position") == "fixed" || p.css("position") == "absolute") {
                    offsetTop += p[0].offsetTop;
                }
                if(p.parent().length){
                    up(p.parent());
                }
            }
            if(ele.parent().length){
                up(ele.parent());
            }
            return offsetTop;
        },
        hide: function(num,callback) {
            var ele = this;
            var callback = callback||function(){};
            if(num){
                this.ani({
                    prop:{
                        "opacity":"0"
                    },
                    duration:num/1000,

                    end:function(){
                        ele.css({
                            display: "none"
                        });
                        callback.call(ele);
                    }
                });
                return this;
            }
            this.css({
                display: "none"
            });
            return this;
        },
        show: function(num,callback) {
            var ele = this;
            var callback = callback||function(){};
            if(num){
                this.css({
                    "opacity":"0",
                    "display":"block"
                });

                this.ani({
                    prop:{
                        "opacity":"1"
                    },
                    duration:num/1000,

                    end:function(){
                        callback.call(ele);
                    }
                });
                return this;
            }
            this.css({
                "opacity":"1",
                "display":"block"
            });

            return this;
        },
        getLength: function(obj) {
            var num = 0;
            for (var i in obj) {
                num++;
            }
            return num;
        },
        trigger: function(event, param) {
            var element = this[0];
           
            var evt = document.createEvent("Event");
            evt.initEvent(event, true, true);
            for (var i in param) {
                evt[i] = param[i];
            }
            element.dispatchEvent(evt);
            return this;
        },
        cookie:function(name,value){
            if(!name&&!value){
                var arr = document.cookie.split("; ");
                var temp = {};
                for(var i=0;i<arr.length;i++){
                    var thisArr = arr[i].split("=");
                    temp[thisArr[0]] = thisArr[1];
                }
                return temp;
            }
            if(name&&!value){
                var arr,reg=new RegExp("(^| )"+name+"=([^;]*)(;|$)");
                if(arr=document.cookie.match(reg)){
                    return unescape(arr[2]);
                }else{
                    return null;
                }
                return;
            }
            if(name&&value){
                var Days = 30; 
                var exp = new Date(); 
                exp.setTime(exp.getTime() + Days*24*60*60*1000); 
                document.cookie = name + "="+ escape (value) + ";expires=" + exp.toGMTString(); 
                return;
            }
            
        },
        removeCookie:function(name){
            if(name){
                var exp = new Date(); 
                exp.setTime(exp.getTime() - 1); 
                var cval=getCookie(name); 
                if(cval!=null){
                    document.cookie= name + "="+cval+";expires="+exp.toGMTString();
                }
            }else{
                document.cookie = null;
            }
        },
        filter:function(selector){
            var domTemp = [];
            $.each(this,function(){
                var object = $._test("attr",selector);
                if($.validateSelector(this, object)){
                    domTemp.push(this);
                }
            });
            return $.classArray(domTemp);
        },
        
        appendTo: function(data) {
            data.append(this);
            return this;
        },
        append: function(data) {
            self.pend(this, "append", data);
            return this;
        },
        prepend: function(data) {
            self.pend(this, "prepend", data);
            return this;
        },
        before: function(data) {
            self.pend(this, "before", data);
            return this;
        },
        after: function(data) {
            self.pend(this, "after", data);
            return this;
        },
        val: function(data) {
            var arr = [];
            this.each(function() {
                (data || data == "") ? this.value = data : arr.push(this.value);
            });
            return arr.length > 0 ? arr.join("") : this;
        },
        hasClass: function(selector, className) {
            if (typeof className == "undefined") {
                var ele = this;
                className = ele.attr("class");
            }
            var pattern = new RegExp("(^|\\s)" + selector + "(\\s|$)");
            return pattern.test(className);
        },
        addClass:function(data){
            var ele = this;
            var _class;
            $.each(ele,function(){
                _class = this.className;
                var res = eval("/^"+data+"\\s|\\s"+data+"$|\\s"+data+"\\s/");

                if(_class.match(res)){return;}
                _class = _class.split(" ")||[];
                _class.push(data);
                _class = _class.join(" ");
                this.className = _class;
            });
            return ele;
        },
        removeClass: function(data) {
            var ele = this;
            $.each(ele, function() {
                var res = eval("/^"+data+"\\s|\\s"+data+"$|\\s"+data+"\\s/");
                this.className = data?$.trim(this.className.replace(res," ")):"";
            });
            return ele;
        },
        removeAttr: function(data) {
            var ele = this;
            $.each(ele, function() {
                this.removeAttribute(data);
            });
            return ele;
        },
        remove: function() {
            var ele = this;
            var div = $.create("div");
            $.each(ele, function() {
                if (this && this.parentNode) {
                    this.parentNode.removeChild(this);
                }
            });
            delete ele;
        },
        clone: function(bl) {
            var ele = this;
            var newEle = ele.get().cloneNode(true)
            if (bl) {
                if (ele.get().eventCall) {
                    var i, arr = ele.get().eventCall,
                        len = arr.length;
                    for (i = 0; i < len; i++) {
                        newEle.on(arr[i].type, arr[i].fn);
                    }
                }
            }
            return $(newEle);
        },
        eq: function(i) {
            var ele = this,
                i = i || 0;
            return i >= 0 ? $(ele[i]) : $(ele[$(ele).length + i]);
        },
        inArray: function(a, arr) {
            if (a.Dmimi) {
                arr = arr[0];
                a = a[0][0];
            }            for (var i = 0; i < arr.length; i++) {
                if (arr[i] == a) {
                    return i;
                }
            }
            return -1;
        },
        each: function(obj, callback) {
            if (typeof obj == "function") {
                callback = obj;
                obj = this;
            }
            if (!obj || obj.length == 0) {
                return;
            }
            var len = obj.length,
                i;
            for (i = 0; i < len; i++) {
                if (callback.apply(obj[i], [i, obj[i]]) != undefined) {
                    break;
                }
            }
            return obj;
        },
        template:function(str,json,custom) {

            var str = str;
                json = json || {};

            var _eval = function(r){
                return eval("/{{[\\s]*" + r + "[\\s]*}}/g");
            };
            
            var reg = {
                futher:/{([a-zA-Z\d]+\.[a-zA-Z\d]+)}/g,
                isfunction:/\([^)]*\)/g,
                hasParam: /\([^)]+\)/g,
                removeEx: /\([^)]*\)/g,
                charatcter: /[\?\:\=\-\+\*]+/g
            }


            
            

            // 执行管道函数式
            function runFunction(fnStr,arr){
                return eval("custom."+fnStr.replace(reg.removeEx, "")+"("+arr.join(",")+")");
            };


            // @options Array
            function compile(type,options){


                var newStr = options[0];
                var obj = options[1];
                var i = options[2];
                if(typeof obj=="string" || typeof obj == "number"){
                    obj = {value:obj,i:i};
                }


                // 解析括号内的参数。
                function getParam(fnStr,name){
                    var arr = [];
                    var param = fnStr.match(reg.hasParam);

                    arr.push("'"+parseItem(name,obj,i)+"'");
                    if(param){
                        var param = param[0].replace(/[\(\)]+/g,"").split(",");
                        for(var k=0;k<param.length;k++){
                            if(param[k]=="i"){
                                arr.push(String(i));
                            }else{
                                if(param[k].indexOf("item")!=-1){
                                    value = parseItem(param[k],obj,i);
                                    if(value){
                                        arr.push("'"+value+"'");
                                    }
                                }else{
                                    if(obj[param[k]]){

                                        arr.push(String(obj[param[k]]));

                                    }else{
                                        arr.push(param[k]);
                                    }
                                }
                            }
                        }
                    }
                    return arr;
                };


                // 判断是否有item元素，而且当前执行作用域在list里面 那么就用item
                // 这里有特殊情况，当有个属性也叫item的时候，

                function parseItem(v){
                    var v1,v2;

                    function doit(){
                        v1 = v.replace(/\s/g,"");

                        if(type=="list"){
                            // 如果是 list 需啊替换掉item，在进行判断是否是
                            if(v1.replace("item.","").indexOf(".")!=-1){
                                var arr = v1.replace("item.","").match(/[a-zA-Z'\d]+/g);
                                var str = "";
                                for (var j = 0; j < arr.length; j++) {
                                    str += "['" + arr[j] + "']"
                                }
                                v2 = eval('obj'+str);
                            }else{
                                
                                if(v1=="i"){
                                    v2 = i;
                                    return;
                                }
                                v2 = obj[v1.replace("item.","")];
                            }
                        }else{

                            // 否则
                            if(v1.indexOf(".")!=-1){

                                var arr = v1.match(/[a-zA-Z'\d]+/g);
                                var str = "";
                                for (var j = 0; j < arr.length; j++) {
                                    str += "['" + arr[j] + "']"
                                }
                                v2 = eval('obj'+str);
                            }else{
                                v2 = obj[v1.replace(/\s/g,"")];
                            }
                        }
                    }

                    doit();


                    // 如果有值才返回，包括0
                    if(v2 || v2==0){
                        return v2;
                    }else{
                        return "";
                    }
                }



                return newStr.replace(/{{[^}]*}}/g,function(v){

                    var v1,v2,v3 = [];
                    var fn;
                    var param;
                    v = v.replace(/[\{\}]/g,"");

                    
                    if(v.indexOf("|")!=-1){
                        
                        fn = v.split("|")[1].replace(/\s/g,"");
                        v1 = v.split("|")[0].replace(/\s/g,"");

                        var arr = getParam(fn,v1,i);
                        return runFunction(fn,arr);
                        
                    }else if(v.match(reg.charatcter)){
                        if(type=="list"){
                            obj.i = i;
                            v = v.replace(/item./g,"");
                        }
                        v = v.replace(/\s/g,"").replace(/([a-zA-Z.']+)/g,function(v){
                            if(v.indexOf("'")!=-1){
                                return v;
                            }
                            return "this."+v;
                        });


                        eval('var fn1 = function(){return '+v+'}');
                        return fn1.call(obj);
                    }else if(v.match(reg.isfunction)){

                        return runFunction(v,[i]);

                    }
                    else{
                        if(v=="i" && i){
                            return i;
                        }else{               
                            return parseItem(v,obj,i);
                        }

                    }
                });
            }

            



            function render(str){

                str = str.replace(/\[[^\[]+\[[^\]]+]/g,function(listStr){

                    var name = listStr.match(/\[[^\]]+\]/)[0].replace(/[\[\]]+/g,"");
                    var content = listStr.replace(/\[[^\]]+\]/g,"");
                    var newStr = "";

                    var express = name.replace(/\s/g,"").replace(/([a-zA-Z.']+)/g,function(v){
                        if(v.indexOf("'")!=-1){
                            return v;
                        }
                        return "this."+v;
                    });
                    eval('var fn1 = function(){return '+express+'}');

                    var data = fn1.call(json);

                    if(data){
                        for(var i=0;i<data.length;i++){
                            newStr+= compile("list",[content,data[i],i]);
                        }
                    }
                    return newStr;

                });

                str = compile("normal",[str,json,json.i]);

                return str;

            };

            return render(str);
        },
        not: function(selector) {
            var ele = this;
            var object = $._test("attr", selector);
            var num = [];
            $.each(ele, function(index, dom) {
                if ($.validateSelector(this, object)) {
                    num.push(index);
                }
            });
            for (var i = 0; i < num.length; i++) {
                ele.splice(num[i], 1);
            }
            return ele;
        },
        ua: function() {
            return window.navigator.userAgent.toLowerCase();
        },
        os: function(){
            return function(n, l) {
                var q = /\s*([\-\w ]+)[\s\/\:]([\d_]+\b(?:[\-\._\/]\w+)*)/,
                    r = /([\w\-\.]+[\s\/][v]?[\d_]+\b(?:[\-\._\/]\w+)*)/g,
                    s = /\b(?:(blackberry\w*|bb10)|(rim tablet os))(?:\/(\d+\.\d+(?:\.\w+)*))?/,
                    t = /\bsilk-accelerated=true\b/,
                    u = /\bfluidapp\b/,
                    v = /(\bwindows\b|\bmacintosh\b|\blinux\b|\bunix\b)/,
                    w = /(\bandroid\b|\bipad\b|\bipod\b|\bwindows phone\b|\bwpdesktop\b|\bxblwp7\b|\bzunewp7\b|\bwindows ce\b|\bblackberry\w*|\bbb10\b|\brim tablet os\b|\bmeego|\bwebos\b|\bpalm|\bsymbian|\bj2me\b|\bdocomo\b|\bpda\b|\bchtml\b|\bmidp\b|\bcldc\b|\w*?mobile\w*?|\w*?phone\w*?)/,
                    x = /(\bxbox\b|\bplaystation\b|\bnintendo\s+\w+)/,
                    k = {
                        parse: function(b) {
                            var a = {};
                            b = ("" + b).toLowerCase();
                            if (!b) return a;
                            for (var c, e, g = b.split(/[()]/), f = 0, k = g.length; f < k; f++) if (f % 2) {
                                var m = g[f].split(";");
                                c = 0;
                                for (e = m.length; c < e; c++) if (q.exec(m[c])) {
                                    var h = RegExp.$1.split(" ").join("_"),
                                        l = RegExp.$2;
                                    if (!a[h] || parseFloat(a[h]) < parseFloat(l)) a[h] = l
                                }
                            } else if (m = g[f].match(r)) for (c = 0, e = m.length; c < e; c++) h = m[c].split(/[\/\s]+/), h.length && "mozilla" !== h[0] && (a[h[0].split(" ").join("_")] = h.slice(1).join("-"));
                            w.exec(b) ? (a.mobile = RegExp.$1, s.exec(b) && (delete a[a.mobile], a.blackberry = a.version || RegExp.$3 || RegExp.$2 || RegExp.$1, RegExp.$1 ? a.mobile = "blackberry" : "0.0.1" === a.version && (a.blackberry = "7.1.0.0"))) : v.exec(b) ? a.desktop = RegExp.$1 : x.exec(b) && (a.game = RegExp.$1, c = a.game.split(" ").join("_"), a.version && !a[c] && (a[c] = a.version));
                            a.intel_mac_os_x ? (a.mac_os_x = a.intel_mac_os_x.split("_").join("."), delete a.intel_mac_os_x) : a.cpu_iphone_os ? (a.ios = a.cpu_iphone_os.split("_").join("."), delete a.cpu_iphone_os) : a.cpu_os ? (a.ios = a.cpu_os.split("_").join("."), delete a.cpu_os) : "iphone" !== a.mobile || a.ios || (a.ios = "1");
                            a.opera && a.version ? (a.opera = a.version, delete a.blackberry) : t.exec(b) ? a.silk_accelerated = !0 : u.exec(b) && (a.fluidapp = a.version);
                            if (a.applewebkit) a.webkit = a.applewebkit, delete a.applewebkit, a.opr && (a.opera = a.opr, delete a.opr, delete a.chrome), a.safari && (a.chrome || a.crios || a.opera || a.silk || a.fluidapp || a.phantomjs || a.mobile && !a.ios ? delete a.safari : a.safari = a.version && !a.rim_tablet_os ? a.version : {
                                419: "2.0.4",
                                417: "2.0.3",
                                416: "2.0.2",
                                412: "2.0",
                                312: "1.3",
                                125: "1.2",
                                85: "1.0"
                            }[parseInt(a.safari, 10)] || a.safari);
                            else if (a.msie || a.trident) if (a.opera || (a.ie = a.msie || a.rv), delete a.msie, a.windows_phone_os) a.windows_phone = a.windows_phone_os, delete a.windows_phone_os;
                            else {
                                if ("wpdesktop" === a.mobile || "xblwp7" === a.mobile || "zunewp7" === a.mobile) a.mobile = "windows desktop", a.windows_phone = 9 > +a.ie ? "7.0" : 10 > +a.ie ? "7.5" : "8.0", delete a.windows_nt
                            } else if (a.gecko || a.firefox) a.gecko = a.rv;
                            a.rv && delete a.rv;
                            a.version && delete a.version;
                            return a
                        }
                    };
                return k.parse(l);
            }(document.documentElement, navigator.userAgent)
        },
        ready:function(callback) {
            if (document.readyState.match(/complete|loaded|interactive/)) {
                return callback();
            } else {
                document.addEventListener("DOMContentLoaded", callback, false);
            }
        },
        init: function() {
            self = this;
            self.pend = function(dom, pend, data) {
                var fun, temp, bool, obj1, obj2, type;
                if (!data) {
                    return false;
                }
                if (typeof data == "string" || typeof data == "number") {
                    //bool = new RegExp(/^</).test(String(data));
                    var frag = document.createDocumentFragment();
                    fun = function(obj, type, child, type2) {
                        if (bool) {
                            temp = $.createElement(data);
                            frag.appendChild(temp);
                        } else {
                            temp = document.createTextNode(data);
                            frag.appendChild(temp);
                        }
                        switch (type2) {
                        case "append":
                          
                            obj.appendChild(frag);
                            break;
                        case "prepend":
                            obj.insertBefore(frag, obj.firstChild);
                            break;
                        case "after":
                            obj[type](temp, child);
                            break;
                        case "before":
                            obj[type](temp, child);
                            break;
                        }
                    };
                } else {
                    if (data.Dmimi) {
                        
                        fun = function(dom, type, child) {
                            for (var j = 0; data[j]; j++) {
                                if (data[j]) {
                                    dom[type](data[j], child);
                                }
                            }
                        };
                    } else {
                        fun = function(dom, type, child) {
                            dom[type](data, child);
                        };
                    }
                }
                for (var i = 0; dom[i]; i++) {
                    switch (pend) {
                    case "append":
                        obj1 = dom[i];
                        obj2 = dom[i].firstChild;
                        type = "appendChild";
                        break;
                    case "prepend":
                        obj1 = dom[i];
                        obj2 = dom[i].firstChild;
                        type = "insertBefore";
                        break;
                    case "before":
                        obj1 = dom[i].parentNode;
                        obj2 = dom[i];
                        type = "insertBefore";
                        break;
                    case "after":
                        obj1 = dom[i].parentNode;
                        obj2 = dom[i].nextSibling;
                        type = "insertBefore";
                        break;
                    }
                    fun(obj1, type, obj2, pend);
                }
            }
            return this;
        }
    }).init();
});
DM.plugin("selector", function($) {
    return ({
        find: function(selector) {
            var ele = this;
            var domTemp = [];
            if (selector) {
                $.each(ele, function() {
                    domTemp = domTemp.concat($._selector(selector, this, "find"));
                });
                if(domTemp.length){
                    return $.classArray(domTemp);
                }
            }
            return $.classArray([]);
        },
        contains:function(target){
            var ele = this;
            var bool = false;
            $.each(ele,function(){
                if(this.contains(target)){
                    bool = true;
                    return true;
                }
            });
            return bool;
        },
        closest:function(selector){
            var dom;
            if(!selector){
                return this.parent()[0];
            }
            var object = $._test("attr", selector);
            (function search(d){
                if(!$.validateSelector(d[0],object)){
                    if(d.parent()[0]){
                        search(d.parent());
                    }
                }else{
                    dom = d;
                }
            })(this);
            return dom;

        },
        init: function() {
            var self = this;
            ({
                attrs: {
                    parent: ["parentNode", 1],
                    next: ["nextSibling", 1],
                    prev: ["previousSibling", 1],
                    nextAll: ["nextSibling", 2],
                    prevAll: ["previousSibling", 2],
                    siblings: ["nextSibling", 3, "parentNode.firstChild"],
                    children: ["nextSibling", 3, "firstChild"]
                },
                recursion: function(dom, dir) {
                    var _Selector = this;
                    var arr = [];
                    void
                    function rec(dom) {
                        if (dom[dir]) {
                            if (_Selector.verify.call(dom[dir])) {
                                arr = dom[dir];
                            } else {
                                rec(dom[dir]);
                            }
                        }
                    }(dom);
                    return arr;
                },
                foreach: function(dom, dir, elem) {
                    var _Selector = this;
                    var arr = [];
                    for (; dom; dom = dom[dir]) {
                        if (_Selector.verify.call(dom) && dom !== elem) {
                            arr.push(dom);
                        }
                    }
                    return arr;
                },
                setSelector: function(method, arr) {
                    var _Selector = this;
                    self[method] = function(selector) {
                        _Selector.verify = selector ?
                        function() {
                            var object = $._test("attr", selector);
                            return this.nodeType === 1 && $.validateSelector(this, object);
                        } : function() {
                            return this.nodeType === 1;
                        };
                        return $.classArray(self[method].dir.call(this, arr));
                    }
                    self[method].dir = (function() {
                        switch (arr[1]) {
                        case 1:
                            return function(arr) {
                                var domTemp = [];
                                $.each(this, function() {
                                    domTemp = domTemp.concat(_Selector.recursion.apply(_Selector, [this, arr[0], this]));
                                });
                                return domTemp;
                            };
                            break;
                        case 2:
                            return function(arr) {
                                var domTemp = [];
                                $.each(this, function() {
                                    domTemp = domTemp.concat(_Selector.foreach.apply(_Selector, [this, arr[0], this]));
                                });
                                return domTemp;
                            };
                            break;
                        case 3:
                            return function(arr) {
                                var domTemp = [];
                                $.each(this, function() {
                                    domTemp = domTemp.concat(_Selector.foreach.apply(_Selector, [$.futher(this, arr[2]), arr[0], this]));
                                });
                                return domTemp;
                            };
                            break;
                        }
                    })();
                },
                init: function() {
                    var arr;
                    for (var name in this.attrs) {
                        this.setSelector(name, this.attrs[name]);
                    }
                }
            }).init();
            return this;
        }
    }).init();
});
DM.plugin("event", function($) {
    return ({
        on: function(type, selector, callback) {
            if(selector && typeof selector!="function"){
                this.delegate(selector,type,callback);
                return this;
            }else{
                callback = selector;
            }
            callback = callback || function() {};
            $.each(this, function() {
                var dom = this;
                dom.events = dom.events || {};
                
                var types = type.split(",");
                for(var i=0;i<types.length;i++){
                    dom.addEventListener(types[i], callback);
                    dom.events[types[i]] = dom.events[types[i]]||[];
                    dom.events[types[i]].push(callback);
                }
                
                /*
                 ({
                    type: type,
                    fn: callback
                });
                */
            });
            return this;
        },
        off: function(type, selector, callback) {
            var ele = this;

            if(selector && typeof selector!="function"){
                this.delegate(selector,type,callback);
                return this;
            }else{
                callback = selector;
            }

            function removeEvent(dom, ev, type, callback) {
                if (callback) {
                    dom[ev](type, callback);
                } else {
                    if (dom.events) {
                        delete dom.events[type];
                    }
                    dom[ev][type] = null;
                }
            }
            ele.each(function() {
                removeEvent(this, "removeEventListener", type, callback)
            });
            return ele;
        },
        delegate: function(selector, type, callback) {
            var ele = this;
            ele.on(type, function(e) {
                var dom = ele.find(selector);
                var target = e.target;

                $.each(dom, function() {
                    
                    if (target == this || this.contains(target)) {
                        callback.call(this,e);
                        return;
                    }
                });
            });
            return ele;
        },
        init: function() {
            var self = this;
            return this;
        }
    }).init();
});

window.loyal = function(project) {

	
	var self = this;
	var reg = {
		html: "data",
		attr: "(class)|(id)|(type)|(h-[a-z]+)|(href)|(style)|(src)|(controls)|(placeholder)|(height)|(width)|(value)",
		system: "text$|express|html|data",
		param: /\(([a-z\d,\s"']+)\)/,
		removeEx: /\([a-z\d,\s']*\)/,
		prop:/[a-zA-Z'\d]+/g
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
		var html = template(string,data,project.helper);

		return html;
	}

	/*
		Into the actual DOM tree is completed with run interface
		@part if there are param 
	*/
	project.run = function(model, data, name, type) {


		var html = project.render(model, data);
		
		if(!html){ 
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


		if(!dom[0]){ 
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
			var arr = key.match(reg.prop);
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

			var arr = key.match(reg.prop);
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

