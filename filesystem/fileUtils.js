/**
 * Requests permission and renames a file with a new name.
 * @param {FileSystemFileHandle} fileHandle - The file handle of the file to rename.
 * @param {string} newName - The new name for the file.
 */
export async function requestPermissionAndRename(fileHandle, newName) {
  try {
    if (await verifyPermission(fileHandle, "readWrite")) {
      await renameFile(fileHandle, newName);
    } else {
      console.error("Permission not granted.");
    }
  } catch (error) {
    console.error("Error renaming the file:", error);
  }
}

/**
 * Gets the file entry for a given file name from a directory handle.
 * @param {FileSystemDirectoryHandle} directoryHandle - The directory handle to search in.
 * @param {string} fileName - The name of the file to find.
 * @returns {FileSystemFileHandle | null} The file entry if found, or null if not found.
 */
export async function getFileEntry(directoryHandle, fileName) {
  try {
    for await (const entry of directoryHandle.values()) {
      if (entry.name === fileName) {
        return entry;
      }
    }
    return null; // File not found
  } catch (error) {
    console.error("Error accessing file entry:", error);
    return null;
  }
}

/**
 * Reads the content of a file as a Blob.
 * @param {FileSystemFileHandle} fileHandle - The file handle of the file to read.
 * @returns {Blob} The content of the file as a Blob.
 */
export async function readFile(fileHandle) {
  try {
    const file = await fileHandle.getFile();
    const blob = await file.arrayBuffer();
    return new Blob([blob], { type: file.type });
  } catch (error) {
    console.error("Error reading the file:", error);
    throw error;
  }
}

/*
 * Renames a file with a new name.
 * @param {FileSystemFileHandle} fileHandle - The file handle of the file to rename.
 * @param {string} newName - The new name for the file.
 */
export async function renameFile(fileHandle, newName) {
  try {
    if (newName === "") {
      alert("File name cannot be empty.");
      return;
    }

    const invalidCharsRegex = /[\\/?:*|"<>]/;
    if (invalidCharsRegex.test(newName)) {
      alert('File name contains invalid characters (\\ / ? * : | " < >).');
      return;
    }

    await fileHandle.move(newName);
  } catch (error) {
    console.error("Error renaming the file:", error);
  }
}

/**
 * Verifies the permission of a file handle for read and write access.
 * @param {FileSystemFileHandle} fileHandle - The file handle to check permissions for.
 * @param {string} readWrite - The access mode ("readWrite") to check.
 * @returns {boolean} True if the permission is granted, otherwise false.
 */
export async function verifyPermission(fileHandle, readWrite) {
  const options = {};
  if (readWrite) {
    options.mode = "readwrite";
  }
  if ((await fileHandle.queryPermission(options)) === "granted") {
    return true;
  }
  if ((await fileHandle.requestPermission(options)) === "granted") {
    return true;
  }
  return false;
}

/**
 * Function to get the file handle for a specific file name
 * @param {string} fileName - The name of the file to get the handle for
 * @returns {Promise<FileSystemFileHandle>} The file handle for the specified file
 */
export async function getFileHandle(fileName) {
  const directoryHandle = await window.showDirectoryPicker();
  return await directoryHandle.getFileHandle(fileName);
}

/**
 * Update the readTextFile function to use the global file handle
 * @param {FileSystemFileHandle} fileHandle - The file handle to read
 * @returns {Promise<string|null>} The content of the file as a string, or null on error
 */
export async function readTextFile(fileHandle) {
  const file = await fileHandle.getFile();
  return await file.text();
}
