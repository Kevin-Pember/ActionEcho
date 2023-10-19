console.log("AutoMade script loaded")
console.log("inject.js loaded")
window.addEventListener("load", () => {data.fullyLoaded = true});
//editor.style = `position: fixed; bottom: 10px; right: 10px; width: 300px; height: 300px; background-color: white; z-index: 10000000000;`
let ui = {
    body: document.body,
    highlight: document.createElement("div"),
    styles: document.createElement("style"),
    highlightElement: (element) => {
        //ui.highlight.style.visibility = "visible";
        //ui.highlight.style.zIndex = "2100000000";
        let highElem = data.getElement(element);
        highElem.classList.add("highlightElem");
    },
    returnElement: (element) => {
        ui.body.style = ""
        let highElem = data.getElement(element);
        highElem.addEventListener("animationiteration", () => {
            highElem.classList.remove("highlightElem");
        }, { once: true });
        
    }
}
let data = {
    fullyLoaded: false,
    port: chrome.runtime.connect({ name: location.href }),
    targetElement: undefined,
    actionQueue: [],
    buttons: {
        Enter: 13,
    },
    eventHandler: async (event) => {
        let target = event.target;
        let log;
        if (event.type == "click") {
            log = {
                location: location.href,
                action: "log",
                type: "click",
                targetTag: target.tagName,
                specifier: data.getSpecifier(target),
            };
            console.log("logging click")
            if (target.tagName == "INPUT" || target.tagName == "TEXTAREA") {
                log.textContext = target.value;
                data.targetElement = log.specifier;
            } else if (target.contentEditable == "true") {
                log.textContext = target.innerText;
                data.targetElement = log.specifier;
            }
        } else if (event.type == "keydown" || event.type == "keyup" || event.type == "keypress") {
            log = {
                location: location.href,
                action: "log",
                type: "input",
                targetTag: target.tagName,
                specifier: data.targetElement != undefined ? data.targetElement : data.getSpecifier(target),
                focusNode: target.contentEditable == "true" ? data.getSpecifier(window.getSelection().focusNode) : undefined,
                ...data.translateKey(event)
            };
            if (log.key == "paste") {
                log.text = await navigator.clipboard.readText();
            }
        }
        data.port.postMessage(log);
    },
    getSelection: (target) => {
        if ((target.tagName == "INPUT" && target.type == "text") || target.tagName == "TEXTAREA") {
            return target.selectionStart + "-" + target.selectionEnd
        } else {
            let sel = window.getSelection()
            if (sel.baseOffset > sel.extentOffset) {
                return sel.extentOffset + "-" + sel.baseOffset;
            } else {
                return sel.baseOffset + "-" + sel.extentOffset;
            }
        }
    },
    getElement: (specifier) => {
        return document.querySelector(specifier);
    },
    getSpecifier: (element) => {
        let specifier = element.tagName
        if (element.id.length > 0) {
            specifier += "#" + element.id;
        }
        if (element.classList.length > 0) {
            specifier += "." + element.classList[0];
        }
        if (document.querySelectorAll(specifier.stringId).length > 1) {
            specifier += ":nth-child(" + [...document.querySelectorAll(specifier.stringId)].indexOf(element) + ")";
        }
        return specifier;
    },
    translateKey: (event) => {
        const platform = window.navigator.platform.toLowerCase();
        const isMac = platform.includes('mac');
        const actionList = [
            {
                eventParam: isMac ? { key: "z", metaKey: true } : { key: "z", ctrlKey: true },
                returnValue: { key: "undo" }
            },
            {
                eventParam: isMac ? { key: "z", metaKey: true, shiftKey: true } : { key: "y", ctrlKey: true },
                returnValue: { key: "redo" }
            },
            {
                eventParam: isMac ? { key: "x", metaKey: true } : { key: "x", ctrlKey: true },
                returnValue: { key: "cut", selection: data.getSelection(event.target) }
            },
            {
                eventParam: isMac ? { key: "c", metaKey: true } : { key: "c", ctrlKey: true },
                returnValue: { key: "copy", selection: data.getSelection(event.target) }
            },
            {
                eventParam: isMac ? { key: "v", metaKey: true } : { key: "v", ctrlKey: true },
                returnValue: { key: "paste", selection: data.getSelection(event.target) }
            },
            {
                eventParam: isMac ? { key: "a", metaKey: true } : { key: "a", ctrlKey: true },
                returnValue: { key: "all" }
            },
            {
                eventParam: { key: "ArrowDown" },
                returnValue: { key: "End" }
            }, {
                eventParam: { key: "ArrowUp" },
                returnValue: { key: "Home" }
            }
        ]
        for (let action of actionList) {
            if (Object.keys(action.eventParam).every(key => action.eventParam[key] == event[key])) {
                return action.returnValue;
            };
        }
        return { key: event.key, selection: data.getSelection(event.target) };
    }
}
let input = {
    throwAction: (msg) => {
        if (msg.type == "click") {
            let element = data.getElement(msg.specifier);
            console.log(element)
            element.dispatchEvent(new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                view: window
            }));
            element.focus();
            console.log("click event dispatched");
        } else if (msg.type == "input") {
            console.log("Running input action")
            console.log(msg)
            let element = data.getElement(msg.specifier);
            if (msg.text != undefined) {
                input.typeText(element, msg);
            } else if (msg.key != undefined) {
                input.throwKeyEvents(element, msg.key);
            }
        }
    },
    typeText: (element, log) => {
        console.log("typing")
        console.log(log)
        let typeInput, charArray = log.text.split(""), range = [0, 0];
        console.log(element)
        console.log("Typing the text: " + log.text)
        if (element.contentEditable == "true") {
            typeInput = (text, range) => {
                let focusNode = data.getElement(log.focusNode),
                    index = 0,
                    targetChild = undefined,
                    higher = range[1],
                    lower = range[0],
                    sel = window.getSelection(),
                    rangeSel = document.createRange();
                if (element.contains(focusNode) && focusNode != null) {
                    let appendString = focusNode.nodeValue.substring(0, lower) + text;
                    focusNode.nodeValue = appendString + focusNode.nodeValue.substring(higher);
                    targetChild = focusNode;
                    index = appendString.length;
                } else {
                    element.innerHTML = element.innerHTML + text;
                    targetChild = element.childNodes[0];
                    index = text.length + 1;
                }
                rangeSel.setStart(targetChild, index);
                rangeSel.collapse(true);
                sel.removeAllRanges();
                sel.addRange(rangeSel);
                const inputEvent = new Event('input', { bubbles: true });
                element.dispatchEvent(inputEvent);
            }
        } else {
            typeInput = (text, range) => {
                element.focus();
                element.value = element.value.slice(0, range[0]) + text + element.value.slice(range[1]);
                element.setSelectionRange(range[0] + 1, range[0] + 1);
            }
        }
        for (let char of charArray) {
            console.log(char)
            typeInput(char, range);
            range = [range[0] + 1, range[0] + 1];
            input.throwKeyEvents(element, char);
        }
    },
    throwKeyEvents: (elem, key) => {
        let keyCode = key.length > 1 ? data.buttons[key] : key;
        let eventObject = {
            key: key,
            code: key,
            which: keyCode,
            keyCode: keyCode,
            composed: true,
            bubbles: true,
            cancelable: true
        }
        elem.dispatchEvent(new KeyboardEvent('keydown', eventObject));
        elem.dispatchEvent(new KeyboardEvent('keypress', eventObject));
        elem.dispatchEvent(new KeyboardEvent('keyup', eventObject));
        elem.dispatchEvent(new InputEvent('input', { data: key, inputType: "insertText", bubbles: true }));
    },
    runQueue: () => {}
}
data.port.onMessage.addListener(function (msg) {
    console.log("message recieved")
    switch (msg.action) {
        case "startRecord":
            document.addEventListener('click', data.eventHandler);
            document.addEventListener('keydown', data.eventHandler);
            break;
        case "stopRecord":
            document.removeEventListener('click', data.eventHandler);
            document.removeEventListener('keydown', data.eventHandler);
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
            console.log("completing Action")
            throwAction(msg);
            data.port.postMessage({ action: "resolve" });
            break;
        case "openEditor":
            if(ui.editor != undefined){
                console.log("Editor Opened")
                ui.editor.openEditor(msg.actionSet)
                ui.editor.showEntry();
            }else {
                throw new Error("Editor not found");
            }
            break;
        case "closeEditor":
            if(ui.editor != undefined){
                console.log("Editor Closed")
                ui.editor.closeEditor().then((list) => {
                    data.port.postMessage({ action: "closedEditor", actionList: list });
                });
            }else {
                throw new Error("Editor not found");
            }
            break;
        case "newURL":
            location.href = msg.url;
            break;
    }
});
//console.log(Math.max(ui.body.scrollHeight, ui.body.offsetHeight, ui.html.clientHeight, ui.html.scrollHeight, ui.html.offsetHeight))
ui.styles.innerHTML = `
.highlightElem{
        z-index: 2147483640 !important;
        filter: none !important;
        animation: highlight 4s infinite;
    }
    @keyframes highlight {
        0% {
            border: 5px solid transparent;
            transform: scale(1);
            border-radius: 5px;
        }
        50% {
            border: 5px solid #c781bb;
            transform: scale(.995);
            border-radius: 20px;
        }
        100% {
            border: 5px solid transparent;
            transform: scale(1);
            border-radius: 5px;
        }
    }
    
`;
document.head.appendChild(ui.styles);