

const bypassInput = document.getElementById('bypassInput');

initBypass();
changeBypass();

bypassInput.addEventListener('focusout', e => {
    changeBypass();
})

function initBypass(){
    chrome.storage.local.get(['bypassStr'], res => {
        console.log(res);
        if (res.bypassStr) {
            bypassInput.value = res.bypassStr;
        }
    })
}

function changeBypass(){
    let bypassStr = bypassInput.value;
    chrome.storage.local.set({
        bypassStr: bypassStr
    })
}
