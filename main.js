/*
 * @Author: timochan
 * @Date: 2023-06-16 21:18:01
 * @LastEditors: timochan
 * @LastEditTime: 2023-06-16 23:54:39
 * @FilePath: /tencent-api/main.js
 */
// Depends on tencentcloud-sdk-nodejs version 4.0.3 or higher
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

// 实例化要请求产品的client对象,clientProfile是可选的
function upload_cert() {


    const client = new SslClient(clientConfig);
    const cert = fs.readFileSync("./cert.crt", "utf8");
    const key = fs.readFileSync("./key.key", "utf8");
    const params = {
        "CertificatePublicKey": cert,
        "CertificatePrivateKey": key,
        "CertificateType": "NGINX",
        "Alias": "R3"
    };
    client.UploadCertificate(params).then(
        (data) => {
            console.log(data);
            let data = fs.openSync('./log.json', 'w');
            fs.writeFileSync('./log.json', JSON.stringify(data));
            res_data = data;

        },
        (err) => {
            console.error("error", err);
        }
    );

}

async function deploy_cert() {
    console.log("Start Deploy Cert");
    // sleep 1s
    upload_cert();
    await new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, 1000);
    });
    const data = fs.readFileSync('./log.json', 'utf8');
    const data_json = JSON.parse(data);
    console.log(data_json.CertificateId);
    let CertId = data_json.CertificateId;

    const client = new SslClient(clientConfig);
    const params = {

        "CertificateId": CertId,
        "InstanceIdList": [
            // please input your domain
            "api.example.com",
            "www.example.com",
            "cdn.example.com"
        ],
        "ResourceType": "cdn",
        "Status": 1
    };
    client.DeployCertificateInstance(params).then(
        (data) => {
            console.log(data);
        },
        (err) => {
            console.error("error", err);
        }
    );
}
deploy_cert();


