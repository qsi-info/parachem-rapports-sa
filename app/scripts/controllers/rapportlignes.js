'use strict';

/**
 * @ngdoc function
 * @name AngularSharePointApp.controller:RapportLignesCtrl
 * @description
 * # RapportLignesCtrl
 * Controller of the AngularSharePointApp
 */

  /*jshint loopfunc: true */

angular.module('AngularSharePointApp').controller('RapportLignesCtrl', 
	['ReportList', '$location', '$rootScope', 'RapportLignes', '$scope', '$routeParams', 'cfpLoadingBar',
	function (ReportList, $location, $rootScope, RapportLignes, $scope, $routeParams, cfpLoadingBar) {

	if (typeof $rootScope.me === 'undefined') {
		return $location.path('/gateway');
	}

	$scope.review = $routeParams.review;

	var reportId = $routeParams.id;
	$scope.reportId = reportId;
	cfpLoadingBar.start();
	RapportLignes.find('$filter=(Report eq \'' + reportId + '\')').then(function (rapportsLignes) {

		// If there is rapport lignes is not created
		if (rapportsLignes.length < 1) {
			RapportLignes.find('$orderby=Modified desc&$top=1').then(function (lastRapportsLignes) {

				// If it is the first
				if (lastRapportsLignes.length < 1) {
					RapportLignes.add({ ReportId: reportId }).then(function (rapportLignes) {
						$scope.rapportLignes = rapportLignes;
						cfpLoadingBar.complete();
					});
				} else {
					var last = lastRapportsLignes[0];
					var payload = {};
					for(var prop in last) {
						if (last.hasOwnProperty(prop) && prop.indexOf('Product_') !== -1 && last[prop] !== null) {
							payload[prop] = last[prop];
						}
					}
					payload.ReportId = reportId;
					RapportLignes.add(payload).then(function (createdRapport) {
						$scope.rapportLignes = createdRapport;
						cfpLoadingBar.complete();
					});				
				}
			});
		} else {
			$scope.rapportLignes = rapportsLignes[0];
			cfpLoadingBar.complete();
		}
	});

	$scope.dates = [];

	cfpLoadingBar.start();
	RapportLignes.fields('$filter=(CanBeDeleted eq true) and (FieldTypeKind eq 2)&$select=Description,EntityPropertyName,Title').then(function (fields) {
		$scope.fields = fields;
		cfpLoadingBar.complete();
	});

	$scope.update = function () {
		cfpLoadingBar.start();			
		var payload = {};
		for(var prop in $scope.rapportLignes) {
			if ($scope.rapportLignes.hasOwnProperty(prop) && prop.indexOf('Product_') !== -1 && $scope.rapportLignes[prop] !== null) {
				payload[prop] = $scope.rapportLignes[prop];
			}
		}
		RapportLignes.update($scope.rapportLignes.Id, payload).then(function () {
			cfpLoadingBar.complete();
		});
	};


}]);




