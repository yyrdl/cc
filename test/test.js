/**
 * Created by jason on 2017/10/17.
 */
var cc  = require("../index");

describe("basic",function () {

    //test run async operation
    it("setTimeout",function (done) {
        var wait = 100;
        cc(function (exec,ctx,resume) {

            var start = Date.now();

            exec.async(setTimeout)(resume,wait);

            exec(function () {
                exec.return(Date.now()-start);
            });

        })(function (err,result) {
            if(err){
                done(err);
            }else if(result[0]<wait){
                done(new Error("Failed to run async operation!"))
            }else{
                done();
            }
        });
    });

    it("catch error:when try to get instruction list",function (done) {
       cc(function () {
           throw new Error();
       })(function (err) {
           if(err){
               done();
           }else {
               done(new Error());
           }
       }) 
    });

    it("catch error:when run instruction",function (done) {
        cc(function (exec) {

            exec.async(setTimeout)(resume,100);

            exec(function () {
                throw new Error();
            });

        })(function (err) {
            if(err){
                done();
            }else {
                done(new Error());
            }
        })
    });

    it("error should be throw out when no handler provided",function (done) {
        var error = null;

        try{

            cc(function () {
                throw new Error()
            })();

        }catch (e){
            error = e;
        }

        if(error == null){
            done(new Error());
        }else{
            done();
        }
    });
    
    it("loop",function (done) {
        var times = 3;
        cc(function (exec) {
            var i=0;

            exec.for(function () {
                i++;

                if(i>times){
                    exec.break();
                }
            });

            exec(function () {
                exec.return(i);
            });

        })(function (err,result) {
            if(err || result[0] != times+1){
                done(new Error());
            }else{
                done();
            }
        });
    });


    it("assign:access the result of the async operation",function (done) {
        var value = 10;

       function async_func(callback) {
           setTimeout(function () {
               callback(value);
           },10);
       } 
        
       cc(function (exec,ctx,resume) {
           exec.async(async_func).assign("result")(resume);

           exec.return(exec(function () {
               return ctx.result[0];
           }));

       })(function (err,result) {

           if(err || result[0] !== value){

               done(new Error());
           }else{
               done();
           }
       })
    });

});

describe("complex",function () {

    it("nest instruction exec order",function (done) {
        cc(function (exec,ctx,resume) {

            var array = [];

            exec.async(setTimeout)(resume,10);

            exec(function () {
                
                array.push(1);

                exec(function () {

                    array.push(2);

                    exec(function () {
                        array.push(3);
                    })
                });
            });

            exec(function () {
                array.push(4);
                exec.return(array);
            });

        })(function (err,result) {
            if(err){
                done(err);
            }else{
                var array = result[0];
                for(var i =0;i<array.length;i++){
                    if(array[i] !== i+1){
                        return done(new Error());
                    }
                }
                done();
            }
        })
    });
    
    it("nest for instruction exec",function (done) {
       cc(function (exec,ctx,resume) {
           var str = "";
           var i =0;
           exec.for(function () {

               if(i >= 2){
                   exec.return(str);
               }else{
                   i++;
                   str+="a";
               }

               exec.async(setTimeout)(resume,10);

               var k =0;

               exec.for(function () {
                   if(k>=2){
                       exec.break();
                   }else {
                       k++;
                       str+="b";
                   }
               });
               
           });
       })(function (err,result) {
           if(err){
               done(err);
           }else{
               if(result[0] !== "abbabb"){
                   done(new Error());
               }else{
                   done();
               }
           }
       })
    });
});