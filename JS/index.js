let autoStartButton = document.getElementById('autoStartButton');
autoStartButton.addEventListener('click', async () => {
    setPage("recordPage");
    /*chrome.runtime.sendMessage({ action: "startRecord" }, function (response) {
      
    });*/
});
function setPage(name){
    let pages = document.getElementsByClassName('contentPage');
    for (let page of pages) {
        if(page.id == name){
          page.classList.remove('hiddenPage');
        }else{
          page.classList.add('hiddenPage');
        }
    }
}
