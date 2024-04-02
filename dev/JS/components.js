import { ui, data } from "./index.js";
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
    limitInput: (input, min, max) => {
        console.log(input)
        let numberInput = Number(input);
        if (isNaN(numberInput)) {
            numberInput = Number(tools.makeNumber(input));
            console.log("number input is " + numberInput)
        }
        if (input == "") {
            return "";
        } else if (numberInput < min) {
            return min;
        } else if (numberInput > max) {
            return max;
        } else {
            return numberInput;
        }
    },
    getSelection: (target) => {
        if ((target.tagName == "INPUT" && target.type == "text") || target.tagName == "TEXTAREA") {
            return [target.selectionStart, target.selectionEnd]
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
    generateID: () => {
        return Math.floor(Math.random() * 1000000000);
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
        <div id="mainDiv" style="z-index: -1; opacity: 0; transition: opacity 0.25s ease; width: 100%; height: 100%; position: absolute; left:0; right:0; background-color: #00000091; pointer-events: none;"></div>
        `;
        this.ui.mainDiv = this.shadowRoot.getElementById("mainDiv");
    }
    blurFocus() {
        this.ui.mainDiv.style.zIndex = "100";
        this.ui.mainDiv.style.opacity = "1";
        this.ui.mainDiv.style.pointerEvents = "all";
    }
    returnFocus() {
        this.ui.mainDiv.style.opacity = "0";
        this.ui.mainDiv.style.pointerEvents = "none";
        setTimeout(() => { this.ui.mainDiv.style.zIndex = "-1"; }, 250);
    }
}

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
            border: 1px solid var(--accentBorder);
        }
        #svgButton{
            height: 100%;
            
        }
        #svgContainer:hover{
            background-color: var(--primary);
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

class ActionSet extends basicElement {
    constructor() {
        super();
        this.shadowRoot.innerHTML = `
      <div id="actionButton" style="background-color: transparent; height: 100%; width: 100%; position: relative; z-index: 1;">
        <svg id="deleteAction" style="position: absolute; left: 5px; top: 5px; height: 20px; z-index: 1;" fill="none" viewBox="0 0 211 212" xmlns="http://www.w3.org/2000/svg">
            <path d="m2.3865 168.46c-2.4619 2.462-2.4619 6.453 0 8.915l32.095 32.095c2.462 2.462 6.4535 2.462 8.9155 0l62.358-62.357 62.358 62.357c2.462 2.462 6.454 2.462 8.915 0l32.096-32.095c2.462-2.462 2.462-6.453 0-8.915l-62.358-62.358 62.358-62.358c2.462-2.4619 2.462-6.4534 0-8.9154l-32.096-32.095c-2.462-2.4619-6.453-2.4619-8.915 0l-62.358 62.358-62.358-62.358c-2.462-2.4619-6.4533-2.4619-8.9153 0l-32.095 32.095c-2.4619 2.462-2.4619 6.4535 0 8.9154l62.358 62.358-62.358 62.358z" fill="var(--accentBorder)"/>
        </svg>
      
        <div style="position: absolute; height: 100%; width: 100%; display:grid; justify-items: center; align-items: center; grid-template-rows: calc(100% - 30px) 30px;">
            <div style="background-color: var(--accent);padding: 17.5px;border: 1px solid var(--accentBorder);">
                <img id="imgArea" style=" filter: grayscale(50%);">
            </div>
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
            }else */if (this.ui.deleteAction.contains(e.target)) {
                ui.getBool("Delete Action?", `Do you want to delete the ${this.action.name} action` + action.name).then((bool) => {
                    console.log("boolean got: " + bool)
                    if (bool) {
                        this.removeAction();
                    }
                });
                console.log("deleting Action Set")

            } else {
                console.log("run action set")
                /*chrome.runtime.sendMessage({ action: "runActionSet", set: action }, (response) => {

                });*/
                ui.getTime("When?").then((dateRet) => {
                    if (typeof dateRet != "Date" && dateRet === "now") {
                        chrome.runtime.sendMessage({ action: "runActionSet", set: action }, (response) => {

                        });
                    } else {
                        let event = {
                            id: tools.generateID(),
                            name: this.action.name,
                            actions: this.action.actions,
                            date: dateRet.getTime(),
                            state: "scheduled",
                        }
                        data.scheduledEvents.push(event);
                        chrome.runtime.sendMessage({ action: "scheduleActionSet", set: event }, (response) => {
                            if (response.log != "added") {
                                throw new Error("Failed to add scheduled Action");
                            }
                        });
                        ui.createTimeEntry(event)
                    }

                });
            }
        });
    }
    removeAction() {
        data.removeAction(this.action);
        this.remove();
    }
}

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
                    <svg id="statusIcon" style="height: 25px;" fill="none" viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">
                        
                    </svg>                        
                    <h2 id="timeArea" style="font-family: 'DM Sans', sans-serif; font-size: 40px; margin: -10px 0; color: var(--darkText); height: 45px; ">12:30</h2>
                    <h3 id="meridiemArea" style="margin: 3px; color: var(--darkText); font-size: 20px"></h3>
                    <h3 id="dateArea" style="font-family: 'DM Sans', sans-serif; font-weight: 300; margin: 3px 0px 3px 3px; font-size: 20px; color: var(--darkText); direction: rtl; position: absolute; right: 0px; bottom: 0px;">Apr, 1</h3>
                </div>
                <img id="imgArea" style="width:35px;background-color: var(--accent);padding: 17.5px;border: 1px solid var(--accentBorder); filter: grayscale(50%);" src="icon.png">
                
            </div>
            
            <svg id="editButton" style="position: absolute; right: 5px; top: 5px; height: 20px; visibility: hidden;" viewBox="0 0 1079 1078" xmlns="http://www.w3.org/2000/svg">
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
    linkAction(event) {
        /*this.ui.timeArea.textContent = event.time;
        this.ui.dateArea.textContent = event.date;*/
        this.event = event;
        let date = new Date(Number(event.date))
        let time = date.toLocaleTimeString([], { hour: '2-digit', minute: "2-digit" });
        this.ui.timeArea.textContent = time.substring(0, 5);
        this.ui.meridiemArea.textContent = time.substring(6);
        let string = tools.months[date.getMonth()].shortName + ", " + date.getDate();
        this.ui.dateArea.textContent = string;

        this.ui.imgArea.src = ui.faviconURL(event.actions[0].url);
        this.setIcon(event.state);
        this.ui.actionButton.addEventListener("click", (e) => {
            if (this.ui.removeAction.contains(e.target) || this.ui.removeAction == e.target) {
                ui.scheduleButtons.splice(ui.scheduleButtons.indexOf(this), 1);
                this.removeAction();
            }
        })
    }
    setIcon(state) {
        if (state == "scheduled") {
            this.shadowRoot.getElementById("statusIcon").innerHTML = `
            <path d="m53.853 265.14 96.58-96.58 55.154 55.154 29.699-29.699-85.459-85.459-124.65 124.65c-15.903-23.81-25.175-52.426-25.175-83.207 0-82.843 67.157-150 150-150 82.843 0 150 67.157 150 150 0 82.843-67.157 150-150 150-36.586 0-70.113-13.099-96.147-34.862z" fill="var(--darkText)"/>
            `
        } else if (state == "failed") {
            this.shadowRoot.getElementById("statusIcon").innerHTML = `
            <path d="m34.309 55.822c-48.121 58.933-44.6 146.02 10.487 201.11 3.4332 3.433 6.9907 6.666 10.658 9.698l27.704-27.704-11.089-11.089 51.519-51.519-65.321-65.32 15.607-15.608-39.564-39.564zm55.01 231.93c55.302 24.963 122.53 14.792 167.88-30.556 3.166-3.166 6.16-6.438 8.983-9.806l-41.212-41.211-20.152 20.153-40.408-40.408-35.76 35.76 13.368 13.368-52.7 52.7zm199.15-76.26c19.202-43.809 16.429-94.968-8.296-136.77l-50.753 50.753-16.254-16.254-35.306 35.305 33.724 33.724 21.82-21.82 55.065 55.066zm-32.453-167.61c-53.075-52.194-135.18-57.124-193.52-14.723l56.725 56.724-17.881 17.88 29.471 29.47 59.701-59.701 17.925 17.925 47.576-47.576z" clip-rule="evenodd" fill="#935744" fill-rule="evenodd"/>
            `;
        } else if (state == "completed") {
            this.shadowRoot.getElementById("statusIcon").innerHTML = `
            <path d="m246.15 34.862-96.58 96.58-55.154-55.154-29.698 29.699 85.459 85.459 124.65-124.65c15.903 23.81 25.175 52.426 25.175 83.207 0 82.843-67.157 150-150 150-82.843 0-150-67.157-150-150 0-82.843 67.157-150 150-150 36.586 0 70.113 13.098 96.147 34.862z" fill="#42870B"/>
            `
        }
    }
    removeAction() {
        data.removeScheduledAction(this.event);
        this.remove();
    }
}

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
                border: 1px solid var(--accentBorder);
                height: 50px;
                width: 100%;
                background-color: var(--secondary);
                color: var(--darkText);
                outline: none;
                padding: 0 5px 0 5px;
                font-size: 25px;
                box-sizing: border-box;
            }
            .handlerButtons{
                height: 35px; 
                aspect-ratio:1; 
                position: relative; 
                display: block; 
            }
            button{
                border: 1px solid var(--accentBorder);
                background-color: var(--secondary);
                color: var(--darkText);
                font-family: 'DM Sans', sans-serif;
                font-weight: 800;
            }
            button:hover{
                background-color: var(--primary);
            }
        </style>
        <div
        style="position: relative; height: fit-content; width: fit-content;
        z-index: 100; padding: 10px; transition: 0.25s ease; box-sizing: border-box; 
        padding-bottom: 45px; border: 1px solid var(--accentBorder); background-color:var(--primary);">
                <h2 id="title" style="margin: 0 0 5px 0;">Alert</h2>
                <div id="inputContainer" style="display:grid; justify-content: center; align-items: center;">
                
                </div>
                <div style="height: 35px; display: flex; gap: 5px; position: absolute; right: 5px; bottom: 5px;">
                    <button-generic id="acceptButton" class="handlerButtons">
                        <svg fill="none" viewBox="0 0 1324 1033" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="m1162 8.7868c-11.71-11.716-30.71-11.716-42.42-1e-5l-646.5 646.5-269.08-269.08c-11.715-11.716-30.71-11.716-42.426 0l-152.74 152.74c-11.716 11.716-11.716 30.711-1e-5 42.427l442.74 442.74c5.932 5.93 13.732 8.86 21.507 8.78 7.771 0.08 15.565-2.85 21.495-8.78l820.16-820.16c11.71-11.715 11.71-30.71 0-42.426l-152.74-152.74z"
                                fill="var(--darkText)" />
                        </svg>
                    </button-generic>
                    <button-generic id="quitButton" class="handlerButtons">
                        <svg fill="none" viewBox="0 0 1002 1002" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9.21265 797.872C-2.50317 809.588 -2.50317 828.583 9.21265 840.299L161.948 993.034C173.664 1004.75 192.659 1004.75 204.375 993.034L501.123 696.285L797.872 993.034C809.588 1004.75 828.583 1004.75 840.298 993.034L993.033 840.299C1004.75 828.583 1004.75 809.588 993.033 797.872L696.284 501.124L993.033 204.375C1004.75 192.659 1004.75 173.664 993.033 161.948L840.299 9.2132C828.583 -2.50238 809.588 -2.50238 797.872 9.2132L501.123 305.962L204.374 9.2132C192.658 -2.50238 173.664 -2.50238 161.948 9.2132L9.21265 161.948C-2.50317 173.664 -2.50317 192.659 9.21265 204.375L305.962 501.124L9.21265 797.872Z" fill="var(--darkText)" />
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
                    let contextHeader = document.createElement("p");
                    contextHeader.innerHTML = arguments[2];
                    contextHeader.style = `margin: 5px; font-size: 20px; color: var(--darkText); max-width: 300px; max-height: 200px; overflow: auto;`
                    this.ui.containedElements.push(contextHeader);
                    this.ui.inputContainer.appendChild(contextHeader);
                }
                break;
            case ("time"):
                this.type = "time";
                let date = new dateInput();
                date.style = `width: 235px; height: fit-content; position: relative; display:block;`
                this.ui.containedElements.push(date);
                this.ui.inputContainer.appendChild(date);
                let nowButton = document.createElement("button");
                nowButton.textContent = "Now";
                nowButton.style = `width: 70px; height: 35px; position: absolute; bottom: 5px; left: 5px;`
                this.ui.containedElements.push(nowButton);
                this.ui.inputContainer.appendChild(nowButton);
                break;
        }
        this.ui.containerDiv
    }
    setMethods(complete) {
        let close = () => {
            if(this.type == "bool"){
                complete(true, false);
            }else{
                complete(false);
            }
            
            closeMethod();
        }
        let save = () => {
            switch (this.type) {
                case ("text"):
                    complete(true, this.ui.containedElements[0].value);
                    break;
                case ("bool"):
                    complete(true, true);
                    break;
                case ("time"):
                    let date = new Date();
                    let data = this.ui.containedElements[0].Data;
                    date.setHours(data.hour);
                    date.setMinutes(data.minute);
                    date.setDate(data.day);
                    date.setMonth(data.month);
                    /*let time = this.ui.containedElements[0].Data;
                    let dateValues = this.ui.containedElements[1].Data;
                    date.setHours(time[0]);
                    date.setMinutes(time[1]);
                    date.setDate(dateValues[1]);
                    date.setMonth(dateValues[0]);
                    date.setSeconds(0);*/
                    complete(true, date, false);
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
        } else if (this.type == "time") {
            this.ui.containedElements[1].addEventListener("click", () => { complete(true, new Date(), true) });

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

class clockInput extends basicElement {
    constructor() {
        super();
        this.shadowRoot.innerHTML = `
        <style>
            ::placeholder{
                color: var(--darkText);
                opacity: 0.4;
            }
            .inputArea {
                padding: 3.5px;
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
        this.locked = true;
        this.ui.hourInput = this.shadowRoot.getElementById("hourInput");
        this.ui.minuteInput = this.shadowRoot.getElementById("minuteInput");
        this.ui.meridiem = this.shadowRoot.getElementById("meridiem");
        this.clock = {}
        this.clock.minHour = 1;
        this.clock.minMin = 1;
        this.clock.current;
        this.clock.interval = setInterval(this.updateTime.bind(this), 1000)
        this.addEventListener("keyup", (e) => {
            if (e.key == "Enter") {
                if (this.ui.hourInput.contains(e.target)) {
                    this.ui.minuteInput.focus();
                } else if (this.ui.minuteInput.contains(e.target)) {
                    this.triggerEnter();
                }
            }
        });
        this.ui.hourInput.addEventListener("focusout", (e) => {
            this.checkHour();
        });
        this.ui.minuteInput.addEventListener("focusout", (e) => {
            this.checkMin();
        });
        this.ui.meridiem.addEventListener("change", (e) => {
            if(this.ui.hourInput.value != ""){
                this.checkHour();
            }
            
        });
        this.updateTime();
    }
    updateTime() {
        if (this.locked) {
            this.clock.current = new Date();
            if (this.clock.current.getHours() > 12) {
                this.clock.minHour = this.clock.current.getHours() - 12;
                this.ui.meridiem.options[0].disabled = true;
                this.ui.meridiem.value = "pm";
            } else if (this.clock.current.getHours() === 0) {
                this.clock.minHour = 12;
            } else {
                this.clock.minHour = this.clock.current.getHours();
            }
            this.ui.hourInput.placeholder = this.clock.minHour;
            this.clock.minMin = this.clock.current.getMinutes();
            if (("" + this.clock.minMin).length == 1) {
                this.ui.minuteInput.placeholder = "0" + this.clock.minMin;
            } else {
                this.ui.minuteInput.placeholder = "" + this.clock.minMin;
            }
        }else{
            this.clock.minHour = 1;
            this.clock.minMin = 1;
            this.ui.hourInput.placeholder = "";
            this.ui.minuteInput.placeholder = "";
            this.ui.meridiem.options[0].disabled = false;
        }

    }
    checkHour() {
        if (this.ui.hourInput.value == "") {
            this.ui.hourInput.value = this.clock.minHour;
        } else {
            let hour = Number(this.ui.hourInput.value);
            this.ui.meridiem.value == "pm" ? hour += 12 : hour;
            if (this.locked) {
                hour = tools.limitInput(hour, this.clock.minHour, 23);
            } else {
                hour = tools.limitInput(hour, 0, 23);
            }

            console.log("calculated", hour)
            if (hour > 12) {
                hour -= 12;
            } else if (hour == 0) {
                hour = 12;
            }
            this.ui.hourInput.value = hour;
        }
    }
    checkMin() {
        let minute;
        if (this.clock.minHour === Number(this.ui.hourInput.value) && !this.locked) {
            minute = tools.limitInput(this.ui.minuteInput.value, this.clock.minMin, 59);
        } else {
            minute = tools.limitInput(this.ui.minuteInput.value, 0, 59);
        }
        if (("" + minute).length == 1) {
            this.ui.minuteInput.value = "0" + minute;
        } else {
            this.ui.minuteInput.value = minute;
        }
    }
    get Data() {
        let hour;
        let minute;
        if (this.ui.hourInput.value != "") {
            hour = Number(this.ui.hourInput.value);
        } else {
            hour = this.clock.minHour;
        }
        if (this.ui.minuteInput.value != "") {
            minute = Number(this.ui.minuteInput.value);
        } else {
            minute = this.clock.minMin;
        }
        if (this.ui.meridiem.value == 'pm') {
            hour += 12;
        }
        return [hour, minute];
    }
}

class dateInput extends basicElement {
    constructor() {
        super();
        this.shadowRoot.innerHTML = `
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
                    pointer-events: none;
                }
                .calDay{
                    background-color: var(--accentBorder);
                }
                .calDate {
                    font: 20px Arial, sans-serif;
                    font-weight: normal;
                    background-color: transparent;
                }

                .pastDate {
                    color: var(--primary);
                }

                .tile {
                    padding: 2px;
                    height: 100%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    position: relative;
                }
                #calendarSelector{
                    width: 100%;
                    height: fit-content;
                    box-sizing: border-box;
                }
                #calGrid {
                    display: grid;
                    grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
                    grid-template-rows: 20px calc(16.666666% - 3.3333px) calc(16.666666% - 3.3333px) calc(16.666666% - 3.3333px) calc(16.666666% - 3.3333px) calc(16.666666% - 3.3333px) calc(16.666666% - 3.3333px);
                    height: fit-content;
                    width: 100%;
                    border-radius: 0;
                    background-color: var(--secondary);
                    justify-content: center;
                    align-items: center;
                    padding: 0px; 
                    overflow: hidden; 
                    margin: 0;
                }

                select,
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
                    width: 100%;
                    height: 100%;
                    margin: 5px;
                    background-color: var(--accent);
                    z-index: 0;
                }
            </style>
            
            <div id="calendarSelector" >
                <div style="background-color: var(--primary)">
                    <div style="display: grid; grid-template-columns: calc(100% - 42px) 42px; justify-items: center; align-items: center; padding: 2.5px; background-color:var(--secondary)">
                        <clock-input id="clockElement" style="width: 100%;"></clock-input>
                        <svg style="height: 25px; transform: rotate(180deg); visibility: hidden;" fill="none" viewBox="0 0 686 1010" xmlns="http://www.w3.org/2000/svg">
                            <path d="m0.0042298 504.72c-0.13135 7.845 2.7964 15.731 8.7827 21.718l150.22 150.22c1.587 1.587 3.307 2.958 5.125 4.115l319.88 319.88c11.716 11.72 30.711 11.72 42.427 0l150.22-150.21c11.715-11.716 11.715-30.711 0-42.427l-303.29-303.29 303.29-303.29c11.716-11.715 11.716-30.71 0-42.426l-150.22-150.22c-11.716-11.716-30.71-11.716-42.426 0l-319.89 319.89c-1.817 1.156-3.537 2.528-5.123 4.114l-150.22 150.22c-5.9863 5.987-8.9141 13.873-8.7827 21.718z" clip-rule="evenodd" fill="var(--darkText)"/>
                        </svg>
                    </div>
                    <div style="width: 100%; height: 4px; background-color: var(--primary)"></div>
                </div>
                <div id="calGrid" class="inputArea" >
                    <h1 class="calEntry calDay">S</h1>
                    <h1 class="calEntry calDay">M</h1>
                    <h1 class="calEntry calDay">T</h1>
                    <h1 class="calEntry calDay">W</h1>
                    <h1 class="calEntry calDay">T</h1>
                    <h1 class="calEntry calDay">F</h1>
                    <h1 class="calEntry calDay">S</h1>
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
        `;
        this.targetDate = new Date();
        this.ui.clockElement = this.shadowRoot.getElementById("clockElement");
        this.ui.calGrid = this.shadowRoot.getElementById("calGrid");
        this.ui.calendarSelector = this.shadowRoot.getElementById("calendarSelector");
        this.ui.calGrid.addEventListener("click", (e) => {
            if (e.target.id.substring(0, 4) == "date") {
                this.setCurrent(e.target);
            }
        });

        this.initialize();
    }
    initialize() {
        let inserts = this.targetDate.getDay() - (this.targetDate.getDate() - 1) % 7;
        let numberOfDays = new Date(this.targetDate.getFullYear(), this.targetDate.getMonth() + 1, 0).getDate();
        console.log(numberOfDays)
        inserts = inserts < 0 ? 7 + inserts : inserts;
        for (let i = 0; i < inserts; i++) {
            this.ui.calGrid.insertBefore(document.createElement("div"), this.ui.calGrid.children[7]);
        }
        console.log(this.targetDate.getDate)
        for(let i = 1; i <= 31; i++){
            if(i < this.targetDate.getDate()){
                this.shadowRoot.getElementById(`date${i}`).children[0].classList.add("pastDate");
            }else if(i > this.targetDate.getDate() && i < this.targetDate.getDate() + 14){
                this.shadowRoot.getElementById(`date${i}`).addEventListener("click", (e) => {
                    this.ui.clockElement.locked = false;
                });
            }else if (i >= this.targetDate.getDate() + 14){
                this.shadowRoot.getElementById(`date${i}`).children[0].classList.add("pastDate");
            }else if (i > numberOfDays){
                this.shadowRoot.getElementById(`date${i}`).remove();
                i--;
            }else if(i == this.targetDate.getDate()){
                this.shadowRoot.getElementById(`date${i}`).addEventListener("click", (e) => {
                    console.log("Today")
                    this.ui.clockElement.locked = true;
                    this.ui.clockElement.updateTime();
                });
            }
        }
        this.shadowRoot.getElementById(`date${this.targetDate.getDate()}`).classList.add("targetDate");
        /*for (let i = 1; i < this.targetDate.getDate(); i++) {
            this.shadowRoot.getElementById(`date${i}`).children[0].classList.add("pastDate");
        }
        for (let i = 0; i < this.targetDate.getMonth(); i++) {
            this.ui.months.options[i].disabled = true;
        }
        if (this.targetDate.getDate() + 14 < 32) {
            for (let i = this.targetDate.getDate() + 14; i < 32; i++) {
                this.shadowRoot.getElementById(`date${i}`).children[0].classList.add("pastDate");
            }
        }
        this.shadowRoot.getElementById(`date${this.targetDate.getDate()}`).classList.add("targetDate");
        for (let i = 31; i > numberOfDays; i--) {
            this.shadowRoot.getElementById(`date${i}`).remove();
        }*/
        this.ui.today = this.shadowRoot.getElementById(`date${this.targetDate.getDate()}`);
        //this.ui.day.value = this.targetDate.getDate();
        //this.ui.months.value = this.targetDate.getMonth();
    }
    setCurrent(element) {
        if (element.children[0].classList.contains("pastDate") == false && element.classList.contains("targetDate") == false) {
            this.shadowRoot.querySelectorAll(".targetDate").forEach(element => {
                element.classList.remove("targetDate");
            });
            element.classList.add("targetDate");
            this.targetDate.setDate(parseInt(element.children[0].textContent));
        }
    }
    get Data() {
        let clockData = this.ui.clockElement.Data;
        return {
            minute: clockData[1],
            hour: clockData[0],
            day: this.targetDate.getDate(),
            month: this.targetDate.getMonth()

        };
    }
}
class errorMessage extends basicElement{
    constructor(){
        super();
        this.shadowRoot.innerHTML += `
        <div style="display:grid; justify-content: center;">
            <div style="background-color: Tomato; width: fit-content; height: 40px; display:grid; align-content:center; padding: 0 10px 0 10px; border: 1px solid #c94e38; ">
                <h3 id="message" >Choose an Original Name</h3>
            </div>
        </div>
        `
        this.ui.message = this.shadowRoot.getElementById("message")
    }
    /**
     * @param {string} text
     */
    set message(text){
        this.ui.message.innerText = text;
    }
}
export {backgroundDiv, ButtonGeneric, ActionSet, ScheduledAction, uniQuery, clockInput, dateInput,errorMessage}