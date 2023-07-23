let port = chrome.runtime.connect({ name: "Background" });
port.onMessage.addListener(function (msg) {
    if ("startRecord") {
        document.addEventListener('click', postLog);
        document.addEventListener('keyup', postLog);
    } else if ("stopRecord") {
        document.removeEventListener('click', postLog);
        document.removeEventListener('keyup', postLog);
    }
});
function postLog(event) {
    let target = event.target;
    if (event.type == "click") {
        while (true) {
            if (element.nodeName == "BODY" || element.nodeName == "HTML") {
                break;
            } else if (target.nodeName != "BUTTON") {
                target = target.parentNode
            }
            else {
                port.postMessage({ action: "Log",type: "click", id: target.id });
                break;
            }
        }
    }else if (event.type == "keyup"){
        port.postMessage({ action: "Log",type: "input", id: target.id, key: event.key });
    }
}