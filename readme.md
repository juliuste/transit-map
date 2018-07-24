# transit-map

Generate a schematic map (“metro map”) for a given (transit) network graph using a Mixed Integer Programming approach. Part of the [*Generating Transit Maps*](https://github.com/public-transport/generating-transit-maps) project.

**Work in progress, DO NOT USE THIS IN PRODUCTION!**

[![npm version](https://img.shields.io/npm/v/transit-map.svg)](https://www.npmjs.com/package/transit-map)
[![Greenkeeper badge](https://badges.greenkeeper.io/juliuste/transit-map.svg)](https://greenkeeper.io/)
[![dependency status](https://img.shields.io/david/juliuste/transit-map.svg)](https://david-dm.org/juliuste/transit-map)
[![license](https://img.shields.io/github/license/juliuste/transit-map.svg?style=flat)](license)
[![chat on gitter](https://badges.gitter.im/juliuste.svg)](https://gitter.im/juliuste)

## Installation & Requirements

**Sadly, for now, you need a valid copy of the commercial [Gurobi](https://www.gurobi.com/) solver (free academic licenses) in order to run this project. In the near future however, this project will hopefully also support the open `CBC` solver. Stay tuned.**

What you need:

- [`node.js`](http://nodejs.org/) 8.0 or higher installed
- [`gurobi_cl`] 7.5 or higher in your `$PATH`

Then, to install the package (for CLI usage), simply run:

```sh
npm install -g transit-map
```

## Usage

### CLI

You need a JSON graph representation of your transit network that looks like [this example](examples/bvg.input.json) for the Berlin Metro (U-Bahn). You can then generate a transit map for the given graph by running

```sh
cat graph.json | transit-map > output.svg
```

For further information on several CLI options/params, run:

```sh
transit-map --help
```

### As a library

The module can be used as a JS library, documentation for this will follow.

## Examples

### BVG (Berlin Metro / U-Bahn)

![BVG metro map](examples/bvg.output.svg)

using [this](examples/bvg.input.json) input graph. Running time ≈40sec.

### Wiener Linien (Vienna Metro / U-Bahn)

![Vienna metro map](examples/wien.output.svg)

using [this](examples/wien.input.json) input graph. Running time ≈20sec.

## Contributing

If you found a bug or want to propose a feature, feel free to visit [the issues page](https://github.com/juliuste/transit-map/issues).
