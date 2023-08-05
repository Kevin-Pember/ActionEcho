let currentPort;
let portArray = [];
let currentAction;
let promiseTabs = [];
let currentLog = {
  actions: [],
};
chrome.tabs.onRemoved.addListener((tabId) => {
  let port = portArray.find((port) => port.tabId == tabId);
  if (port) {
    console.log("port removed: "+port.name);
    let portIndex = portArray.indexOf(port);
    if(currentPort == port){
      currentPort = portArray[portIndex - 1];
    }
    portArray.splice(portIndex, 1);
  }
  
});
chrome.runtime.onConnect.addListener(function (port) {
  port.onMessage.addListener(function (msg) {
    if (msg.action == "Log") {
      currentLog.actions.push(msg);
      if (currentLog.originURL == undefined) {
        currentLog.originURL = msg.location;
        currentLog.faviconURL = msg.location;
      } else if (!Array.isArray(currentLog.originURL) && currentLog.originURL != msg.location) {
        currentLog.originURL = [currentLog.originURL, msg.location];
      } else if (Array.isArray(currentLog.originURL) && !currentLog.originURL.includes(msg.location)) {
        currentLog.originURL.push(msg.location);
      }
    } else if (msg.action == "resolve") {
      currentAction.resolve(msg);
    }
  });
  port.tabId = port.sender.tab.id;
  currentPort = port;
  portArray.push(port);
  console.log("Port Name: " + port.name)
  let promiseTarget = promiseTabs.find((promiseTab) => port.name == promiseTab.url);
  if (promiseTarget) {
    promiseTarget.resolve(port);
  }
});
chrome.runtime.onMessage.addListener((request, sender, reply) => {
  if (request.action == "startRecord") {
    currentPort.postMessage({ action: "startRecord" });
    reply({ log: "started" });
  } else if (request.action == "stopRecord") {
    currentPort.postMessage({ action: "stopRecord" });
    currentLog.log = "finished";
    reply(currentLog);
  } else if (request.action == "runActionSet") {
    console.log(request.set);
    let actions = request.set.actions;
    let originURL = Array.isArray(request.set.originURL) ? request.set.originURL[0] : request.set.originURL ;
    let runMethod = async (port) => {
      for (let action of actions) {
        console.log(action)
        console.log("Running action");
        await new Promise((resolve, reject) => {
          currentAction = { resolve: resolve, reject: reject };
          action.action = "action";
          if (action.type == "click") {
            port.postMessage(action);

          } else if (action.type == "input") {
            port.postMessage(action);
          }
        })
      }
    }
    console.log(portArray)
    let match = portArray.find((port) => {
      return port.name == originURL;
    });
    console.log(match)
    if (match) {
      runMethod(match);
    } else {
      console.log("opening new tab")
      openTab(originURL).then((port) => {
        console.log("tab opened")
        console.log(port)
        runMethod(port);
      });
    }
  }
  return true;
});
/*chrome.storage.local.clear(function() {
var error = chrome.runtime.lastError;
if (error) {
  console.error(error);
}
// do something more
});*/
function openTab(url) {
  return new Promise((resolve, reject) => {
    chrome.tabs.create({ url: url}, function (tab) {
    });
    promiseTabs.push({ url: url, resolve: resolve, reject: reject });
  });
}