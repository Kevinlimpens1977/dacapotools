# DaCapo Design System

Dit document beschrijft het complete design systeem van de DaCapo apps. Gebruik deze guide om andere projecten dezelfde look & feel te geven.

---

## 📦 Vereiste Dependencies

Voeg deze toe aan je `package.json`:

```json
{
  "dependencies": {
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "react-router-dom": "^7.11.0"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.1.18",
    "@vitejs/plugin-react": "^5.1.1",
    "tailwindcss": "^4.1.18",
    "vite": "^7.2.4"
  }
}
```

---

## 🔤 Fonts (index.html)

Voeg deze toe aan de `<head>` van je `index.html`:

```html
<!-- Google Fonts: Inter -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

<!-- Material Symbols (Icons) -->
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
```

---

## 🎨 CSS Variables & Theming (index.css)

Kopieer dit naar je `index.css`:

```css
@import "tailwindcss";

/* ═══════════════════════════════════════════════════════════════════════════
   CSS VARIABLES - DaCapo Design System
   ═══════════════════════════════════════════════════════════════════════════ */
:root {
  /* Primary Brand Colors */
  --primary: #2860E0;
  --primary-dark: #1C4DAB;
  
  /* Background Colors */
  --background-light: #F8FAFC;
  --background-dark: #111827;
  
  /* Card Colors */
  --card-light: #FFFFFF;
  --card-dark: #374151;
  
  /* Text Colors */
  --text-light: #1F2937;
  --text-dark: #F3F4F6;
  --text-secondary-light: #6B7280;
  --text-secondary-dark: #9CA3AF;
  
  /* Border Colors */
  --border-light: #E5E7EB;
  --border-dark: #4B5563;
}

/* ═══════════════════════════════════════════════════════════════════════════
   LIGHT MODE (default)
   ═══════════════════════════════════════════════════════════════════════════ */
body {
  background-color: var(--background-light);
  color: var(--text-light);
  font-family: 'Inter', sans-serif;
  transition: background-color 0.2s ease, color 0.2s ease;
}

/* ═══════════════════════════════════════════════════════════════════════════
   DARK MODE
   ═══════════════════════════════════════════════════════════════════════════ */
body.dark {
  background-color: var(--background-dark);
  color: var(--text-dark);
}

/* ═══════════════════════════════════════════════════════════════════════════
   UTILITY CLASSES
   ═══════════════════════════════════════════════════════════════════════════ */

/* Card Background */
.bg-card {
  background-color: var(--card-light);
}
.dark .bg-card {
  background-color: var(--card-dark);
}

/* Secondary Text */
.text-secondary {
  color: var(--text-secondary-light);
}
.dark .text-secondary {
  color: var(--text-secondary-dark);
}

/* Themed Border */
.border-theme {
  border-color: var(--border-light);
}
.dark .border-theme {
  border-color: var(--border-dark);
}

/* Hide Scrollbar */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* ═══════════════════════════════════════════════════════════════════════════
   MATERIAL SYMBOLS ICONS
   ═══════════════════════════════════════════════════════════════════════════ */
.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}

/* Filled variant (voor favorites, etc.) */
.material-symbols-outlined.filled {
  font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
```

---

## 🌙 Theme Context (React)

Maak een `context/ThemeContext.jsx`:

```jsx
import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    const [isDarkMode, setIsDarkMode] = useState(() => {
        // Check localStorage, default to light mode
        const saved = localStorage.getItem('app-theme');
        return saved === 'dark';
    });

    useEffect(() => {
        // Update document body class and localStorage
        if (isDarkMode) {
            document.body.classList.add('dark');
            localStorage.setItem('app-theme', 'dark');
        } else {
            document.body.classList.remove('dark');
            localStorage.setItem('app-theme', 'light');
        }
    }, [isDarkMode]);

    const toggleTheme = () => setIsDarkMode(prev => !prev);

    return (
        <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
```

---

## 🔝 Header Component

Standaard header structuur met logo, zoeken, theme toggle en profiel:

```jsx
import { useTheme } from '../context/ThemeContext';
import { Link } from 'react-router-dom';

export default function Header({ appName, logoText, onSearchClick }) {
    const { isDarkMode, toggleTheme } = useTheme();

    return (
        <header className="sticky top-0 z-50 w-full bg-card/95 backdrop-blur-md border-b border-theme shadow-sm transition-colors duration-200">
            <div className="flex items-center justify-between px-4 py-3">
                {/* Logo & Title */}
                <Link to="/" className="flex items-center gap-3">
                    <div className="size-9 bg-[#2860E0] rounded-lg flex items-center justify-center text-white font-bold shadow-sm">
                        {logoText}
                    </div>
                    <h1 className="text-lg font-bold tracking-tight">{appName}</h1>
                </Link>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    {/* Search Button */}
                    <button
                        onClick={onSearchClick}
                        className="flex items-center justify-center size-10 rounded-full hover:bg-gray-500/10 transition-colors"
                        aria-label="Zoeken"
                    >
                        <span className="material-symbols-outlined">search</span>
                    </button>

                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="flex items-center justify-center size-10 rounded-full hover:bg-gray-500/10 transition-colors"
                        aria-label={isDarkMode ? 'Light mode' : 'Dark mode'}
                    >
                        <span className="material-symbols-outlined">
                            {isDarkMode ? 'light_mode' : 'dark_mode'}
                        </span>
                    </button>

                    {/* Profile/Login Button */}
                    <button className="size-9 rounded-full bg-[#2860E0] flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                        <span className="material-symbols-outlined text-xl">person</span>
                    </button>
                </div>
            </div>
        </header>
    );
}
```

