/**
* Disable mousewheel control for range type input elements
* @param {WheelEvent} event    A Mouse Wheel scroll event
*/

// Define Module ID
const MODULEID = 'disable-mouse-wheel-sliders';

// Store Foundry's original function for later use
let originalHandleMouseWheelInputChange = Game._handleMouseWheelInputChange;

function useDefaultBehavior() {
  let modifierIsDown = 0;
  game.keybindings.get(MODULEID, "escape-key").forEach(element => {
    console.log(window.keyboard.downKeys);
    console.log(element);
    if (window.keyboard.downKeys.has(element.key)) modifierIsDown++;
  });
  if (modifierIsDown > 0) return true;
  else return false;
}

function _handleMouseWheelInputChange_Override(event) {
  // Get if Setting Satus
  const overrideDefaultBehavior = game.settings.get(MODULEID, "disable-mouse-wheel-sliders");

  // If setting is off, or if setting is on but metaKey not pressed
  if (overrideDefaultBehavior && !useDefaultBehavior()) return;

  // Run Fondrys original function
  originalHandleMouseWheelInputChange(event);
}

function disableInputNumbers(event) {
  if (!useDefaultBehavior()) {
    const r = event.target;
    if (r.tagName === "INPUT" && r.type === "number") {
      let hadFocus = (document.activeElement === r);
      r.blur();
      if (hadFocus) {
        setTimeout(function () {
          r.focus();
        }, 0);
      }
      return false;
    }
  }
}

Hooks.on("init", function () {
  // Define Setting to Let user toggle if module should override sliders
  game.settings.register(MODULEID, "disable-mouse-wheel-sliders", {
    name: `${MODULEID}.settings.disable-mouse-wheel-sliders.name`,
    hint: `${MODULEID}.settings.disable-mouse-wheel-sliders.hint`,
    scope: "client",
    config: true,
    default: false,
    type: Boolean,
    requiresReload: false
  });

  // Define Setting to Let user toggle if module should override inputs
  game.settings.register(MODULEID, "disable-mouse-wheel-inputs", {
    name: `${MODULEID}.settings.disable-mouse-wheel-inputs.name`,
    hint: `${MODULEID}.settings.disable-mouse-wheel-inputs.hint`,
    scope: "client",
    config: true,
    default: false,
    type: Boolean,
    requiresReload: false,
    // When user changes setting, add or remove Event listener to disable input numbers
    onChange: (value) => {
      // If enabled, add Event Listener
      if (value) window.addEventListener("wheel", disableInputNumbers);
      // If false, remove Event Listener
      else window.removeEventListener("wheel", disableInputNumbers);
    }
  });

  // Register keybindings
  game.keybindings.register(MODULEID, "escape-key", {
    name: `${MODULEID}.settings.modifierKey.name`,
    editable: [
      {
        key: "AltLeft"
      },
      {
        key: "AltRight"
      }
    ]
  });

  // if setting is on, add Event listener to disable input numbers
  if (game.settings.get(MODULEID, "disable-mouse-wheel-inputs")) {
    window.addEventListener("wheel", disableInputNumbers);
  }

  // Override Foundrys original function
  Game._handleMouseWheelInputChange = _handleMouseWheelInputChange_Override;
});