//import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.1/firebase-app.js'
//import { getFirestore, addDoc, collection } from 'https://www.gstatic.com/firebasejs/10.12.1/firebase-firestore.js'
import { Config } from "./firebaseConfig.js"
import { initializeApp } from 'firebase/app'
import { getFirestore, addDoc, collection } from 'firebase/firestore'
let firebase = {
  app: undefined,
  db: undefined
}
let errorLog = []
let data = {
  console: {
    clock: "background-color: PaleVioletRed; font-size: 15px;",
    firebase: "background-color: Coral; font-size: 15px;",
    recording: "background-color: DarkOrange; font-size: 15px;",
    sites: "background-color: RebeccaPurple; font-size: 15px;",
    error: "background-color: FireBrick; font-size: 15px;",
    index: "background-color: SeaGreen; font-size: 15px;",
  },
  current: {
    actionSet: undefined,
    port: undefined,
    tab: undefined,
    actionPacket: undefined,
    editor: undefined,
  },
  portArray: [],
  tabs: [],
  currentEditor: undefined,
  siteCache: undefined,
  uiLink: undefined,
  promiseTabs: {
    tabs: [],
    push: (promise) => {
      data.promiseTabs.tabs.push(promise);
    },
    resolveTarget: (tab) => {
      console.log(`%cSite_Manager: Checking this tab`, data.console.sites, tab)
      console.log(`%cSite_Manager: Against these Promises`, data.console.sites, data.promiseTabs.tabs)
      let idx;
      let target = data.promiseTabs.tabs.find((promiseTab, index) => {
        if (tab.url === promiseTab.url || promiseTab.url === tab.pendingUrl) {
          idx = index;
          return true;
        }
      })
      if (target) {
        let value = { tabId: tab.id, url: (tab.url !== "") ? tab.url : tab.pendingUrl }
        target.resolve(value);
        data.current.tab = value;
        data.promiseTabs.tabs.splice(idx, 1);
      }
    }
  },
  openTab: (url) => {
    console.log(`%cSite_Manager: Loading Url in New Tab, ${url}`, data.console.sites)
    return new Promise((resolve, reject) => {
      let match = data.portArray.find((port) => {
        return port.name === url;
      });
      if (match) {
        chrome.tabs.update(match.tabId, { active: true }, (tab) => { });
        resolve(match);
      } else {
        chrome.tabs.create({ url: url, active: true }, function (tab) {
        });
        data.promiseTabs.push({ url: url, resolve: resolve, reject: reject });
      }
    });
  },
  openURL: (port, url) => {
    console.log(`%cSite_Manager: Loading Url in Current Tab, ${url}`, data.console.sites)
    return new Promise((resolve, reject) => {
      port.postMessage({ action: "setURL", url: url });
      data.promiseTabs.push({ url: url, resolve: resolve, reject: reject });
    });
  },
  addTab: (value) => {
    data.promiseTabs.resolveTarget(value);
    data.tabs.push(value);
  },
  /*disconnectPort: (port) => {
    port.disconnected = true;
    let index = data.portArray.findIndex((test) => test.tabId === port.tabId);
    data.portArray.splice(index, 1);
    if (data.portArray.length === 0) {
      data.current.port = undefined;
    } else if (data.current.port === port) {
      recorder.setCurrentPort(data.portArray[index]);
    }
    if (port.editorActive) {
      data.closeEditor();
    }
    if (!port.disconnected) {
      port.disconnect();
    }
  },*/
  generateRandomString: (length) => {
    let string = "";
    let len = length ? length : 5;
    for (let i = 0; i < len; i++) {
      string += String.fromCharCode(Math.floor(47 + Math.random() * 79))
    }
    return string;
  },
  anonymizeAction: (action) => {
    action.name += data.generateRandomString();
    for (let act of action.actions) {
      if (act.type === "input") {
        act.text = data.generateRandomString();
      }
    }
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
      if (url.format === "url") {
        if (data.current.port.name != url.url) {
          await data.openURL(data.current.port, url.url)
        }
      } else {
        await data.openTab(url.url);
      }
      //data.current.port.postMessage(packet);
      chrome.scripting.executeScript({ target: { tabId: data.current.tab.tabId }, func: runner.actionRunnerScript, args: [packet] });
    }
  },
  getUrls: (set) => {
    let urls = [];
    for (let action of set) {
      if (action.type === "site" && !urls.includes(action.url)) {
        urls.push(action.url);
      }
    }
    return urls;
  },
  getPackets: (actions) => {
    let urls = actions.filter((action) => action.type === "site");
    let packets = [];
    urls.forEach((url, index) => {
      let actionPacket = structuredClone(runner.templates.actionPacket);
      actionPacket.actions = actions.slice(actions.indexOf(url) + 1, index < urls.length - 1 ? actions.indexOf(urls[index + 1]) : actions.length);
      actionPacket.site = url;
      packets.push(actionPacket);
    });
    return packets;
  },
  actionRunnerScript: async (echoActions) => {
    console.log("running action runner script")
    console.log(echoActions)
    let input = {

      actionQueue: [],
      data: {
        focusedElement: undefined,
        range: [0, 0],
      },
      keyCodes: {
        Enter: 13,
      },
      parsePacket: (packet) => {
        if (packet.v === 1.0) {
          for (let action of packet.actions) {
            console.log(action)
            input.throwAction(action);
          }
        } else {
          throw new Error("Packet version not supported");
        }
      },
      throwAction: (msg) => {
        console.log("throwing action")
        console.log(`State is ${document.readyState}`)
        if (document.readyState === "complete") {
          switch (msg.type) {
            case "click":
              console.log("Running click action");
              console.log(`Element Specifier is ${msg.specifier}`)
              let element = input.getElement(msg.specifier);
              console.log(element)
              input.data.focusedElement = element;
              if (msg.textContext !== undefined) {
                if ((element.tagName === "INPUT" || element.tagName === "TEXTAREA")) {
                  element.value = msg.textContext;
                } else if (element.contentEditable === "true") {
                  element.innerText = msg.textContext;
                }
              }
              //input.data.range = msg.caret.split("-");
              if (msg.caret) {
                let range = msg.caret.split("-");
                input.setFocus(element, range)
              }
              element.dispatchEvent(new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                view: window
              }));
              element.focus();
              console.log("click event dispatched");
              break;
            case "input":
              console.log("Running input action");
              input.enterText(input.data.focusedElement, msg);
              break;
            case "key":
              console.log("Running key action")
              input.enterKey(input.getElement(msg.specifier), msg.key);
              break;
          }
        } else {
          input.actionQueue.push(msg);
        }
      },
      enterText: (element, log) => {
        console.log("typing")
        console.log(log)
        let typeInput, charArray = log.text.split(""), range = input.data.range;
        console.log(element)
        console.log("Typing the text: " + log.text)
        if (element.contentEditable === "true") {
          typeInput = (text, range) => {
            let index = 0,
              targetChild = undefined;
            element.innerHTML = element.innerHTML + text;
            targetChild = element.childNodes[0];
            index = text.length;
            input.setFocus(element, range);
            const inputEvent = new Event('input', { bubbles: true });
            element.dispatchEvent(inputEvent);
          }
        } else {
          typeInput = (text, range) => {
            console.log("elemnt value is " + element.value);
            element.focus();
            element.value = element.value.substring(0, range[0]) + text + element.value.substring(range[1]);
            console.log("value is now" + element.value)
            element.setSelectionRange(range[0] + 1, range[0] + 1);
          }
        }
        for (let char of charArray) {
          console.log(char)
          typeInput(char, range);
          range = [range[0] + 1, range[0] + 1];
          input.enterKey(element, char);
        }
      },
      enterKey: (elem, key) => {
        let keyCode = key.length > 1 ? input.keyCodes[key] : key;
        let eventObject = {
          key: key,
          code: key,
          which: keyCode,
          keyCode: keyCode,
          composed: true,
          bubbles: true,
          cancelable: true
        }
        console.log(eventObject)
        elem.dispatchEvent(new KeyboardEvent('keydown', eventObject));
        elem.dispatchEvent(new KeyboardEvent('keypress', eventObject));
        elem.dispatchEvent(new KeyboardEvent('keyup', eventObject));
        elem.dispatchEvent(new InputEvent('input', { data: key, inputType: "insertText", bubbles: true }));
      },
      runQueue: () => {
        for (let action of input.actionQueue) {
          input.throwAction(action);
        }
        input.actionQueue = [];
      },
      getElement: (specifier) => {
        let index = specifier.indexOf("--");
        if (index === 0) {
          let endIndex = specifier.indexOf("$");
          let index = Number(specifier.substring(2, endIndex));
          specifier = specifier.substring(endIndex + 1);
          return document.querySelectorAll(specifier)[index];
        } else {
          let element = document.querySelectorAll(specifier);
          if (element.length === 1) {
            return element[0];
          } else if (element.length > 1) {
            throw new Error("Multiple Elements found");
            return null;
          } else {
            throw new Error("Element not found");
            return null;
          }
        }
      },
      setFocus(elem, range) {
        if (range || elem.contentEditable === "true") {
          if ((elem.tagName === "input" && elem.type === "text") || elem.tagName === "TEXTAREA") {
            elem.setSelectionRange(range[0], range[1])
          } else if (elem.contentEditable === "true") {
            let sel = window.getSelection();
            let range = document.createRange();
            range.setStart(elem, range[0]);
            range.setEnd(elem, range[1])
            sel.removeAllRanges();
            sel.addRange(range);
          }
        } else {
          elem.focus()
        }
      }
    }
    document.onreadystatechange = () => {
      if (document.readyState === "complete") {
        input.parsePacket(echoActions)
        return "Done";
      }
      /*if (document.readyState === "complete" && input.actionQueue.length > 0) {
          input.runQueue();
      }*/
    }


  }
}
let recorder = {
  actionSet: undefined,
  logBuffer: [],
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
  compile: (logList) => {
    recorder.actionSet = { ...recorder.templates.actionSet }
    for (let log of logList) {
      switch (log.type) {
        case "site":
          recorder.data.caret = []
          recorder.data.isSelection = false;
          recorder.actionSet.actions.push(log)
          break;
        default:
          recorder.parseLog(log)
          break;
      }
    }
    return recorder.actionSet;
  },
  startRecord: (reply) => {
    if (data.current.tab !== undefined){
      recorder.logBuffer = []
      recorder.recording = true;
      //recorder.data.actionSet = structuredClone(recorder.templates.actionSet);
      /*let site = structuredClone(recorder.templates.site)
      site.url = data.current.tab.url;
      site.format = "tab"*/
      if (data.current.tab.url != "") {
        recorder.cacheSite("tab", data.current.tab.url)
      }

      recorder.logReport = new Promise(async (resolve) => {
        await chrome.scripting.insertCSS({
          target: { tabId: data.current.tab.tabId },
          files: ['public/siteStyle.css'],
        });
        chrome.scripting.executeScript({ target: { tabId: data.current.tab.tabId }, func: recorder.startRecordScript }).then((r) => {
          recorder.logBuffer = recorder.logBuffer.concat(r[0].result)
          resolve();
        })
      });
      //recorder.data.actionSet.actions.push(recorder.data.site)

      //data.current.port
      //data.current.port.postMessage({ action: "startRecord" });
      reply({ log: "started" });
    } else {
      reply({ log: "noPort" });
    }

  },
  stopRecord: async (reply) => {
    //recorder.data.actionSet.log = "finished";
    recorder.recording = false;
    if (reply != undefined) {
      //data.current.port.postMessage({ action: "stopRecord" });
      chrome.scripting.executeScript({ target: { tabId: data.current.tab.tabId }, func: recorder.stopRecordScript })
      await recorder.logReport;
      if (recorder.logBuffer.length > 1) {
        recorder.compile(recorder.logBuffer)
        reply(recorder.actionSet);
        console.log("%cBRecording: resulting Action:", data.console.recording, recorder.actionSet)
      } else {
        reply({ log: "emptyActions" })
      }

    }
    recorder.data.inputs = []
    recorder.data.currentTextAction = {
      type: "input",
      text: "",
    }
    //recorder.data.actionSet = structuredClone(recorder.templates.actionSet);
  },
  cacheSite: (type, location) => {
    let site = structuredClone(recorder.templates.site);
    site.url = location;
    if (type === "newUrl" && recorder.recording && recorder.logBuffer.length > 0) {
      site.format = "url";
    } else {
      site.format = "tab";
    }
    if (recorder.recording) {
      recorder.logBuffer.push(site);
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
  /*setCurrentPort: (port) => {
    if (recorder.recording) {
      if (data.current.port && data.current.port.disconnected === false) {
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
  },*/

  parseLog: (msg) => {
    //recorder.postCacheSite();
    /*if(recorder.data.site && !recorder.urlLoad.loading){
      recorder.data.actionSet.actions.push(recorder.data.site);
      recorder.data.site = undefined;
    }*/
    msg.action = undefined;
    switch (msg.type) {
      case "click":
        recorder.actionSet.actions.push(msg);
        if (msg.textContext != undefined) {

          let exists = recorder.data.inputs.find((input) => input.specifier === msg.specifier);
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
            recorder.actionSet.actions.push(input.entry);
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
        recorder.inputHandler(msg.key, msg.selection.split("-"));
        recorder.lastTextLog = msg;
        break;
      case "key":
        switch (msg.key) {
          case "undo":
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
            //recorder.data.actionSet.actions.push(msg);
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
          //recorder.data.actionSet.actions.push(msg);
        }
        break;
      case "error":
        if (msg.level === "end") {
          chrome.storage.local.set({ recording: false })
          recorder.stopRecord()
        }

        errorLog.push(msg.message)
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
  clock: async () => {
    let tic = new Promise((r) => {
      window.addEventListener("beforeunload", () => {
        r("Unload Detected")
      })
    })
    return await tic
  },
  startRecordScript: async () => {
    let logger = {
      indicator: {
        elem: document.createElement("div"),
        error: () => {
          if (logger.indicator.elem != undefined) {
            logger.indicator.elem.style.backgroundColor = "red"
            setTimeout(() => {
              logger.indicator.elem.style = "unset";
            }, 3000)
          }
        },
        toggle: (way) => {
          if (logger.indicator.elem.className === "") {
            logger.indicator.elem.classList.add("actionEchoRecordIcon")
            logger.indicator.elem.innerHTML = `
                    <svg style="height:60px; width: 60px;" viewBox="0 0 1200 1200" xmlns="http://www.w3.org/2000/svg">
                    <path d="m557.75 583.42c-39.443-39.443-103.39-39.443-142.84 0s-39.443 103.39 0 142.84 103.39 39.443 142.84 0 39.443-103.39 0-142.84zm-25.456 25.456c-25.384-25.384-66.54-25.384-91.924 0s-25.384 66.539 0 91.923c25.384 25.385 66.54 25.385 91.924 0 25.384-25.384 25.384-66.539 0-91.923z" clip-rule="evenodd" fill="#D9D9D9" fill-rule="evenodd"/>
                    <path d="m557.75 583.42c-39.443-39.443-103.39-39.443-142.84 0s-39.443 103.39 0 142.84 103.39 39.443 142.84 0 39.443-103.39 0-142.84zm-25.456 25.456c-25.384-25.384-66.54-25.384-91.924 0s-25.384 66.539 0 91.923c25.384 25.385 66.54 25.385 91.924 0 25.384-25.384 25.384-66.539 0-91.923z" clip-rule="evenodd" fill-opacity=".3" fill-rule="evenodd"/>
                    <path d="m70.556 958.89 111.02 111.02 314.54-314.55c-29.002 2.805-58.986-6.899-81.198-29.111-22.615-22.615-32.264-53.287-28.945-82.777l-315.42 315.42z" fill="#D9D9D9"/>
                    <path d="m70.556 958.89 111.02 111.02 314.54-314.55c-29.002 2.805-58.986-6.899-81.198-29.111-22.615-22.615-32.264-53.287-28.945-82.777l-315.42 315.42z" fill-opacity=".3"/>
                    <path d="m982.64 158.42c-39.443-39.443-103.39-39.443-142.84 0-39.443 39.443-39.443 103.39 0 142.84 39.442 39.443 103.39 39.443 142.84 0 39.441-39.443 39.441-103.39 0-142.84zm-25.456 25.456c-25.384-25.384-66.54-25.384-91.924 0s-25.384 66.539 0 91.924c25.384 25.384 66.54 25.384 91.924 0 25.384-25.385 25.384-66.54 0-91.924z" clip-rule="evenodd" fill="#D9D9D9" fill-rule="evenodd"/>
                    <path d="m982.64 158.42c-39.443-39.443-103.39-39.443-142.84 0-39.443 39.443-39.443 103.39 0 142.84 39.442 39.443 103.39 39.443 142.84 0 39.441-39.443 39.441-103.39 0-142.84zm-25.456 25.456c-25.384-25.384-66.54-25.384-91.924 0s-25.384 66.539 0 91.924c25.384 25.384 66.54 25.384 91.924 0 25.384-25.385 25.384-66.54 0-91.924z" clip-rule="evenodd" fill-opacity=".15" fill-rule="evenodd"/>
                    <path d="m495.44 533.89 111.02 111.02 314.54-314.54c-29.003 2.805-58.986-6.899-81.198-29.111-22.616-22.615-32.264-53.287-28.946-82.777l-315.42 315.42z" fill="#D9D9D9"/>
                    <path d="m495.44 533.89 111.02 111.02 314.54-314.54c-29.003 2.805-58.986-6.899-81.198-29.111-22.616-22.615-32.264-53.287-28.946-82.777l-315.42 315.42z" fill-opacity=".15"/>
                    <path d="m413.42 727.64c39.443 39.443 103.39 39.443 142.84 0s39.443-103.39 0-142.84-103.39-39.443-142.84 0-39.443 103.39 0 142.84zm25.456-25.456c25.384 25.384 66.54 25.384 91.924 0s25.384-66.54 0-91.924-66.54-25.384-91.924 0-25.384 66.54 0 91.924z" clip-rule="evenodd" fill="#D9D9D9" fill-rule="evenodd"/>
                    <path d="m413.42 727.64c39.443 39.443 103.39 39.443 142.84 0s39.443-103.39 0-142.84-103.39-39.443-142.84 0-39.443 103.39 0 142.84zm25.456-25.456c25.384 25.384 66.54 25.384 91.924 0s25.384-66.54 0-91.924-66.54-25.384-91.924 0-25.384 66.54 0 91.924z" clip-rule="evenodd" fill-opacity=".15" fill-rule="evenodd"/>
                    <path d="m900.62 352.16-111.02-111.02-314.54 314.54c29.003-2.805 58.987 6.898 81.199 29.11 22.615 22.616 32.264 53.288 28.945 82.778l315.42-315.42z" fill="#D9D9D9"/>
                    <path d="m900.62 352.16-111.02-111.02-314.54 314.54c29.003-2.805 58.987 6.898 81.199 29.11 22.615 22.616 32.264 53.288 28.945 82.778l315.42-315.42z" fill-opacity=".15"/>
                    <path d="m982.64 158.42c-39.443-39.443-103.39-39.443-142.84 0-39.443 39.443-39.443 103.39 0 142.84 39.442 39.443 103.39 39.443 142.84 0 39.441-39.443 39.441-103.39 0-142.84zm-25.456 25.456c-25.384-25.384-66.54-25.384-91.924 0s-25.384 66.539 0 91.924c25.384 25.384 66.54 25.384 91.924 0 25.384-25.385 25.384-66.54 0-91.924z" clip-rule="evenodd" fill="#D9D9D9" fill-rule="evenodd"/>
                    <path d="m982.64 158.42c-39.443-39.443-103.39-39.443-142.84 0-39.443 39.443-39.443 103.39 0 142.84 39.442 39.443 103.39 39.443 142.84 0 39.441-39.443 39.441-103.39 0-142.84zm-25.456 25.456c-25.384-25.384-66.54-25.384-91.924 0s-25.384 66.539 0 91.924c25.384 25.384 66.54 25.384 91.924 0 25.384-25.385 25.384-66.54 0-91.924z" clip-rule="evenodd" fill-opacity=".15" fill-rule="evenodd"/>
                    <path d="m495.44 533.89 111.02 111.02 314.54-314.54c-29.003 2.805-58.986-6.899-81.198-29.111-22.616-22.615-32.264-53.287-28.946-82.777l-315.42 315.42z" fill="#D9D9D9"/>
                    <path d="m495.44 533.89 111.02 111.02 314.54-314.54c-29.003 2.805-58.986-6.899-81.198-29.111-22.616-22.615-32.264-53.287-28.946-82.777l-315.42 315.42z" fill-opacity=".15"/>
                    <path d="m413.42 727.64c39.443 39.443 103.39 39.443 142.84 0s39.443-103.39 0-142.84-103.39-39.443-142.84 0-39.443 103.39 0 142.84zm25.456-25.456c25.384 25.384 66.54 25.384 91.924 0s25.384-66.54 0-91.924-66.54-25.384-91.924 0-25.384 66.54 0 91.924z" clip-rule="evenodd" fill="#D9D9D9" fill-rule="evenodd"/>
                    <path d="m413.42 727.64c39.443 39.443 103.39 39.443 142.84 0s39.443-103.39 0-142.84-103.39-39.443-142.84 0-39.443 103.39 0 142.84zm25.456-25.456c25.384 25.384 66.54 25.384 91.924 0s25.384-66.54 0-91.924-66.54-25.384-91.924 0-25.384 66.54 0 91.924z" clip-rule="evenodd" fill-opacity=".15" fill-rule="evenodd"/>
                    <path d="m900.62 352.16-111.02-111.02-314.54 314.54c29.003-2.805 58.987 6.898 81.199 29.11 22.615 22.616 32.264 53.288 28.945 82.778l315.42-315.42z" fill="#D9D9D9"/>
                    <path d="m900.62 352.16-111.02-111.02-314.54 314.54c29.003-2.805 58.987 6.898 81.199 29.11 22.615 22.616 32.264 53.288 28.945 82.778l315.42-315.42z" fill-opacity=".15"/>
                    <path d="m911 130c-55.781 0-101 45.219-101 101s45.219 101 101 101 101-45.219 101-101-45.223-101-101-101zm0 36c-35.899 0-65 29.102-65 65s29.101 65 65 65c35.898 0 65-29.102 65-65s-29.102-65-65-65z" clip-rule="evenodd" fill="#D9D9D9" fill-rule="evenodd"/>
                    <path d="m832 740h157v-444.83c-18.524 22.492-46.588 36.832-78 36.832-31.983 0-60.494-14.866-79-38.065v446.06z" fill="#D9D9D9"/>
                    <path d="m910.77 1112.2-202.46-376.66h404.92l-202.46 376.66z" fill="#D9D9D9"/>
                    <circle cx="911" cy="230" r="45" fill="#D9D9D9"/>
                    <circle cx="487" cy="655" r="45" fill="#D9D9D9"/>">
                    <span class="actionEchoToolTip">Recording</span>
              `
            console.log(document)
            console.log()
            document.body.appendChild(logger.indicator.elem)
          }
          if (way) {
            logger.indicator.elem.style = "right:10px; z-index: 100000;"
          } else {
            logger.indicator.elem.style.right = "-100px"
            setTimeout(() => {
              logger.indicator.elem.style.zIndex = "-100000";
            }, 500);
          }
        }
      },
      actions: [],
      browserOS: undefined,
      targetElement: undefined,
      keyTable: [
        {
          mac: { key: "v", metaKey: true },
          default: { key: "v", ctrlKey: true },
          getKeyData: () => {
            return {};

          }
        },
        {
          mac: { key: "z", metaKey: true },
          default: { key: "z", ctrlKey: true },
          getKeyData: () => { return { key: "undo" } }
        },
        {
          mac: { key: "z", metaKey: true, shiftKey: true },
          default: { key: "y", ctrlKey: true },
          getKeyData: () => { return { key: "redo" } }
        },
        {
          mac: { key: "x", metaKey: true },
          default: { key: "x", ctrlKey: true },
          getKeyData: (event) => { return { key: "cut", selection: logger.getSelection(event.target) } }
        },
        {
          mac: { key: "a", metaKey: true },
          default: { key: "a", ctrlKey: true },
          getKeyData: () => { return { key: "all" } }
        },
      ],
      templates: {
        click: {
          action: "log",
          type: "click",
          specifier: undefined,
          textContext: undefined,
        },
        input: {
          action: "log",
          type: "key",
          specifier: undefined,
          key: undefined,
        }
      },
      start: () => {
        logger.indicator.toggle(true)
        document.addEventListener('click', logger.eventHandler);
        document.addEventListener('keydown', logger.eventHandler);
        document.addEventListener("paste", (e) => {
          let log = { type: "key", selection: logger.getSelection(e.target), key: "paste", text: e.clipboardData.getData('text/plain') };
          if (text != "" && text != undefined) {
            //data.port.postMessage(log);
            logger.actions.push(log)
          }
        });
      },
      stop: () => {
        logger.indicator.toggle(false)
        document.removeEventListener('click', logger.eventHandler);
        document.removeEventListener('keydown', logger.eventHandler);
      },
      matchKeys: (event, key) => {
        let keys = Object.keys(key);
        for (let keyName of keys) {
          if (event[keyName] != key[keyName]) {
            return false;
          }
        }
        return true;
      },
      eventHandler: async (event) => {
        let target = event.target;
        let log;
        if (event.type === "click") {
          log = { ...logger.templates.click };
          log.specifier = logger.getSpecifier(target);
          if ((target.tagName === "INPUT" && target.type === "text") || target.tagName === "TEXTAREA" || target.contentEditable === "true") {
            log.textContext = target.contentEditable === "true" ? target.innerText : target.value;
            log.caret = logger.getSelection(target);
            logger.targetElement = log.specifier;
          } else if (target.tagName === "INPUT" && target.type === "password") {
            logger.indicator.error();
            log.type = "error";
            log.message = "Password Recording isn't Allowed";
            log.level = "end";
          }
        } else if (event.type === "keydown" || event.type === "keyup" || event.type === "keypress") {
          log = { ...logger.templates.input };
          log.specifier = logger.targetElement != undefined ? logger.targetElement : logger.getSpecifier(target);
          if ((event.metaKey || event.ctrlKey) && event.key.length === 1) {
            if (!logger.browserOS) {
              if (navigator.userAgent.indexOf("Macintosh") != -1) {
                logger.browserOS = "mac";
              } else {
                logger.browserOS = "default";
              }
            }
            for (let action of logger.keyTable) {
              if (logger.matchKeys(event, action[logger.browserOS])) {
                Object.assign(log, await action.getKeyData(event));
                break;
              }
            }
          } else if (event.key.length > 1) {
            if (event.key === "Enter") {
              log.key = "Enter";
            } else if (event.key === "Backspace") {
              log.key = "Backspace";
            } else if (event.key === "Delete") {
              log.key = "Delete";
            } else if (event.key === "ArrowLeft") {
              log.key = "ArrowLeft";
            } else if (event.key === "ArrowRight") {
              log.key = "ArrowRight";
            }

          } else if (event.key.length === 1) {
            log.type = "input";
            log.key = event.key;
            log.selection = logger.getSelection(event.target);
          };
        }
        if ((log.type === "key" && log.key != undefined) || log.type != "key") {
          //data.port.postMessage(log);
          logger.actions.push(log)
        }

      },
      getSelection: (target) => {
        if ((target.tagName === "INPUT" && target.type === "text") || target.tagName === "TEXTAREA") {
          return target.selectionStart + "-" + target.selectionEnd
        } else {
          let sel = window.getSelection()
          if (sel.baseOffset > sel.extentOffset) {
            return sel.extentOffset + "-" + sel.baseOffset;
          } else {
            return sel.baseOffset + "-" + sel.extentOffset;
          }
        }
      },
      getSpecifier: (element) => {
        let specifier = element.tagName;
        outer: {
          let matchList = [];
          if (element.id.length > 0) {
            specifier += `#${element.id}`;
            matchList = document.querySelectorAll(specifier)
            if (matchList.length === 1) {
              break outer;
            }
          } else if (element.classList.length > 0) {
            specifier += `.${element.classList[0]}`;
            matchList = document.querySelectorAll(specifier)
            if (matchList.length === 1) {
              break outer;
            }

          }
          specifier = `--${[...matchList].indexOf(element)}$${specifier}`;
        }
        return specifier;
      },
    }
    window.addEventListener("beforeunload", () => {
      document.actionEchoRecording();
    })
    await new Promise((r) => {
      logger.start();
      document.actionEchoRecording = r;
    })
    logger.stop();
    return logger.actions;
  },
  stopRecordScript: () => {
    document.actionEchoRecording();
  }
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
    clock.checkTime();
  }
});
checkAlarmState();
chrome.storage.local.get(["recording"]).then((result) => {
  recorder.recording = result.recording === undefined ? false : result.recording;
});
chrome.storage.local.get(["scheduledEvents"]).then((result) => {
  if (result.scheduledEvents != undefined) {
    for (let event of result.scheduledEvents) {
      //ui.createTimeEntry(event)
      clock.addSchedule(event);
    }
  }
});
//Tab Management ***************************************************************
/*chrome.tabs.onCreated.addListener((tab) => {
  console.log(`%cSite_Manager: Tab Created`, data.console.sites, tabId)
  console.log(`%cSite_Manager: Adding Tab`, data.console.sites, tabId, tab.url)
  data.tabs.push({
    url: tab.url,
    tabId: tab.id
  })
})*/
chrome.tabs.onCreated.addListener((tab) => {
  console.log(`%cSite_Manager: New Tab Created`, data.console.sites);
  if (data.promiseTabs.tabs.length > 0) {
    console.log(`%cSite_Manager: Checking Promise Tab`, data.console.sites);
    data.promiseTabs.resolveTarget(tab)
    console.log(data.current.tab)
  }
});
chrome.tabs.onRemoved.addListener((tabId) => {
  let tabIndex = data.tabs.findIndex((e) => { e.tabId === tabId });
  if (tabIndex != -1) {
    console.log(`%cSite_Manager: Removing Tab`, data.console.sites, tabId, data.tabs[tabIndex].tab.url)
    data.tabs.splice(tabIndex, 1)
    
  }
  if(data.current.tab !== undefined && data.current.tab.tabId === tabId){
    console.log(`%cSite_Manager: Removing Current Tab`, data.console.sites)
    data.current.tab = undefined;
  }
})
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (recorder.recording) {
    let tabInst = data.tabs.find((e) => { e.tabId === tabId });
    console.log(`%cSite_Manager: Tab Updated`, data.console.sites, tab, changeInfo)
    if (tabInst) {
      tabInst.url = tab.url
    } else {
      data.addTab({ tabId: tabId, url: tab.url })
    }
    if (changeInfo.status === "complete" && data.current.tab.tabId === tabId) {
      //await recorder.logReport
      //chrome.scripting.insertCSS({target: { tabId: tabId }, files: ["../"]})
      recorder.logReport = new Promise(async (resolve) => {
        await chrome.scripting.insertCSS({
          target: { tabId: data.current.tab.tabId },
          files: ['public/siteStyle.css'],
        });
        chrome.scripting.executeScript({ target: { tabId: tabId }, func: recorder.startRecordScript }).then((r) => {
          recorder.logBuffer = recorder.logBuffer.concat(r[0].result)
          resolve();
        })
      });
      recorder.cacheSite("newUrl", tab.url)
    }
  }
  console.log("%cSite_Manager: Change Info and tab ", data.console.sites, changeInfo, tab)
  if (data.current.tab !== undefined && data.current.tab.tabId === tabId) {
    
    data.current.tab.url = tab.url
  }else if (data.current.tab === undefined) {
    data.current.tab = { tabId: tabId, url: tab.url }
  }
});
chrome.tabs.onActivated.addListener((activeInfo) => {
  /*chrome.scripting.executeScript({ target: {tabId: activeInfo.tabId}, func : recorder.clock}).then((r) => {
    console.log(`%cSite_Manager: response Before change`, data.console.recording, r);
  })*/
  console.log("%cSite_Manager: Activated Tab", data.console.sites)
  chrome.tabs.get(activeInfo.tabId, async (tab) => {
    let tabIndex = data.tabs.findIndex((e) => { e.tabId === activeInfo.tabId });
    let tabInst = undefined
    if (tabIndex === -1 && tab.url.indexOf("chrome://") === -1) {
      tabInst = { tabId: activeInfo.tabId, url: tab.url }
    } else {
      tabInst = data.tabs[tabIndex]
    }
    if (recorder.recording) {
      console.log(`%cSite_Manager: New Active Tab`, data.console.sites, activeInfo)
      if (tabIndex === -1) {
        data.addTab(tabInst);
        tabIndex = data.tabs.length - 1;
      }
      if (data.current.tab != tabInst) {
        chrome.scripting.executeScript({ target: { tabId: data.current.tab.tabId }, func: recorder.stopRecordScript })
        await recorder.logReport;
        recorder.logReport = new Promise(async (resolve) => {
          await chrome.scripting.insertCSS({
            target: { tabId: data.current.tab.tabId },
            files: ['public/siteStyle.css'],
          });
          chrome.scripting.executeScript({ target: { tabId: tabInst.tabId }, func: recorder.startRecordScript }).then((r) => {
            recorder.logBuffer = recorder.logBuffer.concat(r[0].result)
            resolve();
          })
        });
        recorder.cacheSite("newTab", tab.url)
      }
    }
    data.current.tab = tabInst;
  })

  /*chrome.tabs.get(activeInfo.tabId, (tab) => {
    console.log(`%cSite_Manager: New Active Tab Info`, data.console.sites, tab)
    if (tab.url != "chrome://newtab/") {
      let port = data.portArray.find((port) => port.tabId === activeInfo.tabId);
      if (port) {
        recorder.cacheSite("newTab", tab.url);
        recorder.setCurrentPort(port);
      }else{

      }
    }
    data.current.tab = activeInfo.tabId;
  })*/
});
//Tab Management end ***********************************************************
/*chrome.runtime.onConnect.addListener(function (port) {
  console.log(`%cSite_Manager: Connecting to Port`, data.console.sites, port)
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
        let match = data.current.editor.editPromises.find((promise) => promise.tabId === port.tabId);
        if (match) {
          match.resolve(msg.actionList);
          data.current.editor.editPromises.splice(data.current.editor.editPromises.indexOf(match), 1);
        }
        break;
      case "closeEditor":
        //handles messages from the port Editor ui to close itself using the data.closeEditor function
        data.closeEditor()
        break;
      case "testLog":
        port.postMessage({ action: "testCase" })
        break;
    }
  });
  port.onDisconnect.addListener(data.disconnectPort);
  port.tabId = port.sender.tab.id;
  let testFunc = async () => {
    console.log("Start of Test")
    console.log("End Test")
    return await new Promise((resolve) => {
      setTimeout(() => {
        resolve("Poop");
      }, 9000);
    });
  }
  chrome.scripting.executeScript({ target: { tabId: port.tabId }, func: testFunc }).then((f) => {
    console.log(`%cSite_Manager: Promise`, data.console.sites, f)
  });
  //Checks if the port's tab is already in the portArray
  let tabIndex = 0;
  let tabMatch = data.portArray.find((test, index) => {
    tabIndex = index;
    return test.tabId === port.sender.tab.id
  });
  if (tabMatch) {
    //if the port it is replacing is the current port, replace it
    if (data.current.port === tabMatch) {
      recorder.cacheSite("newUrl", tabMatch.name);
      recorder.setCurrentPort(port);
      if (recorder.recording) {
        port.postMessage({ action: "startRecord" });
      }
    }
    //remove the old port from the array
    data.disconnectPort(tabMatch, tabIndex);
  }
  if (port.tabId === data.current.tab) {
    recorder.cacheSite("newTab", port.name);
    data.current.port = port;
  }
  data.portArray.push(port);
  console.debug("Port Name: " + port.name)
  data.promiseTabs.resolveTarget(port);
});*/
chrome.runtime.onMessage.addListener((request, sender, reply) => {
  console.log("%cIndex: Message from UI", data.console.index, request)
  switch (request.action) {
    case "startRecord":
      recorder.startRecord(reply);
      break;
    case "stopRecord":
      recorder.stopRecord(reply);
      break;
    case "link":
      try {
        data.openTab(request.url)
        reply({ log: "success" })
      } catch (e) {
        reply({ log: "failed" })
      }
      break;
    case "scheduleActionSet":
      clock.addSchedule(request.set);
      reply({ log: "added" })
      break;
    case "removeScheduledAction":
      let index = clock.schedule.actionLists.findIndex((test) => test.id === request.id);
      clock.removeScheduledAction(index);
      reply({ log: "removed" })
      break;
    case "runActionSet":
      runner.runActions(request.set.actions);
      break;
    /*case "openEditor":
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
      break;*/
    case "actionLog":
      let copy = { ...request.actionLog };
      data.anonymizeAction(copy);
      try {
        addDoc(collection(firebase.db, "actions"), copy);
        reply({ log: "success" });
      } catch (e) {
        console.log("%cError: Firebase Not Connected ", data.console.error, e);
        reply({ log: "failed" });
      }

      break;
    case "setPreferences":
      if (request.preferences) {
        data.preferences = request.preferences;
        if (request.preferences.sendActData === "true" && firebase.app === undefined) {
          firebase.app = initializeApp(Config);
          firebase.db = getFirestore(firebase.app);
          console.log("%cFirebase: Firebase Database Connected", data.console.firebase, firebase.app)
        } else if (request.preferences.sendActData === "false" && firebase.app != undefined) {
          firebase.app = undefined;
          firebase.db = undefined;
          console.log("%cFirebase: Firebase Disconnected", data.console.firebase, firebase)
        }
        reply({ log: "success" });
      } else {
        reply({ log: "failed" });
      }
      break;
    case "init":
      data.uiLink = sender;
      reply({ log: "init", lists: clock.schedule.actionLists, errors: errorLog });
      errorLog = []
      break;
  }
  return true;
});
console.group("%cBackground Color Code", "font-size: 20px;")
console.log("%cClock", data.console.clock)
console.log("%cFirebase", data.console.firebase)
console.log("%cBRecording", data.console.recording)
console.log("%cSite_Manager", data.console.sites)
console.log("%cError", data.console.error)
console.log("%cIndex", data.console.index)
console.groupEnd()