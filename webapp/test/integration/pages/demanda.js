sap.ui.define(["sap/ui/test/Opa5"],function(e){"use strict";var a="demanda";e.createPageObjects({onTheAppPage:{actions:{},assertions:{iShouldSeeTheApp:function(){return this.waitFor({id:"app",viewName:a,success:function(){e.assert.ok(true,"The demanda view is displayed")},errorMessage:"Did not find the demanda view"})}}}})});