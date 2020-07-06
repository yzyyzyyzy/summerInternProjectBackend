
$(document).ready(function () {

    // 隐藏video
    video.style.visibility = "hidden";


    if (DEBUG.enter_as_mobile) {
        
        log("移动端进入");

        $("#deviceInfo").text("强行以移动端进入");

        if (DEBUG.show_btns){
            $("#onOffBtnsWrapper").html(
                '<button id="onBtn" onclick="turnOnDevice()">打开前置摄像头</button>' +
                '&nbsp;' +
                '<button id="offBtn" onclick="closeDevice()">关闭摄像头</button>'
            );
        } else{

            $("#onOffBtnsWrapper").html(
                '<button id="onBtn" onclick="turnOnDevice()">打开前置摄像头</button>' +
                '&nbsp;' +
                '<button id="offBtn" onclick="closeDevice()" disabled>关闭摄像头</button>'
            );
        }

    } else {
        
        // 判断是pc端还是移动端并渲染相应页面
        if (os.isPc) {

            log("pc端进入");

            $("#deviceInfo").text("pc端进入");
            
        } else {

            log("移动端进入");

            $("#deviceInfo").text("移动端进入");

            // TODO 添加开启镜像翻转按钮，手动选择
            // 设置video镜像反转
            $("#video").css({ transform: "rotateY(180deg)" });
            // 设置canvas镜像反转
            $("#photoCanvas").css({ transform: "rotateY(180deg)" });
        }

        if (DEBUG.show_btns) {
            document.getElementById("onBtn").disabled = false;
            document.getElementById("offBtn").disabled = false;
            document.getElementById("photoBtn").disabled = false;
        }
    }
});