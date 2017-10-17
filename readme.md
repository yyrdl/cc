[build_status]:https://travis-ci.org/yyrdl/cc.svg?branch=master
[coverage_status_url]:https://coveralls.io/repos/github/yyrdl/cc/badge.svg?branch=master
[coverage_page]:https://coveralls.io/github/yyrdl/cc?branch=master
 
## CC  ![build status][build_status] [![Coverage Status][coverage_status_url]][coverage_page]

> cc 《叛逆的鲁鲁修》中的谜之女子

基于ES5语法的异步代码同步编写模块,无需转译，基本兼容所有的javascript解释器。

## 用法


浏览器中的使用示例:

首先将项目目录下的index.js文件引入你的页面.

>node.js端 获取方式：`npm install cc_co`

```js
cc(function(exec,ctx,resume){
   //执行一个异步请求
   exec.async(ajax.get).assign("page")("/page",resume);
   
   exec(function(){
      console.log(ctx.page);//取得上一步请求服务器返回的结果
   })

})()
```

包含所有功能的例子:

```js



 
// 异步操作的代表函数,简单做加和操作

function async_func(a, func) {
	setTimeout(function () {
		func(a+Math.floor(Math.random()*100));
	}, 100);
}

// 以同步的方式书写异步执行的代码
function sync_code() {

    return cc(function (exec,ctx,resume) {

        /**
         * 执行setTimeout 等待一秒
         * */
        exec.async(setTimeout)(resume,1000);

        let i = 0;

        
        //注意不建议使用语言自带的循环，因为cc的工作原理是先获得指令序列再执行，直接使用for可能引发错误
         
        exec.for(function () {

            if( i >= 5){
                exec.break();
                //or
                //exec.return(ctx.v);
            }
            
			//执行一个异步方法，100和 resume是他的调用参数，并将结果命名为"v",后面通过ctx去获得
			
            exec.async(async_func).assign("v")(100,resume);
            // 这里用了一下箭头函数，考虑兼容性的话应该使用function
            exec(()=>{
                
                //获取上一步执行的结果并打印
				
                console.log("v:"+ctx.v);
                i++;
            });

        });
        /**
         * 返回最后的v ，注意，不能直接exec.return(ctx.v);
         * 但是可以在exec.break()的前一行这样做，理由是js解释器执行到这里时
         * 上面的循环还没有被执行，ctx.v还未被赋值，稍后cc库才会去执行循环.
		 *
		 * PS: exec.return 可以返回多值，比如：exec.return(1,2,3,4,5);
         * */
        exec.return(exec(function () {
            return ctx.v;
        }));

    });

}

//调用上面的函数，也演示了如何嵌套使用
cc(function (exec,ctx) {
     
    exec(sync_code()).assign("result");
	
    exec(function () {
        console.log(ctx.result);
    })

})();

//或者直接调用
sync_code(function(err,result){
    if(err){
	  console.log(err);
	}else{
	  console.log(result);
	}
});
```

# 原理

一个操作指令由操作方法，参数，返回值三大部分组成，无论异步还是同步函数都是如此。指令序列可以同步书写，cc只需要保证指令是按照书写的顺序执行即可。
所以cc第一步先获得指令序列，第二步是按顺序解释执行指令。需要思考的是代码的书写方式，既要满足功能预期，又不能比回调嵌套复杂,最终设计成这样的形式。

__exec的每次调用都生成一条指令，指令是按书写的逻辑顺序依次执行的，非exec表述的逻辑不保证执行顺序。__
