let data = {
  recording: false,
  portArray: [], /*
  ended here working on close and save edit here we need to 
  create an array of open editors with all ports in order 
  and unique identifier of the action set name and get the 
  data of each */
  currentEditor: undefined,
  siteCache: undefined,
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
      port.postMessage({ action: "newUrl", url: url });
      data.promisePorts.push({ url: url, resolve: resolve, reject: reject });
    });
  },
  cacheSite: (type, location) => {
    data.siteCache = { location: location };
    switch (type) {
      case "newTab":
        //data.cacheSite("newTab", location);
        //head.siteCache = { action: "newTab", location: location };
        data.siteCache.action = "newTab";
        break;
      case "newUrl":
        if (data.recording) {
          data.siteCache.action = "newUrl";
          data.siteCache.autoLoad = head.trackLoad.loadAction;
        } else {
          data.siteCache.action = "newTab";
        }
        break;
    }
  },
  cacheCallback: () => {
    if (data.siteCache) {
      if (head.currentLog.urls[-1] != data.siteCache.location) {
        head.currentLog.urls.push(data.siteCache.location);
        head.currentLog.actions.push(data.siteCache);
      }
      data.siteCache = undefined;
    }
  },
  closeEditor: async () => {
    let compiledActions = [];
    for (let editor of data.currentEditor.portList) {
      if (!editor.disconnect) {
        let promiseLevel = new Promise((resolve, reject) => {
          data.currentEditor.editPromises.push({ tabId: editor.tabId, resolve: resolve, reject: reject });
        });
        editor.postMessage({ action: "closeEditor" });
        compiledActions.concat(await promiseLevel);
      }
    }
    data.currentEditor = undefined;
    return compiledActions;
  }
}
let head = {
  currentPort: undefined,
  currentTab: undefined,
  currentAction: undefined,
  trackLoad: {
    loading: true,
    loadAction: false,
  },
  currentLog: {
    actions: [],
    urls: [],
  },
  stageLog: {},
  editHistory: [],
  redoHistory: [],
  resetHead: () => {
    console.log("reset head");
    console.log(head.stageLog);
    if (head.stageLog.text) {
      head.currentLog.actions.push(head.stageLog);
      head.stageLog = {};
    }
    head.editHistory = [];
    head.redoHistory = [];
  },
  setCurrentPort: (port) => {
    if (head.currentPort && head.currentPort.disconnect == false) {
      head.currentPort.postMessage({ action: "stopRecord" });
    }
    head.resetHead();
    port.postMessage({ action: "startRecord" });
    head.currentPort = port;
  },
}
chrome.storage.local.get(["recording"]).then((result) => {
  data.recording = result.recording == undefined ? false : result.recording;
});
//Tab Management ***************************************************************
chrome.tabs.onRemoved.addListener((tabId) => {
  console.log("Tab Removed")
  let port = data.portArray.find((port) => port.tabId == tabId);
  if (port) {
    console.log("Port removed: " + port.name);
    let portIndex = data.portArray.indexOf(port);
    if (data.portArray.length <= 1) {
      head.currentPort = undefined;
    } else if (head.currentPort == port) {
      head.setCurrentPort(data.portArray[portIndex - 1]);
    }
    port.disconnect();
    data.portArray.splice(portIndex, 1);
  }

});
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  console.log("Tab Updated")
  if (changeInfo.title) {
    head.trackLoad.loading = false;
    head.trackLoad.loadAction = false;
  } else if (changeInfo.status == "loading" && changeInfo.url) {
    head.trackLoad.loading = true;
  }
});
chrome.tabs.onActivated.addListener((activeInfo) => {
  console.log("Tab Activated")
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    if (tab.url != "chrome://newtab/") {
      let port = data.portArray.find((port) => port.tabId == activeInfo.tabId);
      if (port) {
        data.cacheSite("newTab", tab.url);
        head.setCurrentPort(port);
      }
    }
    head.currentTab = activeInfo.tabId;
  })
  console.log(head)
});
//Tab Management end ***********************************************************
chrome.runtime.onConnect.addListener(function (port) {

  port.onMessage.addListener(function (msg) {
    if (msg.action == "log") {
      console.log("input Received");
      data.cacheCallback();
      /*if (head.cacheSite) {
        head.currentLog.actions.push(head.cacheSite);
        head.cacheSite = undefined;
      }*/
      if (msg.type == "click") {
        if (msg.textContext != undefined) {
          head.stageLog = {
            action: "log",
            type: "input",
            text: msg.textContext,
            specifier: msg.specifier,
            location: msg.location,
          };
        }
        head.currentLog.actions.push(msg);
      } else if (msg.type == "input") {
        if (msg.specifier != head.stageLog.specifier) {
          head.resetHead();
        }
        if (msg.focusNode) {
          head.stageLog.focusNode = msg.focusNode;
        }
        if (msg.key.length == 1) {
          inputHandler(msg.key, msg.selection.split("-"));
        } else if (msg.key == "undo") {
          if (head.editHistory.length > 0) {
            head.redoHistory.push(head.stageLog.text);
            head.stageLog.text = head.editHistory.pop();
          }
        } else if (msg.key == "redo") {
          if (head.redoHistory.length > 0) {
            head.editHistory.push(head.stageLog.text);
            head.stageLog.text = head.redoHistory.pop();
          }
        } else if (msg.key == "paste") {
          inputHandler(msg.text, msg.selection.split("-"));
        } else if (msg.key == "cut") {
          let range = msg.selection.split("-");
          head.editHistory.push(head.stageLog.text);
          head.stageLog.text = head.stageLog.text.substring(0, range[0]) + head.stageLog.text.substring(range[1], head.stageLog.text.length);
        } else {
          head.resetHead();
          head.currentLog.actions.push(msg);
        }
        head.lastTextLog = msg;
      }
      if (!head.currentLog.urls.includes(msg.location)) {
        head.currentLog.urls.push(msg.location);
      }
      if (head.trackLoad.loading) {
        head.trackLoad.loadAction = true;
      }
    } else if (msg.action == "resolve") {
      head.currentAction.resolve(msg);
    } else if (msg.action == "closedEditor") {
      //port.editorActive = false;
      let match = data.currentEditor.editPromises.find((promise) => promise.tabId == port.tabId);
      if (match) {
        match.resolve(msg.actionList);
        data.currentEditor.editPromises.splice(data.currentEditor.editPromises.indexOf(match), 1);
      }
    }
  });
  port.tabId = port.sender.tab.id;
  //Checks if the port's tab is already in the portArray
  let tabMatch = data.portArray.find((test) => { return test.tabId == port.sender.tab.id });
  console.log(tabMatch)
  if (tabMatch) {
    console.log("Port replaced: " + tabMatch.name);
    //if the port it is replacing is the current port, replace it
    if (head.currentPort == tabMatch) {
      data.cacheSite("newUrl", tabMatch.name);
      head.setCurrentPort(port);
      if (data.recording) {
        port.postMessage({ action: "startRecord" });
        head.resetHead();
      }
    }
    //remove the old port from the array
    data.portArray.splice(data.portArray.indexOf(tabMatch), 1)
  }
  if (port.tabId == head.currentTab) {
    data.cacheSite("newTab", port.name);
    head.currentPort = port;
  }
  //head.currentPort = port;
  data.portArray.push(port);
  console.log(data.portArray)
  console.log("Port Name: " + port.name)
  data.promisePorts.resolveTarget(port);
  console.log(data)
  console.log(head)
});
chrome.runtime.onMessage.addListener((request, sender, reply) => {
  switch (request.action) {
    case "startRecord":
      data.recording = true;
      head.currentPort.postMessage({ action: "startRecord" });
      reply({ log: "started" });
      break;
    case "stopRecord":
      head.currentPort.postMessage({ action: "stopRecord" });
      head.currentLog.log = "finished";
      head.resetHead();
      data.recording = false;
      reply(head.currentLog);
      head.currentLog = {
        actions: [],
        urls: [],
      };
      break;
    case "runActionSet":
      let actions = request.set.actions;
      let runActions = async () => {
        for (let action of actions) {
          switch (action.action) {
            case "log":
              await new Promise((resolve, reject) => {
                head.currentAction = { resolve: resolve, reject: reject };
                action.action = "action";
                console.log("reach here")
                head.currentPort.postMessage(action);
              })
              break;
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
          }
        }
      };
      runActions()
      ///Here is where you stopped
      break;
    case "editAction":
      if (!data.currentEditor) {
        let editorEntry = {
          id: request.actionSet.name,
          portList: [],
          editPromises: []
        }
        for (let url of request.urls) {
          let portActions = request.actionSet.actions.filter((action) => action.location == url);
          data.openTab(url).then((port) => {
            editorEntry.portList.push(port);
            if (!port.hasEditor) {
              chrome.scripting.executeScript({ target: { tabId: port.tabId }, files: ["JS/editorUI.js"] }).then(() => {
                reply({ log: "opened" });
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
        data.currentEditor = editorEntry;
      } else if (data.currentEditor.id != request.actionSet.name) {
        reply({ log: "alreadyOpen" });
      } else {
        reply({ log: "noAction" });
      }
      break;
    case "closeEditor":
      if (data.currentEditor) {
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
  }
  return true;
});
function inputHandler(key, range) {
  let text = head.stageLog.text;
  let pre = text;
  console.log("input handler with key: " + key + " and range: " + range + "< add to " + text);
  if (range[0] > -1 && range[1] > -1 && range[0] <= text.length && range[1] <= text.length) {
    let textBefore = text.substring(0, range[0]);
    let textAfter = text.substring(range[1], text.length);
    head.stageLog.text = textBefore + key + textAfter;
    head.editHistory.push(pre);
  }
}
