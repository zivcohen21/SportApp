/**
 * Created by ZIV on 22/04/2017.
 */
angular.module('menu')
    .service('CurrentModule', function ()
        {
            var currentModule = 'SportApp';
            return {
                getCurrentModule: function () {
                    return currentModule;
                },
                setCurrentModule: function (value) {
                    currentModule = value;
                    console.info("currentModule: " + currentModule);
                }
            }
        }
    )
;