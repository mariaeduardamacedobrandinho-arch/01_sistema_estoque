const { app, BrowserWindow } = require('electron');
const path = require('node:path');
const { fileURLToPath } = require('node:url');
const { registrarHandlers } = require('./ipc/handlers');
const { fecharPool } = require('./db/conexao');
const { obterSessao } = require('./auth/sessao');

const paginasPermitidas = new Set([
  'index.html', 'sistema.html', 'produtos.html',
  'categorias.html', 'movimentacoes.html', 'relatorios.html'
]);

let janelaPrincipal;

function criarJanela() {
  janelaPrincipal = new BrowserWindow({
    width: 1200,
    height: 780,
    minWidth: 850,
    minHeight: 600,
    autoHideMenuBar: true,
    backgroundColor: '#edf3f9',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true
    }
  });

  janelaPrincipal.webContents.setWindowOpenHandler(
    () => ({ action: 'deny' })
  );

  janelaPrincipal.webContents.on(
    'will-navigate',
    (evento, url) => {
      try {
        const arquivo = fileURLToPath(url);
        const nome = path.basename(arquivo);
        const permitido = path.dirname(arquivo) === __dirname && paginasPermitidas.has(nome);
        const sessao = obterSessao();
        const autenticado = Boolean(sessao);
        const admin = nome !== 'relatorios.html' || (autenticado && sessao.nivel === 1);

        if (permitido && (nome === 'index.html' || (autenticado && admin))) {
          return;
        }
      } catch {
        // Bloqueia endereço que não é arquivo autorizado.
      }

      evento.preventDefault();
    }
  );

  janelaPrincipal.loadFile(
    path.join(__dirname, 'index.html')
  );
}

app.commandLine.appendSwitch('disable-gpu-shader-disk-cache');
app.commandLine.appendSwitch('disable-http-cache');

app.whenReady().then(() => {
  registrarHandlers(() => janelaPrincipal);
  criarJanela();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      criarJanela();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  void fecharPool();
});
