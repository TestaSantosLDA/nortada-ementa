## Purpose

Painel de detalhe do dia com ementa, presenças, sugestões e feedback.

## Requirements

### Requirement: Open detail panel from a day card
Clicking anywhere on a day's card, except on its interactive controls (the ementa textarea, the feedback form, or the attendance control), SHALL open a detail panel for that day.

#### Scenario: Click on card background opens the panel
- **WHEN** a person clicks the header area or empty space of a day's card
- **THEN** the detail panel opens showing that day's content

#### Scenario: Click on an interactive control does not open the panel
- **WHEN** a person clicks inside the ementa textarea, the feedback form, or the attendance stepper
- **THEN** the detail panel does not open, and the click behaves normally for that control

#### Scenario: Closing the panel
- **WHEN** a person closes the panel (close button, backdrop click, or Escape key)
- **THEN** the panel closes and the day's card returns to its normal state with no data lost

### Requirement: Panel shares live state with the card
The detail panel SHALL display and edit the same live data as the card (menu text, attendance, feedback) with no separate copy or duplicated state.

#### Scenario: Editing the menu inside the panel
- **WHEN** a person edits the ementa textarea while the panel is open
- **THEN** the change is saved the same way as editing it directly on the card, and the card reflects the same value once the panel closes

#### Scenario: Remote update while panel is open
- **WHEN** another person adds a review or recommendation for the same day while the panel is open
- **THEN** the panel's feedback list updates in real time, the same as the card would

### Requirement: Suggestions when the day has no menu yet
When a day's ementa is empty, the detail panel SHALL show any existing `recommendation`-type feedback entries for that day as suggestions, each with an action to use it as the menu.

#### Scenario: Day with recommendations and no menu
- **WHEN** a day has two recommendation entries and no ementa text
- **THEN** the panel shows both recommendations in a suggestions section above the ementa field

#### Scenario: Using a suggestion
- **WHEN** a person clicks "Usar esta sugestão" on one of the recommendations
- **THEN** the ementa textarea is filled with that recommendation's text, ready to edit or save as-is

#### Scenario: Day with a menu already set
- **WHEN** a day already has ementa text
- **THEN** the suggestions section does not appear, regardless of existing recommendations

#### Scenario: Day with no recommendations
- **WHEN** a day has no ementa and no recommendation entries
- **THEN** the suggestions section does not appear
