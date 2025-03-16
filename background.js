// Listen for messages from the popup
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log('Background script received message:', request);
    
    if (request.type === 'fetchArchive') {
      // Make the fetch request with appropriate headers
      fetch(request.url, { 
        redirect: 'follow',
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      })
        .then(async response => {
          console.log('Fetch response:', response);
          const html = await response.text();
          sendResponse({
            ok: response.ok,
            status: response.status,
            statusText: response.statusText,
            url: response.url,
            html: html
          });
        })
        .catch(error => {
          console.error('Error fetching archive:', error);
          sendResponse({
            ok: false,
            statusText: error.message
          });
        });
      
      return true; // Will respond asynchronously
    }
  }
);

// Log when the background script is loaded
console.log('Background script loaded'); 