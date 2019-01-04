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

  it('should be able to create a claim with a non-existent ssid', async () => {
    let memoryConnector = new MemoryConnector()
    let ssid = await memoryConnector.newSsid()
    ssid.privkey = ''.padStart(88, 'a')
    let reference = await memoryConnector.claim(ssid, { 'need': 'beer' })

    expect(reference).to.equal(null)
  })

  it('should not be able to find a non-existent claim', async () => {
    let memoryConnector = new MemoryConnector()
    let ssid = await memoryConnector.newSsid()
    let reference = await memoryConnector.claim(ssid, { 'need': 'beer' })

    let claim = await memoryConnector.get(reference + 'addingsomethingtomakeidnotexist')
    expect(claim).to.equal(null)
  })

  it('should be able to create a claim with reference to a previous one', async () => {
    let memoryConnector = new MemoryConnector()
    let ssid = await memoryConnector.newSsid()
    let reference = await memoryConnector.claim(ssid, { 'need': 'beer' })
    let reference2 = await memoryConnector.claim(ssid, { 'need': 'wine' })

    let claim = await memoryConnector.get(reference2)
    expect(claim).to.deep.equal({ data: { 'need': 'wine' }, previous: reference })
  })

  it('should be able to find a created claim if its the latest', async () => {
    let memoryConnector = new MemoryConnector()
    let ssid = await memoryConnector.newSsid()
    await memoryConnector.claim(ssid, { 'need': 'beer' })
    let reference2 = await memoryConnector.claim(ssid, { 'need': 'wine' })

    let latestClaimReference = await memoryConnector.getLatestClaim(ssid)

    expect(latestClaimReference).to.equal(reference2)
  })

  it('should not be able to find the latest claim for a non-existent ssid', async () => {
    let memoryConnector = new MemoryConnector()
    let ssid = await memoryConnector.newSsid()
    await memoryConnector.claim(ssid, { 'need': 'beer' })
    let reference2 = await memoryConnector.claim(ssid, { 'need': 'wine' })

    ssid.pubkey = ''.padStart('a', 88)

    let latestClaimReference = await memoryConnector.getLatestClaim(ssid)

    expect(latestClaimReference).to.equal(null)
  })

  it('should be able to verify the first claim', async () => {
    let memoryConnector = new MemoryConnector()
    let ssid = await memoryConnector.newSsid()
    let reference = await memoryConnector.claim(ssid, { 'need': 'beer' })
    await memoryConnector.claim(ssid, { 'need': 'wine' })

    let verification = await memoryConnector.verify(ssid, { 'need': 'beer' })

    expect(verification).to.equal(reference)
  })

  it('should be able to verify the second claim', async () => {
    let memoryConnector = new MemoryConnector()
    let ssid = await memoryConnector.newSsid()
    await memoryConnector.claim(ssid, { 'need': 'beer' })
    let reference2 = await memoryConnector.claim(ssid, { 'need': 'wine' })

    let verification = await memoryConnector.verify(ssid, { 'need': 'wine' })

    expect(verification).to.equal(reference2)
  })

  it('should not be able to verify a non-existent claim', async () => {
    let memoryConnector = new MemoryConnector()
    let ssid = await memoryConnector.newSsid()
    await memoryConnector.claim(ssid, { 'need': 'beer' })
    await memoryConnector.claim(ssid, { 'need': 'wine' })

    let verification = await memoryConnector.verify(ssid, { 'need': 'a hole in the head' })

    expect(verification).to.equal(null)
  })

  it('should not support subscribe', () => {
    let memoryConnector = new MemoryConnector()
    return memoryConnector.subscribe(null)
      .then((result) => expect.fail('Should not have succeeded'))
      .catch((error) => {
        expect(error).to.be.an('error')
        expect(error.message).to.equal('Subscribe is not implemented')
      })
  })
})
