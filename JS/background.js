console.log("background.js loaded");
let injectPort;
let currentLog = [];
chrome.runtime.onConnect.addListener(function(port) {
    console.assert(port.name === "Background");
    port.onMessage.addListener(function(msg) {
        console.log(msg)
        if(msg.action == "Log"){
            currentLog.push(msg);
        }
    });
    injectPort = port;
  });
  chrome.runtime.onMessage.addListener((request, sender, reply) => {
    if (request.action == "startRecord"){
        injectPort.postMessage({action: "startRecord"});
    }else if (request.action == "stopRecord"){
        injectPort.postMessage({action: "stopRecord"});
    }
    return true;
  });
  function parseLog(){
    currentLog
  }