---

## 🃏 Card Component Patterns

Standaard card styling:

```jsx
{/* Basic Card */}
<div className="bg-card rounded-xl shadow-sm border border-theme overflow-hidden hover:shadow-lg hover:border-[#2860E0]/50 transition-all duration-300">
    {/* Card content */}
</div>
```

### Card met afbeelding:

```jsx
<div className="group bg-card rounded-xl shadow-sm border border-theme overflow-hidden hover:shadow-lg hover:border-[#2860E0]/50 transition-all duration-300 cursor-pointer flex flex-col">
    {/* Image */}
    <div className="w-full aspect-[16/9] relative overflow-hidden bg-gray-100 dark:bg-gray-700">
        <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
    </div>
    
    {/* Content */}
    <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-base mb-1 line-clamp-1">{title}</h3>
        <p className="text-sm text-secondary line-clamp-3 mb-4 flex-1">{description}</p>
        
        {/* Action Button */}
        <button className="w-full py-2.5 px-4 bg-[#2860E0] hover:bg-[#1C4DAB] text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-lg">open_in_new</span>
            Openen
        </button>
    </div>
</div>
```

---

## 🔘 Button Styles

### Primary Button:
```jsx
<button className="py-2.5 px-4 bg-[#2860E0] hover:bg-[#1C4DAB] text-white font-medium rounded-lg transition-colors">
    Button Text
</button>
```

### Icon Button (Round):
```jsx
<button className="flex items-center justify-center size-10 rounded-full hover:bg-gray-500/10 transition-colors">
    <span className="material-symbols-outlined">icon_name</span>
</button>
```

### Icon Button (Colored):
```jsx
<button className="flex items-center justify-center size-10 rounded-full bg-[#2860E0] text-white hover:bg-[#1C4DAB] transition-colors shadow-sm">
    <span className="material-symbols-outlined text-xl">icon_name</span>
</button>
```

---

## 🎯 Material Symbols Icons

Gebruik [Material Symbols](https://fonts.google.com/icons) voor icons:

```jsx
{/* Outline icon */}
<span className="material-symbols-outlined">home</span>

{/* Filled icon */}
<span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
    favorite
</span>

{/* Custom size */}
<span className="material-symbols-outlined text-xl">settings</span>
<span className="material-symbols-outlined text-5xl">apps</span>
```

### Veelgebruikte icons:
| Icon | Naam |
|------|------|
| 🔍 | `search` |
| ☀️ | `light_mode` |
| 🌙 | `dark_mode` |
| ❤️ | `favorite` |
| ⚙️ | `settings` |
| 👤 | `person` |
| 🚪 | `logout` |
| 🔐 | `login` |
| ➕ | `add_circle` |
| 📊 | `analytics` |
| 🏷️ | `label` |
| 📱 | `apps` |
| 🔗 | `open_in_new` |
| 🛡️ | `admin_panel_settings` |

---

## 📐 Layout Patterns

### Pagina met Header:
```jsx
function App() {
    return (
        <ThemeProvider>
            <div className="min-h-screen bg-background-light dark:bg-background-dark">
                <Header appName="Mijn App" logoText="MA" />
                <main className="px-4 py-6">
                    {/* Content */}
                </main>
            </div>
        </ThemeProvider>
    );
}
```

### Grid voor Cards:
```jsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
    {items.map(item => (
        <Card key={item.id} {...item} />
    ))}
</div>
```

---

## 🎨 Kleurenpalet

| Variabele | Light Mode | Dark Mode | Gebruik |
|-----------|------------|-----------|---------|
| `--primary` | `#2860E0` | `#2860E0` | Buttons, links, accenten |
| `--primary-dark` | `#1C4DAB` | `#1C4DAB` | Hover states |
| `--background` | `#F8FAFC` | `#111827` | Page background |
| `--card` | `#FFFFFF` | `#374151` | Card backgrounds |
| `--text` | `#1F2937` | `#F3F4F6` | Primary text |
| `--text-secondary` | `#6B7280` | `#9CA3AF` | Secondary text |
| `--border` | `#E5E7EB` | `#4B5563` | Borders |

---

## ⚡ Quick Start

1. Kopieer de fonts naar je `index.html`
2. Kopieer de CSS naar je `index.css`
3. Kopieer de `ThemeContext.jsx`
4. Wrap je app met `<ThemeProvider>`
5. Gebruik de component patterns voor Header, Cards en Buttons

---

*Laatste update: December 2024*
