# loyal 1.0 beta

## 先看demo

http://dmimi.sinaapp.com/loyal/tabs.html



创建于时间2015年4月22日，不依赖类库。

这是什么东东，我想了一下，也许是一种可以改变开发者思维方式，让复杂的逻辑处理，变的简单的东东。

以前你是这样写代码的

````	
	<html>
	...
		<div class="tabs">
			<div class="menu">
				<ul>
					<li>类型1</li>
					<li>类型2</li>
					<li>类型3</li>
					<li>类型4</li>
					<li>类型5</li>
				</ul>
			</div>
			<div class="box">

			</div>
		</div>
	...
	</html>
	<script>
		var li = $(".menu > li");
		li.on("click",function(){
			var box = $(".box");
			var index = $(this).index();
			box.append("点了"+index);
		});
	</script>
````
如上写html， 写js，然后选择器，绑定事件处理，等等～～

用了loyal

````
	<html>
	...

		<div h-name="tabs"></div>
	...
	</html>
	<script>
		var tabs = loyal({
			name:"tabs",
			view:{
				menu:{
					ul:{
						repeat:{
							data:"menu",
							li:{
								"h-on":"click:active"
							}
						}
					}
				},
				box:{
					"h-text":"content"
				}
			},
			data:{
				menu:["类型1","类型2","类型3","类型4"]
			},
			event:{
				active:function(e,i){
					tabs.data.update("content","哈哈"+i)
				}
			},
			init:function(){
				tabs.run();
			}
		});

		tabs.init();

	</script>
````

咋一看好像代码量多了，（但是你不觉得瞬间高大上了么），这是因为上例逻辑比较简单，如果是后面demo那样的，优势就出来了。


名字好难取，姑且取个名字叫 loyal 吧中文名 “洛亚尔”。

不要问我为何取这样的名字，我是不会告诉你乱打拼音首字母出来的HOHO。


## 怎么用 ?

这里有个例子可以看  （ps:本例子使用了 npm browserify ，所以可以直接使用require，你也可以这样“配置”，或者引入seajs 或者 requirejs 或者 干脆不用require，直接在tabs.html里面写script标签引入依赖的js，就像demo这样）


tabs.html
````
	<html>
	<meta charset="utf-8">
	<title>tabs Demo</title>
	<meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=0,minimal-ui">
	<link rel="stylesheet"  href="tabs.css"/>
    <body>
		<div h-controller="tabs">
			<div h-name="tabs"></div>
		</div>
	</body>
	</html>
    <script src="tabs.js" charset="utf-8"></script>

````

