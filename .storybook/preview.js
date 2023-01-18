export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  bit: {
    apiUrl: "https://sjdesignsystembff.azurewebsites.net/",
  }
}