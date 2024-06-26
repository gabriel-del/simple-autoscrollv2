import antfu from '@antfu/eslint-config'

export default antfu(
  {rules:
    {
      'ts/consistent-type-imports': 'off', // change to on later
      'no-console': 'off',
      'ts/space-infix-ops': 'off',
      'style/object-curly-spacing': ['error', 'never'],
      'style/max-statements-per-line': ['error', {max: 6}],
      'style/jsx-one-expression-per-line': ['error', {allow: 'single-line'}],
      'style/brace-style': ['error', '1tbs', {allowSingleLine: true}],
      'arrow-parens': ['error', 'as-needed'],
      'antfu/if-newline': 0,
      'style/block-spacing': ['error', 'never'],
      'style/arrow-parens': ['error', 'as-needed'],
      'promise/param-names': 'off',
      'no-new': 0,
      'no-eval': ['warn', {allowIndirect: true}],
      'style/lines-between-class-members': ['error', 'never'],
      'style/indent': ['error', 2],
      'style/comma-dangle': ['error', 'never']
    }
  },
  {
    ignores: [
      '**/assets',
      '**/assets/**'
    ]
  }
)
