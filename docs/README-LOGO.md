# SMC Logo Setup Instructions

## 📁 EXACT FOLDER LOCATION

**Place your logo file here:**
```
C:\React-capstone-system\web\public\smc-logo.png
```

## 🖼️ Logo Specifications

### Current Display Sizes:
- **Expanded Sidebar**: 40x40 pixels (w-10 h-10)
- **Collapsed Sidebar**: 32x32 pixels (w-8 h-8)

### Recommended Image Size:
- **Minimum**: 64x64 pixels
- **Optimal**: 128x128 pixels or higher
- **Format**: PNG (preferred) or JPG
- **Background**: Transparent or white

## 🔧 Manual Resizing Instructions

1. **Open your image editor** (Photoshop, GIMP, Paint.NET, etc.)
2. **Resize the image** to your preferred dimensions
3. **Save as**: `smc-logo.png`
4. **Place in folder**: `C:\React-capstone-system\web\public\`

## 📋 File Requirements

- **Filename**: Must be exactly `smc-logo.png`
- **Location**: `C:\React-capstone-system\web\public\smc-logo.png`
- **Format**: PNG or JPG
- **Quality**: High resolution for crisp display

## ✅ Testing

After adding the logo:
1. Restart the web development server
2. Check both sidebar states (expanded/collapsed)
3. Logo should appear without any frame or border

## 🎨 Design Notes

- **No Frame**: Logo displays without circular border or background
- **Clean Look**: Just the logo image itself
- **Responsive**: Automatically scales to fit the container
- **Fallback**: Shows blue book icon if image fails to load

## 🌐 Browser Tab Icon (Favicon)

The SMC logo is now set as the browser tab icon. The system will use your `smc-logo.png` file for:

- **Browser Tab Icon**: Shows in the browser tab
- **Bookmarks**: Appears when users bookmark the page
- **Mobile Home Screen**: Shows when added to mobile home screen

### Favicon Specifications:
- **File**: `smc-logo.png` (same file as sidebar logo)
- **Recommended Size**: 32x32 or 64x64 pixels for best results
- **Format**: PNG (works better than ICO for modern browsers)
- **Background**: Transparent or white works best

### To Update Favicon:
1. Replace the `smc-logo.png` file in `C:\React-capstone-system\web\public\`
2. Clear browser cache (Ctrl+F5)
3. The new icon will appear in browser tabs
