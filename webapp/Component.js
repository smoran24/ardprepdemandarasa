sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"AR_DP_REP_DEMANDA_RASA/AR_DP_REP_DEMANDA_RASA/model/models"
], function (UIComponent, Device, models) {
	"use strict";

	return UIComponent.extend("AR_DP_REP_DEMANDA_RASA.AR_DP_REP_DEMANDA_RASA.Component", {

		metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function () {
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

			// enable routing
			this.getRouter().initialize();

			// set the device model
			this.setModel(models.createDeviceModel(), "device");
		},
			getContentDensityClass: function () {
			if (!this._sContentDensityClass) {
				if (!sap.ui.Device.support.touch) {
					this._sContentDensityClass = "sapUiSizeCompact";
				} else {
					this._sContentDensityClass = "sapUiSizeCozy";
				}
			}
			return this._sContentDensityClass;
		}
	});
});