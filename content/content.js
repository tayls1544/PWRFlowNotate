/**
 * PWRFlow Notate - Content Script
 * Injects annotation capabilities into Power Automate flow designer
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
    console.warn('[PWRFlowNotate] Could not extract flow ID from URL:', url);
    return url;
  } catch (error) {
    console.error('[PWRFlowNotate] Error extracting flow ID:', error);
    return url;
  }
}

/**
 * Check if current page is a flow designer/editor page
 * @returns {boolean} - True if on flow designer page
 */
function isFlowDesignerPage() {
  const url = window.location.href;

  // Must contain /flows/{flowId}/details or /flows/{flowId}/designer
  const isFlowPage = url.includes('/flows/') &&
                     (url.includes('/details') || url.includes('/designer'));

  // Should NOT be on these pages:
  const isListPage = url.includes('/manage/flows') || url.match(/\/flows\/?$/);
  const isRunHistoryPage = url.includes('/runs/') || url.includes('/runhistory');

  if (!isFlowPage || isListPage || isRunHistoryPage) {
    return false;
  }

  // Since settings and designer use the same URL, check DOM elements
  // Look for elements that ONLY exist in the designer view
  const hasFlowActions = document.querySelectorAll('[data-automation-id*="card-"]').length > 0;
  const hasDesignerCanvas = document.querySelector('[data-automation-id="flow-canvas"]') !== null;

  // Settings panel elements (these appear on settings page, not designer)
  const hasEditButton = document.querySelector('[aria-label*="Edit"]') !== null;
  const hasSaveButton = document.querySelector('[aria-label*="Save"]') !== null;
  const hasPropertiesForm = document.querySelector('form') !== null &&
                            (document.querySelector('[placeholder*="name"]') !== null ||
                             document.querySelector('[placeholder*="description"]') !== null);

  // On designer: has actions/canvas, no properties form
  // On settings: has form with edit/save buttons
  const isDesigner = (hasFlowActions || hasDesignerCanvas) && !hasPropertiesForm;

  console.log('[PWRFlowNotate] Page check:', {
    url: url,
    hasFlowActions,
    hasDesignerCanvas,
    hasPropertiesForm,
    isDesigner,
    shouldActivate: isDesigner
  });

  return isDesigner;
}

class PWRFlowNotate {
  constructor() {
    this.annotations = {};
    this.observers = [];
    this.initialized = false;
    this.activeModal = null;
    this.isUpdating = false;  // Prevent infinite loops
    this.updateTimeout = null;  // Debounce updates
    this.loadAnnotations();
  }

  /**
   * Initialize the extension on the Power Automate page
   */
  async init() {
    if (this.initialized) return;

    // Basic URL check first (quick exit for obviously wrong pages)
    const url = window.location.href;
    const isFlowPage = url.includes('/flows/') && (url.includes('/details') || url.includes('/designer'));
    const isListPage = url.includes('/manage/flows') || url.match(/\/flows\/?$/);
    const isRunHistoryPage = url.includes('/runs/') || url.includes('/runhistory');

    if (!isFlowPage || isListPage || isRunHistoryPage) {
      console.log('[PWRFlowNotate] Not on a flow page, skipping initialization');
      return;
    }

    console.log('[PWRFlowNotate] Waiting for flow designer to load...');

    // Wait for Power Automate UI to load
    await this.waitForFlowDesigner();

    // Now check if we're actually on the designer (not settings)
    if (!isFlowDesignerPage()) {
      console.log('[PWRFlowNotate] On settings/properties page, not designer - skipping initialization');
      return;
    }

    console.log('[PWRFlowNotate] Flow designer detected, initializing annotation system...');

    // Load saved annotations
    await this.loadAnnotations();

    // Set up observers for dynamic content
    this.observeFlowChanges();

    // Inject annotation UI
    this.injectAnnotationControls();

    // Apply existing annotations
    this.applyAnnotations();

    // Check for highlight parameter in URL
    this.checkForHighlight();

    this.initialized = true;
    console.log('[PWRFlowNotate] Initialized successfully');
  }

  /**
   * Check if URL contains highlight parameter and highlight the element
   */
  checkForHighlight() {
    try {
      const hash = window.location.hash;
      if (hash.includes('pwrflow-highlight=')) {
        const match = hash.match(/pwrflow-highlight=([^&]+)/);
        if (match && match[1]) {
          const elementId = decodeURIComponent(match[1]);
          console.log('[PWRFlowNotate] Detected highlight request for element:', elementId);

          // Wait for the page to fully render, then retry multiple times
          this.highlightElementWithRetry(elementId, 0);
        }
      }
    } catch (error) {
      console.error('[PWRFlowNotate] Error checking for highlight:', error);
    }
  }

