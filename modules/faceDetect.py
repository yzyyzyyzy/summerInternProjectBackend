import base64
import requests


def getToken():
    """输出token，以及到期时间用于cookie

    Return:
        {
        'token': token,
        'max_age' : 距离到期的时间（秒）
        }
    """

    AK = 'gMAGi3WH0b7hs04cNi50fZHE'
    SK = 'zFNYwDVtZRBWHjfcVkMVQDpaZIR89SGc'
    # client_id 为官网获取的AK， client_secret 为官网获取的SK
    host = 'https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id={0}&client_secret={1}'.format(
        AK, SK)

    respjson = requests.get(host).json()

    """respjson:
    {
      "refresh_token": "25.080ea0bdcfa5ce4336fefd7925fb044a.315360000.1909316552.282335-20995528",
      "expires_in": 2592000,
      "session_key": "9mzdX+niBW0kQnySNnQz3Ymjh8JGLRlpbtNb2devUtZEnlDi4sf54zyKfl5gpSJlPqVV3U4/yKZUkrkeA3EJ+WIFVFzP6Q==",
      "access_token": "24.d3c9de461dd5125d50882558f2392ab9.2592000.1596548552.282335-20995528",
      "scope": "public brain_all_scope vis-faceverify_faceverify_h5-face-liveness vis-faceverify_FACE_V3 vis-faceverify_idl_face_merge vis-faceverify_FACE_EFFECT wise_adapt lebo_resource_base lightservice_public hetu_basic lightcms_map_poi kaidian_kaidian ApsMisTest_Test权限 vis-classify_flower lpq_开放 cop_helloScope ApsMis_fangdi_permission smartapp_snsapi_base iop_autocar oauth_tp_app smartapp_smart_game_openapi oauth_sessionkey smartapp_swanid_verify smartapp_opensource_openapi smartapp_opensource_recapi fake_face_detect_开放Scope vis-ocr_虚拟人物助理 idl-video_虚拟人物助理",
      "session_secret": "88aab95cc5f59ed3b28cdf9f27a0beb7"
    }
    """


    if ('access_token' in respjson.keys() and 'scope' in respjson.keys()):
        print(
            'SUCCESS WITH TOKEN: {} ; EXPIRES IN SECONDS: {}'.format(respjson['access_token'], respjson['expires_in']))

        return { 'token': respjson['access_token'], 'max_age': respjson['expires_in'] }
    else:
        raise Exception('MAYBE API_KEY or SECRET_KEY not correct: access_token or scope not found in token response')


def picfile_to_image64(picfile):
    """二进制流图片转image64
    """
    # image = base64.b64encode(picfile.read())
    # print(image,'\n')
    image64 = str(base64.b64encode(picfile.read()), 'utf-8')
    return image64


def dataURL_to_image64(dataURL):
    """去掉"data:image/png;base64,"头部，返回后面image64部分
    
    :return: image64 字符串
    """
    return dataURL.split(',')[1]


# 人脸识别
def detect(token, image64):
    """输入image64，输出调用百度API检测后的结果result

        result内容示例: {
            'face_num': 1,
            'face_list': [{
                'face_token': 'bc3b6b1b097c02a074ffe51600f05a5d',
                'location': {'left': 149.72, 'top': 203.17, 'width': 195, 'height': 173, 'rotation': -4},
                'face_probability': 1,
                'angle': {'yaw': -3.85, 'pitch': 23.26, 'roll': -5.66},
                'age': 26,
                'beauty': 86.31,
                'expression': {'type': 'none', 'probability': 1},
                'gender': {'type': 'male', 'probability': 1},
                'glasses': {'type': 'none', 'probability': 1}
            }]
        }
    """
    # token = getToken()
    # image64 = dataURL_to_image64(dataURL)
    
    print("in face detect")
    
    image_type = "BASE64"
    request_url = "https://aip.baidubce.com/rest/2.0/face/v3/detect"

    # print(request_url)

    # 根据自己需要的数据，在face_field添加相应字段
    params = {'image': image64, 'image_type': image_type, "max_face_num": 10,
              'face_field': 'age,beauty,expression,gender,glasses'}
    # print(params)

    request_url = request_url + "?access_token=" + token
    # print(request_url)

    headers = {'content-type': 'application/json'}

    respjson = requests.post(request_url, data=params, headers=headers).json()

    """
    respjson内容：
    {
    'error_code': 0, 
    'error_msg': 'SUCCESS', 
    'log_id': 535158499152, 
    'timestamp': 1593940116, 
    'cached': 0,
    'result': None or json
    }
    """
    
    # print(respjson)

    if respjson['error_code'] == 0:
        # 识别成功
        return respjson['result']

    # TODO 温和地处理没找到脸的错误 err_code=222202
    # 错误码 https://ai.baidu.com/ai-doc/FACE/5k37c1ujz
    raise Exception(
        "face detection error! err_code: {}, err_msg: {}".format(respjson['error_code'], respjson['error_msg']))


if __name__ == '__main__':
    detect(getToken(),
           "data:image/gif;base64,R0lGODdhMAAwAPAAAAAAAP///ywAAAAAMAAwAAAC8IyPqcvt3wCcDkiLc7C0qwyGHhSWpjQu5yqmCYsapyuvUUlvONmOZtfzgFzByTB10QgxOR0TqBQejhRNzOfkVJ+5YiUqrXF5Y5lKh/DeuNcP5yLWGsEbtLiOSpa/TPg7JpJHxyendzWTBfX0cxOnKPjgBzi4diinWGdkF8kjdfnycQZXZeYGejmJlZeGl9i2icVqaNVailT6F5iJ90m6mvuTS4OK05M0vDk0Q4XUtwvKOzrcd3iq9uisF81M1OIcR7lEewwcLp7tuNNkM3uNna3F2JQFo97Vriy/Xl4/f1cf5VWzXyym7PHhhx4dbgYKAAA7")
