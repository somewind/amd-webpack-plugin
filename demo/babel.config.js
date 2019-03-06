module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        // 构建浏览器目标版本支持，将自动读取根目录 package.json 中的 browserslist
        useBuiltIns: 'entry'
      }
    ]
  ],
  plugins: [
    '@babel/plugin-syntax-dynamic-import'
  ]
}
