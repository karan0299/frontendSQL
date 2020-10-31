define(["./OpenIDMResource", "Backbone"], function (idm, Backbone) {

    var SchemaDef = Backbone.Model.extend({

        defaults: {
            "ddl":"",
            "short_code":"",
            "simple_name": "",
            "full_name": "",
            "valid": true,
            "errorMessage": "",
            "loading": false,
            "ready": false,
            "createDB": false,
            "createDbErrMsg":"",
            "useDB": false,
            "useDbErrMsg":"",
            "schema_structure": [],
            "statement_separator": ";",
            "browserEngines": {}
        },
        reset: function () {
            this.set(this.defaults);
            this.trigger("reloaded");
        },
        build: function () {
            var selectedDBType = this.get("dbType");
            var thisModel = this;

            return idm.serviceCall({
                type: "POST",
                url: "/build_schema",
                data: {
                    // statement_separator: this.get('statement_separator'),
                    // db_type_id: this.get('dbType').id,
                    sql: this.get('ddl')
                }
            })
            .then(function (data) {
                var short_code;
                console.log(data)
                if (data.type == "createdb"){
                    if (data.msg == ""){
                        thisModel.set({
                            "short_code": "",
                            "ready": false,
                            "valid": false,
                            "createDB": true,
                            "createDbErrMsg": "",
                            "errorMessage":"",
                            "schema_structure": []
                        });
                         thisModel.trigger("failed");
                        //  this.model._changing = true
                         console.log(thisModel)
                    } else {
                        thisModel.set({
                            "short_code": "",
                            "ready": false,
                            "valid": false,
                            "createDB": true,
                            "createDbErrMsg": data.msg,
                            "errorMessage":"",
                            "schema_structure": []
                        });
                         thisModel.trigger("failed");
                         this.model._changing = true
                         console.log(thisModel)
                    }
                }
                else if (data.type == "usedb") {
                    thisModel.set({
                        "short_code": "",
                        "ready": false,
                        "valid": false,
                        "createDB":false,
                        "useDB": true,
                        "useDbErrMsg": data.msg,
                        "schema_structure": []
                    });
                    thisModel.trigger("failed");
                    console.log(thisModel)
                }
                else if (data._id) {
                    short_code = data._id.split('_')[1];

                    if (selectedDBType.get("context") === "browser") {
                        thisModel.get("browserEngines")[selectedDBType.get("classname")].buildSchema({

                            short_code: short_code,
                            statement_separator: thisModel.get('statement_separator'),
                            ddl: thisModel.get('ddl'),
                            success: function () {
                                thisModel.set({
                                    "short_code": short_code,
                                    "ready": true,
                                    "valid": true,
                                    "errorMessage": ""
                                });

                                thisModel.get("browserEngines")[selectedDBType.get("classname")].getSchemaStructure({
                                        callback: function (schemaStruct) {
                                            thisModel.set({
                                                "schema_structure": schemaStruct
                                            });
                                            console.log("mat maan")
                                            thisModel.trigger("built");
                                        }
                                    });

                            },
                            error: function (message) {
                                console.log("mat maan 1")

                                thisModel.set({
                                    "short_code": short_code,
                                    "ready": false,
                                    "valid": false,
                                    "errorMessage": message,
                                    "schema_structure": []
                                });
                                thisModel.trigger("failed");
                            }

                        });
                    } else {
                        console.log("mat maan 2")

                        thisModel.set({
                            "short_code": short_code,
                            "useDB": false,
                            "ready": true,
                            "valid": true,
                            "errorMessage": "",
                            "schema_structure": data["schema_structure"]
                        });

                        thisModel.trigger("built");
                        console.log(thisModel)
                    }

                } else {
                    console.log("mat maan 3")

                    thisModel.set({
                        "short_code": "",
                        "ready": false,
                        "valid": false,
                        "errorMessage": data["error"],
                        "schema_structure": []
                    });
                    thisModel.trigger("failed");
                }
            },
            function (jqXHR, textStatus, errorThrown) {
                console.log("sad")
                thisModel.set({
                    "short_code": "",
                    "ready": false,
                    "valid": false,
                    "errorMessage": errorThrown,
                    "schema_structure": []
                });
                thisModel.trigger("failed");
            });

        }
    });

    return SchemaDef;

});
