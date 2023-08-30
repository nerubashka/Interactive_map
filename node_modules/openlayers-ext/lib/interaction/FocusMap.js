/** An interaction to focus on the map on click. Usefull when using keyboard event on the map.
 * @constructor
 * @fires focus
 * @extends {ol.interaction.Interaction}
 */
ol.interaction.FocusMap = function() {
  //
  ol.interaction.Interaction.call(this, {});
  // Focus (hidden) button to focus on the map when click on it 
  this.focusBt = ol.ext.element.create('BUTTON', {
    on: {
      focus: function() {
        this.dispatchEvent({ type:'focus' });
      }.bind(this)
    },
    style: {
      position: 'absolute',
      zIndex: -1,
      top: 0,
      opacity: 0
    }
  });
};
ol.ext.inherits(ol.interaction.FocusMap, ol.interaction.Interaction);
/** Set the map > add the focus button and focus on the map when pointerdown to enable keyboard events.
 */
ol.interaction.FocusMap.prototype.setMap = function(map) {
  if (this._listener) ol.Observable.unByKey(this._listener);
  this._listener = null;
  if (this.getMap()) { this.getMap().getViewport().removeChild(this.focusBt); }
  ol.interaction.Interaction.prototype.setMap.call (this, map);
  if (this.getMap()) {
    // Force focus on the clicked map
    this._listener = this.getMap().on('pointerdown', function() {
      if (this.getActive()) this.focusBt.focus();
    }.bind(this));
    this.getMap().getViewport().appendChild(this.focusBt); 
  }
};
