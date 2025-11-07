/**
 * PWRFlow Notate - Popup Script
 */

document.addEventListener('DOMContentLoaded', async () => {
  // Load statistics
  await loadStats();

  // Check if on Power Automate page
  checkPageStatus();

  // Event listeners
  document.getElementById('view-annotations-btn').addEventListener('click', viewAnnotations);
  document.getElementById('export-btn').addEventListener('click', exportAnnotations);
  document.getElementById('clear-btn').addEventListener('click', clearAnnotations);
  document.getElementById('close-annotations-btn').addEventListener('click', closeAnnotationsModal);

  // Close modal on background click
  document.getElementById('annotations-modal').addEventListener('click', (e) => {
    if (e.target.id === 'annotations-modal') {
      closeAnnotationsModal();
    }
  });
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
 * View annotations for current flow
 */
async function viewAnnotations() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // Check if on Power Automate
    if (!tab.url.includes('powerautomate.com') && !tab.url.includes('flow.microsoft.com')) {
      alert('Please navigate to a Power Automate flow to view annotations.');
      return;
    }

    // Get annotations for current URL
    const result = await chrome.storage.local.get(['annotations']);
    const allAnnotations = result.annotations || {};
    const flowAnnotations = allAnnotations[tab.url] || {};

    // Display the modal
    displayAnnotationsList(flowAnnotations);

  } catch (error) {
    console.error('Error loading annotations:', error);
    alert('Error loading annotations. Please try again.');
  }
}

/**
 * Display annotations in the modal
 */
function displayAnnotationsList(annotations) {
  const modal = document.getElementById('annotations-modal');
  const listContainer = document.getElementById('annotations-list');

  // Clear existing content
  listContainer.innerHTML = '';

  const entries = Object.entries(annotations);

  if (entries.length === 0) {
    listContainer.innerHTML = `
      <div class="no-annotations">
        <div class="no-annotations-icon">📝</div>
        <p>No annotations for this flow yet.</p>
        <p style="font-size: 11px; margin-top: 8px;">Click the 📝 buttons in your flow to add annotations!</p>
      </div>
    `;
  } else {
    // Sort by element ID for consistent display
    entries.sort((a, b) => a[0].localeCompare(b[0]));

    entries.forEach(([elementId, annotation]) => {
      const item = document.createElement('div');
      item.className = 'annotation-item';

      // Extract action name from element ID (if possible)
      let actionName = elementId;
      if (elementId.length > 50) {
        actionName = elementId.substring(0, 50) + '...';
      }

      // Build the HTML
      let html = `<div class="annotation-item-header">📌 ${escapeHtml(actionName)}</div>`;

      if (annotation.comment) {
        html += `<div class="annotation-item-comment">${escapeHtml(annotation.comment)}</div>`;
      }

      if (annotation.color || annotation.tags?.length > 0) {
        html += '<div class="annotation-item-meta">';

        if (annotation.color) {
          const colorInfo = getColorInfo(annotation.color);
          html += `<span class="annotation-color-badge" style="background-color: ${colorInfo.hex}">${colorInfo.name}</span>`;
        }

        if (annotation.tags?.length > 0) {
          annotation.tags.forEach(tag => {
            html += `<span class="annotation-tag">${escapeHtml(tag)}</span>`;
          });
        }

        html += '</div>';
      }

      item.innerHTML = html;
      listContainer.appendChild(item);
    });
  }

  // Show the modal
  modal.style.display = 'block';
}

/**
 * Close annotations modal
 */
function closeAnnotationsModal() {
  const modal = document.getElementById('annotations-modal');
  modal.style.display = 'none';
}

/**
 * Get color information
 */
function getColorInfo(colorValue) {
  const colors = {
    'red': { name: 'Red', hex: '#ff4444' },
    'orange': { name: 'Orange', hex: '#ff8c00' },
    'yellow': { name: 'Yellow', hex: '#ffd700' },
    'green': { name: 'Green', hex: '#44ff44' },
    'blue': { name: 'Blue', hex: '#4444ff' },
    'purple': { name: 'Purple', hex: '#9944ff' },
    'pink': { name: 'Pink', hex: '#ff44ff' }
  };
  return colors[colorValue] || { name: 'Unknown', hex: '#999' };
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
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
