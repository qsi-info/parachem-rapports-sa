'use strict';

/**
 * @ngdoc function
 * @name AngularSharePointApp.controller:ReportManageCtrl
 * @description
 * # ReportManageCtrl
 * Controller of the AngularSharePointApp
 */

/* jshint latedef: false */
/* global $:false */
/* jshint loopfunc:true */
/* jslint browser: true, plusplus: true */


angular.module('AngularSharePointApp').controller('ReportManageCtrl', ['ReportList', '$location', '$routeParams', '$scope', '$rootScope', 'CommentList', '$q', 'SectionList', 'cfpLoadingBar', function (ReportList, $location, $routeParams, $scope, $rootScope, CommentList, $q, SectionList, cfpLoadingBar) {

	if (typeof $rootScope.me === 'undefined') {
		return $location.path('/gateway');
	}

	$scope.inReview = $routeParams.review === 'yes' ? true : false;
	// $scope.tables = {};
	$scope.bufferTables = {};
	$scope.fields = {};

	cfpLoadingBar.start();
	init_report_manager().then(function (result) {
		if (result === 'close') {
			return $location.path('/report/close-last/' + $scope.report.Id);
		}


		get_report_sections().then(function (sections) {
			$scope.sections = sections;
			$scope.inputs = {};
			sections.forEach(function (section) {
				$scope.inputs['SA' + section.Id] = '';
				bootstrap_collaspse_sections(sections);
				$scope.isLoad = true;
				cfpLoadingBar.complete();
			});
		});
	});


	$scope.addComment = function (section) {

		var inputIndentifier = 'SA' + section.Id;

		if ($scope.inputs[inputIndentifier] === '') {
			return window.alert('Vous devez entrez du texte');
		}
		cfpLoadingBar.start();
		var comment = {
			Title: $scope.inputs[inputIndentifier],
			SectionId: section.Id,
			ReportId: $scope.report.Id,
		};
		CommentList.add(comment).then(function (addedComment) {
			$scope.comments.push(addedComment);
			$scope.inputs[inputIndentifier] = '';
			document.getElementById('Comment' + section.Id).focus();
			cfpLoadingBar.complete();				
		});
	};



	$scope.removeComment = function (comment) {
		if (window.confirm('Etes-vous sur de vouloir supprimer cet élélement?')) {
			cfpLoadingBar.start();
			var commentToRemoveIndex = $scope.comments.indexOf(comment);
			var commentToRemove = $scope.comments[commentToRemoveIndex];
			CommentList.remove(commentToRemove.Id).then(function () {
				$scope.comments.splice(commentToRemoveIndex, 1);
				cfpLoadingBar.complete();
			});
		}
	};


	$scope.editComment = function (comment) {
		cfpLoadingBar.start();
		var buffer = comment;
		CommentList.remove(comment.Id).then(function () {
			$scope.comments.splice($scope.comments.indexOf(comment), 1);
			$scope.inputs['SA' + buffer.SectionId] = buffer.Title;
			document.getElementById('Comment' + buffer.SectionId).focus();
			cfpLoadingBar.complete();				
		});
	};	




	$scope.markNoteAsRead = function () {
		if (!$scope.report.HasReadNote) {
			ReportList.update($scope.report.Id, { HasReadNote: true }).then(function () {
				$scope.report.HasReadNote = true;
			});	
		}
	};


	$scope.saveNote = function () {
		if ($scope.report.Note === '' || $scope.report.Note === null && typeof $scope.report.Note === 'object') {
			return window.alert('Le message doit contenir de l\'information.');
		}
		cfpLoadingBar.start();			
		ReportList.update($scope.report.Id, { Note: $scope.report.Note }).then(function () {
			$('#myNote').modal('hide');
			cfpLoadingBar.complete();				
		});
	};



	$scope.submitReport = function () {
		if (window.confirm('Etes-vous certain de vouloir soumettre le rapport? Ceci sera la version finale.')) {
			cfpLoadingBar.start();			
			ReportList.update($scope.report.Id, { IsActive: false }).then(function () {
				cfpLoadingBar.complete();				
				$location.path('/report/end');
			});
		}
	};



	// $scope.saveUPCTable= function () {
	// 	cfpLoadingBar.start();
	// 	UPCTableList.update($scope.tables.UPC.Id, $scope.bufferTables.UPC).then(function () {
	// 		cfpLoadingBar.complete();
	// 		$('.report-table').modal('hide');
	// 	});
	// };







	/////////////////////////////////////////////////////////////////
	// PRIVATE FUNCTIONS 
	/////////////////////////////////////////////////////////////////	

	// function get_tables () {
	// 	var deferred = $q.defer();
	// 	_get_upc_table().then(function () {
	// 		_get_mdr_table().then(function () {
	// 			deferred.resolve(null);
	// 		});
	// 	});
	// 	return deferred.promise;
	// }



	// function _get_mdr_table () {
	// 	var deferred = $q.defer();
	// 	MDRTableList.find('$filter=Report/Id eq ' + $scope.report.Id).then(function (tables) {
	// 		if (tables.length > 0) {
	// 			$scope.tables.MDR = tables[0];
	// 		}
	// 		MDRTableList.fields('$filter=(CanBeDeleted eq true) and (TypeDisplayName ne \'Lookup\')').then(function (fields) {
	// 			$scope.fields.MDR = fields;
	// 			$scope.bufferTables.MDR = {};
	// 			fields.forEach(function (field) {
	// 				$scope.bufferTables.MDR[field.EntityPropertyName] = $scope.tables.MDR[field.EntityPropertyName];
	// 			});
	// 			deferred.resolve(null);
	// 		});
	// 	});
	// 	return deferred.promise;
	// }



	// function _get_upc_table () {
	// 	var deferred = $q.defer();
	// 	UPCTableList.find('$filter=Report/Id eq ' + $scope.report.Id).then(function (tables) {
	// 		if (tables.length > 0) {
	// 			$scope.tables.UPC = tables[0];
	// 		}
	// 		UPCTableList.fields('$filter=(CanBeDeleted eq true) and (TypeDisplayName ne \'Lookup\')').then(function (fields) {
	// 			$scope.fields.UPC = fields;
	// 			$scope.bufferTables.UPC = {};
	// 			fields.forEach(function (field) {
	// 				$scope.bufferTables.UPC[field.EntityPropertyName] = $scope.tables.UPC[field.EntityPropertyName];
	// 			});
	// 			deferred.resolve(null);
	// 		});
	// 	});
	// 	return deferred.promise;
	// }



	function bootstrap_collaspse_sections (sections) {
		sections.forEach(function (section) {
			// Caret icon orientation when section collapse or open
			$('body').on('hide.bs.collapse', '#Collapse' + section.Id, function () { 
				$('#Icon' + section.Id).removeClass('fa-caret-down').addClass('fa-caret-right'); 
			});
			$('body').on('show.bs.collapse', '#Collapse' + section.Id, function () { 
				$('#Icon' + section.Id).removeClass('fa-caret-right').addClass('fa-caret-down'); 
			});			
		});
	}



	function get_report_sections () {
		return SectionList.find('$filter=ReportType eq \'SA\'');
	}


	function get_current_report () {
		return ReportList.findOne($routeParams.id, '$select=Id,HasReadNote,useLastReport,Created,IsInitialize,Team,Period,Note,Author/Id,Author/Title&$expand=Author');
	}


	function set_report_initialize () {
		return ReportList.update($scope.report.Id, { IsInitialize: true });
	}


	function load_comments () {
		return CommentList.find('$filter=(Report eq \'' + $scope.report.Id + '\')');
	}


	function get_last_report () {
		var deferred = $q.defer();
		ReportList.find('$filter=(IsActive eq 0) and (ReportType eq \'sa\')&$orderby=Modified desc&$top=1&$select=Note,Id,IsActive').then(function (reports) {
			if (reports.length > 0) {
				deferred.resolve(reports[0]);
			} else {
				deferred.resolve(null);
			}
		});
		return deferred.promise;
	}

	function load_previous_comments () {
		var deferred = $q.defer();
		CommentList.find('$filter=(Report eq \'' + $scope.lastReport.Id + '\')').then(function (comments) {
			var promises = [];
			comments.forEach(function (comment) {
				promises.push(CommentList.add({ Title: comment.Title, SectionId: comment.SectionId, ReportId: $scope.report.Id }));
			});
			$q.all(promises).then(deferred.resolve);
		});
		return deferred.promise;
	}



	// function load_previous_tables () {
	// 	var deferred = $q.defer();
	// 	UPCTableList.find('$filter=Report/Id eq ' + $scope.lastReport.Id).then(function (tables) {
	// 		deferred.resolve(tables);
	// 	});
	// 	return deferred.promise;
	// }


	function init_report_manager () {
		var deferred = $q.defer();

		get_current_report()
		.then(function (report) {
			if (report.Author.Id !== $rootScope.me.get_id()) {
				deferred.resolve('close');
			}
			$scope.report = report;
			$scope.comments = [];
			return get_last_report();
		})
		.then(function (lastReport) {
			$scope.lastReport = lastReport;
			if ($scope.report.IsInitialize) {
				console.log('report already initialize');
				return load_comments();
			} else if ($scope.lastReport === null || !$scope.report.useLastReport) {
				console.log('first report ever or not using last report comments');
				set_report_initialize().then(function () {
					deferred.resolve(true);					
				});
			} else if ($scope.report.useLastReport) {
				console.log('report using last report comments');
				load_previous_comments().then(function (comments) {
					console.log('Previous comments', comments);
					$scope.comments = $scope.comments.concat(comments);
					set_report_initialize().then(function () {
						deferred.resolve(true);
					});
				});
			} else {
				deferred.reject(false);
			}	
		})
		.then(function (comments) {
			$scope.comments = $scope.comments.concat(comments);
			deferred.resolve(true);
		})
		.catch(deferred.reject);

		return deferred.promise;	
	}



}]);




