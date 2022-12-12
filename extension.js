const vscode = require('vscode')
const fs = require('fs')
const download = require('download')

/**
 * @param {vscode.ExtensionContext} context
 */
async function activate(context) {
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
      if (gist && (gist.configID || gist.configRaw)) {
        if (gist.configID) {
          tipConfigGist()
          return
        }
        if (gist.configRaw) {
          vscode.window.withProgress(
            { location: vscode.ProgressLocation.Notification },
            async progress => {
              progress.report({ message: 'Downloading ...' })
              fs.writeFileSync(`${workspace}/.prettierrc`, await download(gist.configRaw))
              if (gist.ignoreRaw) {
                fs.writeFileSync(`${workspace}/.prettierignore`, await download(gist.ignoreRaw))
              }
            }
          )
        }
      } else {
        fs.writeFileSync(`${workspace}/.prettierrc`, defaultConfigFile)
        if (createIgnoreFile) fs.writeFileSync(`${workspace}/.prettierignore`, defaultIgnoreFile)
      }
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
    if (!fs.existsSync(`${workspace}/.prettierrc`)) {
      copyHandle()
      tip()
    } else
      vscode.window
        .showWarningMessage(
          'An .prettierrc file already exists in this workspace.',
          'Replace',
          'OK'
        )
        .then(value => {
          if (value === 'Replace') {
            copyHandle()
          }
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

        Issues: If you see this dialog many times, please switch to the other profile which installed this extension and replace 'configID' with 'configRaw'.
        
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
