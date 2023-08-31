let data = {
  portArray: [],
  promiseTabs: {
    tabs: [],
    push: (promise) => {
      data.promiseTabs.tabs.push(promise);
    },
    resolveTarget: (port) => {
      let idx;
      let target = data.promiseTabs.tabs.find((promiseTab, index) => {
        if(port.name == promiseTab.url){
          idx = index;
          return true;
        }
      })
      if(target){
        target.resolve(port);
        data.promiseTabs.tabs.splice(idx, 1);
      }
    }
  },
  openTab: (url) => {
    return new Promise((resolve, reject) => {
      let match = data.portArray.find((port) => {
        return port.name == url;
      });
      if(match){
        resolve(match);
      }else{
        chrome.tabs.create({ url: url, active: true }, function (tab) {
        });
        data.promiseTabs.push({ url: url, resolve: resolve, reject: reject });
      }
    });
  },
}
let head = {
  currentPort: undefined,
  currentAction: undefined,
  currentLog: {
    actions: [],
    originURL: [],
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
  }
}
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  console.log(tab);
  let port = data.portArray.find((port) => port.tabId == tabId);
  if(port){
    port.name = tab.url;
  }
});
chrome.tabs.onRemoved.addListener((tabId) => {
  let port = data.portArray.find((port) => port.tabId == tabId);
  if (port) {
    console.log("port removed: " + port.name);
    let portIndex = data.portArray.indexOf(port);
    if (head.currentPort == port) {
      head.currentPort = data.portArray[portIndex - 1];
    }
    data.portArray.splice(portIndex, 1);
    console.log(data.portArray);
    console.log(data.promiseTabs)
  }

});
chrome.runtime.onConnect.addListener(function (port) {
  port.onMessage.addListener(function (msg) {
    if (msg.action == "Log") {
      if(!head.currentLog.originURL.includes(msg.location)){
        head.currentLog.originURL.push(msg.location);
      }
      if (msg.type == "click") {
        if (msg.textContext != undefined) {
          head.stageLog = {
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
    } else if (msg.action == "resolve") {
      head.currentAction.resolve(msg);
    }
  });
  port.tabId = port.sender.tab.id;
  head.currentPort = port;
  data.portArray.push(port);
  console.log("Port Name: " + port.name)
  data.promiseTabs.resolveTarget(port);
});
chrome.runtime.onMessage.addListener((request, sender, reply) => {
  switch (request.action) {
    case "startRecord":
      head.currentPort.postMessage({ action: "startRecord" });
      reply({ log: "started" });
      break;
    case "stopRecord":
      head.currentPort.postMessage({ action: "stopRecord" });
      console.log(head.stageLog)
      head.currentLog.log = "finished";
      head.resetHead();
      reply(head.currentLog);
      break;
    case "runActionSet":
      let actions = request.set.actions;
      let originURL = Array.isArray(request.set.originURL) ? request.set.originURL[0] : request.set.originURL;
      data.openTab(originURL).then( async (port) => {
        for (let action of actions) {
          await new Promise((resolve, reject) => {
            head.currentAction = { resolve: resolve, reject: reject };
            action.action = "action";
            port.postMessage(action);
          })
        }
      });
      ///Here is where you stopped
      break;
    case "highlight":
      let tabHight = data.portArray.find((port) => {
        return port.name == request.url;
      });
      if (tabHight) {
        tabHight.postMessage({ action: "highlight", target: request.target });
      }
      reply({ log: "highlighted" });
      break;
    case "openTab":
      data.openTab(chrome.runtime.getURL("edit.html")).then((port) => {
        reply({ log: "opened" });
      });
      
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