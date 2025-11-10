# 📝 PWRFlow Notate

A Chrome browser extension that enhances Power Automate's visual designer by adding comprehensive annotation capabilities directly to your flows. This extension enables you to add contextual notes, comments, and documentation throughout your automation workflows without cluttering the actual flow logic.

![PWRFlow Notate](icons/icon128.png)

## ✨ Key Features

### 💬 Inline Comments
- Attach detailed text annotations to any action, trigger, or condition within your flow
- Document complex logic, business requirements, and implementation decisions
- Hover tooltips show your comments without cluttering the interface
- Perfect for team collaboration and knowledge sharing

### 🎨 Visual Markers
- Add color-coded borders and highlights to flow elements
- 7 distinct colors available: Red, Orange, Yellow, Green, Blue, Purple, Pink
- Use colors to indicate:
  - **Red**: Critical sections or errors
  - **Orange**: Areas needing attention
  - **Yellow**: Warnings or cautions
  - **Green**: Completed or approved sections
  - **Blue**: Information or documentation
  - **Purple**: Dependencies or integrations
  - **Pink**: Review required

### 🏷️ Smart Tags
- Create custom tags to categorize and organize flow elements
- Tag examples: `critical`, `review`, `error-handling`, `deprecated`, `v2-migration`
- Multiple tags per element
- Tags displayed as colorful badges on flow cards

### 💾 Persistent Storage
- All annotations automatically saved to your browser
- Annotations persist across browser sessions
- Per-flow storage - each flow maintains its own annotations
- Export and backup your annotations as JSON

### 📊 Statistics Dashboard
- Track total annotations across all flows
- Monitor number of annotated flows
- View statistics in the extension popup

### 🎨 Color Guide
- Interactive color legend in extension popup
- Understand what each color represents
- Collapsible reference guide for quick access

### 📄 Flow Documentation Export
- Export comprehensive flow documentation as editable Markdown
- Documents all annotations organized by color category
- Includes Flow ID, URL, and complete color legend
- Edit in any text editor (VS Code, Notepad++, etc.)
- Convert to PDF or share with your team
- Perfect for compliance documentation and team handoffs

### 🔍 Search Across All Annotations
- Powerful search bar to find annotations across all flows
- Search through comments, tags, and action names
- Filter results by color category
- See results with flow ID, action name, and text snippets
- Click result to copy Flow URL to clipboard
- Perfect for finding "Where did I document that API key?"

## 🚀 Installation

### Install from Source (Development)

1. **Clone or download this repository**
   ```bash
   git clone https://github.com/yourusername/PWRFlowNotate.git
   cd PWRFlowNotate
   ```

2. **Open Chrome Extensions page**
   - Navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right corner)

3. **Load the extension**
   - Click "Load unpacked"
   - Select the `PWRFlowNotate` directory
   - The extension icon should appear in your Chrome toolbar

4. **Verify installation**
   - You should see the PWRFlow Notate icon in your extensions
   - Click it to open the popup and verify it's working

### Install from Chrome Web Store (Coming Soon)
The extension will be available on the Chrome Web Store once published.

## 📖 Usage Guide

### Getting Started

