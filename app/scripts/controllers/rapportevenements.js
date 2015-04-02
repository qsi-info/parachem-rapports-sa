'use strict';

/**
 * @ngdoc function
 * @name AngularSharePointApp.controller:RapportEvenementsCtrl
 * @description
 * # RapportEvenementsCtrl
 * Controller of the AngularSharePointApp
 */

  /*jshint loopfunc: true */
  /*jshint unused:false*/
  /*jshint asi:true*/

angular.module('AngularSharePointApp').controller('RapportEvenementsCtrl', 
	['ReportList', '$location', '$rootScope', '$scope', '$routeParams', 'cfpLoadingBar', 'UPC', '$q', 'Info', 'Transferts', 'Mouvements',
	function (ReportList, $location, $rootScope, $scope, $routeParams, cfpLoadingBar, UPC, $q, Info, Transferts, Mouvements) {

	if (typeof $rootScope.me === 'undefined') {
		return $location.path('/gateway');
	}

	var reportId = $routeParams.id;
	$scope.reportId = reportId;



	$scope.reservoirs = ['--', '509', '513', '522', '517', '340', '235', '1102', '511', '512', '521'];





	///////////////////////////////////////////////////
	// Unite Production / Charge
	///////////////////////////////////////////////////
	$scope.UPC = [];
	$scope.newUPC = {};

	$scope.addUPC = function () {
		cfpLoadingBar.start();
		$scope.newUPC.ReportId = $scope.reportId;
		UPC.add($scope.newUPC).then(function (newItem) {
			$scope.UPC.push(newItem);
			$scope.newUPC = {};
			cfpLoadingBar.complete();
		});
	};


	$scope.updateUPCReservoir = function (idx) {
		cfpLoadingBar.start();
		var toUpdate = $scope.UPC[idx];
		UPC.update(toUpdate.Id, { Reservoir: toUpdate.Reservoir }).then(function () {
			cfpLoadingBar.complete();			
		});
	};

	$scope.removeUPC = function (idx) {
		if (window.confirm('Etes vous certain de vouloir supprimer cet élément?')) {
			cfpLoadingBar.start();
			var toRemove = $scope.UPC[idx];
			UPC.remove(toRemove.Id).then(function () {
				$scope.UPC.splice(idx, 1);				
				cfpLoadingBar.complete();
			});
		}
	};


	cfpLoadingBar.start();
	UPC.find('$filter=(Report eq \'' + reportId + '\')').then(function (items) {
		// There is no items for that report
		if (items.length < 1) {
			get_last_report().then(function (lastReport) {
				if (lastReport) {
					load_previous_upc(lastReport.Id).then(function (items) {
						$scope.UPC = items;
						cfpLoadingBar.complete();
					});					
				} else {
					cfpLoadingBar.complete();
				}
			});
		} else {
			$scope.UPC = items;
			cfpLoadingBar.complete();
		}
	});




	///////////////////////////////////////////////////
	// Transferts
	///////////////////////////////////////////////////

	$scope.Transferts = [];
	$scope.newTransfert = {};

	$scope.addTransfert = function () {
		cfpLoadingBar.start();
		$scope.newTransfert.ReportId = $scope.reportId;
		Transferts.add($scope.newTransfert).then(function (newItem) {
			$scope.Transferts.push(newItem);
			$scope.newTransfert = {};
			cfpLoadingBar.complete();
		});
	};


	$scope.removeTransfert = function (idx) {
		if (window.confirm('Etes vous certain de vouloir supprimer cet élément?')) {
			cfpLoadingBar.start();
			var toRemove = $scope.Transferts[idx];
			Transferts.remove(toRemove.Id).then(function () {
				$scope.Transferts.splice(idx, 1);				
				cfpLoadingBar.complete();
			});
		}
	};

	Transferts.find('$filter=(Report eq \'' + reportId + '\')')
	.then(function (items) {
		$scope.Transferts = items;
	});







	///////////////////////////////////////////////////
	// Mouvements
	///////////////////////////////////////////////////

	$scope.Mouvements = [];
	$scope.newMouvement = {};

	$scope.addMouvement = function () {
		cfpLoadingBar.start();
		$scope.newMouvement.ReportId = $scope.reportId;
		Mouvements.add($scope.newMouvement).then(function (newItem) {
			$scope.Mouvements.push(newItem);
			$scope.newMouvement = {};
			cfpLoadingBar.complete();
		});
	};


	$scope.removeMouvement = function (idx) {
		if (window.confirm('Etes vous certain de vouloir supprimer cet élément?')) {
			cfpLoadingBar.start();
			var toRemove = $scope.Mouvements[idx];
			Mouvements.remove(toRemove.Id).then(function () {
				$scope.Mouvements.splice(idx, 1);				
				cfpLoadingBar.complete();
			});
		}
	};

	Mouvements.find('$filter=(Report eq \'' + reportId + '\')')
	.then(function (items) {
		$scope.Mouvements = items;
	});








	///////////////////////////////////////////////////
	// Informations
	///////////////////////////////////////////////////

	$scope.saveInfo = function () {
		cfpLoadingBar.start();
		Info.update($scope.Info.Id, { 
			IsoPSI: $scope.Info.IsoPSI, 
			IsoNiveau: $scope.Info.IsoNiveau, 
			IsoHeure: $scope.Info.IsoHeure,
			Quai105: $scope.Info.Quai105,
			Quai109: $scope.Info.Quai109,
		}).then(function () {
			cfpLoadingBar.complete();
			$location.path('/report/manage/'.concat($scope.reportId));
		});
	};

	cfpLoadingBar.start();
	Info.find('$filter=(Report eq \'' + reportId + '\')').then(function (items) {
		if (items.length < 1) {
			get_last_report().then(function (lastReport) {
				if (lastReport) {
					load_previous_info(lastReport.Id).then(function (info) {
						$scope.Info = info;
						cfpLoadingBar.complete();
					});					
				} else {
					cfpLoadingBar.complete();
				}
			});
		} else {
			$scope.Info = items[0];
			cfpLoadingBar.complete();
		}
	});








	///////////////////////////////////////////////////
	// PRIVATE FUNCTIONS
	///////////////////////////////////////////////////

	function get_last_report () {
		var deferred = $q.defer();
		ReportList.find('$filter=(IsActive eq 0) and (ReportType eq \'sa\')&$orderby=Modified desc&$top=1&$select=Id').then(function (reports) {
			if (reports.length > 0) {
				deferred.resolve(reports[0]);
			} else {
				deferred.resolve(null);
			}
		});
		return deferred.promise;
	}



	function load_previous_upc (lastReportId) {
		var deferred = $q.defer();
		UPC.find('$filter=(Report eq \'' + lastReportId + '\')').then(function (items) {
			var promises = [];
			items.forEach(function (item) {
				promises.push(UPC.add({ Title: item.Title, Reservoir: item.Reservoir, ReportId: $scope.reportId }));
			});
			$q.all(promises).then(deferred.resolve);
		});
		return deferred.promise;
	}


	function load_previous_info (lastReportId) {
		var deferred = $q.defer();
		Info.find('$filter=(Report eq \'' + lastReportId + '\')').then(function (items) {
			var info = items[0] || {};
			Info.add({ IsoPSI: info.IsoPSI, IsoNiveau: info.IsoNiveau, IsoHeure: info.IsoHeure, ReportId: $scope.reportId}).then(deferred.resolve);
		});
		return deferred.promise;
	}



}]);




