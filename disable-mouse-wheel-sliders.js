/**
* Disable mousewheel control for range type input elements
* @param {WheelEvent} event    A Mouse Wheel scroll event
*/

let originalHandleMouseWheelInputChange;

function useDefaultBehavior() {
  switch (game.settings.get("disable-mouse-wheel-sliders", "metaKey")) {
    case "a": return false;
    case "b": return event.altKey;
    case "c": return event.ctrlKey || event.metaKey;
  }
}

function _handleMouseWheelInputChange_Override(event) {
  if (!useDefaultBehavior()) {
    // implementation replaced with no-op to avoid scroll wheel changing slider values
  } else {
    originalHandleMouseWheelInputChange(event);
  }
}

function disableInputNumbers(event) {
  if (!useDefaultBehavior()) {
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
    requiresReload: true
  });

  game.settings.register("disable-mouse-wheel-sliders", "disable-mouse-wheel-inputs", {
    name: "Disable Inputs",
    hint: "This disables the mouse wheel control for all input fields (e.g. grid units for tokens) on this client.",
    scope: "client",
    config: true,
    default: false,
    type: Boolean,
    requiresReload: true
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
    }
  });

  // Override default Foundry function for sliders
  if (game.settings.get("disable-mouse-wheel-sliders", "disable-mouse-wheel-sliders")) {
    originalHandleMouseWheelInputChange = Game._handleMouseWheelInputChange;
    Game._handleMouseWheelInputChange = _handleMouseWheelInputChange_Override;
  };

  // Override default HTML function for number inputs
  if (game.settings.get("disable-mouse-wheel-sliders", "disable-mouse-wheel-inputs")) {
    window.addEventListener("wheel", disableInputNumbers);
  }
});
