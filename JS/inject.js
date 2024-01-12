console.log("AutoMade script loaded")
console.log("inject.js loaded")
window.addEventListener("load", () => { data.fullyLoaded = true });
//editor.style = `position: fixed; bottom: 10px; right: 10px; width: 300px; height: 300px; background-color: white; z-index: 10000000000;`
let ui = {
    body: document.body,
    highlight: document.createElement("div"),
    styles: document.createElement("style"),
    highlightElement: (element) => {
        //ui.highlight.style.visibility = "visible";
        //ui.highlight.style.zIndex = "2100000000";
        let highElem = input.getElement(element);
        highElem.classList.add("highlightElem");
    },
    returnElement: (element) => {
        ui.body.style = ""
        let highElem = input.getElement(element);
        highElem.addEventListener("animationiteration", () => {
            highElem.classList.remove("highlightElem");
        }, { once: true });

    }
}
let data = {
    continue: undefined,
    fullyLoaded: false,
    browserOS: undefined,
    port: chrome.runtime.connect({ name: location.href }),
    targetElement: undefined,
    keyTable: [
        {
            mac: { key: "z", metaKey: true },
            default: { key: "z", ctrlKey: true },
            getKeyData: () => { return { key: "undo" } }
        },
        {
            mac: { key: "z", metaKey: true, shiftKey: true },
            default: { key: "y", ctrlKey: true },
            getKeyData: () => { return { key: "redo" } }
        },
        {
            mac: { key: "x", metaKey: true },
            default: { key: "x", ctrlKey: true },
            getKeyData: (event) => { return { key: "cut", selection: logger.getSelection(event.target) } }
        },
        {
            mac: { key: "c", metaKey: true },
            default: { key: "c", ctrlKey: true },
            getKeyData: (event) => { return { key: "copy", selection: logger.getSelection(event.target) } }
        },
        {
            mac: { key: "v", metaKey: true },
            default: { key: "v", ctrlKey: true },
            getKeyData: (event) => { return { key: "paste", selection: logger.getSelection(event.target) } }
        },
        {
            mac: { key: "a", metaKey: true },
            default: { key: "a", ctrlKey: true },
            getKeyData: () => { return { key: "all" } }
        },
    ],
    keyCodes: {
        Enter: 13,
    }
}
let input = {
    actionQueue: [],
    parsePacket: (packet) => {
        console.log(packet)
        if (packet.v === 1.0) {
            for (let action of packet.actions) {
                console.log(action)
                input.throwAction(action);
            }
        } else {
            throw new Error("Packet version not supported");
        }
    },
    throwAction: (msg) => {
        console.log("throwing action")
        console.log(`State is ${document.readyState}`)
        if (document.readyState === "complete") {
            switch (msg.type) {
                case "click":
                    console.log("Running click action");
                    console.log(`Element Specifier is ${msg.specifier}`)
                    let element = input.getElement(msg.specifier);
                    console.log(element)
                    element.dispatchEvent(new MouseEvent('click', {
                        bubbles: true,
                        cancelable: true,
                        view: window
                    }));
                    element.focus();
                    console.log("click event dispatched");
                    break;
                case "input":
                    console.log("Running input action");
                    input.enterText(input.getElement(msg.specifier), msg);
                    break;
                case "key":
                    console.log("Running key action")
                    input.enterKey(input.getElement(msg.specifier), msg.key);
                    break;
            }
        } else {
            input.actionQueue.push(msg);
        }
    },
    enterText: (element, log) => {
        console.log("typing")
        console.log(log)
        let typeInput, charArray = log.text.split(""), range = [0, 0];
        console.log(element)
        console.log("Typing the text: " + log.text)
        if (element.contentEditable == "true") {
            typeInput = (text, range) => {
                let index = 0,
                    targetChild = undefined,
                    higher = range[1],
                    lower = range[0],
                    sel = window.getSelection(),
                    rangeSel = document.createRange();
                element.innerHTML = element.innerHTML + text;
                targetChild = element.childNodes[0];
                index = text.length;

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
            input.enterKey(element, char);
        }
    },
    enterKey: (elem, key) => {
        let keyCode = key.length > 1 ? data.keyCodes[key] : key;
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
    runQueue: () => {
        for (let action of input.actionQueue) {
            input.throwAction(action);
        }
        input.actionQueue = [];
    },
    getElement: (specifier) => {
        let index = specifier.indexOf("--");
        if (index == 0) {
            let endIndex = specifier.indexOf("$");
            let index = Number(specifier.substring(2, endIndex));
            specifier = specifier.substring(endIndex + 1);
            return document.querySelectorAll(specifier)[index];
        } else {
            let element = document.querySelectorAll(specifier);
            if (element.length === 1) {
                return element[0];
            } else if (element.length > 1) {
                throw new Error("Multiple Elements found");
                return null;
            } else {
                throw new Error("Element not found");
                return null;
            }
        }
    },
}
let logger = {
    templates: {
        click: {
            action: "log",
            type: "click",
            specifier: undefined,
            //if text based element
            textContext: undefined,
        },
        input: {
            action: "log",
            specifier: undefined,
            key: undefined,
        }
    },
    eventHandler: async (event) => {
        let target = event.target;
        let log;
        if (event.type == "click") {
            log = { ...logger.templates.click };
            log.specifier = logger.getSpecifier(target);
            if (target.tagName == "INPUT" || target.tagName == "TEXTAREA") {
                log.textContext = target.value;
                data.targetElement = log.specifier;
            } else if (target.contentEditable == "true") {
                log.textContext = target.innerText;
                data.targetElement = log.specifier;
            }
        } else if (event.type == "keydown" || event.type == "keyup" || event.type == "keypress") {
            log = { ...logger.templates.input };
            log.specifier = data.targetElement != undefined ? data.targetElement : logger.getSpecifier(target);
            if (event.key.length > 1) {
                log.type = "key";
                if (data.browserOS == undefined) {
                    let platInfo = await chrome.runtime.getPlatformInfo();
                    if (platInfo == "mac") {
                        data.browserOS = "mac";
                    } else {
                        data.browserOS = "default";
                    }
                }
                for (let action of data.keyTable) {
                    if (Object.keys(action[data.browserOS]).every(key => action.eventParam[key] == event[key])) {
                        Object.assign(log, action.getKeyData(event));
                        break;
                    };
                }
            } else {
                log.type = "input";
                log.key = event.key;
                log.selection = logger.getSelection(event.target);
            };
        }
        console.log(log);
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
    getSpecifier: (element) => {
        let specifier = element.tagName;
        outer: {
            let matchList;
            if (element.id.length > 0) {
                specifier += `#${element.id}`;
                matchList = document.querySelectorAll(specifier)
                if (matchList.length === 1) {
                    break outer;
                }
            } else if (element.classList.length > 0) {
                specifier += `.${element.classList[0]}`;
                matchList = document.querySelectorAll(specifier)
                if (matchList.length === 1) {
                    break outer;
                }

            }
            specifier = `--${[...matchList].indexOf(element)}$${specifier}`;
        }
        return specifier;
    },
}
//For fulfilling events that were called before the page was done loading
document.onreadystatechange = () => {
    if (document.readyState === "complete") {
        console.log("Document fully loaded");
    }
    if (document.readyState === "complete" && input.actionQueue.length > 0) {
        input.runQueue();
    }
}
data.port.onMessage.addListener(function (msg) {
    switch (msg.action) {
        case "startRecord":
            document.addEventListener('click', logger.eventHandler);
            document.addEventListener('keydown', logger.eventHandler);
            break;
        case "stopRecord":
            document.removeEventListener('click', logger.eventHandler);
            document.removeEventListener('keydown', logger.eventHandler);
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
            input.throwAction(msg);
            data.port.postMessage({ action: "resolve" });
            break;
        case "actionPacket":
            console.log("completing Action Packet")
            console.log(msg)
            input.parsePacket(msg);
            break;
        case "openEditor":
            if (ui.editor) {
                console.log("Editor Opened")
                console.log(msg.actionSet)
                ui.editor.openEditor(msg.actionSet)
                ui.editor.showEntry();
            } else {
                throw new Error("Editor not found");
            }
            break;
        case "closeEditor":
            if (ui.editor) {
                console.log("Editor Closed")
                data.port.postMessage({ action: "closedEditor", actionList: ui.editor.hideEditor() });
            } else {
                throw new Error("Editor not found");
            }
            break;
        case "setURL":
            location.href = msg.url;
            break;
    }
});
