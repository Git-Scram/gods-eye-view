const STYLE_KEYS = Object.freeze({
  1: 'normal',
  2: 'retro',
  3: 'surveillance',
  4: 'thermal',
  5: 'anime',
  6: 'noir',
  7: 'snow',
});

/**
 * Bind the application's existing bubbling keyboard shortcuts.
 * Capture-phase surfaces keep first refusal. The caller owns each action and
 * persistence; form controls keep native typing except for Escape.
 * @param {object} options
 * @param {Document} options.documentRef Keyboard event target.
 * @param {HTMLElement} options.searchInput Additional editing target.
 * @param {object} options.actions Existing application operations.
 *   `openSelectedVesselListing` is optional and returns true when it opened
 *   a page, in which case the keydown's default is prevented.
 * @returns {{destroy: Function}} Synchronous, idempotent listener cleanup.
 */
export function bindApplicationShortcuts({
  documentRef,
  searchInput,
  actions,
}) {
  const onKeyDown = (event) => {
    const isFormControl =
      event.target?.matches?.('select, input, textarea') ||
      event.target === searchInput;
    if (isFormControl && event.key !== 'Escape') return;

    if (STYLE_KEYS[event.key]) actions.setStyle(STYLE_KEYS[event.key]);
    if (event.key === 'Escape') actions.dismissSearch();
    const key = event.key.toLowerCase();
    if (key === 'h') actions.toggleHud();
    if (key === 'o') actions.toggleOrbit();
    if (key === 'v') actions.toggleCleanView();
    if (key === 'f') actions.toggleLayers();
    if (key === 'd') actions.cycleDetection();
    if (key === 'c') actions.toggleCctv();
    // L opens the selected vessel's public listing in a new tab. Unlike the
    // toggles above it has a side effect outside the app, so an auto-repeated
    // keydown (one held key) and modifier chords (Ctrl+L is the browser's
    // address bar) stay inert. The action is optional for hosts without it.
    if (
      key === 'l' &&
      !event.repeat &&
      !event.ctrlKey &&
      !event.metaKey &&
      !event.altKey &&
      typeof actions.openSelectedVesselListing === 'function'
    ) {
      if (actions.openSelectedVesselListing() === true)
        event.preventDefault?.();
    }
  };
  documentRef.addEventListener('keydown', onKeyDown);
  return {
    destroy() {
      documentRef.removeEventListener('keydown', onKeyDown);
    },
  };
}
