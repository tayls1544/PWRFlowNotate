# Update Instructions

## Critical Bug Fix - v1.0.1

A critical bug that caused page crashes when saving annotations has been fixed.

### What Was Fixed

**Problem:** The page would crash/freeze when trying to save an annotation.

**Cause:** Infinite loop in the mutation observer - when you saved an annotation, the DOM changes would trigger the observer, which would apply annotations again, which would trigger the observer again, etc.

**Solution:**
- Added `isUpdating` flag to prevent re-entry
- Added 300ms debounce to reduce excessive processing
- Mutations from our own code are now detected and skipped
- Better error handling to prevent crashes

### How to Update

#### Option 1: Reload the Extension (Fastest)

1. **Pull the latest code** from GitHub (or re-download the folder)

2. **In Chrome**, go to `chrome://extensions/`

3. Find **"PWRFlow Notate"**

4. Click the **refresh icon** (↻) on the extension card

5. **Refresh** any open Power Automate tabs

Done! Try saving an annotation now.

#### Option 2: Reinstall

1. **Remove the extension**:
   - Go to `chrome://extensions/`
   - Click "Remove" on PWRFlow Notate

2. **Get the latest code**:
   - Pull from GitHub: `git pull`
   - Or re-download the ZIP

3. **Load unpacked** again with the updated folder

4. **Refresh** Power Automate tabs

### Verify the Fix

1. Open Power Automate
2. Open any flow
3. Click a 📝 button
4. Add a comment and click Save
5. **Result:** Should save without crashing

If you still see issues, check the browser console (F12) for `[PWRFlowNotate]` messages.

### New Features in This Update

- ✅ **Debouncing**: 300ms delay prevents excessive updates
- ✅ **Smart detection**: Ignores our own DOM changes
- ✅ **Error handling**: Better error messages and recovery
- ✅ **Performance**: Reduced CPU usage from mutation observer

### Troubleshooting

If you still have issues after updating:

1. **Clear the extension storage**:
   ```javascript
   // Open console on Power Automate page (F12)
   chrome.storage.local.clear()
   ```

2. **Reload the extension**: Click the refresh icon

3. **Hard refresh** Power Automate: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

4. **Check console** for errors: Press F12 and look for red errors

### What to Expect

After the update:
- ✓ Annotations save instantly without crashes
- ✓ Page remains responsive
- ✓ Console shows: `[PWRFlowNotate] Saved annotations successfully`
- ✓ Smooth operation even with many annotations

### Reporting Issues

If you encounter any problems:
1. Open browser console (F12)
2. Look for `[PWRFlowNotate]` messages
3. Copy any error messages
4. Open an issue on GitHub with:
   - Chrome version
   - Error messages
   - Steps to reproduce

---

**Version:** 1.0.1
**Fixed:** Critical crash bug
**Date:** 2025-11-07
