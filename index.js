const CryptoJS = require('crypto-js');
const BaseConnector = require('discipl-core/connectors/base-connector.js')

module.exports = class LocalMemoryConnector extends BaseConnector {

  constructor() {
    super()
    this.storeData = []
  }

  getName() {
    return "mem"
  }

  async getSsidOfClaim(reference) {
    return new Promise(function(resolve, reject) {
      for(pubkey in this.storeData) {
        if(Object.keys(this.storeData[pubkey]).contains(reference)) {
          resolve({'pubkey':pubkey, 'privkey':null})
        }
      }
      reject(Error("Claim not found."))
    });
  }

  async newSsid() {
    var pubkey = CryptoJS.enc.Base64.stringify(CryptoJS.lib.WordArray.random(64));
    this.storeData[pubkey] = new Array()
    this.storeData[pubkey]['privkey'] = CryptoJS.enc.Base64.stringify(CryptoJS.lib.WordArray.random(64));
    return {'pubkey':pubkey, 'privkey':this.storeData[pubkey]['privkey']}
  }

  async claim(ssid, data) {
    if((this.storeData[ssid.pubkey]) && (this.storeData[ssid.pubkey]['privkey']==ssid.privkey)) {
      var index = CryptoJS.enc.Base64.stringify(CryptoJS.lib.WordArray.random(64));
      this.storeData[ssid.pubkey][index] = data;
      return index;
    }
    return null;
  }

  async get(reference, ssid = null) {
    var s = getSsidOfClaim(reference)
    if(s) {
      return this.storeData[s.pubkey][reference]
    }
    else {
      return null
    }
  }

  async subscribe(ssid) {
    return null
  }

}
