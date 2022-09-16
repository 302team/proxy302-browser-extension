const VERSION = "1.2"

const eInstalledExtensionVersion = document.getElementById("eInstalledExtensionVersion");
const eUsername = document.getElementById("eUsername");
const eEmail = document.getElementById("eEmail");
const eProxyUsername = document.getElementById("eProxyUsername");
const eProxyPassword = document.getElementById("eProxyPassword");
const eProxyHost = document.getElementById("eProxyHost");
const eProxyPort = document.getElementById("eProxyPort");
const eProxyIsSetting = document.getElementById("eProxyIsSetting");
const eProxyIP = document.getElementById('eProxyIP');
const eProxyCountry = document.getElementById('eProxyCountry');
const eProxyState = document.getElementById('eProxyState');
const eProxyCity = document.getElementById('eProxyCity');
const eProxyType = document.getElementById('eProxyType');
const eProxyEnType = document.getElementById('eProxyEnType');
const eProxyRemaek = document.getElementById('eProxyRemark');
const eProxyIsApi = document.getElementById('eProxyIsApiProxy');


function now(){
    return Math.round(new Date() / 1000);
}

function checkProxyChange(){
    if (eProxyIsSetting.value != "") {
        return
    }
    
    let proxyData = {
        username: eProxyUsername.value,
        password: eProxyPassword.value,
        host: eProxyHost.value,
        port: eProxyPort.value,
        type: chrome.i18n.getUILanguage() == "zh-CN" ? eProxyType.value : eProxyEnType.value,
        ip: eProxyIP.value,
        country: eProxyCountry.value,
        state: eProxyState.value,
        city: eProxyCity.value,
        remark: eProxyRemaek.value,
        is_api: parseInt(eProxyIsApi.value),
    }

    chrome.runtime.sendMessage({code: 1001, data: proxyData}, res => {
        console.log(res);
        if (res && res.code == 0){
        }
        eProxyIsSetting.value = now();
    })
}


function getProxyInterval() {
    setInterval(() => {
        checkProxyChange()
    }, 1000)
}


if (eInstalledExtensionVersion) {  
    eInstalledExtensionVersion.value = VERSION;
    chrome.runtime.sendMessage({
        code: 1000, 
        data: {
            username: eUsername.value, 
            email: eEmail.value
        }
    }, res => {})
    getProxyInterval();
} else {  

}
