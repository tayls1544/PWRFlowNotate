# Windows Installation Guide

## Quick Start (Windows 10/11)

### Step 1: Download the Extension

1. **Download from GitHub:**
   - Click the green "Code" button
   - Select "Download ZIP"
   - Wait for download to complete

2. **Extract the files:**
   - Go to your Downloads folder
   - Find `PWRFlowNotate-....zip`
   - Right-click → **Extract All**
   - Choose a location (e.g., `C:\Extensions\`)
   - Click "Extract"

### Step 2: Unblock the Files (Important!)

Windows marks downloaded files as potentially unsafe. You must unblock them:

1. Navigate to the extracted folder
2. Right-click on the `PWRFlowNotate` folder
3. Select **Properties**
4. At the bottom, check **"Unblock"** if you see the security message
5. Click **Apply** → **OK**

### Step 3: Load in Chrome

1. **Open Chrome** and type in the address bar:
   ```
   chrome://extensions/
   ```

2. **Enable Developer Mode:**
   - Look at the top-right corner
   - Toggle **"Developer mode"** to ON

3. **Load the extension:**
   - Click **"Load unpacked"**
   - Browse to where you extracted the files
   - Select the `PWRFlowNotate` folder (the one containing `manifest.json`)
   - Click **"Select Folder"**

4. **Verify installation:**
   - You should see "PWRFlow Notate" in your extensions list
   - Look for the 📝 icon in your Chrome toolbar

### Step 4: Test It

1. Go to [Power Automate](https://make.powerautomate.com)
2. Open any flow
3. Look for 📝 buttons on your flow cards
4. Click one and add a test annotation

## Troubleshooting

### "Manifest file is missing or unreadable"

This usually means one of these issues:

**Problem 1: Wrong folder selected**
- Make sure you selected the folder that contains `manifest.json`
- Don't select a parent folder or subfolder

**Problem 2: Files are blocked**
- See "Unblock the Files" in Step 2 above

**Problem 3: Incomplete extraction**
- Delete the folder and re-extract the ZIP file
- Make sure "Extract All" completes fully

**Problem 4: File encoding**
1. Open Notepad
2. Click File → Open
3. Navigate to the `PWRFlowNotate` folder
4. Select `manifest.json`
5. Click File → Save As
6. Set Encoding to **"UTF-8"** (not UTF-8 with BOM)
7. Click Save (overwrite)
8. Try loading the extension again

### Run the Verification Tool

Open Command Prompt or PowerShell:

```cmd
cd C:\Path\To\PWRFlowNotate
python verify-extension.py
```

This will tell you exactly what's wrong.

If you don't have Python:
1. Download from [python.org](https://www.python.org/downloads/)
2. Install with "Add to PATH" checked
3. Run the command again

### Still Having Issues?

See the full [TROUBLESHOOTING.md](TROUBLESHOOTING.md) guide.

## Recommended Folder Location

Instead of Downloads, move the extension to a permanent location:

```
C:\Extensions\PWRFlowNotate\
```

This prevents accidental deletion and makes updates easier.

## Microsoft Edge

The same extension works in Edge:

1. Open Edge and go to:
   ```
   edge://extensions/
   ```
2. Follow the same steps as Chrome

## Security Note

This extension:
- ✅ Only works on Power Automate pages
- ✅ Stores data locally in your browser
- ✅ Does NOT send data anywhere
- ✅ Is open source (you can read all the code)

## Next Steps

After installation:
- Read the [README.md](README.md) for features
- Check the [Usage Guide](README.md#usage-guide)
- Try adding your first annotation!

---

**Need help?** Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md) or open an issue on GitHub.
