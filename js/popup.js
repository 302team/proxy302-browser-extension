const baseUrl = "https://dashboard.proxy302.com"

//#region  def_val
const initPage = document.getElementById('initPage');
const unloginPage = document.getElementById('unloginPage');
const controlByOtherExtensionPage = document.getElementById('controlByOtherExtensionPage');
const mainPage = document.getElementById('mainPage');

const connectBtn = document.getElementById('connectBtn');
const $connectBtn = $(connectBtn);
const changeIPBtn = document.getElementById('changeIPBtn');
$(changeIPBtn).tooltip({
  title: chrome.i18n.getMessage('changeIPBtnTips'),
})
const connectStatusSpan = document.getElementById('connectStatusSpan');
const nowIPSpan = document.getElementById('nowIPSpan');

const $proxy302ProxyNav = $("#proxy302ProxyNav");
const $customProxyNav = $("#customProxyNav");

const mask1 = document.getElementById("mask1");

const proxyTypeSpan = document.getElementById('proxyTypeSpan');
const selectCountry =  document.getElementById('selectCountry');
const $selectCountry = $(selectCountry);
$selectCountry.select2();
const selectState = document.getElementById('selectState');
const $selectState = $(selectState);
$selectState.select2();
const selectCity = document.getElementById('selectCity');
const $selectCity = $(selectCity);
$selectCity.select2();
$selectCountry.next('.select2').hide();
$selectState.next('.select2').hide();
$selectCity.next('.select2').hide();
const countrySpan = document.getElementById('countrySpan');
const stateSpan = document.getElementById('stateSpan');
const citySpan = document.getElementById('citySpan');

const cpResetBtn = document.getElementById("cp-resetBtn");
const cpHostInput = document.getElementById("cp-host");
const cpPortInput = document.getElementById("cp-port");
const cpUserInput = document.getElementById("cp-username");
const cpPwdInput = document.getElementById("cp-password");

const useClientCheck = document.getElementById('useClientCheck');
const clientIPInput = document.getElementById('clientIPInput');
const clientIPInputLabel = document.getElementById('clientIPInputLabel');

//#endregion

loadPage();


function showLoading(){
  let $offLogo = $('#offLogo');
  let loadingLogo = document.getElementById('loadingLogo');
  $offLogo.hide();
  loadingLogo.hidden = false;
  setTimeout(() => {
    $offLogo.show();
    loadingLogo.hidden = true;
  }, 1000)
}


chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
  console.log(req);
  switch (req.code) {
      case 3000:
        loadPage();
        sendResponse({code: 0});
        break;
      case 3001:
        initCountrySelector();
        break;
      case 3002:
        initStateSelector();
        break;
      case 3003:
        initCitySelector();
        break;
      default:
        break;
  }
})


function loadPage(){
  initConnect();
  initUser();
  initProxy();
}

function initConnect(){
  chrome.storage.local.get(['customProxy'], res => {
    if (res.customProxy) {
      cpHostInput.value = res.customProxy.host;
      cpPortInput.value = res.customProxy.port;
      cpUserInput.value = res.customProxy.username;
      cpPwdInput.value = res.customProxy.password;
    }
  })
  chrome.runtime.sendMessage({code: 2001}, res => {
    console.log(res);
    if (res.isConnecting) {
      $connectBtn.removeClass('btn-secondary');
      $connectBtn.addClass('btn-success');
      $connectBtn.addClass('connecting');
      connectStatusSpan.innerHTML = "<strong>Proxy Is ON</strong>";
      cpResetBtn.disabled = true;
      cpHostInput.readOnly = true;
      cpPortInput.readOnly = true;
      cpUserInput.readOnly = true;
      cpPwdInput.readOnly = true;
      if (res.isConnectingCustomProxy) {
        $customProxyNav.click();
        $proxy302ProxyNav.addClass('disabled');
      } else {
        $proxy302ProxyNav.removeClass('disabled');
        chrome.storage.local.get(['eProxy'], res => {
          if (res.eProxy) {
            cpHostInput.value = res.eProxy.host;
            cpPortInput.value = res.eProxy.port;
            cpUserInput.value = res.eProxy.username;
            cpPwdInput.value = res.eProxy.password;
          }
        })
      }
    } else {
      $proxy302ProxyNav.removeClass('disabled');
      $connectBtn.addClass('btn-secondary');
      $connectBtn.removeClass('btn-success');
      $connectBtn.removeClass('connecting');
      connectStatusSpan.innerHTML = "<strong>Proxy Is OFF</strong>";
      cpResetBtn.disabled = false;
      cpHostInput.readOnly = false;
      cpPortInput.readOnly = false;
      cpUserInput.readOnly = false;
      cpPwdInput.readOnly = false;
    }
  })
}


