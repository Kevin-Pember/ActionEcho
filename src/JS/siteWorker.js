console.log("ActionEcho script loaded")
console.log("inject.js loaded")
window.addEventListener("load", () => { data.fullyLoaded = true });


//editor.style = `position: fixed; bottom: 10px; right: 10px; width: 300px; height: 300px; background-color: white; z-index: 10000000000;`
let ui = {
    body: document.body,
    indicator: document.createElement("div"),
    highlight: document.createElement("div"),
    toggleIndicator: (way) => {
        if (way) {
            ui.indicator.style = "right:10px; z-index: 100000;"
        } else {
            ui.indicator.style.right = "-100px"
            setTimeout(() => {
                ui.indicator.style.zIndex = "-100000";
            }, 500);
        }
    },
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

    keyCodes: {
        Enter: 13,
    }
}
let input = {
    actionQueue: [],
    data: {
        focusedElement: undefined,
        range: [0, 0],
    },
    parsePacket: (packet) => {
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
                    input.data.focusedElement = element;
                    console.log(`%c Checking Input`, "background-color: red; font-size: 20px;")
                    if ((element.tagName == "INPUT" || element.tagName == "TEXTAREA")) {
                        element.value = msg.textContext;
                    } else if (element.contentEditable == "true") {
                        element.innerText = msg.textContext;
                    }
                    //input.data.range = msg.caret.split("-");
                    if(msg.caret){
                        let range = msg.caret.split("-");
                        input.setFocus(element, range)
                    }
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
                    input.enterText(input.data.focusedElement, msg);
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
        let typeInput, charArray = log.text.split(""), range = input.data.range;
        console.log(element)
        console.log("Typing the text: " + log.text)
        if (element.contentEditable == "true") {
            typeInput = (text, range) => {
                let index = 0,
                    targetChild = undefined;
                element.innerHTML = element.innerHTML + text;
                targetChild = element.childNodes[0];
                index = text.length;
                input.setFocus(element, range);
                const inputEvent = new Event('input', { bubbles: true });
                element.dispatchEvent(inputEvent);
            }
        } else {
            typeInput = (text, range) => {
                console.log("elemnt value is " + element.value);
                element.focus();
                element.value = element.value.substring(0, range[0]) + text + element.value.substring(range[1]);
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
        console.log(eventObject)
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
    setFocus(elem, range) {
        if (range || elem.contentEditable === "true") {
            if ((elem.tagName === "input" && elem.type === "text") || elem.tagName === "TEXTAREA") {
                elem.setSelectionRange(range[0], range[1])
            } else if (elem.contentEditable === "true") {
                let sel = window.getSelection();
                let range = document.createRange();
                range.setStart(elem, range[0]);
                range.setEnd(elem,range[1])
                sel.removeAllRanges();
                sel.addRange(range);
            }
        } else {
            elem.focus()
        }
    }
}
let logger = {
    keyTable: [
        {
            mac: { key: "v", metaKey: true },
            default: { key: "v", ctrlKey: true },
            getKeyData: () => {
                return {};

            }
        },
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
            mac: { key: "a", metaKey: true },
            default: { key: "a", ctrlKey: true },
            getKeyData: () => { return { key: "all" } }
        },
    ],
    templates: {
        click: {
            action: "log",
            type: "click",
            specifier: undefined,
            textContext: undefined,
        },
        input: {
            action: "log",
            type: "key",
            specifier: undefined,
            key: undefined,
        }
    },
    matchKeys: (event, key) => {
        let keys = Object.keys(key);
        for (let keyName of keys) {
            if (event[keyName] != key[keyName]) {
                return false;
            }
        }
        return true;
    },
    eventHandler: async (event) => {
        let target = event.target;
        let log;
        console.log(event)
        if (event.type == "click") {
            log = { ...logger.templates.click };
            log.specifier = logger.getSpecifier(target);
            if ((target.tagName == "INPUT" && target.type == "text") || target.tagName == "TEXTAREA" || target.contentEditable == "true") {
                log.textContext = target.contentEditable == "true" ? target.innerText : target.value;
                log.caret = logger.getSelection(target);
                data.targetElement = log.specifier;
            }
        } else if (event.type == "keydown" || event.type == "keyup" || event.type == "keypress") {
            log = { ...logger.templates.input };
            log.specifier = data.targetElement != undefined ? data.targetElement : logger.getSpecifier(target);
            if ((event.metaKey || event.ctrlKey) && event.key.length == 1) {
                console.log(data.browserOS)
                console.log(event)
                for (let action of logger.keyTable) {
                    console.log(action[data.browserOS])
                    if (logger.matchKeys(event, action[data.browserOS])) {
                        console.log(action[data.browserOS])
                        Object.assign(log, await action.getKeyData(event));
                        break;
                    }
                }
                console.log("Prepost", event)
                console.log("Post parse", log)
            } else if (event.key.length > 1) {
                if (event.key == "Enter") {
                    log.key = "Enter";
                } else if (event.key == "Backspace") {
                    log.key = "Backspace";
                } else if (event.key == "Delete") {
                    log.key = "Delete";
                } else if (event.key == "ArrowLeft") {
                    log.key = "ArrowLeft";
                } else if (event.key == "ArrowRight") {
                    log.key = "ArrowRight";
                }

            } else if (event.key.length == 1) {
                console.log("key is " + event.key)
                log.type = "input";
                log.key = event.key;
                log.selection = logger.getSelection(event.target);
            };
        }
        console.log(log);
        if ((log.type == "key" && log.key != undefined) || log.type != "key") {
            data.port.postMessage(log);
        }

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
            ui.toggleIndicator(true)
            document.addEventListener('click', logger.eventHandler);
            document.addEventListener('keydown', logger.eventHandler);
            document.addEventListener("paste", (e) => {
                let log = { type: "key", selection: logger.getSelection(e.target), key: "paste", text: e.clipboardData.getData('text/plain') };
                if (text != "" && text != undefined) {
                    data.port.postMessage(log);
                }
            });
            break;
        case "stopRecord":
            ui.toggleIndicator(false)
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
let platInfo = navigator.userAgent;
if (platInfo.indexOf("Macintosh") != -1) {
    data.browserOS = "mac";
} else {
    data.browserOS = "default";
}
ui.indicator.classList.add("actionEchoRecordIcon")
ui.indicator.innerHTML = `<svg style="height:60px; width: 60px;" viewBox="0 0 1200 1200" xmlns="http://www.w3.org/2000/svg">
<path d="m557.75 583.42c-39.443-39.443-103.39-39.443-142.84 0s-39.443 103.39 0 142.84 103.39 39.443 142.84 0 39.443-103.39 0-142.84zm-25.456 25.456c-25.384-25.384-66.54-25.384-91.924 0s-25.384 66.539 0 91.923c25.384 25.385 66.54 25.385 91.924 0 25.384-25.384 25.384-66.539 0-91.923z" clip-rule="evenodd" fill="#D9D9D9" fill-rule="evenodd"/>
<path d="m557.75 583.42c-39.443-39.443-103.39-39.443-142.84 0s-39.443 103.39 0 142.84 103.39 39.443 142.84 0 39.443-103.39 0-142.84zm-25.456 25.456c-25.384-25.384-66.54-25.384-91.924 0s-25.384 66.539 0 91.923c25.384 25.385 66.54 25.385 91.924 0 25.384-25.384 25.384-66.539 0-91.923z" clip-rule="evenodd" fill-opacity=".3" fill-rule="evenodd"/>
<path d="m70.556 958.89 111.02 111.02 314.54-314.55c-29.002 2.805-58.986-6.899-81.198-29.111-22.615-22.615-32.264-53.287-28.945-82.777l-315.42 315.42z" fill="#D9D9D9"/>
<path d="m70.556 958.89 111.02 111.02 314.54-314.55c-29.002 2.805-58.986-6.899-81.198-29.111-22.615-22.615-32.264-53.287-28.945-82.777l-315.42 315.42z" fill-opacity=".3"/>
<path d="m982.64 158.42c-39.443-39.443-103.39-39.443-142.84 0-39.443 39.443-39.443 103.39 0 142.84 39.442 39.443 103.39 39.443 142.84 0 39.441-39.443 39.441-103.39 0-142.84zm-25.456 25.456c-25.384-25.384-66.54-25.384-91.924 0s-25.384 66.539 0 91.924c25.384 25.384 66.54 25.384 91.924 0 25.384-25.385 25.384-66.54 0-91.924z" clip-rule="evenodd" fill="#D9D9D9" fill-rule="evenodd"/>
<path d="m982.64 158.42c-39.443-39.443-103.39-39.443-142.84 0-39.443 39.443-39.443 103.39 0 142.84 39.442 39.443 103.39 39.443 142.84 0 39.441-39.443 39.441-103.39 0-142.84zm-25.456 25.456c-25.384-25.384-66.54-25.384-91.924 0s-25.384 66.539 0 91.924c25.384 25.384 66.54 25.384 91.924 0 25.384-25.385 25.384-66.54 0-91.924z" clip-rule="evenodd" fill-opacity=".15" fill-rule="evenodd"/>
<path d="m495.44 533.89 111.02 111.02 314.54-314.54c-29.003 2.805-58.986-6.899-81.198-29.111-22.616-22.615-32.264-53.287-28.946-82.777l-315.42 315.42z" fill="#D9D9D9"/>
<path d="m495.44 533.89 111.02 111.02 314.54-314.54c-29.003 2.805-58.986-6.899-81.198-29.111-22.616-22.615-32.264-53.287-28.946-82.777l-315.42 315.42z" fill-opacity=".15"/>
<path d="m413.42 727.64c39.443 39.443 103.39 39.443 142.84 0s39.443-103.39 0-142.84-103.39-39.443-142.84 0-39.443 103.39 0 142.84zm25.456-25.456c25.384 25.384 66.54 25.384 91.924 0s25.384-66.54 0-91.924-66.54-25.384-91.924 0-25.384 66.54 0 91.924z" clip-rule="evenodd" fill="#D9D9D9" fill-rule="evenodd"/>
<path d="m413.42 727.64c39.443 39.443 103.39 39.443 142.84 0s39.443-103.39 0-142.84-103.39-39.443-142.84 0-39.443 103.39 0 142.84zm25.456-25.456c25.384 25.384 66.54 25.384 91.924 0s25.384-66.54 0-91.924-66.54-25.384-91.924 0-25.384 66.54 0 91.924z" clip-rule="evenodd" fill-opacity=".15" fill-rule="evenodd"/>
<path d="m900.62 352.16-111.02-111.02-314.54 314.54c29.003-2.805 58.987 6.898 81.199 29.11 22.615 22.616 32.264 53.288 28.945 82.778l315.42-315.42z" fill="#D9D9D9"/>
<path d="m900.62 352.16-111.02-111.02-314.54 314.54c29.003-2.805 58.987 6.898 81.199 29.11 22.615 22.616 32.264 53.288 28.945 82.778l315.42-315.42z" fill-opacity=".15"/>
<path d="m982.64 158.42c-39.443-39.443-103.39-39.443-142.84 0-39.443 39.443-39.443 103.39 0 142.84 39.442 39.443 103.39 39.443 142.84 0 39.441-39.443 39.441-103.39 0-142.84zm-25.456 25.456c-25.384-25.384-66.54-25.384-91.924 0s-25.384 66.539 0 91.924c25.384 25.384 66.54 25.384 91.924 0 25.384-25.385 25.384-66.54 0-91.924z" clip-rule="evenodd" fill="#D9D9D9" fill-rule="evenodd"/>
<path d="m982.64 158.42c-39.443-39.443-103.39-39.443-142.84 0-39.443 39.443-39.443 103.39 0 142.84 39.442 39.443 103.39 39.443 142.84 0 39.441-39.443 39.441-103.39 0-142.84zm-25.456 25.456c-25.384-25.384-66.54-25.384-91.924 0s-25.384 66.539 0 91.924c25.384 25.384 66.54 25.384 91.924 0 25.384-25.385 25.384-66.54 0-91.924z" clip-rule="evenodd" fill-opacity=".15" fill-rule="evenodd"/>
<path d="m495.44 533.89 111.02 111.02 314.54-314.54c-29.003 2.805-58.986-6.899-81.198-29.111-22.616-22.615-32.264-53.287-28.946-82.777l-315.42 315.42z" fill="#D9D9D9"/>
<path d="m495.44 533.89 111.02 111.02 314.54-314.54c-29.003 2.805-58.986-6.899-81.198-29.111-22.616-22.615-32.264-53.287-28.946-82.777l-315.42 315.42z" fill-opacity=".15"/>
<path d="m413.42 727.64c39.443 39.443 103.39 39.443 142.84 0s39.443-103.39 0-142.84-103.39-39.443-142.84 0-39.443 103.39 0 142.84zm25.456-25.456c25.384 25.384 66.54 25.384 91.924 0s25.384-66.54 0-91.924-66.54-25.384-91.924 0-25.384 66.54 0 91.924z" clip-rule="evenodd" fill="#D9D9D9" fill-rule="evenodd"/>
<path d="m413.42 727.64c39.443 39.443 103.39 39.443 142.84 0s39.443-103.39 0-142.84-103.39-39.443-142.84 0-39.443 103.39 0 142.84zm25.456-25.456c25.384 25.384 66.54 25.384 91.924 0s25.384-66.54 0-91.924-66.54-25.384-91.924 0-25.384 66.54 0 91.924z" clip-rule="evenodd" fill-opacity=".15" fill-rule="evenodd"/>
<path d="m900.62 352.16-111.02-111.02-314.54 314.54c29.003-2.805 58.987 6.898 81.199 29.11 22.615 22.616 32.264 53.288 28.945 82.778l315.42-315.42z" fill="#D9D9D9"/>
<path d="m900.62 352.16-111.02-111.02-314.54 314.54c29.003-2.805 58.987 6.898 81.199 29.11 22.615 22.616 32.264 53.288 28.945 82.778l315.42-315.42z" fill-opacity=".15"/>
<path d="m911 130c-55.781 0-101 45.219-101 101s45.219 101 101 101 101-45.219 101-101-45.223-101-101-101zm0 36c-35.899 0-65 29.102-65 65s29.101 65 65 65c35.898 0 65-29.102 65-65s-29.102-65-65-65z" clip-rule="evenodd" fill="#D9D9D9" fill-rule="evenodd"/>
<path d="m832 740h157v-444.83c-18.524 22.492-46.588 36.832-78 36.832-31.983 0-60.494-14.866-79-38.065v446.06z" fill="#D9D9D9"/>
<path d="m910.77 1112.2-202.46-376.66h404.92l-202.46 376.66z" fill="#D9D9D9"/>
<circle cx="911" cy="230" r="45" fill="#D9D9D9"/>
<circle cx="487" cy="655" r="45" fill="#D9D9D9"/>">
<span class="actionEchoToolTip">Recording</span>
`
ui.body.appendChild(ui.indicator)

console.log(ui.indicator)