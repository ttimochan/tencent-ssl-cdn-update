/*
 * @Author: timochan
 * @Date: 2023-06-16 21:18:01
 * @LastEditors: timochan
 * @LastEditTime: 2023-08-12 15:10:59
 * @FilePath: /tencent-ssl-cdn-update/main.js
 */
const tencentcloud = require("tencentcloud-sdk-nodejs-ssl");
const fs = require("fs");

const SslClient = tencentcloud.ssl.v20191205.Client;


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

function upload_cert() {


    const client = new SslClient(clientConfig);
    // cert and key path
    const cert = fs.readFileSync("./cert.crt", "utf8");
    const key = fs.readFileSync("./key.key", "utf8");
    const params = {
        "CertificatePublicKey": cert,
        "CertificatePrivateKey": key,
        "CertificateType": "SVR",
        "Alias": "R3"
    };
    client.UploadCertificate(params).then(
        (data) => {
            console.log(data);
            fs.openSync('./tmp.json', 'w');
            fs.writeFileSync('./tmp.json', JSON.stringify(data));
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
    console.log("wait API return,sleep 1 second")
    await new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, 1000);
    });
    const data = fs.readFileSync('./tmp.json', 'utf8');
    const data_json = JSON.parse(data);
    let log_message = "Cert ID is" + data_json.CertificateId;
    fs.openSync('./log.txt', 'w');
    fs.writeFileSync('./log.txt', "------------------\n");
    fs.writeFileSync('./log.txt', log_message);
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
function main() {
    deploy_cert();
    // open log.txt and write log
    fs.openSync('./log.txt', 'w');
    fs.writeFileSync('./log.txt', "Deploy Cert is Ok!\n");
    fs.writeFileSync('./log.txt', "------------------\n");

}

main();

