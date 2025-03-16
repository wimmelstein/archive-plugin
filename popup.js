// Function to check if a URL exists in an archive and get the most recent thumbnail
async function checkArchiveExists(url, archiveDomain) {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    
    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Look for thumbnails in the page
    const thumbnails = doc.querySelectorAll('img[src*="thumb"]');
    if (thumbnails.length > 0) {
      // Get the last thumbnail (most recent)
      const lastThumbnail = thumbnails[thumbnails.length - 1];
      return {
        exists: true,
        url: url,
        thumbnail: lastThumbnail.src
      };
    }
    return null;
  } catch (error) {
    console.error('Error checking archive:', error);
    return null;
  }
}

// Function to create archive URL
function createArchiveUrl(url, archiveDomain) {
  return url.replace('://', `://${archiveDomain}/`);
}

// Function to update status message
function updateStatus(message) {
  document.getElementById('status').textContent = message;
}

document.getElementById('archiveButton').addEventListener('click', async () => {
  const button = document.getElementById('archiveButton');
  const status = document.getElementById('status');
  
  // Disable button and show initial status
  button.disabled = true;
  updateStatus('Checking archives...');
  
  try {
    // Get the current active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (tab) {
      const url = new URL(tab.url);
      
      // Skip if the URL is already an archive URL
      if (url.hostname.includes('archive.vn') || url.hostname.includes('archive.is')) {
        updateStatus('Already on an archive site');
        button.disabled = false;
        return;
      }

      // List of archive sites to try
      const archiveSites = [
        { domain: 'archive.vn', name: 'Archive.vn' },
        { domain: 'archive.is', name: 'Archive.is' }
      ];

      // Try each archive site
      for (const site of archiveSites) {
        updateStatus(`Checking ${site.name}...`);
        const archiveUrl = createArchiveUrl(tab.url, site.domain);
        const result = await checkArchiveExists(archiveUrl, site.domain);
        
        if (result && result.exists) {
          // Update the current tab URL
          chrome.tabs.update(tab.id, { url: result.url });
          updateStatus(`Found on ${site.name}`);
          return;
        }
      }

      // If we get here, no archive was found
      updateStatus('No archive found');
      alert('No archive found for this page in any of the supported archive sites.');
    }
  } catch (error) {
    updateStatus('Error checking archives');
    console.error('Error:', error);
  } finally {
    button.disabled = false;
  }
}); 