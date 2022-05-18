module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: ['plugin:vue/essential', 'plugin:prettier/recommended', 'eslint:recommended'],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    semi: [2, 'never'],
    'comma-dangle': 'off',
    indent: [2, 2, { SwitchCase: 1 }],
    'quote-props': 'off',
    'func-names': 'off',
    'max-len': 'off',
    'object-curly-spacing': 'off',
    'object-curly-newline': 'off',
    'import/extensions': 'off',
    'no-underscore-dangle': 'off',
    'prefer-promise-reject-errors': 'off',
    'arrow-parens': 'off',
    'object-shorthand': 'off',
    'no-plusplus': 'off',
    'no-param-reassign': 'off',
    'no-mixed-operators': 'off',
    'prefer-destructuring': 'off',
    'no-lonely-if': 'off',
    'vue/multi-word-component-names': 'off',
    'vue/script-indent': 'off',
    'operator-linebreak': ['error', 'after'],
    'vuejs-accessibility/label-has-for': 'off',
    'vue/valid-v-slot': 'off',
    'vuejs-accessibility/no-autofocus': 'off'
  },
  overrides: [
    {
      files: ['**/__tests__/*.{j,t}s?(x)', '**/tests/unit/**/*.spec.{j,t}s?(x)'],
      env: {
        jest: true
      }
    },
    {
      files: ['*.vue'],
      rules: {
        indent: 'off'
      }
    }
  ]
}
