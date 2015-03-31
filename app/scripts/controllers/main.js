'use strict';

/**
 * @ngdoc function
 * @name AngularSharePointApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the AngularSharePointApp
 */

  /*jshint loopfunc: true */

angular.module('AngularSharePointApp').controller('MainCtrl', 
	['ReportList', '$location', '$rootScope',
	function (ReportList, $location, $rootScope) {

	if (typeof $rootScope.me === 'undefined') {
		return $location.path('/gateway');
	}



	ReportList.find('$filter=(IsActive eq 1) and (ReportType eq \'sa\')&$select=Id').then(function (reports) {
		if (reports.length < 1) {
			$location.path('/report/new');
		} else {
			$location.path('/report/manage/' + reports[0].Id);
		}
	});

}]);




