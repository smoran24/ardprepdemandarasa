sap.ui.define([
"sap/ui/core/mvc/Controller",
"sap/m/Button",
"sap/m/Dialog",
"sap/m/List",
"sap/m/StandardListItem",
"sap/m/Text",
"sap/m/library",
"sap/ui/core/IconPool",
"sap/ui/model/json/JSONModel",
"sap/ui/model/SimpleType",
"sap/ui/model/ValidateException",
"sap/ui/core/util/Export",
"sap/ui/core/util/ExportTypeCSV"
],
function (Controller, Button, Dialog, List, StandardListItem, Text, mobileLibrary, IconPool, JSONModel, SimpleType, ValidateException,
	Export, ExportTypeCSV
) {
	"use strict";
	var oView, oSAPuser, t, desde, hasta ;
	return Controller.extend("AR_DP_REP_DEMANDA_RASA.AR_DP_REP_DEMANDA_RASA.controller.demanda", {
		onInit: function () {
			t = this;
			oView = this.getView();
			//Sentencia para minimizar contenido
			this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
            var appid = this.getOwnerComponent().getManifestEntry("/sap.app/id").replaceAll(".","/");
            var appModulePath = jQuery.sap.getModulePath(appid);
			$.ajax({
				type: 'GET',
                dataType:"json",
				url: appModulePath+ "/services/userapi/currentUser",
				success: function (dataR, textStatus, jqXHR) {
					oSAPuser = dataR.name;
					// oSAPuser = "P001445";
					t.leerUsuario(oSAPuser);
				},
				error: function (jqXHR, textStatus, errorThrown) {}
			});
			// t.leerUsuario(oSAPuser);
			t.ConsultaSolicitante();
			t.ConsultaTpedido();
		},
		leerUsuario: function (oSAPuser) {
			var flagperfil = true
			var codsucursal;
            var appid = this.getOwnerComponent().getManifestEntry("/sap.app/id").replaceAll(".","/");
            var appModulePath = jQuery.sap.getModulePath(appid);
			var url = appModulePath+ '/destinations/IDP_Nissan/service/scim/Users/' + oSAPuser;
           
			//Consulta
			$.ajax({
				type: 'GET',
				url: url,
				contentType: 'application/json; charset=utf-8',
				dataType: 'json',
				async: false,
				success: function (dataR, textStatus, jqXHR) {
					if (dataR["urn:sap:cloud:scim:schemas:extension:custom:2.0:User"] === undefined) {
						var custom = "";
					} else {
						var custom = dataR["urn:sap:cloud:scim:schemas:extension:custom:2.0:User"].attributes;
					}
					for (var i = 0; i < dataR.groups.length; i++) {

						if (dataR.groups[i].value === "AR_DP_ADMINISTRADORDEALER" || dataR.groups[i].value === "AR_DP_USUARIODEALER") {
							flagperfil = false
							for (var x = 0; x < custom.length; x++) {
								if (custom[x].name === "customAttribute6") {
									codsucursal = custom[x].value;
								}
							}
						}
					}
console.log(codsucursal);
					if (!flagperfil) {

						oView.byId("cmbcliente").setSelectedKey("0000" + codsucursal);
						oView.byId("cmbcliente").setEditable(false);

					} else {
						oView.byId("cmbcliente").setEditable(true);
					}
				},
				error: function (jqXHR, textStatus, errorThrown) {

				}
			});

		},
		press: function (oEvent) {
			var json = [];

			var dato = oEvent.getSource().getParent().mAggregations.content[0]._aSelectedPaths;
			for (var i = 0; i < dato.length; i++) {
				var oSelectedItem2 = dato[i];
				oSelectedItem2 = parseInt(oSelectedItem2.replace(/\//g, ""), 10);
				json.push(oSelectedItem2);
			}

		},

		ConsultaSolicitante: function () {
            var appid = this.getOwnerComponent().getManifestEntry("/sap.app/id").replaceAll(".","/");
            var appModulePath = jQuery.sap.getModulePath(appid);
			var UrlSolicitante = appModulePath+ '/destinations/AR_DP_REP_DEST_HANA/ODATA_masterPedido.xsodata/solicitante';
            
            //Consulta
			$.ajax({
				type: 'GET',
				url: UrlSolicitante,
				contentType: 'application/json; charset=utf-8',
				dataType: 'json',
				async: true,
				success: function (dataR, textStatus, jqXHR) {
					var cliente = new sap.ui.model.json.JSONModel(dataR.d.results);
					oView.setModel(cliente, "cliente");
				},
				error: function (jqXHR, textStatus, errorThrown) {
					console.log(JSON.stringify(jqXHR));
				}
			});
		},
		// consulta tipo pedido 
		ConsultaTpedido: function () {
            var appid = this.getOwnerComponent().getManifestEntry("/sap.app/id").replaceAll(".","/");
            var appModulePath = jQuery.sap.getModulePath(appid);
			var consulta = appModulePath+ '/destinations/AR_DP_REP_DEST_HANA/ODATA_masterPedido.xsodata/clasePedido';
           
            //Consulta
			$.ajax({
				type: 'GET',
				url: consulta,
				contentType: 'application/json; charset=utf-8',
				dataType: 'json',
				async: true,
				success: function (dataR, textStatus, jqXHR) {

					var Tpedido = new sap.ui.model.json.JSONModel(dataR.d.results);

					oView.setModel(Tpedido, "Tpedido");
				},

				error: function (jqXHR, textStatus, errorThrown) {
					console.log(JSON.stringify(jqXHR));
				},
			});
		},

		ConsultaPedidos: function () {
			var total = [];
			if (oView.byId("DP6").getValue() === null || oView.byId("DP6").getValue() === "") {
				var obj2 = {
					codigo: "03",
					descripcion: "Debe seleccionar un rango de Fecha "
				};
				var arr2 = [];
				arr2.push(obj2);
				t.popSuccesCorreo(arr2, "ERROR");
			} else {
				var arr = [];
				var semanaEnMilisegundos = (1000 * 60 * 60 * 24 * 90);
				var hoy = new Date() - semanaEnMilisegundos;

				hoy = new Date(hoy).toISOString().slice(0, 10);
				var desde = oView.byId("DP6").getDateValue();
				var hasta = oView.byId("DP6").getSecondDateValue();
				desde = new Date(desde).toISOString().slice(0, 10);
				hasta = new Date(hasta).toISOString().slice(0, 10);
				if (desde < hoy) {
					var obj2 = {
						codigo: "05",
						descripcion: "El rango de busqueda no puede ser mayor a 3 meses"
					};
					arr.push(obj2);

					t.popSuccesCorreo(arr, "ERROR");
				} else {
					t.popCarga();

					var fechdes, fechast, tip, con;
					var dealer = "";

					if (oView.byId("DP6").getValue() !== "" && oView.byId("DP6").getValue() !== null) {

						desde = oView.byId("DP6").getDateValue();
						hasta = oView.byId("DP6").getSecondDateValue()
						desde = new Date(desde).toISOString().slice(0, 10);

						hasta = new Date(hasta).toISOString().slice(0, 10);

					}
					var tipo = "";
					var dealer = "",
						dealer2;
					dealer = oView.byId("cmbcliente").getSelectedKey();

					tipo = oView.byId("cmbPedido").getSelectedKey();

					var consulta = '/destinations/AR_DP_REP_DEST_HANA/ODATA_masterPedido.xsodata/ViewPedidoDemanda?$filter=FECHA%20ge%20datetime%27' +
						desde + 'T00:00:00.0000000%27%20and%20FECHA%20le%20datetime%27' + hasta + 'T23:59:59.0000000%27'

					con = '%20and%20';

					dealer2 = 'SOLICITANTE%20eq%20%27' + dealer + '%27';
					tip = 'TIPO_PEDIDO%20eq%20%27' + tipo + '%27';

					if (dealer !== "") {
						consulta = consulta + con + dealer2;
					}
					if (oView.byId("cmbPedido").getValue() !== "") {
						consulta = consulta + con + tip;
					}
					var json = []
					var usuario;

					var fecha;
                    var appid = this.getOwnerComponent().getManifestEntry("/sap.app/id").replaceAll(".","/");
                    var appModulePath = jQuery.sap.getModulePath(appid);
                    //Consulta
					$.ajax({
						type: 'GET',
						url: appModulePath + consulta,
						contentType: 'application/json; charset=utf-8',
						dataType: 'json',
						async: true,
						success: function (dataR, textStatus, jqXHR) {
							total = dataR;
							var a = [];
							var arreglo2 = [];
							var datos = [];
							for (var d = 0; d < dataR.d.results.length; d++) {
								arreglo2.push({
									"ID_USUARIO": dataR.d.results[d].ID_USUARIO_SCP
								});

							}
							a = arreglo2;
							var c = 0;
							while (c < a.length) {
								var j = c + 1;
								while (j < a.length) {
									if (a[c].ID_USUARIO == a[j].ID_USUARIO)
										a.splice(j, 1);
									else
										j++;
								}
								c++;
							}

							for (var e = 0; e < a.length; e++) {
                                var appid = this.getOwnerComponent().getManifestEntry("/sap.app/id").replaceAll(".","/");
                                var appModulePath = jQuery.sap.getModulePath(appid);
								var url = appModulePath+ '/destinations/IDP_Nissan/service/scim/Users/' + a[e].ID_USUARIO;

								$.ajax({
									type: 'GET',
									url: url,
									contentType: 'application/json; charset=utf-8',
									dataType: 'json',
									async: false,
									success: function (dataR, textStatus, jqXHR) {
										datos.push({
											"ID_USUARIO": dataR.id,
											"NOMBRE": dataR.displayName
										});
									},
									error: function (jqXHR, textStatus, errorThrown) {

									}
								});

							}

							for (var i = 0; i < total.d.results.length; i++) {

								for (var f = 0; f < datos.length; f++) {

									if (datos[f].ID_USUARIO === total.d.results[i].ID_USUARIO_SCP) {

										usuario = datos[f].NOMBRE;
									}

								}
								//convertir clase
								if (total.d.results[i].TIPO_PEDIDO === "YNCI") {
									total.d.results[i].TIPO_PEDIDO = "Pedido Inmovilizado";
								}
								if (total.d.results[i].TIPO_PEDIDO === "YNCS") {
									total.d.results[i].TIPO_PEDIDO = "Pedido Stock";
								}
								if (total.d.results[i].TIPO_PEDIDO === "YNCU") {
									total.d.results[i].TIPO_PEDIDO = "Pedido Urgente";
								}
								if (total.d.results[i].TIPO_PEDIDO === "YNPI") {
									total.d.results[i].TIPO_PEDIDO = "Pedido Interno";
								}
								var json2 = {
									"SOLICITANTE": total.d.results[i].SOLICITANTE,
									"DESMATERIAL": total.d.results[i].DESMATERIAL,
									"NOM_SOLICITANTE": total.d.results[i].NOM_SOLICITANTE,
									"NOM_DESTINATARIO": total.d.results[i].NOM_DESTINATARIO,
									"ID_PEDIDO": total.d.results[i].ID_PEDIDO,
									"CANTPED": total.d.results[i].CANTPED,
									"MATERIAL": total.d.results[i].MATERIAL,
									"CANTASIG": total.d.results[i].CANTASIG,
									"PRECIOVENTA": total.d.results[i].PRECIOVENTA,
									"DESCUENTO": total.d.results[i].ID_PEDIDO,
									"PRECIO": total.d.results[i].PRECIO,
									"RECARGO": total.d.results[i].RECARGO,
									"TIPO_MENSAJE": total.d.results[i].TIPO_MENSAJE,
									"DESTIPOPEDIDO": total.d.results[i].DESTIPOPEDIDO,
									"ID_USUARIO_SCP": usuario,
									"FECHA": total.d.results[i].FECHA,
									"FECHA_VIEW": total.d.results[i].FECHA_VIEW,
									"TIPO_PEDIDO": total.d.results[i].TIPO_PEDIDO,
									"SELECT": false
								};
								json.push(json2);
							}
							console.log(json);
							var pedidos = new sap.ui.model.json.JSONModel(json);
							oView.setModel(pedidos, "pedidos");
							t.cerrarPopCarga2();
						},
						error: function (jqXHR, textStatus, errorThrown) {
							console.log(JSON.stringify(jqXHR));
						}
					});
				}
			}
		},
		onListItemPress: function () {
			var json = oView.getModel("pedidos").oData;

		},
		downloadExcel: sap.m.Table.prototype.exportData || function () {
			var oModel = oView.getModel("pedidos");
			var DESTIPOPEDIDO = {
				name: "TIPO PEDIDO",
				template: {
					content: "{TIPO_PEDIDO}"
				}
			};
			var SOLICITANTE = {
				name: "SOLICITANTE",
				template: {
					content: "{SOLICITANTE}"
				}
			};
			var NOM_SOLICITANTE = {
				name: "NOMBRE SOLICITANTE",
				template: {
					content: "{NOM_SOLICITANTE}"
				}
			};
			var DESTINATARIO = {
				name: "DESTINATARIO",
				template: {
					content: "{DESTINATARIO}"
				}
			};
			var NOM_DESTINATARIO = {
				name: "NOMBRE DESTINATARIO",
				template: {
					content: "{NOM_DESTINATARIO}"
				}
			};
			var ID_USUARIO_SCP = {
				name: "ID USUARIO",
				template: {
					content: "{ID_USUARIO_SCP}"
				}
			};
			var MATERIAL = {
				name: "MATERIAL",
				template: {
					content: "{MATERIAL}"
				}
			};
			var DESMATERIAL = {
				name: "DESCRIPCIÓN MATERIAL",
				template: {
					content: "{DESMATERIAL}"
				}
			};
			var CANTPED = {
				name: "CANTIDAD PEDIDA ",
				template: {
					content: "{CANTPED}"
				}
			};
			var FECHA_VIEW = {
				name: "FECHA",
				template: {
					content: "{FECHA_VIEW}"
				}
			};
			var oExport = new Export({

				exportType: new ExportTypeCSV({
					fileExtension: "csv",
					separatorChar: ";"
				}),

				models: oModel,

				rows: {
					path: "/"
				},
				columns: [
					DESTIPOPEDIDO,
					SOLICITANTE,
					NOM_SOLICITANTE,
					DESTINATARIO,
					NOM_DESTINATARIO,
					ID_USUARIO_SCP,
					MATERIAL,
					DESMATERIAL,
					CANTPED,
					FECHA_VIEW

				]
			});
			oExport.saveFile("Listado Pedidos").catch(function (oError) {

			}).then(function () {
				oExport.destroy();

			});

		},

		//////*****************************correo********

		EnvioCorreo: function (evt) {

			var oDialog = oView.byId("EnvioCorreo");
			// create dialog lazily
			if (!oDialog) {
				// create dialog via fragment factory
				oDialog = sap.ui.xmlfragment(oView.getId(), "AR_DP_REP_DEMANDA_RASA.AR_DP_REP_DEMANDA_RASA.view.Correo", this);
				oView.addDependent(oDialog);
			}
			oDialog.open();

		},
		cerrarEnvioCorreo: function () {
			//	t.limpiezacorreo();
			oView.byId("EnvioCorreo").close();
		},

		estructura: function () {
			var json = oView.getModel("pedidos").oData;

			//	var solicitante = oUsuariosap;
			var datos = "";
			var titulo =
				"<table><tr><td class= subhead>REPORTE -<b> Demanda Perdida </b><p></td></tr><p><tr><td class= h1>  Desde el portal de Dealer Portal," +
				"se Envia el reporte de demanda perdida  Correspondiente a las fechas desde : " + desde + " Hasta " + hasta +
				" :  <p> Los Materiales son :<p> ";
			var final = "</tr></table><p>Saludos <p> Dealer Portal Argentina </td> </tr> </table>";
			var cuerpo =
				"<table><tr><th>Tipo Pedido</th><th>Solicitante</th><th>Destinatario</th><th>Usuario</th><th>Material</th><th>Descripción</th><th>Cantidad</th><th>Fecha</th>";
			for (var i = 0; i < json.length; i++) {
				var dato = "<tr><td>" + json[i].TIPO_PEDIDO + "</td><td>" + json[i].NOM_SOLICITANTE + "</td><td>" + json[i].NOM_DESTINATARIO +
					"</td><td>" + json[i].ID_USUARIO_SCP + "</td><td>" + json[i].MATERIAL + "</td><td>" + json[i].DESMATERIAL + "</td><td>" + json[
						i]
					.CANTPED + "</td><td>" + json[i].FECHA_VIEW + "</td></tr> ";
				datos = datos + dato;
			}
			//	var datos = datos + dato
			var contexto = titulo + cuerpo + datos + final;

			t.envio(contexto);
		},
		envio: function (contexto) {
			t.popCarga();
			var arr = [];
			var json = {
				"root": {
					"strmailto": oView.byId("mail").getValue(),
					"strmailcc": "",
					"strsubject": oView.byId("descrpcion").getValue(),
					"strbody": contexto
				}
			};
			var arrjson = JSON.stringify(json);
            var appid = this.getOwnerComponent().getManifestEntry("/sap.app/id").replaceAll(".","/");
            var appModulePath = jQuery.sap.getModulePath(appid);
            $.ajax({
				type: 'POST',
				url: appModulePath+ '/destinations/AR_DP_DEST_CPI/http/AR/DealerPortal/Mail',
				contentType: 'application/json; charset=utf-8',
				dataType: 'json',
				async: true,
				data: arrjson,
				success: function (dataR, textStatus, jqXHR) {

				},
				error: function (jqXHR, textStatus, errorThrown) {

					t.cerrarPopCarga2();

					var obj2 = {
						codigo: "200",
						descripcion: "Correo enviado exitosamente"
					};
					var arr2 = [];
					arr2.push(obj2);
					t.popSuccesCorreo(arr2, "Pedido Creado Exitosamente");
					oView.byId("mail").setValue();
					oView.byId("descrpcion").setValue();
				}
			});
			//	codigoeliminar = "";
		},

		//***********************fin correo
		popCarga: function () {
			var oDialog = oView.byId("indicadorCarga");
			// create dialog lazily
			if (!oDialog) {
				// create dialog via fragment factory
				oDialog = sap.ui.xmlfragment(oView.getId(), "AR_DP_REP_DEMANDA_RASA.AR_DP_REP_DEMANDA_RASA.view.PopUp", this);
				oView.addDependent(oDialog);
			}
			oDialog.open();
			//	oView.byId("textCarga").setText(titulo);
		},
		cerrarPopCarga2: function () {
			oView.byId("indicadorCarga").close();
		},
		popSuccesCorreo: function (obj, titulo) {
			var oDialog = oView.byId("SuccesCorreo");
			var log = new sap.ui.model.json.JSONModel(obj);
			oView.setModel(log, "Succes");
			// create dialog lazily
			if (!oDialog) {
				// create dialog via fragment factory
				oDialog = sap.ui.xmlfragment(oView.getId(), "AR_DP_REP_DEMANDA_RASA.AR_DP_REP_DEMANDA_RASA.view.SuccesCorreo", this); //aqui se debe cambiar ar_dp_rep
				oView.addDependent(oDialog);
			}
			oView.byId("SuccesCorreo").addStyleClass(this.getOwnerComponent().getContentDensityClass());
			oDialog.open();
			oView.byId("SuccesCorreo").setTitle("" + titulo);
			//	oView.byId("dialogSucces").setState("Succes");
		},
		cerrarPopSuccesCorreo: function () {
			oView.byId("SuccesCorreo").close();
			//t.limpiezacorreo();
			t.cerrarEnvioCorreo();
		}
	});
});