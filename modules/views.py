from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.core import serializers

import json

from modules import utils
from modules import faceDetect
from modules import tts


# TODO 用户登录，存储历史记录

def index(request):
    return render(request, 'index.html')


def error(request, msg):
    return render(request, 'error.html', {'error_msg': msg})


def getToken(request):
    """获取两个token，存入cookie，返回HttpResponse结果
    """
    faceToken = request.COOKIES.get('face', None)
    ttsToken = request.COOKIES.get('tts', None)

    resp = HttpResponse(json.dumps({"error": False}))

    if not faceToken:
        try:
            faceTokenDict = faceDetect.getToken()
            resp.set_cookie('face', faceTokenDict['token'], max_age=faceTokenDict['max_age'])

        except Exception as e:
            return HttpResponse(json.dumps({'error': True, 'url': '/error/{}/'.format(e)}))

    if not ttsToken:
        try:
            ttsTokenDict = tts.getToken()
            resp.set_cookie('tts', ttsTokenDict['token'], max_age=ttsTokenDict['max_age'])

        except Exception as e:
            return HttpResponse(json.dumps({'error': True, 'url': '/error/{}/'.format(e)}))

    return resp


def camera_site(request):
    """进入摄像头拍照页面
    """
    return render(request, 'camera.html')


def detect_camera(request):
    """根据post来的摄像头的照片dataURL，后台检测人脸，把人脸json数组和音频url路径数组存入session，后跳转到/result/
    """
    if request.POST:
        # # DEBUG:
        # face_list = [{
        #     'debug': '这是假数据',
        #     'face_token': 'bc3b6b1b097c02a074ffe51600f05a5d',
        #     'location': {'left': 149.72, 'top': 203.17, 'width': 195, 'height': 173, 'rotation': -4},
        #     'face_probability': 1,
        #     'angle': {'yaw': -3.85, 'pitch': 23.26, 'roll': -5.66},
        #     'age': 26,
        #     'beauty': 86.31,
        #     'expression': {'type': 'none', 'probability': 1},
        #     'gender': {'type': 'male', 'probability': 1},
        #     'glasses': {'type': 'none', 'probability': 1}
        # }]
        # audio_files = [
        #     utils._save_file(
        #         tts.convert("24.ecd50730e52b304cf1d3da9bbe399b8d.2592000.1596556460.282335-10854623",
        #                 "阿巴阿巴"),
        #         'mp3'
        #     )
        # ]

        # # 把结果存入session，然后跳转到/result/
        # request.session['face_list'] = face_list
        # request.session['audio_files'] = audio_files
        # request.session['result_expired'] = False  # 是否显示过这个结果，如果显示过应该认为session里的值是过期的
        # return redirect('/result/')

        dataURL = request.POST.get('picDataURL', None)
        # print(dataURL)
        if dataURL:
            # 有图片，调用图像识别api
            face_display_list = []
            face_to_audio_txt_list = []
            faceToken = request.COOKIES.get('face', None)
            ttsToken = request.COOKIES.get('tts', None)
            try:
                face_list = utils.dataURL_to_face_list(faceToken, dataURL)
                audio_files = utils.faces_to_audio_files(ttsToken, face_list)
                for face in face_list:
                    face_display_list.append(utils.faces_to_display_txt(face))
                    face_to_audio_txt_list.append(utils._face_to_audio_txt(face))

                # 把结果存入session，然后跳转到/result/
                request.session['face_list'] = face_list
                request.session['audio_files'] = audio_files
                request.session['face_display_list'] = face_display_list
                request.session['face_to_audio_txt_list'] = face_to_audio_txt_list
                request.session['result_expired'] = False  # 是否显示过这个结果，如果显示过应该认为session里的值是过期的
                return redirect('/result/')

            except Exception as e:
                return redirect('/error/出错: {}/'.format(e))
        else:
            # 没有传来picDataURL数据，跳转回前端摄像头拍照页面
            return redirect('/camera/')
    else:
        # GET 方法，不处理数据，返回前端摄像头拍照页面
        return redirect('/camera/')

def detect_picfile(request):
    """根据post来的上传的照片二进制流，后台检测人脸，把人脸json数组和音频url路径数组存入session，后跳转到/result/
    """
    if request.POST:
        # 获取来自input标签的文件内容
        picfile = request.FILES.get('picfile', None)
        # print(picfile)
        if picfile:
            # 有图片，调用图像识别api
            faceToken = request.COOKIES.get('face', None)
            ttsToken = request.COOKIES.get('tts', None)
            try:
                face_display_list = []
                face_to_audio_txt_list = []
                face_list = utils.picfile_to_face_list(faceToken, picfile)
                audio_files = utils.faces_to_audio_files(ttsToken, face_list)
                for face in face_list:
                    face_display_list.append(utils.faces_to_display_txt(face))
                    face_to_audio_txt_list.append(utils._face_to_audio_txt(face))

                # 把结果存入session，然后跳转到/result/
                request.session['face_list'] = face_list
                request.session['audio_files'] = audio_files
                request.session['face_display_list'] = face_display_list
                request.session['face_to_audio_txt_list'] = face_to_audio_txt_list
                # 是否显示过这个结果，如果显示过应该认为session里的值是过期的
                request.session['result_expired'] = False
                return redirect('/result/')

            except Exception as e:
                return redirect('/error/出错: {}/'.format(e))
        else:
            # 没有传来picDataURL数据，跳转回前端摄像头拍照页面
            return redirect('/camera/')
    else:
        # GET 方法，不处理数据，返回前端摄像头拍照页面
        return redirect('/camera/')

def result(request):
    """ 根据session显示相应的结果页面

    如果session['result_expired']为空或True则跳转回 /camera/
    """

    # 判断session是否有数据
    if not request.session.get('result_expired', None):
        # TODO 数据可视化
        context = {}
        context['face_list'] = request.session.get('face_list', None)
        context['audio_files'] = request.session.get('audio_files', None)
        context['face_display_list'] = request.session.get('face_display_list',None)
        context['face_to_audio_txt_list'] = request.session.get('face_to_audio_txt_list', None)
        request.session['result_expired'] = True
        # TODO 音频数据用完之后是否需要删掉？
        return render(request, 'result.html', context)
    else:
        return redirect('/camera/')
    pass