function initUser(){
  chrome.proxy.settings.get({}, res => {
    if (res.levelOfControl === 'controlled_by_other_extensions') {
    // if (1) {
      controlByOtherExtensionPage.hidden = false;
      userData.hidden = true;
      unloginPage.hidden = true;
      mainPage.hidden = true;
    } else {
      controlByOtherExtensionPage.hidden = true;
      chrome.storage.local.get(['eUser'], res => {
        console.log(res);
        initPage.hidden = true;
        if (res.eUser) {
          userData.hidden = false;
          unloginPage.hidden = true;
          mainPage.hidden = false;
          document.getElementById("userUsername").innerHTML = res.eUser.username;
        } else {
          userData.hidden = true;
          mainPage.hidden = true;
          unloginPage.hidden = false;
        }
      })
    }
  })
  
}


function initProxy(){
  chrome.storage.local.get(['eProxy', 'client_host', 'isConnectingCustomProxy', 'custonProxy'], res => {
    console.log(res);
    if (!res.eProxy || res.eProxy.host == "") {
      mask1.hidden = false;
      return;
    } else { 
      mask1.hidden = true;
    }
    if(res.isConnectingCustomProxy) {
      chrome.runtime.sendMessage({code: 2001}, res => {
        if (res.isConnecting) {

        }
      })
    }
    proxyTypeSpan.innerHTML = res.eProxy.type || "";
    if (!res.eProxy.is_api) {
      selectCountry.hidden = true;
      countrySpan.hidden = false;
      selectState.hidden = true;
      stateSpan.hidden = false;
      selectCity.hidden = true;
      citySpan.hidden = false;
      $selectCountry.next('.select2').hide();
      $selectState.next('.select2').hide();
      $selectCity.next('.select2').hide();
      $selectCountry.children("option").remove();
      $selectCountry.append("<option value='0' name=''>" + (res.eProxy.country || "") + "</option>");
      countrySpan.value = res.eProxy.country || "";
      $selectState.children("option").remove();
      $selectState.append("<option value='0' name=''>" + (res.eProxy.state || "") + "</option>");
      stateSpan.value = res.eProxy.state || "";
      $selectCity.children("option").remove();
      $selectCity.append("<option value='0' name=''>" + (res.eProxy.city || "") + "</option>");
      citySpan.value = res.eProxy.city || "";
      changeIPBtn.hidden = true;
    } else if (res.eProxy.is_api == 1) {
      selectCountry.hidden = false;
      countrySpan.hidden = true;
      $selectCountry.next('.select2').show();
      selectState.hidden = false;
      selectState.disabled = true;
      $selectState.next('.select2').show();
      $selectState.addClass('disabled');
      stateSpan.hidden = true;
      selectCity.hidden = false;
      selectCity.disabled = true;
      $selectCity.next('.select2').show();
      $selectCity.addClass('disabled');
      citySpan.hidden = true;
      $selectCountry.children("option").remove();
      $selectCountry.append("<option selected value='0'><span class='geo-random'>Random Country</span></option>");
      countrySpan.value = res.eProxy.country || "";
      $selectState.children("option").remove();
      $selectState.append("<option selected value='0'><span class='geo-random'>Random State</span></option>");
      stateSpan.value = res.eProxy.state || "";
      $selectCity.children("option").remove();
      $selectCity.append("<option selected value='0'><span class='geo-random'>Random City</span></option>");
      citySpan.value = res.eProxy.city || "";
      chrome.runtime.sendMessage({code: 2006});
      changeIPBtn.hidden = false;
    } else if (res.eProxy.is_api == 2) {
      selectCountry.hidden = false;
      countrySpan.hidden = true;
      $selectCountry.next('.select2').show();
      selectState.hidden = false;
      selectState.disabled = false;
      $selectState.next('.select2').show();
      $selectState.removeClass('disabled');
      stateSpan.hidden = true;
      selectCity.hidden = false;
      selectCity.disabled = false;
      $selectCity.next('.select2').show();
      $selectCity.removeClass('disabled');
      citySpan.hidden = true;
      $selectCountry.children("option").remove();
      $selectCountry.append("<option selected value='0'><span class='geo-random'>Random Country</span></option>");
      countrySpan.value = res.eProxy.country || "";
      $selectState.children("option").remove();
      $selectState.append("<option selected value='0'><span class='geo-random'>Random State</span></option>");
      stateSpan.value = res.eProxy.state || "";
      $selectCity.children("option").remove();
      $selectCity.append("<option selected value='0'><span class='geo-random'>Random City</span></option>");
      chrome.runtime.sendMessage({code: 2006});
      changeIPBtn.hidden = false;
    }

    if (res.eProxy.ip != "") {
      nowIPSpan.innerHTML = "IP: " + res.eProxy.ip;
    } else {
      nowIPSpan.innerHTML = "";
    }
    if (res.client_host && res.client_host != ""){
      useClientCheck.checked = true;
      clientIPInput.hidden = false;
      clientIPInputLabel.hidden = false;
      clientIPInput.value = res.client_host || "";
      // let clientHost = res.client_host.split(":");
      // if (clientHost.length > 1) cpPortInput.value = clientHost[1];
      // cpHostInput.value = clientHost[0];
    }
  })
}


