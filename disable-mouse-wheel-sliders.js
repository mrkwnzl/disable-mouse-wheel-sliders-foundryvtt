/**
 * Disable mousewheel control for range type input elements
 * @param {WheelEvent} event    A Mouse Wheel scroll event
 */

// Define Module ID
const MODULE_ID = "disable-mouse-wheel-sliders";

function escapeKeyPressed(event) {
  // Check if keybinding exists in game.keyboard.downKeys
  return game.keybindings
    .get(MODULE_ID, "escape-key")
    .some((keys) => game.keyboard.downKeys.has(keys.key));
}

function disableInputNumbers(event) {
  if (event.target.type == "number") {
    if (!game.settings.get(MODULE_ID, "disable-mouse-wheel-inputs")) return;
    if (escapeKeyPressed() && !event.ctrlKey) return;
    if (escapeKeyPressed() && event.ctrlKey) {
      // User is using ctrlKey on input[type=number] use custom behavior
      const input = event.target;

      // Adjust numerical inputs when escaping
      const step =
        (parseFloat(input.step) || 1.0) * Math.sign(-1 * event.deltaY);
      input.value = Math.clamp(
        parseFloat(input.value) + step, // Current Value + Step
        parseFloat(
          input.min !== "" ? input.min : parseFloat(input.value) - step
        ), // If Min Exists, use it, else use Current Value - Step
        parseFloat(
          input.max !== "" ? input.max : parseFloat(input.value) + step
        ) // If Max Exists, use it, else use Current Value + Step
      );
    }
    event.preventDefault();
    event.stopPropagation();
  }

  if (event.target.type == "range") {
    if (!game.settings.get(MODULE_ID, "disable-mouse-wheel-sliders")) return;
    if (escapeKeyPressed()) return;
    event.preventDefault();
    event.stopPropagation();
  }
}

function addWheelEventListener() {
  window.addEventListener("wheel", disableInputNumbers, {
    passive: false,
    capture: true
  });
}

Hooks.on("init", function () {
  // Define Setting to Let user toggle if module should override sliders
  game.settings.register(MODULE_ID, "disable-mouse-wheel-sliders", {
    name: `${MODULE_ID}.settings.disable-mouse-wheel-sliders.name`,
    hint: `${MODULE_ID}.settings.disable-mouse-wheel-sliders.hint`,
    scope: "client",
    config: true,
    default: true,
    type: Boolean,
    requiresReload: false
  });

  // Define Setting to Let user toggle if module should override inputs
  game.settings.register(MODULE_ID, "disable-mouse-wheel-inputs", {
    name: `${MODULE_ID}.settings.disable-mouse-wheel-inputs.name`,
    hint: `${MODULE_ID}.settings.disable-mouse-wheel-inputs.hint`,
    scope: "client",
    config: true,
    default: true,
    type: Boolean,
    requiresReload: false,
    // When user changes setting, add or remove Event listener to disable input numbers
    onChange: (value) => {
      // If enabled, add Event Listener
      if (value) addWheelEventListener();
      else window.removeEventListener("wheel", disableInputNumbers);
    }
  });

  // Register keybindings
  game.keybindings.register(MODULE_ID, "escape-key", {
    name: `${MODULE_ID}.settings.modifierKey.name`,
    editable: [{key: "AltLeft"}, {key: "AltRight"}]
  });

  // if setting is on, add Event listener to disable input numbers
  if (game.settings.get(MODULE_ID, "disable-mouse-wheel-inputs")) {
    addWheelEventListener();
  }
});
