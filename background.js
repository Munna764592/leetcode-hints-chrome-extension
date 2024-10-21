chrome.runtime.onInstalled.addListener(() => {
    const apiKey = "apikey";
    chrome.storage.local.set({ api_key: apiKey }, () => {
        // console.log('API key has been stored');
    });
});
