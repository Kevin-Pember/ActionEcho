let data = {
  portArray: [],
  promiseTabs: {
    tabs: [],
    push: (promise) => {
      data.promiseTabs.tabs.push(promise);
    },
    resolveTarget: (target) => {
      let promiseTarget = data.promiseTabs.tabs.find((promiseTab) => target == promiseTab.url);
      if (promiseTarget) {
        promiseTarget.resolve(port);
      }
    }
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
    }
    head.editHistory = [];
    head.redoHistory = [];
  }
}
chrome.tabs.onRemoved.addListener((tabId) => {
  let port = data.portArray.find((port) => port.tabId == tabId);
  if (port) {
    console.log("port removed: " + port.name);
    let portIndex = data.portArray.indexOf(port);
    if (head.currentPort == port) {
      head.currentPort = data.portArray[portIndex - 1];
    }
    data.portArray.splice(portIndex, 1);
  }

});
chrome.runtime.onConnect.addListener(function (port) {
  port.onMessage.addListener(function (msg) {
    if (msg.action == "Log") {
      //head.currentLog.actions.push(msg);
      /*if (head.currentLog.originURL == undefined) {
        head.currentLog.originURL = msg.location;
      } else if (!Array.isArray(head.currentLog.originURL) && head.currentLog.originURL != msg.location) {
        head.currentLog.originURL = [head.currentLog.originURL, msg.location];
      } else if (Array.isArray(head.currentLog.originURL) && !head.currentLog.originURL.includes(msg.location)) {
        head.currentLog.originURL.push(msg.location);
      }*/
      head.currentLog.originURL.push(msg.location);
      if (msg.type == "click") {
        if (msg.textContext != undefined) {
          head.stageLog = {
            type: "input",
            text: msg.textContext,
            specifier: msg.specifier
          };
        }
        head.currentLog.actions.push(msg);
      } else if (msg.type == "input") {
        if (msg.specifier != head.stageLog.specifier) {
          head.resetHead();
        } else {
          if (msg.focusNode) {
            head.stageLog.focusNode = msg.focusNode;
          }
          if (msg.key == "undo") {
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
            if (msg.key.length == 1) {
              inputHandler(msg.key, msg.selection.split("-"));
            }
          }
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
  data.promiseTabs.resolveTarget(port.name);
});
chrome.runtime.onMessage.addListener((request, sender, reply) => {
  if (request.action == "startRecord") {
    head.currentPort.postMessage({ action: "startRecord" });
    reply({ log: "started" });
  } else if (request.action == "stopRecord") {
    head.currentPort.postMessage({ action: "stopRecord" });
    console.log(head.stageLog)
    head.currentLog.log = "finished";
    head.resetHead();
    reply(head.currentLog);
  } else if (request.action == "runActionSet") {
    let actions = request.set.actions;
    let originURL = Array.isArray(request.set.originURL) ? request.set.originURL[0] : request.set.originURL;
    let runMethod = async (port) => {
      for (let action of actions) {
        await new Promise((resolve, reject) => {
          head.currentAction = { resolve: resolve, reject: reject };
          action.action = "action";
          port.postMessage(action);
        })
      }
    }
    let match = data.portArray.find((port) => {
      return port.name == originURL;
    });
    if (match) {
      runMethod(match);
    } else {
      openTab(originURL).then((port) => {
        runMethod(port);
      });
    }
  }
  return true;
});
function openTab(url) {
  return new Promise((resolve, reject) => {
    chrome.tabs.create({ url: url }, function (tab) {
    });
    data.promiseTabs.push({ url: url, resolve: resolve, reject: reject });
  });
}
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