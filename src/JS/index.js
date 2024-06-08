import { backgroundDiv, ButtonGeneric, ActionSet, ScheduledAction, uniQuery, clockInput, dateInput, errorMessage, toggleButton } from './components.js';
customElements.define('background-div', backgroundDiv);
customElements.define('button-generic', ButtonGeneric);
customElements.define('action-set', ActionSet);
customElements.define('scheduled-action', ScheduledAction);
customElements.define("uni-query", uniQuery);
customElements.define("clock-input", clockInput);
customElements.define("date-input", dateInput);
customElements.define("error-message", errorMessage);
customElements.define("toggle-button", toggleButton);
console.clear()
console.log("%c ActionEcho", "font-size:45px; font-weight:bold;");
console.log('%c Welcome to ActionEcho Console, there is not much to see here.', "font-size:25px")
let data = {
  console:{
    action: "background-color: DarkSlateBlue; font-size: 15px;",
    preferences: "background-color: DarkCyan; font-size: 15px;",
    recording: "background-color: OrangeRed; font-size: 15px;",
    error: "background-color: Crimson; font-size: 15px;"
  },
  actionsData: [],
  scheduledEvents: [],
  months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  setLog: {},
  saveActionList() {
    chrome.storage.local.set({ "actionSets": this.actionsData });
  },
  addAction(action) {
    if (!this.actionsData.find((element) => element.name == action.name)) {
      if (this.actionsData.length >= 10) {
        this.actionsData.pop();
      }
      this.actionsData.unshift(action);
      ui.createActionEntry(action);
      this.saveActionList();
    } else {
      error.handle("Choose an Original Name")
    }
  },
  removeAction(action) {
    this.actionsData.splice(this.actionsData.indexOf(action), 1);
    this.saveActionList();
    if (this.actionsData.length < 1) {
      ui.actionsNone.style = "";
    }
  },
  removeScheduledAction(entry) {

    if (ui.scheduleButtons.length == 0) {
      ui.eventsStage.style.visibility = "hidden";
      ui.eventsStage.style.position = "absolute";
    }

    chrome.runtime.sendMessage({ action: "removeScheduledAction", id: entry.id }, (response) => { });
    this.scheduledEvents.splice(this.scheduledEvents.indexOf(entry), 1);
  },
  clearActionList() {
    //Currently set for debugging purposes
    chrome.storage.local.clear(function () {
      var error = chrome.runtime.lastError;
      if (error) {
        console.log("%cError: Problem Clearing Local Storage", data.console.error)
        console.error(error);
      }
    });
    /* Proper code
    chrome.storage.local.set({ "actionSets": [] });
    */
    for (let act of ui.actionButtons) {
      act.remove();
    }
  },

}
let ui = {

  actionButtons: [],
  scheduleButtons: [],
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
      let completeMethod = (complete, value, elem) => {
        if (!data.actionsData.find((element) => element.name == value)) {
          ui.uniEntry.style.top = "100%";
          ui.backgroundDiv.returnFocus();
          if (complete) {
            console.log(`%cAction: action named ${value}`, data.console.action)
            resolve(value);
          } else {
            reject();
          }
          //elem.closeMethod();
        } else {
          elem.reset();
          error.handle("Choose an Original Name")
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
      let completeMethod = (complete, value, elem) => {
        ui.uniEntry.style.top = "100%";
        ui.backgroundDiv.returnFocus();
        if (complete) {
          resolve(value);
        } else {
          reject();
        }
        //elem.closeMethod();
      }
      ui.uniEntry.setMethods(completeMethod);
    })
  },
  getTime: (message) => {
    return new Promise((resolve, reject) => {
      ui.uniEntry.setQueryType("time", message);
      ui.uniEntry.style.top = "0px";
      ui.backgroundDiv.blurFocus();
      let completeMethod = (complete, value, now, elem) => {
        ui.uniEntry.style.top = "100%";
        ui.backgroundDiv.returnFocus();
        if (complete) {
          if (now) {
            resolve("now");
          } else {
            resolve(value);
          }

        } else {
          reject();
        }
        //elem.closeMethod();
      }
      ui.uniEntry.setMethods(completeMethod);
    });

  },
  /*handleError: (message) => {
    ui.errorHandler.message = message;
    ui.errorHandler.style.bottom = "0px";
    setTimeout(() => { ui.errorHandler.style.bottom = "-50px"; }, 3000)
  },*/
  createActionEntry(action) {
    let actionElem = document.createElement("action-set");
    actionElem.linkAction(action);
    ui.actionButtons.push(actionElem);
    let actionsContainer = document.getElementById("historyBar");
    if (ui.actionsNone.style.visibility != "hidden") {
      ui.actionsNone.style = `visibility: hidden; position: absolute;`;
    }
    actionsContainer.insertBefore(actionElem, actionsContainer.firstChild);
  },
  createTimeEntry(action) {
    console.log("%cAction: Scheduled Action Created", data.console.action)
    let scheduledAction = document.createElement("scheduled-action");
    if (!action.state && Date.now() >= Number(action.date)) {
      action.state = "failed"
    }
    scheduledAction.linkAction(action);
    ui.eventsStage.appendChild(scheduledAction);
    ui.scheduleButtons.push(scheduledAction);
    if (ui.eventsStage.style.visibility != "inherit") {
      ui.eventsStage.style.visibility = "inherit";
      ui.eventsStage.style.position = "inherit";
    }
  },
  faviconURL(u) {
    const url = new URL(chrome.runtime.getURL("/_favicon/"));
    url.searchParams.set("pageUrl", u);
    url.searchParams.set("size", "32");
    return url.toString();
  }
};
let error = {
  queue: [],
  running: false,
  add: (message) => {
    if (message != undefined) {
      error.queue.push(message);
    }
  },
  display: async (message) => {
    if (message != undefined) {
      ui.errorHandler.message = message;
      ui.errorHandler.style.bottom = "0px";
      //setTimeout(() => { ui.errorHandler.style.bottom = "-50px"; }, 3000)
      return new Promise(r => {
        let t = () => {
          setTimeout(r, 1000);
          ui.errorHandler.style.bottom = "-50px";
          
        }
        setTimeout(t, 3000);
      });
    }

  },
  handle: async (message) => {
    error.add(message);
    if (!error.running) {
      error.running = true;
      while (error.queue.length > 0) {

        let mes = error.queue.shift();
        console.log(`%cError: ${mes}`, data.console.error)
        await error.display(mes);
      }
      error.running = false;
    }
  }
}
let preferences = {
  store: {
    signed: "false",
    sendActData: "true",
  },

  get signed() { return this.store.signed },
  get sendActData() { return this.store.sendActData },
  /**
   * @param {string} value
   */
  set signed(val) {
    let value = (val != undefined) ? val : "false";
    this.store.signed = value;
    this.saveData();
  },
  /**
  * @param {string} value
  */
  set sendActData(val) {
    let value = (val != undefined) ? val : "true";
    this.store.sendActData = value;
    this.saveData();
  },
  /**
   * @param {any} object
   */
  set(object){
    this.store.signed = (object != undefined && object.signed != undefined) ? object.signed : undefined;
    this.store.sendActData = (object != undefined && object.sendActData != undefined) ? object.sendActData : undefined;
  },
  /**
   * @param {any} object
   */
  save(object) {
    this.set(object)
    this.saveData();
  },
  get data() { return { ...this.store } },
  saveData() {
    console.log(`%cPreferences: Saving Preferences to Storage,`,data.console.preferences, this.data)
    chrome.storage.local.set({ "preferences": this.data });
    chrome.runtime.sendMessage({ action: "setPreferences", preferences: this.data });
  }
}
window.addEventListener('load', () => {
  ui = {
    backgroundDiv: document.getElementById('bgDiv'),
    recordStart: document.getElementById('recordStart'),
    recordStop: document.getElementById('recordStop'),
    editBack: document.getElementById('editBack'),
    editSave: document.getElementById('editSave'),
    editNameEntry: document.getElementById('editName'),
    editEntryContainer: document.getElementById('editEntry'),
    uniEntry: document.getElementById('uniPopup'),
    actionsNone: document.getElementById('actionsNone'),
    eventsStage: document.getElementById('eventsStage'),
    dial: document.getElementById('dial'),
    errorHandler: document.getElementById("errorHandler"),
    settingsButton: document.getElementById("settingsButton"),
    settingsBack: document.getElementById("settingsBack"),
    firebaseToggle: document.getElementById("firebaseToggle"),
    privacyButton: document.getElementById("privacyPolicyButton"),
    ...ui
  }
  chrome.storage.local.get(["actionSets"]).then((result) => {
    console.log(`%cAction: Getting Actions from local storage`, data.console.action, result);
    data.actionsData = result.actionSets == undefined ? [] : result.actionSets;
    if (result.actionSets != undefined && Array.isArray(result.actionSets) && result.actionSets.length > 0) {
      for (let action of data.actionsData.reverse()) {
        ui.createActionEntry(action);
      }
    }
  });
  chrome.storage.local.get(["scheduledEvents"]).then((result) => {
    console.log(`%cAction: Getting Scheduled Actions from local storage`, data.console.action,result)
    if (result.scheduledEvents != undefined) {
      for (let event of result.scheduledEvents) {
        ui.createTimeEntry(event)
      }
    }
  });
  chrome.storage.local.get(["pastEvents"]).then((result) => {
    if (result.pastEvents) {
      for (let event of result.pastEvents) {
        ui.createTimeEntry(event)
      }
    }
    chrome.storage.local.set({ "pastEvents": [] })
  })
  chrome.storage.local.get(["recording"]).then((result) => {
    console.log(`%cRecording:  is recording, ${result.recording}`,data.console.recording, result);
    if (result.recording == true) {
      ui.setPage("recordPage");
    }
  });
  ui.recordStart.addEventListener('click', () => {
    console.log(`%cRecording: Starting recording`, data.console.recording);
    chrome.runtime.sendMessage({ action: "startRecord" }, (response) => {
      if (response.log == "started") {
        chrome.storage.local.set({ recording: true }).then(() => {
          ui.setPage("recordPage");
        });
      } else if (response.log == "noPort") {
        error.handle("Load a Site");
        throw new Error("Failed to start recording");
      }
    });
  });
  ui.recordStop.addEventListener('click', () => {
    chrome.storage.local.set({ recording: false }).then(() => {
      ui.setPage("mainPage");
    });
    chrome.runtime.sendMessage({ action: "stopRecord" }, (response) => {
      console.log("%cRecording: Reponse from background worker: ", data.console.recording, response)
      if (response.actions.length > 1) {
        
          ui.getName("Enter Name").then((name) => {
            let action = {
              name: name,
              actions: response.actions,
              urls: response.urls,
            }
            data.addAction(action);
            chrome.runtime.sendMessage({ action: "actionLog", actionLog: action });
          }, () => { });
      } else {
        error.handle("No actions were recorded")
        throw new Error("Failed to stop recording");
      }
    });
  });
  ui.settingsButton.addEventListener('click', () => { ui.setPage("settingsPage") });
  ui.settingsBack.addEventListener('click', () => { 
    if(data.setLog.sendActData != undefined){
      preferences.sendActData = data.setLog.sendActData;
      data.setLog.sendActData = undefined;
    }
    
    ui.setPage("mainPage") 
  });
  ui.firebaseToggle.addFunction(true, () => { data.setLog.sendActData = "true"});
  ui.firebaseToggle.addFunction(false, () => { data.setLog.sendActData = "false"});
  ui.privacyButton.addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "link", url: "https://kevinpember.com/ActionEcho/privacy" }, (response) => { });
  })
  chrome.runtime.sendMessage({ action: "init" }, (response) => {
    for (let scheduled of response.lists) {
      ui.createTimeEntry(scheduled);
    }
    for(let err of response.errors){
      error.handle(err);
    }
  });
  /*chrome.runtime.onMessage.addListener((request, sender, reply) => {
    console.log("messaged")
    let target;
    switch (request.action) {
      case "changeSchedule":
        target = ui.scheduleButtons.find((element) => element.event.id == request.id);
        target.setIcon(request.state);
        reply({ log: "added" })
        break;

    }
  });*/
  chrome.storage.local.get(["preferences"]).then((result) => {
    console.log(`%cPreferences: Loading Preferences From Local Storage,`, data.console.preferences, result)
    preferences.set(result.preferences)
    if (preferences.signed != "true") {

      console.log(`%cPreferences: Prompting TOS`, data.console.preferences)
      ui.tosPrompt = async () => {
        ui.getBool("User Agreement", `
        <h2>Action Diagnostics</h2> Actions by default are striped of text information and 
        uploaded to the cloud for Diagnostics. This information helps us improve ActionEcho but can be changed by toggling the 
        Send Action Diagnostic Data button then Pressing the X button on the Settings Page. Diagnostics previously uploaded aren't deleted upon disabling Diagnostics. <br><br>
        <h2>Sensitive Data</h2>Please be advised that the use of ActionEcho for passwords or any 
      other sensitive data is strictly prohibited. This extension does not 
      provide adequate security measures and should not be relied upon for 
      securing sensitive information. It is important to note that this extension 
      is intended solely for the storage of non-sensitive data. 
      <br><br><h2>License</h2>This extension is open-source and it's code can be 
      found at https://github.com/Kevin-Pember/ActionEcho. ActionEcho is under the 
      GNU General Public License with can be found in full at https://www.gnu.org/licenses/gpl-3.0.en.html.`).then((value) => {
          if (value) {
            preferences.signed = "true";
          } else {
            ui.tosReject();
          }
        });
      }
      ui.tosReject = async () => {
        ui.getBool("User Agreement Rejected", `You have rejected the User Agreement. 
      This extension will not function if you don't accept the User Agreement.
      Please either accept the User Agreement or uninstall the extension.
      `).then((value) => {
          if (value) {
            ui.tosPrompt();
          } else {
            preferences.signed = "false";
            ui.recordStart.remove();
          }
        });
      }
    }
    if (preferences.signed == undefined) {
      ui.tosPrompt()
    } else if (preferences.signed == "false") {
      ui.tosReject()

    }
    if (preferences.data.sendActData == "false") {
      ui.firebaseToggle.switch(false);
    }else if (preferences.data.sendActData == undefined){
      ui.setPage("settingsPage")
      data.setLog.sendActData = "true";
    }
  });
});
console.group("%cUI Color Codes","font-size: 20px;")
console.log(`%cAction`, data.console.action);
console.log(`%cPreferences`, data.console.preferences);
console.log(`%cRecording`, data.console.recording);
console.log(`%cError`, data.console.error);
console.groupEnd()
export { data, ui };