## ADDED Requirements

### Requirement: Create named shopping lists
Any authenticated account SHALL be able to create a shopping list by giving it a non-empty name. Lists SHALL be stored independently of the schedule period.

#### Scenario: Creating a list
- **WHEN** an authenticated account submits a new list name (e.g. "Churrasco de sábado")
- **THEN** the list is created, appears for every account in real time, and starts with no items

#### Scenario: Empty name rejected
- **WHEN** the user tries to create a list with an empty or whitespace-only name
- **THEN** the list is not created and the input is not cleared

#### Scenario: Lists survive schedule reconfiguration
- **WHEN** the schedule period or cook rotation is reconfigured
- **THEN** all shopping lists and their items remain unchanged and visible

### Requirement: Shared visibility and contribution
All shopping lists SHALL be visible to every authenticated account, and any authenticated account SHALL be able to add items to any list, not only to lists it created.

#### Scenario: Viewing lists created by others
- **WHEN** an authenticated account opens the shopping lists tab
- **THEN** it sees every list, newest first, regardless of who created each one

#### Scenario: Adding an item to someone else's list
- **WHEN** an authenticated account adds an item with a non-empty name to a list created by another account
- **THEN** the item is appended to that list and appears for every account in real time

### Requirement: Mark items as bought
Any authenticated account SHALL be able to toggle an item between bought and not bought. Toggling SHALL write only the item's bought state, never the whole item or list.

#### Scenario: Marking an item bought
- **WHEN** a user checks an item
- **THEN** the item shows as bought (checked, struck through) for every account in real time

#### Scenario: Unmarking an item
- **WHEN** a user unchecks a bought item
- **THEN** the item returns to the not-bought state for every account

#### Scenario: Concurrent edits do not clobber
- **WHEN** one user toggles an item while another adds a different item to the same list
- **THEN** both changes are preserved

### Requirement: No editing or deletion in this phase
The UI SHALL NOT offer editing or deleting of lists or items in this phase; the only actions are creating lists, adding items, and toggling bought state.

#### Scenario: No delete affordance
- **WHEN** a user views a list or an item
- **THEN** no edit or delete control is shown
