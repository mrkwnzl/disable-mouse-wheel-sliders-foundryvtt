/**
* Disable mousewheel control for range type input elements
* @param {WheelEvent} event    A Mouse Wheel scroll event
*/
function _handleMouseWheelInputChange_Override(event) {
  if (game.settings.get("disable-mouse-wheel-sliders", "disable-mouse-wheel-sliders")) {
    // implementation replaced with no-op to avoid scroll wheel changing slider values
  } else {
    const r = event.target;
    if ( (r.tagName !== "INPUT") || (r.type !== "range")) return;
    event.preventDefault();
    event.stopPropagation();

    // Adjust the range slider by the step size
    const step = (parseFloat(r.step) || 1.0) * Math.sign(-1 * event.deltaY);
    r.value = Math.clamped(parseFloat(r.value) + step, parseFloat(r.min), parseFloat(r.max));

    // Dispatch a change event that can bubble upwards to the parent form
    const ev = new Event("change", {bubbles: true});
    ev.target = ev.currentTarget = r;
    r.dispatchEvent(ev);
  }
}

Hooks.on("init", function () {
  game.settings.register("disable-mouse-wheel-sliders", "disable-mouse-wheel-sliders", {
    name: "Mouse wheel control disabled",
    hint: "This disables the mouse wheel control for all sliders (e.g. the volume controls in playlists) on this client.",
    scope: "client",
    config: true,
    default: false,
    type: Boolean,
  });
  _handleMouseWheelInputChange = _handleMouseWheelInputChange_Override;
});
