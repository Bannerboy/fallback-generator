const {electron, app, BrowserWindow, ipcMain, dialog} = require("electron");
const path = require("path");
const url = require("url");
const walkdir = require("walkdir");
const fs = require("fs-extra");

let mainWindow, htmlDirectory, destinationDirectory, banners = [], fallbacks = [], saveInBanner;


function createWindow() {
	// Create main window
	mainWindow = new BrowserWindow({width: 800, height: 600});

	// and load the index.html of the app.
	mainWindow.loadURL(url.format({
		pathname: path.join(__dirname, 'index.html'),
		protocol: 'file:',
		slashes: true
	}));

	// Emitted when the window is closed
	mainWindow.on('closed', () => {
		mainWindow = null;
	});

	ipcMain.on("load-project", (event, prevDirectory = "") => {
		htmlDirectory = dialog.showOpenDialog({title: 'Select html directory', defaultPath: prevDirectory, properties: ['openDirectory']})[0];

		// tell renderer that project is selected
		event.sender.send("project-loaded", htmlDirectory);
	});

	ipcMain.on("set-destination", (event, prevDirectory = "") => {
		destinationDirectory = dialog.showOpenDialog({title: 'Select destination directory', defaultPath: prevDirectory, properties: ['openDirectory']})[0];

		// tell renderer that destination is selected
		event.sender.send("destination-set", destinationDirectory);
	});

	ipcMain.on("generate-fallbacks", (event, arg) => {

		// if fallbacks should be saved within banner folders
		saveInBanner = arg;

		// empty banners array
		banners = [];

		// start walking through the directory and collect banners
		let emitter = walkdir(htmlDirectory);

		emitter.on("file", collectHTMLBanner);

		emitter.on("end", allBannersCollected);
	});

	ipcMain.on("capture-screen", (event) => {
		event.sender.once("paint", onWebContentsPaint);
	});
}

function onWebContentsPaint(event, dirty, nativeImage) {
	let browserWindow = BrowserWindow.fromWebContents(event.sender);
	let size = browserWindow.getSize();
	let name = browserWindow.bannerName;

	let image = nativeImage.resize({width: size[0], height: size[1]});
	let jpg = image.toJPEG(100);

	let dest = saveInBanner ? path.join(destinationDirectory, name) : destinationDirectory;
	let fallback = path.join(dest, `${name}.jpg`);

	// save fallback
	fs.outputFile(fallback, jpg, () => {
		fallbacks.push(fallback);
		browserWindow.destroy();
	});
}

function collectHTMLBanner(filename) {
	if (filename.substr(filename.indexOf(".")) == ".html") {
		banners.push(filename);
	}
}

function allBannersCollected() {

	// create a window for each banner
	banners.forEach(bannerPath => {
		let size = bannerPath.match(/[0-9]+x[0-9]+/g)[0].split("x").map(value => { return parseInt(value); });
		let parts = bannerPath.split("/");
		let name = parts[parts.length - 2]; // get the next last part of the path
		let win = new BrowserWindow({
			width: size[0],
			height: size[1],
			resizable: true,
			zoomFactor: 1,
			allowRunningInsecureContent: true,
			webPreferences: {
				offscreen: true,
				preload: path.join(__dirname, "preload.js")
			}
		});

		// save bannername on browserwindow for easy reference later
		win.bannerName = name;

		// load banner
		win.loadURL(url.format({
			pathname: bannerPath,
			protocol: "file:",
			slashes: true
		}));
	});
}

// ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// EVENT LISTENERS
// ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
app.on("ready", createWindow);
app.on("window-all-closed", () => {
	app.quit();
});
