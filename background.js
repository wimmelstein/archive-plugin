// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'fetchArchive') {
    // Make the fetch request with appropriate headers
    fetch(request.url, { 
      redirect: 'follow',
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      }
    })
      .then(async response => {
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
}); 