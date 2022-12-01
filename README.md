# PrettierConfig for VS Code

## Dependencies

- prettier

## ExtensionDependencies

- [prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

## Usage

![](https://raw.githubusercontent.com/whosydd/images-in-one/main/20210704000715.gif)

![prettier 72](https://raw.githubusercontent.com/whosydd/images-in-one/main/20210712140259.png)

## Configuration

### package manager

```json
// settings.json:
"prettier-config.tool": "npm" // support 'npm' 'yarn' 'pnpm'
```

### Sync from gist

```json
// settings.json:
"prettier-config.gist": {
    "configRaw": "https://gist.githubusercontent.com/whosydd/3d7554d6818b0f9c9a2ec8e928857211/raw/423e50984d1060403822e5a62c56d5bb45511a00/.prettierrc",
    // If you want to generate a .prettierignore file
    // "ignoreRaw": ""
},
```

### tip

```json
// settings.json:
"prettier-config.tip": true //default
```

![Capture](https://raw.githubusercontent.com/whosydd/images-in-one/main/20210711234457.PNG)

### default

#### .prettierrc

```yaml
printWidth: 100, # 代码宽度建议不超过100字符
tabWidth: 2, # tab缩进2个空格
semi: false, # 末尾分号
singleQuote: true, # 单引号
jsxSingleQuote: true, # jsx中使用单引号
trailingComma: 'es5', # 尾随逗号
arrowParens: 'avoid', # 箭头函数仅在必要时使用()
htmlWhitespaceSensitivity: 'css', # html空格敏感度
```

#### .prettierignore

```
**/*.min.js
**/*.min.css

.idea/
node_modules/
dist/
build/
```
