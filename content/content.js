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
      // Re-inject annotation controls when new elements appear
      this.injectAnnotationControls();
      this.applyAnnotations();
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
    // Find all flow action cards/elements
    const selectors = [
      '[data-automation-id*="action"]',
      '[data-automation-id*="trigger"]',
      '[class*="action-card"]',
      '[class*="trigger-card"]',
      '[class*="flowcard"]',
      '.card-container',
      '[role="button"][class*="card"]'
    ];

    selectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        if (!element.dataset.pwrflowAnnotated) {
          this.addAnnotationButton(element);
          element.dataset.pwrflowAnnotated = 'true';
        }
      });
    });
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

    await this.saveAnnotations();
    this.applyAnnotationToElement(element, annotation);
    this.closeModal();
  }

  /**
   * Delete annotation
   */
  async deleteAnnotation(element) {
    const elementId = this.getElementId(element);
    delete this.annotations[elementId];

    await this.saveAnnotations();
    this.removeAnnotationFromElement(element);
    this.closeModal();
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
    Object.keys(this.annotations).forEach(elementId => {
      const element = this.findElementById(elementId);
      if (element) {
        this.applyAnnotationToElement(element, this.annotations[elementId]);
      }
    });
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
      console.log('[PWRFlowNotate] Saved annotations');
    } catch (error) {
      console.error('[PWRFlowNotate] Error saving annotations:', error);
    }
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const notate = new PWRFlowNotate();
    notate.init();
  });
} else {
  const notate = new PWRFlowNotate();
  notate.init();
}
