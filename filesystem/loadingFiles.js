import {
  createImageGridItem,
  createEditableFileNameInput,
} from "./displayAndInteractionOnPack.js";
import { animateClickedImagePreview } from "./previewPanel.js";
import { displayPackInfo } from "./packInformations.js";
import { getFileEntry, readFile, readTextFile } from "./fileUtils.js";

const errorList = document.getElementById("errorList");
const gridContainer = document.getElementById("gridContainer");
const previewImagesSection = document.getElementById("previewImages");

// Declare the global packfilesStructure variable
window.packfilesStructure = {
  kind: "directory",
  name: "", // Will be updated when listing the root folder
  handle: null, // Will be updated when listing the root folder
  tags: [], // Add tags if necessary
  subFolder: [], // Will be updated when listing the root folder
};

/**
 * Adds a message to the error list with an optional class name for styling.
 * @param {string} textContent - The text content of the error message.
 * @param {string} className - Optional class name for styling the error message.
 */
function addMessageToErrorList(textContent, className) {
  const listItem = document.createElement("li");
  listItem.textContent = textContent;
  if (className) {
    listItem.classList.add(className);
  }
  errorList.appendChild(listItem);
}

async function createFolderStructure(systemHandle) {
  const folderStructure = {
    kind: "directory",
    name: systemHandle.name,
    handle: systemHandle,
    tags: [], // Add tags if necessary
    files: [],
    subFolder: [],
    allTagsParentIncluded: [],
  };

  return folderStructure;
}

async function parsePackFolder(directoryHandle, isRoot = true, parentFolder) {
  try {
    if (isRoot) {
      packfilesStructure.kind = "directory";
      packfilesStructure.name = directoryHandle.name;
      packfilesStructure.handle = directoryHandle;
      packfilesStructure.subFolder = [];
      packfilesStructure.files = [];
      packfilesStructure.tags = [];

      errorList.innerHTML = "";

      const tagsFile = await getFileEntry(directoryHandle, "TAGS.md");
      const packJsonFile = await getFileEntry(directoryHandle, "pack.json");

      if (tagsFile) {
        const fileContent = await readTextFile(tagsFile);
        if (fileContent) {
          const tags = fileContent.split(",").map((tag) => tag.trim());
          packfilesStructure.tags = tags;
        } else {
          addMessageToErrorList(
            "TAGS.md file is empty. Please add a list of words separated by a comma.",
            "warning"
          );
        }
      } else {
        addMessageToErrorList(
          "TAGS.md file not found in the root folder. Please add the file with a list of words separated by a comma.",
          "warning"
        );
      }

      if (!packJsonFile) {
        addMessageToErrorList(
          "pack.json file not found in the root folder. Please add the file with the necessary pack information.",
          "warning"
        );
      }
    } // End of the root folder

    //Store in systemHandlesList all the handles of the content loaded from the File System API
    const systemHandlesList = [];
    for await (const systemHandle of directoryHandle.values()) {
      systemHandlesList.push(systemHandle);
    }

    const filenameGroups = {}; // Group the files by their objact name in this structure

    for (const systemHandle of systemHandlesList) {
      if (systemHandle.kind === "directory") {
        const subFolder = await createFolderStructure(systemHandle);
        if (parentFolder) {
          parentFolder.subFolder.push(subFolder); // Add the subFolder systemHandle to the parent folder
          subFolder.allTagsParentIncluded.push(...parentFolder.tags);
        } else {
          // If parentFolder is null, it means this is the root folder
          packfilesStructure.subFolder.push(subFolder);
        }
        await parsePackFolder(systemHandle, false, subFolder);
      } else if (systemHandle.kind === "file") {
        if (systemHandle.name === "pack.json") {
          const fileContent = await readTextFile(systemHandle);
          const packData = JSON.parse(fileContent);
          displayPackInfo(packData);
        }

        if (systemHandle.name === "TAGS.md") {
          // Read the tags from TAGS.md file and update the parent folder's tags
          const fileContent = await readTextFile(systemHandle);
          const tagsList = fileContent.split(",").map((tag) => tag.trim());
          if (parentFolder) {
            parentFolder.tags = tagsList;
            parentFolder.allTagsParentIncluded.push(...tagsList);
          } else {
            packfilesStructure.tags = tagsList;

            packfilesStructure.subFolder.map((folder) => {
              folder.allTagsParentIncluded.push(...tagsList);
            });
          }
        }

        const fileContent = await readFile(systemHandle);
        if (fileContent.type.startsWith("image/")) {
          if (directoryHandle.name === "previewImages") {
            createImageGridItem(
              systemHandle.name,
              fileContent,
              systemHandle,
              previewImagesSection
            );
          } else {
            const filename = systemHandle.name;
            let prefix = filename.split("_")[0];
            prefix = prefix.split(".")[0];
            if (!filenameGroups[prefix]) {
              filenameGroups[prefix] = [];
            }
            filenameGroups[prefix].push(systemHandle);

            parentFolder.files.push({
              kind: "file",
              name: systemHandle.name,
              handle: systemHandle,
            });
          }
        } else {
          // File have a parentFolder
          if (parentFolder) {
            parentFolder.files.push({
              kind: "file",
              name: systemHandle.name,
              handle: systemHandle,
            });
          } else {
            // If parentFolder is null, it means this is the root folder
            packfilesStructure.files.push({
              kind: "file",
              name: systemHandle.name,
              handle: systemHandle,
              tags: [],
            });
          }
        }
      }
    }

    for (const prefix in filenameGroups) {
      const filenameGroup = filenameGroups[prefix];
      const firstEntry = filenameGroup[0];
      const fileContent = await readFile(firstEntry);
      createImageGridItem(prefix, fileContent, firstEntry, gridContainer);

      const remainingFiles = filenameGroup;
      const previewImageElement = gridContainer.lastChild;
      previewImageElement.addEventListener("click", () => {
        animateClickedImagePreview(remainingFiles);
      });
    }
  } catch (error) {
    console.error("Error accessing the folder:", error);
  }

  const packDetailsDiv = document.getElementById("numberOfSprites");

  if (packDetailsDiv) {
    packDetailsDiv.innerHTML =
      document.querySelectorAll("#gridContainer")[0].childNodes.length +
      " Sprites (Objects)";
  }
}

/**
 * Handles the click event of the "Open Folder" button.
 */
async function handleOpenFolderButtonClick() {
  try {
    const directoryHandle = await window.showDirectoryPicker();
    gridContainer.innerHTML = "";
    previewImagesSection.innerHTML = "";
    await parsePackFolder(directoryHandle, true);
  } catch (error) {
    console.error("Error accessing the folder:", error);
  }
}

/**
 * Handles the click event of the file name span to allow renaming.
 * @param {HTMLSpanElement} span - The span element containing the file name.
 * @param {FileSystemFileHandle} fileHandle - The file handle of the file to rename.
 */
export function handleFilenameClick(span, fileHandle) {
  span.removeEventListener("click", () =>
    handleFilenameClick(span, fileHandle)
  );
  const input = createEditableFileNameInput(span.textContent, fileHandle);
  span.replaceWith(input);
  input.focus();
}

// Event listener for the "Open Folder" button
const btnOpenFolder = document.getElementById("btnOpenFolder");
btnOpenFolder.addEventListener("click", handleOpenFolderButtonClick);
