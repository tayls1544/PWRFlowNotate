/**
 * PWRFlow Notate - Popup Script
 */

/**
 * Extract Flow ID from Power Automate URL
 * @param {string} url - The full URL
 * @returns {string|null} - The flow ID or null if not found
 */
function extractFlowId(url) {
  try {
    // Pattern: /flows/{flow-id}
    const flowMatch = url.match(/\/flows\/([a-f0-9-]+)/i);
    if (flowMatch && flowMatch[1]) {
      return flowMatch[1];
    }

    // Fallback: use full URL if we can't extract flow ID
    return url;
  } catch (error) {
    console.error('Error extracting flow ID:', error);
    return url;
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  // Load statistics
  await loadStats();

  // Check if on Power Automate page
  checkPageStatus();

  // Event listeners
  document.getElementById('view-annotations-btn').addEventListener('click', viewAnnotations);
  document.getElementById('export-docs-btn').addEventListener('click', exportDocumentation);
  document.getElementById('export-btn').addEventListener('click', exportAnnotations);
  document.getElementById('import-btn').addEventListener('click', () => {
    document.getElementById('import-file-input').click();
  });
  document.getElementById('import-file-input').addEventListener('change', importAnnotations);
  document.getElementById('clear-btn').addEventListener('click', clearAnnotations);
  document.getElementById('close-annotations-btn').addEventListener('click', closeAnnotationsModal);

  // Color legend toggle
  document.getElementById('color-legend-toggle').addEventListener('click', toggleColorLegend);

  // Search functionality
  const searchInput = document.getElementById('search-input');
  const colorFilter = document.getElementById('color-filter');

  let searchTimeout;
  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      performSearch();
    }, 300); // Debounce search
  });

  colorFilter.addEventListener('change', () => {
    if (searchInput.value.trim()) {
      performSearch();
    }
  });

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
    const result = await chrome.storage.sync.get(['annotations']);
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
    const result = await chrome.storage.sync.get(['annotations']);
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

    // Get annotations for current flow
    const result = await chrome.storage.sync.get(['annotations']);
    const allAnnotations = result.annotations || {};
    const flowId = extractFlowId(tab.url);

    // Try flow ID first, fallback to full URL for backwards compatibility
    const flowAnnotations = allAnnotations[flowId] || allAnnotations[tab.url] || {};

    console.log('Flow ID:', flowId);
    console.log('Annotations count:', Object.keys(flowAnnotations).length);

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
 * Import annotations from JSON file
 */
async function importAnnotations(event) {
  const file = event.target.files[0];
  if (!file) return;

  try {
    const fileContent = await file.text();
    const importedData = JSON.parse(fileContent);

    // Validate the imported data structure
    if (typeof importedData !== 'object' || importedData === null) {
      throw new Error('Invalid annotations file format');
    }

    // Ask user if they want to merge or replace
    const merge = confirm(
      'How would you like to import?\n\n' +
      'OK = Merge with existing annotations\n' +
      'Cancel = Replace all annotations (current annotations will be lost)'
    );

    let finalAnnotations = importedData;

    if (merge) {
      // Merge: combine existing with imported
      const result = await chrome.storage.sync.get(['annotations']);
      const existingAnnotations = result.annotations || {};

      // Merge annotations for each URL
      finalAnnotations = { ...existingAnnotations };

      Object.keys(importedData).forEach(url => {
        if (finalAnnotations[url]) {
          // Merge annotations for this URL
          finalAnnotations[url] = {
            ...finalAnnotations[url],
            ...importedData[url]
          };
        } else {
          // New URL, just add it
          finalAnnotations[url] = importedData[url];
        }
      });
    }

    // Save the annotations
    await chrome.storage.sync.set({ annotations: finalAnnotations });

    // Update stats
    await loadStats();

    // Show success message
    const btn = document.getElementById('import-btn');
    const originalText = btn.textContent;
    btn.textContent = '✓ Imported!';
    btn.style.background = '#44ff44';

    setTimeout(() => {
      btn.textContent = originalText;
      btn.style.background = '';
    }, 2000);

    // Reload current tab if on Power Automate
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab.url.includes('powerautomate.com') || tab.url.includes('flow.microsoft.com')) {
      chrome.tabs.reload(tab.id);
    }

    // Clear the file input
    event.target.value = '';

  } catch (error) {
    console.error('Error importing annotations:', error);
    alert('Error importing annotations. Please check the file format and try again.\n\nError: ' + error.message);
    event.target.value = '';
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
    await chrome.storage.sync.set({ annotations: {} });

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

/**
 * Toggle color legend visibility
 */
function toggleColorLegend() {
  const content = document.getElementById('color-legend-content');
  const icon = document.querySelector('.toggle-icon');

  content.classList.toggle('expanded');
  icon.classList.toggle('expanded');
}

/**
 * Export flow documentation as Markdown
 */
async function exportDocumentation() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // Check if on Power Automate
    if (!tab.url.includes('powerautomate.com') && !tab.url.includes('flow.microsoft.com')) {
      alert('Please navigate to a Power Automate flow to export documentation.');
      return;
    }

    // Get annotations for current flow
    const result = await chrome.storage.sync.get(['annotations']);
    const allAnnotations = result.annotations || {};
    const flowId = extractFlowId(tab.url);

    // Try flow ID first, fallback to full URL for backwards compatibility
    const flowAnnotations = allAnnotations[flowId] || allAnnotations[tab.url] || {};

    if (Object.keys(flowAnnotations).length === 0) {
      alert('No annotations found for this flow. Please add some annotations first.');
      return;
    }

    // Generate Markdown documentation
    const markdown = generateMarkdownDocumentation(flowId, tab.url, flowAnnotations);

    // Create and download the file
    const dataBlob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(dataBlob);

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const filename = `flow-documentation-${flowId.substring(0, 8)}-${timestamp}.md`;

    await chrome.downloads.download({
      url: url,
      filename: filename,
      saveAs: true
    });

    // Show success message
    const btn = document.getElementById('export-docs-btn');
    const originalText = btn.textContent;
    btn.textContent = '✓ Exported!';
    btn.style.background = '#44ff44';

    setTimeout(() => {
      btn.textContent = originalText;
      btn.style.background = '';
    }, 2000);

  } catch (error) {
    console.error('Error exporting documentation:', error);
    alert('Error exporting documentation. Please try again.');
  }
}

