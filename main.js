/*
 * @Author: timochan
 * @Date: 2023-06-16 21:18:01
 * @LastEditors: timochan
 * @LastEditTime: 2023-06-17 00:11:26
 * @FilePath: /tencent-api/main.js
 */
const tencentcloud = require("tencentcloud-sdk-nodejs-ssl");
const fs = require("fs");

const SslClient = tencentcloud.ssl.v20191205.Client;

// 实例化一个认证对象，入参需要传入腾讯云账户 SecretId 和 SecretKey，此处还需注意密钥对的保密
// 代码泄露可能会导致 SecretId 和 SecretKey 泄露，并威胁账号下所有资源的安全性。以下代码示例仅供参考，建议采用更安全的方式来使用密钥，请参见：https://cloud.tencent.com/document/product/1278/85305
// 密钥可前往官网控制台 https://console.cloud.tencent.com/cam/capi 进行获取
const clientConfig = {
    credential: {
        secretId: "please input your secretId",
        secretKey: "please input your secretKey",
    },
    region: "",
    profile: {
        httpProfile: {
            endpoint: "ssl.ap-beijing.tencentcloudapi.com",
        },
    },
};

// 封装异步函数以便使用 await
function promisify(fn) {
    return function (params) {
        return new Promise((resolve, reject) => {
            fn(params, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
    };
}

// 上传证书
async function uploadCert() {
    const client = new SslClient(clientConfig);
    const cert = fs.readFileSync("./cert.crt", "utf8");
    const key = fs.readFileSync("./key.key", "utf8");
    const params = {
        CertificatePublicKey: cert,
        CertificatePrivateKey: key,
        CertificateType: "NGINX",
        Alias: "R3",
    };
    try {
        const data = await promisify(client.UploadCertificate)(params);
        console.log(data);
        fs.writeFileSync("./log.json", JSON.stringify(data));
        return data;
    } catch (err) {
        console.error("error", err);
    }
}

// 部署证书
async function deployCert() {
    console.log("Start Deploy Cert");
    try {
        const data = await uploadCert();
        const certId = data.CertificateId;
        const client = new SslClient(clientConfig);
        const params = {
            CertificateId: certId,
            InstanceIdList: [
                // 请填写您的域名
                "api.example.com",
                "www.example.com",
                "cdn.example.com",
            ],
            ResourceType: "cdn",
            Status: 1,
        };
        const result = await promisify(client.DeployCertificateInstance)(params);
        console.log(result);
    } catch (err) {
        console.error("error", err);
    }
}

deployCert();
