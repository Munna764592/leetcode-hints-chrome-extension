const converter = new showdown.Converter();

document.addEventListener('DOMContentLoaded', function () {
    const accordionButtons = document.querySelectorAll('.accordion-button');

    accordionButtons.forEach(button => {
        button.addEventListener('click', function () {
            const content = this.nextElementSibling;

            this.classList.toggle('active');

            if (content.style.maxHeight) {
                content.style.maxHeight = null;
            } else {
                content.style.maxHeight = content.scrollHeight + 'px';
            }
        });
    });
});

let question = '';
function displayExtractedData() {
    chrome.storage.local.get('extractedData', (result) => {
        question = result.extractedData;
        const contentDiv = document.getElementById('content');
        if (contentDiv) {
            contentDiv.innerHTML = result.extractedData;
        }
    });
}
document.addEventListener('DOMContentLoaded', displayExtractedData);

// Get references to elements
const gethints = document.getElementById('gethints');
const loader = document.getElementById('loader');  // Add a loader element in your HTML
const hintsContainer = document.getElementById('hintsContainer');

// Function to show loader
function showLoader() {
    loader.style.display = 'block';
    gethints.disabled = true;
}

// Function to hide loader
function hideLoader() {
    loader.style.display = 'none';   // Hide the loader
    gethints.disabled = false;       // Enable the button
}
let api_key = '';
chrome.storage.local.get('api_key', (result) => {
    api_key = result.api_key;
});

let dataObject = {};
gethints.addEventListener('click', async () => {
    showLoader();

    try {
        // Step 1: Check if hintsData exists in chrome.storage for the specific question
        chrome.storage.local.get('hintsData', (result) => {
            dataObject = result.hintsData || {};  // Get existing hintsData or initialize to empty object

            if (dataObject[question]) {
                // If hints already exist for the question, use them
                // console.log('Hints found in storage:', dataObject[question]);
                populateHints(dataObject[question]);
                hideLoader();
            } else {
                // Step 2: If no hints exist, fetch from API
                fetchHintsFromAPI();
            }
        });
    } catch (error) {
        console.log("Error checking hints from storage:", error);
        hideLoader();
    }
});

async function fetchHintsFromAPI() {
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${api_key}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            {
                                text: `I need to generate multiple hints for a specific LeetCode problem. Please provide these hints as an array of strings inside object name hints, each hint breaking down the solution into manageable steps or concepts.
                                    LeetCode Problem: ${question}
                                    Hints Structure:
                                    Each hint should guide the user toward understanding the problem better and facilitate a step-by-step approach to finding the solution.
                                    Focus on breaking down complex concepts into simpler, actionable steps.
                                    Ensure that each hint is concise and informative.`
                            }
                        ]
                    }
                ]
            })
        });

        const data = await response.json();

        if (data.candidates && data.candidates[0].content.parts[0].text) {
            const markdownText = data.candidates[0].content.parts[0].text;
            const htmlContent = converter.makeHtml(markdownText);
            const hints = document.createElement('div');
            hints.classList.add('grammafix-k');
            hints.innerHTML = htmlContent;
            hints.style.display = 'none';
            document.getElementById('content').appendChild(hints);

            const questionhints = document.querySelector('.grammafix-k pre code').textContent;
            const jsondata = JSON.parse(questionhints);
            populateHints(jsondata.hints);

            // Step 3: Store the new hints in chrome.storage
            dataObject[question] = jsondata.hints;
            chrome.storage.local.set({ hintsData: dataObject }, () => {
                // console.log('New hints stored in chrome storage:', dataObject);
            });
        }
    } catch (error) {
        console.log("Error fetching hints from API:", error);
    } finally {
        hideLoader();
    }
}

function populateHints(hintsArray) {
    hintsContainer.innerHTML = '';

    hintsArray.forEach((hint, index) => {
        const accordionItem = document.createElement('div');
        accordionItem.className = 'accordion-item';

        const button = document.createElement('button');
        button.className = 'accordion-button';
        button.textContent = `Hint ${index + 1}`;

        const accordionContent = document.createElement('div');
        accordionContent.className = 'accordion-content';
        accordionContent.style.maxHeight = null;

        const accordionBody = document.createElement('div');
        accordionBody.className = 'accordion-body';
        accordionBody.textContent = hint;

        // Append the body to the content div
        accordionContent.appendChild(accordionBody);

        // Set up the toggle functionality
        button.onclick = () => {
            button.classList.toggle('active');

            if (accordionContent.style.maxHeight) {
                accordionContent.style.maxHeight = null;  // Collapse
            } else {
                accordionContent.style.maxHeight = accordionContent.scrollHeight + 'px';
            }
        };

        // Append the button and the content to the accordion item
        accordionItem.appendChild(button);
        accordionItem.appendChild(accordionContent);

        // Append the accordion item to the hints container
        hintsContainer.appendChild(accordionItem);
    });
}
