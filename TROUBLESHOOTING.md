# Troubleshooting Guide

## "Manifest file is missing or unreadable" Error

This is the most common error when loading the extension. Here are solutions:

### Solution 1: Verify You're Selecting the Correct Folder

**The Issue:**
You might be selecting the parent folder or wrong directory.

**The Fix:**
1. Make sure you're selecting the folder that contains `manifest.json` directly
2. The correct folder structure should look like this:
   ```
   PWRFlowNotate/                    ← SELECT THIS FOLDER
   ├── manifest.json                 ← This file must be here
   ├── content/
   ├── popup/
   └── icons/
   ```

3. **Do NOT select:**
   - A parent folder that contains PWRFlowNotate
   - A subfolder like `content/` or `popup/`
   - Just the `manifest.json` file

### Solution 2: Check File Encoding (Windows)

**The Issue:**
Windows might save files with incorrect encoding or line endings.

**The Fix:**

**Option A: Re-download the files**
1. Delete the current folder
2. Re-clone or re-download from GitHub
3. Make sure "Download as ZIP" completes fully
4. Extract all files (right-click → Extract All)

**Option B: Fix the manifest manually**
1. Open `manifest.json` in Notepad (not Word!)
2. Click File → Save As
3. In the "Encoding" dropdown, select **"UTF-8"** (not UTF-8 with BOM)
4. Save
5. Try loading the extension again

### Solution 3: Use the Verification Script

Run this to check your setup:

**On Windows (PowerShell):**
```powershell
cd path\to\PWRFlowNotate
python verify-extension.py
```

**On Windows (Command Prompt):**
```cmd
cd path\to\PWRFlowNotate
python verify-extension.py
```

**On Mac/Linux:**
```bash
cd path/to/PWRFlowNotate
python3 verify-extension.py
```

This will tell you exactly what's wrong.

### Solution 4: Recreate manifest.json

If the manifest is corrupted, create a new one:

1. Delete the existing `manifest.json`
2. Create a new file called `manifest.json` (use Notepad, VS Code, or Notepad++)
3. Copy and paste this **exact** content:

```json
{
  "manifest_version": 3,
  "name": "PWRFlow Notate",
  "version": "1.0.0",
  "description": "Enhance Power Automate flows with comprehensive annotation capabilities - add comments, visual markers, and documentation directly to your workflows.",
  "permissions": [
    "storage",
    "activeTab"
  ],
  "host_permissions": [
    "https://make.powerautomate.com/*",
    "https://*.flow.microsoft.com/*"
  ],
  "action": {
    "default_popup": "popup/popup.html",
    "default_icon": {
      "16": "icons/icon16.png",
      "32": "icons/icon32.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
    }
  },
  "icons": {
    "16": "icons/icon16.png",
    "32": "icons/icon32.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  },
  "content_scripts": [
    {
      "matches": [
        "https://make.powerautomate.com/*",
        "https://*.flow.microsoft.com/*"
      ],
      "js": ["content/content.js"],
      "css": ["content/annotations.css"],
      "run_at": "document_idle"
    }
  ],
  "web_accessible_resources": [
    {
      "resources": ["content/annotations.css"],
      "matches": ["https://make.powerautomate.com/*", "https://*.flow.microsoft.com/*"]
    }
  ]
}
```

4. Save as UTF-8 encoding
5. Try loading again

### Solution 5: Check Windows File Permissions

**The Issue:**
Windows might be blocking the files as "downloaded from the internet."

**The Fix:**
1. Right-click on the `PWRFlowNotate` folder
2. Select "Properties"
3. At the bottom, if you see "Security: This file came from another computer...", check "Unblock"
4. Click "Apply" → "OK"
5. Try loading the extension again

### Solution 6: Use a Different Browser Location

**The Issue:**
Chrome might have issues reading from certain folders (Music, Downloads, etc.)

**The Fix:**
1. Move the `PWRFlowNotate` folder to a simpler location:
   - Windows: `C:\Extensions\PWRFlowNotate`
   - Mac: `/Users/YourName/Extensions/PWRFlowNotate`
   - Linux: `/home/yourname/Extensions/PWRFlowNotate`

2. Try loading from the new location

## Other Common Issues

### Extension Loads But No Buttons Appear

**Possible Causes:**
- Power Automate page hasn't fully loaded
- You're not on a flow designer page
- Extension needs time to initialize

**Solutions:**
1. Wait 3-5 seconds after opening a flow
2. Refresh the page (F5)
3. Make sure you're on a flow designer page (not the home page)
4. Check browser console (F12) for errors
5. Look for `[PWRFlowNotate]` messages in console

### Annotations Don't Save

**Check:**
1. Chrome storage permissions are enabled
2. You have disk space available
3. Chrome isn't in Incognito mode (extensions may be disabled)

**Fix:**
1. Go to `chrome://extensions/`
2. Find "PWRFlow Notate"
3. Make sure "Allow in incognito" is checked if using incognito
4. Check "Site access" is set to "On specific sites" or "On all sites"

### Modal Doesn't Open

**Solutions:**
1. Check browser console (F12) for JavaScript errors
2. Disable other extensions that might conflict
3. Try in a new Chrome profile
4. Clear browser cache and reload

### Export Doesn't Work

**Solutions:**
1. Check download permissions
2. Allow downloads in Chrome settings
3. Check if download location has write permissions
4. Try a different download location

## Step-by-Step Verification

Follow these steps **exactly**:

1. ✓ Open File Explorer (Windows) or Finder (Mac)
2. ✓ Navigate to where you downloaded PWRFlowNotate
3. ✓ You should see these items in the folder:
   ```
   📁 content
   📁 icons
   📁 popup
   📄 manifest.json          ← This MUST be here
   📄 package.json
   📄 README.md
   (other files...)
   ```

4. ✓ Open Chrome
5. ✓ Type in address bar: `chrome://extensions/`
6. ✓ Turn ON "Developer mode" (toggle in top-right)
7. ✓ Click "Load unpacked" button
8. ✓ In the folder selection dialog, select the `PWRFlowNotate` folder
   - **NOT** a subfolder
   - **NOT** the parent folder
   - The folder that has `manifest.json` in it

9. ✓ Click "Select Folder"

If you still get the error after this, the files are corrupted. Re-download them.

## Getting Help

If none of these solutions work:

1. **Run the verification script** and share the output:
   ```
   python verify-extension.py
   ```

2. **Create an issue** with:
   - Your operating system (Windows 10, Mac, etc.)
   - Chrome version (chrome://version/)
   - The exact error message
   - Output from verification script
   - Screenshot of your folder structure

3. **Temporary workaround**:
   - Use Edge instead of Chrome (same process)
   - Try on a different computer
   - Use a different Chromium-based browser

## Quick Checklist

Before asking for help, verify:

- [ ] I'm selecting the correct folder (contains manifest.json)
- [ ] manifest.json file exists and is readable
- [ ] All files were extracted from ZIP (if downloaded)
- [ ] Files are not blocked by Windows security
- [ ] I'm using Chrome 88 or higher
- [ ] Developer mode is enabled
- [ ] I've tried restarting Chrome
- [ ] I've checked the browser console for errors

## Need More Help?

- Check the [Installation Guide](INSTALL.md)
- Read the [README](README.md)
- Open an issue on GitHub
- Email: support@example.com (replace with actual)
