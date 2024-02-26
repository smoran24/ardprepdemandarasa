/*global QUnit*/

sap.ui.define([
	"AR_DP_REP_DEMANDA_RASA/AR_DP_REP_DEMANDA_RASA/controller/demanda.controller"
], function (Controller) {
	"use strict";

	QUnit.module("demanda Controller");

	QUnit.test("I should test the demanda controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});