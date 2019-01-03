let vows = require('vows')
let assert = require('assert')
let rewire = require('rewire')
let LocalMemoryConnector = rewire('../index.js')
let connector = new LocalMemoryConnector()
var tmpSsid = null
var tmpReference = null
var tmpReference2 = null
let suite = vows.describe('discipl-core-memory').addBatch({
  'getName() ': {
    topic: 'memory',
    ' returns "memory"': function (topic) {
      assert.equal(connector.getName(), topic)
      tmpSsid = null
      tmpReference = null
    }
  } }).addBatch({
  'newSsid()': {
    topic: function () {
      vows = this
      connector.newSsid().then(function (res) {
        tmpSsid = res
        vows.callback(null, res)
      }).catch(function (err) {
        vows.callback(err, null)
      })
    },
    ' returns a proper ssid object with different large random strings as keys on a call to newSsid': function (err, ssid) {
      assert.equal(err, null)
      assert.equal(typeof ssid.pubkey, 'string')
      assert.equal(ssid.pubkey.length, 88)
      assert.equal(typeof ssid.privkey, 'string')
      assert.equal(ssid.privkey.length, 88)
      assert.notEqual(ssid.pubkey, ssid.privkey)
      assert.equal(tmpSsid, ssid)
    }
  } }).addBatch({
  'claim()': {
    topic: function () {
      vows = this
      connector.claim(tmpSsid, { 'need': 'beer' }).then(function (res) {
        tmpReference = res
        vows.callback(null, res)
      }).catch(function (err) {
        vows.callback(err, null)
      })
    },
    ' returns a reference to the claim': function (err, reference) {
      assert.equal(err, null)
      assert.equal(typeof reference, 'string', 'Not a string: ' + reference)
      assert.equal(reference.length, 88)
      assert.equal(tmpReference, reference)
    }
  } }).addBatch({
  'get()': {
    topic: function () {
      vows = this
      connector.get(tmpReference).then(function (res) {
        vows.callback(null, res)
      }).catch(function (err) {
        vows.callback(err, null)
      })
    },
    ' returns a result object with the data and a previous reference that equals null': function (err, res) {
      assert.equal(err, null)
      assert.equal(JSON.stringify(res.data), JSON.stringify({ 'need': 'beer' }))
      assert.equal(res.previous, null)
    }
  } }).addBatch({
  'claim() 2': {
    topic: function () {
      vows = this
      connector.claim(tmpSsid, { 'need': 'u' }).then(function (res) {
        tmpReference2 = res
        vows.callback(null, res)
      }).catch(function (err) {
        vows.callback(err, null)
      })
    },
    ' returns a reference to the claim': function (err, reference) {
      assert.equal(err, null)
      assert.equal(typeof reference, 'string', 'Not a string: ' + reference)
      assert.equal(reference.length, 88)
      assert.equal(tmpReference2, reference)
    }
  } }).addBatch({
  'get() 2': {
    topic: function () {
      vows = this
      connector.get(tmpReference2).then(function (res) {
        vows.callback(null, res)
      }).catch(function (err) {
        vows.callback(err, null)
      })
    },
    ' returns a result object with the data and a previous reference to the first claim': function (err, res) {
      assert.equal(err, null)
      assert.equal(JSON.stringify(res.data), JSON.stringify({ 'need': 'u' }))
      assert.equal(res.previous, tmpReference)
    }
  } }).addBatch({
  'getLatestClaim()': {
    topic: function () {
      vows = this
      connector.getLatestClaim(tmpSsid).then(function (res) {
        vows.callback(null, res)
      }).catch(function (err) {
        vows.callback(err, null)
      })
    },
    ' returns a reference to the second claim': function (err, res) {
      assert.equal(err, null)
      assert.equal(res, tmpReference2)
    }
  } }).addBatch({
  'verify() with same data as first claim made by an ssid given as arguments ': {
    topic: function () {
      vows = this
      connector.verify(tmpSsid, { 'need': 'beer' }).then(function (res) {
        vows.callback(null, res)
      }).catch(function (err) {
        vows.callback(err, null)
      })
    },
    ' returns the reference of this first claim': function (err, res) {
      assert.equal(err, null)
      assert.equal(res, tmpReference)
    }
  } }).addBatch({
  'verify() with same data as second claim made by an ssid given as arguments ': {
    topic: function () {
      vows = this
      connector.verify(tmpSsid, { 'need': 'u' }).then(function (res) {
        vows.callback(null, res)
      }).catch(function (err) {
        vows.callback(err, null)
      })
    },
    ' returns the reference to the second claim': function (err, res) {
      assert.equal(err, null)
      assert.equal(res, tmpReference2)
    }
  } }).addBatch({
  'verify() with give data, a given ssid has not claimed yet ': {
    topic: function () {
      vows = this
      connector.verify(tmpSsid, { 'need': 'food' }).then(function (res) {
        vows.callback(null, res)
      }).catch(function (err) {
        vows.callback(err, null)
      })
    },
    ' returns null': function (err, res) {
      assert.equal(err, null)
      assert.equal(res, null)
    }
  }
}).export(module)
