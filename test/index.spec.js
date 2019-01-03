/* eslint-env mocha */
/* eslint-disable no-unused-expressions */

import { expect } from 'chai'
import MemoryConnector from '../src/index'

describe('disciple-memory-connector', () => {
  it('should present a name', async () => {
    let memoryConnector = new MemoryConnector()
    expect(memoryConnector.getName()).to.equal('memory')
  })
})
