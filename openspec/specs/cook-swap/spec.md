## Purpose

Troca direta de cozinheiro entre dois dias, com registo, via overrides por data.

## Requirements

### Requirement: Direct swap between two future days
From the day detail panel of a future (or today's) day, any authenticated account SHALL be able to pick another future day and swap the two days' cooks in one confirmed action, atomically, syncing for every account in real time. Past days SHALL NOT offer swapping.

#### Scenario: Swapping two days
- **WHEN** day X is cooked by A and day Y by B, and a user confirms a swap of X with Y
- **THEN** day X shows B as cook and day Y shows A, for every account, without any acceptance step

#### Scenario: Chained swap uses effective cooks
- **WHEN** day X was already swapped to cook B and the user swaps X with day Z cooked by C
- **THEN** X becomes C's day and Z becomes B's day

#### Scenario: Past day
- **WHEN** the user opens the panel of a day before today
- **THEN** no swap control is shown

### Requirement: Swap record
A swapped day SHALL show a visible record in its panel of who took the day from whom.

#### Scenario: Viewing a swapped day
- **WHEN** day X was swapped so that B cooks instead of A
- **THEN** X's panel shows a note equivalent to "Dia trocado: A ⇄ B"

### Requirement: Swaps survive schedule regeneration, with graceful fallback
Swaps SHALL be stored per date, independent of the rotation calculation. Reconfiguring the period or cook order SHALL NOT delete swaps. If a swapped-in cook is no longer in the rotation, the day SHALL fall back to its calculated cook.

#### Scenario: Reconfiguring the period keeps swaps
- **WHEN** the schedule period is re-saved with the same dates after a swap
- **THEN** the swapped days still show the swapped cooks

#### Scenario: Swapped-in cook removed from rotation
- **WHEN** a swap gave day X to cook B and B is later removed from the rotation
- **THEN** day X shows its calculated rotation cook instead
