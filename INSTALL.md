# Installation Guide

This guide will walk you through installing PWRFlow Notate Chrome extension.

## Prerequisites

- Google Chrome (version 88 or higher)
- OR Microsoft Edge (Chromium-based, version 88 or higher)
- Access to Power Automate (https://make.powerautomate.com)

## Installation Methods

### Method 1: Install from Source (Recommended for Development)

#### Step 1: Download the Extension

**Option A: Clone with Git**
```bash
git clone https://github.com/yourusername/PWRFlowNotate.git
cd PWRFlowNotate
```

**Option B: Download ZIP**
1. Go to the GitHub repository
2. Click the green "Code" button
3. Select "Download ZIP"
4. Extract the ZIP file to a location on your computer

#### Step 2: Enable Developer Mode in Chrome

1. Open Google Chrome
2. Navigate to `chrome://extensions/`
3. Look for the "Developer mode" toggle in the top-right corner
4. Enable "Developer mode"

![Developer Mode](docs/images/developer-mode.png)

#### Step 3: Load the Extension

1. Click the "Load unpacked" button
2. Browse to the `PWRFlowNotate` directory
3. Select the folder and click "Select Folder" (or "Open")
4. The extension should now appear in your extensions list

![Load Unpacked](docs/images/load-unpacked.png)

#### Step 4: Verify Installation

1. Look for the PWRFlow Notate icon (📝) in your Chrome toolbar
2. Click the icon to open the popup
3. You should see the extension interface

#### Step 5: Pin the Extension (Optional)

1. Click the puzzle piece icon in your Chrome toolbar
2. Find "PWRFlow Notate" in the list
3. Click the pin icon to keep it visible

### Method 2: Install from Chrome Web Store (Coming Soon)

Once published, you'll be able to:
1. Visit the Chrome Web Store
2. Search for "PWRFlow Notate"
3. Click "Add to Chrome"
4. Confirm the installation

## Testing the Installation

### Quick Test

1. **Navigate to Power Automate**
   ```
   https://make.powerautomate.com
   ```

2. **Open any existing flow**
   - Click on a flow from your list
   - Wait for the designer to load

3. **Look for annotation buttons**
   - You should see 📝 buttons on flow cards
   - These appear after the page fully loads (usually within 2-3 seconds)

4. **Test creating an annotation**
   - Click any 📝 button
   - Add a test comment
   - Click "Save"
   - Verify the annotation appears

### Troubleshooting

#### Extension not visible
- **Solution**: Check `chrome://extensions/` and ensure the extension is enabled
- **Solution**: Try reloading the extension (click the refresh icon)

#### No annotation buttons appear
- **Cause**: Power Automate page hasn't fully loaded
- **Solution**: Wait a few seconds and refresh the page
- **Cause**: You're not on a Power Automate flow designer page
- **Solution**: Navigate to an actual flow (not the home page)

#### Buttons appear but modal doesn't open
- **Solution**: Check browser console for errors (Press F12)
- **Solution**: Try reloading the extension
- **Solution**: Clear browser cache and reload

#### Annotations don't save
- **Solution**: Check storage permissions in `chrome://extensions/`
- **Solution**: Ensure you have sufficient storage space
- **Solution**: Try clearing Chrome storage:
  ```javascript
  // Open console (F12) on any page
  chrome.storage.local.get(null, console.log)
  ```

## Updating the Extension

### For Source Installation

1. **Pull latest changes**
   ```bash
   cd PWRFlowNotate
   git pull origin main
   ```

2. **Reload the extension**
   - Go to `chrome://extensions/`
   - Find PWRFlow Notate
   - Click the refresh icon

### For Chrome Web Store Installation

- Extensions update automatically
- You can also click "Update" on `chrome://extensions/`

## Uninstalling

### Remove the Extension

1. Go to `chrome://extensions/`
2. Find "PWRFlow Notate"
3. Click "Remove"
4. Confirm the removal

### Remove All Data

Uninstalling the extension removes all stored annotations. If you want to keep your data:

1. **Before uninstalling**, click the extension icon
2. Click "Export Annotations"
3. Save the JSON file
4. After reinstalling, you can import it back (feature coming soon)

## Advanced Configuration

### Custom Installation Path

If you want to install from a custom location:

```bash
# Windows
cd C:\Users\YourName\Extensions\PWRFlowNotate

# macOS
cd /Users/YourName/Extensions/PWRFlowNotate

# Linux
cd /home/yourname/Extensions/PWRFlowNotate
```

Then follow the standard loading procedure.

### Development Setup

For developers who want to modify the extension:

1. **Install the extension** (see above)

2. **Enable auto-reload** (optional)
   - Install "Extensions Reloader" Chrome extension
   - This helps during development

3. **Open DevTools**
   - Go to the extension's content script
   - Right-click on the page → Inspect
   - Check Console for PWRFlow Notate logs

4. **Make changes**
   - Edit files in your code editor
   - Reload the extension in `chrome://extensions/`
   - Test your changes

### Debugging

Enable console logging:

```javascript
// In content.js, the extension already logs:
console.log('[PWRFlowNotate] Initializing...');
console.log('[PWRFlowNotate] Initialized successfully');
```

To see these logs:
1. Open Power Automate
2. Press F12 to open DevTools
3. Go to Console tab
4. Filter for "PWRFlowNotate"

## Multiple Browser Installation

### Installing in Microsoft Edge

The exact same process works for Edge:
1. Navigate to `edge://extensions/`
2. Follow the same steps as Chrome

### Installing in Other Chromium Browsers

Works in:
- Brave Browser
- Opera
- Vivaldi
- Any Chromium-based browser

## Network and Permissions

### Required Permissions

The extension needs:
- **storage**: Save annotations locally
- **activeTab**: Interact with active Power Automate tab
- **host_permissions**: Access Power Automate domains

### Allowed Domains

- `https://make.powerautomate.com/*`
- `https://*.flow.microsoft.com/*`

### Firewall/Proxy Considerations

- Extension works completely offline after installation
- No external API calls
- No analytics or tracking
- All data stored locally

## Enterprise Deployment

For IT administrators deploying to multiple users:

### Group Policy Installation

1. Package the extension
2. Use Chrome's managed storage
3. Deploy via Group Policy

### Configuration

Default settings (none required):
```json
{
  "annotations": {}
}
```

## Getting Help

If you encounter issues:

1. **Check this guide** first
2. **Search existing issues**: [GitHub Issues](https://github.com/yourusername/PWRFlowNotate/issues)
3. **Open a new issue** with:
   - Chrome version
   - Operating system
   - Steps to reproduce
   - Console errors (if any)

## Next Steps

After installation:
- Read the [Usage Guide](README.md#usage-guide)
- Try the [Quick Start Tutorial](docs/QUICKSTART.md)
- Explore [Advanced Features](docs/ADVANCED.md)

---

**Need help?** Open an issue on GitHub or check our documentation.
