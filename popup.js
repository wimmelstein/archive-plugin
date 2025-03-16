document.getElementById('archiveButton').addEventListener('click', async () => {
  // Get the current active tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  if (tab) {
    const url = new URL(tab.url);
    
    // Skip if the URL is already an archive.vn URL
    if (url.hostname.includes('archive.vn')) {
      return;
    }

    // Create the archive.vn URL
    const archiveUrl = tab.url.replace('://', '://archive.vn/');
    
    // Update the current tab URL
    chrome.tabs.update(tab.id, { url: archiveUrl });
  }
}); 