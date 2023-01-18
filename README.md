# Storybook Bit Addon

## What it does
For projects utilizing both Storybook and Bit, this addon brings Bit component data into Storybook. Using this addon will integrate the following information regarding a component, into Storybook:

* Available version tags
* Installation strings
* Source code
* Dependencies

## Limitations
* Change logs for components are not included since they are not available in the response provided by the api (https://node.bit.dev)
* This addon will not render different component versions in Storybook.

## Prerequisits
* @storybook/react project
* Components hosted with Bit (typically a scope on bit.cloud)
* A server to proxy api-calls towards https://node.bit.dev/<org>.<scope>

## How to implement this addon
Register the addon in .storybook/main.js:

```
module.exports = {
  ...
  "addons": [
    ...
    "@feux/storybook-addon-bit"
  ],
  ...
}
```

In your .storybook/preview.js, add a parameters variable if one does not exist already and add a bit paremeter to it, to be able to retrieve Bit component data via your server:

```
export const parameters = {
  ...
  bit: {
    apiUrl: "https://path.to.your.server/",
  }
  ...
}
```

Then in your stories add an object named parameters (if one does not exist already) to the storys' metadata object (the storys' default export) then add bit to parameters:

```
export default {
  ...
  parameters: {
    ...
    bit: {
      componentId: 'ui/button',
    },
    ...
  },
  ...
};
```
