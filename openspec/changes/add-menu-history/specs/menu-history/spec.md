## ADDED Requirements

### Requirement: Cross-period dish index
The app SHALL build an in-memory index of every dish ever written as a menu, across all periods, keyed by the normalized (trimmed, lowercased) text, exposing for each dish its most recent display form, most recent date, and average review stars for the days it was served.

#### Scenario: Same dish with different spellings
- **WHEN** the history contains "Bacalhau c/ natas" and "bacalhau c/ Natas" on different days
- **THEN** the index holds a single dish whose display form is the most recently used spelling

### Requirement: Menu autocomplete from history
While editing a day's menu in the day detail panel, the app SHALL suggest dishes from the index as tappable chips filtered by the typed text, and tapping a chip SHALL fill the menu with the dish's display form (saving as usual).

#### Scenario: Filtering while typing
- **WHEN** the user types "baca" in a day's menu in the panel
- **THEN** chips matching "baca" (case-insensitive) appear below the field, most recent first

#### Scenario: Tapping a chip
- **WHEN** the user taps the chip "Bacalhau c/ natas"
- **THEN** the menu field is filled with exactly that text and the value is saved as if typed

### Requirement: Dish suggestion for empty days ("roleta")
For a day with an empty menu, the day detail panel SHALL offer a one-tap action that picks a dish from the index — preferring well-reviewed dishes not cooked in the last 14 days — and fills the menu with it.

#### Scenario: Suggesting a dish
- **WHEN** the user taps the suggestion button on an empty day
- **THEN** the menu is filled with a dish from the history that was not cooked in the previous 14 days, chosen among the best-rated candidates

#### Scenario: All dishes are recent
- **WHEN** every dish in the history was cooked within the last 14 days
- **THEN** the button still works, choosing from the full history instead of failing
