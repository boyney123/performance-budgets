<div align="center">

<h2>lighthouse-budgets: keep an eye on request counts and file sizes</h2>

<p>
A simple Docker container that takes your budgets and a given url then checks to see if your website is below the your budgets. Easy to use and great for CI.
</p>

[![Travis](https://img.shields.io/travis/boyney123/lighthouse-budgets/master.svg)](https://travis-ci.org/boyney123/lighthouse-budgets)
[![CodeCov](https://codecov.io/gh/boyney123/lighthouse-budgets/branch/master/graph/badge.svg?token=AoXW3EFgMP)](https://codecov.io/gh/boyney123/lighthouse-budgets)
[![MIT License][license-badge]][license]
[![PRs Welcome][prs-badge]][prs]

  <hr />
<h3>Check budgets with one command...</h3>

```sh
docker run --rm boyney123/lighthouse-budgets https://example.com
```

  <p>Features: Set performance budgets, override lighthouse configuration, easily run on CI, and more... </p>

</div>

<hr/>

# The problem

Lighthouse now supports budgets. To use this feature you can run this easily within a browser. But there is no easy way to run this on CI without creating your own docker image.

# This solution

This tool was designed to help developers quickly run performance budgets against any given website. `lighthouse-budgets` allows to to focus on your code and the performance rather than the setup of the tools surrounding it.

## Getting Started with default config

_Make sure you have docker running_

```sh
docker run --rm boyney123/lighthouse-budgets {url}

#example
docker run --rm boyney123/lighthouse-budgets https://example.com
```

## Getting started with custom budgets or lighthouse configuration

You can mount your own configuration file into the container to override the budgets and lighthouse configuration if you wish too.

The easiest way to get started with an example is to follow these quick steps:

### Clone the Repo

```sh
git clone https://github.com/boyney123/lighthouse-budgets.git && cd lighthouse-budgets
```

```sh
# Run the container with a custom config file.
docker run --rm -v $(pwd)/example/config:/usr/src/lighthouse-budgets/src/config boyney123/lighthouse-budgets https://example.com
```

Change the `/example/config/lighthouse.json` file with the changes you want.

### Understanding the budgets

With lighthouse you can set two types of budgets. Request counts and request size.

#### Sizes

The `budget` values in the config are in `kb`.

```javascript
    ...
    "resourceSizes": [
      {
        // script budgets (e.g 300kb total script budget)
        "resourceType": "script",
        "budget": 300
      },
      {
         // image budgets (e.g 100kb total image budget)
        "resourceType": "image",
        "budget": 100
      },
      {
        // third-party scripts budgets (e.g 200kb total 3rd party budget)
        "resourceType": "third-party",
        "budget": 200
      },
      {
        // document size budget (e.g 200kb document size)
        "resourceType": "document",
        "budget": 200
      },
      {
        // stylesheet size budget (e.g 200kb stylesheet size)
        "resourceType": "stylesheet",
        "budget": 200
      },
      {
        // media size budget (e.g 200kb media size)
        "resourceType": "media",
        "budget": 200
      },
      {
        // font size budget (e.g 200kb font size)
        "resourceType": "font",
        "budget": 200
      },
      {
        // total budget of site (e.g 1000kb)
        "resourceType": "total",
        "budget": 1000
      }
    ]
  }
  ...
```

#### Counts

```javascript
    ...
    "resourceCounts": [
      {
        // total number of script requests
        "resourceType": "script",
        "budget": 10
      },
      {
         // total number of image requests
        "resourceType": "image",
        "budget": 2
      },
      {
        // total number of 3rd party requests
        "resourceType": "third-party",
        "budget": 5
      },
      {
        // total number of document requests
        "resourceType": "document",
        "budget": 1
      },
      {
        // total number of css requests
        "resourceType": "stylesheet",
        "budget": 3
      },
      {
        // total number of media requests
        "resourceType": "media",
        "budget": 3
      },
      {
        // total number of font requests
        "resourceType": "font",
        "budget": 6
      },
      {
        // total number of requests
        "resourceType": "total",
        "budget": 20
      }
    ]
  }
  ...
```

### Using as a GitHub Action

**TODO**

## Tools

- [lighthouse](https://github.com/GoogleChrome/lighthouse)
- [chrome-launcher](https://github.com/GoogleChrome/chrome-launcher)

### Testing

- [jest](https://jestjs.io/)

## Contributing

If you have any questions, features or issues please raise any issue or pull requests you like.

[spectrum-badge]: https://withspectrum.github.io/badge/badge.svg
[spectrum]: https://spectrum.chat/explore-tech
[license-badge]: https://img.shields.io/github/license/boyney123/lighthouse-budgets.svg?color=yellow
[license]: https://github.com/boyney123/react.explore-tech.org/blob/master/LICENSE
[prs-badge]: https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square
[prs]: http://makeapullrequest.com
[github-watch-badge]: https://img.shields.io/github/watchers/boyney123/lighthouse-budgets.svg?style=social
[github-watch]: https://github.com/boyney123/lighthouse-budgets/watchers
[twitter]: https://twitter.com/intent/tweet?text=Check%20out%20lighthouse-budgets%20by%20%40boyney123%20https%3A%2F%2Fgithub.com%2Fboyney123%2Flighthouse-budgets%20%F0%9F%91%8D
[twitter-badge]: https://img.shields.io/twitter/url/https/github.com/boyney123/lighthouse-budgets.svg?style=social
[github-star-badge]: https://img.shields.io/github/stars/boyney123/lighthouse-budgets.svg?style=social
[github-star]: https://github.com/boyney123/lighthouse-budgets/stargazers

# Donating

If you find this tool useful, feel free to buy me a ☕ 👍

[Buy a drink](https://www.paypal.me/boyney123/5)

# License

MIT.
