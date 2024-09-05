module.exports = {
  parserOptions: {
    ecmaVersion: 'latest', // 使用最新的 ECMAScript 版本
    sourceType: 'module' // 使用模块化的文件结构
  },
  env: {
    browser: true, // 启用浏览器环境
    es2021: true, // 使用 ES2021 版本的特性
    commonjs: true // 启用 CommonJS 模块规范
  },
  // 使用 '@typescript-eslint/parser' 作为解析器，用于解析 TypeScript 代码
  parser: '@typescript-eslint/parser',
  extends: [
    // 使用 ESLint 推荐的基本规则
    'eslint:recommended',
    // 使用 react 插件推荐的规则
    'plugin:react/recommended',
    // 使用 @typescript-eslint 插件推荐的规则
    'plugin:@typescript-eslint/recommended',
    // 该依赖是一个eslint插件，功能是关闭了eslint中与prettier有冲突的rules
    'plugins:prettier/recommended'
  ],
  plugins: ['react', 'prettier'],
  rules: {
    'no-unused-expressions': 'off',
    '@typescript-eslint/no-unused-expressions': 'off',
    // 强制使用单引号
    quotes: ['error', 'single'],
    'react/react-in-jsx-scope': 'off',
    'no-unused-vars': 'off',
    'prettier/prettier': ['error']
  }
}
