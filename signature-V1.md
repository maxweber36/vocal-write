## 签名版本 v1 签名过程

腾讯云 API 会对每个访问请求进行身份验证，即每个请求都需要在公共请求参数中包含签名信息（Signature）以验证请求者身份。
签名信息由安全凭证生成，安全凭证包括 SecretId 和 SecretKey；若用户还没有安全凭证，请前往 云 API 密钥页面 申请，否则无法调用云 API 接口。

1. 申请安全凭证
   在第一次使用云 API 之前，请前往 云 API 密钥页面 申请安全凭证。
   安全凭证包括 SecretId 和 SecretKey：

SecretId 用于标识 API 调用者身份
SecretKey 用于加密签名字符串和服务器端验证签名字符串的密钥。
用户必须严格保管安全凭证，避免泄露。
申请安全凭证的具体步骤如下：

登录 腾讯云管理中心控制台 。
前往 云 API 密钥 的控制台页面
在 云 API 密钥 页面，单击【新建密钥】即可以创建一对 SecretId/SecretKey。
注意：每个账号最多可以拥有两对 SecretId/SecretKey。

2. 生成签名串
   有了安全凭证 SecretId 和 SecretKey 后，就可以生成签名串了。以下是使用签名方法 v1 生成签名串的详细过程：

假设用户的 SecretId 和 SecretKey 分别是：

SecretId: AKID**************\*\*\*\***************
SecretKey: **************\*\*\*\***************
注意：这里只是示例，请根据用户实际申请的 SecretId 和 SecretKey 进行后续操作！

以云服务器查看实例列表（DescribeInstances）请求为例，当用户调用这一接口时，其请求参数可能如下:

参数名称 中文 参数值
Action 方法名 DescribeInstances
SecretId 密钥 ID AKID**************\*\*\*\***************
Timestamp 当前时间戳 1465185768
Nonce 随机正整数 11886
Region 实例所在区域 ap-guangzhou
InstanceIds.0 待查询的实例 ID ins-09dx96dg
Offset 偏移量 0
Limit 最大允许输出 20
Version 接口版本号 2017-03-12
这里只展示了部分公共参数和接口输入参数，用户可以根据实际需要添加其他参数，例如 Language 和 Token 公共参数。

2.1. 对参数排序
首先对所有请求参数按参数名的字典序（ ASCII 码）升序排序。注意：1）只按参数名进行排序，参数值保持对应即可，不参与比大小；2）按 ASCII 码比大小，如 InstanceIds.2 要排在 InstanceIds.12 后面，不是按字母表，也不是按数值。用户可以借助编程语言中的相关排序函数来实现这一功能，如 PHP 中的 ksort 函数。上述示例参数的排序结果如下:

{
'Action' : 'DescribeInstances',
'InstanceIds.0' : 'ins-09dx96dg',
'Limit' : 20,
'Nonce' : 11886,
'Offset' : 0,
'Region' : 'ap-guangzhou',
'SecretId' : 'AKID**************\*\*\*\***************',
'Timestamp' : 1465185768,
'Version': '2017-03-12',
}
使用其它程序设计语言开发时，可对上面示例中的参数进行排序，得到的结果一致即可。
2.2. 拼接请求字符串
此步骤生成请求字符串。
将把上一步排序好的请求参数格式化成“参数名称=参数值”的形式，如对 Action 参数，其参数名称为 "Action" ，参数值为 "DescribeInstances" ，因此格式化后就为 Action=DescribeInstances 。
注意：“参数值”为原始值而非 url 编码后的值。

然后将格式化后的各个参数用"&"拼接在一起，最终生成的请求字符串为:

Action=DescribeInstances&InstanceIds.0=ins-09dx96dg&Limit=20&Nonce=11886&Offset=0&Region=ap-guangzhou&SecretId=AKID**************\*\*\*\***************&Timestamp=1465185768&Version=2017-03-12
2.3. 拼接签名原文字符串
此步骤生成签名原文字符串。
签名原文字符串由以下几个参数构成:

请求方法: 支持 POST 和 GET 方式，这里使用 GET 请求，注意方法为全大写。
请求主机:查看实例列表(DescribeInstances)的请求域名为：cvm.tencentcloudapi.com。实际的请求域名根据接口所属模块的不同而不同，详见各接口说明。
请求路径: 当前版本云 API 的请求路径固定为 / 。
请求字符串: 即上一步生成的请求字符串。
签名原文串的拼接规则为：请求方法 + 请求主机 +请求路径 + ? + 请求字符串。

示例的拼接结果为：

GETcvm.tencentcloudapi.com/?Action=DescribeInstances&InstanceIds.0=ins-09dx96dg&Limit=20&Nonce=11886&Offset=0&Region=ap-guangzhou&SecretId=AKID**************\*\*\*\***************&Timestamp=1465185768&Version=2017-03-12
2.4. 生成签名串
此步骤生成签名串。
首先使用 HMAC-SHA1 算法对上一步中获得的签名原文字符串进行签名，然后将生成的签名串使用 Base64 进行编码，即可获得最终的签名串。

具体代码如下，以 PHP 语言为例：

