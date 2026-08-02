## ADDED Requirements

### Requirement: Configure cooking accounts and date range
Any authenticated account SHALL be able to open an administration popup to select which known accounts (accounts that have already signed in at least once) participate in the cooking rotation, and to set the schedule's start and end date.

#### Scenario: Selecting cooks from known accounts
- **WHEN** an authenticated account opens the administration popup
- **THEN** it lists every account that has a profile in `users/`, each selectable as part of the cooking rotation

#### Scenario: Setting the date range
- **WHEN** an authenticated account sets a start date and an end date in the administration popup and confirms
- **THEN** the configuration is saved and the schedule immediately reflects the new range and cooks for everyone

#### Scenario: Any authenticated account can change the configuration
- **WHEN** any signed-in account (not just the one who created it) opens the administration popup
- **THEN** they can view and change the current cooks and date range, consistent with how any account can already edit any day's menu

### Requirement: Automatic round-robin cook rotation
Given a configured list of cooking accounts and a date range, the system SHALL assign a cook to each day automatically by cycling through the list in order, without manual per-day assignment.

#### Scenario: More days than cooks
- **WHEN** 3 cooks are configured for a 7-day range
- **THEN** the cooks repeat in the same order across the 7 days (cook 1, 2, 3, 1, 2, 3, 1)

#### Scenario: Changing the cook list regenerates the rotation
- **WHEN** the list of configured cooks changes
- **THEN** the day-to-cook assignment for the current range is recalculated from the new list, without needing any other action

### Requirement: Unconfigured state
When no cook list or date range has been configured yet, the system SHALL show a clear "not configured yet" state instead of an empty or default schedule, with a direct action to open the administration popup.

#### Scenario: First-ever load with no configuration
- **WHEN** `config/period` or `config/cooks` does not exist in the database
- **THEN** the app shows a message that the schedule hasn't been configured yet, with a button to open the administration popup

### Requirement: Data continuity across periods
Changing the date range SHALL NOT delete or overwrite data from a previously configured period. Each period's menus, feedback, and attendance remain stored under their own period key, and only the currently configured period's data is shown in the app.

#### Scenario: Reconfiguring to a different range
- **WHEN** the date range is changed from one period to a different one
- **THEN** the previous period's menus, reviews, and attendance remain in the database untouched, and the app shows only the newly configured period's data

#### Scenario: Reconfiguring to the same starting month
- **WHEN** the date range is (re)configured with the same start month as data that already exists
- **THEN** the existing menus, reviews, and attendance for that month remain visible, since the period key is derived from the start month
