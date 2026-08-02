## ADDED Requirements

### Requirement: Top-level tab navigation
The app SHALL show a tab bar at the top of the authenticated view with two tabs — "Escala" and "Lista de compras" — and switching tabs SHALL swap the visible view without reloading the page or re-authenticating.

#### Scenario: Default tab
- **WHEN** an authenticated account loads the app
- **THEN** the "Escala" tab is active and the schedule view is shown, exactly as before this change

#### Scenario: Switching to the shopping lists tab
- **WHEN** the user activates the "Lista de compras" tab
- **THEN** the schedule view (including its footer actions) is hidden and the shopping lists view is shown, with the tab visually marked as active

#### Scenario: Open overlays close on tab switch
- **WHEN** the day detail panel or the administration popup is open and the user switches tab
- **THEN** the overlay is closed before the new view is shown

### Requirement: Tab state is session-only
The active tab SHALL be in-memory UI state only. Reloading the page SHALL return to the "Escala" tab.

#### Scenario: Reload returns to schedule
- **WHEN** the user is on the "Lista de compras" tab and reloads the page
- **THEN** the app opens on the "Escala" tab
