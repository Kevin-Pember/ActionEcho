let data = {
  actionsData: [],
  saveActionList() {
    chrome.storage.local.set({ "actionSets": this.actionsData });
  },
  addAction(action) {
    if (this.actionsData.length >= 10) {
      this.actionsData.pop();
    }
    this.actionsData.unshift(action);
    createActionEntry(action);
    this.saveActionList();
  },
  removeAction(action) {
    this.actionsData.splice(this.actionsData.indexOf(action), 1);
    this.saveActionList();
  },
  clearActionList() {
    //Currently set for debugging purposes
    chrome.storage.local.clear(function () {
      var error = chrome.runtime.lastError;
      if (error) {
        console.error(error);
      }
    });
    /* Proper code
    chrome.storage.local.set({ "actionSets": [] });
    */
    for (let act of ui.actionButtons) {
      act.remove();
    }
  }
}
let ui = {
  backgroundDiv: document.getElementById('bgDiv'),
  recordStart: document.getElementById('recordStart'),
  recordStop: document.getElementById('recordStop'),
  clearHistory: document.getElementById('clearHistory'),
  editBack: document.getElementById('editBack'),
  editSave: document.getElementById('editSave'),
  editNameEntry: document.getElementById('editName'),
  editEntryContainer: document.getElementById('editEntry'),
  uniEntry: document.getElementById('uniPopup'),
  actionButtons: [],
  setPage: (name) => {
    let pages = document.getElementsByClassName('contentPage');
    for (let page of pages) {
      if (page.id == name) {
        page.classList.remove('hiddenPage');
      } else {
        page.classList.add('hiddenPage');
      }
    }
  },
  getName: (message) => {
    return new Promise((resolve, reject) => {
      ui.uniEntry.setQueryType("text", message);
      ui.uniEntry.style.top = "0px";
      ui.backgroundDiv.blurFocus();
      let completeMethod = (complete, value) => {
        console.log("Complete called as: " + complete)
        ui.uniEntry.style.top = "100%";
        ui.backgroundDiv.returnFocus();
        if (complete) {
          resolve(value);
        } else {
          reject();
        }

      }
      ui.uniEntry.setMethods(completeMethod);
    })
  },
  getBool: (message, description) => {
    return new Promise((resolve, reject) => {
      ui.uniEntry.setQueryType("bool", message, description);
      ui.uniEntry.style.top = "0px";
      ui.backgroundDiv.blurFocus();
      let completeMethod = (complete, value) => {
        ui.uniEntry.style.top = "100%";
        ui.backgroundDiv.returnFocus();
        if (complete) {
          resolve(value);
        } else {
          reject();
        }

      }
      ui.uniEntry.setMethods(completeMethod);
    })
  }
};

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
    ui.setPage("recordPage");
  }
});
ui.clearHistory.addEventListener('click', () => {
  data.clearActionList();
});
ui.recordStart.addEventListener('click', () => {
  console.log("Starting recording");
  chrome.runtime.sendMessage({ action: "startRecord" }, (response) => {
    if (response.log == "started") {
      console.log("Started recording");
      chrome.storage.local.set({ recording: true }).then(() => {
        ui.setPage("recordPage");
      });
    } else {
      throw new Error("Failed to start recording");
    }
  });
});
ui.recordStop.addEventListener('click', () => {
  chrome.storage.local.set({ recording: false }).then(() => {
    ui.setPage("mainPage");
  });
  chrome.runtime.sendMessage({ action: "stopRecord" }, (response) => {
    if (response.log == "finished") {
      console.log("Stopped recording");
      if (response.actions.length > 0) {
        ui.getName("Enter Name").then((name) => {
          data.addAction({
            name: name,
            actions: response.actions,
            urls: response.urls,
          });
        }, () => { });
      }
    } else {
      throw new Error("Failed to stop recording");
    }
  });
});

let delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
let stagerChildren = async (element) => {
  let entryChildren = [...element.childNodes];
  for (let child of entryChildren) {
    console.log(child)
    if (child.open) {
      child.open();
    }

    await delay(60);
  }
}
//Deprecated
/*function editActionSet(actionSet){
  ui.setPage("editPage");
  
  chrome.runtime.sendMessage({ action: "openTab", url: actionSet.originURL[0]}, (response) => {
    if (response.log == "opened") {
      console.log("Opened tab");
    } else {
      throw new Error("Failed to stop recording");
    }
  });
  stagerChildren(ui.editEntryContainer);
}*/
function createActionEntry(action) {
  let actionElem = document.createElement("action-set");
  actionElem.linkAction(action);
  actionElem.classList.add("inputArea");
  ui.actionButtons.push(actionElem);
  let actionsContainer = document.getElementById("historyBar");
  actionsContainer.insertBefore(actionElem, actionsContainer.firstChild);
}