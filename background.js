chrome.runtime.onInstalled.addListener(() => {
    const apiKey = "AIzaSyBm91vHhnByN054IfDGKslmkk445TgXG_8";
    chrome.storage.local.set({ api_key: apiKey }, () => {
        // console.log('API key has been stored');
    });
});
