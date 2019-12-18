const {electron, app, BrowserWindow, ipcMain, dialog} = require('electron');
const path = require('path');
const url = require('url');
const walkdir = require('walkdir');
const fs = require('fs-extra');

let mainWindow, bannerWindow, settingsWindow, htmlDirectory, destinationDirectory, banners = [], fallbacks = [], saveInBanner, maxSize = 50, log = [];


function createWindow() {
	// Create main window
	mainWindow = new BrowserWindow({width: 320, height: 400});

	// and load the index.html of the app.
	mainWindow.loadURL(url.format({
		pathname: path.join(__dirname, 'index.html'),
		protocol: 'file:',
		slashes: true,
		resizable: false
	}));

	mainWindow.setResizable(false);

	// Emitted when the window is closed
	mainWindow.on('closed', () => {
		mainWindow = null;
	});

	ipcMain.on('load-project', (event, options) => {
		let path = '';
		let prevDirectory = options.prevDirectory || '';
		let directory = options.directory || '';
		if (!directory) {
			path = dialog.showOpenDialog({title: 'Select html directory', defaultPath: prevDirectory, properties: ['openDirectory', 'createDirectory']});
		} else {
			path = [directory];
		}
		if (path) loadProject(path[0]);
	});

	ipcMain.on('generate-fallbacks', (event, options) => {
		log = [];
		let _saveInBanner = options.saveInBanner || false;
		let _maxSize = options.maxSize || maxSize;
		let _prevDirectory = options.prevDirectory || '';

		// set destination directory
		let destPath = dialog.showOpenDialog({title: 'Select destination directory', defaultPath: _prevDirectory, properties: ['openDirectory', 'createDirectory']});
		if (!destPath) return;
		destinationDirectory = destPath[0];
		event.sender.send('destination-set', destinationDirectory);

		// if fallbacks should be saved within banner folders
		saveInBanner = _saveInBanner;

		maxSize = _maxSize;

		// empty banners array
		banners = [];

		// start walking through the directory and collect banners
		let emitter = walkdir(htmlDirectory);

		emitter.on('file', collectHTMLBanner);

		emitter.on('end', allBannersCollected);
	});

	ipcMain.on('capture-screen', (event) => {
		// trigger a redraw and listen for paint event
		event.sender.invalidate();
		event.sender.once('paint', onWebContentsPaint);
	});

	ipcMain.on('log', (event, arg) => {
		// add line to log
		log.push(arg);
	});

	ipcMain.on('timeout', (event) => {
		console.log('Banner timed out!');
		loadBanner();
	});
}

function loadProject(path) {
	htmlDirectory = path;
	mainWindow.webContents.send('project-loaded', htmlDirectory);
}

function onWebContentsPaint(event, dirty, nativeImage) {
	let browserWindow = BrowserWindow.fromWebContents(event.sender);
	let size = browserWindow.getSize();
	let name = browserWindow.bannerName;

	let image = nativeImage.resize({width: size[0] * .5, height: size[1] * .5});

	let jpg = saveToJPEG(image, 100);

	let dest = saveInBanner ? path.join(destinationDirectory, name) : destinationDirectory;
	let fallback = path.join(dest, `${name}.jpg`);

	// save fallback
	fs.outputFile(fallback, jpg, () => {
		fallbacks.push(fallback);

		// remove first element in banner array
		loadBanner();
	});
}

function saveToJPEG(image, quality) {
	let jpg = image.toJPEG(quality);
	if (jpg.byteLength / 1000 > maxSize) {
		return saveToJPEG(image, quality - 1);
	} else {
		return jpg;
	}
}

function collectHTMLBanner(filename) {
	if (filename.substr(filename.indexOf('.')) == '.html') {
		banners.push(filename);
	}
}

function allBannersCollected() {

	// create window to display banners in
	bannerWindow = new BrowserWindow({
		width: 100,
		height: 100,
		resizable: true,
		allowRunningInsecureContent: true,
		webPreferences: {
			offscreen: true,
			zoomFactor:2,
			preload: path.join(__dirname, 'preload.js')
		}
	});

	// when finished or interrupted, show any logs
	bannerWindow.webContents.on('destroyed', showLogs);

	loadBanner();
}

function loadBanner() {
	if (banners.length == 0) {
		finishedHandler();
		return;
	}

	let bannerPath = banners[0];
	let size = bannerPath.match(/[0-9]+x[0-9]+/g)[0].split('x').map(value => { return parseInt(value); });
	let parts = bannerPath.split('/');
	let name = parts[parts.length - 2]; // get the next last part of the path
	bannerWindow.bannerName = name;

	bannerWindow.setSize(size[0] * 2, size[1] * 2);

	// load banner
	bannerWindow.loadURL(url.format({
		pathname: bannerPath,
		protocol: 'file:',
		slashes: true
	}));

	// set globally accessible data
	global.shared = {
		bannerName: name
	};

	banners.shift();
}

function finishedHandler() {
	bannerWindow.destroy();
}

function showLogs() {
	if (log.length === 0) return;
	// create window to display banners in
	let logWindow = new BrowserWindow();
	logWindow.loadURL(url.format({
		pathname: path.join(__dirname, 'logs.html'),
		protocol: 'file:',
		slashes: true
	}));

	logWindow.webContents.on('did-finish-load', () => {
		logWindow.webContents.send('log', log);
	});
}

// ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// EVENT LISTENERS
// ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// app.commandLine.appendSwitch('high-dpi-support', 'true');
// app.commandLine.appendSwitch('force-device-scale-factor', '1');

app.on('ready', createWindow);
app.on('open-file', (e, path) => {
	loadProject(path);
});
app.on('window-all-closed', () => {
	app.quit();
});
