'use strict'

const l = require('lodash')
const u = require('./util')

// occlusion constraints for two given edges
const createOcclusionConstraints = (settings) => (graph, edge1, edge2) => {
    // get source and target for both edges
    const e1SIndex = u.nodeIndex(graph, edge1.source)
    const e1S = graph.nodes[e1SIndex].metadata
    const e1TIndex = u.nodeIndex(graph, edge1.target)
    const e1T = graph.nodes[e1TIndex].metadata
    const e2SIndex = u.nodeIndex(graph, edge2.source)
    const e2S = graph.nodes[e2SIndex].metadata
    const e2TIndex = u.nodeIndex(graph, edge2.target)
    const e2T = graph.nodes[e2TIndex].metadata

    // check if edges are only seperated by one other edge
    const combinations = [
        [edge1.source, edge2.source],
        [edge1.source, edge2.target],
        [edge1.target, edge2.source],
        [edge1.target, edge2.target]
    ].map(c => JSON.stringify(c.sort()))
    const edgesAreClose = graph.edges.filter(e => combinations.includes(JSON.stringify([e.source, e.target].sort()))).length > 0

    // calculate distances in all 4 directions for both edges in the input (!) graph
    const directionDistances = {
        'west-east': [e1S.x - e2S.x, e1S.x - e2T.x, e1T.x - e2S.x, e1T.x - e2T.x],
        'south-north': [e1S.y - e2S.y, e1S.y - e2T.y, e1T.y - e2S.y, e1T.y - e2T.y],
        'southwest-northeast': [(e1S.x - e1S.y) - (e2S.x - e2S.y), (e1S.x - e1S.y) - (e2T.x - e2T.y), (e1T.x - e1T.y) - (e2S.x - e2S.y), (e1T.x - e1T.y) - (e2T.x - e2T.y)],
        'northwest-southeast': [(e1S.x + e1S.y) - (e2S.x + e2S.y), (e1S.x + e1S.y) - (e2T.x + e2T.y), (e1T.x + e1T.y) - (e2S.x + e2S.y), (e1T.x + e1T.y) - (e2T.x + e2T.y)]
    }

    // compare distances, check ordering of points in given direction
    const directionFacts = {}
    for (let direction of Object.keys(directionDistances)) {
        directionFacts[direction] = {
            positive: directionDistances[direction].filter(x => x > 0).length,
            closestIfSeparate: l.min(directionDistances[direction].map(n => Math.abs(n))),
        }
    }

    let preferredDirection
    // check if ordering in given direction is the same for all station pairs of edges and pick direction with longest distance if any fits those criteria
    let best = Object.keys(directionDistances).filter(d => directionFacts[d].positive === 4 || directionFacts[d].positive === 0)
    if (best.length > 0) [preferredDirection] = l.sortBy(best, b => (-1) * directionFacts[b].closestIfSeparate) // todo: else

    // todo: warn if no direction was found, explicitly exclude adjacent edges

    const constraints = []

    // if any suitable direction was found: set constraints for this direction
    if (preferredDirection) {
        // set minimum distance for both edges in the given direction
        // const minDist = ['southwest-northeast', 'northwest-southeast', 'west-east'].includes(preferredDirection) ? 1 : 1
        let minDist = 1
        // todo: fix parallel edges that are too close
        // if (!edgesAreClose) minDist = 1.25
        const endString = (directionFacts[preferredDirection].positive >= 3) ? `>= ${minDist}` : `<= -${minDist}`

        switch (preferredDirection) {
            case 'west-east': {
                constraints.push(`vx${e1SIndex} - vx${e2SIndex} ${endString}`)
                constraints.push(`vx${e1SIndex} - vx${e2TIndex} ${endString}`)
                constraints.push(`vx${e1TIndex} - vx${e2SIndex} ${endString}`)
                constraints.push(`vx${e1TIndex} - vx${e2TIndex} ${endString}`)
                break
            }
            case 'south-north': {
                constraints.push(`vy${e1SIndex} - vy${e2SIndex} ${endString}`)
                constraints.push(`vy${e1SIndex} - vy${e2TIndex} ${endString}`)
                constraints.push(`vy${e1TIndex} - vy${e2SIndex} ${endString}`)
                constraints.push(`vy${e1TIndex} - vy${e2TIndex} ${endString}`)
                break
            }
            case 'southwest-northeast': {
                constraints.push(`vx${e1SIndex} - vy${e1SIndex} - vx${e2SIndex} + vy${e2SIndex} ${endString}`)
                constraints.push(`vx${e1SIndex} - vy${e1SIndex} - vx${e2TIndex} + vy${e2TIndex} ${endString}`)
                constraints.push(`vx${e1TIndex} - vy${e1TIndex} - vx${e2SIndex} + vy${e2SIndex} ${endString}`)
                constraints.push(`vx${e1TIndex} - vy${e1TIndex} - vx${e2TIndex} + vy${e2TIndex} ${endString}`)
                break
            }
            case 'northwest-southeast': {
                constraints.push(`vx${e1SIndex} + vy${e1SIndex} - vx${e2SIndex} - vy${e2SIndex} ${endString}`)
                constraints.push(`vx${e1SIndex} + vy${e1SIndex} - vx${e2TIndex} - vy${e2TIndex} ${endString}`)
                constraints.push(`vx${e1TIndex} + vy${e1TIndex} - vx${e2SIndex} - vy${e2SIndex} ${endString}`)
                constraints.push(`vx${e1TIndex} + vy${e1TIndex} - vx${e2TIndex} - vy${e2TIndex} ${endString}`)
                break
            }
            default: throw new Error()
        }
    }

    return constraints
}

module.exports = createOcclusionConstraints
