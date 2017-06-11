/**
 * Created by ZIV on 16/11/2016.
 */

angular.module('menu').controller('MenuController', ['$scope', '$location', 'Authentication', 'CurrentModule',
    function($scope, $location, Authentication, CurrentModule)
    {

        $scope.authentication = Authentication;
        $scope.windWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
        $scope.currentModuleInApp = localStorage.getItem("currentModule");

        $scope.showOne = function (currentModule)
        {

            CurrentModule.setCurrentModule(currentModule);
            $scope.currentModuleInApp = currentModule;
            localStorage.setItem("currentModule", currentModule);
        };

        var changeClass = function (r,className1,className2) {
            var regex = new RegExp("(?:^|\\s+)" + className1 + "(?:\\s+|$)");
            if( regex.test(r.className) ) {
                r.className = r.className.replace(regex,' '+className2+' ');
            }
            else{
                r.className = r.className.replace(new RegExp("(?:^|\\s+)" + className2 + "(?:\\s+|$)"),' '+className1+' ');
            }
            return r.className;
        };

        //  Creating our button in JS for smaller screens
       // var menuElements = document.getElementById('mainMenu');
       // menuElements.insertAdjacentHTML('afterBegin','<button type="button" id="menutoggle" class="navtoogle" aria-hidden="true"><i aria-hidden="true" class="icon-menu"> </i> Menu</button>');

        //  Toggle the class on click to show / hide the menu
        document.getElementById('menutoggle').onclick = function() {
            changeClass(this, 'navtoogle active', 'navtoogle');
        };

        // http://tympanus.net/codrops/2013/05/08/responsive-retina-ready-menu/comment-page-2/#comment-438918
        document.onclick = function(e) {
            var mobileButton = document.getElementById('menutoggle'),
                buttonStyle =  mobileButton.currentStyle ? mobileButton.currentStyle.display : getComputedStyle(mobileButton, null).display;

            if(buttonStyle === 'block' && e.target !== mobileButton && new RegExp(' ' + 'active' + ' ').test(' ' + mobileButton.className + ' ')) {
                changeClass(mobileButton, 'navtoogle active', 'navtoogle');
            }
        }

    }
]);

