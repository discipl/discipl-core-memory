let vows = require('vows')
let assert = require('assert')
let discipl = require('discipl-core')
let suite = vows.describe('discipl-core-memory').addBatch({
  'The Discipl Core Memory Connector ' : {
    topic : 'memory',
    ' can be loaded through the discipl core api ' : function (topic) {
      assert(discipl.getConnector(topic).getName(), topic)
    }
  }
}).export(module)
