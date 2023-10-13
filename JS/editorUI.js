let colors = {
    primary: "#1b1b1f",
    secondary: "#424658",
    accentBorder: "#252f53",
    accent: "#364478",
    accent2: "#5b3d56",
    highlight: "#5b3d56",
    text: "#bbc6ff",
}
let delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
class basicElement extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' })
        this.ui = {};
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
            border: 2px solid ${colors.accentBorder};
            height: 75px;
            background-image: linear-gradient(45deg, ${colors.accent}, ${colors.accent2});
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
            border: 2px solid ${colors.accentBorder};
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
            color: ${colors.text};
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
        this.action = action;
        let element
        let startA;
        let returnA;
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
            startA = (element) => {
                //ui.highlight.style.visibility = "visible";
                //ui.highlight.style.zIndex = "2100000000";
                let highElem = data.getElement(element);
                highElem.classList.add("highlightElem");
            },
                returnA = (element) => {
                    //ui.highlight.style.visibility = "hidden";
                    //ui.highlight.style.zIndex = "-1";
                    let highElem = data.getElement(element);
                    highElem.addEventListener("animationiteration", () => {
                        highElem.classList.remove("highlightElem");
                    }, { once: true });

                }
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
            ui.highlightElement(this.action.specifier)
            //****Add method before implementation */
            /*chrome.runtime.sendMessage({ action: "highlight", url: action.location, target: action.specifier }, (response) => {
                if (response.log == "highlighted") {
                    console.log("highlighted")
                } else {
                    throw new Error("Failed to highlight")
                }
            });*/
        });
        this.ui.displayText.addEventListener("mouseout", async () => {
            ui.returnElement(this.action.specifier)
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
        this.elemType = "spacer";
        this.shadowRoot.innerHTML = `
        <style>
            #indicator{
                background-color: ${colors.secondary};
                height: 5px; 
                width: 70px; 
                border-radius: 25px;
                z-index: 0;
                visibility: hidden;
            }
            @keyframes close {
                0% {
                    width: 70px;
                    background-color: ${colors.secondary};
                }
                40%{
                    width: 5px;
                    background-color: ${colors.accent2};
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
class entrySpacer extends InputSpacer {
    constructor() {
        super();
        this.elemType = "spacer";
        this.shadowRoot.innerHTML += `
            <style>
            @keyframes close {
                0% {
                    width: 100px;
                    background-color: ${colors.secondary};
                }
                40%{
                    width: 45px;
                    background-color: ${colors.accent2};
                    opacity: 1;
                    
                }
                60%{
                    transform: translateY(0px);
                }
                100%{
                    width: 45px;
                    opacity: 0;
                    transform: translateY(-32.5px);
                }
            }
                #iconSvg{
                    height: 35px;
                    aspect-ratio: 1;
                    padding: 5px;
                    box-sizing: border-box;
                    flex-shrink: 0;
                }
                #entryTitle{
                    font-size: 20px; 
                    font-weight: 500; 
                    opacity: 0;
                    position: absolute;
                    transition: all 0.25s ease;
                }
                #indicator{
                    height : 45px;
                    max-width: 300px;
                    width: fit-content;
                    display: inline-flex;
                    justify-content: center;
                    align-items: center;
                    border: 2px solid ${colors.accentBorder};
                }
            </style>
        `;
        this.indicator = this.shadowRoot.getElementById("indicator");

    }
    open() {
        super.open();
        /*this.indicator.style.visibility = "inherit";
        this.indicator.style.width = "45px";*/

        setTimeout(() => {
            this.shadowRoot.getElementById("entryTitle").style.position = "relative";
            this.shadowRoot.getElementById("entryTitle").style.opacity = "1";
            this.shadowRoot.getElementById("indicator").style.padding = "0 5px 0 5px";
        }, 500);
    }
    setType(type, url) {
        this.indicator.innerHTML = `
            ${type == "newTab" ? `
                <svg id="iconSvg" fill="none" viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg">
                    <path d="m50 0h200v75h-150c-13.807 0-25 11.193-25 25v300c0 13.807 11.193 25 25 25h300c13.807 0 25-11.193 25-25v-150h75v200c0 27.614-22.386 50-50 50h-400c-27.614 0-50-22.386-50-50v-400c0-27.614 22.386-50 50-50zm261 0v75h60.563l-153.48 153.49 53.033 53.033 153.89-153.89v61.37h75v-139c0-27.614-22.386-50-50-50h-139z" clip-rule="evenodd" fill="#bbc6ff" fill-rule="evenodd"/>
                </svg>
            ` :
                `
                <svg id="iconSvg" viewBox="0 0 581 582" xmlns="http://www.w3.org/2000/svg">
                    <path d="m540.63 41.119c53.637 53.638 53.637 140.6 0 194.24l-116.31 116.31-57.58-57.581 116.31-116.31c21.837-21.836 21.837-57.24 0-79.077-21.836-21.837-57.24-21.837-79.077 0l-116.31 116.31-57.58-57.58 116.31-116.31c53.637-53.637 140.6-53.638 194.24-1e-4z" fill="#bbc6ff"/>
                    <path d="m40.652 541.14c-53.637-53.638-53.637-140.6 0-194.24l116.31-116.31 57.58 57.58-116.31 116.31c-21.837 21.837-21.837 57.241 0 79.077 21.836 21.837 57.24 21.837 79.077 0l116.31-116.31 57.58 57.58-116.31 116.31c-53.637 53.637-140.6 53.637-194.24 0z" fill="#bbc6ff"/>
                </svg>
            `}
            <h2 id="entryTitle">${document.title}</h2>
        `
    }
}
customElements.define('entry-spacer', entrySpacer)
class ActionEditor extends basicElement {
    constructor() {
        super();
        this.shadowRoot.innerHTML = `
        <style>
        * {
            color: #bbc6ff;
            background-color: #1b1b1f;
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
        .entry-spacer{
            height: 60px;
            display: block;
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
          .entry {
            display: flex;
            justify-content: center;
            align-items: center;
            width: 100%;
            position: relative;
            transition: all 0.5s ease;
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
            <button-generic id="editSave" style="height: 35px; aspect-ratio:1; position: relative; display: block; ">
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
            editBack: this.shadowRoot.getElementById("editBack"),
            editSave: this.shadowRoot.getElementById("editSave"),
        }
    }
    openEditor(actionSet) {
        this.ui.editNameEntry.value = actionSet.name;
        for (let action of actionSet.actions) {
            if (action.action != "newTab" && action.action != "newUrl") {
                if (actionSet.actions[0] != action && this.ui.editEntryContainer.lastChild.elemType != "spacer") {
                    let spacer = document.createElement("input-spacer");
                    this.ui.editEntryContainer.appendChild(spacer);
                }
                let actionEntry = new InputEntry();
                actionEntry.set(action)
                actionEntry.classList.add("entry");
                this.ui.editEntryContainer.appendChild(actionEntry);
            } else {
                let spacer = document.createElement("entry-spacer");
                spacer.setType(action.action, action.url);
                spacer.classList.add("entry-spacer");
                this.ui.editEntryContainer.appendChild(spacer);
            }
        }
        //this.ui.
        if(ui.editor != undefined){
            ui.editor.style.marginRight = "0px"; 
        }
        this.ui.editBack.addEventListener("click", this.closeEditor);
        this.ui.editSave.addEventListener("click", this.saveEdit);
        this.showEntry();
    }
    closeEditor() {
        ui.editor.style.marginRight = "-500px";
        this.ui.editBack.removeEventListener("click", this.closeEditor);
        this.ui.editSave.removeEventListener("click", this.saveEdit);
    }
    saveEdit(){
        data.port.postMessage({ action: "saveEditor" });
    }
    async showEntry() {
        let entryChildren = [...this.ui.editEntryContainer.childNodes];
        for (let child of entryChildren) {
            console.log(child)
            if (child.open) {
                child.open();
            }

            await delay(60);
        }
    }
}
customElements.define('editor-view', ActionEditor)
ui.editor = document.createElement("editor-view");
ui.editor.style.marginRight = "0px";
ui.editor.style = `position: fixed; bottom: 10px; right: 10px; width: 400px; height: 500px; border-radius: 25px; z-index: 10000000000; overflow: hidden; border: 2px solid #252f53; transition: margin-right 0.5s ease; margin-right: -500px;`
document.body.appendChild(ui.editor);
