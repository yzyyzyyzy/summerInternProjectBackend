# coding=utf-8
import requests


def getToken():
    """输出token，以及到期时间用于cookie

    Return:
        {
        'token': token,
        'max_age' : 距离到期的时间（秒）
        }
    """

    API_KEY = '0InnUUB3YcbH6nZI8UnH7yxB'
    SECRET_KEY = 'TfiTAwvS3nIHYIwmoePj9mcp0O9WMT8k'
    TOKEN_URL = 'http://openapi.baidu.com/oauth/2.0/token?grant_type=client_credentials&client_id={0}&client_secret={1}'.format(
        API_KEY, SECRET_KEY)
    SCOPE = 'audio_tts_post'  # 有此scope表示有tts能力，没有请在网页里勾选

    respjson = requests.get(TOKEN_URL).json()

    """respjson:
    {
      "refresh_token": "25.8b88973f8b62d74d5bae855311b0e256.315360000.1909316262.282335-10854623",
      "expires_in": 2592000,
      "session_key": "9mzdCrSs9AJAYewRxlqkV1YMIpNzBZI+7y85nli9PUH+ajrlpJINTUHGGj/gCQPKp8GhR+vQe5XpOGL3+YNc5wmNHC9PIQ==",
      "access_token": "24.1093971366a06b5e7c5a497220d4b723.2592000.1596548262.282335-10854623",
      "scope": "brain_asr_async brain_speech_realtime vis-faceverify_FACE_Police brain_enhanced_asr unit_理解与交互V2 public audio_voice_assistant_get audio_tts_post wise_adapt lebo_resource_base lightservice_public hetu_basic lightcms_map_poi kaidian_kaidian ApsMisTest_Test权限 vis-classify_flower lpq_开放 cop_helloScope ApsMis_fangdi_permission smartapp_snsapi_base iop_autocar oauth_tp_app smartapp_smart_game_openapi oauth_sessionkey smartapp_swanid_verify smartapp_opensource_openapi smartapp_opensource_recapi fake_face_detect_开放Scope vis-ocr_虚拟人物助理 idl-video_虚拟人物助理",
      "session_secret": "1b538d4b6d604d91f68e14e9959fad43"
    }
    """

    if ('access_token' in respjson.keys() and 'scope' in respjson.keys()):
        if not SCOPE in respjson['scope'].split(' '):
            raise Exception('scope is not correct')
        print(
            'SUCCESS WITH TOKEN: {} ; EXPIRES IN SECONDS: {}'.format(respjson['access_token'], respjson['expires_in']))

        return { 'token': respjson['access_token'], 'max_age': respjson['expires_in'] }

    else:
        raise Exception('MAYBE API_KEY or SECRET_KEY not correct: access_token or scope not found in token response')


def convert(token, txt, PER=0, SPD=6, PIT=5, VOL=5, AUE=3):
    """ 输入文本，输出音频二进制流，格式由AUE确定

    Args:
        PER: 发音人选择, 基础音库：0为度小美，1为度小宇，3为度逍遥，4为度丫丫，
                        精品音库：5为度小娇，103为度米朵，106为度博文，110为度小童，111为度小萌，
                        默认为度小美
        SPD: 语速，取值0-15，默认为5中语速
        PIT: 音调，取值0-15，默认为5中语调
        VOL: 音量，取值0-9，默认为5中音量
        AUE: 下载的文件格式, 3：mp3(default), 4: pcm-16k, 5: pcm-8k 6: wav

    """

    CUID = "123456PYTHON"
    TTS_URL = 'http://tsn.baidu.com/text2audio'
    # FORMATS = {3: "mp3", 4: "pcm", 5: "pcm", 6: "wav"}
    # FORMAT = FORMATS[AUE]

    params = {'tok': token, 'tex': txt, 'per': PER, 'spd': SPD, 'pit': PIT, 'vol': VOL, 'aue': AUE, 'cuid': CUID,
              'lan': 'zh', 'ctp': 1}  # lan ctp 固定参数

    resp = requests.post(TTS_URL, data=params)

    if 'json' in resp.headers['content-type']:
        # 出错
        respjson = resp.json()
        raise Exception(
            "tts error! err_detail: {}, err_msg: {}, err_no: {}".format(respjson['err_detail'], respjson['err_msg'],
                                                                        respjson['err_no']))
    else:
        # 返回音频二进制流
        return resp.content

if __name__ == '__main__':
    # token = getToken()
    result = convert("24.ecd50730e52b304cf1d3da9bbe399b8d.2592000.1596556460.282335-10854623", "啊哈哈")
    # result = convert(token, "啊哈哈")
    print(result)