$secretKey = '********************************';
$srcStr = 'GETcvm.tencentcloudapi.com/?Action=DescribeInstances&InstanceIds.0=ins-09dx96dg&Limit=20&Nonce=11886&Offset=0&Region=ap-guangzhou&SecretId=AKID**************\*\*\*\***************&Timestamp=1465185768&Version=2017-03-12';
$signStr = base64_encode(hash_hmac('sha1', $srcStr, $secretKey, true));
echo $signStr;
最终得到的签名串为：

7RAM2xfNMO9EiVTNmPg06MRnCvQ=
使用其它程序设计语言开发时，可用上面示例中的原文进行签名验证，得到的签名串与例子中的一致即可。

3. 签名串编码
   生成的签名串并不能直接作为请求参数，需要对其进行 URL 编码。

如上一步生成的签名串为 7RAM2xfNMO9EiVTNmPg06MRnCvQ= ，最终得到的签名串请求参数（Signature）为：7RAM2xfNMO9EiVTNmPg06MRnCvQ%3D，它将用于生成最终的请求 URL。

注意：如果用户的请求方法是 GET，或者请求方法为 POST 同时 Content-Type 为 application/x-www-form-urlencoded，则发送请求时所有请求参数的值均需要做 URL 编码，参数键和=符号不需要编码。非 ASCII 字符在 URL 编码前需要先以 UTF-8 进行编码。

注意：有些编程语言的网络库会自动为所有参数进行 urlencode，在这种情况下，就不需要对签名串进行 URL 编码了，否则两次 URL 编码会导致签名失败。

注意：其他参数值也需要进行编码，编码采用 RFC 3986。使用 %XY 对特殊字符例如汉字进行百分比编码，其中“X”和“Y”为十六进制字符（0-9 和大写字母 A-F），使用小写将引发错误。

4. 签名失败
   根据实际情况，存在以下签名失败的错误码，请根据实际情况处理。

错误代码 错误描述
AuthFailure.SignatureExpire 签名过期
AuthFailure.SecretIdNotFound 密钥不存在
AuthFailure.SignatureFailure 签名错误
AuthFailure.TokenFailure token 错误
AuthFailure.InvalidSecretId 密钥非法（不是云 API 密钥类型）

## 签名演示

```javascript
const crypto = require("crypto");

function get_req_url(params, endpoint) {
  params["Signature"] = encodeURIComponent(params["Signature"]);
  const url_strParam = sort_params(params);
  return "https://" + endpoint + "/?" + url_strParam.slice(1);
}

function formatSignString(reqMethod, endpoint, path, strParam) {
  let strSign = reqMethod + endpoint + path + "?" + strParam.slice(1);
  return strSign;
}
function sha1(secretKey, strsign) {
  let signMethodMap = { HmacSHA1: "sha1" };
  let hmac = crypto.createHmac(signMethodMap["HmacSHA1"], secretKey || "");
  return hmac.update(Buffer.from(strsign, "utf8")).digest("base64");
}

function sort_params(params) {
  let strParam = "";
  let keys = Object.keys(params);
  keys.sort();
  for (let k in keys) {
    //k = k.replace(/_/g, '.');
    strParam += "&" + keys[k] + "=" + params[keys[k]];
  }
  return strParam;
}

function main() {
  // 密钥参数
  // 需要设置环境变量 TENCENTCLOUD_SECRET_ID，值为示例的 AKID********************************
  const SECRET_ID = process.env.TENCENTCLOUD_SECRET_ID;
  // 需要设置环境变量 TENCENTCLOUD_SECRET_KEY，值为示例的 ********************************
  const SECRET_KEY = process.env.TENCENTCLOUD_SECRET_KEY;

  const endpoint = "cvm.tencentcloudapi.com";
  const Region = "ap-guangzhou";
  const Version = "2017-03-12";
  const Action = "DescribeInstances";
  const Timestamp = 1465185768; // 时间戳 2016-06-06 12:02:48, 此参数作为示例，以实际为准
  // const Timestamp = Math.round(Date.now() / 1000)
  const Nonce = 11886; // 随机正整数
  //const nonce = Math.round(Math.random() * 65535)

  let params = {};
  params["Action"] = Action;
  params["InstanceIds.0"] = "ins-09dx96dg";
  params["Limit"] = 20;
  params["Offset"] = 0;
  params["Nonce"] = Nonce;
  params["Region"] = Region;
  params["SecretId"] = SECRET_ID;
  params["Timestamp"] = Timestamp;
  params["Version"] = Version;

  // 1. 对参数排序,并拼接请求字符串
  strParam = sort_params(params);

  // 2. 拼接签名原文字符串
  const reqMethod = "GET";
  const path = "/";
  strSign = formatSignString(reqMethod, endpoint, path, strParam);
  // console.log(strSign)

  // 3. 生成签名串
  params["Signature"] = sha1(SECRET_KEY, strSign);
  console.log(params["Signature"]);

  // 4. 进行url编码并拼接请求url
  // const req_url = get_req_url(params, endpoint)
  // console.log(params['Signature'])
  // console.log(req_url)
}
main();
```
