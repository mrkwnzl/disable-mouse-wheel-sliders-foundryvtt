/**
* Disable mousewheel control for range type input elements
* @param {WheelEvent} event    A Mouse Wheel scroll event
*/

// Define Module ID
const MODULEID = 'disable-mouse-wheel-sliders'

// Store Foundry's original function for later use
let originalHandleMouseWheelInputChange = Game._handleMouseWheelInputChange;

function useDefaultBehavior(event) {
  // Get if OS is Mac
  // ! navigator.platform is deprecated, but navigator.userAgentData.platform is not supported in Firefox, Safari or HTTP
  const isMacOS = (navigator?.userAgentData?.platform ?? navigator?.platform ?? '').toUpperCase().indexOf('MAC') >= 0;
  const escapeKey = game.settings.get(MODULEID, "metaKey");

  // If OS is Mac and escapeKey is set to ctrlKey
  if (isMacOS && escapeKey === "ctrlKey" && event.metaKey) return true;
  else return event?.[escapeKey] ?? false;
}

function _handleMouseWheelInputChange_Override(event) {
  // Get if Setting Satus
  const overrideDefaultBehavior = game.settings.get(MODULEID, "disable-mouse-wheel-sliders");
  
  // If setting is off, or if setting is on but metaKey not pressed
  if (overrideDefaultBehavior && !useDefaultBehavior(event)) return;
  
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
    requiresReload: false,
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

  // if setting is on, add Event listener to disable input numbers
  if (game.settings.get(MODULEID, "disable-mouse-wheel-inputs")) {
    window.addEventListener("wheel", disableInputNumbers);
  }

  // Define Setting to Let user Choose Escape key for Mouse Wheel Evert
  game.settings.register(MODULEID, "metaKey", {
    name: `${MODULEID}.settings.metaKey.name`,
    hint: `${MODULEID}.settings.metaKey.hint`,
    scope: "client",
    config: true,
    default: "a",
    type: String,
    choices: {
      "none": `${MODULEID}.settings.metaKey.choices.none`,
      "altKey": `${MODULEID}.settings.metaKey.choices.altKey`,
      "ctrlKey": `${MODULEID}.settings.metaKey.choices.ctrlKey`
    }
  });
  
  // Override Foundrys original function
  Game._handleMouseWheelInputChange = _handleMouseWheelInputChange_Override;

  // Migrate Old Settings to new Settings
  Hooks.once("ready", function () {
    let oldSetting = game.settings.get(MODULEID, "metaKey");
    if (['a', 'b', 'c'].includes(oldSetting)) {
      if (oldSetting === 'a') game.settings.set(MODULEID, "metaKey", 'none');
      else if (oldSetting === 'b') game.settings.set(MODULEID, "metaKey", 'altKey');
      else if (oldSetting === 'c') game.settings.set(MODULEID, "metaKey", 'ctrlKey');
    }
  });
});