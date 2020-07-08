// https://developer.mozilla.org/zh-CN/docs/Web/API/MediaDevices/getUserMedia
// https://developer.mozilla.org/zh-CN/docs/Web/API/Navigator/getUserMedia
// 在移动设备上面，如下的例子表示优先使用前置摄像头（如果有的话）：
// { audio: true, video: { facingMode: "user" } }

// 强制使用后置摄像头，请用：
// { audio: true, video: { facingMode: { exact: "environment" } } }


//* solved debug: safari: ImageCapture is not defined.
//* solved qq打开之后摄像头不会真的关掉，会拉长。 -- 看看video标签有没有问题？有的话就要设置隐藏了
//* solved 移动端进入，前置摄像头要镜像 
// TODO ipad进入是pc端 /not solved/
// TODO 手动选择是否镜面反转

URLs.upload = ""; // TODO 后台上传图片地址

// *注意不能用jquery，否则没有play方法
var video = document.getElementById('video');
const photoCanvas = document.getElementById('photoCanvas');
const photoContext = photoCanvas.getContext('2d');
let photoPreview = document.getElementById("photoPreview");

// var imageCapture = null;
// 是否打开了摄像头
var cameraOn = false;


// select jquery对象：
// 3、获取当前选中项的value
// $(".selector").val();
// 4、获取当前选中项的text
// $(".selector").find("option:selected").text();

// select DOM对象：
// select.selectedOptions[0].text
// select.selectedOptions[0].value

$(document).ready(function () {
    // 下拉菜单改变时设置相应的constraints，如果已打开摄像头需要即时切换
    let select = $("#devices");
    select.change(function () {
        log("切换为设备:" + select.find("option:selected").text());

        if (!cameraOn) {
            updateConstraints(select.val());
        } else {
            hotSwitchDevice(select.val());
        }
    });
});

function updateConstraints (deviceId) {
    if (os.isPc) {
        if (deviceId) {
            constraints.pc.video.deviceId = { exact: deviceId };
        } else {
            delete constraints.pc.video.deviceId;
        }
    } else {
        if (deviceId) {
            constraints.mobile.video.deviceId = { exact: deviceId };
        } else {
            delete constraints.mobile.video.deviceId;
        }
    }
}

/**
 * 打开摄像头
 */
function turnOnDevice () {
    if (os.isPc) {
        log("使用pc的constraints:<br>" + constraints.toString(constraints.pc));
    } else {
        log("使用mobile的constraints:<br>" + constraints.toString(constraints.pc));
    }

    // https://developer.mozilla.org/zh-CN/docs/Web/API/MediaDevices/getUserMedia
    navigator.mediaDevices.getUserMedia(os.isPc ? constraints.pc : constraints.mobile)
        .then(function (stream) {
            log("获取到摄像头媒体流。");
            log("视频流共" + stream.getVideoTracks().length + "个。");
            cameraOn = true;
            // 成功获取
            video.srcObject = stream;


            // 用于截图
            // imageCapture = new ImageCapture(stream.getVideoTracks()[0]);

            // 加载完成后触发
            video.onloadedmetadata = function (e) {
                log("加载媒体流完毕")
                video.style.visibility = "visible";
                video.play();
                // 调整按钮是否可用
                if (DEBUG.show_btns) {
                    document.getElementById("onBtn").disabled = false;
                    document.getElementById("offBtn").disabled = false;
                    document.getElementById("photoBtn").disabled = false;
                } else {
                    document.getElementById("onBtn").disabled = true;
                    document.getElementById("offBtn").disabled = false;
                    document.getElementById("photoBtn").disabled = false;
                }
            };
            video.oncanplay = function () {
                // 在onloadedmetadata之后触发
            }
            // 清空数据后触发
            video.onemptied = function (e) {
                // 隐藏ideo
                video.style.visibility = "hidden";
            }

        })
        // video.style.visibility = "hidden" / "visible"
        .catch(function (error) {
            // 获取失败
            cameraOn = false;
            log(`获取摄像头失败。${error.code}-${error.name}: ${error.message}`);
            alert(`获取摄像头失败。${error.code}-${error.name}: ${error.message}`);

            if (error.name == "OverConstrainedError") {
                // TODO 不限制id对应界面是否要修改
                log("尝试不限制id打开");
                updateConstraints();
                turnOnDevice();
            }
        })
}

/**
 * 即时切换不同摄像头设备
 */
function hotSwitchDevice (deviceId) {
    stopVideoTrack();
    updateConstraints(deviceId);
    turnOnDevice();
}


/**
 * 关闭摄像头按钮
 */
function closeDevice () {
    stopVideoTrack();
    cameraOn = false;
    video.srcObject = null;
    // imageCapture = null;
    if (DEBUG.show_btns) {
        document.getElementById("onBtn").disabled = false;
        document.getElementById("offBtn").disabled = false;
        document.getElementById("photoBtn").disabled = false;
    } else {
        document.getElementById("onBtn").disabled = false;
        document.getElementById("offBtn").disabled = true;
        document.getElementById("photoBtn").disabled = true;
    }
}

/**
 * 断开视频流
 */
function stopVideoTrack () {
    video.srcObject.getTracks()[0].stop();
}

function downPic () {
    const dataURL = photoCanvas.toDataURL();
    downFile(dataURL, "pic.txt");
}

// https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Taking_still_photos
// https://developer.mozilla.org/zh-CN/docs/Web/API/ImageCapture
function takePhoto () {

    // 获取截图

    // 0. 传统版
    photoCanvas.width = video.videoWidth;
    photoCanvas.height = video.videoHeight;
    photoContext.drawImage(video, 0, 0);

    // 设置input的value，用于上传dataURL
    const dataURL = photoCanvas.toDataURL();
    document.getElementById("picDataURL").value = dataURL;
    log("已设置picDataURL")
    // TODO post的过程中显示loading窗口
    
    photoPreview.src = dataURL

    document.getElementById("photoBtn").innerText = '重拍'

    // 用polyfill的话对应if分支不走instanceof ImageData，photoCanvas instanceof HTMLCanvasElement
    // imageBitmap = createImageBitmap(photoCanvas);

    // 1.
    // //* polyfill 返回的imageitmap是img的element，原版返回的是ImageBitmap
    // imageCapture.takePhoto()
    //     .then(blob => createImageBitmap(blob))
    //     .then(imageBitmap => {
    //         // 画在canvas上
    //         //*后期不需要显示在前端
    //         drawCanvas(photoCanvas, imageBitmap);

    //         log(imageBitmap);

    //         // 发送给后台进行处理
    //         // uploadPhoto(imageBitmap);
    //     })
    //     .catch(error => log(error));

    // 2.
    // 用polyfill的话createImageBitmap的polyfill对应if分支不走instanceof ImageData
    // imageCapture.grabFrame()
    // .then(imageBitmap => {
    //     // 画在canvas上
    //     //*后期不需要显示在前端
    //     log(imageBitmap);

    //     drawCanvas(photoCanvas, imageBitmap);

    //     // 发送给后台进行处理
    //     // uploadPhoto(imageBitmap);
    // })
    // .catch(error => alert(`拍照错误，${error}`));


}


function drawCanvas (canvas, img) {
    canvas.width = getComputedStyle(canvas).width.split('px')[0];
    canvas.height = getComputedStyle(canvas).height.split('px')[0];
    let ratio = Math.min(canvas.width / img.width, canvas.height / img.height);
    let x = (canvas.width - img.width * ratio) / 2;
    let y = (canvas.height - img.height * ratio) / 2;
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height,
        x, y, img.width * ratio, img.height * ratio);
}