let data = {
  actionsData: [],
  saveActionList(){
    chrome.storage.local.set({ "actionSets": this.actionsData });
  },
  addAction(action){
    if(this.actionsData.length >= 10){
      this.actionsData.pop();
    }
    this.actionsData.unshift(action);
    createActionEntry(action);
    this.saveActionList();
  },
  removeAction(action){
    this.actionsData.splice(this.actionsData.indexOf(action), 1);
    this.saveActionList();
  },
  clearActionList(){
    //Currently set for debugging purposes
    chrome.storage.local.clear(function() {
      var error = chrome.runtime.lastError;
      if (error) {
        console.error(error);
      }
      });
    /* Proper code
    chrome.storage.local.set({ "actionSets": [] });
    */
    for(let act of ui.actionButtons){
      act.remove();
    }
  }
}
let ui = {
  recordStart: document.getElementById('recordStart'),
  recordStop: document.getElementById('recordStop'),
  clearHistory: document.getElementById('clearHistory'),
  actionButtons: []
};
class ActionSet extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
    <div id="actionButton" style="background-color: transparent; height: 100%; width: 100%; position: relative; display:grid;justify-content: center;align-items: center; grid-auto-flow: column; gap: 10px;">
      <img id="imgArea" style="border-radius: 50%;background-color: var(--primary);border: 2px solid var(--accentBorder);">
      <h2 id="nameArea"></h2>
    </div>
    `;
  }
  faviconURL(u) {
    const url = new URL(chrome.runtime.getURL("/_favicon/"));
    url.searchParams.set("pageUrl", u);
    url.searchParams.set("size", "32");
    return url.toString();
  }
  linkAction(action) {
    this.action = action
    this.shadowRoot.getElementById("nameArea").innerText = action.name;
    this.shadowRoot.getElementById("imgArea").src = this.faviconURL(action.originURL[0]);
    this.shadowRoot.getElementById("actionButton").addEventListener("click", () => {
      chrome.runtime.sendMessage({ action: "runActionSet", set:action}, (response) =>{

      });
    });
  }
  removeAction(){
    data.removeAction(this.action);
    this.remove();
  }
}
window.customElements.define('action-set', ActionSet);
chrome.storage.local.get(["actionSets"]).then((result) => {
  console.log(result)
  data.actionsData = result.actionSets == undefined ? [] : result.actionSets;
  if (result.actionSets != undefined || Array.isArray(result.actionSets)) {
    for (let action of data.actionsData.reverse()) {
      createActionEntry(action);
    }
  }
});
chrome.storage.local.get(["recording"]).then((result) => {
  console.log(result)
  if (result.recording == true) {
    setPage("recordPage");
  }
});
ui.clearHistory.addEventListener('click', () => {
  data.clearActionList();
});
ui.recordStart.addEventListener('click', async () => {
  chrome.runtime.sendMessage({ action: "startRecord" }, (response) => {
    if (response.log == "started") {
      console.log("Started recording");
      chrome.storage.local.set({ recording: true }).then(() => {
        setPage("recordPage");
      });
    } else {
      throw new Error("Failed to start recording");
    }
  });
});
ui.recordStop.addEventListener('click', async () => {
  chrome.runtime.sendMessage({ action: "stopRecord" }, (response) => {
    if (response.log == "finished") {
      console.log("Stopped recording");
      getName().then((name) => {
        data.addAction({
          name: name,
          actions: response.actions,
          originURL: response.originURL,
        });
      });
      chrome.storage.local.set({ recording: false }).then(() => {
        setPage("mainPage");
      });
    } else {
      throw new Error("Failed to stop recording");
    }
  });
});
function setPage(name) {
  let pages = document.getElementsByClassName('contentPage');
  for (let page of pages) {
    if (page.id == name) {
      page.classList.remove('hiddenPage');
    } else {
      page.classList.add('hiddenPage');
    }
  }
}
function getName() {
  return new Promise((resolve, reject) => {
    document.getElementById("namePopup").style.top = "0px";
    let completeMethod = () => {
      document.getElementById("namePopup").style.top = "100%";
      let name = document.getElementById("nameInput").value;
      document.getElementById("nameInput").value = "";
      resolve(name);
    }
    document.getElementById("enterNameButton").addEventListener("click", () => {
      completeMethod()
    });
    document.getElementById('nameInput').addEventListener('keypress', function (e) {
      if (e.key === 'Enter') {
        completeMethod()
      }
  });
  }, { once: true })
}
function createActionEntry(action){
  let actionElem = document.createElement("action-set");
  actionElem.linkAction(action);
  actionElem.classList.add("inputArea");
  ui.actionButtons.push(actionElem);
  let actionsContainer = document.getElementById("historyBar");
  actionsContainer.insertBefore(actionElem, actionsContainer.firstChild);
}