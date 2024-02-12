/*	Copyright (c) 2016 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/** ol.control.Target draw a target at the center of the map.
 * @constructor
 * @extends {ol.control.CanvasBase}
 * @param {Object} options
 *  @param {ol.style.Style|Array<ol.style.Style>} options.style
 *  @param {string} options.composite composite operation = difference|multiply|xor|screen|overlay|darken|lighter|lighten|...
 */
ol.control.Target = function(options) {
  options = options || {};
	this.style = options.style || [
    new ol.style.Style({ image: new ol.style.RegularShape ({ points: 4, radius: 11, radius1: 0, radius2: 0, snapToPixel:true, stroke: new ol.style.Stroke({ color: "#fff", width:3 }) }) }),
    new ol.style.Style({ image: new ol.style.RegularShape ({ points: 4, radius: 11, radius1: 0, radius2: 0, snapToPixel:true, stroke: new ol.style.Stroke({ color: "#000", width:1 }) }) })
  ];
	if (!(this.style instanceof Array)) this.style = [this.style];
	this.composite = options.composite || '';
	var div = document.createElement('div');
	div.className = "ol-target ol-unselectable ol-control";
	ol.control.CanvasBase.call(this, {
    element: div,
		target: options.target
	});
	this.setVisible(options.visible!==false);
};
ol.ext.inherits(ol.control.Target, ol.control.CanvasBase);
/** Set the control visibility
 * @paraam {boolean} b 
 */
ol.control.Target.prototype.setVisible = function (b) {
  this.set("visible",b);
	if (this.getMap()) this.getMap().renderSync();
};
/** Get the control visibility
 * @return {boolean} b 
 */
ol.control.Target.prototype.getVisible = function () {
  return this.get("visible");
};
/** Draw the target
 * @private
 */
ol.control.Target.prototype._draw = function (e) {
  var ctx = this.getContext(e);
  if (!ctx || !this.getMap() || !this.getVisible()) return;
	var ratio = e.frameState.pixelRatio;
	ctx.save();
		ctx.scale(ratio,ratio);
		var cx = ctx.canvas.width/(2*ratio);
		var cy = ctx.canvas.height/(2*ratio);
		var geom = new ol.geom.Point (this.getMap().getCoordinateFromPixel([cx,cy]));
		if (this.composite) ctx.globalCompositeOperation = this.composite;
    for (var i=0; i<this.style.length; i++) {
      var style = this.style[i];
      if (style instanceof ol.style.Style) {
        var vectorContext = e.vectorContext;
        if (!vectorContext) {
          var event = {
            inversePixelTransform: [ratio,0,0,ratio,0,0],
            context: ctx,
            frameState: {
              pixelRatio: ratio,
              extent: e.frameState.extent,
              coordinateToPixelTransform: e.frameState.coordinateToPixelTransform,
              viewState: e.frameState.viewState
            }
          }
          vectorContext = ol.render.getVectorContext(event);
        } 
        vectorContext.setStyle(style);
        vectorContext.drawGeometry(geom);
      }
    }
	ctx.restore();
};
