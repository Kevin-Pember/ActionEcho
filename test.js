chrome.runtime.sendMessage({ action: "testLog"}, (response) => {
  });
let frame = document.getElementById('frameView')

frame.addEventListener('load', () => {
    console.log(frame.contentWindow);
});