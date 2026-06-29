const { app, BrowserWindow } = require("electron");
const { spawn } = require("child_process");
const path = require("path");

let backendProcess;

app.whenReady().then(() => {
  backendProcess = spawn(
    process.execPath,
    [path.join(__dirname, "backend/index.js")],
    {
      env: { ...process.env, PORT: "3001", ELECTRON_RUN_AS_NODE: "1" },
      cwd: path.join(__dirname, "backend")
    }
  );

  backendProcess.stdout.on("data", (d) => console.log(d.toString()));
  backendProcess.stderr.on("data", (d) => console.error(d.toString()));

  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    icon: path.join(__dirname, "frontend/public/Logo.png"),
    webPreferences: { nodeIntegration: false }
  });

  win.setMenuBarVisibility(false);

  setTimeout(() => {
    win.loadURL("http://localhost:3001");
  }, 3000);
});

app.on("will-quit", () => {
  if (backendProcess) backendProcess.kill();
});

app.on("window-all-closed", () => {
  if (backendProcess) backendProcess.kill();
  app.quit();
});