function initCountrySelector(){
  chrome.storage.local.get(['eProxy', 'countries', 'selectedCountry'], res => {
    if (res.eProxy && (res.eProxy.is_api == 1 || res.eProxy.is_api == 2)){
      $selectCountry.children("option").remove()
      $selectCountry.append("<option selected value='0'><span class='geo-random'>Random Country</span></option>")
      if (res.countries && res.countries.length > 0 ) {
        let selectedCountryId = (res.selectedCountry && res.selectedCountry.id) ? res.selectedCountry.id : 0;
        res.countries.forEach((e, i) => {
            $selectCountry.append("<option " + (selectedCountryId === e.id ? " selected " : "") + " value='" + (i + 1) + "'><span class='geo-code'>" + e.code + "</span> <span class='geo-name'>" + e.name + "</span></option>")
        });
      }
      changeCountry(true);
    } 
  })
}

$selectCountry.on('change', e => { changeCountry() })

function changeCountry(donnotUpdateProxy){
  let idx = parseInt($selectCountry.val());
  console.log(idx);
  if (idx) {
    chrome.storage.local.get(['countries', 'selectedCountry'], res => {
      let data = res.countries[idx - 1]
      console.log(data);
      if (!(res.selectedCountry && res.selectedCountry.id == data.id)) {
        if (!donnotUpdateProxy) showLoading();
        chrome.storage.local.set({selectedCountry: {id: data.id, code: data.code, name: data.name, idx: idx}});
        chrome.storage.local.set({selectedState: {}});
        chrome.storage.local.set({selectedCity: {}});
        if (!donnotUpdateProxy) chrome.runtime.sendMessage({code: 2002});
      }
      chrome.runtime.sendMessage({code: 2007});
    })
  } else {
    if (!donnotUpdateProxy) showLoading();
    chrome.storage.local.set({selectedCountry: {}});
    chrome.storage.local.set({selectedState: {}});
    chrome.storage.local.set({selectedCity: {}});
    chrome.runtime.sendMessage({code: 2007}, r => {
      if (!donnotUpdateProxy) chrome.runtime.sendMessage({code: 2002});
    });
  }
}

function initStateSelector(){
  chrome.storage.local.get(['eProxy', 'states', 'selectedState', 'selectedCountry'], res => {
    if (res.eProxy && res.eProxy.is_api == 2 ) {  
      $selectState.children("option").remove()
      $selectState.append("<option selected value='0'><span class='geo-random'>Random State</span></option>")
      if (res.selectedCountry && res.selectedCountry.id && res.states && res.states[res.selectedCountry.id]) {
        let selectedStateId = (res.selectedState && res.selectedState.id) ? res.selectedState.id : 0;
        res.states[res.selectedCountry.id].forEach((e, i) => {
            $selectState.append("<option " + (selectedStateId === e.id ? " selected " : "") + " value='" + (i + 1) + "'><span class='geo-code'>" + e.code + "</span> <span class='geo-name'>" + e.name + "</span></option>")
        });
      }
      changeState(true);
    } 
  })
}

