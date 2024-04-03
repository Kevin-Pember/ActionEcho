import { backgroundDiv, ButtonGeneric, ActionSet, ScheduledAction, uniQuery, clockInput, dateInput, errorMessage } from './components.js';
customElements.define('background-div', backgroundDiv);
customElements.define('button-generic', ButtonGeneric);
customElements.define('action-set', ActionSet);
customElements.define('scheduled-action', ScheduledAction);
customElements.define("uni-query", uniQuery);
customElements.define("clock-input", clockInput);
customElements.define("date-input", dateInput);
customElements.define("error-message", errorMessage);

let data = {
  actionsData: [],
  scheduledEvents: [],
  months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
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
      ui.handleError("Choose an Original Name")
    }
  },
  removeAction(action) {
    this.actionsData.splice(this.actionsData.indexOf(action), 1);
    this.saveActionList();
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
          console.log("Complete called as: " + complete)
          ui.uniEntry.style.top = "100%";
          ui.backgroundDiv.returnFocus();
          if (complete) {
            resolve(value);
          } else {
            reject();
          }
          elem.closeMethod();
        }else{
          elem.reset();
          ui.handleError("Choose an Original Name")
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
      let completeMethod = (complete, value,elem) => {
        ui.uniEntry.style.top = "100%";
        ui.backgroundDiv.returnFocus();
        if (complete) {
          resolve(value);
        } else {
          reject();
        }
        elem.closeMethod();
      }
      ui.uniEntry.setMethods(completeMethod);
    })
  },
  getTime: (message) => {
    return new Promise((resolve, reject) => {
      ui.uniEntry.setQueryType("time", message);
      ui.uniEntry.style.top = "0px";
      ui.backgroundDiv.blurFocus();
      let completeMethod = (complete, value, now,elem) => {
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
        elem.closeMethod();
      }
      ui.uniEntry.setMethods(completeMethod);
    });

  },
  handleError: (message) => {
    ui.errorHandler.message = message;
    ui.errorHandler.style.bottom = "0px";
    setTimeout(() => { ui.errorHandler.style.bottom = "-50px"; }, 3000)
  },
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
    console.log("creating time entry")
    let scheduledAction = document.createElement("scheduled-action");
    if (Date.now() >= Number(action.date)) {
      action.state = "failed"
    }
    scheduledAction.linkAction(action);
    ui.eventsStage.appendChild(scheduledAction);
    ui.scheduleButtons.push(scheduledAction);
    console.log(ui.eventsStage.style.visibility)
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
    ...ui
  }


  chrome.storage.local.get(["actionSets"]).then((result) => {
    console.log(result)
    data.actionsData = result.actionSets == undefined ? [] : result.actionSets;
    if (result.actionSets != undefined && Array.isArray(result.actionSets) && result.actionSets.length > 0) {
      for (let action of data.actionsData.reverse()) {
        ui.createActionEntry(action);
      }
    }
  });
  chrome.storage.local.get(["scheduledEvents"]).then((result) => {
    console.log(result)
    if (result.scheduledEvents != undefined) {
      for (let event of result.scheduledEvents) {
        ui.createTimeEntry(event)
      }
    }
  });
  chrome.storage.local.get(["recording"]).then((result) => {
    console.log(result)
    if (result.recording == true) {
      ui.setPage("recordPage");
    }
  });
  ui.recordStart.addEventListener('click', () => {
    console.log("Starting recording");
    chrome.runtime.sendMessage({ action: "startRecord" }, (response) => {
      if (response.log == "started") {
        console.log("Started recording");
        chrome.storage.local.set({ recording: true }).then(() => {
          ui.setPage("recordPage");
        });
      } else if (response.log == "noPort") {
        ui.handleError("Load or Reload Site");
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
      } else if ("emptyActions") {
        ui.handleError("No actions were recorded")
        throw new Error("Failed to stop recording");
      }
    });
  });
  chrome.runtime.sendMessage({ action: "init" }, (response) => {
    for (let scheduled of response.lists) {
      ui.createTimeEntry(scheduled);
    }
  });
  chrome.runtime.onMessage.addListener((request, sender, reply) => {
    console.log("messaged")
    let target;
    switch (request.action) {
      case "changeSchedule":
        target = ui.scheduleButtons.find((element) => element.event.id == request.id);
        target.setIcon(request.state);
        reply({ log: "added" })
        break;

    }
  });

  chrome.storage.local.get(["signed"]).then((result) => {
    console.log(result)
    if (result.signed != "true") {
      ui.tosPrompt = async () => {
        ui.getBool("User Agreement", `<h2>Sensitive Data</h2>Please be advised that the use of this extension for passwords or any 
      other sensitive data is strictly prohibited. This extension does not 
      provide adequate security measures and should not be relied upon for 
      securing sensitive information. It is important to note that this extension 
      is intended solely for the storage of non-sensitive data. 
      <br><br><h2>Liability</h2>This extension is 
      provided "AS IS", without warranty of any kind, express or implied, including 
      but not limited to the warranties of merchantability, fitness for a particular 
      purpose, and noninfringement. In no event shall the authors or copyright holders
      be liable for any claim, damages, or other liability, whether in an action of 
      contract, tort, or otherwise, arising from, out of, or in connection with the 
      software or the use or other dealings in the software.`).then((value) => {
          console.log(value)
          if (value) {
            chrome.storage.local.set({ signed: "true" })
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
            chrome.storage.local.set({ signed: "false" })
            ui.recordStart.remove();
          }
        });
      }
    }
    if (result.signed == undefined) {
      ui.tosPrompt()
    } else if (result.signed == "false") {
      ui.tosReject()
    }
    /*if (result.signed == undefined) {
      ui.tosPrompt().then((value) => {
        if (value) {
          chrome.storage.local.set({ signed: "true" })
        } else {
          chrome.storage.local.set({ signed: "false" })
          ui.getBool("TOS Rejected", "You have rejected the User Agreement. This extension will not function properly until you accept the User Agreement.").then((value) => {
            if (value) {
              ui.tosPrompt().then((value) => {
                if (value) {
                  chrome.storage.local.set({ signed: "true" })
                } else {
                  chrome.storage.local.set({ signed: "false" })
                }
              })
            }
          });
        }
      });
    }*/
  });
});
export { data, ui };