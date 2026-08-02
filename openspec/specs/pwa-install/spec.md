## Purpose

Instalação no ecrã inicial: manifest e ícones, sem service worker.

## Requirements

### Requirement: Installable home screen app
The site SHALL provide a web app manifest with the app's name, colors, and icons, using relative paths valid under the GitHub Pages subpath, with `display: standalone`, so that adding it to the home screen yields a full-screen app with its own icon on Android and iOS.

#### Scenario: Adding to home screen on Android
- **WHEN** the user chooses "Adicionar ao ecrã principal" in Chrome
- **THEN** an icon named "Jantares" is added, and opening it shows the app full screen without browser chrome

#### Scenario: Adding to home screen on iOS
- **WHEN** the user chooses "Adicionar ao ecrã principal" in Safari
- **THEN** the apple-touch-icon is used and the app opens standalone

### Requirement: No service worker
The app SHALL NOT register a service worker; no caching layer exists between the browser and GitHub Pages.

#### Scenario: Fresh content after deploy
- **WHEN** a new version is deployed and the user reopens the installed app
- **THEN** the new version loads (subject only to normal HTTP caching), with no stale service worker cache involved
