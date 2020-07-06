//* Done 选择不同输入设备源
// https://developer.mozilla.org/zh-CN/docs/Web/API/MediaDevices/enumerateDevices

$(document).ready(function () {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        log("不支持 enumerateDevices()");
        alert("不支持 enumerateDevices()");
    } else {

        // 把相机加入到下拉菜单中。
        navigator.mediaDevices.enumerateDevices()
            .then(function (devices) {

                let select = document.getElementById("devices");

                let i = 1;
                devices.forEach((device) => {
                    if (device.kind == "videoinput") {
                        let opt = document.createElement("option");
                        opt.text = i + '. ' + device.label;
                        opt.value = device.deviceId;
                        select.appendChild(opt);
                        log("添加设备 " + i + '. ' + device.kind + ": " + device.label + ",<br>id = " + device.deviceId + ".");
                        i += 1;
                    }
                });

                if (DEBUG.add_test_device) {
                    let opt = document.createElement("option");
                    opt.text = i + ". test";
                    opt.value = "test";
                    select.appendChild(opt);
                    log("添加设备 " + i + ". test: test,<br>id = test.");
                    i += 1;
                }

                if (i == 1) {
                    log("没有找到videoinput")
                    alert("没有找到videoinput")
                } else {

                    log("当前设备：" + select.selectedOptions[0].text);
                    updateConstraints(select.selectedOptions[0].value);
                }

                // 渲染下拉菜单到页面
                document.getElementById("devicesWrapper").append(select);

                // devices.forEach(function (device) {
                //     log(device.kind + ": " + device.label +
                //         " id = " + device.deviceId);
                // });
            })
            .catch(function (err) {
                log("enumerateDevices()时发生错误。" + err);
            });

    }


})