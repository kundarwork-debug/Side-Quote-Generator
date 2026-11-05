<div align="center">

<img src="logo.svg" alt="APML Portal logo" width="120">

# APML Portal

**A connected workspace for everyday operations.**

[Live Portal](https://apmlportal.vercel.app/) · [Source Code](https://github.com/kundarwork-debug/Side-Quote-Generator) · [Support](https://kundarwork-debug.github.io/sponsor/support.html)

</div>

---

## Overview

APML Portal is a web-based operations workspace that brings frequently used tools and information together in one place. It is designed to make day-to-day workflows easier to access, manage and understand through a responsive interface.

The portal brings together contact and branch information, operational tools, quotation workflows, media resources and activity reporting.

## Features

| Area | What it provides |
| --- | --- |
| **Directory** | Search and manage contact records and operational directory information. |
| **Analytics** | Review activity summaries, trends, daily activity and downloadable CSV/PDF reports. |
| **Quotation Editor** | Prepare and manage quotation documents through a dedicated editing workspace. |
| **PDF Quotations** | Generate and download quotation documents. |
| **Media Gallery** | Browse shared operational photos and media. |
| **Cloud Drive** | Access shared files and resources. |
| **Field Officer** | Work with field-officer contact information and related records. |
| **Rate Tools** | Access rate and calculation utilities, including car-rate and local-rate pages. |
| **APML Lite** | A lightweight operational utility for supported workflows. |
| **Support & Feedback** | Read project information and submit feedback or issue reports. |

## Quick Links

- **[Open APML Portal](https://apmlportal.vercel.app/)**
- [Analytics Dashboard](https://apmlportal.vercel.app/analytics.html)
- [Directory](https://apmlportal.vercel.app/directory.html)
- [Quotation Editor](https://apmlportal.vercel.app/editor.html)
- [Media Gallery](https://apmlportal.vercel.app/gallery.html)
- [Cloud Drive](https://apmlportal.vercel.app/drive.html)
- [Field Officer](https://apmlportal.vercel.app/field-officer.html)
- [APML Lite](https://apmlportal.vercel.app/APML-Lite.html)
- [Car Rate Calculator](https://apmlportal.vercel.app/car-rate.html)
- [Local Rate Tools](https://apmlportal.vercel.app/local-rate.html)
- [Support APML Portal](https://kundarwork-debug.github.io/sponsor/support.html)

## Technology

The project is built primarily with:

- **HTML5** for page structure
- **CSS3** for responsive layouts and shared visual styling
- **Vanilla JavaScript** for application logic and interactive features
- **Firebase** for connected data and media services used by the portal
- **jsPDF / AutoTable** for PDF report generation in supported areas
- **Vercel** for hosting and deployment
- **GitHub** for source control and project collaboration

## Repository Structure

```text
.
├── index.html             # Portal home page
├── common.css             # Shared styles
├── common.js              # Shared site functionality
├── header.html            # Shared header
├── footer.html            # Shared footer
├── analytics.html         # Analytics dashboard
├── directory.html         # Directory management
├── drive.html             # Cloud Drive
├── gallery.html           # Media gallery
├── editor.html            # Quotation editor
├── field-officer.html     # Field Officer workspace
├── car-rate.html          # Car rate utility
├── local-rate.html        # Local rate utility
├── APML-Lite.html         # APML Lite
├── readme-banner.svg      # README banner artwork
└── android-app/           # Android WebView application project
```

*The repository also contains supporting JavaScript, configuration, assets and other information pages.*

## Run Locally

This is a static web project and does not require a Node.js build step for basic local preview.

1. Clone the repository:

   ```bash
   git clone https://github.com/kundarwork-debug/Side-Quote-Generator.git
   cd Side-Quote-Generator
   ```

2. Open the folder in your preferred editor.
3. Start a local static server (for example, the **Live Server** extension in Visual Studio Code).
4. Open the local URL provided by the server.

Some connected features depend on their configured Firebase services and may not work fully without the appropriate project configuration and access permissions.

## Deployment

The live portal is hosted on **Vercel** and the source code is maintained in this GitHub repository. Changes pushed to the connected production branch may trigger a deployment according to the repository's Vercel project settings.

## Security & Configuration

- Do not commit private keys, service-account files, passwords or other secrets.
- Keep Firebase access controlled with appropriate database and storage security rules.
- Client-side checks are not a substitute for server-side or Firebase security rules.
- Use test data when developing or validating changes.

## Contributing

Suggestions, bug reports and improvements are welcome.

1. Fork the repository.
2. Create a focused branch for your change.
3. Test the affected page and check desktop and mobile layouts.
4. Open a pull request with a clear description of the change.

For issues, include the affected page, steps to reproduce the problem and (when useful) a screenshot with any sensitive information hidden.

## Maintainer

**Prasad Kundar**  
Operations tools and web application development

[Contact by email](mailto:Kundar.work@gmail.com)

---

<div align="center">

**Built to make everyday work simpler.**

[Visit APML Portal](https://apmlportal.vercel.app/) · [Support the project](https://kundarwork-debug.github.io/sponsor/support.html)

</div>
