/**
* Disable mousewheel control for range type input elements
* @param {WheelEvent} event    A Mouse Wheel scroll event
*/

function getMetaKey() {
  if (game.settings.get("disable-mouse-wheel-sliders", "metaKey") == "a") return true;
  if (game.settings.get("disable-mouse-wheel-sliders", "metaKey") == "b") return event.altKey;
  if (game.settings.get("disable-mouse-wheel-sliders", "metaKey") == "c") return event.ctrlKey || event.metaKey;
}

function _handleMouseWheelInputChange_Override(event) {
  let metaKey = getMetaKey();
  if (!metaKey) {
    // implementation replaced with no-op to avoid scroll wheel changing slider values
  } else {
    const r = event.target;
    if ( (r.tagName !== "INPUT") || (r.type !== "range") || r.disabled ) return;
    event.preventDefault();
    event.stopPropagation();

    // Adjust the range slider by the step size
    const step = (parseFloat(r.step) || 1.0) * Math.sign(-1 * event.deltaY);
    r.value = Math.clamped(parseFloat(r.value) + step, parseFloat(r.min), parseFloat(r.max));

    // Dispatch a change event that can bubble upwards to the parent form
    const ev = new Event("change", {bubbles: true});
    r.dispatchEvent(ev);
  }
}

function disableInputNumbers(event) {
  let metaKey = getMetaKey();
  if (!metaKey) {
    const r = event.target;
    if (r.tagName === "INPUT" && r.type === "number") {
      r.blur();
      return false;
    }
  }
}

Hooks.on("init", function () {
  game.settings.register("disable-mouse-wheel-sliders", "disable-mouse-wheel-sliders", {
    name: "Disable Sliders",
    hint: "This disables the mouse wheel control for all sliders (e.g. the volume controls in playlists) on this client.",
    scope: "client",
    config: true,
    default: false,
    type: Boolean,
    onChange: () => location.reload(),
  });

  game.settings.register("disable-mouse-wheel-sliders", "disable-mouse-wheel-inputs", {
    name: "Disable Inputs",
    hint: "This disables the mouse wheel control for all input fields (e.g. grid units for tokens) on this client.",
    scope: "client",
    config: true,
    default: false,
    type: Boolean,
    onChange: () => location.reload(),
  });

  game.settings.register("disable-mouse-wheel-sliders", "metaKey", {
    name: "Choose Escape Key",
    hint: "This defines an escape key. While holding this key, mouse wheel control for sliders and input fields is enabled.",
    scope: "client",
    config: true,
    default: "a",
    type: String,
    choices: {
      "a": "none",
      "b": "alt/option",
      "c": "ctrl/cmd"
    },
    onChange: () => location.reload(),
  });

  // Override default Foundry function for sliders
  if (game.settings.get("disable-mouse-wheel-sliders", "disable-mouse-wheel-sliders")) {
    Game._handleMouseWheelInputChange = _handleMouseWheelInputChange_Override;
  }

  // Override default HTML function for number inputs
  if (game.settings.get("disable-mouse-wheel-sliders", "disable-mouse-wheel-inputs")) {
    window.addEventListener("wheel", disableInputNumbers);
  }
});
