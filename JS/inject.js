console.log("AutoMade script loaded")

//editor.style = `position: fixed; bottom: 10px; right: 10px; width: 300px; height: 300px; background-color: white; z-index: 10000000000;`
class ButtonGeneric extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
        <style>
        #svgContainer{
            height: 100%;
            width: 100%;
            position: absolute;
            border-radius: 50%;
            padding: 25%;
            transition: background-color 0.25s ease,border 0.25s ease,padding 0.25s ease;
            box-sizing: border-box;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        #svgButton{
            height: 100%;
            
        }
        #svgContainer:hover{
            background-color: #5b3d56;
            border: 2px solid #252f53;
            padding: calc(25% - 2px);
        }
        .accent{
            background-color: #364478;
        }
        .secondary{
            background-color: #424658;
        }
        </style>
        <div id="svgContainer" class="secondary">

        </div>
        `
        this.svgContainer = this.shadowRoot.getElementById("svgContainer");
    }
    connectedCallback() {
        setTimeout(() => {
            let svgIcon = this.querySelector("svg");
            console.log(svgIcon)
            svgIcon.id = "svgButton";
            this.svgContainer.appendChild(svgIcon);
        });
    }
    static get observedAttributes() {
        return ['bcolor'];
    }
    attributeChangedCallback(name, oldValue, newValue) {
        if (name == "bcolor") {
            console.log("basic shit")
            this.svgContainer.className = ""
            if (newValue == "secondary") {
                this.svgContainer.classList.add("secondary")
            } else if (newValue == "accent") {
                this.svgContainer.classList.add("accent")
            }
        }
    }
}
customElements.define('button-generic', ButtonGeneric)
class InputEntry extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
        <style>
        @keyframes closeBackground {
            0% {
                width: 100%;
            }
            40%{
                width: 75px;
                opacity: 1;
            }
            60%{
                transform: translateY(0px);
            }
            100%{
                width: 75px;
                opacity: 0;
                transform: translateY(-32.5px);
            }
        }
        @keyframes move {
            0% {
                margin-top: 0px;
            }
            100%{
                margin-top: -84px;
            }
        }
        @keyframes gradient {
            0% {
              background-position: 0% 50%;
            }
            50% {
              background-position: 100% 50%;
            }
            100% {
              background-position: 0% 50%;
            }
          }
        *{
            font-family: 'Roboto', sans-serif;
        }
        #backgroundDiv{
            transition: width 0.25s ease,opacity 0.25s ease, top 0.25s ease;
            width: 100%;
            visibility: hidden;
            z-index: 7;
            display: flex;
            align-items: center;
            border-radius: 15px;
            border: 2px solid var(--accentBorder);
            height: 75px;
            background-image: linear-gradient(45deg, var(--accent), var(--accent2));
            background-size: 400% 400%;
            animation: gradient 15s ease infinite;
            outline: none;
            display:flex;
            position: relative; 
            z-index:3;
        }
        #deleteButton{
            position: absolute;
            right: 10px;
            display: relative;
            aspect-ratio: 1;
            height: 35px;
            opacity: 0;
            transition: opacity 0.5s ease;
        }
        #iconContainer{
            aspect-ratio: 1; 
            height: 100%; 
            background-color: #994F89; 
            border-radius: 15px; 
            border: 2px solid var(--accentBorder);
            border-left: none;
            display: grid; 
            justify-content: center; 
            align-items: center;
        }
        #displayText{
            font-weight: bold;
        }
        .text{
            transition: opacity 0.5s ease;
            position: absolute;
            opacity: 0;
            color: var(--text);
            font-size: 20px;
            font-weight: 500;
            padding-left: 5px;
        }
        </style>
        <div id="backgroundDiv" >
            <div id="iconContainer" style="">
            
            </div>
            <h1 id="displayText" class="text"><h6 id="typeText" class="text"></h6></h1>
            <button-generic id="deleteButton">
            <svg fill="none" viewBox="0 0 203 203" xmlns="http://www.w3.org/2000/svg">
            <path d="m42.93 0.46851-42.461 42.461 58.384 58.384-58.384 58.383 42.461 42.462 58.383-58.384 58.384 58.384 42.462-42.461-58.384-58.384 58.384-58.384-42.461-42.461-58.385 58.384-58.384-58.384z" clip-rule="evenodd" fill="#FFF" fill-opacity=".3" fill-rule="evenodd"/>
            </svg>
            </button-generic>
        </div>
        `
        this.ui.backgroundDiv = this.shadowRoot.getElementById("backgroundDiv");
        this.ui.iconContainer = this.shadowRoot.getElementById("iconContainer");
        this.ui.typeText = this.shadowRoot.getElementById("typeText");
        this.ui.displayText = this.shadowRoot.getElementById("displayText");
        this.ui.deleteButton = this.shadowRoot.getElementById("deleteButton");
        this.ui.deleteButton.addEventListener("click", () => { this.delete() });
    }
    static get observedAttributes() {
        return ['type', "message"];
    }
    attributeChangedCallback(name, oldValue, newValue) {
        if (name == "type") {
            
        } else if (name == "message") {
            this.shadowRoot.getElementById("displayText").innerHTML = newValue;
        }

    }
    set(action){
        if (action.type == "click") {
            this.ui.iconContainer.innerHTML = `
            <svg viewBox="0 0 447 448" xmlns="http://www.w3.org/2000/svg" style="width: 35px">
            <path d="m2.2454 27.923c-5.8922-16.007 9.6708-31.57 25.678-25.678l340.92 125.49c13.7 5.043 17.556 22.589 7.233 32.911l-215.43 215.43c-10.322 10.322-27.868 6.466-32.911-7.234l-125.49-340.92z" fill="#fff" fill-opacity=".3"/>
            <path d="m259.82 338.01c-7.811-7.81-7.811-20.473 0-28.284l49.497-49.497c7.81-7.811 20.474-7.811 28.284 0l103.24 103.24c7.81 7.811 7.81 20.474 0 28.284l-49.498 49.498c-7.81 7.81-20.473 7.81-28.284 0l-103.24-103.24z" fill="#fff" fill-opacity=".3"/>
            </svg>
            `
            console.log(this.typeText);
            this.ui.displayText.textContent = action.targetTag;
            this.ui.typeText.textContent = "clicked";
            this.ui.iconContainer.style.backgroundColor = "#994F89";
        } else if (action.type == "input" && action.text != undefined) {
            this.ui.iconContainer.innerHTML = `
            <svg viewBox="0 0 617 421" xmlns="http://www.w3.org/2000/svg" style="width: 50px">
            <path d="m234.1 0h-13.801c-34.921 0-65.559 18.786-82.803 47.029-17.245-28.243-47.882-47.029-82.803-47.029h-13.801v50.48h10.843c26.676 0 48.302 22.148 48.302 49.47v221.1c0 27.322-21.625 49.47-48.302 49.47h-10.843v50.48h13.801c34.921 0 65.558-18.786 82.803-47.029 17.244 28.243 47.882 47.029 82.803 47.029h13.801v-50.48h-10.844c-26.676 0-48.301-22.148-48.301-49.47v-221.1c0-27.322 21.625-49.47 48.301-49.47h10.844v-50.48z" fill-opacity=".3"/>
            <path d="m91.599 72h-21.599c-38.66 0-70 31.34-70 70v137c0 38.66 31.34 70 70 70h21.599c5.3259-7.952 8.4429-17.578 8.4429-27.95v-221.1c0-10.372-3.117-19.998-8.4429-27.95z" fill="#fff" fill-opacity=".3"/>
            <path d="m183.4 349h363.6c38.66 0 70-31.34 70-70v-137c0-38.66-31.34-70-70-70h-363.6c-5.326 7.952-8.443 17.578-8.443 27.95v221.1c0 10.372 3.117 19.998 8.443 27.95z" fill="#fff" fill-opacity=".3"/>
            </svg>
            `
            this.ui.displayText.textContent = action.text;
            this.ui.typeText.textContent = "typed";
            this.ui.iconContainer.style.backgroundColor = "#157B3E";
        } else if (action.type == "input" && action.key != undefined) {
            this.ui.iconContainer.innerHTML = `
            <svg viewBox="0 0 420 432" xmlns="http://www.w3.org/2000/svg" style="width: 40px;">
            <path d="m166.73 139.87-26.092-73.5h-1.272l-26.092 73.5h53.456z" fill="#fff" fill-opacity=".25"/>
            <path d="m86.8 22.4c-27.062 0-49 21.938-49 49v246.4c0 27.062 21.938 49 49 49h246.4c27.062 0 49-21.938 49-49v-246.4c0-27.062-21.938-49-49-49h-246.4zm-16.8 181.11h20.682l16.378-46.136h65.88l16.378 46.136h20.682l-59.818-162.91h-20.364l-59.818 162.91z" clip-rule="evenodd" fill="#fff" fill-opacity=".25" fill-rule="evenodd"/>
            <path d="m166.73 139.87-26.092-73.5h-1.272l-26.092 73.5h53.456z" fill="#fff" fill-opacity=".3"/>
            <path d="m49 0c-27.062 0-49 21.938-49 49v333.2c0 27.062 21.938 49 49 49h322c27.062 0 49-21.938 49-49v-333.2c0-27.062-21.938-49-49-49h-322zm21 203.51h20.682l16.378-46.136h65.88l16.378 46.136h20.682l-59.818-162.91h-20.364l-59.818 162.91z" clip-rule="evenodd" fill="#fff" fill-opacity=".3" fill-rule="evenodd"/>
            <path d="m90.682 203.51h-20.682l59.818-162.91h20.364l59.818 162.91h-20.682l-48.682-137.14h-1.272l-48.682 137.14zm7.6364-63.636h83.364v17.5h-83.364v-17.5z" fill-opacity=".3"/>
            </svg>
            `
            this.ui.displayText.textContent = action.key;
            this.ui.typeText.textContent = "pressed";
            this.ui.iconContainer.style.backgroundColor = "#9A581A";
        }
        //this.ui.displayText.innerHTML = action.targetTag;
        this.ui.displayText.addEventListener("mouseover", async () => {
            //****Add method before implementation */
            chrome.runtime.sendMessage({ action: "highlight",  url: action.location, target: action.specifier}, (response) => {
                if(response.log == "highlighted"){
                    console.log("highlighted")
                }else{
                    throw new Error("Failed to highlight")
                }
              });
        });
    }
    open() {
        this.ui.backgroundDiv.style.visibility = "visible";
        //this.displayText.style.position = "relative";
        //this.displayText.style.opacity = "1";
        this.ui.backgroundDiv.style.animation = "closeBackground .50s ease-in reverse";
        setTimeout(() => {
            this.ui.deleteButton.style.opacity = "1";
            this.ui.displayText.style.position = "relative";
            this.ui.displayText.style.opacity = "1";
            this.ui.typeText.style.opacity = "1";
            this.ui.typeText.style.position = "relative";
            this.ui.backgroundDiv.style.animation = "";
        }, 500);
    }
    move() {
        this.ui.backgroundDiv.style.animation = "move .55s ease-in forwards";
        setTimeout(() => {
            this.ui.backgroundDiv.style.animation = "";
        }, 500);
    }
    delete() {
        let parent = this.parentNode;
        let index = Array.prototype.indexOf.call(parent.children, this);
        let entries = parent.querySelectorAll('input-entry');
        if (entries.length > 1) {
            if (entries[entries.length - 1] == this) {
                parent.children[index - 1].delete();
            } else {
                parent.children[index + 1].delete();
                parent.children[index + 2].move();
            }
        }
        this.ui.backgroundDiv.style.animation = "closeBackground .50s ease-in forwards";
        this.ui.displayText.remove();
        this.ui.deleteButton.remove();
        setTimeout(() => {
            this.remove();
        }, 500);
    }
}
customElements.define('input-entry', InputEntry)
class InputSpacer extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
        <style>
            #indicator{
                background-color: var(--secondary);
                height: 5px; 
                width: 70px; 
                border-radius: 25px;
                z-index: 0;
                visibility: hidden;
            }
            @keyframes close {
                0% {
                    width: 70px;
                    background-color: var(--secondary);
                }
                40%{
                    width: 5px;
                    background-color: var(--accent2);
                    opacity: 1;
                    
                }
                60%{
                    transform: translateY(0px);
                }
                100%{
                    width: 5px;
                    opacity: 0;
                    transform: translateY(-32.5px);
                }
            }
        </style>
        <div style="display: grid; justify-content: center; align-items: center; height: 15px; width: 100%;">
            <div id="indicator" style=""></div>
        </div>
        `
        this.indicator = this.shadowRoot.getElementById("indicator");
    }
    open() {
        this.indicator.style.visibility = "inherit";
        this.indicator.style.animation = "close .50s ease-in backwards reverse";
        setTimeout(() => { this.indicator.style.animation = "" }, 500);
    }
    delete() {
        this.indicator.style.animation = "close .50s ease-in forwards";
        setTimeout(() => { this.remove() }, 500);
    }
}
customElements.define('input-spacer', InputSpacer)
class ActionEditor extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
        <style>
        * {
            color: #bbc6ff;
            background-color: #1b1b1f;
        }
        :root {
            --primary: #1b1b1f;
            --secondary: #424658;
            --accentBorder: #252f53;
            --accent: #364478;
            --accent2: #5b3d56;
            --highlight: #5b3d56;
            --text: #bbc6ff;
            --translucent: #00000033;
            --semi-transparent: #000000c5;
            --neutralColor: #80808080;
        }

        button,
        input,
        .inputArea {
            border-radius: 20px;
            border: 2px solid #252f53;
            height: 50px;
            background-image: linear-gradient(45deg, #364478, #5b3d56);
            background-size: 400% 400%;
            animation: gradient 15s ease infinite;
            outline: none;
        }
        @keyframes gradient {
            0% {
              background-position: 0% 50%;
            }
            50% {
              background-position: 100% 50%;
            }
            100% {
              background-position: 0% 50%;
            }
          }
        </style>
        <div style="width: 100%; height: 100%; background-color: #1b1b1f; padding: 10px; box-sizing: border-box;">
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px">
            <button-generic id="editBack" style="height: 35px; aspect-ratio:1; position: relative; display: block; ">
                <svg fill="none" viewBox="0 0 1272 1124" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="m516.15 700 219.97 219.97c11.715 11.715 11.715 30.71 0 42.426l-152.74 152.74c-11.716 11.71-30.711 11.71-42.427 0l-531.74-531.75c-11.716-11.716-11.715-30.711 0-42.427l531.74-531.74c11.716-11.716 30.711-11.716 42.427 0l152.74 152.73c11.715 11.716 11.715 30.711 0 42.426l-219.62 219.63h725.5c16.57 0 30 13.431 30 30v216c0 16.569-13.43 30-30 30h-725.85z"
                        clip-rule="evenodd" fill="#FFF" fill-opacity=".3" fill-rule="evenodd" />
                </svg>
            </button-generic>
            <input id="editName" type="text" style="width: 150px; height: 50px; font-size: 30px; text-align: center; ">
            <button-generic id="editBack" style="height: 35px; aspect-ratio:1; position: relative; display: block; ">
                <svg fill="none" viewBox="0 0 1324 1033" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="m1162 8.7868c-11.71-11.716-30.71-11.716-42.42-1e-5l-646.5 646.5-269.08-269.08c-11.715-11.716-30.71-11.716-42.426 0l-152.74 152.74c-11.716 11.716-11.716 30.711-1e-5 42.427l442.74 442.74c5.932 5.93 13.732 8.86 21.507 8.78 7.771 0.08 15.565-2.85 21.495-8.78l820.16-820.16c11.71-11.715 11.71-30.71 0-42.426l-152.74-152.74z"
                        fill="#FFF" fill-opacity=".3" />
                </svg>
            </button-generic>
        </div>
        <div id="editEntry" style="width: 100%; height: 400px; padding-top: 10px;">

        </div>
        </div>
        `
        this.ui = {
            editNameEntry: this.shadowRoot.getElementById("editName"),
            editEntryContainer: this.shadowRoot.getElementById("editEntry"),
        }
    }
    setEditor(actionSet) {
        this.ui.editNameEntry.value = actionSet.name;
        for (let action of actionSet.actions) {
            let actionEntry = document.createElement("input-entry");
            actionEntry.set(action)
            actionEntry.classList.add("entry");
            this.ui.editEntryContainer.appendChild(actionEntry);
            if (actionSet.actions[actionSet.actions.length - 1] != action) {
                let spacer = document.createElement("input-spacer");
                this.ui.editEntryContainer.appendChild(spacer);
            }
        }
    }
}
customElements.define('editor-view', ActionEditor)
let editor = document.createElement("editor-view");
editor.style = `position: fixed; bottom: 10px; right: 10px; width: 400px; height: 500px; border-radius: 25px; z-index: 10000000000; overflow: hidden; border: 2px solid #252f53; `
document.body.appendChild(editor);
let ui = {
    body: document.body,
    html: document.documentElement,
    highlight: document.createElement("div"),
    highlightElement: (element) => {
        ui.highlight.style.visibility = "visible";
        ui.highlight.style.zIndex = "10000000000";
        let highElem = data.getElement(element);
        highElem.style.zIndex = "10000000001";
    }
}
let data = {
    port: chrome.runtime.connect({ name: location.href }),
    targetElement: undefined,
    buttons: {
        Enter: 13,
    },
    eventHandler: async (event) => {
        let target = event.target;
        let log;
        if (event.type == "click") {
            log = {
                location: location.href,
                action: "Log",
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
                action: "Log",
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
    typeText: (element, log) => {
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
    }
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
                let element = data.getElement(msg.specifier);
                if (msg.text != undefined) {
                    input.textType(element, msg);
                } else if (msg.key != undefined) {
                    input.throwKeyEvents(element, msg.key);
                }
                /*console.log(element)
                if (element.tagName == "INPUT" || element.tagName == "TEXTAREA") {
                    typeInput(element, msg.key, msg.selection.split("-"));
                } else if (element.contentEditable == "true") {
                    typeEditable(element, msg.key, msg);
                }
                element.dispatchEvent(new InputEvent('input', { data: msg.key, inputType: "insertText", bubbles: true }));
                console.log("input event dispatched");*/
            }
            data.port.postMessage({ action: "resolve" });
            break;
        case "highlight":
            let highlight = data.getElement(msg.specifier);
            break;
    }
});
console.log(Math.max(ui.body.scrollHeight, ui.body.offsetHeight, ui.html.clientHeight, ui.html.scrollHeight, ui.html.offsetHeight))
ui.highlight.style = `width: ${Math.max(ui.body.scrollWidth, ui.body.offsetWidth, ui.html.clientWidth, ui.html.scrollWidth, ui.html.offsetWidth)}px; height: ${Math.max(ui.body.scrollHeight, ui.body.offsetHeight, ui.html.clientHeight, ui.html.scrollHeight, ui.html.offsetHeight)}px; position: absolute; top: 0px; left: 0px; background-color: rgba(0, 0, 0, 0.5); z-index: -1; visibility: hidden;`
document.body.appendChild(ui.highlight);