  /**
   * Highlight element with retry mechanism
   */
  highlightElementWithRetry(elementId, attemptCount) {
    const maxAttempts = 20; // Increased from 10 to handle slow Power Automate loading
    const retryDelay = 1000; // Increased to 1000ms (1 second) between attempts

    console.log(`[PWRFlowNotate] Attempt ${attemptCount + 1}/${maxAttempts} to find element:`, elementId);

    const element = this.findElement(elementId);

    if (element) {
      console.log('[PWRFlowNotate] ✓ Found element to highlight:', element);
      this.applyHighlight(element);
    } else if (attemptCount < maxAttempts - 1) {
      console.log(`[PWRFlowNotate] Element not found yet, retrying in ${retryDelay}ms...`);
      setTimeout(() => {
        this.highlightElementWithRetry(elementId, attemptCount + 1);
      }, retryDelay);
    } else {
      console.warn('[PWRFlowNotate] ✗ Could not find element after', maxAttempts, 'attempts:', elementId);
      console.log('[PWRFlowNotate] Available card elements with data-automation-id:');
      const allElements = document.querySelectorAll('[data-automation-id]');
      allElements.forEach(el => {
        const id = el.getAttribute('data-automation-id');
        if (id && id.includes('card')) {
          console.log('  -', id);
        }
      });
    }
  }

  /**
   * Find element using multiple strategies
   */
  findElement(elementId) {
    // Strategy 1: Exact match on data-automation-id
    let element = document.querySelector(`[data-automation-id="${elementId}"]`);
    if (element) {
      console.log('[PWRFlowNotate] Found via exact data-automation-id match');
      return element;
    }

    // Strategy 2: Partial match on data-automation-id
    const allElements = document.querySelectorAll('[data-automation-id]');
    for (const el of allElements) {
      const autoId = el.getAttribute('data-automation-id');
      if (autoId && autoId.includes(elementId)) {
        console.log('[PWRFlowNotate] Found via partial data-automation-id match:', autoId);
        return el;
      }
    }

    // Strategy 3: Look for annotated elements
    element = document.querySelector(`.pwrflow-annotated[data-element-id="${elementId}"]`);
    if (element) {
      console.log('[PWRFlowNotate] Found via pwrflow-annotated class');
      return element;
    }

    // Strategy 4: Look for element by ID
    element = document.getElementById(elementId);
    if (element) {
      console.log('[PWRFlowNotate] Found via element ID');
      return element;
    }

    // Strategy 5: Look in card containers (Power Automate specific)
    const cards = document.querySelectorAll('[class*="card"]');
    for (const card of cards) {
      const cardId = card.getAttribute('data-automation-id') || card.id;
      if (cardId && cardId.includes(elementId)) {
        console.log('[PWRFlowNotate] Found via card class search:', cardId);
        return card;
      }
    }

    return null;
  }

  /**
   * Apply highlight animation to element
   */
  applyHighlight(element) {
    try {
      // Scroll element into view
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // Add highlight class
      element.classList.add('pwrflow-search-highlight');

      console.log('[PWRFlowNotate] Applied highlight to element');

      // Remove highlight after animation
      setTimeout(() => {
        element.classList.remove('pwrflow-search-highlight');
        console.log('[PWRFlowNotate] Removed highlight from element');
      }, 5000);

      // Clear the hash from URL after highlighting
      setTimeout(() => {
        if (window.location.hash.includes('pwrflow-highlight=')) {
          history.replaceState(null, null, window.location.pathname + window.location.search);
          console.log('[PWRFlowNotate] Cleared highlight hash from URL');
        }
      }, 1000);
    } catch (error) {
      console.error('[PWRFlowNotate] Error applying highlight:', error);
    }
  }

