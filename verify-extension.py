#!/usr/bin/env python3
"""
Verify PWRFlow Notate Extension Files
Run this to check if your extension is properly set up
"""

import os
import json
import sys

def check_file(filepath, required=True):
    """Check if a file exists and is readable"""
    if os.path.exists(filepath):
        try:
            # For binary files (images), just check if readable
            if filepath.endswith(('.png', '.jpg', '.jpeg', '.gif')):
                with open(filepath, 'rb') as f:
                    f.read(10)  # Just read first few bytes
            else:
                with open(filepath, 'r', encoding='utf-8') as f:
                    f.read()
            print(f"✓ {filepath} - OK")
            return True
        except Exception as e:
            print(f"✗ {filepath} - Error reading: {e}")
            return False
    else:
        status = "✗ MISSING (required)" if required else "⚠ MISSING (optional)"
        print(f"{status} {filepath}")
        return not required

def validate_json(filepath):
    """Validate JSON file"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            json.load(f)
        print(f"✓ {filepath} - Valid JSON")
        return True
    except json.JSONDecodeError as e:
        print(f"✗ {filepath} - Invalid JSON: {e}")
        return False
    except Exception as e:
        print(f"✗ {filepath} - Error: {e}")
        return False

def main():
    print("=" * 50)
    print("PWRFlow Notate Extension Verification")
    print("=" * 50)
    print()

    # Check current directory
    print(f"Current directory: {os.getcwd()}")
    print()

    # Required files
    print("Checking required files...")
    print("-" * 50)

    required_files = [
        'manifest.json',
        'content/content.js',
        'content/annotations.css',
        'popup/popup.html',
        'popup/popup.js',
        'icons/icon16.png',
        'icons/icon32.png',
        'icons/icon48.png',
        'icons/icon128.png'
    ]

    all_ok = True
    for filepath in required_files:
        if not check_file(filepath, required=True):
            all_ok = False

    print()

    # Validate JSON files
    print("Validating JSON files...")
    print("-" * 50)

    if os.path.exists('manifest.json'):
        if not validate_json('manifest.json'):
            all_ok = False

    if os.path.exists('package.json'):
        if not validate_json('package.json'):
            all_ok = False

    print()

    # Check manifest details
    if os.path.exists('manifest.json'):
        print("Checking manifest.json details...")
        print("-" * 50)
        try:
            with open('manifest.json', 'r', encoding='utf-8') as f:
                manifest = json.load(f)

            print(f"✓ Extension name: {manifest.get('name', 'N/A')}")
            print(f"✓ Version: {manifest.get('version', 'N/A')}")
            print(f"✓ Manifest version: {manifest.get('manifest_version', 'N/A')}")

            if manifest.get('manifest_version') != 3:
                print("⚠ Warning: Manifest version should be 3")

        except Exception as e:
            print(f"✗ Error reading manifest: {e}")
            all_ok = False

    print()
    print("=" * 50)

    if all_ok:
        print("✓ All checks passed! Extension is ready to load.")
        print()
        print("To load in Chrome:")
        print("1. Go to chrome://extensions/")
        print("2. Enable 'Developer mode' (top-right)")
        print("3. Click 'Load unpacked'")
        print("4. Select this directory:", os.getcwd())
        return 0
    else:
        print("✗ Some checks failed. Please fix the issues above.")
        print()
        print("Common fixes:")
        print("- Make sure you're in the correct directory")
        print("- Re-download the extension files")
        print("- Check file permissions")
        return 1

if __name__ == '__main__':
    sys.exit(main())