$selectState.on('change', e => { changeState() })

function changeState(donnotUpdateProxy) {
  let idx = parseInt($selectState.val());
  console.log(idx);
  if (idx) {
    chrome.storage.local.get(['states', 'selectedCountry', 'selectedState'], res => {
      let data = res.states[res.selectedCountry.id][idx - 1]
      console.log(data);
      if (!(res.selectedState && res.selectedState.id == data.id)) {
        if (!donnotUpdateProxy) showLoading();
        chrome.storage.local.set({selectedState: {id: data.id, code: data.code, name: data.name, idx: idx, country_id: data.country_id}});
        chrome.storage.local.set({selectedCity: {}});
        if (!donnotUpdateProxy) chrome.runtime.sendMessage({code: 2002});
      }
      chrome.runtime.sendMessage({code: 2008});
    })
  } else {
    if (!donnotUpdateProxy) showLoading();
    chrome.storage.local.set({selectedState: {}});
    chrome.storage.local.set({selectedCity: {}});
    chrome.runtime.sendMessage({code: 2008}, res => {
      if (!donnotUpdateProxy) chrome.runtime.sendMessage({code: 2002});
    });
  }
  
}

function initCitySelector(){
  chrome.storage.local.get(['eProxy', 'cities', 'selectedCity', 'selectedState'], res => {
    if (res.eProxy && res.eProxy.is_api == 2) {
      $selectCity.children("option").remove()
      $selectCity.append("<option selected value='0'><span class='geo-random'>Random City</span></option>")
      if (res.selectedState && res.selectedState.id && res.cities && res.cities[res.selectedState.id]) {
        let selectedCityId = (res.selectedCity && res.selectedCity.id) ? res.selectedCity.id : 0;
        res.cities[res.selectedState.id].forEach((e, i) => {
            $selectCity.append("<option " + (selectedCityId === e.id ? " selected " : "") + " value='" + (i + 1) + "'><span class='geo-code'>" + e.name + "</span></span></option>")
        });
      }
    } 
  })
}

$selectCity.on('change', e => { changeCity() });

function changeCity(donnotUpdateProxy){
  let idx = parseInt($selectCity.val());
  console.log(idx);
  if (idx) {
    chrome.storage.local.get(['cities', 'selectedCity', 'selectedState'], res => {
      let data = res.cities[res.selectedState.id][idx - 1]
      console.log(data);
      if (!(res.selectedCity && res.selectedCity.id == data.id)) {
        if (!donnotUpdateProxy) showLoading();
        let cityCode = data.name.replaceAll(" ", "").toLowerCase();
        chrome.storage.local.set({selectedCity: {id: data.id, name: data.name, code: cityCode, idx: idx, state_id: data.state_id}});
        if (!donnotUpdateProxy) chrome.runtime.sendMessage({code: 2002});
      }
    })
  } else {
    if (!donnotUpdateProxy) showLoading();
    chrome.storage.local.set({selectedCity: {}});
    if (!donnotUpdateProxy) chrome.runtime.sendMessage({code: 2002});
  }
}


changeIPBtn.addEventListener('click', e => {
  showLoading();
  chrome.storage.local.set({selectedSession: generateRandomString(8)});
  chrome.runtime.sendMessage({code: 2002});
})


connectBtn.addEventListener('click', e => {
  $connectBtn.addClass('disabled');
  if ($connectBtn.hasClass("connecting")) { 
    chrome.runtime.sendMessage({
      code: 2003,
    }, res => {
      initConnect();
      initProxy();
      $connectBtn.removeClass('disabled');
    })
  } else { 
    if ($customProxyNav.hasClass('active') && !cpHostInput.disabled){
      if (cpHostInput.value == "") {
        alert(chrome.i18n.getMessage("noHostTips"))
      } else {
        let customProxyData = {
          host: cpHostInput.value,
          port: cpPortInput.value || 80,
          username: cpUserInput.value,
          password: cpPwdInput.value,
        }
        chrome.storage.local.set({customProxy: customProxyData})
        chrome.runtime.sendMessage({code: 2004}, res => {
          initConnect();
          initProxy();
        })
      }
    } else {
      chrome.storage.local.get(["eProxy"], res => {
        if (res.eProxy && res.eProxy.host) {

          chrome.runtime.sendMessage({
            code: 2002,
          }, res => {
            initConnect();
            initProxy();
          })
        } else {
          alert(chrome.i18n.getMessage("noEPorxyTips"));
        }
        $connectBtn.removeClass('disabled');
      })
    }
  }
})

