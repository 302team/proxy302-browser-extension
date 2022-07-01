var api_base = "https://api.proxy302.com/"
var isConnecting = false, isConnectingCustomProxy = false;


let nowProxy = {
    username: "", 
    password: ""
}


exitProxy();


function httpProxy(host, port, username, password){
    chrome.storage.local.get(['bypassStr'], res => {
        setHttpProxy(host, port, res.bypassStr);
        setHttpProxyAuth(username, password);
    })
}


function setHttpProxy(host, port, bypasslist) {

    let proxyRule = "singleProxy"
    
    let _bypasslist = bypasslist ? bypasslist.split('\n') : [];
    _bypasslist.push('<local>')
    _bypasslist.push('*proxy302.com')
    _bypasslist.push('proxy302*')
    console.log("using proxy: " + host + ":" + port);
    console.log(_bypasslist);

    var config = {
        mode: 'fixed_servers',
        rules: {
            bypassList: _bypasslist
        },
    };

    if (!host) return;

    config['rules'][proxyRule] = {
        scheme: 'http',
        host: host,
        port: parseInt(port)
    };

    console.log(config);

    chrome.proxy.settings.set(
        {value: config, scope: 'regular'},
        function() {});

}

function clearAuth() {
    chrome.browsingData.remove(
        {'since': 0},
        {
            // 'appcache': true,
            // 'cache': true,
            // 'cookies': true,
            // 'downloads': true,
            // 'fileSystems': true,
            // 'formData': true,
            // 'history': true,
            // 'indexedDB': true,
            // 'localStorage': true,
            // 'pluginData': true,
            'passwords': true,
            // 'webSQL': true
        },
        function () {}
    );
}


function exitProxy(){
    chrome.proxy.settings.clear({}, res => {
        clearAuth();
    })
}

function callbackFn(details) {
    return {
        authCredentials: {
            username: nowProxy.username,
            password: nowProxy.password
        }
    };
}

function setHttpProxyAuth(username, password) {

    nowProxy.username = username;
    nowProxy.password = password;

    console.log(callbackFn())

    clearAuth()

    if (chrome.webRequest.onAuthRequired.hasListener()){
        chrome.webRequest.onAuthRequired.removeListener(callbackFn)
    }

    chrome.webRequest.onAuthRequired.addListener(
        callbackFn,
        {urls: ["<all_urls>"]},
        ['blocking']
    );
    chrome.webRequest.onCompleted.addListener(
        callbackFn,
        {urls: ["<all_urls>"]},
        ['blocking']
    );
    chrome.webRequest.onErrorOccurred.addListener(
        callbackFn,
        {urls: ["<all_urls>"]},
        ['blocking']
    );


    console.log("useing auth: " + username + ":" + password)
}


function useSystemProxy() {
    var config = {
        mode: "system",
    };

    chrome.proxy.settings.set(
        {value: config, scope: 'regular'},
        function() {});
}


 function directProxy() {

    var config = {
        mode: 'direct',
    };

    chrome.proxy.settings.set(
            {value: config, scope: 'regular'},
            function() {});
}



function getNowUsingProxy(){
    ws.send(JSON.stringify({
        code: 49200,
        msg: "get now proxy"
    }))
}


function useNowProxy(res) {
    let host = res.data.url;
    let port = 2222
    let user = res.data.username;
    let pwd = res.data.password;
    if(clientHost != ''){
        let _clinetHost = clientHost.split(":");
        if(_clinetHost.length > 1) host = _clinetHost[1]
        let host = _clinetHost[0];
    }
    var nowProxy = {
        host: host,
        port: port,
        username: user,
        password: pwd,
    }

    nowType = res.data.proxy_type ;
    nowIP = res.data.ip;
    nowToken = res.data.token;
    if (isConnecting) {
        httpProxy(host, port, user, pwd);
    }
}


chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
    console.log(req);
    switch (req.code) {
        case 1000:
            setLocalUser(req, sendResponse);
            break;
        case 1001:
            setLocalProxy(req, sendResponse);
            break;
        case 2000:
            setupProxy();
            sendResponse('');
            break;
        case 2001:
            sendResponse({
                isConnecting: isConnecting, 
                isConnectingCustomProxy: isConnectingCustomProxy,
            });
            break;
        case 2002:
            onConnectProxy(req, sendResponse);
            break;
        case 2003:
            offConnectProxy(req, sendResponse);
            break;
        case 2004:
            setupCustomProxy(req, sendResponse);
            break;
        case 2005:
            break;
        case 2006:
            loadCountry();
            break;
        case 2007:
            loadState();
            break;
        case 2008:
            loadCity();
            break;
        default:
            break;
    }
})



function setLocalProxy(req, sendResponse){
    chrome.storage.local.set({
        eProxy: req.data
    })
    setupProxy();
    chrome.runtime.sendMessage({code: 3000}, res => {
        sendResponse(res)
    })
}


function setLocalUser(req, sendResponse) {
    chrome.storage.local.set({
        eUser: req.data
    })
    chrome.runtime.sendMessage({code: 3000}, res => {
        sendResponse(res)
    })
}


