'use strict';

/**
 * @ngdoc function
 * @name AngularSharePointApp.controller:ReportCloseLastCtrl
 * @description
 * # ReportCloseLastCtrl
 * Controller of the AngularSharePointApp
 */

angular.module('AngularSharePointApp').controller('ReportCloseLastCtrl', ['$location', '$rootScope', '$routeParams', 'ReportList', '$scope', 'cfpLoadingBar', function ($location, $rootScope, $routeParams, ReportList, $scope, cfpLoadingBar) {

	if (typeof $rootScope.me === 'undefined') {
		return $location.path('/gateway');
	}

	cfpLoadingBar.start();
	ReportList.findOne($routeParams.id, '$select=Id, Created,Team,Period,Author/Id,Author/Title&$expand=Author').then(function (report) { 
		$scope.report = report;
		cfpLoadingBar.complete();
	});


	$scope.closeLastReport = function () {
		if (window.confirm('Etes-vous certain de vouloir fermer le rapport du maître précédent?')) {
			ReportList.update($scope.report.Id, { IsActive: false }).then(function () {
				$location.path('/gateway');
			});
		}
	};




}]);




