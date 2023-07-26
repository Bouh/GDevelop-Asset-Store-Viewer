import { handleFilenameClick } from "./loadingFiles.js";
import { requestPermissionAndRename } from "./fileUtils.js";

/**
 * Checks the file name for underscores and updates the border style of the element accordingly.
 * @param {string} fileName - The file name to check.
 * @param {HTMLElement} element - The HTML element whose border style needs to be updated.
 */
function checkAndUpdateStyles(fileName, element) {
  const underscoreCount = fileName.split("_").length - 1;
  element.style.border =
    underscoreCount > 2 ? "5px solid red" : "1px solid black";
}

/**
 * Creates an editable input field for the file name.
 * @param {string} fileName - The current name of the file.
 * @param {FileSystemFileHandle} fileHandle - The file handle of the file to rename.
 * @returns {HTMLInputElement} The editable input element for the file name.
 */
export function createEditableFileNameInput(fileName, fileHandle) {
  const input = document.createElement("input");
  input.type = "text";
  input.value = fileName;
  input.dataset.originalName = fileName;

  return input;
}

/**
 * Creates a grid item for an image file with a given file name and content.
 * @param {string} fileName - The name of the image file.
 * @param {Blob} fileContent - The content of the image file as a Blob.
 * @param {FileSystemFileHandle} fileHandle - The file handle of the image file.
 * @param {HTMLElement} htmlContainer - The HTML container where the grid item will be appended.
 */
export function createImageGridItem(
  fileName,
  fileContent,
  fileHandle,
  htmlContainer
) {
  const gridItem = document.createElement("div");
  gridItem.classList.add("grid-item");

  const imageContainer = document.createElement("div");
  imageContainer.classList.add("image-container");
  const img = document.createElement("img");
  img.src = URL.createObjectURL(fileContent);
  img.alt = fileName;
  img.className = "pixelAsset";
  imageContainer.appendChild(img);

  checkAndUpdateStyles(fileName, imageContainer);

  const span = createFilenameSpan(fileName, fileHandle);

  gridItem.appendChild(imageContainer);
  gridItem.appendChild(span);
  htmlContainer.appendChild(gridItem);
}

/**
 * Creates a span element with the file name for display.
 * @param {string} fileName - The name of the file.
 * @param {FileSystemFileHandle} fileHandle - The file handle of the file.
 * @returns {HTMLSpanElement} The span element with the file name.
 */
function createFilenameSpan(fileName, fileHandle) {
  const span = document.createElement("span");
  span.textContent = fileName;
  return span;
}