tabs.js
````
    var loyal = require("loyal.js");

    var tabs = loyal({
	    version:1.0,

	    // 这个属性是必须的（固有关键字）
	    name:'tabs',

	    // 界面模型层（固有关键字），这里会被loyal解析为html插入到controller指定的容器内
	    view:{
	        menu:{
	        	// 绑定了一个on click事件冒号后面是处理函数
	            "h-on":"click,tab:activeType()",

	            // 接受menu数据根据长度遍历，渲染节点。
	            repeat:{
	            	// 数据的key名
	                data:"menu",
	                // 节点
	                tab:{
	                	// 一个className类型的数据绑定
	                    "h-class":"active{{i}}",

	                    // text类型的数据渲染
	                    text:'{{ value }}',
	                }
	            }
	        },
	        ul:{
	        	// 指定容器名字作为标识，假如后续需要插入节点到这里
	            "h-name":"tabsBox",

	            // 监听数据改变 管道后面是处理函数
	            "h-watch-add":"type0 | addRecordToType0()",
	            repeat:{

	            	// 数据key名也支持表达式
	                data:"list || type0",
	                li:{
	                    text:'{{ content }}',

	                    // className的数据渲染 支持表达式
	                    class:"{{ i==0 ? 'first' :''}}",
	                    time:{

	                    	// text的数据渲染 支持管道处理函数。
	                        text:'{{ time | returnFormatDate() }}'
	                    }
	                }
	            }
	        }
	    },
	    // 数据层（固有关键字），本例是写在代码里面，当然如果是ajax的也可以，只是respones后再挂到data下即可。
	    data:{
	        type0:[
	            {
	                content:'测试文案测试文案测试文案测试文案测试文案1',
	                time:"1431933120489",
	                type:1
	            },
	            {
	                content:'测试文案测试文案测试文案测试文案测试文案2',
	                time:"1431934520489",
	                type:1
	            },
	            {
	                content:'测试文案测试文案测试文案测试文案测试文案3',
	                time:"1431934410489",
	                type:1
	            },
	        ],
	        type1:[
	            {
	                content:'测试文案测试文案测试文案测试文案测试文案4',
	                time:"1431234120489",
	                type:2
	            }
	        ],
	        menu:[
	            '类型1',
	            '类型2',
	            '类型3',
	            '类型4',
	            '类型5'
	        ]
	    },
	    // 数据绑定相关操作函数类（固有关键字）
	    event:{
	        activeType:function(e){

	            var i = $(this).index();

	            tabs.run({
	                repeat:tabs.view.ul.repeat
	            },
	            {
	                list:tabs.data["type"+i] || [ { content:"无" } ]

	            },"tabsBox");


	            // get符合匹配的字段，全部更新
	            tabs.data.update(
	                tabs.data.get(/active\d/),
	                ""
	            );

	            // 更新当前焦点选项卡
	            tabs.data.update("active"+i,"active");
	        }
	    },
	    // 渲染编译处理函数类（固有关键字）渲染编译过程中用到自定义函数处理都放在这个类中
	    helper:{
	        returnFormatDate:function(date){
	            return date?$.date(date,"yyyy-MM-dd hh:mm:ss"):"";
	        }
	    },
	    init:function(){

	        // 初始化，生成DOMList
	        tabs.run();
	        
	        // 更新data中的active0 那么对应节点的className会被添加一个"active"；
	        tabs.data.update("active0","active");
	    }
	});	

	tabs.init();

````

* 如上所示，html几乎不用写（还是要写的，只是换了更顺手的形式JSON，对就是JSON）

* 界面模型view，将会被编译渲染为html dom 树插入到容器中，渲染时候还能根据管道函数（helper）输出处理后的数值。

* 所有的交互都不和dom发生关系，而是效率更高的数据层交互，然后数据层会去修改dom节点比如切换选项卡，添加当前选项卡className active。

* 高效的一个原因是，编译过程中已经将dom进行缓存，简单讲类似：  var a = $(".a");  后面操作都是用变量a去操作。

你可以说那我之前都是这样写的。效率不是一样么?
答：性能效率是差不多，只是loyal帮你干了这件事。 

### 总的来说，优点感觉有这么几个（个人拙见）

1. 代码逻辑好像要清晰了，做为jser可以不用写html这种文本标记咯，不用让大脑来回切换html js 模式了，是不是很爽。（css的话以后再说，compass sass？？)
2. 代码看起来，好理解，看下view就知道程序是要干嘛，需要编写的代码量也少了很多，
2. 上手简单（中国式英语）只有很少的api。
3. 性能高效，用chrome Timeline 进行记录，然后不停的切换选项卡，对比用angularjs的方式实现，所需要执行次数和内存占用貌似好许多。（其实我想说，这chrome的一些开发工具用的还不是很溜）
4. 作者本人才疏学浅，不善表达，非常非常需要大家的指正和围观。



## API


### 界面模型中的一些渲染和绑定语法


#### 静态渲染的几种写法
````
// 普通替换
{{ name }}

// 函数处理后的替换
{{ name | returnFormat() }} 

// 表达式执行结果值的替换
{{ name ? 'true' : '' }} 或者 {{ name=="lily" ? '20' : '18' }} 等等
````


#### 动态绑定的几种写法
````
// 普通单个事件绑定
"h-on":"click:handle";
    ...

    handle:function(e){
    	// this == element
    }

// 多个事件绑定写法
"h-on":"click:handle,focus:isFocus";
    ...

    handle:function(e){
    	// this == element
    }




