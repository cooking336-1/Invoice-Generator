<div align="center">

# 📄 Invoice Generator

**Create, customize, preview, and export professional invoices on any device.**

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live%20Demo-2ea44f?style=flat&logo=github)](https://cooking336-1.github.io/Invoice-Generator/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Vanilla JS](https://img.shields.io/badge/Vanilla-JS-f7df1e?logo=javascript&logoColor=black)](script.js)
[![HTML5 & CSS3](https://img.shields.io/badge/Style-CSS3%20Variables-1572b6?logo=css3)](style.css)
[![Responsive](https://img.shields.io/badge/Design-Responsive%20%26%20Mobile%20Ready-brightgreen)](index.html)

[**Explore Live Demo »**](https://cooking336-1.github.io/Invoice-Generator/)

</div>

---

## 🌟 Overview

**Invoice Generator** is a lightweight, responsive, client-side web application for generating professional invoices in seconds. It runs entirely in your web browser with zero server dependencies, ensuring maximum privacy and instant speed.

Equipped with real-time live previewing, automated currency calculations, PDF export, custom down payment deductions, local draft saving, and full dark mode support, it provides a seamless invoicing experience on smartphones, tablets, and desktops alike.

---

## ✨ Features

### 🌓 Dark Mode & Custom Theming
- **Adaptive System Theme**: Automatically matches your OS color scheme (`prefers-color-scheme: dark`).
- **One-Tap Theme Switcher**: Toggle easily between light and dark modes (ergonomically pinned to the top-right corner on mobile screens).
- **Comprehensive Dark UI**: Complete dark theme coverage across all input fields, item tables, summary cards, and the live preview document.
- **Persistent Preferences**: Saves your chosen theme to `localStorage`.

### 📱 Responsive & Mobile-First UX
- **Mobile Segmented Tabs**: Switch seamlessly between **Edit Details** and **Invoice Preview** on small screens with a real-time grand total badge.
- **Touch-Friendly Item Cards**: On mobile (`< 768px`), table rows transform into cards with dedicated touch targets (`≥ 44px`), clear labels, and full-width description inputs.
- **Floating Sticky Bottom Bar**: Persistent mobile bar showing the live invoice total with quick navigation to preview or export.
- **Auto-Zoom Prevention**: Inputs configured with `16px` base typography to eliminate frustrating iOS Safari auto-zooming.
- **Smooth Validation Navigation**: Exporting or printing with incomplete required fields automatically navigates to the form and scrolls directly to the invalid input.

### 💰 Calculations & Billing
- **Dual Price Modes**: Supports standard per-unit pricing (`Qty × Unit Price`) as well as single fixed-price line items (`F`).
- **Flexible Tax & Down Payments**: Configurable tax percentage rate and down payment deductions with automatic real-time recalculation.
- **Currency Formatting**: Formatted in Ghanaian Cedi (`GH₵` / `GHS`) with clean monospace alignment.

### 📄 Export & Print
- **Vector PDF Export**: Generates clean, publication-ready PDF documents directly in the browser via [jsPDF](https://github.com/parallax/jsPDF) and [jsPDF-AutoTable](https://github.com/simonbengtsson/jsPDF-AutoTable).
- **Print Optimization**: Specialized `@media print` styling guarantees crisp white paper printouts with dark typography regardless of your screen theme.

### 💾 Local Draft Management
- **Local Storage Persistence**: Save drafts and reload previous invoices instantly with one click.
- **Sequential Invoicing**: Auto-generates unique, incrementing invoice numbers (`INV-YYYY-XXXX`).
- **Safe Reset**: One-click form clearing with confirmation prompt.

---

## 🚀 Live Demo

You can try the live application hosted on GitHub Pages:

👉 **[https://cooking336-1.github.io/Invoice-Generator/](https://cooking336-1.github.io/Invoice-Generator/)**

---

## 📂 Project Structure

```text
Invoice-Generator/
├── .github/
│   └── workflows/
│       └── deploy.yml      # Automated GitHub Actions deployment to Pages
├── assets/                 # Static media and branding assets
├── .nojekyll               # Disables Jekyll processing on GitHub Pages
├── index.html              # Main application semantic markup
├── style.css               # Modern CSS design system & responsive rules
├── script.js               # Application logic, state, and PDF generation
├── LICENSE                 # MIT License
└── README.md               # Project documentation
```

---

## 🛠️ Quick Start

This project requires no build tools or bundlers. You can run it locally with any static HTTP server or open it directly in a browser.

### Option 1: Using Python
```bash
# Clone the repository
git clone https://github.com/cooking336-1/Invoice-Generator.git
cd Invoice-Generator

# Start local server
python -m http.server 8080
```
Then open `http://localhost:8080` in your browser.

### Option 2: Using Node.js
```bash
# Using npx serve
npx serve .
```

### Option 3: Direct File Execution
Double-click `index.html` or open it with your favorite browser.

---

## 🧰 Tech Stack

- **Core**: HTML5, Vanilla JavaScript (ES6+)
- **Styling**: Vanilla CSS3 (CSS Variables, Flexbox, Grid, Media Queries)
- **Typography**: [Inter](https://fonts.google.com/specimen/Inter) & [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono) via Google Fonts
- **PDF Generation**: [jsPDF 2.5.1](https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js) & [jsPDF-AutoTable 3.5.31](https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.31/jspdf.plugin.autotable.min.js)
- **CI/CD**: GitHub Actions & GitHub Pages

---

## 🌐 Browser Compatibility

Tested and optimized for all modern web browsers:
- Google Chrome & Chromium-based browsers (Edge, Brave, Opera)
- Mozilla Firefox
- Apple Safari (macOS & iOS)
- Mobile browsers (Chrome Android, Samsung Internet, iOS Safari)

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
