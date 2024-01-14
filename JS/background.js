let data = {
  current: {
    actionSet: undefined,
    port: undefined,
    tab: undefined,
    actionPacket: undefined,
    editor: undefined,
  },
  portArray: [],
  currentEditor: undefined,
  siteCache: undefined,
  uiLink: undefined,
  promisePorts: {
    tabs: [],
    push: (promise) => {
      data.promisePorts.tabs.push(promise);
    },
    resolveTarget: (port) => {
      let idx;
      let target = data.promisePorts.tabs.find((promiseTab, index) => {
        if (port.name == promiseTab.url) {
          idx = index;
          return true;
        }
      })
      if (target) {
        target.resolve(port);
        data.promisePorts.tabs.splice(idx, 1);
      }
    }
  },
  openTab: (url) => {
    console.log("open tab");
    return new Promise((resolve, reject) => {
      let match = data.portArray.find((port) => {
        return port.name == url;
      });
      if (match) {
        chrome.tabs.update(match.tabId, { active: true }, (tab) => { });
        resolve(match);
      } else {
        chrome.tabs.create({ url: url, active: true }, function (tab) {
        });
        data.promisePorts.push({ url: url, resolve: resolve, reject: reject });
      }
    });
  },
  openURL: (port, url) => {
    return new Promise((resolve, reject) => {
      port.postMessage({ action: "setURL", url: url });
      data.promisePorts.push({ url: url, resolve: resolve, reject: reject });
    });
  },
  disconnectPort: (port) => {
    port.disconnected = true;
    let index = data.portArray.findIndex((test) => test.tabId == port.tabId);
    data.portArray.splice(index, 1);
    if (data.portArray.length == 0) {
      data.current.port = undefined;
    } else if (data.current.port == port) {
      console.log("this is a test")
      console.log(data.portArray[index]);
      recorder.setCurrentPort(data.portArray[index]);
    }
    if (port.editorActive) {
      data.closeEditor();
    }
    if (!port.disconnected) {
      port.disconnect();
    }

    console.log(data.current.editor)
  },
}
let runner = {
  templates: {
    actionPacket: {
      v: 1.0,
      site: undefined,
      action: "actionPacket",
      actions: [],
    },
  },
  runActions: async (actions) => {
    console.log("running actions (background)");
    let packets = runner.getPackets(actions);
    packets.forEach(async (packet) => {
      let url = packet.site;
      if (!url.autoLoad && url.format == "url") {
        if (data.current.port) {
          await data.openURL(data.current.port, url.url)
        }
      } else {
        await data.openTab(url.url);
      }
      data.current.port.postMessage(packet);
    });
    /*let urls = runner.getUrls(actions);
    console.log("the urls are:")
    console.log(urls)
    urls.forEach(async (url, index) => {
      console.log(url)
      if(!url.autoLoad && url.format == "url"){
        if (head.currentPort) {
          await data.openURL(head.currentPort, url.location)
        }
      }else{
        await data.openTab(url.location);
      }
      
      
      data.current.port.postMessage(actionPacket);
    });*/
    /*for (let action of actions) {
      switch (action.action) {
        case "newUrl":
          if (!action.autoLoad) {
            if (head.currentPort) {
              await data.openURL(head.currentPort, action.location)
            }
          }
          break;
        case "newTab":
          await data.openTab(action.location);
          break;
        default:
          await new Promise((resolve, reject) => {
            head.currentAction = { resolve: resolve, reject: reject };
            action.action = "action";
            console.log("reach here")
            head.currentPort.postMessage(action);
          })
          break;
      }
    }*/
  },
  getUrls: (set) => {
    let urls = [];
    for (let action of set) {
      if (action.type == "site" && !urls.includes(action.url)) {
        urls.push(action.url);
      }
    }
    return urls;
  },
  getPackets: (actions) => {
    let urls = actions.filter((action) => action.type == "site");
    console.log(urls);
    let packets = [];
    urls.forEach((url, index) => {
      let actionPacket = structuredClone(runner.templates.actionPacket);
      actionPacket.actions = actions.slice(actions.indexOf(url) + 1, index < urls.length - 1 ? actions.indexOf(urls[index + 1]) : actions.length);
      actionPacket.site = url;
      packets.push(actionPacket);
    });
    return packets;
  },
}
let recorder = {
  recording: false,
  v: 1.0,
  templates: {
    actionSet: {
      v: 1.0,
      name: "",
      actions: [],
    },
    site: {
      type: "site",
      url: "",
      format: "",
      autoLoad: false,
    },
    textAction: {
      type: "input",
      text: "",
      specifier: "",
    }
  },
  history: {
    edit: [],
    redo: [],
  },
  urlLoad: {
    loading: true,
    loadAction: false,
  },
  parseData: {
    site: {},
    textAction: {}
  },
  startRecord: () => {
    recorder.recording = true;
    data.current.actionSet = structuredClone(recorder.templates.actionSet);
    data.current.port.postMessage({ action: "startRecord" });
  },
  stopRecord: () => {
    data.current.port.postMessage({ action: "stopRecord" });
    data.current.actionSet.log = "finished";
    recorder.resetRecorder();
    recorder.recording = false;
  },
  cacheSite: (type, location) => {
    recorder.parseData.site = structuredClone(recorder.templates.site);
    recorder.parseData.site.url = location;
    if (type == "newUrl" && recorder.recording) {
      recorder.parseData.site.autoLoad = recorder.urlLoad.loadAction;
      recorder.parseData.site.format = "url";
    } else {
      recorder.parseData.site.format = "tab";
    }
    /*switch (type) {
      case "newTab":
        //recorder.cacheSite("newTab", location);
        //head.siteCache = { action: "newTab", location: location };
        //actionSet.currentSite.action = "newTab";
        
        break;
      case "newUrl":
        if (recorder.recording) {
          actionSet.currentSite.action = "newUrl";
          actionSet.currentSite.autoLoad = head.trackLoad.loadAction;
        } else {
          actionSet.currentSite.action = "newTab";
        }
        break;
    }*/
  },
  postCacheSite: () => {
    if (recorder.parseData.site) {
      let urls = runner.getUrls(data.current.actionSet.actions);
      if (urls[-1] != recorder.parseData.site.url) {
        data.current.actionSet.actions.push(recorder.parseData.site);
      }
      recorder.parseData.site = undefined;
    }
  },
  setCurrentPort: (port) => {
    if (recorder.recording) {
      if (data.current.port && data.current.port.disconnected == false) {
        data.current.port.postMessage({ action: "stopRecord" });
      }
      port.postMessage({ action: "startRecord" });
      recorder.resetRecorder();
    }
    data.current.port = port;
  },
  parseLog: (msg) => {
    recorder.postCacheSite();
    console.log(msg);
    switch (msg.type) {
      case "click":
        console.log("click log")
        console.log(msg.textContext)
        if (msg.textContext != undefined) {
          if(!recorder.parseData.textAction.type){
            recorder.parseData.textAction = structuredClone(recorder.templates.textAction)
          }else{
            recorder.resetRecorder();
          };
          recorder.parseData.textAction.text = msg.textContext;
          recorder.parseData.textAction.specifier = msg.specifier;
        }
        if(msg.specifier !== recorder.parseData.textAction.specifier){
          recorder.resetRecorder();
          recorder.parseData.textAction.specifier = msg.specifier;
        }
        data.current.actionSet.actions.push(msg);
        break;
      case "input":
        console.log("input log")
        console.log(recorder.parseData.textAction)
        /*if(!recorder.parseData.textAction.specifier){
          recorder.parseData.textAction.specifier = msg.specifier;
        }
        console.log(`${msg.specifier} vs. ${recorder.parseData.textAction.specifier}`)
        if (msg.specifier !== recorder.parseData.textAction.specifier) {
          console.log("resetting recorder")
          recorder.resetRecorder();
        }*/
        recorder.inputHandler(msg.key, msg.selection.split("-"));
        recorder.lastTextLog = msg;
        break;
      case "key":
        console.log("key log")
        if (msg.key == "undo") {
          if (recorder.history.edit.length > 0) {
            recorder.history.redo.push(recorder.parseData.textAction.text);
            recorder.parseData.textAction.text = recorder.history.edit.pop();
          }
        } else if (msg.key == "redo") {
          if (recorder.history.redo.length > 0) {
            recorder.history.edit.push(recorder.parseData.textAction.text);
            recorder.parseData.textAction.text = recorder.history.redo.pop();
          }
        } else if (msg.key == "paste") {
          recorder.inputHandler(msg.text, msg.selection.split("-"));
        } else if (msg.key == "cut") {
          let range = msg.selection.split("-");
          recorder.history.edit.push(recorder.parseData.textAction.text);
          recorder.parseData.textAction.text = recorder.parseData.textAction.text.substring(0, range[0]) + recorder.parseData.textAction.text.substring(range[1], recorder.parseData.textAction.text.length);
        } else {
          //recorder.resetRecorder();
          data.current.actionSet.actions.push(msg);
        }
        break;
    }
    if (recorder.urlLoad.loading) {
      recorder.urlLoad.loadAction = true;
    }

  },
  inputHandler: (key, range) => {
    let text = recorder.parseData.textAction.text;
    let pre = text;
    console.log("input handler with key: " + key + " and range: " + range + "< add to " + text);
    if (range[0] > -1 && range[1] > -1 && range[0] <= text.length && range[1] <= text.length) {
      let textBefore = text.substring(0, range[0]);
      let textAfter = text.substring(range[1], text.length);
      recorder.parseData.textAction.text = textBefore + key + textAfter;
      recorder.history.edit.push(pre);
    }
  },
  resetRecorder: () => {
    console.log("reset head");
    console.log(recorder.parseData.textAction);
    if (recorder.parseData.textAction.text && recorder.parseData.textAction.text.length > 0) {
      data.current.actionSet.actions.push(recorder.parseData.textAction);
      recorder.parseData.textAction = structuredClone(recorder.templates.textAction);
    }
    recorder.history.edit = [];
    recorder.history.redo = [];
  },

}
let editor = {
  openEditor: async (request) => {
    let editorEntry = {
      id: request.actionSet.name,
      portList: [],
      editPromises: []
    }
    console.log(request)
    let urls = runner.getUrls(request.actionSet.actions);
    for (let url of urls) {
      let portActions = request.actionSet.actions.splice(request.actionSet.actions.indexOf(url) + 1, urls.indexOf(url) < urls.length - 1 ? request.actionSet.actions.indexOf(urls[urls.indexOf(url) + 1]) : request.actionSet.actions.length);
      console.log("portActions",portActions)
      data.openTab(url).then((port) => {
        editorEntry.portList.push(port);
        if (!port.hasEditor) {
          chrome.scripting.executeScript({ target: { tabId: port.tabId }, files: ["JS/editorUI.js"] }).then(() => {

            port.postMessage({ action: "openEditor", actionSet: { name: request.actionSet.name, actions: portActions } });
          });
          port.editorActive = true;
          port.hasEditor = true;
        } else {
          port.postMessage({ action: "openEditor", actionSet: { name: request.actionSet.name, actions: portActions } });
          port.editorActive = true;
        }
      });
    }
    data.current.editor = editorEntry;
  },
  closeEditor: async () => {
    console.log("running close editor")
    console.log(data.current.editor.portList)
    let compiledActions = []
    for (let editor of data.current.editor.portList) {
      console.log(editor)
      if (!editor.disconnected) {
        let promiseLevel = new Promise((resolve, reject) => {
          data.current.editor.editPromises.push({ tabId: editor.tabId, resolve: resolve, reject: reject });
        });
        editor.editorActive = false;
        editor.postMessage({ action: "closeEditor" });
        let retActions = await promiseLevel;
        console.log("returned actions")
        console.log(retActions)
        compiledActions = compiledActions.concat(retActions);
        console.log("compiled actions")
        console.log(compiledActions)
      }
    }
    data.current.editor = undefined;
    console.log("close editor finished")
    console.log(compiledActions)
    return compiledActions;
  },
}
let clock = {
  schedule: {
    times : [],
    actionLists : [],
  },
  checkTime: () => {
    let now = Date.now();
    for (let i = 0; i < clock.schedule.times.length; i++) {
      /*console.log("now vs check")
      console.log(now, clock.schedule.times[i])
      console.log("Difference:"+(now - clock.schedule.times[i]))*/
      if(now >= clock.schedule.times[i]){
        if(now - clock.schedule.times[i] > 10000){
          clock.updateSchedule(i, false);
          clock.removeScheduledAction(i);
        }else{
          clock.completeIndex(i);
          clock.updateSchedule(i, true);
          clock.removeScheduledAction(i);
        }
        
        i--;
      }
    }
  },
  completeIndex: async (index) => {
    let actions = clock.schedule.actionLists[index].actions;
    console.log(actions);
    await runner.runActions(actions);
  },
  addSchedule: (event) => {
    clock.schedule.actionLists.push(event);
    clock.schedule.times.push(event.date);
  },
  updateSchedule: async (index,pass) => {
    let schedule = clock.schedule.actionLists[index];
    if(pass){
      chrome.runtime.sendMessage(data.uiLink.id, { action: "changeSchedule", id: schedule.id, state: "completed"});
    }else{
      chrome.runtime.sendMessage(data.uiLink.id, { action: "changeSchedule", id:  schedule.id, state: "failed"});
    }
  },
  removeScheduledAction: (index) => {
    if(index > -1){
      clock.schedule.actionLists.splice(index, 1);
      clock.schedule.times.splice(index, 1);
      clock.saveSchedule();
    }
  },
  saveSchedule: () => {
    chrome.storage.local.set({ "scheduledEvents":clock.schedule.actionLists });
  },
}