1. **Navigate to Power Automate**
   - Go to [Power Automate](https://make.powerautomate.com)
   - Open any flow in the designer view

2. **Wait for initialization**
   - The extension automatically detects Power Automate pages
   - Look for the 📝 annotation buttons on flow cards

3. **Add your first annotation**
   - Click the 📝 button on any action, trigger, or condition
   - The annotation modal will appear

### Adding Annotations

#### Creating a Comment
1. Click the 📝 button on a flow element
2. Type your comment in the "Comment" text area
3. Click "Save"
4. A 💬 badge appears on the element
5. Hover over the badge to see your comment

#### Adding Visual Markers
1. Open the annotation modal
2. Click a color in the "Visual Marker Color" section
3. The selected color shows a checkmark
4. Click "Save"
5. The element gets a colored left border and subtle background gradient

#### Creating Tags
1. Open the annotation modal
2. Type comma-separated tags in the "Tags" field
   - Example: `critical, review, error-handling`
3. Click "Save"
4. Tags appear as colorful badges below the element

#### Editing Annotations
1. Click the 📝 button on an annotated element
2. The modal shows existing annotations
3. Modify any field
4. Click "Save" to update

#### Deleting Annotations
1. Open the annotation modal
2. Click "Delete"
3. All annotations for that element are removed

### Managing Annotations

#### View All Annotations
1. Click the PWRFlow Notate extension icon
2. Click "📋 View Annotations"
3. A modal displays all annotations for the current flow
4. See comments, colors, and tags organized by action

#### Export Flow Documentation
1. Navigate to the flow you want to document
2. Click the PWRFlow Notate extension icon
3. Click "📄 Export Documentation"
4. Choose where to save the Markdown (.md) file
5. Open in any text editor to customize
6. Convert to PDF using Pandoc or online tools

**What's included in the documentation:**
- Flow ID and URL
- Complete color legend
- All annotations organized by color category
- Comments, tags, and action names
- Editable format for customization

#### Export Annotations Data
1. Click the PWRFlow Notate extension icon
2. Click "💾 Export Data"
3. Choose where to save the JSON file
4. Use this for backup or sharing with team members

#### Import Annotations
1. Click the PWRFlow Notate extension icon
2. Click "📥 Import"
3. Select a previously exported JSON file
4. Choose to merge with existing or replace all annotations
5. Annotations are restored to all flows

#### View Color Guide
1. Click the PWRFlow Notate extension icon
2. Click "🎨 Color Guide" to expand the legend
3. Reference what each color represents
4. Use as a quick guide when annotating

#### Search Across All Annotations
1. Click the PWRFlow Notate extension icon
2. Type your search query in the search bar (e.g., "API key", "error handling")
3. Optionally filter by color using the dropdown
4. View results showing:
   - Flow ID (shortened)
   - Action name
   - Matching text snippet (highlighted)
   - Color indicator
   - Associated tags
5. Click any result to copy the Flow URL to your clipboard
6. Navigate to the flow to view the annotation

**Search capabilities:**
- Searches through all comments, tags, and action names
- Real-time results as you type (300ms debounce)
- Color filtering for targeted searches
- Highlighted matching text
- Quick access to flows via URL copy

**Use cases:**
- "Where did I document that SharePoint list?"
- "Find all flows with error handling"
- "Show me all critical annotations"
- "Which flows mention API timeout?"

#### Clear All Annotations
1. Click the PWRFlow Notate extension icon
2. Click "Clear All"
3. Confirm the action
4. All annotations from all flows are deleted

**⚠️ Warning**: This action cannot be undone. Export first!

## 🏗️ Project Structure

```
PWRFlowNotate/
├── manifest.json           # Extension configuration
├── package.json           # Project metadata
├── README.md              # This file
├── .gitignore            # Git ignore rules
├── content/              # Content scripts
│   ├── content.js        # Main annotation logic
│   └── annotations.css   # Annotation styles
├── popup/                # Extension popup
│   ├── popup.html        # Popup interface
│   └── popup.js          # Popup functionality
└── icons/                # Extension icons
    ├── icon16.png
    ├── icon32.png
    ├── icon48.png
    ├── icon128.png
    ├── create_icons.py   # Icon generator script
    └── generate-icons.html
```

## 🔧 Technical Details

### Supported URLs
- `https://make.powerautomate.com/*`
- `https://*.flow.microsoft.com/*`

### Storage
- Uses Chrome's `chrome.storage.sync` API
- Annotations stored per Flow ID
- Syncs across devices with same Chrome profile
- Survives extension updates and reloads
- No data sent to external servers
- All data remains in your browser/Google account

### Permissions
- `storage` - Save annotations locally and sync
- `activeTab` - Interact with Power Automate pages
- `downloads` - Export documentation and data files
- `host_permissions` - Access Power Automate domains

### Browser Compatibility
- Chrome 88+
- Microsoft Edge 88+ (Chromium-based)
- Any Chromium-based browser supporting Manifest V3

## 🎨 Customization

### Modifying Colors
Edit `content/annotations.css` and update the color values:
```css
.pwrflow-marked-red {
  border-left-color: #ff4444 !important;
}
```

### Adding More Colors
1. Add color option in `content/content.js`:
   ```javascript
   { name: 'Teal', value: 'teal', hex: '#20b2aa' }
   ```
2. Add CSS class in `content/annotations.css`:
   ```css
   .pwrflow-marked-teal {
     border-left-color: #20b2aa !important;
   }
   ```

### Adjusting Button Position
Modify the button styling in `content/content.js`:
```javascript
button.style.right = '8px';  // Change position
button.style.top = '8px';
```

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Report Bugs**
   - Open an issue describing the problem
   - Include steps to reproduce
   - Mention your Chrome version and OS

2. **Suggest Features**
   - Open an issue with the `enhancement` label
   - Describe the feature and use case
   - Explain how it would help users

3. **Submit Pull Requests**
   - Fork the repository
   - Create a feature branch
   - Make your changes
   - Test thoroughly
   - Submit a PR with clear description

### Development Setup
```bash
# Clone the repo
git clone https://github.com/yourusername/PWRFlowNotate.git
cd PWRFlowNotate

# Load in Chrome
# 1. Go to chrome://extensions/
# 2. Enable Developer mode
# 3. Click "Load unpacked"
# 4. Select the PWRFlowNotate directory

# Make changes and reload extension to test
```

## 🐛 Troubleshooting

### Extension not appearing
- Verify you're on a Power Automate page
- Check that the extension is enabled in `chrome://extensions/`
- Try refreshing the page

### Annotations not saving
- Check Chrome storage permissions
- Verify you have sufficient storage space
- Try clearing browser cache and reloading

### Buttons not showing
- Power Automate's UI may have changed
- Check browser console for errors (F12)
- Try reloading the extension

### Export not working
- Ensure download permissions are enabled
- Check your browser's download settings
- Try a different download location

## 📋 Roadmap

- [x] Import annotations from JSON ✅ v1.2.0
- [x] View all annotations for current flow ✅ v1.2.0
- [x] Cloud sync across devices (via chrome.storage.sync) ✅ v1.3.0
- [x] Color guide/legend ✅ v1.4.0
- [x] Export to Markdown ✅ v1.4.0
- [x] Search and filter annotations ✅ v1.5.0
- [ ] Annotation templates
- [ ] Annotation history/versioning
- [ ] Collaborative annotations
- [ ] Integration with Microsoft Teams
- [ ] Dark mode support
- [ ] Custom color meanings
- [ ] Bulk annotation operations
- [ ] Advanced search with regex support
- [ ] Export search results

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

## 🙏 Acknowledgments

- Built for the Power Automate community
- Inspired by code annotation tools like GitHub Comments and VS Code Notes
- Uses Chrome Extension Manifest V3

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/PWRFlowNotate/issues)
- **Email**: your.email@example.com
- **Documentation**: [Wiki](https://github.com/yourusername/PWRFlowNotate/wiki)

## 🔒 Privacy

PWRFlow Notate is committed to user privacy:
- ✅ All data stored locally in your browser
- ✅ No tracking or analytics
- ✅ No data sent to external servers
- ✅ No user accounts required
- ✅ Open source - audit the code yourself

## 📸 Screenshots

### Annotation Modal
The clean, intuitive interface for adding annotations:
- Rich text comments
- Color picker with 7 options
- Tag management

### Visual Markers
Color-coded borders highlight important sections:
- Critical errors in red
- Review items in yellow
- Completed sections in green

### Comment Badges
Hover tooltips show your annotations:
- 💬 badge indicates comments
- Smooth hover animations
- Non-intrusive design

---

Made with 💜 for Power Automate users

**Version**: 1.5.0
**Last Updated**: 2025-11-10
