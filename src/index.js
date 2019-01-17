import crypto from 'crypto-js'
import { BaseConnector } from 'discipl-core-baseconnector'
import { Subject } from 'rxjs'
import { filter } from 'rxjs/operators'

class LocalMemoryConnector extends BaseConnector {
  constructor () {
    super()
    this.storeData = {}
    this.claimSubject = new Subject()
  }

  getName () {
    return 'memory'
  }

  async getSsidOfClaim (reference) {
    for (let pubkey in this.storeData) {
      if (Object.keys(this.storeData[pubkey]['claims']).includes(reference)) {
        return { 'pubkey': pubkey, 'privkey': null }
      }
    }
    return null
  }

  async getLatestClaim (ssid) {
    if (this.storeData[ssid.pubkey]) {
      return this.storeData[ssid.pubkey]['lastClaim']
    }

    return null
  }

  async newSsid () {
    var pubkey = crypto.enc.Base64.stringify(crypto.lib.WordArray.random(64))
    this.storeData[pubkey] = {
      'claims': {},
      'lastClaim': null,
      'privkey': crypto.enc.Base64.stringify(crypto.lib.WordArray.random(64))
    }
    return { 'pubkey': pubkey, 'privkey': this.storeData[pubkey]['privkey'] }
  }

  async claim (ssid, data) {
    if ((this.storeData[ssid.pubkey]) && (this.storeData[ssid.pubkey]['privkey'] === ssid.privkey)) {
      let index = crypto.enc.Base64.stringify(crypto.lib.WordArray.random(64))
      this.storeData[ssid.pubkey]['claims'][index] = { 'data': data, 'previous': this.storeData[ssid.pubkey]['lastClaim'] }

      this.storeData[ssid.pubkey]['lastClaim'] = index
      this.claimSubject.next({ 'ssid': { 'pubkey': ssid.pubkey }, 'claim': this.storeData[ssid.pubkey]['claims'][index] })
      return index
    }
    return null
  }

  async get (reference, ssid = null) {
    var s = await this.getSsidOfClaim(reference)
    if (s) {
      return this.storeData[s.pubkey]['claims'][reference]
    } else {
      return null
    }
  }

  async subscribe (ssid, claimFilter) {
    return this.claimSubject.pipe(filter(claim => {
      if (claimFilter != null) {
        for (let predicate of Object.keys(claimFilter)) {
          if (claim['claim']['data'][predicate] == null) {
            // Predicate not present in claim
            return false
          }

          if (claimFilter[predicate] != null && claimFilter[predicate] !== claim['claim']['data'][predicate]) {
            // Object is provided in filter, but does not match with actual claim
            return false
          }
        }
      }

      return ssid == null || claim.ssid.pubkey === ssid.pubkey
    })
    )
  }
}

export default LocalMemoryConnector
