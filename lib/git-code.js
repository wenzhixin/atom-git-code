'use babel'

import { CompositeDisposable } from 'atom'
import path from 'path'
import shelljs from 'shelljs'
import { shell } from 'electron'

shelljs.config.execPath = shelljs.which('node').stdout

export default {

  subscriptions: null,

  activate (state) {
    this.subscriptions = new CompositeDisposable()

    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'git-code:source': () => this.source(),
      'git-code:blame': () => this.blame(),
      'git-code:history': () => this.history()
    }))
  },

  deactivate () {
    this.subscriptions.dispose()
  },

  getUrl (type) {
    let editor = atom.workspace.getActiveTextEditor()
    if (!editor) {
      return
    }

    const file = editor.getPath()
    const dir = path.dirname(file)
    if (!file || !dir) {
      return
    }

    shelljs.cd(dir)

    const cdup = shelljs.exec('git rev-parse --show-cdup', {
      silent: true
    }).stdout.replace(/\n/g, '') || './'
    shelljs.cd(cdup)

    const config = {}
    shelljs.cat('~/.git-code').stdout.split('\n').forEach(line => {
      if (line.indexOf('=') === -1) {
        return
      }
      config[line.split('=')[0].trim()] = line.split('=')[1].trim()
    })

    const origin = shelljs.exec('git config --get remote.origin.url', {
      silent: true
    }).stdout.replace(/\n/g, '').replace(/.git$/, '')
    if (!origin) {
      return
    }

    const alias = origin.split(':')[0]
    const repo = origin.split(':')[1]
    if (!config[alias]) {
      return
    }

    let url = config[alias]
    if (!/\/$/.test(url)) {
      url += '/'
    }

    const branches = shelljs.exec('git branch', {
      silent: true
    }).stdout.split('\n').map(it => it.replace(/^\*/, '').trim())

    let branch = branches[0]
    for (let b of ['develop', 'master']) {
      if (branches.indexOf(b) > -1) {
        branch = b
        break
      }
    }

    const filename = file.replace(shelljs.pwd().stdout, '')
    const line = (editor.getCursorBufferPosition().row + 1) || 1

    return [url, repo, '/', type, '/', branch, filename, '#L', line].join('')
  },

  source () {
    shell.openExternal(this.getUrl('blob'))
  },

  blame () {
    shell.openExternal(this.getUrl('blame'))
  },

  history () {
    shell.openExternal(this.getUrl('commits'))
  }

}
