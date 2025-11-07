/**
 * PWRFlow Notate - Popup Script
 */

document.addEventListener('DOMContentLoaded', async () => {
  // Load statistics
  await loadStats();

  // Check if on Power Automate page
  checkPageStatus();

  // Event listeners
  document.getElementById('export-btn').addEventListener('click', exportAnnotations);
  document.getElementById('clear-btn').addEventListener('click', clearAnnotations);
});

/**
 * Load annotation statistics
 */
async function loadStats() {
  try {
    const result = await chrome.storage.local.get(['annotations']);
    const allAnnotations = result.annotations || {};

    let totalAnnotations = 0;
    const flowCount = Object.keys(allAnnotations).length;

    Object.values(allAnnotations).forEach(flowAnnotations => {
      totalAnnotations += Object.keys(flowAnnotations).length;
    });

    document.getElementById('annotation-count').textContent = totalAnnotations;
    document.getElementById('flow-count').textContent = flowCount;
  } catch (error) {
    console.error('Error loading stats:', error);
  }
}

/**
 * Check if currently on a Power Automate page
 */
async function checkPageStatus() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const statusElement = document.getElementById('status');

    if (tab.url.includes('powerautomate.com') || tab.url.includes('flow.microsoft.com')) {
      statusElement.textContent = '✓ Active on this page';
      statusElement.classList.remove('inactive');
    } else {
      statusElement.textContent = '⚠ Navigate to Power Automate to use';
      statusElement.classList.add('inactive');
    }
  } catch (error) {
    console.error('Error checking page status:', error);
  }
}

/**
 * Export annotations as JSON
 */
async function exportAnnotations() {
  try {
    const result = await chrome.storage.local.get(['annotations']);
    const annotations = result.annotations || {};

    const dataStr = JSON.stringify(annotations, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const filename = `pwrflow-annotations-${timestamp}.json`;

    // Download the file
    await chrome.downloads.download({
      url: url,
      filename: filename,
      saveAs: true
    });

    // Show success message
    const btn = document.getElementById('export-btn');
    const originalText = btn.textContent;
    btn.textContent = '✓ Exported!';
    btn.style.background = '#44ff44';

    setTimeout(() => {
      btn.textContent = originalText;
      btn.style.background = '';
    }, 2000);
  } catch (error) {
    console.error('Error exporting annotations:', error);
    alert('Error exporting annotations. Please try again.');
  }
}

/**
 * Clear all annotations
 */
async function clearAnnotations() {
  const confirmed = confirm(
    'Are you sure you want to delete ALL annotations from ALL flows?\n\n' +
    'This action cannot be undone. Consider exporting your annotations first.'
  );

  if (!confirmed) return;

  try {
    await chrome.storage.local.set({ annotations: {} });

    // Update stats
    document.getElementById('annotation-count').textContent = '0';
    document.getElementById('flow-count').textContent = '0';

    // Show success message
    const btn = document.getElementById('clear-btn');
    const originalText = btn.textContent;
    btn.textContent = '✓ Cleared!';

    setTimeout(() => {
      btn.textContent = originalText;
    }, 2000);

    // Reload current tab if on Power Automate
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab.url.includes('powerautomate.com') || tab.url.includes('flow.microsoft.com')) {
      chrome.tabs.reload(tab.id);
    }
  } catch (error) {
    console.error('Error clearing annotations:', error);
    alert('Error clearing annotations. Please try again.');
  }
}
