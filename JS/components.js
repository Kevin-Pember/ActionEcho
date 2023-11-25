class basicElement extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' })
        this.shadowRoot.innerHTML = `
        <style>
        *{
            font-family: 'Roboto', sans-serif;
            color: var(--text);
        }
        </style>
        `
        this.ui = {};
    }
}
class backgroundDiv extends basicElement {
    constructor(){
        super();
        this.shadowRoot.innerHTML = `
        <div id="mainDiv" style="z-index: -1; opacity: 0; transition: opacity 0.25s ease; filter: blur(10px); width: 100%; height: 100%; position: absolute; left:0; right:0; background-color: #000000;"></div>
        `;
        this.ui.mainDiv = this.shadowRoot.getElementById("mainDiv");
    }
    blurFocus(){
        this.ui.mainDiv.style.zIndex = "100";
        this.ui.mainDiv.style.opacity = "0.5";
    }
    returnFocus(){
        this.ui.mainDiv.style.opacity = "0";
        setTimeout(() => {this.ui.mainDiv.style.zIndex = "-1";}, 250);
    }
}
customElements.define('background-div', backgroundDiv);
class ButtonGeneric extends basicElement {
    constructor() {
        super();
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
            background-color: var(--accent2);
            border: 2px solid var(--accentBorder);
            padding: calc(25% - 2px);
        }
        .accent{
            background-color: var(--accent);
        }
        .secondary{
            background-color: var(--secondary);
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
            if(svgIcon){
                console.log(svgIcon)
                svgIcon.id = "svgButton";
                this.svgContainer.appendChild(svgIcon);
            }
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
class InputEntry extends basicElement {
    constructor() {
        super();
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
    set(action) {
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
        } else if (action.type == "input" && action.text) {
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
        } else if (action.type == "input" && action.key) {
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
            chrome.runtime.sendMessage({ action: "highlight", url: action.location, target: action.specifier }, (response) => {
                if (response.log == "highlighted") {
                    console.log("highlighted")
                } else {
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
class InputSpacer extends basicElement {
    constructor() {
        super();
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
class ActionSet extends basicElement {
    constructor() {
        super();
        this.shadowRoot.innerHTML = `
      <div id="actionButton" style="background-color: transparent; height: 100%; width: 100%; position: relative; display:grid;justify-content: center;align-items: center; grid-auto-flow: column; gap: 10px;">
        <img id="imgArea" style="border-radius: 50%;background-color: var(--primary);border: 2px solid var(--accentBorder);">
        <h2 id="nameArea"></h2>
        <Button-Generic id="editButton" style="aspect-ratio: 1; width: 34px; position: relative;">
        <svg viewBox="0 0 1079 1078" xmlns="http://www.w3.org/2000/svg">
        <path d="m644.42 231.79c11.715-11.716 30.71-11.716 42.426 0l159.81 159.81c11.716 11.716 11.716 30.711 0 42.426l-453.96 453.96c-11.716 11.716-30.711 11.716-42.427 0l-159.81-159.81c-11.716-11.716-11.716-30.711 0-42.427l453.96-453.96z" fill="#FFF" fill-opacity=".3"/>
        <path d="m1063.7 216.94c30.86-30.852 10.59-101.13-45.25-156.98-55.846-55.845-126.13-76.106-156.98-45.255l-111.02 111.02c-11.716 11.715-11.716 30.711 0 42.426l159.81 159.81c11.715 11.716 30.71 11.716 42.426 0l111.01-111.02z" fill="#FFF" fill-opacity=".3"/>
        <path d="m39.79 1076.3c-23.172 7.33-44.992-14.49-37.656-37.66l73.756-232.96c6.7914-21.451 33.904-28.069 49.814-12.158l159.2 159.2c15.91 15.91 9.293 43.022-12.158 49.813l-232.96 73.76z" fill="#FFF" fill-opacity=".3"/>
        </svg>
        </Button-Generic>
      </div>
      `;
        this.ui = {};
        this.ui.actionButton = this.shadowRoot.getElementById("actionButton");
        this.ui.imgArea = this.shadowRoot.getElementById("imgArea");
        this.ui.nameArea = this.shadowRoot.getElementById("nameArea");
        this.ui.editButton = this.shadowRoot.getElementById("editButton");
    }
    faviconURL(u) {
        const url = new URL(chrome.runtime.getURL("/_favicon/"));
        url.searchParams.set("pageUrl", u);
        url.searchParams.set("size", "32");
        return url.toString();
    }
    linkAction(action) {
        this.action = action
        this.ui.nameArea.innerText = action.name;
        this.ui.imgArea.src = this.faviconURL(action.actions[0].url);
        this.ui.actionButton.addEventListener("click", (e) => {
            if (this.ui.editButton.contains(e.target)) {
                chrome.runtime.sendMessage({ action: "openEditor", actionSet: action }, (response) => {
                    if (response.log == "opened") {
                        console.log("Opened Action Editor");
                    } else if (response.log == "alreadyOpen"){
                        ui.getBool("Editor Already Open", "Do you want to close the editor for "+ action.name).then((bool) => {
                            console.log("boolean got: " + bool)
                            if(bool){
                                chrome.runtime.sendMessage({ action: "closeEditor"}, (response) => {
                                    console.log(response)
                                    if(response.log == "closed"){
                                        console.log("opening new editor")
                                        chrome.runtime.sendMessage({ action: "openEditor", actionSet: action }, (response) => {
                                            if (response.log == "opened") {
                                                console.log("Opened Action Editor");
                                            } else if (response.log == "alreadyOpen"){
                                                throw new Error("Editor conflict");
                                            }
                                        });
                                    }else if (response.log == "noEditor"){
                                        throw new Error("Editor conflict");
                                    }
                                });
                            }
                        });
                    }else {
                        console.log(response.log)
                        throw new Error(`Failed to open action editor: ${action.name}`);
                    }
                });
            } else {
                console.log("run action set")
                chrome.runtime.sendMessage({ action: "runActionSet", set: action }, (response) => {

                });
            }
        });
    }
    removeAction() {
        data.removeAction(this.action);
        this.remove();
    }
}
customElements.define('action-set', ActionSet);
class uniQuery extends basicElement{
    constructor(){
        super();
        this.shadowRoot.innerHTML += `
        <link rel="stylesheet" href="styling.css">
        <style>
            *{
                margin: 0;
            }
            input{
                border-radius: 20px;
                border: 2px solid var(--accentBorder);
                height: 50px;
                width: 100%;
                background-image: linear-gradient(45deg, var(--accent), var(--accent2));
                background-size: 400% 400%;
                animation: gradient 15s ease infinite;
                outline: none;
                padding: 0 5px 0 5px;
                font-size: 25px;
            }
            .handlerButtons{
                height: 35px; 
                aspect-ratio:1; 
                position: relative; 
                display: block; 
            }
        </style>
        <div
        style="position: relative; height: fit-content; width: fit-content;
        z-index: 100; padding: 10px; transition: 0.25s ease; box-sizing: border-box; 
        padding-bottom: 45px; border-radius:20px; background-color:var(--primary);">
                <h2 id="title" style="margin: 0 0 5px 0;">Alert</h2>
                <div id="inputContainer" style="display: flex;">
                
                </div>
                <div style="height: 35px; display: flex; gap: 5px; position: absolute; right: 5px; bottom: 5px;">
                    <button-generic id="acceptButton" class="handlerButtons">
                        <svg fill="none" viewBox="0 0 1324 1033" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="m1162 8.7868c-11.71-11.716-30.71-11.716-42.42-1e-5l-646.5 646.5-269.08-269.08c-11.715-11.716-30.71-11.716-42.426 0l-152.74 152.74c-11.716 11.716-11.716 30.711-1e-5 42.427l442.74 442.74c5.932 5.93 13.732 8.86 21.507 8.78 7.771 0.08 15.565-2.85 21.495-8.78l820.16-820.16c11.71-11.715 11.71-30.71 0-42.426l-152.74-152.74z"
                                fill="#000" fill-opacity=".3" />
                        </svg>
                    </button-generic>
                    <button-generic id="quitButton" class="handlerButtons">
                        <svg fill="none" viewBox="0 0 1002 1002" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9.21265 797.872C-2.50317 809.588 -2.50317 828.583 9.21265 840.299L161.948 993.034C173.664 1004.75 192.659 1004.75 204.375 993.034L501.123 696.285L797.872 993.034C809.588 1004.75 828.583 1004.75 840.298 993.034L993.033 840.299C1004.75 828.583 1004.75 809.588 993.033 797.872L696.284 501.124L993.033 204.375C1004.75 192.659 1004.75 173.664 993.033 161.948L840.299 9.2132C828.583 -2.50238 809.588 -2.50238 797.872 9.2132L501.123 305.962L204.374 9.2132C192.658 -2.50238 173.664 -2.50238 161.948 9.2132L9.21265 161.948C-2.50317 173.664 -2.50317 192.659 9.21265 204.375L305.962 501.124L9.21265 797.872Z" fill="black" fill-opacity="0.3"/>
                        </svg>
                    </button-generic>
            </div>
        </div>
        `
        this.ui.title = this.shadowRoot.getElementById("title");
        this.ui.acceptButton = this.shadowRoot.getElementById("acceptButton");
        this.ui.inputContainer = this.shadowRoot.getElementById("inputContainer");
        this.ui.quitButton = this.shadowRoot.getElementById("quitButton");
        this.ui.containedElements = [];
    }
    setQueryType(type){
        if(this.ui.containedElements){
            this.clearContext();
        }
        if(arguments[1]){
            this.ui.title.textContent = arguments[1];
        }
        switch(type){
            case("text"):
                this.type = "text";
                let input = document.createElement("input");
                input.type = "text";
                this.ui.containedElements.push(input);
                this.ui.inputContainer.appendChild(input);
            break;
            case("bool"):
                this.type = "bool";
                if(arguments[2]){
                    let contextHeader = document.createElement("h5");
                    contextHeader.textContent = arguments[2];
                    this.ui.containedElements.push(contextHeader);
                    this.ui.inputContainer.appendChild(contextHeader);
                }
            break;
        }
        this.ui.containerDiv
    }
    setMethods(complete){
        let close = () => {
            complete(false);
            closeMethod();
        }
        let save = () => {
            complete(true, this.type == "text" ? this.ui.containedElements[0].value: true);
            closeMethod();
        }
        let keySave;
        if(this.type == "text"){
            keySave = (e) => {
                if(e.key == "Enter"){
                    save();
                }
            }
        }
        let closeMethod = () => {
            this.ui.acceptButton.removeEventListener("click", save);
            this.ui.quitButton.removeEventListener("click", close);
            if(this.type == "text"){
                this.ui.containedElements[0].removeEventListener("keypress", keySave);
            }
        };
        this.ui.quitButton.addEventListener("click", close);
        this.ui.acceptButton.addEventListener("click", save);
        if(this.type == "text"){
            this.ui.containedElements[0].addEventListener("keypress", keySave);
        }
    }
    clearContext(){
        this.ui.title.textContent = "";
        for(let element of this.ui.containedElements){
            element.remove();
        }
        this.ui.containedElements = [];
    }
}
customElements.define("uni-query", uniQuery);