const electron = require("electron");
const ipcRenderer = electron.ipcRenderer;

// get element references
const loadProjectButton = document.querySelector("#btn-load-project");
const generateButton = document.querySelector("#btn-generate");
const destinationButton = document.querySelector("#btn-set-destination");
const projectPathText = document.querySelector("#project-path");
const destinationPathText = document.querySelector("#destination-path");
const saveInBanner = document.querySelector("#save-in-banner")
const maxSize = document.querySelector("#max-size")

loadProjectButton.onclick = () => {
	ipcRenderer.send("load-project", localStorage.getItem("htmlDirectory"));
};

destinationButton.onclick = () => {
	ipcRenderer.send("set-destination", localStorage.getItem("destinationDirectory"));
};

generateButton.onclick = () => {
	ipcRenderer.send("generate-fallbacks", saveInBanner.checked, parseInt(maxSize.value));
};

ipcRenderer.on("project-loaded", (event, arg) => {
	window.localStorage.setItem("htmlDirectory", arg);
	destinationButton.style.display = "block";
	projectPathText.innerHTML = `Project path: ${arg}`;
});

ipcRenderer.on("destination-set", (event, arg) => {
	window.localStorage.setItem("destinationDirectory", arg);
	generateButton.style.display = "block";
	destinationPathText.innerHTML = `Destination path: ${arg}`;
});
