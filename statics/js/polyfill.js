// ----------------------------------------------------------------------
// navigator.mediaDevices
// 兼容旧显示器
// 老的浏览器可能根本没有实现 mediaDevices，所以我们可以先设置一个空的对象
if (navigator.mediaDevices === undefined) {
    navigator.mediaDevices = {};
}

// 一些浏览器部分支持 mediaDevices。我们不能直接给对象设置 getUserMedia 
// 因为这样可能会覆盖已有的属性。这里我们只会在没有getUserMedia属性的时候添加它。
if (navigator.mediaDevices.getUserMedia === undefined) {
    navigator.mediaDevices.getUserMedia = function (constraints) {

        // 首先，如果有getUserMedia的话，就获得它
        var getUserMedia = navigator.getUserMedia || //旧版API
            navigator.webkitGetUserMedia || //webkit核心浏览器
            navigator.mozGetUserMedia ||  //firfox浏览器
            navigator.msGetUserMedia;

        // 一些浏览器根本没实现它 - 那么就返回一个error到promise的reject来保持一个统一的接口
        if (!getUserMedia) {
            return Promise.reject(new Error('pollyfill error! 浏览器没实现 getUserMedia 功能，请更换浏览器'));
        }

        // 否则，为老的navigator.getUserMedia方法包裹一个Promise
        return new Promise(function (resolve, reject) {
            getUserMedia.call(navigator, constraints, resolve, reject);
        });
    }
}
// --------------------------------------------------------------------

// /*
// * Safari and Edge polyfill for createImageBitmap
// * https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/createImageBitmap
// *
// * Support source image types Blob and ImageData.
// *
// * From: https://dev.to/nektro/createimagebitmap-polyfill-for-safari-and-edge-228
// * Updated by Yoan Tournade <yoan@ytotech.com>
// */
// if (!('createImageBitmap' in window)) {
//     window.createImageBitmap = async function (data) {
//         return new Promise((resolve, reject) => {
//             let dataURL;
//             if (data instanceof Blob) {
//                 dataURL = URL.createObjectURL(data);
//             } else if (data instanceof ImageData) {
//                 const canvas = document.createElement('canvas');
//                 const ctx = canvas.getContext('2d');
//                 canvas.width = data.width;
//                 canvas.height = data.height;
//                 ctx.putImageData(data, 0, 0);
//                 dataURL = canvas.toDataURL();
//             } else {
//                 throw new Error('createImageBitmap does not handle the provided image source type');
//             }
//             const img = document.createElement('img');
//             img.addEventListener('load', function () {
//                 resolve(this); // 返回img本身
//             });
//             img.src = dataURL;
//         });
//     };
// }

// /**
//  * MediaStream ImageCapture polyfill
//  *
//  * @license
//  * Copyright 2018 Google Inc.
//  *
//  * Licensed under the Apache License, Version 2.0 (the "License");
//  * you may not use this file except in compliance with the License.
//  * You may obtain a copy of the License at
//  *
//  *      http://www.apache.org/licenses/LICENSE-2.0
//  *
//  * Unless required by applicable law or agreed to in writing, software
//  * distributed under the License is distributed on an "AS IS" BASIS,
//  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//  * See the License for the specific language governing permissions and
//  * limitations under the License.
//  */

// export var ImageCapture = window.ImageCapture;

// if (typeof ImageCapture === 'undefined') {
//     ImageCapture = class {

//         /**
//          * TODO https://www.w3.org/TR/image-capture/#constructors
//          *
//          * @param {MediaStreamTrack} videoStreamTrack - A MediaStreamTrack of the 'video' kind
//          */
//         constructor(videoStreamTrack) {
//             if (videoStreamTrack.kind !== 'video')
//                 throw new DOMException('NotSupportedError');

//             this._videoStreamTrack = videoStreamTrack;
//             if (!('readyState' in this._videoStreamTrack)) {
//                 // Polyfill for Firefox
//                 this._videoStreamTrack.readyState = 'live';
//             }

//             // MediaStream constructor not available until Chrome 55 - https://www.chromestatus.com/feature/5912172546752512
//             this._previewStream = new MediaStream([videoStreamTrack]);
//             this.videoElement = document.createElement('video');
//             this.videoElementPlaying = new Promise(resolve => {
//                 this.videoElement.addEventListener('playing', resolve);
//             });
//             if (HTMLMediaElement) {
//                 this.videoElement.srcObject = this._previewStream;  // Safari 11 doesn't allow use of createObjectURL for MediaStream
//             } else {
//                 this.videoElement.src = URL.createObjectURL(this._previewStream);
//             }
//             this.videoElement.muted = true;
//             this.videoElement.setAttribute('playsinline', ''); // Required by Safari on iOS 11. See https://webkit.org/blog/6784
//             this.videoElement.play();

