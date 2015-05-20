### loyal 1.0 beta

创建于时间2015年4月22日。
这是什么东东，其实我自己也不清楚当初搞这个是为了什么。暂且认为是angularjs的轮子吧，不过我还是取了名字 loyal 中文名 “洛亚尔”
不要问我为何取这样的名字，我会告诉你乱打拼音首字母出来的单词吗。

源码加上注释共755行，压缩后有8K。

### 目前谁在用

到今天为止只有作者本人在使用（因为还没公布嘛） 如果你觉得原创精神可嘉（俨然是个轮子）或者码字不容易，帮忙点下右上角的 “like”


### 怎么用 ?

这里有个例子可以看  （ps:本例子使用了 npm browserify ，所以可以直接使用require，你也可以这样“配置”，或者引入seajs 或者 requirejs 或者 干脆不用require，直接在index.html里面写script标签引入依赖的js）

tabs.html
````
	<html>
	<style>
      	ul,li{padding:0;margin:0}
		body{font-family:"Open Sans",Arial,"Hiragino Sans GB","Microsoft YaHei","微软雅黑",STHeiti,"WenQuanYi Micro Hei",SimSun,sans-serif;font-size:14px;line-height:1.5;background:#fff}
		.first{font-size:16px;font-weight:bold;color:yellow}
		.active{background-color:#369}
		tabs{padding:10px;display:block}
		menu{display:block}
		menu tab{width:20%;display:inline-block;background-color:gray;color:#fff;text-align:center;height:30px;line-height:30px}
		ul{display:block;background-color:#369;color:#fff;padding:10px}
		ul li{margin:15px 5px}
		ul time{display:block}
		add{margin:10px}
	</style>
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
    
    /*
    	你也可以选用 zepto jquery 不过本例子用到formatDate 函数等只有dmimi-mobile 才有的功能，所以你得去目录extend里面拷贝代码放到前面
    */
    var $ = require("dmimi-mobile.js");

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
	                content:'我只是喝了一些杨梅酒，未处理',
	                time:"1431933120489",
	                type:1
	            },
	            {
	                content:'警察同志，我活很好的，这次就别罚款了行吗？ 未处理',
	                time:"1431934520489",
	                type:1
	            },
	            {
	                content:'TMD又罚款，老子没钱。 未处理',
	                time:"1431934410489",
	                type:1
	            },
	        ],
	        type1:[
	            {
	                content:'提交罚款2000元，已处理',
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
	        tabs.run(tabs.view ,tabs.data);
	        
	        // 更新data中的active0 那么对应节点的className会被添加一个"active"；
	        tabs.data.update("active0","active",true);
	    }
	});	

	tabs.init();

````

如上所示，  html几乎不用写（还是要写的，只是换了更顺手的形式JSON，对就是JSON）

界面模型view，将会被编译渲染为html dom 树插入到容器中，渲染时候还能根据管道函数（helper）输出处理后的数值。

所有的交互都不和dom发生关系，而是效率更高的数据层交互，然后数据层会去修改dom节点比如切换选项卡，添加当前选项卡className active。

效率高的一个原因是，编译过程中已经将dom(可能需要交互的) 进行缓存，简单讲类似：  var a = $(".a");  后面操作都是用变量a去操作。

你可以说那我之前都是这样写的。效率不是一样么?

答：效率是差不多，只是用了loyal帮你干了这件事。 

总的来说，优点感觉有这么几个，

1. 代码逻辑更清晰，易读和理解，需要编写的代码量也少了很多
2. 比angular更容易上手，很少的api即可实现其大部分功能呢
3. 性能高效，用chrome Timeline 进行记录，然后不停的切换选项卡，分别用angularjs和loyal实现，所需要执行次数和内存占用，
4. 作者本人才疏学浅，非常非常需要高手来评测。

### 本例demo

http://dmimi.sinapp.com/mobile/tabs.html



### api


#### VIEW界面模型

// 渲染的几种写法
{{ name }}
{{ name | returnFormat() }}
{{ name ? 'true' : '' }} 或者 {{ name=="lily" ? '20' : '18' }} 等等

##### 绑定的几种写法
"h-on":"click:handle" 
"h-class":"";
"h-model":"";
"h-value":"";
"h-text":"";
"h-init":"";
"h-watch":"";  或者 "h-watch-add":""; "h-watch-update":""; "h-watch-remove":"";


#### DATA数据层操作

// 获取data下key名为name的值，这里的name支持RegExp,如： /active\d/;
.data.get("name")

// 更新data下key名active的值为"active",  支持多级如： "list[3].content";
.data.update("active","active")

// 给data下key名为type0的值添加一个json对象，所以这里的type0属性必定是一个数组
.data.add("type0",{content:"",time:""});

// 删除data下key名
.data.remove("type0");
