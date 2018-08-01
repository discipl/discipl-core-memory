const CryptoJS = require('crypto-js');
const BaseConnector = require('discipl-core/connectors/base-connector.js')

module.exports = class LocalMemoryConnector extends BaseConnector {

  constructor() {
    super()
    this.storeData = []
  }

  getName() {
    return "memory"
  }

  async getSsidOfClaim(reference) {
      for(let pubkey in this.storeData) {
        if(Object.keys(this.storeData[pubkey]).includes(reference)) {
          return {'pubkey':pubkey, 'privkey':null}
        }
      }
      return null
  }

  async getLatestClaim(ssid) {
    if(Object.keys(this.storeData).includes(ssid.pubkey) && (Object.keys(this.storeData[ssid.pubkey]).length>1))
      return Object.keys(this.storeData[ssid.pubkey])[Object.keys(this.storeData[ssid.pubkey]).length-1]
    return null
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
    var s = await this.getSsidOfClaim(reference)
    if(s) {
      let data = this.storeData[s.pubkey][reference]
      let prevIndex = Object.keys(this.storeData[s.pubkey]).indexOf(reference) - 1
      let previous = null
      if(prevIndex > 0) {
        previous = Object.keys(this.storeData[s.pubkey])[prevIndex]
      }
      return {'data':this.storeData[s.pubkey][reference], 'previous':previous}
    }
    else {
        return null
    }
  }

  async subscribe(ssid) {
    return null
  }

}
