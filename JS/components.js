let tools = {
    months: [
        { fullName: "January", shortName: "Jan" },
        { fullName: "February", shortName: "Feb" },
        { fullName: "March", shortName: "Mar" },
        { fullName: "April", shortName: "Apr" },
        { fullName: "May", shortName: "May" },
        { fullName: "June", shortName: "Jun" },
        { fullName: "July", shortName: "Jul" },
        { fullName: "August", shortName: "Aug" },
        { fullName: "September", shortName: "Sep" },
        { fullName: "October", shortName: "Oct" },
        { fullName: "November", shortName: "Nov" },
        { fullName: "December", shortName: "Dec" }
    ],
    limitInput: (elem, min, max) => {
        let input = elem.value;
        let numberInput = Number(input);
        if(isNaN(numberInput)){
            numberInput = Number(tools.makeNumber(input));
            console.log("number input is "+numberInput)
        }
        if(input == ""){
            return "";
        }else if(numberInput < min){
            return min;
        }else if(numberInput > max){
            return max;
        }else{
            return numberInput;
        }
    },
    getSelection: (target) => {
        if ((target.tagName == "INPUT" && target.type == "text") || target.tagName == "TEXTAREA") {
            return [target.selectionStart,target.selectionEnd]
        } else {
            let sel = window.getSelection()
            if (sel.baseOffset > sel.extentOffset) {
                return [sel.extentOffset, sel.baseOffset];
            } else {
                return [sel.baseOffset, sel.extentOffset];
            }
        }
    },
    makeNumber: (input) => {
        return input.replace(/\D/g, '');
    },
}
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
    constructor() {
        super();
        this.shadowRoot.innerHTML = `
        <div id="mainDiv" style="z-index: -1; opacity: 0; transition: opacity 0.25s ease; width: 100%; height: 100%; position: absolute; left:0; right:0; background-color: #000000;"></div>
        `;
        this.ui.mainDiv = this.shadowRoot.getElementById("mainDiv");
    }
    blurFocus() {
        this.ui.mainDiv.style.zIndex = "100";
        this.ui.mainDiv.style.opacity = "0.5";
    }
    returnFocus() {
        this.ui.mainDiv.style.opacity = "0";
        setTimeout(() => { this.ui.mainDiv.style.zIndex = "-1"; }, 250);
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
            padding: 25%;
            transition: background-color 0.25s ease;
            box-sizing: border-box;
            display: flex;
            justify-content: center;
            align-items: center;
            border: 2px solid var(--accentBorder);
        }
        #svgButton{
            height: 100%;
            
        }
        #svgContainer:hover{
            background-color: var(--darkText);
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
            if (svgIcon) {
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
      <div id="actionButton" style="background-color: transparent; height: 100%; width: 100%; position: relative; z-index: 1;">
        <svg id="deleteAction" style="position: absolute; left: 5px; top: 5px; height: 20px;" fill="none" viewBox="0 0 211 212" xmlns="http://www.w3.org/2000/svg">
            <path d="m2.3865 168.46c-2.4619 2.462-2.4619 6.453 0 8.915l32.095 32.095c2.462 2.462 6.4535 2.462 8.9155 0l62.358-62.357 62.358 62.357c2.462 2.462 6.454 2.462 8.915 0l32.096-32.095c2.462-2.462 2.462-6.453 0-8.915l-62.358-62.358 62.358-62.358c2.462-2.4619 2.462-6.4534 0-8.9154l-32.096-32.095c-2.462-2.4619-6.453-2.4619-8.915 0l-62.358 62.358-62.358-62.358c-2.462-2.4619-6.4533-2.4619-8.9153 0l-32.095 32.095c-2.4619 2.462-2.4619 6.4535 0 8.9154l62.358 62.358-62.358 62.358z" fill="var(--accent)"/>
        </svg>
      
        <div style="position: absolute; height: 100%; width: 100%; display:grid; justify-items: center; align-items: center; grid-template-rows: calc(100% - 30px) 30px;">
            <img id="imgArea" style="background-color: var(--accent);padding: 17.5px;border: 3px solid var(--accentBorder);">
            <h2 id="nameArea" style="color: var(--darkText); font-size: 30px; font-weight: 300;"></h2>
        </div>
        
        <svg id="editButton" style="visibility: hidden; position: absolute; right: 5px; top: 5px; height: 20px;" viewBox="0 0 1079 1078" xmlns="http://www.w3.org/2000/svg">
            <path d="m644.42 231.79c11.715-11.716 30.71-11.716 42.426 0l159.81 159.81c11.716 11.716 11.716 30.711 0 42.426l-453.96 453.96c-11.716 11.716-30.711 11.716-42.427 0l-159.81-159.81c-11.716-11.716-11.716-30.711 0-42.427l453.96-453.96z" fill="var(--accent)"/>
            <path d="m1063.7 216.94c30.86-30.852 10.59-101.13-45.25-156.98-55.846-55.845-126.13-76.106-156.98-45.255l-111.02 111.02c-11.716 11.715-11.716 30.711 0 42.426l159.81 159.81c11.715 11.716 30.71 11.716 42.426 0l111.01-111.02z" fill="var(--accent)"/>
            <path d="m39.79 1076.3c-23.172 7.33-44.992-14.49-37.656-37.66l73.756-232.96c6.7914-21.451 33.904-28.069 49.814-12.158l159.2 159.2c15.91 15.91 9.293 43.022-12.158 49.813l-232.96 73.76z" fill="var(--accent)"/>
        </svg>
      </div>
      `;
        this.ui = {};
        this.ui.actionButton = this.shadowRoot.getElementById("actionButton");
        this.ui.imgArea = this.shadowRoot.getElementById("imgArea");
        this.ui.nameArea = this.shadowRoot.getElementById("nameArea");
        this.ui.editButton = this.shadowRoot.getElementById("editButton");
        this.ui.deleteAction = this.shadowRoot.getElementById("deleteAction");
    }
    
    linkAction(action) {
        this.action = action
        this.ui.nameArea.innerText = action.name;
        this.ui.imgArea.src = ui.faviconURL(action.actions[0].url);
        this.ui.actionButton.addEventListener("click", (e) => {
            /*if (this.ui.editButton.contains(e.target)) {
                chrome.runtime.sendMessage({ action: "openEditor", actionSet: action }, (response) => {
                    if (response.log == "opened") {
                        console.log("Opened Action Editor");
                    } else if (response.log == "alreadyOpen") {
                        ui.getBool("Editor Already Open", "Do you want to close the editor for " + action.name).then((bool) => {
                            console.log("boolean got: " + bool)
                            if (bool) {
                                chrome.runtime.sendMessage({ action: "closeEditor" }, (response) => {
                                    console.log(response)
                                    if (response.log == "closed") {
                                        console.log("opening new editor")
                                        chrome.runtime.sendMessage({ action: "openEditor", actionSet: action }, (response) => {
                                            if (response.log == "opened") {
                                                console.log("Opened Action Editor");
                                            } else if (response.log == "alreadyOpen") {
                                                throw new Error("Editor conflict");
                                            }
                                        });
                                    } else if (response.log == "noEditor") {
                                        throw new Error("Editor conflict");
                                    }
                                });
                            }
                        });
                    } else {
                        console.log(response.log)
                        throw new Error(`Failed to open action editor: ${action.name}`);
                    }
                });
            }*/
            if(this.ui.deleteAction.contains(e.target)){
                console.log("deleting Action Set")
                this.removeAction();

            } else {
                console.log("run action set")
                /*chrome.runtime.sendMessage({ action: "runActionSet", set: action }, (response) => {

                });*/
                ui.getTime("When do you want to run this action set?").then((dateRet) => {
                    let event = {
                        name : this.action.name,
                        actions : this.action.actions,
                        date: dateRet.getTime(),
                        state: "scheduled",
                    }
                    data.scheduledEvents.push(event);
                    data.saveScheduledActions();
                    ui.createTimeEntry(event)
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
class ScheduledAction extends basicElement {
    constructor() {
        super();
        this.shadowRoot.innerHTML = `
        <div id="actionButton" style="background-color: transparent; height: 100%; width: 100%; position: relative;">
            <svg id="removeAction" style="position: absolute; left: 5px; top: 5px; height: 20px; z-index: 1;" fill="none" viewBox="0 0 211 212" xmlns="http://www.w3.org/2000/svg">
                <path d="m2.3865 168.46c-2.4619 2.462-2.4619 6.453 0 8.915l32.095 32.095c2.462 2.462 6.4535 2.462 8.9155 0l62.358-62.357 62.358 62.357c2.462 2.462 6.454 2.462 8.915 0l32.096-32.095c2.462-2.462 2.462-6.453 0-8.915l-62.358-62.358 62.358-62.358c2.462-2.4619 2.462-6.4534 0-8.9154l-32.096-32.095c-2.462-2.4619-6.453-2.4619-8.915 0l-62.358 62.358-62.358-62.358c-2.462-2.4619-6.4533-2.4619-8.9153 0l-32.095 32.095c-2.4619 2.462-2.4619 6.4535 0 8.9154l62.358 62.358-62.358 62.358z" fill="var(--accent)"/>
            </svg>
        
            <div style="position: absolute; height: calc(100% - 40px); width: calc(100% - 20px); display:grid; justify-items: center; align-items: center; grid-template-columns: calc(100% - 90px) 90px; padding: 30px 10px 10px 10px">
                <div style="margin: 0 0 -10px -15px; position: relative;">
                    <svg id="statusIcon" style="height: 25px;right: -20px; position: absolute" fill="none" viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">
                        
                    </svg>                        
                    <h2 id="timeArea" style="font-family: 'DM Sans', sans-serif; margin: 0; font-size: 40px; margin-bottom: -10px; color: var(--darkText); height: 45px;">12:30</h2>
                    <h3 id="meridiemArea" style="margin: 2px; color: var(--darkText); direction: rtl;"></h3>
                    <h3 id="dateArea" style="font-family: 'DM Sans', sans-serif; font-weight: 300; margin: 0; margin-top: -10px; font-size: 30px; color: var(--darkText);height: 35px;">Apr, 1</h3>
                </div>
                <img id="imgArea" style="width:35px;background-color: var(--accent);padding: 17.5px;border: 3px solid var(--accentBorder);" src="icon.png">
                
            </div>
            
            <svg id="editButton" style="position: absolute; right: 5px; top: 5px; height: 20px;" viewBox="0 0 1079 1078" xmlns="http://www.w3.org/2000/svg">
                <path d="m644.42 231.79c11.715-11.716 30.71-11.716 42.426 0l159.81 159.81c11.716 11.716 11.716 30.711 0 42.426l-453.96 453.96c-11.716 11.716-30.711 11.716-42.427 0l-159.81-159.81c-11.716-11.716-11.716-30.711 0-42.427l453.96-453.96z" fill="var(--accent)"/>
                <path d="m1063.7 216.94c30.86-30.852 10.59-101.13-45.25-156.98-55.846-55.845-126.13-76.106-156.98-45.255l-111.02 111.02c-11.716 11.715-11.716 30.711 0 42.426l159.81 159.81c11.715 11.716 30.71 11.716 42.426 0l111.01-111.02z" fill="var(--accent)"/>
                <path d="m39.79 1076.3c-23.172 7.33-44.992-14.49-37.656-37.66l73.756-232.96c6.7914-21.451 33.904-28.069 49.814-12.158l159.2 159.2c15.91 15.91 9.293 43.022-12.158 49.813l-232.96 73.76z" fill="var(--accent)"/>
            </svg>
        </div>
        `
        this.ui.actionButton = this.shadowRoot.getElementById("actionButton");
        this.ui.removeAction = this.shadowRoot.getElementById("removeAction");
        this.ui.timeArea = this.shadowRoot.getElementById("timeArea");
        this.ui.meridiemArea = this.shadowRoot.getElementById("meridiemArea");
        this.ui.dateArea = this.shadowRoot.getElementById("dateArea");
        this.ui.imgArea = this.shadowRoot.getElementById("imgArea");
    }
    linkAction(event){
        /*this.ui.timeArea.textContent = event.time;
        this.ui.dateArea.textContent = event.date;*/

        let date = new Date(Number(event.date))
        let time = date.toLocaleTimeString([], {hour: '2-digit', minute: "2-digit"});
        this.ui.timeArea.textContent = time.substring(0,5);
        this.ui.meridiemArea.textContent = time.substring(6);
        let string = tools.months[date.getMonth()].shortName + ", " + date.getDate();
        this.ui.dateArea.textContent = string;
        
        this.ui.imgArea.src = ui.faviconURL(event.actions[0].url);
        if(event.state == "scheduled"){
            this.shadowRoot.getElementById("statusIcon").innerHTML = `
            <path d="m246.15 34.862-96.58 96.58-55.154-55.154-29.698 29.699 85.459 85.459 124.65-124.65c15.903 23.81 25.175 52.426 25.175 83.207 0 82.843-67.157 150-150 150-82.843 0-150-67.157-150-150 0-82.843 67.157-150 150-150 36.586 0 70.113 13.098 96.147 34.862z" fill="var(--darkText)"/>
            `
        }else {
            this.shadowRoot.getElementById("statusIcon").innerHTML = `
            <path d="m34.309 55.822c-48.121 58.933-44.6 146.02 10.487 201.11 3.4332 3.433 6.9907 6.666 10.658 9.698l27.704-27.704-11.089-11.089 51.519-51.519-65.321-65.32 15.607-15.608-39.564-39.564zm55.01 231.93c55.302 24.963 122.53 14.792 167.88-30.556 3.166-3.166 6.16-6.438 8.983-9.806l-41.212-41.211-20.152 20.153-40.408-40.408-35.76 35.76 13.368 13.368-52.7 52.7zm199.15-76.26c19.202-43.809 16.429-94.968-8.296-136.77l-50.753 50.753-16.254-16.254-35.306 35.305 33.724 33.724 21.82-21.82 55.065 55.066zm-32.453-167.61c-53.075-52.194-135.18-57.124-193.52-14.723l56.725 56.724-17.881 17.88 29.471 29.47 59.701-59.701 17.925 17.925 47.576-47.576z" clip-rule="evenodd" fill="#935744" fill-rule="evenodd"/>
            `;
        }
        this.ui.actionButton.addEventListener("click", (e) => {
            if(this.ui.removeAction.contains(e.target) || this.ui.removeAction == e.target){
                ui.scheduleButtons.splice(ui.scheduleButtons.indexOf(this), 1);
                this.removeAction();
            }else{
                
            }
        })
    }
    removeAction() {
        data.removeScheduledAction(this.action);
        this.remove();
    }
}
customElements.define('scheduled-action', ScheduledAction);``
class uniQuery extends basicElement {
    constructor() {
        super();
        this.shadowRoot.innerHTML += `
        <link rel="stylesheet" href="styling.css">
        <style>
            *{
                margin: 0;
            }
            input{
                border: 3px solid var(--accentBorder);
                height: 50px;
                width: 100%;
                background-color: var(--secondary);
                color: var(--darkText);
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
        padding-bottom: 45px; border: 3px solid var(--accentBorder); background-color:var(--primary);">
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
    setQueryType(type) {
        if (this.ui.containedElements) {
            this.clearContext();
        }
        if (arguments[1]) {
            this.ui.title.textContent = arguments[1];
        }
        switch (type) {
            case ("text"):
                this.type = "text";
                let input = document.createElement("input");
                input.type = "text";
                this.ui.containedElements.push(input);
                this.ui.inputContainer.appendChild(input);
                break;
            case ("bool"):
                this.type = "bool";
                if (arguments[2]) {
                    let contextHeader = document.createElement("h5");
                    contextHeader.textContent = arguments[2];
                    this.ui.containedElements.push(contextHeader);
                    this.ui.inputContainer.appendChild(contextHeader);
                }
                break;
            case ("time"):
                this.type = "time";
                let clock = new clockInput();
                let date = new dateInput();
                clock.style = `width: 185px; height: 60px; position: relative; display:block;`;
                date.style  = `width: 185px; height: 40px; position: relative; display:block;`
                this.ui.containedElements.push(clock);
                this.ui.containedElements.push(date);
                this.ui.inputContainer.appendChild(clock);
                this.ui.inputContainer.appendChild(date);

                break;
        }
        this.ui.containerDiv
    }
    setMethods(complete) {
        let close = () => {
            complete(false);
            closeMethod();
        }
        let save = () => {
            switch(this.type) {
                case ("text"):
                    complete(true, this.ui.containedElements[0].value);
                    break;
                case ("bool"):
                    complete(true, true);
                    break;
                case ("time"):
                    let date = new Date();
                    let time = this.ui.containedElements[0].Data;
                    let dateValues = this.ui.containedElements[1].Data;
                    date.setHours(time[0]);
                    date.setMinutes(time[1]);
                    date.setDate(dateValues[1]);
                    date.setMonth(dateValues[0]);
                    date.setSeconds(0);
                    complete(true, date);
                    break;
            }
            closeMethod();
        }
        let keySave;
        if (this.type == "text") {
            keySave = (e) => {
                if (e.key == "Enter") {
                    save();
                }
            }
        }
        let closeMethod = () => {
            this.ui.acceptButton.removeEventListener("click", save);
            this.ui.quitButton.removeEventListener("click", close);
            if (this.type == "text") {
                this.ui.containedElements[0].removeEventListener("keypress", keySave);
            }
        };
        this.ui.quitButton.addEventListener("click", close);
        this.ui.acceptButton.addEventListener("click", save);
        if (this.type == "text") {
            this.ui.containedElements[0].addEventListener("keypress", keySave);
        }
    }
    clearContext() {
        this.ui.title.textContent = "";
        for (let element of this.ui.containedElements) {
            element.remove();
        }
        this.ui.containedElements = [];
    }
}
customElements.define("uni-query", uniQuery);
class clockInput extends basicElement {
    constructor() {
        super();
        this.shadowRoot.innerHTML = `
        <style>
            
            .inputArea {
                padding: 3.5px;
                border: 3px solid var(--accentBorder);
                background-color: var(--secondary);
                background-size: 400% 400%;
                animation: gradient 15s ease infinite;
                outline: none;
            }
            .timeContainer{
                background-color: var(--accent);
                border: none; 
                outline: none;
                font: 30px DM Sans, sans-serif;
                text-align: center;
                color: var(--darkText);
                height: 100%;
            }
            #clock{
                background-color: var(--secondary); 
                display: grid;
                grid-template-columns: calc(50% - 45px) 10px calc(50% - 45px) 80px;
                height: 100%;
                width: 100%;
                position: relative;
                box-sizing: border-box;
                align-items: center;
                justify-content: center;
            }
        </style>
        <div id="clock" class="inputArea">
            <input id="hourInput" type="text" class="timeContainer" minlength="1" maxlength="2">
            <h1 style="margin: 0px; 
            height: 40px; 
            font: 30px Arial, sans-serif; 
            text-align: center;">:</h1>
            <input id="minuteInput" type="text" class="timeContainer" minlength="1" maxlength="3" >
            <select class="timeContainer" id="meridiem" style="margin: 0; margin-left: 10px; width: 70px; font-weight: 700;">
                <option value="am" selected>AM</option>
                <option value="pm">PM</option>
            </select>
        </div>
        `
        this.ui.hourInput = this.shadowRoot.getElementById("hourInput");
        this.ui.minuteInput = this.shadowRoot.getElementById("minuteInput");
        this.ui.meridiem = this.shadowRoot.getElementById("meridiem");
        this.ui.hourInput.addEventListener("input", (e) => {
            this.ui.hourInput.value = tools.limitInput(e.target, 1, 12);
        });
        this.ui.hourInput.addEventListener("focusout", (e) => {
            if(e.target.value == ""){
                e.target.value = "1";
            }
        });
        this.ui.hourInput.addEventListener("input", (e) => {
            this.ui.hourInput.value = tools.limitInput(e.target, 0, 12);
        });
        this.ui.hourInput.addEventListener("focusout", (e) => {
            if(e.target.value == ""){
                e.target.value = "1";
            }
        });
        this.ui.minuteInput.addEventListener("input", (e) => {
            let value = tools.limitInput(e.target, 0, 59);
            if(value.length > 2){
                value = "0"+value;
            }
            e.target.value = value;
            console.log(this.Data);
        });
        this.ui.minuteInput.addEventListener("focusout", (e) => {
            if(e.target.value == ""){
                e.target.value = "00";
            }else if (e.target.value.length == 1){
                e.target.value = "0"+e.target.value;
            }
        });
    }
    get Data(){
        let hour = Number(this.ui.hourInput.value);
        if(this.ui.meridiem.value == 'pm' ){
            hour += 12;
        }
        return [hour, Number(this.ui.minuteInput.value)];
    }
}
customElements.define("clock-input", clockInput);
class dateInput extends basicElement {
    constructor() {
        super();
        this.shadowRoot.innerHTML = `
        <div id="calender" style="width: 100%; height: 100%;">
            <style>
                *{
                    color: var(--darkText);
                    font-family: 'DM Sans', sans-serif;
                    margin: 0;
                }
                .inputArea {
                    margin: 10px;
                    padding: 2px;
                    background-color: var(--accent);
                    border: none;
                    width: 150px;
                    height: 22px;
                    outline: none;
                    box-sizing: border-box;
                }
                .calEntry {
                    margin: 0px;
                    font: 15px Arial, sans-serif;
                    font-weight: bold;
                    text-align: center;
                    height: 100%;
                    background-color: var(--accent);
                }

                .calDate {
                    font: 20px Arial, sans-serif;
                    font-weight: normal;
                    background-color: transparent;
                    height: auto;
                }

                .pastDate {
                    color: var(--primary);
                }

                .tile {
                    background-color: rgba(196, 196, 196, 0.083);
                    height: 100%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    position: relative;
                }
                #calendarSelector{
                    border: 3px solid var(--accentBorder);
                    width: 300px;
                }
                #calGrid {
                    display: grid;
                    grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
                    grid-template-rows: 20px calc(16.666666% - 5px) calc(16.666666% - 5px) calc(16.666666% - 5px) calc(16.666666% - 5px) calc(16.666666% - 5px) calc(16.666666% - 5px);
                    height: 200px;
                    width: 100%;
                    border-radius: 0;
                    background-color: var(--secondary);
                    justify-content: center;
                    align-items: center;
                    padding: 0px; 
                    overflow: hidden; 
                    margin: 0;
                }

                #dateHeader {
                    display: grid;
                    grid-template-columns: 40px calc(100% - 80px) 30px;
                    background-color: var(--secondary);
                    padding: 0;
                    justify-content: center;
                    justify-items: center;
                    align-items: center;
                    border: 3px solid var(--accentBorder);
                    box-sizing: border-box;
                }

                #dateHeader select,
                input {
                    margin: 0;
                    width: auto;
                }
                .targetDate h1{
                    z-index: 1;
                }
                .targetDate::after {
                    content: "";
                    position: absolute;
                    width: calc(100% - 10px);
                    height: calc(100% - 10px);
                    margin: 5px;
                    background-color: var(--accent);
                    z-index: 0;
                }
            </style>
            <div id="dateHeader" style="width: 100%; height: 100%;">
                <input class="inputArea" type="text" id="day" minlength="1" maxlength="2" value="15"
                    style="width: 40px; margin: 0;">
                <select class="inputArea" id="months" style="margin: 0;">
                    <option value="0" >January</option>
                    <option value="1" >February</option>
                    <option value="2" >March</option>
                    <option value="3" >April</option>
                    <option value="4" >May</option>
                    <option value="5" >June</option>
                    <option value="6" >July</option>
                    <option value="7" >August</option>
                    <option value="8" >September</option>
                    <option value="9" >October</option>
                    <option value="10" >November</option>
                    <option value="11">December</option>
                </select>
                <div style="background-color: var(--accent); width: 25px; height: 22px;">
                    <svg id="calendarIcon" style="width: 25px;" viewBox="0 0 557 472" xmlns="http://www.w3.org/2000/svg">
                        <path d="M527 141H30V442H527V141ZM0 0V472H557V0H0Z" clip-rule="evenodd" fill="var(--darkText)" fill-rule="evenodd"/>
                        <path d="m315.5 232.5h134v134h-134v-134z" fill="var(--darkText)"/>
                    </svg>
                </div>
            </div>
            <div id="calendarSelector" style="visibility: hidden;">
                <div style="background-color: var(--primary)">
                    <div style="display: grid; grid-template-columns: 42px calc(100% - 84px) 42px; justify-items: center; align-items: center;">
                        <svg style="height: 25px; visibility: hidden;" fill="none" viewBox="0 0 686 1010" xmlns="http://www.w3.org/2000/svg">
                            <path d="m0.0042298 504.72c-0.13135 7.845 2.7964 15.731 8.7827 21.718l150.22 150.22c1.587 1.587 3.307 2.958 5.125 4.115l319.88 319.88c11.716 11.72 30.711 11.72 42.427 0l150.22-150.21c11.715-11.716 11.715-30.711 0-42.427l-303.29-303.29 303.29-303.29c11.716-11.715 11.716-30.71 0-42.426l-150.22-150.22c-11.716-11.716-30.71-11.716-42.426 0l-319.89 319.89c-1.817 1.156-3.537 2.528-5.123 4.114l-150.22 150.22c-5.9863 5.987-8.9141 13.873-8.7827 21.718z" clip-rule="evenodd" fill="var(--darkText)"/>
                        </svg>
                        <h1 id="monthHeader">September</h1>
                        <svg style="height: 25px; transform: rotate(180deg); visibility: hidden;" fill="none" viewBox="0 0 686 1010" xmlns="http://www.w3.org/2000/svg">
                            <path d="m0.0042298 504.72c-0.13135 7.845 2.7964 15.731 8.7827 21.718l150.22 150.22c1.587 1.587 3.307 2.958 5.125 4.115l319.88 319.88c11.716 11.72 30.711 11.72 42.427 0l150.22-150.21c11.715-11.716 11.715-30.711 0-42.427l-303.29-303.29 303.29-303.29c11.716-11.715 11.716-30.71 0-42.426l-150.22-150.22c-11.716-11.716-30.71-11.716-42.426 0l-319.89 319.89c-1.817 1.156-3.537 2.528-5.123 4.114l-150.22 150.22c-5.9863 5.987-8.9141 13.873-8.7827 21.718z" clip-rule="evenodd" fill="var(--darkText)"/>
                        </svg>
                    </div>
                    <div style="width: 100%; height: 3px; background-color: var(--accentBorder)"></div>
                </div>
                <div id="calGrid" class="inputArea" >
                    <h1 class="calEntry">S</h1>
                    <h1 class="calEntry">M</h1>
                    <h1 class="calEntry">T</h1>
                    <h1 class="calEntry">W</h1>
                    <h1 class="calEntry">T</h1>
                    <h1 class="calEntry">F</h1>
                    <h1 class="calEntry">S</h1>
                    <div class="tile" id="date1">
                        <h1 class="calEntry calDate">1</h1>
                    </div>
                    <div class="tile" id="date2">
                        <h1 class="calEntry calDate">2</h1>
                    </div>
                    <div class="tile" id="date3">
                        <h1 class="calEntry calDate">3</h1>
                    </div>
                    <div class="tile" id="date4">
                        <h1 class="calEntry calDate">4</h1>
                    </div>
                    <div class="tile" id="date5">
                        <h1 class="calEntry calDate">5</h1>
                    </div>
                    <div class="tile" id="date6">
                        <h1 class="calEntry calDate">6</h1>
                    </div>
                    <div class="tile" id="date7">
                        <h1 class="calEntry calDate">7</h1>
                    </div>
                    <div class="tile" id="date8">
                        <h1 class="calEntry calDate">8</h1>
                    </div>
                    <div class="tile" id="date9">
                        <h1 class="calEntry calDate">9</h1>
                    </div>
                    <div class="tile" id="date10">
                        <h1 class="calEntry calDate">10</h1>
                    </div>
                    <div class="tile" id="date11">
                        <h1 class="calEntry calDate">11</h1>
                    </div>
                    <div class="tile" id="date12">
                        <h1 class="calEntry calDate">12</h1>
                    </div>
                    <div class="tile" id="date13">
                        <h1 class="calEntry calDate">13</h1>
                    </div>
                    <div class="tile" id="date14">
                        <h1 class="calEntry calDate">14</h1>
                    </div>
                    <div class="tile" id="date15">
                        <h1 class="calEntry calDate ">15</h1>
                    </div>
                    <div class="tile" id="date16">
                        <h1 class="calEntry calDate ">16</h1>
                    </div>
                    <div class="tile" id="date17">
                        <h1 class="calEntry calDate ">17</h1>
                    </div>
                    <div class="tile" id="date18">
                        <h1 class="calEntry calDate ">18</h1>
                    </div>
                    <div class="tile" id="date19">
                        <h1 class="calEntry calDate ">19</h1>
                    </div>
                    <div class="tile" id="date20">
                        <h1 class="calEntry calDate ">20</h1>
                    </div>
                    <div class="tile" id="date21">
                        <h1 class="calEntry calDate ">21</h1>
                    </div>
                    <div class="tile" id="date22">
                        <h1 class="calEntry calDate ">22</h1>
                    </div>
                    <div class="tile" id="date23">
                        <h1 class="calEntry calDate ">23</h1>
                    </div>
                    <div class="tile" id="date24">
                        <h1 class="calEntry calDate ">24</h1>
                    </div>
                    <div class="tile" id="date25">
                        <h1 class="calEntry calDate ">25</h1>
                    </div>
                    <div class="tile" id="date26">
                        <h1 class="calEntry calDate ">26</h1>
                    </div>
                    <div class="tile" id="date27">
                        <h1 class="calEntry calDate ">27</h1>
                    </div>
                    <div class="tile" id="date28">
                        <h1 class="calEntry calDate ">28</h1>
                    </div>
                    <div class="tile" id="date29">
                        <h1 class="calEntry calDate ">29</h1>
                    </div>
                    <div class="tile" id="date30">
                        <h1 class="calEntry calDate ">30</h1>
                    </div>
                    <div class="tile" id="date31">
                        <h1 class="calEntry calDate ">31</h1>
                    </div>
                </div>
            </div>
        </div>
        `;
        this.targetDate = new Date();
        this.ui.calendarIcon = this.shadowRoot.getElementById("calendarIcon");
        this.ui.calGrid = this.shadowRoot.getElementById("calGrid");
        this.ui.calendarSelector = this.shadowRoot.getElementById("calendarSelector");
        this.ui.monthHeader = this.shadowRoot.getElementById("monthHeader");
        this.ui.months = this.shadowRoot.getElementById("months");
        this.ui.day = this.shadowRoot.getElementById("day");
        this.ui.calendarIcon.addEventListener("click", (e) => {
            if(this.ui.calendarSelector.style.visibility != "inherit"){
                this.ui.calendarSelector.style.visibility = "inherit"
            }else{
                this.ui.calendarSelector.style.visibility = "hidden"
            }
            
        });
        for(let i = 1; i < 32; i++){
            let current = this.shadowRoot.getElementById(`date${i}`);
            current.addEventListener("click", (e) => {
                this.setCurrent(current);
            });
        }

        this.initialize();
    }
    initialize(){
        let inserts = this.targetDate.getDay() - (this.targetDate.getDate() - 1) % 7;
        let numberOfDays = new Date(this.targetDate.getFullYear(), this.targetDate.getMonth() + 1, 0).getDate();
        console.log(numberOfDays)
        inserts = inserts < 0 ? 7 + inserts : inserts;
        for(let i = 0; i < inserts; i++){
            this.ui.calGrid.insertBefore(document.createElement("div"), this.ui.calGrid.children[7]);
        }
        for(let i = 1; i < this.targetDate.getDate(); i++){
            this.shadowRoot.getElementById(`date${i}`).children[0].classList.add("pastDate");
        }
        for(let i = 0; i < this.targetDate.getMonth(); i++){
            this.ui.months.options[i].disabled = true;
        }
        if(this.targetDate.getDate() + 14 < 32){
            for(let i = this.targetDate.getDate() + 14; i < 32; i++){
                this.shadowRoot.getElementById(`date${i}`).children[0].classList.add("pastDate");
            }
        }
        this.shadowRoot.getElementById(`date${this.targetDate.getDate()}`).classList.add("targetDate");
        this.ui.monthHeader.textContent = tools.months[this.targetDate.getMonth()].fullName;
        for(let i = 31; i > numberOfDays; i--){
            this.shadowRoot.getElementById(`date${i}`).remove();
        }
        this.ui.day.value = this.targetDate.getDate();
        this.ui.months.value = this.targetDate.getMonth();
    }
    setCurrent(element){
        if(element.children[0].classList.contains("pastDate") == false && element.classList.contains("targetDate") == false){
            this.shadowRoot.querySelectorAll(".targetDate").forEach(element => {
                element.classList.remove("targetDate");
            });
            element.classList.add("targetDate");
            this.targetDate.setDate(parseInt(element.children[0].textContent));
        }
    }
    get Data(){
        return [this.targetDate.getMonth(), this.targetDate.getDate()];
    }
}
customElements.define("date-input", dateInput);