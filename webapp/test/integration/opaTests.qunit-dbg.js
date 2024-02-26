/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"AR_DP_REP_DEMANDA_RASA/AR_DP_REP_DEMANDA_RASA/test/integration/AllJourneys"
	], function () {
		QUnit.start();
	});
});