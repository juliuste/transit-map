'use strict'

const l = require('lodash')

const createWrite = (stream) => (line) => stream.write(line + "\n")
const createWriteTab = (stream) => (line) => stream.write(" " + line + "\n")

const nodeIndex = (graph, nodeId) => l.findIndex(graph.nodes, n => n.id === nodeId)
const edgeIndex = (graph, edge) => l.findIndex(graph.edges, e => JSON.stringify([e.source, e.target]) === JSON.stringify([edge.source, edge.target]))
const degree = (graph, nodeId) => graph.edges.filter(e => [e.source, e.target].includes(nodeId)).length

module.exports = {
    createWrite,
    createWriteTab,

    nodeIndex,
    edgeIndex,
    degree
}
