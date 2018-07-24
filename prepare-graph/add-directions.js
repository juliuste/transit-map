'use strict'

const l = require('lodash')
const closestNumber = require('closest-to')

const clone = x => JSON.parse(JSON.stringify(x))

// "fix" mod 8 for negative numbers close to 0
const mod8 = n => (n+16)%8

// 9 o'clock = 0/8, 6 o'clock = 2, 3 o'clock = 4, 12 o'clock = 6
const ang = vector => 4*((Math.atan2(vector.y,vector.x)/Math.PI)+1)

// find closest direction ids (0-7, see `ang`) for a given angle
const closestDirectionIds = angle => {
    const closestDirections = []
    let allDirections = l.range(-1, 10) // -1, 0, 1, …, 9

    for (let n of l.range(3)) { // find the 3 closest directions
        const closestDirection = closestNumber(angle, allDirections)
        closestDirections.push(mod8(closestDirection))
        allDirections = l.pull(allDirections, closestDirection)
    }

    return closestDirections
}

const addDirections = (planarGraph) => {
    const graph = clone(planarGraph)

    for (let edge of graph.edges) {
        const source = graph.nodes.find(n => n.id === edge.source).metadata
        const target = graph.nodes.find(n => n.id === edge.target).metadata

        const vector = {x: target.x - source.x, y: target.y - source.y}
        const angle = ang(vector)

        edge.sourceDirections = closestDirectionIds(angle)
        edge.targetDirections = edge.sourceDirections.map(d => mod8(d+4))
    }

    return graph
}

module.exports = addDirections
