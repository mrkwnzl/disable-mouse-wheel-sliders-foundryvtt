/**
* Disable mousewheel control for range type input elements
* @param {WheelEvent} event    A Mouse Wheel scroll event
*/

// Define Module ID
const MODULE_ID = 'disable-mouse-wheel-sliders';

// Store Foundry's original input change function for later use
let originalHandleMouseWheelInputChange = Game._handleMouseWheelInputChange;

function useDefaultBehavior() {
  // Check if keybinding exists in window.keyboard.downKeys 
  return game.keybindings.get(MODULE_ID, "escape-key").some(keys => window.keyboard.downKeys.has(keys.key));
}

function _handleMouseWheelInputChange_Override(event) {
  // Get if Setting Satus
  const overrideDefaultBehavior = game.settings.get(MODULE_ID, "disable-mouse-wheel-sliders");

  // If setting is off, or if setting is on but escape key not pressed
  if (overrideDefaultBehavior && !useDefaultBehavior()) return;

  // Run Foundry’s original function
  originalHandleMouseWheelInputChange(event);
}

function disableInputNumbers(event) {
  // Only apply logic to input[type="number"]
  if (event.target.tagName !== 'INPUT' || event.target.type !== "number") return;

  // If override key is not pressed exit
  if (!useDefaultBehavior(event)) return (event.preventDefault(), event.stopPropagation());

  // Check if Override key is ctrlKey
  if (!event.ctrlKey) return;

  // User is using ctrlKey on input[type=number] use custom behavior
  const input = event.target;

  // Adjust numerical inputs when escaping
  const step = (parseFloat(input.step) || 1.0) * Math.sign(-1 * event.deltaY);
  input.value = Math.clamped(
    parseFloat(input.value) + step,  // Current Value + Step
    parseFloat(input.min !== '' ? input.min : (parseFloat(input.value) - step)), // If Min Exists, use it, else use Current Value - Step
    parseFloat(input.max !== '' ? input.max : (parseFloat(input.value) + step)), // If Max Exists, use it, else use Current Value + Step
  );
}

Hooks.on("init", function () {
  // Define Setting to Let user toggle if module should override sliders
  game.settings.register(MODULE_ID, "disable-mouse-wheel-sliders", {
    name: `${MODULE_ID}.settings.disable-mouse-wheel-sliders.name`,
    hint: `${MODULE_ID}.settings.disable-mouse-wheel-sliders.hint`,
    scope: "client",
    config: true,
    default: false,
    type: Boolean,
    requiresReload: false
  });

  // Define Setting to Let user toggle if module should override inputs
  game.settings.register(MODULE_ID, "disable-mouse-wheel-inputs", {
    name: `${MODULE_ID}.settings.disable-mouse-wheel-inputs.name`,
    hint: `${MODULE_ID}.settings.disable-mouse-wheel-inputs.hint`,
    scope: "client",
    config: true,
    default: false,
    type: Boolean,
    requiresReload: false,
    // When user changes setting, add or remove Event listener to disable input numbers
    onChange: (value) => {
      // If enabled, add Event Listener
      if (value) window.addEventListener("wheel", disableInputNumbers, {passive: false});
      // If false, remove Event Listener
      else window.removeEventListener("wheel", disableInputNumbers);
    }
  });

  // Register keybindings
  game.keybindings.register(MODULE_ID, "escape-key", {
    name: `${MODULE_ID}.settings.modifierKey.name`,
    editable: [
      {key: "AltLeft"},
      {key: "AltRight"}
    ]
  });

  // if setting is on, add Event listener to disable input numbers
  if (game.settings.get(MODULE_ID, "disable-mouse-wheel-inputs")) {
    window.addEventListener("wheel", disableInputNumbers, {passive: false});
  }

  // Override Foundrys original function
  Game._handleMouseWheelInputChange = _handleMouseWheelInputChange_Override;
});