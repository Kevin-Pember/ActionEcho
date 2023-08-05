let autoStartButton = document.getElementById('autoStartButton');
let recordButton = document.getElementById('recordButton');
let actionSets = [];
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
  setIdentifier(identifier) {
    console.log(identifier);
    this.shadowRoot.getElementById("nameArea").innerText = identifier.name;
    this.shadowRoot.getElementById("imgArea").src = faviconURL(identifier.faviconURL);
    this.shadowRoot.getElementById("actionButton").addEventListener("click", () => {
      chrome.runtime.sendMessage({ action: "runActionSet", set:identifier}, (response) =>{

      });
    });
  }
}
window.customElements.define('action-set', ActionSet);
chrome.storage.local.get(["actionSets"]).then((result) => {

  actionSets = result.actionSets == undefined ? [] : result.actionSets;
  if (result.actionSets != undefined || Array.isArray(result.actionSets)) {
    for (let action of actionSets) {
      createActionEntry(action);
    }
  }
  console.log(actionSets);
});
chrome.storage.local.get(["recording"]).then((result) => {
  console.log(result)
  if (result.recording == true) {
    setPage("recordPage");
  }
});


autoStartButton.addEventListener('click', async () => {
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
recordButton.addEventListener('click', async () => {
  chrome.runtime.sendMessage({ action: "stopRecord" }, (response) => {
    if (response.log == "finished") {
      console.log("Stopped recording");
      let actionSet = {};
      getName().then((name) => {
        actionSet = {
          name: name,
          actions: response.actions,
          originURL: response.originURL,
          faviconURL: response.faviconURL,
        };
        if(actionSets.length >= 10){
          actionSets.pop();
        }
        actionSets.unshift(actionSet);
        createActionEntry(actionSet);
        chrome.storage.local.set({ "actionSets": actionSets });
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

function faviconURL(u) {
  const url = new URL(chrome.runtime.getURL("/_favicon/"));
  url.searchParams.set("pageUrl", u);
  url.searchParams.set("size", "32");
  return url.toString();
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
  actionElem.setIdentifier(action);
  actionElem.classList.add("inputArea");
  let actionsContainer = document.getElementById("historyBar");
  actionsContainer.insertBefore(actionElem, actionsContainer.firstChild);
}