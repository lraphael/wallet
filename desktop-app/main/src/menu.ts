import { BrowserWindow, Menu, MenuItemConstructorOptions, shell, app } from 'electron'

interface DarwinMenuItemConstructorOptions extends MenuItemConstructorOptions {
  selector?: string
  submenu?: DarwinMenuItemConstructorOptions[] | Menu
}

export default class MenuBuilder {
  mainWindow: BrowserWindow

  constructor (mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow
  }

  buildMenu (): Menu {
    const template = this.buildDefaultTemplate()

    const menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)

    return menu
  }

  buildDefaultTemplate (): MenuItemConstructorOptions[] {
    const subMenuHelp: DarwinMenuItemConstructorOptions = {
      label: 'Help',
      submenu: [
        {
          label: 'Submit an issue/feature',
          click: async () => {
            await shell.openExternal('https://github.com/DeFiCh/wallet/issues')
          }
        }
      ]
    }

    const subMenuAbout: DarwinMenuItemConstructorOptions = {
      label: 'About',
      submenu: [
        {
          label: 'Visit our site',
          click: async () => {
            await shell.openExternal('https://defichain.com')
          }
        },
        {
          label: 'Apple App Store',
          click: async () => {
            await shell.openExternal('https://apps.apple.com/us/app/defichain-wallet/id1572472820')
          }
        },
        {
          label: 'Google Play Store',
          click: async () => {
            await shell.openExternal('https://play.google.com/store/apps/details?id=com.defichain.app')
          }
        },
        { type: 'separator' },
        { label: 'Quit', accelerator: 'Command+Q', click: function () { app.quit() } }
      ]
    }

    const subMenuEdit: DarwinMenuItemConstructorOptions = {
      label: 'Edit',
      submenu: [
        { label: 'Cut', accelerator: 'CmdOrCtrl+X', selector: 'cut:' },
        { label: 'Copy', accelerator: 'CmdOrCtrl+C', selector: 'copy:' },
        { label: 'Paste', accelerator: 'CmdOrCtrl+V', selector: 'paste:' }
      ]
    }
    return [subMenuAbout, subMenuEdit, subMenuHelp]
  }
}
