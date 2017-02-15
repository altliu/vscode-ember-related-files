'use strict'
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode'
import { dirname, join, basename } from 'path'

function detectType(path): IType {

  let m

  m = path.match(/^app\/components\/(.+)\.js$/)
  if (m) {
    return {
      key: 'component-js',
      path,
      name: `${m[1]} JS`,
      part: m[1]
    }
  }

  m = path.match(/^app\/routes\/(.+)\.js$/)
  if (m) {
    return {
      key: 'route-js',
      path,
      name: `${m[1]} JS`,
      part: m[1]
    }
  }

  m = path.match(/^app\/controllers\/(.+)\.js$/)
  if (m) {
    return {
      key: 'controller-js',
      path,
      name: `${m[1]} JS`,
      part: m[1]
    }
  }

  m = path.match(/^app\/templates\/components\/(.+)\.hbs$/)
  if (m) {
    return {
      key: 'component-hbs',
      path,
      name: `${m[1]} HBS`,
      part: m[1]
    }
  }

  m = path.match(/^app\/templates\/(.+)\.hbs$/)
  if (m) {
    return {
      key: 'controller-hbs',
      path,
      name: `${m[1]} HBS`,
      part: m[1]
    }
  }
}

function getRelatedTypeKeys(type): string[] {
  switch (type.key) {

    case 'component-js':
      return [
        'component-hbs',
        'component-scss'
      ]

    case 'component-hbs':
      return [
        'component-js',
        'component-scss'
      ]

    case 'component-scss':
      return [
        'component-js',
        'component-hbs'
      ]

    case 'route-js':
      return [
        'controller-js',
        'controller-hbs'
      ]

    case 'controller-js':
      return [
        'controller-hbs',
        'route-js'
      ]

    case 'controller-hbs':
      return [
        'controller-js',
        'route-js'
      ]
  }

  return []
}

function getPath(sourceType, typeKey): string {

  let basePath
  let ext

  switch (typeKey) {
    case 'component-js':
      return `app/components/${sourceType.part}.js`

    case 'component-hbs':
      return `app/templates/components/${sourceType.part}.hbs`

    case 'component-scss':
      return `app/styles/components/${sourceType.part}.scss`

    case 'route-js':
      return `app/routes/${sourceType.part}.js`

    case 'controller-js':
      return `app/controllers/${sourceType.part}.js`

    case 'controller-hbs':
      return `app/templates/${sourceType.part}.hbs`
  }
}

interface IType {
  key: string,
  path: string,
  name: string,
  part: string
}

class TypeItem implements vscode.QuickPickItem {

  /**
   * A human readable string which is rendered prominent.
   */
  label: string

  /**
   * A human readable string which is rendered less prominent.
   */
  description: string

  /**
   * A human readable string which is rendered less prominent.
   */
  detail?: string

  constructor(sourceType: IType, typeKey: string) {
    this.label = typeKey
    this.description = getPath(sourceType, typeKey)
  }
}


// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

  let disposable = vscode.commands.registerCommand('extension.relatedFiles', () => {

    if (!vscode.window.activeTextEditor) {
      return
    }

    var relativeFileName = vscode.workspace.asRelativePath(vscode.window.activeTextEditor.document.fileName)

    const type = detectType(relativeFileName)

    const items = getRelatedTypeKeys(type).map((typeKey) => new TypeItem(type, typeKey))

    vscode.window.showQuickPick(items, { placeHolder: "Select File", matchOnDetail: true }).then((item) => {
      if (!item) return

      const fn = vscode.Uri.parse('file://' + join(vscode.workspace.rootPath, item.description))
      vscode.workspace.openTextDocument(fn).then(doc => {
        return vscode.window.showTextDocument(doc)
      })
    })
  })

  context.subscriptions.push(disposable)
}

export function deactivate() { }
