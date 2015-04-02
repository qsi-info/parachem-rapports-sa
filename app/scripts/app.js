'use strict';

/**
 * @ngdoc overview
 * @name AngularSharePointApp
 * @description
 * # AngularSharePointApp
 *
 * Main module of the application.
 */



function parseQueryString() {
  var query = (window.location.search || '?').substr(1);
  var map = {};
  query.replace(/([^&=]+)=?([^&]*)(?:&+|$)/g, function (match, key, value) {
    (map[key] = map[key] || []).push(window.decodeURIComponent(value));
  });
  return map;
}


angular
  .module('AngularSharePointApp', [
    'ngCookies',
    'ngResource',
    'ngRoute',
    'sticky',
    'cfp.loadingBar',
    'ui.bootstrap.datetimepicker',
  ])

  .config(['$routeProvider', function ($routeProvider) {
    $routeProvider

      // Home
      .when('/home', {
        template: '',
        controller: 'MainCtrl'
      })

      // Setup
      .when('/gateway', {
        template: '',
        controller: 'GatewayCtrl',
      })

      .when('/report/new', {
        templateUrl: 'views/report/new.html',
        controller: 'ReportNewCtrl',
      })

      .when('/report/manage/:id', {
        templateUrl: 'views/report/manage.html',
        controller: 'ReportManageCtrl',
      })

      .when('/report/close-last/:id', {
        templateUrl: 'views/report/close-last.html',
        controller: 'ReportCloseLastCtrl',
      })

      .when('/report/end', {
        templateUrl: 'views/report/end.html'
      })

      .when('/reload', {
        templateUrl: 'views/reload.html',
      })

      .when('/rapportlignes/:id', {
        templateUrl: 'views/report/rapportlignes.html',
        controller: 'RapportLignesCtrl',
      })

      .when('/rapportevenements/:id', {
        templateUrl: 'views/report/rapportevenements.html',
        controller: 'RapportEvenementsCtrl',
      })

      // Default
      .otherwise({
        redirectTo: '/gateway'
      });


  }])


  .config(['dateTimePickerConfig', function (dateTimePickerConfig) {
    dateTimePickerConfig.minView = 'day';
  }])


  .run(['$location', '$rootScope', function ($location, $rootScope) {

    var host, app, params, sender, isWebPart = true;

    try {
      params = parseQueryString();
      host = params.SPHostUrl[0];
      app = params.SPAppWebUrl[0];
      sender = params.SenderId[0];
    } catch(e) {
      params = $location.search();
      host = params.SPHostUrl;
      app = params.SPAppWebUrl;
      sender = params.SenderId;
      isWebPart = false;
    }

    $rootScope.sp = {
      host: host,
      app: app, 
      sender: sender,
      isWebPart: isWebPart,
    };


  }])


  .factory('CommentList', ['SharePoint', function (SharePoint) {
    return new SharePoint.API.List('Commentaires de rapport');
  }])

  .factory('ReportList', ['SharePoint', function (SharePoint) {
    return new SharePoint.API.List('Rapports de quart');
  }])

  .factory('UPC', ['SharePoint', function (SharePoint) {
    return new SharePoint.API.List('Unite Production Charge');
  }])

  .factory('Info', ['SharePoint', function (SharePoint) {
    return new SharePoint.API.List('Rapport SA Informations');
  }])

  .factory('Transferts', ['SharePoint', function (SharePoint) {
    return new SharePoint.API.List('Rapport SA Transferts');
  }])

  .factory('RapportLignes', ['SharePoint', function (SharePoint) {
    return new SharePoint.API.List('Rapport de lignes');
  }])

  .factory('Mouvements', ['SharePoint', function (SharePoint) {
    return new SharePoint.API.List('Mouvements de reservoirs');
  }])

  .factory('SectionList', ['SharePoint', function (SharePoint) {
    return new SharePoint.API.List('Sections Rapports Parachem');
  }])





  .filter('customDate', function () {
    return function (input) {
      console.log(input);
      return input;
    };
  });











