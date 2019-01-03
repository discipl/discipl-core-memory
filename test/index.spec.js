/* eslint-env mocha */
/* eslint-disable no-unused-expressions */

import { expect } from 'chai'
import MemoryConnector from '../src/index'

describe('disciple-memory-connector', () => {
  it('should present a name', async () => {
    let memoryConnector = new MemoryConnector()
    expect(memoryConnector.getName()).to.equal('memory')
  })

  it('should be able to generate a new ssid', async () => {
    let memoryConnector = new MemoryConnector()
    let ssid = await memoryConnector.newSsid()

    expect(ssid.pubkey).to.be.a('string')
    expect(ssid.pubkey.length).to.equal(88)
    expect(ssid.privkey).to.be.a('string')
    expect(ssid.privkey.length).to.equal(88)
    expect(ssid.pubkey).to.not.equal(ssid.privkey)
  })

  it('should be able to create a claim', async () => {
    let memoryConnector = new MemoryConnector()
    let ssid = await memoryConnector.newSsid()
    let reference = await memoryConnector.claim(ssid, { 'need': 'beer' })

    expect(reference).to.be.a('string')
    expect(reference.length).to.equal(88)

    let claim = await memoryConnector.get(reference)
    expect(claim).to.deep.equal({ data: { 'need': 'beer' }, previous: null })
  })

  it('should be able to create a claim with reference to a previous one', async () => {
    let memoryConnector = new MemoryConnector()
    let ssid = await memoryConnector.newSsid()
    let reference = await memoryConnector.claim(ssid, { 'need': 'beer' })
    let reference2 = await memoryConnector.claim(ssid, { 'need': 'wine' })


    let claim = await memoryConnector.get(reference2)
    expect(claim).to.deep.equal({ data: { 'need': 'wine' }, previous: reference })
  })
})
