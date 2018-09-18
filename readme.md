[build_status]:https://travis-ci.org/yyrdl/cc.svg?branch=master
[coverage_status_url]:https://coveralls.io/repos/github/yyrdl/cc/badge.svg?branch=master
[coverage_page]:https://coveralls.io/github/yyrdl/cc?branch=master
 
# CC  ![build status][build_status] [![Coverage Status][coverage_status_url]][coverage_page]

> cc : a mystical women in 《Code Geass》

A solution to write sync code, based on most basic JS grammar,no need to translating ,compatible with all JS runtime.

# Usage


`<script type="text/javascript" src="./cc.min.js"></script>`

> In node.js just `npm install cc_co` and require it.


Let's show how to write sync code .

```js

  cc(function(exec,ctx,resume){

       // launch $.post (provided by jquery) ,assign the result to "info"
       // "/search",{"key":"cc"} and `resume` are the arguments of $.post.

       exec.async($.post).assign("info")("/search",{"key":"cc"},resume);

       exec(function(){
          //get the detail
          exec.async($.get).assign("detail")("/detail",ctx.info.detail,resume);

       });

       exec(function(){
         // print the detail of key "cc" at end
         console.log(ctx.detail);
       });

  })()

```
An example of Promise

```js

function pro(){
    return new Promise(function(resolve,reject){
          Math.random() > 0.5 ? resolve("ok") : reject(new Error("Manual Error"))
    });
}

cc(function(exec,ctx,resume){
    
   exec(pro).assign("result");

   exec(function(){
       var error = ctx.result[0],value = ctx.result[1];
       if(error){
           console.log(error);
       }else{
           console.log(value);
       }
   })
})();

```


A more complex example:

```js



 
// the representative of all async operations

function async_func(func) {
	setTimeout(function () {
		func("hello world");
	}, 100);
}

// write code in sync way

function sync_code() {
    return cc(function (exec,ctx,resume) {

        // wait 1 second

        exec.async(setTimeout)(resume,1000);
        
        //run a loop
        //Attention:Do not use "for,while" that provided by the JS language here,
        //it will make a conflict with cc.

        let i = 0;
        exec.for(function () {

            if( i >= 5){
                exec.break();
                //or
                //exec.return(ctx.v);
            }

            //run the function "async_func" ,and set the result as "v";

            exec.async(async_func).assign("v")(resume);


            exec(function(){
            // print the result "v"
                console.log("v:"+ctx.v);
                i++;
            });

        });
        /**
         *  return "v" and end.
         *
         *  we can't run "exec.return(ctx.v)" directly here ,because the loop haven't be executed by cc yet.
         *
         *  More: you can return multiple result ,like "exec.return(1,2,3,4,5)"
         * */
        exec.return(exec(function () {
            return ctx.v;
        }));

    });

}

// invoke function "sync code" by cc
cc(function (exec,ctx) {
     
    exec(sync_code).assign("result");// the snippet of code show the nest usage of cc
	
    exec(function () {
        console.log(ctx.result);
    })

})();

//or invoke directly
sync_code(function(err,result){
    if(err){
	  console.log(err);
	}else{
	  console.log(result);
	}
});
```

# Theory

An operation  consists of method , arguments and result, no matter if the operation is asynchronous or synchronous.

And we know that it will be executed in async way ,but we just want to writing  sync code in form , and cc created this form.

cc regards each operation as an instruction , instruction is written in order . At first ,cc will get the instruction list,

second cc run each instruction in order , so that the difference between async and sync operations will be shielded.


__Each run of `exec` will create an instruction，instruction will be executed in logic order， can't guarantee the order of code that dose not expressed by `exec`.__
