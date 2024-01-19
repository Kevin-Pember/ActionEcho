let data = {
  actionsData: [],
  scheduledEvents: [],
  months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  saveActionList() {
    chrome.storage.local.set({ "actionSets": this.actionsData });
  },
  addAction(action) {
    if (this.actionsData.length >= 10) {
      this.actionsData.pop();
    }
    this.actionsData.unshift(action);
    ui.createActionEntry(action);
    this.saveActionList();
  },
  removeAction(action) {
    this.actionsData.splice(this.actionsData.indexOf(action), 1);
    this.saveActionList();
  },
  removeScheduledAction(entry){
    
    if(ui.scheduleButtons.length == 0){
      ui.eventsStage.style.visibility = "hidden";
      ui.eventsStage.style.position = "absolute";
    }

    chrome.runtime.sendMessage({ action: "removeScheduledAction", id : entry.id }, (response) => {});
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
  },
  getTime: (message) => {
    return new Promise((resolve, reject) => {
      ui.uniEntry.setQueryType("time", message);
      ui.uniEntry.style.top = "0px";
      ui.backgroundDiv.blurFocus();
      let completeMethod = (complete, value, now) => {
        ui.uniEntry.style.top = "100%";
        ui.backgroundDiv.returnFocus();
        if (complete) {
          if(now){
            resolve("now");
          }else{
            resolve(value);
          }
          
        } else {
          reject();
        }

      }
      ui.uniEntry.setMethods(completeMethod);
    });

  },
  createActionEntry(action) {
    let actionElem = document.createElement("action-set");
    actionElem.linkAction(action);
    ui.actionButtons.push(actionElem);
    let actionsContainer = document.getElementById("historyBar");
    if(ui.actionsNone.style.visibility != "hidden"){
      ui.actionsNone.style = `visibility: hidden; position: absolute;`;
    }
    actionsContainer.insertBefore(actionElem, actionsContainer.firstChild);
  },
  createTimeEntry(action) {
    console.log("creating time entry")
    let scheduledAction = document.createElement("scheduled-action");
    if(Date.now() >= Number(action.date)){
      action.state = "failed"
    }
    scheduledAction.linkAction(action);
    ui.eventsStage.appendChild(scheduledAction);
    ui.scheduleButtons.push(scheduledAction);
    console.log(ui.eventsStage.style.visibility)
    if(ui.eventsStage.style.visibility != "inherit"){
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
    for(let event of result.scheduledEvents){
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
chrome.runtime.sendMessage({ action: "init" }, (response) => {
  for(let scheduled of response.lists){
    ui.createTimeEntry(scheduled);
  }
});
chrome.runtime.onMessage.addListener((request, sender, reply) => {
  console.log("messaged")
  let target;
  switch(request.action){
    case "changeSchedule":
      target = ui.scheduleButtons.find((element) => element.event.id == request.id);
      target.setIcon(request.state);
      reply({log:"added"})
      break;
    
  }
});