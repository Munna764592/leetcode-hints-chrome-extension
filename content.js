let previousData = null;

function extractAnchorContent() {
    const anchorElement = document.querySelector('a.no-underline[href*="/problems/"]');
    if (anchorElement) {
        const currentData = anchorElement.innerHTML;

        if (currentData !== previousData) {
            previousData = currentData;

            try {
                chrome.storage.local.set({ extractedData: currentData }, () => {
                    // if (chrome.runtime.lastError) {
                    //     console.error('Error setting data:', chrome.runtime.lastError);
                    // } else {
                    //     console.log('Data saved:', currentData);
                    // }
                });
            } catch (error) {
                // console.error('Failed to save data due to context invalidation:', error);
            }
        }
    } else {
        // console.log('Anchor element not found');
    }
}

function setupObserver() {
    const observer = new MutationObserver((mutationsList) => {
        for (const mutation of mutationsList) {
            // Check if the mutation is related to the anchor element being modified
            if (mutation.type === 'childList') {
                extractAnchorContent();
            }
        }
    });

    const config = { childList: true, subtree: true };
    observer.observe(document.body, config);
}

function init() {
    extractAnchorContent();
    setupObserver();
}

// Initialize the functions on window load
window.addEventListener('load', () => {
    if (window.location.href.includes('leetcode.com')) { 
        init();
    }
});
