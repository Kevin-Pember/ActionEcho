console.log("AutoMade script loaded")
let port = chrome.runtime.connect({ name: location.href });
console.log(port)
port.onMessage.addListener(function (msg) {
    console.log("message recieved")
    switch (msg.action) {
        case "startRecord":
            document.addEventListener('click', postLog);
            document.addEventListener('keyup', postLog);
            break;
        case "stopRecord":
            document.removeEventListener('click', postLog);
            document.removeEventListener('keyup', postLog);
            break;
        case "highlight":
            console.log(msg)
            let element = document.getElementById(msg.id);
            element.classList.add("highlight");
            setTimeout(() => {
                element.classList.remove("highlight");
            }, 1000);
            break;
        case "action":
            if (msg.type == "click") {
                let element = getElement(msg);
                console.log(element)
                element.dispatchEvent(new MouseEvent('click', {
                    bubbles: true,
                    cancelable: true,
                    view: window
                }));
                console.log("click event dispatched");
            } else if (msg.type == "input"){
                let element = getElement(msg);
                element.value = msg.value;
                simulateKeyboardInput(msg.keyObject, "keyup", element);
                console.log("input event dispatched");
            }
            port.postMessage({ action: "resolve" });
            break;
    }
});
let lastLog;
function postLog(event) {
    let target = event.target;
    let log;
    if (event.type == "click") {
        log = { location: location.href, action: "Log", type: "click", ...getSpecifier(target) };
        lastLog = log;
        port.postMessage(log);
    } else if (event.type == "keyup") {
        console.log(event)
        log = { location: location.href, action: "Log", type: "input", keyObject: {key: event.key,code: event.code, keyCode: event.keyCode}, ...getSpecifier(target) };
        if((lastLog.id != log.id || lastLog.class != log.class || lastLog.tag != log.tag || lastLog.index != log.index) && lastLog.type != "click"){
            let clickLog = { location: location.href, action: "Log", type: "click", ...getSpecifier(target) };
            port.postMessage(clickLog);
        }
        lastLog = log;
        port.postMessage(log);
    }
}
function getElement(msg) {
    console.log(msg)
    if (msg.id) {
        return document.getElementById(msg.id);
    } else if (msg.class) {
        console.log(msg)
        return document.getElementsByClassName(msg.class)[msg.index];
    } else {
        return document.getElementsByTagName(msg.tag)[msg.index];
    }
}
function getSpecifier(element) {
    let specifier = {};
    if (element.id) {
        specifier.id = element.id;
    } else if (element.className) {
        specifier.class = element.className;
        specifier.index = [...document.getElementsByClassName(element.className)].indexOf(element);
    } else {
        specifier.tag = element.tagName;
        specifier.index = [...document.getElementsByTagName(element.tagName)].indexOf(element);
    }
    return specifier;
}
function simulateKeyboardInput(key, target) {
    const event = new KeyboardEvent('keyup', {key});
    if(target.tagName == "INPUT"){
        target.value += key;
    }else if(target.contentEditable == "true"){
        
    }
    target.dispatchEvent(event);
  }