function onConnectProxy(rep, sendResponse) {
    chrome.storage.local.get(['client_host', 'eProxy', 'selectedCountry', 'selectedState', 'selectedCity', 'selectedSession'], (res) => {
        if (res.eProxy && res.eProxy.host && res.eProxy.host != "") {
            let host = res.eProxy.host, port = res.eProxy.port, username = res.eProxy.username, password = res.eProxy.password;
            if (res.client_host && res.client_host != "") {
                let clientHost = res.client_host.split(":");
                if (clientHost.length > 1) port = clientHost[1];
                host = clientHost[0];
            }
            if (res.eProxy.is_api == 1 || res.eProxy.is_api == 2) {
                loadCountry()
                if(res.selectedCountry && res.selectedCountry.code) {
                    username += "-country-" + res.selectedCountry.code;
                    if (res.eProxy.is_api == 2) {
                        if (res.selectedState && res.selectedState.code) {
                            username += "-state-" + res.selectedState.code;
                            if (res.selectedCity && res.selectedCity.code) {
                                username += "-city-" + res.selectedCity.code;
                            }
                        }
                    }
                }
                if (!res.selectedSession || res.selectedSession == "") {
                    username += "-session-" + generateRandomString(6);
                } else {
                    username += "-session-" + res.selectedSession
                }
            }
            isConnecting = true;
            httpProxy(host, port, username, password);
            sendResponse({code: 0})
        } else {
            let msg = "is connecting... but no proxy in use, plase go to dashborad and select proxy."
            sendResponse({code: 404, msg: msg})
        }
        
    })
}

function offConnectProxy(rep, sendResponse) {
    exitProxy();
    isConnecting = false;
    isConnectingCustomProxy = false;
    sendResponse({code: 0})
}


function setupProxy() {
    // if (isConnecting){
        chrome.storage.local.get(['client_host', 'eProxy', 'selectedCountry', 'selectedState', 'selectedCity', 'selectedSession'], res => {
            if (res.eProxy && res.eProxy.host && res.eProxy.host != "") {
                let host = res.eProxy.host, port = res.eProxy.port, username = res.eProxy.username, password = res.eProxy.password;
                console.log(res.client_host);
                if (res.client_host && res.client_host != "") {
                    let clientHost = res.client_host.split(":");
                    if (clientHost.length > 1) port = clientHost[1];
                    host = clientHost[0];
                }
                if (res.eProxy.is_api == 1 || res.eProxy.is_api == 2) {
                    loadCountry()
                    if(res.selectedCountry && res.selectedCountry.code) {
                        username += "-country-" + res.selectedCountry.code;
                        if (res.eProxy.is_api == 2) {
                            if (res.selectedState && res.selectedState.code) {
                                username += "-state-" + res.selectedState.code;
                                if (res.selectedCity && res.selectedCity.code) {
                                    username += "-city-" + (res.selectedCity.code);
                                }
                            }
                        }
                    }
                    if (!res.selectedSession || res.selectedSession == "") {
                        username += "-session-" + generateRandomString(6);
                    } else {
                        username += "-session-" + res.selectedSession
                    }
                }
                isConnecting = true;
                isConnectingCustomProxy = false;
                httpProxy(host, port, username, password);
            }
        }) 
    // }
}


function setupCustomProxy(rep, sendResponse){
    if (isConnecting) return;
    chrome.storage.local.get(['customProxy'], res => {
        console.log(res);
        if (res.customProxy) {
            isConnecting = true;
            isConnectingCustomProxy = true;
            httpProxy(
                res.customProxy.host,
                res.customProxy.port,
                res.customProxy.username,
                res.customProxy.password
            );
        }
    })
}


function loadCountry(){
    chrome.storage.local.get(['countries'], r => {
        if (!r.countries || r.countries.length < 1) {
            $.ajax({
                url: api_base + "api/v2/location/countries",
                type: 'get',
                data: {},
                dataType: "json",
                success: res => {
                    console.log(res);
                    if (res.code == 0) {
                        chrome.storage.local.set({countries: res.data.countries});
                        chrome.runtime.sendMessage({code: 3001});
                    }
                },
                error: err => {
                    throw err;
                },
            })
        } else {
            chrome.runtime.sendMessage({code: 3001});
        }
    })
}

function loadState(){
    chrome.storage.local.get(['states', 'selectedCountry'], r => {
        if (r.selectedCountry && r.selectedCountry.id) {
            let states = r.states || {}, country_id = r.selectedCountry.id;
            if (!states[country_id]){
                $.ajax({
                    url: api_base + "api/v2/location/states",
                    type: 'get',
                    data: {country_id: country_id},
                    dataType: "json",
                    success: res => {
                        console.log(res);
                        if (res.code == 0) {
                            states[country_id] = res.data.states;
                            chrome.storage.local.set({states: states});
                            chrome.runtime.sendMessage({code: 3002});
                        }
                    },
                    error: err => {
                        throw err;
                    },
                })
            } else {
                chrome.runtime.sendMessage({code: 3002});
            }
        } else {
            chrome.runtime.sendMessage({code: 3002});
        }
    })
}

function loadCity(){
    chrome.storage.local.get(['cities', 'selectedState'], r => {
        if (r.selectedState && r.selectedState.id) {
            let cities = r.cities || {}, state_id = r.selectedState.id;
            if (!cities[state_id]) {
                $.ajax({
                    url: api_base + "api/v2/location/cities",
                    type: 'get',
                    data: {state_id: state_id},
                    dataType: "json",
                    success: res => {
                        console.log(res);
                        if (res.code == 0) {
                            cities[state_id] = res.data.cities;
                            chrome.storage.local.set({cities: cities})
                            chrome.runtime.sendMessage({code: 3003});
                        }
                    },
                    error: err => {
                        throw err;
                    },
                })
            } else {
                chrome.runtime.sendMessage({code: 3003});
            }
        } else {
            chrome.runtime.sendMessage({code: 3003});
        }
    })
}