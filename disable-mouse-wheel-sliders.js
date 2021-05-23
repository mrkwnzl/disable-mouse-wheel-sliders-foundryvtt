/**
* Disable mousewheel control for range type input elements
* @param {WheelEvent} event    A Mouse Wheel scroll event
*/
function _handleMouseWheelInputChange_Override(event) {
  // implementation replaced with no-op to avoid scroll wheel changing slider values
}

function disableInputNumbers(event) {
  const r = event.target;
  if(r.tagName === "INPUT" && r.type === "number"){
    r.blur();
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

  // Override default Foundry function for sliders
  if (game.settings.get("disable-mouse-wheel-sliders", "disable-mouse-wheel-sliders")) {
    Game._handleMouseWheelInputChange = _handleMouseWheelInputChange_Override;
  }

  // Override default HTML function for number inputs
  if (game.settings.get("disable-mouse-wheel-sliders", "disable-mouse-wheel-inputs")) {
    document.addEventListener("mousewheel", disableInputNumbers);
  }
});
