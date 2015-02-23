'use strict';

/**
 * @ngdoc function
 * @name AngularSharePointApp.controller:ReportNewCtrl
 * @description
 * # ReportNewCtrl
 * Controller of the AngularSharePointApp
 */


 /*jshint latedef: false */
/* jshint loopfunc:true */
/* jslint browser: true, plusplus: true */

angular.module('AngularSharePointApp').controller('ReportNewCtrl', ['$scope', '$rootScope', '$location', '$q', 'ReportList', 'UPCTableList', 'MDRTableList', function ($scope, $rootScope, $location, $q, ReportList, UPCTableList, MDRTableList) {


	if (typeof $rootScope.me === 'undefined') {
		return $location.path('/gateway');
	}



	$scope.report = {
		Title: '',
		ReportType: 'sa',
		useLastReport: true,
	};

	$scope.inCreation = true;	
	$scope.accessLastReport = false;	


	$scope.setReportGroup = function (team) {
		$scope.report.Team = team;
	};

	$scope.setReportPeriod = function (period) {
		$scope.report.Period = period;
	};	



	$scope.create = function () {
		if (typeof $scope.report.Period === 'undefined') {
			return window.alert('Vous devez selectionner la période de votre quart.');
		}

		if (typeof $scope.report.Team === 'undefined') {
			return window.alert('Vous devez selectionner une équipe');
		}

		$scope.inCreation = false;


		create_essential().then(function (reportId) {
			$location.path('/report/manage/' + reportId);
		});

		// ReportList.add($scope.report).then(function (reportCreated) {
		// 	UPCTableList.add({ ReportId: reportCreated.Id, Title: '' }).then(function () {
		// 		$location.path('/report/manage/' + reportCreated.Id);
		// 	});
		// });
	};	



	function create_essential () {
		var deferred = $q.defer();
		create_report()
		.then(function (createdReport) {
			create_upc_table(createdReport.Id)
			.then(function () {
				create_mdr_table(createdReport.Id)
				.then(function () {
					deferred.resolve(createdReport.Id);
				});
			});
		});
		return deferred.promise;	
	}



	function create_upc_table (reportId) {
		return UPCTableList.add({ ReportId: reportId });
	}


	function create_mdr_table (reportId) {
		return MDRTableList.add({ ReportId: reportId });
	}



	function create_report () {
		return ReportList.add($scope.report);
	}


	function get_user_last_report () {
		ReportList.find('$filter=(IsActive eq 0) and (ReportType eq \'sa\') and (Author/Id eq ' + $rootScope.me.get_id() + ') &$orderby=Modified desc&$top=1&select=Id').then(function (reports) {
			if (reports.length > 0) {
				$scope.accessLastReport = true;
				$scope.lastReportUrl = '#/report/manage/' + reports[0].Id + '?review=yes';				
			}
		});
	}


	get_user_last_report();



}]);




