# Survey Page

Documents browser-side features of the generated survey page.

## Local Storage

The survey page persists form state in the browser so answers are not lost on reload or accidental navigation.

**Scope** — state is keyed to the full page URL. Different survey URLs have independent storage.

**Persistence rules:**
- any change to a form field writes the current state to local storage
- the stored state includes a timestamp updated on every write
- state expires one month after the last update; expired state is discarded on load

**Load behavior:**
1. Read the stored record for the current page URL.
2. If expired, discard it and load the page with defaults.
3. Otherwise restore all field values from local storage. Restored values override any defaults baked into the page.

**Submit behavior:** submitting the form does not clear local storage. The stored state continues to reflect the last locally edited answers.

## Association Linker

Associative questions show two groups of phrases and let the user draw connections between them. Each phrase can be connected to any number of phrases in the other group. Connecting two phrases that are already linked removes the connection.

### Mouse / Touch

- **Drag**: click or touch-start on a phrase, drag to a phrase in the opposite group, release to toggle the connection.
- **Tap**: tap a phrase to mark it pending, then tap a phrase in the opposite group to toggle the connection.

### Keyboard

- Tab to a phrase on either side.
- Press the key matching the identifier of the target phrase on the opposite side (a digit key for left-side phrases, a letter key for right-side phrases) to toggle the connection.

### Visual feedback

A live line follows the pointer during a drag. Completed connections are shown as persistent lines between the linked phrases.