  /**
   * Wait for the Power Automate flow designer to load
   */
  async waitForFlowDesigner() {
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        // Look for Power Automate flow canvas elements
        const flowCanvas = document.querySelector('[data-automation-id="flow-canvas"]') ||
                          document.querySelector('.designer-canvas') ||
                          document.querySelector('[class*="designer"]') ||
                          document.querySelector('[class*="flow-canvas"]');

        if (flowCanvas) {
          clearInterval(checkInterval);
          console.log('[PWRFlowNotate] Flow designer detected');
          resolve();
        }
      }, 500);

      // Timeout after 30 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        console.log('[PWRFlowNotate] Flow designer detection timeout - proceeding anyway');
        resolve();
      }, 30000);
    });
  }

  /**
   * Observe DOM changes to detect new flow elements
   */
  observeFlowChanges() {
    const observer = new MutationObserver((mutations) => {
      // Prevent infinite loops - ignore our own changes
      if (this.isUpdating) return;

      // Debounce updates to avoid excessive processing
      if (this.updateTimeout) {
        clearTimeout(this.updateTimeout);
      }

      this.updateTimeout = setTimeout(() => {
        // Check if mutations are from our own elements
        const isOwnMutation = mutations.some(mutation => {
          const target = mutation.target;
          return target.classList?.contains('pwrflow-modal') ||
                 target.classList?.contains('pwrflow-comment-badge') ||
                 target.classList?.contains('pwrflow-tags-container') ||
                 target.closest('.pwrflow-modal');
        });

        // Skip if this is our own change
        if (isOwnMutation) return;

        // Re-inject annotation controls when new elements appear
        this.injectAnnotationControls();
        this.applyAnnotations();
      }, 300);  // Wait 300ms after last change
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    this.observers.push(observer);
  }

  /**
   * Inject annotation controls (buttons) to flow actions
   */
  injectAnnotationControls() {
    // Prevent infinite loops
    if (this.isUpdating) return;

    try {
      // Find all flow action cards/elements - comprehensive selectors
      const selectors = [
        // Standard Power Automate selectors
        '[data-automation-id*="action"]',
        '[data-automation-id*="trigger"]',
        '[data-automation-id*="card"]',
        // Class-based selectors
        '[class*="action-card"]',
        '[class*="trigger-card"]',
        '[class*="flowcard"]',
        '[class*="actionCard"]',
        '[class*="triggerCard"]',
        '[class*="flow-card"]',
        '[class*="Card"]',
        // Container selectors
        '.card-container',
        '[class*="cardContainer"]',
        '[class*="card-wrapper"]',
        // Role-based
        '[role="button"][class*="card"]',
        '[role="group"][class*="card"]',
        // Generic card detection
        '[class*="card"][class*="root"]',
        'div[class*="card"]:not(.pwrflow-modal)',
        // Condition and control cards
        '[data-automation-id*="condition"]',
        '[data-automation-id*="scope"]',
        '[data-automation-id*="foreach"]',
        '[data-automation-id*="switch"]'
      ];

      const processedElements = new Set();

      selectors.forEach(selector => {
        try {
          const elements = document.querySelectorAll(selector);
          elements.forEach(element => {
            // Skip if already processed
            if (processedElements.has(element)) return;

            // Skip our own elements
            if (element.closest('.pwrflow-modal') ||
                element.classList.contains('pwrflow-annotate-btn')) {
              return;
            }

            // Check if element looks like a flow card
            if (this.isFlowElement(element) && !element.dataset.pwrflowAnnotated) {
              this.addAnnotationButton(element);
              element.dataset.pwrflowAnnotated = 'true';
              processedElements.add(element);
            }
          });
        } catch (error) {
          // Skip selector if it causes issues
          console.debug('[PWRFlowNotate] Selector failed:', selector, error);
        }
      });
    } catch (error) {
      console.error('[PWRFlowNotate] Error injecting controls:', error);
    }
  }

  /**
   * Check if an element looks like a flow action/trigger card
   */
  isFlowElement(element) {
    // Check for common Power Automate card characteristics first
    const hasCardClass = element.className && (
      element.className.includes('card') ||
      element.className.includes('Card') ||
      element.className.includes('action') ||
      element.className.includes('trigger')
    );

    const hasAutomationId = element.hasAttribute('data-automation-id');

    const hasButtonRole = element.getAttribute('role') === 'button' ||
                          element.getAttribute('role') === 'group';

    // Must have at least one characteristic
    if (!hasCardClass && !hasAutomationId && !hasButtonRole) {
      return false;
    }

    // Get size for additional validation
    const rect = element.getBoundingClientRect();

    // Very lenient size check - just filter out truly tiny elements (like icons)
    // Allow small/compact actions like Compose
    if (rect.width < 50 || rect.height < 30) return false;

    // If it has explicit automation ID, it's probably a flow element regardless of size
    if (hasAutomationId && rect.width > 0 && rect.height > 0) return true;

    // Otherwise check if it has minimum reasonable size
    return rect.width >= 80 && rect.height >= 40;
  }

  /**
   * Add annotation button to a flow element
   */
  addAnnotationButton(element) {
    // Skip if already has button
    if (element.querySelector('.pwrflow-annotate-btn')) return;

    const button = document.createElement('button');
    button.className = 'pwrflow-annotate-btn';
    button.innerHTML = '📝';
    button.title = 'Add annotation';
    button.setAttribute('aria-label', 'Add annotation to this action');

    button.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      this.showAnnotationModal(element);
    });

    // Check if this is a compact/small action
    const rect = element.getBoundingClientRect();
    const isCompact = rect.height < 70;

    if (isCompact) {
      // For compact actions, make button smaller and position more carefully
      button.style.fontSize = '14px';
      button.style.padding = '4px 8px';
    }

    // Try to find a good place to inject the button
    const headerSelectors = [
      '[class*="header"]',
      '[class*="title"]',
      '[class*="card-header"]',
      '[class*="cardHeader"]'
    ];

    let injected = false;
    for (const selector of headerSelectors) {
      const header = element.querySelector(selector);
      if (header) {
        header.style.position = 'relative';
        button.style.position = 'absolute';
        button.style.right = '8px';
        button.style.top = isCompact ? '4px' : '8px';
        button.style.zIndex = '9999';
        header.appendChild(button);
        injected = true;
        break;
      }
    }

    if (!injected) {
      // Fallback: append to element itself
      element.style.position = 'relative';
      button.style.position = 'absolute';
      button.style.right = '8px';
      button.style.top = isCompact ? '4px' : '8px';
      button.style.zIndex = '9999';
      element.appendChild(button);
    }
  }

  /**
   * Show annotation modal for an element
   */
  showAnnotationModal(element) {
    const elementId = this.getElementId(element);
    const existingAnnotation = this.annotations[elementId] || {
      comment: '',
      color: '',
      tags: []
    };

    // Create modal
    const modal = document.createElement('div');
    modal.className = 'pwrflow-modal';
    modal.innerHTML = `
      <div class="pwrflow-modal-content">
        <div class="pwrflow-modal-header">
          <h3>Add Annotation</h3>
          <button class="pwrflow-modal-close" aria-label="Close">&times;</button>
        </div>
        <div class="pwrflow-modal-body">
          <div class="pwrflow-form-group">
            <label for="pwrflow-comment">Comment</label>
            <textarea
              id="pwrflow-comment"
              placeholder="Add notes, business logic, or implementation details..."
              rows="4"
            >${existingAnnotation.comment || ''}</textarea>
          </div>

          <div class="pwrflow-form-group">
            <label>Visual Marker Color</label>
            <div class="pwrflow-color-picker">
              ${this.generateColorOptions(existingAnnotation.color)}
            </div>
          </div>

          <div class="pwrflow-form-group">
            <label for="pwrflow-tags">Tags (comma-separated)</label>
            <input
              type="text"
              id="pwrflow-tags"
              placeholder="e.g., critical, review, error-handling"
              value="${existingAnnotation.tags?.join(', ') || ''}"
            />
          </div>
        </div>
        <div class="pwrflow-modal-footer">
          <button class="pwrflow-btn pwrflow-btn-secondary" id="pwrflow-delete">Delete</button>
          <button class="pwrflow-btn pwrflow-btn-primary" id="pwrflow-save">Save</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    this.activeModal = modal;

    // Event listeners
    modal.querySelector('.pwrflow-modal-close').addEventListener('click', () => {
      this.closeModal();
    });

    modal.querySelector('#pwrflow-save').addEventListener('click', () => {
      this.saveAnnotation(element);
    });

    modal.querySelector('#pwrflow-delete').addEventListener('click', () => {
      this.deleteAnnotation(element);
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.closeModal();
      }
    });

    // Color picker
    modal.querySelectorAll('.pwrflow-color-option').forEach(option => {
      option.addEventListener('click', (e) => {
        modal.querySelectorAll('.pwrflow-color-option').forEach(o =>
          o.classList.remove('selected'));
        e.target.classList.add('selected');
      });
    });

    // Focus on comment field
    setTimeout(() => modal.querySelector('#pwrflow-comment').focus(), 100);
  }

  /**
   * Generate color picker options
   */
  generateColorOptions(selectedColor) {
    const colors = [
      { name: 'None', value: '', hex: 'transparent', desc: 'No color' },
      { name: 'Red', value: 'red', hex: '#ff4444', desc: 'Critical/Errors' },
      { name: 'Orange', value: 'orange', hex: '#ff8c00', desc: 'Needs Attention' },
      { name: 'Yellow', value: 'yellow', hex: '#ffd700', desc: 'Warning' },
      { name: 'Green', value: 'green', hex: '#44ff44', desc: 'Approved/Complete' },
      { name: 'Blue', value: 'blue', hex: '#4444ff', desc: 'Information' },
      { name: 'Purple', value: 'purple', hex: '#9944ff', desc: 'Dependencies' },
      { name: 'Pink', value: 'pink', hex: '#ff44ff', desc: 'Review Required' }
    ];

    return colors.map(color => `
      <div class="pwrflow-color-option ${selectedColor === color.value ? 'selected' : ''}"
           data-color="${color.value}"
           style="background-color: ${color.hex}"
           title="${color.name}${color.desc ? ' - ' + color.desc : ''}">
        ${color.value === '' ? '⊘' : ''}
      </div>
    `).join('');
  }

  /**
   * Save annotation
   */
  async saveAnnotation(element) {
    const modal = this.activeModal;
    const elementId = this.getElementId(element);

    const comment = modal.querySelector('#pwrflow-comment').value;
    const selectedColor = modal.querySelector('.pwrflow-color-option.selected')?.dataset.color || '';
    const tags = modal.querySelector('#pwrflow-tags').value
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag);

    const annotation = { comment, color: selectedColor, tags };
    this.annotations[elementId] = annotation;

    // Prevent mutation observer from triggering
    this.isUpdating = true;

    try {
      await this.saveAnnotations();
      this.applyAnnotationToElement(element, annotation);
      this.closeModal();
    } finally {
      // Re-enable mutation observer after a short delay
      setTimeout(() => {
        this.isUpdating = false;
      }, 100);
    }
  }

  /**
   * Delete annotation
   */
  async deleteAnnotation(element) {
    const elementId = this.getElementId(element);
    delete this.annotations[elementId];

    // Prevent mutation observer from triggering
    this.isUpdating = true;

    try {
      await this.saveAnnotations();
      this.removeAnnotationFromElement(element);
      this.closeModal();
    } finally {
      // Re-enable mutation observer after a short delay
      setTimeout(() => {
        this.isUpdating = false;
      }, 100);
    }
  }

  /**
   * Close modal
   */
  closeModal() {
    if (this.activeModal) {
      this.activeModal.remove();
      this.activeModal = null;
    }
  }

  /**
   * Apply annotation styling to an element
   */
  applyAnnotationToElement(element, annotation) {
    // Remove existing annotation display
    this.removeAnnotationFromElement(element);

    if (!annotation || (!annotation.comment && !annotation.color && !annotation.tags?.length)) {
      return;
    }

    // Apply color marker
    if (annotation.color) {
      element.classList.add('pwrflow-marked');
      element.classList.add(`pwrflow-marked-${annotation.color}`);
    }

    // Add comment badge
    if (annotation.comment) {
      const badge = document.createElement('div');
      badge.className = 'pwrflow-comment-badge';
      badge.innerHTML = '💬';
      badge.title = 'Click to view comment';
      badge.style.cursor = 'pointer';

      // Make badge clickable to show full comment
      badge.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        this.showCommentModal(annotation.comment);
      });

      element.appendChild(badge);
    }

    // Add tags
    if (annotation.tags?.length > 0) {
      const tagsContainer = document.createElement('div');
      tagsContainer.className = 'pwrflow-tags-container';

      annotation.tags.forEach(tag => {
        const tagElement = document.createElement('span');
        tagElement.className = 'pwrflow-tag';
        tagElement.textContent = tag;
        tagsContainer.appendChild(tagElement);
      });

      element.appendChild(tagsContainer);
    }
  }

  /**
   * Show full comment in a modal
   */
  showCommentModal(comment) {
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'pwrflow-comment-modal';
    modal.innerHTML = `
      <div class="pwrflow-comment-modal-content">
        <div class="pwrflow-comment-modal-header">
          <h3>📝 Full Comment</h3>
          <button class="pwrflow-modal-close" aria-label="Close">&times;</button>
        </div>
        <div class="pwrflow-comment-modal-body">
          <div class="pwrflow-full-comment">${this.escapeHtml(comment)}</div>
        </div>
        <div class="pwrflow-comment-modal-footer">
          <button class="pwrflow-btn pwrflow-btn-primary" id="pwrflow-close-comment">Close</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Event listeners
    modal.querySelector('.pwrflow-modal-close').addEventListener('click', () => {
      modal.remove();
    });

    modal.querySelector('#pwrflow-close-comment').addEventListener('click', () => {
      modal.remove();
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  }

  /**
   * Escape HTML to prevent XSS
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Remove annotation styling from element
   */
  removeAnnotationFromElement(element) {
    element.classList.remove('pwrflow-marked');
    ['red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink'].forEach(color => {
      element.classList.remove(`pwrflow-marked-${color}`);
    });

    const badge = element.querySelector('.pwrflow-comment-badge');
    const tooltip = element.querySelector('.pwrflow-comment-tooltip');
    const tags = element.querySelector('.pwrflow-tags-container');

    badge?.remove();
    tooltip?.remove();
    tags?.remove();
  }

  /**
   * Apply all saved annotations to the page
   */
  applyAnnotations() {
    // Prevent infinite loops
    if (this.isUpdating) return;

    this.isUpdating = true;

    try {
      Object.keys(this.annotations).forEach(elementId => {
        try {
          const element = this.findElementById(elementId);
          if (element) {
            this.applyAnnotationToElement(element, this.annotations[elementId]);
          }
        } catch (error) {
          console.error('[PWRFlowNotate] Error applying annotation:', error);
        }
      });
    } finally {
      setTimeout(() => {
        this.isUpdating = false;
      }, 100);
    }
  }

  /**
   * Get a unique identifier for a flow element
   */
  getElementId(element) {
    // Try to find a unique identifier
    const automationId = element.getAttribute('data-automation-id');
    if (automationId) return automationId;

    const id = element.id;
    if (id) return id;

    // Generate based on position and text content
    const text = element.textContent?.substring(0, 50).replace(/\s+/g, '-') || '';
    const index = Array.from(element.parentNode?.children || []).indexOf(element);
    return `pwrflow-${text}-${index}-${Date.now()}`;
  }

  /**
   * Find element by ID
   */
  findElementById(elementId) {
    // Try direct lookup first
    let element = document.querySelector(`[data-automation-id="${elementId}"]`);
    if (element) return element;

    element = document.getElementById(elementId);
    if (element) return element;

    // Find by PWRFlow annotation ID
    return document.querySelector(`[data-pwrflow-id="${elementId}"]`);
  }

  /**
   * Load annotations from Chrome storage
   */
  async loadAnnotations() {
    try {
      const result = await chrome.storage.sync.get(['annotations']);
      const url = window.location.href;
      const flowId = extractFlowId(url);
      const allAnnotations = result.annotations || {};

      // Try flow ID first, fallback to URL for backwards compatibility
      this.annotations = allAnnotations[flowId] || allAnnotations[url] || {};

      console.log('[PWRFlowNotate] Flow ID:', flowId);
      console.log('[PWRFlowNotate] Loaded annotations:', Object.keys(this.annotations).length);
    } catch (error) {
      console.error('[PWRFlowNotate] Error loading annotations:', error);
      this.annotations = {};
    }
  }

  /**
   * Save annotations to Chrome storage
   */
  async saveAnnotations() {
    try {
      const url = window.location.href;
      const flowId = extractFlowId(url);
      const result = await chrome.storage.sync.get(['annotations']);
      const allAnnotations = result.annotations || {};

      // Save using flow ID as key
      allAnnotations[flowId] = this.annotations;

      // Clean up old URL-based entry if it exists (migration)
      if (allAnnotations[url] && url !== flowId) {
        delete allAnnotations[url];
        console.log('[PWRFlowNotate] Migrated from URL to Flow ID storage');
      }

      await chrome.storage.sync.set({ annotations: allAnnotations });
      console.log('[PWRFlowNotate] Saved annotations successfully for flow:', flowId);
    } catch (error) {
      console.error('[PWRFlowNotate] Error saving annotations:', error);
      // Show user-friendly error
      alert('Failed to save annotation. Please check browser console for details.');
    }
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    try {
      const notate = new PWRFlowNotate();
      notate.init().catch(error => {
        console.error('[PWRFlowNotate] Initialization failed:', error);
      });
    } catch (error) {
      console.error('[PWRFlowNotate] Failed to create instance:', error);
    }
  });
} else {
  try {
    const notate = new PWRFlowNotate();
    notate.init().catch(error => {
      console.error('[PWRFlowNotate] Initialization failed:', error);
    });
  } catch (error) {
    console.error('[PWRFlowNotate] Failed to create instance:', error);
  }
}
