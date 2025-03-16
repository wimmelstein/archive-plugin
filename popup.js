// Function to check if a URL exists in an archive and get all versions
async function checkArchiveExists(url, archiveDomain) {
  try {
    console.log('Checking archive URL:', url);
    // Send message to background script to make the request
    const response = await chrome.runtime.sendMessage({
      type: 'fetchArchive',
      url: url
    });
    
    if (!response || !response.ok) {
      console.log('Response not OK:', response?.statusText);
      return null;
    }
    
    // Get the final URL after any redirects
    const finalUrl = response.url;
    console.log('Final URL after redirects:', finalUrl);
    
    const html = response.html;
    console.log('Response HTML length:', html.length);
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Look for version links in the page
    const versionLinks = doc.querySelectorAll('a[href*="/"]');
    let versions = [];
    
    for (const link of versionLinks) {
      const href = link.getAttribute('href');
      // Check for both numeric versions and archive IDs
      if (href && (href.match(/\/\d+$/) || href.match(/\/[a-zA-Z0-9]+$/))) {
        const version = href.match(/\/[a-zA-Z0-9]+$/)[0].substring(1);
        versions.push({
          url: `https://${archiveDomain}/${version}`,
          version: version,
          text: link.textContent.trim()
        });
      }
    }
    
    if (versions.length > 0) {
      // Sort versions by number (descending)
      versions.sort((a, b) => b.version.localeCompare(a.version));
      return {
        exists: true,
        url: finalUrl,
        versions: versions
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
  // Remove any existing protocol and clean the URL
  const cleanUrl = url.replace(/^https?:\/\//, '');
  // For archive.is, we need to use a different format
  if (archiveDomain === 'archive.is') {
    return `https://${archiveDomain}/${cleanUrl}`;
  } else {
    // For archive.vn, we need to use the direct format
    return `https://${archiveDomain}/${cleanUrl}`;
  }
}

// Function to update status message
function updateStatus(message) {
  document.getElementById('status').textContent = message;
}

// Function to display versions
function displayVersions(versions, siteName) {
  const versionsDiv = document.getElementById('versions');
  versionsDiv.innerHTML = '';
  
  versions.forEach(version => {
    const div = document.createElement('div');
    div.className = 'version-item';
    div.textContent = `Version ${version.version} - ${version.text || 'No description'}`;
    div.onclick = () => {
      // Remove selection from other items
      document.querySelectorAll('.version-item').forEach(item => {
        item.classList.remove('selected');
      });
      // Add selection to clicked item
      div.classList.add('selected');
      // Update the current tab URL
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          chrome.tabs.update(tabs[0].id, { url: version.url });
        }
      });
    };
    versionsDiv.appendChild(div);
  });
}

// Function to shuffle array
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

document.getElementById('archiveButton').addEventListener('click', async () => {
  const button = document.getElementById('archiveButton');
  const status = document.getElementById('status');
  const versionsDiv = document.getElementById('versions');
  
  // Clear previous versions
  versionsDiv.innerHTML = '';
  
  // Disable button and show initial status
  button.disabled = true;
  updateStatus('Checking archives...');
  
  try {
    // Get the current active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (tab) {
      console.log('Current tab URL:', tab.url);
      const url = new URL(tab.url);
      
      // Skip if the URL is already an archive URL
      if (url.hostname.includes('archive.vn') || url.hostname.includes('archive.is')) {
        updateStatus('Already on an archive site');
        button.disabled = false;
        return;
      }

      // List of archive sites to try
      const archiveSites = shuffleArray([
        { domain: 'archive.vn', name: 'Archive.vn' },
        { domain: 'archive.is', name: 'Archive.is' }
      ]);

      // Try each archive site
      for (const site of archiveSites) {
        updateStatus(`Checking ${site.name}...`);
        const archiveUrl = createArchiveUrl(tab.url, site.domain);
        console.log(`Checking ${site.name} with URL:`, archiveUrl);
        const result = await checkArchiveExists(archiveUrl, site.domain);
        
        if (result && result.exists) {
          updateStatus(`Found ${result.versions.length} versions on ${site.name}`);
          displayVersions(result.versions, site.name);
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