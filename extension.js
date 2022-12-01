const vscode = require('vscode')
const fs = require('fs')
const download = require('download')

/**
 * @param {vscode.ExtensionContext} context
 */
async function activate(context) {
  //   // update
  //   function update() {
  //     // 创建和显示webview
  //     const panel = vscode.window.createWebviewPanel(
  //       'PrettierConfig',
  //       'PrettierConfig',
  //       vscode.ViewColumn.One,
  //       {}
  //     )
  //     // 设置HTML内容
  //     panel.webview.html = `<!DOCTYPE html>
  // <html lang="en">
  //   <head>
  //     <meta charset="UTF-8" />
  //     <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  //     <title>PrettierConfig for VS Code 1.1.0 NEW!</title>
  //   </head>
  //   <body>
  //     <h1>PrettierConfig for VS Code 1.1.0 NEW!</h1>
  //     <br />
  //     <h3>由于改用ajax请求的方式获取gist上的配置文件，现在配置项格式如下</h3>
  //     <h3>"configID": "88cdd14ce8d329da28fcaa94a0b5a57d"</h3>
  //     <img src="https://raw.githubusercontent.com/whosydd/images-in-one/main/20210719143245.PNG"/>
  //   </body>
  // </html>`
  //   }

  let prettier = vscode.commands.registerCommand('prettier-config', async function (folder) {
    // 获取配置项
    const flag = await vscode.workspace.getConfiguration('prettier-config').get('tip')
    const gist = await vscode.workspace.getConfiguration('prettier-config').get('gist')
    const createIgnoreFile = await vscode.workspace
      .getConfiguration('prettier-config')
      .get('ignore')
    let tool = await vscode.workspace.getConfiguration('prettier-config').get('tool')

    // 获取工作区路径
    let workspace
    if (folder && Object.keys(folder).length > 0) {
      // 使用菜单
      workspace = folder.fsPath
    } else {
      // 使用命令
      let rootPath = ''
      const tmp = vscode.workspace.workspaceFolders
      if (tmp === undefined) vscode.window.showErrorMessage('Please open a workspace!')
      // 如果工作区中存在的多个文件夹，显示选择框
      if (tmp.length > 1) {
        const pick = await vscode.window.showWorkspaceFolderPick()
        if (!pick) return
        rootPath = pick.uri.fsPath
      } else {
        const pick = tmp[0]
        rootPath = pick.uri.fsPath
      }
      workspace = rootPath
    }

    // default
    const defaultConfigFile = fs.readFileSync(`${__dirname}/template/.prettierrc`, 'utf-8')
    const defaultIgnoreFile = fs.readFileSync(`${__dirname}/template/.prettierignore`, 'utf-8')

    // handle
    async function copyHandle() {
      if (gist) {
        if (gist.configID) {
          tipConfigGist()
          return
        }
        if (gist.configRaw) {
          fs.writeFileSync(`${workspace}/.prettierrc`, await download(gist.configRaw))
        }
        if (gist.ignoreRaw) {
          fs.writeFileSync(`${workspace}/.prettierignore`, await download(gist.ignoreRaw))
        }
      } else {
        fs.writeFileSync(`${workspace}/.prettierrc`, defaultConfigFile)
        if (createIgnoreFile) fs.writeFileSync(`${workspace}/.prettierignore`, defaultIgnoreFile)
      }
      tip()
    }

    // tip
    function tip() {
      if (!flag) return
      vscode.window
        .showInformationMessage('Do you need to install prettier?', 'Install', 'Already Done')
        .then(answer => {
          if (answer === 'Install') {
            // 确定参数
            if (tool === '' || tool === undefined) {
              return
            }
            let param
            tool === 'npm' ? (param = 'i') : (param = 'add')
            let command = `${tool} ${param} -D prettier`

            // 安装依赖
            exec(command)
          }
        })
    }

    // 判断工作区是否存在配置文件
    if (!fs.existsSync(`${workspace}/.prettierrc`)) copyHandle()
    else
      vscode.window
        .showWarningMessage(
          'An .prettierrc file already exists in this workspace.',
          'Replace',
          'OK'
        )
        .then(value => {
          value === 'Replace' ? copyHandle() : null
        })
  })

  context.subscriptions.push(prettier)
}
function deactivate() {}

module.exports = {
  activate,
  deactivate,
}

// new config tip
const tipConfigGist = () => {
  vscode.window
    .showWarningMessage(
      'PrettierConfig for VS Code 1.4.0 NEW!',
      {
        modal: true,
        detail: `Sorry, now you need to use raw URL for gist.

        Issues: If you see this dialog many times, please switch to the other profile which installed this extension and back.
        
        For the details, please refer to the extension page.`,
      },
      'Global Settings',
      'Workspace Settings'
    )
    .then(value => {
      if (value === undefined) {
        return
      }
      if (value === 'Global Settings') {
        vscode.commands.executeCommand('workbench.action.openSettingsJson')
        vscode.workspace.getConfiguration('prettier-config').update('gist', { configRaw: '' }, true)
      }
      if (value === 'Workspace Settings') {
        vscode.commands.executeCommand('workbench.action.openWorkspaceSettingsFile')
        vscode.workspace
          .getConfiguration('prettier-config')
          .update('gist', { configRaw: '' }, false)
      }
    })
    .catch(err => vscode.window.showErrorMessage(err))
}

function exec(command) {
  try {
    const terminal = vscode.window.createTerminal({
      name: 'prettier',
    })
    terminal.show()
    terminal.sendText(command)
  } catch (err) {
    vscode.window.showErrorMessage(`请手动安装依赖！prettier`)
  }
}
