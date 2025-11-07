# Manual Fix for "Manifest file is missing or unreadable"

If you're still getting this error, follow these steps **exactly**:

## Step 1: Run the Diagnostic Tool

In the `PWRFlowNotate-...` folder, double-click one of these:
- **`diagnose.bat`** (Command Prompt)
- **`diagnose.ps1`** (PowerShell - right-click → Run with PowerShell)

This will tell you exactly what's wrong.

## Step 2: Check for Hidden File Extensions

Windows often hides file extensions. Your `manifest.json` might actually be `manifest.json.txt`.

### To Check:
1. Open File Explorer
2. Go to your PWRFlowNotate folder
3. Click **View** tab at the top
4. Check the box for **"File name extensions"**
5. Look at `manifest.json` - does it now show as `manifest.json.txt`?

### If it shows `.txt`:
Rename it to remove the `.txt`:
```
rename manifest.json.txt manifest.json
```

Or just run `diagnose.bat` which will fix this automatically.

## Step 3: Manually Create manifest.json

If the file is missing, create it manually:

1. **Open Notepad** (NOT Word, NOT WordPad)
2. Copy this **EXACT** text:

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

3. **Save the file**:
   - Click File → Save As
   - Navigate to: `C:\Extensions\PWRFlowNotate-...`
   - File name: `manifest.json` (with quotes!)
   - Save as type: **All Files (*.*)**
   - Encoding: **UTF-8**
   - Click Save

4. **Verify**: You should now have `manifest.json` in the folder (not `manifest.json.txt`)

## Step 4: Rename the Folder

That folder name is VERY long. Windows might have issues with it.

1. Rename the folder to just: `PWRFlowNotate`
   ```
   C:\Extensions\PWRFlowNotate
   ```

2. Try loading again

## Step 5: Fresh Download

If nothing works, there might be an issue with how the files were downloaded:

1. **Delete the entire folder**
2. **Download again from GitHub**:
   - Go to the GitHub repository
   - Click **Code** → **Download ZIP**
3. **Extract the ZIP**:
   - Right-click the ZIP → **Extract All**
   - Choose `C:\Extensions\`
   - Click Extract
4. **Rename the extracted folder** to just `PWRFlowNotate`
5. **Unblock the folder**:
   - Right-click the folder → Properties
   - Check "Unblock" at the bottom (if shown)
   - Click Apply → OK

## Step 6: Try These Locations

Some folder locations work better than others:

✓ **Good:**
- `C:\Extensions\PWRFlowNotate`
- `C:\Users\YourName\Desktop\PWRFlowNotate`
- `C:\Dev\PWRFlowNotate`

❌ **Avoid:**
- `C:\Program Files\...` (permission issues)
- OneDrive synced folders (sync conflicts)
- Network drives
- Very deep paths

## Still Not Working?

### Option A: Check the Actual Files

Open Command Prompt in the folder and run:
```cmd
dir manifest.json
type manifest.json
```

If you see "File Not Found", the file doesn't exist.
If you see JSON text, the file is there.

### Option B: Use a Different Browser

Try Microsoft Edge instead:
1. Open Edge
2. Go to `edge://extensions/`
3. Follow the same steps

Edge uses the same extension format and might work better.

### Option C: Check File Permissions

1. Right-click the folder → Properties
2. Go to Security tab
3. Make sure your user has "Read" and "Read & execute" permissions
4. If not, click Edit and add them

## Contact for Help

If none of this works, please provide:
1. Output from `diagnose.bat` or `diagnose.ps1`
2. Screenshot of the folder contents
3. Windows version (Settings → System → About)
4. Chrome version (chrome://version/)

Open an issue on GitHub with this information.