// 带参数的事件函数
"h-on":"click:handle(1)";
	...

    handle:function(e,i){
    	// this == element
    	// i === 1
    }



// 监听类型的事件绑定
"h-on":"click,li:handle";
	...

    handle:function(e,i){
    	// this == li
    	// i === 1
    }




// 普通className 赋值方法
"h-class":"active";
	// if project.data.update("active","activeClassName");
	// then element.className === "activeClassName";




// 带函数处理的
"h-class":"active | handle()";
	...
	handle:function(name){
		// name === project.data[name];
		// if return "xxxx";
		// then element.className === "xxxx";
	}




// 输入控件监听
"h-model":"active";
	...
	// if element isChanged; 
	// then project.data.active === element.value;




// 控件的赋值
"h-value":"active";
	// if project.data.update("active","哈哈哈");
	// then element.value === "哈哈哈";




// 元素内容
"h-text":"active";
	// if project.data.update("active","你妹");
	// then element.text() === "你妹";




// 初始化的时候就执行了。
"h-init":"handle";
	...
	handle:function(){
		// if project.run();
		// then this function will be run;
	}	



// 监听active属性的改变，触发handle函数
"h-watch":"active | handle";
	...
	handle:function(param){

		// if active be changed all types
		// then this function run
		// param === project.data.active;
	}




// 改变是add类型的，才会触发handle函数
"h-watch-add":""; 
	...
	handle:function(param){

		// if active be changed by add
		// then this function run
		// param === project.data.active;
	}


"h-watch-update":""; 
	...
	handle:function(param){

		// if active be changed by update
		// then this function run
		// param === project.data.active;
	}

more then

"h-watch-update":""; 
"h-watch-remove":"";
````

#### DATA数据层操作

````
// 获取data下key名为name的值，这里的name支持RegExp,如： /active\d/;
.data.get("name")

// 更新data下key名active的值为"active",  支持多级如： "list[3].content";
.data.update("active","active")

// 给data下key名为type0的值添加一个json对象，所以这里的type0属性必定是一个数组
.data.add("type0",{content:"",time:""});

// 删除data下key名
.data.remove("type0");
````

#### 继承

开放式的继承解决方案
引用作者民工精髓的文章内容：
````
	我在用某个组件时需要重新调整一下组件里面元素的顺序怎么办? 我想要去掉组件里面某一个元素怎么办? 如何把组件变得更易扩展? 具体一点: 业务方不断要求给组件加功能怎么办? 
````
Web 前端组件化是个难题

现状：
* 一些封装严密的组件，内部实现混淆，只提供特定接口，需要限制产品需求在组件所能提供的功能，例如 extjs
* 一些组件开放源码，一旦需求组件无法满足，由于比较方便添加修改源文件（现状大部分是这样）或者强行在现有的代码写if else 
  添加参数新增接口，或是拷贝一份做些修改取个新的名字再用，都没有能易用复用 （jQuery 各种插件）

看看loyal 是怎么处理继承问题的。
````
	
	// 改下标题和渲染数据
	var tabs1 = {
		name:"tabs1",
		data:{
			type0:[
				{
					content:"小明天真"
				}
			],
			type2:[
				{
					content:"哈哈"
				}
			],
			menu:[
				"天真","无邪","美丽","可爱"
			]
		}
	};
	tabs1 = loyal(tabs1,tabs);
	tabs1.init();


	// 选项卡事件触发不同
	var tabs2 = {
		name:"tabs2"
	};
	tabs2.view = tabs.view.protocol();
	tabs2.view.menu["h-on"] = "mouseover,tab:activeType()";


	tabs2 = loyal(tabs2,tabs);
	tabs2.init();

	// 选项卡上有图标
	var tabs3 = {
		name:"tabs3"
	};
	tabs3.view = tabs.view.protocol();
	tabs3.view.menu.repeat.tab.i = {};
	tabs3 = loyal(tabs3,tabs);
	tabs3.init();


````
##### 效果可以看上面的demo

#### 最后

如果觉得本文对你有所启发，请点一下右上角star，感谢。




### github

https://github.com/306808700/loyal
