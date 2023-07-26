import { readFile } from "./fileUtils.js";

/**
Displays a list of tags as chips in the "tags" div container.
Clears any existing tags before displaying the new ones.
@param {string[]} tags - An array of tags to be displayed as chips.
*/
export function displayImageTagsAsChips(tags) {
  const tagsDiv = document.getElementById("tags");
  tagsDiv.innerHTML = ""; // Clear any existing tags

  if (!tags) {
    return;
  }

  tags.forEach((tag) => {
    const chip = createTagChip(tag);
    tagsDiv.appendChild(chip);
  });
}

/**
 * Creates a chip element for a given tag.
 * @param {string} tag - The tag text.
 * @returns {HTMLDivElement} The created chip element.
 */
function createTagChip(tag) {
  const chip = document.createElement("div");
  chip.classList.add("chipTag");
  chip.textContent = tag;
  return chip;
}

/**
 * Recursively searches for the associated tags of a given file name in the folder structure.
 * If a matching file is found, returns the associated tags from the parent folder.
 * @param {string} fileName - The name of the file to find the associated tags for.
 * @param {Object} folderStructure - The folder structure object to search in.
 * @returns {string[]} An array of associated tags for the file, or an empty array if not found.
 */
export function findTagsForFileName(fileName, folderStructure) {
  for (const file of folderStructure.files) {
    // Check if the obect nq;e of the structure matches the clicked object
    if (file.name.split("_")[0] === fileName.split("_")[0]) {
      //return the associated tags from the parent folder

      let tagsList = [];
      tagsList = folderStructure.tags.map((tag) => tag.trim());
      return tagsList;
    }
  }

  // Recursively search in subfolders
  for (const subFolder of folderStructure.subFolder) {
    const tags = findTagsForFileName(fileName, subFolder);
    if (tags.length > 0) {
      return tags;
    }
  }

  // If no associated tags are found, return an empty array
  return [];
}

/**
 * Animates the clicked image preview with a slideshow effect and displays the associated tags in the console.
 * @param {FileSystemFileHandle[]} fileEntries - An array of file entries to display in the slideshow.
 */
export async function animateClickedImagePreview(fileEntries) {
  const clickedImagePreview = document.getElementById("clickedImagePreview");

  if (clickedImagePreview) {
    clickedImagePreview.remove();
  }

  const newClickedImagePreview = document.createElement("img");
  newClickedImagePreview.id = "clickedImagePreview";
  newClickedImagePreview.className = "pixelAsset";

  const fileContents = await Promise.all(fileEntries.map(readFile));
  const objectURLs = fileContents.map((fileContent) =>
    URL.createObjectURL(fileContent)
  );

  const clickedImageName = fileEntries[0].name;
  const associatedTags = findTagsForFileName(
    clickedImageName,
    window.packfilesStructure
  );

  console.log("Associated tags for the clicked image:", associatedTags);

  displayImageTagsAsChips(associatedTags);

  let currentIndex = 0;
  const showNextImage = () => {
    newClickedImagePreview.src = objectURLs[currentIndex];
    currentIndex = (currentIndex + 1) % fileContents.length;
  };

  showNextImage();

  const imagePreviewContainer = document.querySelector(
    ".image-preview-container"
  ); 
  imagePreviewContainer.appendChild(newClickedImagePreview);

  if (fileContents.length > 1) {
    setInterval(showNextImage, 1000);
  }
}
