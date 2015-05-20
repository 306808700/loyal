### loyal 1.0 beta

创建于时间2015年4月22日。
这是什么东东，其实我自己也不清楚当初搞这个是为了什么。暂且认为是angularjs的轮子吧，不过我还是取了名字 loyal 中文名 “洛亚尔”
不要问我为何取这样的名字，我会告诉你乱打拼音首字母出来的单词吗。

源码加上注释共755行，压缩后有8K。

目前为止只有作者本人在使用（因为只有我知道的东西，哈哈哈） 如果你觉得原创精神可嘉（虽然是个轮子），帮忙点下右上角的 “like”


### 怎么用 ?
这里有个例子可以看

````
	<html>
    <body>
		<div h-controller="tabs">
			<div h-name="tabs"></div>
		</div>
	</body>
	</html>
    <script src="tabs.js" charset="utf-8"></script>

````


````
    var loyal = require("loyal.js");
    var tabs = loyal({
	    version:1.0,
	    name:'tabs',
	    view:{
	        menu:{
	            "h-on":"click,tab:activeType()",
	            repeat:{
	                data:"menu",
	                'tab-1':{
	                    "h-class":"active{{i}}",
	                    text:'{{ value }}',
	                }
	            }
	        },
	        ul:{
	            "h-name":"tabsBox",
	            "h-watch-add":"type0 | addRecordToType0()",
	            repeat:{
	                data:"list || type0",
	                li:{
	                    text:'{{ content }}',
	                    class:"{{ i==0 ? 'first' :''}}",
	                    time:{
	                        text:'{{ time | returnFormatDate() }}'
	                    }
	                }
	            }
	        }
	    },
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
	            '类型5',
	        ]
	    },
	    event:{
	        
	        addRecordToType0:function(){
	            /*
	            var last = tabs.data.type0.last();
	            tabs.run({li:tabs.view.ul.repeat.li},last,"tabsBox","append");
	            */
	        },
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

	            // 更新当前标
	            tabs.data.update("active"+i,"active");
	        }
	    },
	    helper:{
	        returnFormatDate:function(date){
	            return date?$.date(date,"yyyy-MM-dd hh:mm:ss"):"";
	        }
	    },
	    init:function(){
	        // 初始化主体
	        tabs.run(tabs.view ,tabs.data);
	        
	        // 选中第一个
	        tabs.data.update("active0","active",true);
	    }
	});

````