let checkAlarmState = async () => {
    const alarm = await chrome.alarms.get("clockAlarm");
    if (!alarm) {
      await chrome.alarms.create("clockAlarm", { 
        periodInMinutes: 0.01 
      });
    }
}
let iterate = 0;
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === "clockAlarm") {
    //console.log(iterate++);
    clock.checkTime();
  }
});
checkAlarmState();
chrome.storage.local.get(["recording"]).then((result) => {
  recorder.recording = result.recording == undefined ? false : result.recording;
});
chrome.storage.local.get(["scheduledEvents"]).then((result) => {
  console.log(result)
  if (result.scheduledEvents != undefined) {
    for(let event of result.scheduledEvents){
      //ui.createTimeEntry(event)
      clock.addSchedule(event);
    }
  }
});
//Tab Management ***************************************************************
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  console.log("Tab Updated")
  if (changeInfo.title) {
    recorder.urlLoad.loading = false;
    recorder.urlLoad.loadAction = false;
  } else if (changeInfo.status == "loading" && changeInfo.url) {
    recorder.urlLoad.loading = true;
  }
});
chrome.tabs.onActivated.addListener((activeInfo) => {
  console.log("Tab Activated")
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    if (tab.url != "chrome://newtab/") {
      let port = data.portArray.find((port) => port.tabId == activeInfo.tabId);
      if (port) {
        console.log(`cached new site: ${tab.url}`)
        recorder.cacheSite("newTab", tab.url);
        recorder.setCurrentPort(port);
      }
    }
    data.current.tab = activeInfo.tabId;
  })
});
//Tab Management end ***********************************************************
chrome.runtime.onConnect.addListener(function (port) {
  console.log("Port Connected");
  console.log(port);
  port.onMessage.addListener(function (msg) {
    switch (msg.action) {
      case "log":
        recorder.parseLog(msg);
        break;
      case "resolve":
        data.current.actionPacket.resolve(msg);
        break;
      case "closedEditor":
        //handles closed messages from the port and resolve the promise with their action list
        let match = data.current.editor.editPromises.find((promise) => promise.tabId == port.tabId);
        if (match) {
          match.resolve(msg.actionList);
          data.current.editor.editPromises.splice(data.current.editor.editPromises.indexOf(match), 1);
        }
        break;
      case "closeEditor":
        //handles messages from the port Editor ui to close itself using the data.closeEditor function
        console.log("messaged to close editor")
        data.closeEditor()
        break;
      case "testLog":
        port.postMessage({ action: "testCase" })
        break;
    }
  });
  port.onDisconnect.addListener(data.disconnectPort);
  port.tabId = port.sender.tab.id;
  //Checks if the port's tab is already in the portArray
  let tabIndex = 0;
  let tabMatch = data.portArray.find((test, index) => {
    tabIndex = index;
    return test.tabId == port.sender.tab.id
  });
  console.log(tabMatch)
  if (tabMatch) {
    console.log("Port replaced: " + tabMatch.name);
    //if the port it is replacing is the current port, replace it
    if (data.current.port == tabMatch) {
      recorder.cacheSite("newUrl", tabMatch.name);
      recorder.setCurrentPort(port);
      if (recorder.recording) {
        port.postMessage({ action: "startRecord" });
        recorder.resetRecorder();
      }
    }
    //remove the old port from the array
    data.disconnectPort(tabMatch, tabIndex);
  }
  if (port.tabId == data.current.tab) {
    recorder.cacheSite("newTab", port.name);
    data.current.port = port;
  }
  data.portArray.push(port);
  console.log(data.portArray)
  console.log("Port Name: " + port.name)
  data.promisePorts.resolveTarget(port);
  console.log(data)
});
chrome.runtime.onMessage.addListener((request, sender, reply) => {
  switch (request.action) {
    case "startRecord":
      recorder.startRecord();
      reply({ log: "started" });
      break;
    case "stopRecord":
      recorder.stopRecord();
      console.log("stopping record");
      console.log(data.current.actionSet);
      reply(data.current.actionSet);
      console.log("template is now:")
      console.log(recorder.templates.actionSet)
      data.current.actionSet = structuredClone(recorder.templates.actionSet);
      break;
    case "scheduleActionSet":
      clock.addSchedule(request.set);
      console.log(request.set)
      reply({log:"added"})
      break;
    case "removeScheduledAction":
      let index = clock.schedule.actionLists.findIndex((test) => test.id == request.id);
      clock.removeScheduledAction(index);
      reply({log:"removed"})
      break;
    case "runActionSet":
      runner.runActions(request.set.actions);
      break;
    case "openEditor":
      if (!data.current.editor) {
        editor.openEditor(request);
        reply({ log: "opened" });
      } else if (data.current.editor.id != request.actionSet.name) {
        reply({ log: "alreadyOpen" });
      } else {
        reply({ log: "noAction" });
      }
      break;
    case "closeEditor":
      console.log("close Editor Called")
      if (data.current.editor) {
        console.log("running close editor")
        data.closeEditor().then((actionList) => {
          console.log("closed editor finished")
          reply({ log: "closed", actionList: actionList });
        });
      } else {
        reply({ log: "noEditor" });
      }
      break;
    case "testLog":
      console.log("test log");
      reply({ log: "test" });
      break;
    case "init":
      data.uiLink = sender;
      reply({ log: "init", lists: clock.schedule.actionLists });
      break;
  }
  return true;
});
/*chrome.storage.local.get(["scheduledEvents"]).then((result) => {
  console.log(result)
  //data.actionsData = result.scheduledEvents == undefined ? [] : result.scheduledEvents;
  if (result.scheduledEvents != undefined) {
    for(let event of result.scheduledEvents){
      clock.addSchedule(event.actions, event.time);
    }
  }
});*/
