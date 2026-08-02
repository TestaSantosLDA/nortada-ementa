## ADDED Requirements

### Requirement: Frequent item suggestions per list
Each shopping list card SHALL show tappable chips for the most frequent item names across the full history of all lists (normalized case-insensitively, minimum 2 occurrences, at most 8 chips), excluding names already present in that list.

#### Scenario: Frequent item appears as a chip
- **WHEN** "leite" has been added to lists at least twice historically and is not in list X
- **THEN** list X shows a "leite" chip (using its most recent spelling)

#### Scenario: Item already in the list
- **WHEN** a frequent item is already present in list X (bought or not)
- **THEN** no chip for it is shown on list X

### Requirement: One-tap add from chip
Tapping a chip SHALL add that item to the list exactly as if typed, syncing in real time for every account.

#### Scenario: Tapping a chip
- **WHEN** the user taps the "leite" chip on list X
- **THEN** "leite" is appended to list X as a not-bought item and the chip disappears from that list
