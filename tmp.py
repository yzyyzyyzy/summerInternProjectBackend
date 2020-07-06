from requests import *

proxies = {'http': 'http://localhost:9999', 'https': 'http://localhost:9999'}
resp = request("get", "http://www.baidu.com", proxies=proxies)

print(resp)