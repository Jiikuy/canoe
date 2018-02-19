'use strict'
/* global angular  */
angular.module('canoeApp.services')
  .factory('rateService', function ($rootScope, $timeout, $filter, $log, lodash, platformInfo) {
    // var isChromeApp = platformInfo.isChromeApp
    // var isWindowsPhoneApp = platformInfo.isCordova && platformInfo.isWP
    // var isIOS = platformInfo.isIOS

    var RAW_PER_NANO = Math.pow(10, 30) // 1 NANO = 1 Mnano = 10^30 raw

    var callbacks = []

    var root = {}

    root.updateRates = function (rates) {
      root.alternatives = []
      root.rates = rates
      lodash.each(rates, function (currency, code) {
        currency.isoCode = code
        root.alternatives.push({
          name: currency.name,
          isoCode: code,
          rate: currency.rate
        })
      })
      $rootScope.$broadcast('rates.loaded')
      // Run all callbacks
      lodash.each(callbacks, function (callback) {
        setTimeout(callback, 10)
      })
      callbacks = []
    }

    root.getAlternatives = function () {
      return root.alternatives
    }

    root.getRate = function (code) {
      if (root.isAvailable()) {
        return root.rates[code].rate
      } else {
        return 0
      }
    }

    root.isAvailable = function () {
      return !!root.rates
    }

    root.whenAvailable = function (callback) {
      if (root.isAvailable()) {
        setTimeout(callback, 10)
      } else {
        callbacks.push(callback)
      }
    }

    root.listAlternatives = function (sort) {
      if (!root.isAvailable()) {
        return []
      }

      var alternatives = lodash.map(root.alternatives, function (item) {
        return {
          name: item.name,
          isoCode: item.isoCode
        }
      })
      if (sort) {
        alternatives.sort(function (a, b) {
          return a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1
        })
      }
      return lodash.uniq(alternatives, 'isoCode')
    }

    return root
  })
