import crypto from 'crypto-js'
import { BaseConnector } from 'discipl-core-baseconnector'

class LocalMemoryConnector extends BaseConnector {
  constructor () {
    super()
    this.storeData = []
  }

  getName () {
    return 'memory'
  }

  async getSsidOfClaim (reference) {
    for (let pubkey in this.storeData) {
      if (Object.keys(this.storeData[pubkey]).includes(reference)) {
        return { 'pubkey': pubkey, 'privkey': null }
      }
    }
    return null
  }

  async getLatestClaim (ssid) {
    if (Object.keys(this.storeData).includes(ssid.pubkey) && (Object.keys(this.storeData[ssid.pubkey]).length > 1)) { return Object.keys(this.storeData[ssid.pubkey])[Object.keys(this.storeData[ssid.pubkey]).length - 1] }
    return null
  }

  async newSsid () {
    var pubkey = crypto.enc.Base64.stringify(crypto.lib.WordArray.random(64))
    this.storeData[pubkey] = []
    this.storeData[pubkey]['privkey'] = crypto.enc.Base64.stringify(crypto.lib.WordArray.random(64))
    return { 'pubkey': pubkey, 'privkey': this.storeData[pubkey]['privkey'] }
  }

  async claim (ssid, data) {
    if ((this.storeData[ssid.pubkey]) && (this.storeData[ssid.pubkey]['privkey'] === ssid.privkey)) {
      var index = crypto.enc.Base64.stringify(crypto.lib.WordArray.random(64))
      this.storeData[ssid.pubkey][index] = data
      return index
    }
    return null
  }

  async get (reference, ssid = null) {
    var s = await this.getSsidOfClaim(reference)
    if (s) {
      let data = this.storeData[s.pubkey][reference]
      let prevIndex = Object.keys(this.storeData[s.pubkey]).indexOf(reference) - 1
      let previous = null
      if (prevIndex > 0) {
        previous = Object.keys(this.storeData[s.pubkey])[prevIndex]
      }
      return { 'data': data, 'previous': previous }
    } else {
      return null
    }
  }

  async subscribe (ssid) {
    throw new TypeError('Subscribe is not implemented')
  }
}

export default LocalMemoryConnector
