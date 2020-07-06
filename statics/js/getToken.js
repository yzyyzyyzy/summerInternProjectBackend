
// ajax访问 /getToken/ 将token存入cookies, 如果出错，跳转到/error/
$.get("/getToken/",
    function (data) {
        // res: {error: true/false, url: 重定向网址(if error)}
        res = JSON.parse(data);
        log("getToken error: " + res.error);
        if (res.error) {
            window.location.href = res.url;
        }
        // console.log(statusText);
        // console.log(xhr);
    }
);