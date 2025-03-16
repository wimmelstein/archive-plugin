// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'fetchArchive') {
    // Make the fetch request
    fetch(request.url, { redirect: 'follow' })
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