import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.1/firebase-app.js'
import { getFirestore, addDoc, collection } from 'https://www.gstatic.com/firebasejs/10.12.1/firebase-firestore.js'
let firebase = {
  config: {
    apiKey: "AIzaSyBj5CGVHf6b15TbJCMISL87koNVvbscNJc",
    authDomain: "autoecho-70f5b.firebaseapp.com",
    projectId: "autoecho-70f5b",
    storageBucket: "autoecho-70f5b.appspot.com",
    messagingSenderId: "385826425881",
    appId: "1:385826425881:web:b49db849cbefa0afc8ee88",
    measurementId: "G-PM216WXQPR"
  },
}
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
        console.log(`%c Setting Current Port`, "background-color: green; font-size: 20px;")
        data.current.port = port;
        data.promisePorts.tabs.splice(idx, 1);
      }
    }
  },
  openTab: (url) => {
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
      recorder.setCurrentPort(data.portArray[index]);
    }
    if (port.editorActive) {
      data.closeEditor();
    }
    if (!port.disconnected) {
      port.disconnect();
    }
  },
  generateRandomString: (length) => {
    let string = "";
    let len = length ? length : 8;
    for (let i = 0; i < len; i++) {
      string += String.fromCharCode(Math.floor(47 + Math.random() * 79))
    }
    return string;
  },
  anonymizeAction: (action) => {
    action.name += data.generateRandomString();
  }
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
    let packets = runner.getPackets(actions);
    let url;
    for (let packet of packets) {
      url = packet.site;
      if (url.format == "url") {
        console.log()
        if (data.current.port.name != url.url) {
          console.log(`%c Forcing URL`, "background-color: green; font-size: 20px;")
          await data.openURL(data.current.port, url.url)
        }
      } else {
        await data.openTab(url.url);
      }
      data.current.port.postMessage(packet);
    }
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
    },
    textAction: {
      type: "input",
      text: "",
    }
  },
  data: {
    actionSet: undefined,
    site: {},
    textAction: {
      type: "input",
      text: "",
    },
    caret: [],
    isSelection: false,
    edit: [],
    redo: [],
    inputs: [],

  },
  startRecord: (reply) => {
    recorder.recording = true;
    recorder.data.actionSet = structuredClone(recorder.templates.actionSet);
    /*if (recorder.data.site) {
      recorder.data.actionSet.actions.push(recorder.data.site)
      recorder.data.site = undefined;
    }*/
    let site = structuredClone(recorder.templates.site)
    site.url = data.current.port.name;
    site.format = "tab"
    recorder.data.actionSet.actions.push(recorder.data.site)
    try {
      data.current.port.postMessage({ action: "startRecord" });
      reply({ log: "started" });
    } catch {
      console.log(`%c No Current Port`, "font-size: 20px; background-color: red;");
      reply({ log: "noPort" });
    }

  },
  stopRecord: (reply) => {
    data.current.port.postMessage({ action: "stopRecord" });
    recorder.data.actionSet.log = "finished";
    recorder.recording = false;
    console.log("stopping record");
    console.log(recorder.data.actionSet);
    if (recorder.data.actionSet.actions.length > 0) {
      reply(recorder.data.actionSet);
    } else {
      console.log(`%c Empty ActionList`, "font-size: 20px; background-color: red;");
      reply({ log: "emptyActions" })
    }

    console.log("template is now:")
    console.log(recorder.templates.actionSet)
    recorder.data.inputs = []
    recorder.data.currentTextAction = {
      type: "input",
      text: "",
    }
    //recorder.data.actionSet = structuredClone(recorder.templates.actionSet);
  },
  cacheSite: (type, location) => {
    console.log(`%c Caching site`, "font-size: 20px; background-color: green;")
    let site = structuredClone(recorder.templates.site);
    site.url = location;
    if (type == "newUrl" && recorder.recording && recorder.data.actionSet.actions.length > 0) {
      site.format = "url";
    } else {
      site.format = "tab";
    }
    if (recorder.recording) {
      recorder.data.actionSet.actions.push(site);
    } else {
      recorder.data.site = site
    }

  },
  /*postCacheSite: () => {
    if (recorder.data.site) {
      //console.log(`%c Adding Site: ${recorder.data.site}`, "font-size: 20px; background-color: green;")
      let urls = runner.getUrls(recorder.data.actionSet.actions);
      if (urls[urls.length - 1] != recorder.data.site.url) {
        recorder.data.actionSet.actions.push(recorder.data.site);
      }
      recorder.data.site = undefined;
    }
  },*/
  setCurrentPort: (port) => {
    if (recorder.recording) {
      if (data.current.port && data.current.port.disconnected == false) {
        data.current.port.postMessage({ action: "stopRecord" });
      }
      port.postMessage({ action: "startRecord" });
      recorder.data.inputs = []
      recorder.data.caret = []
      recorder.data.isSelection = false;
      recorder.data.edit = []
      recorder.data.redo = []
    }
    data.current.port = port;
  },
  parseLog: (msg) => {
    //recorder.postCacheSite();
    /*if(recorder.data.site && !recorder.urlLoad.loading){
      recorder.data.actionSet.actions.push(recorder.data.site);
      recorder.data.site = undefined;
    }*/
    console.log(msg);
    msg.action = undefined;
    switch (msg.type) {
      case "click":
        console.log(`%c New Click`, "background-color: green; font-size: 20px;")
        console.log(msg)
        recorder.data.actionSet.actions.push(msg);
        if (msg.textContext != undefined) {

          let exists = recorder.data.inputs.find((input) => input.specifier == msg.specifier);
          if (!exists) {
            let input = {
              entry: structuredClone(recorder.templates.textAction),
              specifier: msg.specifier,
              edit: [],
              redo: [],
            }
            if (msg.textContext != "") {
              input.entry.text = msg.textContext
            }
            recorder.data.inputs.push(input);
            recorder.data.actionSet.actions.push(input.entry);
            recorder.data.caret = msg.caret.split("-").map((num) => {
              return Number(num);
            })
            recorder.data.isSelection = !(recorder.data.caret[0] === recorder.data.caret[1]);
            exists = input;
          } else {
            msg.textContext = undefined;
          }
          recorder.data.currentTextAction = exists.entry;
          recorder.data.redo = exists.redo;
          recorder.data.edit = exists.edit;

        }

        break;
      case "input":
        console.log("input log")
        console.log(recorder.data.currentTextAction)
        recorder.inputHandler(msg.key, msg.selection.split("-"));
        recorder.lastTextLog = msg;
        break;
      case "key":
        console.log("key log")
        switch (msg.key) {
          case "undo":
            console.log("undo");
            if (recorder.data.edit.length > 0) {
              recorder.data.redo.push(recorder.data.currentTextAction.text);
              recorder.data.currentTextAction.text = recorder.data.edit.pop();
            }
            break;
          case "redo":
            if (recorder.data.redo.length > 0) {
              recorder.data.edit.push(recorder.data.currentTextAction.text);
              recorder.data.currentTextAction.text = recorder.data.redo.pop();
            }
            break;
          case "paste":
            recorder.inputHandler(msg.text, msg.selection.split("-"));
            break;
          case "cut":
            let range = msg.selection.split("-");
            recorder.data.edit.push(recorder.data.currentTextAction.text);
            recorder.data.currentTextAction.text = recorder.data.currentTextAction.text.substring(0, range[0]) + recorder.data.currentTextAction.text.substring(range[1], recorder.data.currentTextAction.text.length);
            break;
          case "all":
            recorder.data.caret[0] = 0
            recorder.data.caret[1] = recorder.data.currentTextAction.text.length
            break;
          case "Enter":
            recorder.data.actionSet.actions.push(msg);
            break;
          case "Backspace":
            let text = recorder.data.currentTextAction.text
            recorder.data.currentTextAction.text = text.substring(0, recorder.data.caret[0] - 1) + text.substring(recorder.data.caret[1])
            recorder.data.caret = [recorder.data.caret[0] - 1, recorder.data.caret[0] - 1]
            break;
          case "ArrowLeft":
            if (!recorder.data.isSelection) {
              recorder.data.caret[0] -= 1
            }
            recorder.data.caret[1] = recorder.data.caret[0]
            break;
          case "ArrowRight":
            if (!recorder.data.isSelection) {
              recorder.data.caret[1] += 1
            }
            recorder.data.caret[0] = recorder.data.caret[1]
            break;
          default:
            console.log("Default key log");
            recorder.data.actionSet.actions.push(msg);
        }
        break;
    }
    /*if (recorder.urlLoad.loading && recorder.data.site) {
      recorder.data.site.autoLoad = true;
      recorder.data.actionSet.actions.push(recorder.data.site);
      recorder.data.site = undefined;
    }*/

  },
  inputHandler: (key) => {
    let text = recorder.data.currentTextAction.text;
    let keyLength = key.length
    recorder.data.edit.push(recorder.data.currentTextAction.text);
    recorder.data.currentTextAction.text = text.substring(0, recorder.data.caret[0]) + key + text.substring(recorder.data.caret[1]);
    recorder.data.caret = [recorder.data.caret[0] + keyLength, recorder.data.caret[0] + keyLength]
  },

}
/*
  before adding back to extension enable "scripting" permission
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
      console.log("portActions", portActions)
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
}*/
let clock = {
  schedule: {
    times: [],
    actionLists: [],
  },
  checkTime: () => {
    let now = Date.now();
    for (let i = 0; i < clock.schedule.times.length; i++) {
      /*console.log("now vs check")
      console.log(now, clock.schedule.times[i])
      console.log("Difference:"+(now - clock.schedule.times[i]))*/
      if (now >= clock.schedule.times[i]) {
        if (now - clock.schedule.times[i] > 10000) {
          clock.updateSchedule(i, false);
          clock.removeScheduledAction(i);
        } else {
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
  updateSchedule: async (index, pass) => {
    let item = clock.schedule.actionLists[index];
    /*if (pass) {
      chrome.runtime.sendMessage(data.uiLink.id, { action: "changeSchedule", id: schedule.id, state: "completed" });
    } else {
      chrome.runtime.sendMessage(data.uiLink.id, { action: "changeSchedule", id: schedule.id, state: "failed" });
    }*/
    item.state = pass ? "completed" : "failed";
    chrome.storage.local.get(["pastEvents"]).then((result) => {
      if (result.pastEvents != undefined) {
        result.pastEvents.push(item);
        chrome.storage.local.set(result);
      } else {
        chrome.storage.local.set({ "pastEvents": [item] });
      }
    });
  },
  removeScheduledAction: (index) => {
    if (index > -1) {
      clock.schedule.actionLists.splice(index, 1);
      clock.schedule.times.splice(index, 1);
      clock.saveSchedule();
    }
  },
  saveSchedule: () => {
    chrome.storage.local.set({ "scheduledEvents": clock.schedule.actionLists });
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
    for (let event of result.scheduledEvents) {
      //ui.createTimeEntry(event)
      clock.addSchedule(event);
    }
  }
});
//Tab Management ***************************************************************
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (recorder.recording) {
    let tabMatch = data.portArray.find(elem => elem.tabId == tabId);
    if (tabMatch) {
      tabMatch.name = tab.url
    }
    if (changeInfo.title && data.current.tab == tabId) {
      recorder.cacheSite("newUrl", tab.url)
    }
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
  console.log("action received")
  console.log(request)
  switch (request.action) {
    case "startRecord":
      recorder.startRecord(reply);
      break;
    case "stopRecord":
      recorder.stopRecord(reply);
      break;
    case "scheduleActionSet":
      clock.addSchedule(request.set);
      console.log(request.set)
      reply({ log: "added" })
      break;
    case "removeScheduledAction":
      let index = clock.schedule.actionLists.findIndex((test) => test.id == request.id);
      clock.removeScheduledAction(index);
      reply({ log: "removed" })
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
      if (data.current.editor) {
        data.closeEditor().then((actionList) => {
          reply({ log: "closed", actionList: actionList });
        });
      } else {
        reply({ log: "noEditor" });
      }
      break;
    case "actionLog":
      let copy = {... request.actionLog};
      data.anonymizeAction(copy);
      try {
        addDoc(collection(firebase.db, "actions"), copy);
        reply({ log: "success" });
      } catch (e) {
        console.error("Error adding document: ", e);
        reply({ log: "failed" });
      }

      break;
    case "setPreferences":
      if (request.preferences) {
        data.preferences = request.preferences;
        if (request.preferences.sendActData === "true"  && firebase.app == undefined) {
          /*const firebaseConfig = {
            apiKey: "AIzaSyBj5CGVHf6b15TbJCMISL87koNVvbscNJc",
            authDomain: "autoecho-70f5b.firebaseapp.com",
            projectId: "autoecho-70f5b",
            storageBucket: "autoecho-70f5b.appspot.com",
            messagingSenderId: "385826425881",
            appId: "1:385826425881:web:b49db849cbefa0afc8ee88",
            measurementId: "G-PM216WXQPR"
          }*/
          firebase.app = initializeApp(firebase.config);
          firebase.db = getFirestore(firebase.app);
        } else if (request.preferences.sendActData === "false" && firebase.app != undefined) {
          firebase.app = undefined;
          firebase.db = undefined;
        }
        reply({ log: "success" });
      }else{
        reply({ log: "failed" });
      }
      break;
    case "init":
      data.uiLink = sender;
      reply({ log: "init", lists: clock.schedule.actionLists });
      break;
  }
  return true;
});