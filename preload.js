const electron = require("electron");
const ipcRenderer = electron.ipcRenderer;

var bannerboy = bannerboy || {};

console.log("PRELOAD SCRIPT");

window.fallback = function(callback) {
	callback();
	ipcRenderer.send("capture-screen");
};

setTimeout(function() {
	var rootTimeline = TimelineLite.exportRoot();
	rootTimeline.seek(rootTimeline.duration())
		.add(function() {
			ipcRenderer.send("capture-screen");
		});
}, 500);
