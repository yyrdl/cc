## CC

> cc 《叛逆的鲁鲁修》中的谜之女子

基于ES5语法的异步代码同步编写模块,无需转译，基本兼容所有的javascript解释器。

## 用法

浏览器中的使用示例:

`<script type="text/javascript" src ="https://git"></script>`


```js
cc(function(exec,ctx,resume){

   exec.async(ajax.get).assign("page")("/page",resume);
   
   exec(function(){
      console.log(ctx.page);//取得上一步请求服务器返回的结果
   })

})()
```

包含所有功能的例子:

```


/**
 * 异步操作的代表函数,简单做过加和操作
 * */
function async_func(a, func) {
	setTimeout(function () {
		func(a+Math.floor(Math.random()*100));
	}, 100);
}
/**
 * 以同步的方式书写异步执行的代码
*/
function sync_code() {

    return cc(function (exec,ctx,resume) {

        /**
         * 执行setTimeout 等待一秒
         * */
        exec.async(setTimeout)(resume,1000);

        let i = 0;

        /**
         * 不能使用语言自带的循环
         * */
        exec.for(function () {

            if(i>= 5){
                exec.break();
                //or
                //exec.return(ctx.v);
            }
            /**
             * 执行一个异步方法，100和 resume是他的调用参数，并将结果命名为"v"
             * */
            exec.async(async_func).assign("v")(100,resume);

            exec(()=>{
                /**
                 * 获取上一步执行的结果并打印
                 * */
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
/**
 *  调用上面的函数，也演示了如何嵌套使用
*/
cc(function (exec,ctx) {
     
    exec(sync_code()).assign("result");
	
    exec(function () {
        console.log(ctx.result);
    })

})();
```

