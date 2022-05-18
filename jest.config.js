module.exports = {
  preset: '@vue/cli-plugin-unit-jest',
  // Need to babel transpile the vuetify library or else get error for 'export'
  transformIgnorePatterns: ['/node_modules/(?!vuetify)']
  // testNamePattern: 'ABC:'
}
