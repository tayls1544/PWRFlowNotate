/**
 * PWRFlow Notate - Content Script
 * Injects annotation capabilities into Power Automate flow designer
 */

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

    console.log('[PWRFlowNotate] Initializing...');

    // Wait for Power Automate UI to load
    await this.waitForFlowDesigner();

    // Load saved annotations
    await this.loadAnnotations();

    // Set up observers for dynamic content
    this.observeFlowChanges();

    // Inject annotation UI
    this.injectAnnotationControls();

    // Apply existing annotations
    this.applyAnnotations();

    this.initialized = true;
    console.log('[PWRFlowNotate] Initialized successfully');
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
    // Must have some minimum size (not a tiny element)
    const rect = element.getBoundingClientRect();
    if (rect.width < 100 || rect.height < 50) return false;

    // Check for common Power Automate card characteristics
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
    return hasCardClass || hasAutomationId || hasButtonRole;
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

    // Try to find a good place to inject the button
    const headerSelectors = [
      '[class*="header"]',
      '[class*="title"]',
      '[class*="card-header"]'
    ];

    let injected = false;
    for (const selector of headerSelectors) {
      const header = element.querySelector(selector);
      if (header) {
        header.style.position = 'relative';
        button.style.position = 'absolute';
        button.style.right = '8px';
        button.style.top = '8px';
        header.appendChild(button);
        injected = true;
        break;
      }
    }

    if (!injected) {
      element.style.position = 'relative';
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
      { name: 'None', value: '', hex: 'transparent' },
      { name: 'Red', value: 'red', hex: '#ff4444' },
      { name: 'Orange', value: 'orange', hex: '#ff8c00' },
      { name: 'Yellow', value: 'yellow', hex: '#ffd700' },
      { name: 'Green', value: 'green', hex: '#44ff44' },
      { name: 'Blue', value: 'blue', hex: '#4444ff' },
      { name: 'Purple', value: 'purple', hex: '#9944ff' },
      { name: 'Pink', value: 'pink', hex: '#ff44ff' }
    ];

    return colors.map(color => `
      <div class="pwrflow-color-option ${selectedColor === color.value ? 'selected' : ''}"
           data-color="${color.value}"
           style="background-color: ${color.hex}"
           title="${color.name}">
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
      badge.title = annotation.comment;
      element.appendChild(badge);

      // Show comment on hover
      const tooltip = document.createElement('div');
      tooltip.className = 'pwrflow-comment-tooltip';
      tooltip.textContent = annotation.comment;
      element.appendChild(tooltip);
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
      const result = await chrome.storage.local.get(['annotations']);
      const url = window.location.href;
      const allAnnotations = result.annotations || {};
      this.annotations = allAnnotations[url] || {};
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
      const result = await chrome.storage.local.get(['annotations']);
      const allAnnotations = result.annotations || {};
      allAnnotations[url] = this.annotations;

      await chrome.storage.local.set({ annotations: allAnnotations });
      console.log('[PWRFlowNotate] Saved annotations successfully');
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