//Deprecated
/*function typeEditable(element, key, log) {
    if (key.length == 1) {
        let range = log.selection.split("-");
        let focusNode = data.getElement(log.focusNode);
        let index = 0;
        let targetChild = undefined;
        let higher = range[1];
        let lower = range[0];
        let sel = window.getSelection();
        let rangeSel = document.createRange();
        if (element.contains(focusNode) && focusNode != null) {
            let appendString = focusNode.nodeValue.substring(0, lower) + key;
            focusNode.nodeValue = appendString + focusNode.nodeValue.substring(higher);
            targetChild = focusNode;
            index = appendString.length;
        } else {
            element.innerHTML = element.innerHTML + key;
            targetChild = element.childNodes[0];
            index = key.length + 1;
        }
        rangeSel.setStart(targetChild, index);
        rangeSel.collapse(true);
        sel.removeAllRanges();
        sel.addRange(rangeSel);
        const inputEvent = new Event('input', { bubbles: true });
        element.dispatchEvent(inputEvent);
        console.log("Made through")
    }
}
function typeInput(element, key, range) {
    element.focus();
    if (key.length == 1) {
        element.value = element.value.slice(0, range[0]) + key + element.value.slice(range[1]);
        element.setSelectionRange(range[0] + 1, range[0] + 1);
    }
}*/