//             this.canvasElement = document.createElement('canvas');
//             // TODO Firefox has https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas
//             this.canvas2dContext = this.canvasElement.getContext('2d');
//         }

//         /**
//          * https://w3c.github.io/mediacapture-image/index.html#dom-imagecapture-videostreamtrack
//          * @return {MediaStreamTrack} The MediaStreamTrack passed into the constructor
//          */
//         get videoStreamTrack () {
//             return this._videoStreamTrack;
//         }

//         /**
//          * Implements https://www.w3.org/TR/image-capture/#dom-imagecapture-getphotocapabilities
//          * @return {Promise<PhotoCapabilities>} Fulfilled promise with
//          * [PhotoCapabilities](https://www.w3.org/TR/image-capture/#idl-def-photocapabilities)
//          * object on success, rejected promise on failure
//          */
//         getPhotoCapabilities () {
//             return new Promise(function executorGPC (resolve, reject) {
//                 // TODO see https://github.com/w3c/mediacapture-image/issues/97
//                 const MediaSettingsRange = {
//                     current: 0, min: 0, max: 0,
//                 };
//                 resolve({
//                     exposureCompensation: MediaSettingsRange,
//                     exposureMode: 'none',
//                     fillLightMode: 'none',
//                     focusMode: 'none',
//                     imageHeight: MediaSettingsRange,
//                     imageWidth: MediaSettingsRange,
//                     iso: MediaSettingsRange,
//                     redEyeReduction: false,
//                     whiteBalanceMode: 'none',
//                     zoom: MediaSettingsRange,
//                 });
//                 reject(new DOMException('OperationError'));
//             });
//         }

//         /**
//          * Implements https://www.w3.org/TR/image-capture/#dom-imagecapture-setoptions
//          * @param {Object} photoSettings - Photo settings dictionary, https://www.w3.org/TR/image-capture/#idl-def-photosettings
//          * @return {Promise<void>} Fulfilled promise on success, rejected promise on failure
//          */
//         setOptions (photoSettings = {}) {
//             return new Promise(function executorSO (resolve, reject) {
//                 // TODO
//             });
//         }

//         /**
//          * TODO
//          * Implements https://www.w3.org/TR/image-capture/#dom-imagecapture-takephoto
//          * @return {Promise<Blob>} Fulfilled promise with [Blob](https://www.w3.org/TR/FileAPI/#blob)
//          * argument on success; rejected promise on failure
//          */
//         takePhoto () {
//             const self = this;
//             return new Promise(function executorTP (resolve, reject) {
//                 // `If the readyState of the MediaStreamTrack provided in the constructor is not live,
//                 // return a promise rejected with a new DOMException whose name is "InvalidStateError".`
//                 if (self._videoStreamTrack.readyState !== 'live') {
//                     return reject(new DOMException('InvalidStateError'));
//                 }
//                 self.videoElementPlaying.then(() => {
//                     try {
//                         self.canvasElement.width = self.videoElement.videoWidth;
//                         self.canvasElement.height = self.videoElement.videoHeight;
//                         self.canvas2dContext.drawImage(self.videoElement, 0, 0);
//                         self.canvasElement.toBlob(resolve);
//                     } catch (error) {
//                         reject(new DOMException('UnknownError'));
//                     }
//                 });
//             });
//         }

//         /**
//          * Implements https://www.w3.org/TR/image-capture/#dom-imagecapture-grabframe
//          * @return {Promise<ImageBitmap>} Fulfilled promise with
//          * [ImageBitmap](https://www.w3.org/TR/html51/webappapis.html#webappapis-images)
//          * argument on success; rejected promise on failure
//          */
//         grabFrame () {
//             const self = this;
//             return new Promise(function executorGF (resolve, reject) {
//                 // `If the readyState of the MediaStreamTrack provided in the constructor is not live,
//                 // return a promise rejected with a new DOMException whose name is "InvalidStateError".`
//                 if (self._videoStreamTrack.readyState !== 'live') {
//                     return reject(new DOMException('InvalidStateError'));
//                 }
//                 self.videoElementPlaying.then(() => {
//                     try {
//                         self.canvasElement.width = self.videoElement.videoWidth;
//                         self.canvasElement.height = self.videoElement.videoHeight;
//                         self.canvas2dContext.drawImage(self.videoElement, 0, 0);
//                         // TODO polyfill https://developer.mozilla.org/en-US/docs/Web/API/ImageBitmapFactories/createImageBitmap for IE
//                         resolve(window.createImageBitmap(self.canvasElement));
//                     } catch (error) {
//                         reject(new DOMException('UnknownError'));
//                     }
//                 });
//             });
//         }
//     };
// }

// window.ImageCapture = ImageCapture;