useClientCheck.addEventListener('change', e => {
  if(useClientCheck.checked) {
    clientIPInputLabel.hidden = false;
    clientIPInput.hidden = false;
    chrome.storage.local.set({
      client_host: clientIPInput.value == "" ? "127.0.0.1" : clientIPInput.value
    }) 
  } else {
    clientIPInput.hidden = true;
    clientIPInputLabel.hidden = true;
    chrome.storage.local.set({
      client_host: ""
    })
  }
  chrome.runtime.sendMessage({code: 2000}, res => {
    initPage();
    initProxy();
  })
})


clientIPInput.addEventListener('focusout', e => {
  if(useClientCheck.checked) {
    chrome.storage.local.set({
      client_host: clientIPInput.value == "" ? "127.0.0.1" : clientIPInput.value
    }) 
  }
  chrome.runtime.sendMessage({code: 2000}, res => {
    initPage();
    initProxy();
  })
})

cpHostInput.addEventListener("focusout", formatCProxy)
cpPortInput.addEventListener("focusout", formatCProxy)
cpUserInput.addEventListener("focusout", formatCProxy)
cpPwdInput.addEventListener("focusout", formatCProxy)

function formatCProxy(e) {
  let proxyText = e.target.value
  let pts = proxyText.split(":");
  if (pts.length === 2){
    cpHostInput.value = pts[0];
    cpPortInput.value = pts[1];
    cpUserInput.value = "";
    cpPwdInput.value = "";
  } else if (pts.length === 4){
    cpHostInput.value = pts[0];
    cpPortInput.value = pts[1];
    cpUserInput.value = pts[2];
    cpPwdInput.value = pts[3];
  } else if (pts.length === 3 && pts[1].split('@').length === 2){
    let temp = pts[1].split('@');
    cpHostInput.value = temp[1];
    cpPortInput.value = pts[2];
    cpUserInput.value = pts[0];
    cpPwdInput.value = temp[0];
  } else {
    return true;
  }
  return false;
}

const toDashboardBtn = document.getElementById("to-dashboard");
const userData = document.getElementById("userData");

toDashboardBtn.addEventListener("click", e => {toDashboard()});
function toDashboard() {
  chrome.tabs.create({
    url: baseUrl + "/chart",
  });
}

userData.addEventListener("click", e => {
  chrome.tabs.create({
    url: baseUrl + "/charge",
  });
});

const toOptionsBtn = document.getElementById("to-options");
toOptionsBtn.addEventListener("click", () => {
  chrome.runtime.openOptionsPage()
})

const toLoginBtn = document.getElementById('to-login');
toLoginBtn.addEventListener('click', e => {
  chrome.tabs.create({
    url: baseUrl + "/login",
  });
})

const toRegisterBtn = document.getElementById('to-register');
toRegisterBtn.addEventListener('click', e => {
  chrome.tabs.create({
    url: baseUrl + "/register",
  });
})

const toHomepage = document.getElementById('toHomepage');
toHomepage.addEventListener('click', e => {
  chrome.tabs.create({
    url: "https://www.proxy302.com",
  });
})

const toHelp = document.getElementById('to-help');
toHelp.addEventListener('click', e => {toHelpPage()});
const connectHelpBtn = document.getElementById("connectHelpBtn");
connectHelpBtn.addEventListener('click', e => {toHelpPage()});

function toHelpPage() {
  chrome.tabs.create({
    url: baseUrl + "/extension-doc",
  });
}



const toIpinfo = document.getElementById('to-ipinfo');
$(toIpinfo).tooltip({
  title: chrome.i18n.getMessage('toIpinfo'),
})
toIpinfo.addEventListener('click', e => {
  chrome.tabs.create({
    url: "http://ipinfo.io"
  })
})

// const logoutBtn = document.getElementById('logoutBtn');
// logoutBtn.addEventListener('click', e => {
//   chrome.storage.local.clear();
//   loadPage();
// })