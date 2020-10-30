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
                    thisModel.set({
                        "short_code": "",
                        "ready": false,
                        "valid": false,
                        "errorMessage": data.msg,
                        "schema_structure": []
                    });
                    thisModel.trigger("failed");
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
                            "ready": true,
                            "valid": true,
                            "errorMessage": "",
                            "schema_structure": data["schema_structure"]
                        });

                        thisModel.trigger("built");
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