/**
 * Generate Markdown documentation from annotations
 */
function generateMarkdownDocumentation(flowId, flowUrl, annotations) {
  const date = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  let markdown = `# Power Automate Flow Documentation\n\n`;
  markdown += `**Generated:** ${date}\n\n`;
  markdown += `**Flow ID:** \`${flowId}\`\n\n`;
  markdown += `**Flow URL:** ${flowUrl}\n\n`;
  markdown += `---\n\n`;

  // Color legend
  markdown += `## Color Guide\n\n`;
  markdown += `| Color | Meaning |\n`;
  markdown += `|-------|----------|\n`;
  markdown += `| 🔴 Red | Critical/Errors |\n`;
  markdown += `| 🟠 Orange | Needs Attention |\n`;
  markdown += `| 🟡 Yellow | Warning |\n`;
  markdown += `| 🟢 Green | Approved/Complete |\n`;
  markdown += `| 🔵 Blue | Information |\n`;
  markdown += `| 🟣 Purple | Dependencies |\n`;
  markdown += `| 🩷 Pink | Review Required |\n\n`;
  markdown += `---\n\n`;

  // Group annotations by color
  const colorGroups = {
    'red': { name: 'Critical/Errors 🔴', items: [] },
    'orange': { name: 'Needs Attention 🟠', items: [] },
    'yellow': { name: 'Warning 🟡', items: [] },
    'green': { name: 'Approved/Complete 🟢', items: [] },
    'blue': { name: 'Information 🔵', items: [] },
    'purple': { name: 'Dependencies 🟣', items: [] },
    'pink': { name: 'Review Required 🩷', items: [] },
    'none': { name: 'Other Notes 📝', items: [] }
  };

  // Organize annotations
  Object.entries(annotations).forEach(([elementId, annotation]) => {
    const color = annotation.color || 'none';
    const group = colorGroups[color] || colorGroups['none'];
    group.items.push({ elementId, annotation });
  });

  // Generate sections for each color group
  Object.entries(colorGroups).forEach(([colorKey, group]) => {
    if (group.items.length > 0) {
      markdown += `## ${group.name}\n\n`;

      group.items.forEach(({ elementId, annotation }) => {
        // Format element name
        let elementName = elementId;
        if (elementId.length > 60) {
          elementName = elementId.substring(0, 60) + '...';
        }

        markdown += `### 📌 ${elementName}\n\n`;

        // Add comment
        if (annotation.comment) {
          markdown += `${annotation.comment}\n\n`;
        }

        // Add tags
        if (annotation.tags && annotation.tags.length > 0) {
          markdown += `**Tags:** ${annotation.tags.map(tag => `\`${tag}\``).join(', ')}\n\n`;
        }

        markdown += `---\n\n`;
      });
    }
  });

  // Footer
  markdown += `\n## Notes\n\n`;
  markdown += `This documentation was generated by **PWRFlow Notate** Chrome Extension.\n\n`;
  markdown += `You can edit this file in any text editor (VS Code, Notepad++, etc.) or convert it to PDF using tools like Pandoc or online Markdown converters.\n\n`;
  markdown += `**Total Annotations:** ${Object.keys(annotations).length}\n`;

  return markdown;
}

/**
 * Perform search across all annotations
 */
async function performSearch() {
  const searchQuery = document.getElementById('search-input').value.trim().toLowerCase();
  const colorFilterValue = document.getElementById('color-filter').value;
  const resultsContainer = document.getElementById('search-results');

  // Hide results if search is empty
  if (!searchQuery) {
    resultsContainer.style.display = 'none';
    return;
  }

  try {
    // Get all annotations
    const result = await chrome.storage.sync.get(['annotations']);
    const allAnnotations = result.annotations || {};

    const searchResults = [];

    // Search through all flows
    Object.entries(allAnnotations).forEach(([flowId, flowAnnotations]) => {
      Object.entries(flowAnnotations).forEach(([elementId, annotation]) => {
        // Apply color filter if set
        if (colorFilterValue && annotation.color !== colorFilterValue) {
          return;
        }

        // Search in comment text
        const commentMatch = annotation.comment &&
          annotation.comment.toLowerCase().includes(searchQuery);

        // Search in tags
        const tagMatch = annotation.tags &&
          annotation.tags.some(tag => tag.toLowerCase().includes(searchQuery));

        // Search in element ID
        const elementMatch = elementId.toLowerCase().includes(searchQuery);

        if (commentMatch || tagMatch || elementMatch) {
          searchResults.push({
            flowId,
            elementId,
            annotation,
            matchedText: annotation.comment || elementId
          });
        }
      });
    });

    // Display results
    displaySearchResults(searchResults, searchQuery);

  } catch (error) {
    console.error('Error performing search:', error);
  }
}

/**
 * Display search results
 */
function displaySearchResults(results, searchQuery) {
  const resultsContainer = document.getElementById('search-results');
  resultsContainer.innerHTML = '';

  if (results.length === 0) {
    resultsContainer.innerHTML = `
      <div class="search-no-results">
        <div>No results found for "${escapeHtml(searchQuery)}"</div>
        <div style="margin-top: 8px; font-size: 10px;">Try a different search term or color filter</div>
      </div>
    `;
    resultsContainer.style.display = 'block';
    return;
  }

  // Add stats header
  const statsDiv = document.createElement('div');
  statsDiv.className = 'search-stats';
  statsDiv.textContent = `Found ${results.length} result${results.length !== 1 ? 's' : ''}`;
  resultsContainer.appendChild(statsDiv);

  // Add each result
  results.forEach(({ flowId, elementId, annotation, matchedText }) => {
    const resultItem = document.createElement('div');
    resultItem.className = 'search-result-item';

    // Truncate flow ID for display
    const displayFlowId = flowId.length > 12 ? flowId.substring(0, 12) + '...' : flowId;

    // Get color info
    const colorInfo = annotation.color ? getColorInfo(annotation.color) : null;

    // Highlight matching text in snippet
    const snippet = highlightText(matchedText.substring(0, 150), searchQuery);

    let html = '<div class="search-result-header">';
    html += `<span class="search-result-flow">${escapeHtml(displayFlowId)}</span>`;

    if (colorInfo) {
      html += `<div class="search-result-color" style="background: ${colorInfo.hex}"></div>`;
    }

    // Action name
    let actionName = elementId.length > 30 ? elementId.substring(0, 30) + '...' : elementId;
    html += `<span class="search-result-action" title="${escapeHtml(elementId)}">${escapeHtml(actionName)}</span>`;
    html += '</div>';

    // Snippet
    if (annotation.comment) {
      html += `<div class="search-result-snippet">${snippet}</div>`;
    }

    // Tags
    if (annotation.tags && annotation.tags.length > 0) {
      html += '<div class="search-result-tags">';
      annotation.tags.forEach(tag => {
        html += `<span class="search-result-tag">${escapeHtml(tag)}</span>`;
      });
      html += '</div>';
    }

    // Copy hint
    html += `<div class="search-result-copy">Click to copy Flow URL</div>`;

    resultItem.innerHTML = html;

    // Click to copy flow URL
    resultItem.addEventListener('click', () => {
      const flowUrl = `https://make.powerautomate.com/manage/environments/Default-/flows/${flowId}/details`;
      copyToClipboard(flowUrl);

      // Visual feedback
      const originalBg = resultItem.style.background;
      resultItem.style.background = 'rgba(68, 255, 68, 0.2)';
      setTimeout(() => {
        resultItem.style.background = originalBg;
      }, 500);
    });

    resultsContainer.appendChild(resultItem);
  });

  resultsContainer.style.display = 'block';
}

/**
 * Highlight search query in text
 */
function highlightText(text, query) {
  const escapedText = escapeHtml(text);
  const regex = new RegExp(`(${escapeHtml(query)})`, 'gi');
  return escapedText.replace(regex, '<mark>$1</mark>');
}

/**
 * Copy text to clipboard
 */
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    console.log('Copied to clipboard:', text);
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    // Fallback method
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  }
}
