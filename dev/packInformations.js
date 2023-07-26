import { getFileHandle } from "./fileUtils.js";

/**
 * Function to display pack information
 * @param {Object} packData - The pack data to display
 */
export function displayPackInfo(packData) {
  const packInfo = document.getElementById("packInformations");
  const price = packData.prices[0].value;
  const description = formatDescription(packData.longDescription);

  packInfo.innerHTML = `
     <ul>
        <li id="numberOfSprites"></li>
     </ul>
     <h2>Package Information</h2>
     <p><strong>Unique tag:</strong> <textarea id="tag" class="editable">${
       packData.tag
     }</textarea></p>
     <p><strong>Price:</strong> <textarea id="prices" class="editable">${price}</textarea></p>
     <p><strong>Description:</strong><br> <textarea id="longDescription" class="editable">${description}</textarea></p>
     <p><strong>SellerId:</strong> <textarea id="sellerId" class="editable">${
       packData.sellerId
     }</textarea></p>
     <p><strong>SellerStripeAccountId:</strong> <textarea id="sellerStripeAccountId" class="editable">${
       packData.sellerStripeAccountId
     }</textarea></p>
   `;
  // Add click event listeners to the <p> elements with IDs
  [
    "tag",
    "prices",
    "longDescription",
    "sellerId",
    "sellerStripeAccountId",
  ].forEach((id) => {
    document.getElementById(id).addEventListener("click", handleEdit);
  });
}

/**
 * Function to format the description by replacing \n characters with line breaks (<br> tags)
 * @param {string} description - The original description with newline characters
 * @returns {string} The formatted description with <br> tags
 */
function formatDescription(description) {
  return description.replace(/\n/g, "<br>");
}

/**
 * Function to handle the click event for editing pack information
 * @param {Event} event - The click event
 */
function handleEdit(event) {
  const { currentTarget: target } = event;
  const id = target.id;
  const valueElement = document.getElementById(id);

  // Replace the <textarea> element with the pack data for editing
  const textarea = document.createElement("textarea");
  textarea.value = valueElement.textContent;
  valueElement.replaceWith(textarea);
  textarea.focus();

  textarea.addEventListener("keyup", (event) => {
    if (event.key === "Enter") {
      const newValue = textarea.value;
      const idWithoutValue = id; // No need to remove "Value" from the ID now
      updatePackInfo(idWithoutValue, newValue);
    }
  });
}

/**
 * Function to remove trailing newlines from a nested object
 * @param {Object} obj - The object to remove trailing newlines from
 */
function removeTrailingNewlines(obj) {
  for (const key in obj) {
    if (typeof obj[key] === "string") {
      obj[key] = obj[key].trimEnd();
    } else if (typeof obj[key] === "object" && obj[key] !== null) {
      removeTrailingNewlines(obj[key]);
    }
  }
}

/**
 * Function to update pack information based on the provided ID and new value
 * @param {string} id - The ID of the pack data to update
 * @param {string} newValue - The new value to set for the specified ID
 */
async function updatePackInfo(id, newValue) {
  const packJSONFile = await getFileHandle("pack.json");

  try {
    const packJSONContent = await packJSONFile.getFile();
    const textContent = await packJSONContent.text();
    const packData = JSON.parse(textContent);

    // Check if packData is an object
    if (typeof packData !== "object" || packData === null) {
      throw new Error("pack.json does not contain valid JSON data.");
    }

    if (id === "prices") {
      newValue = [
        {
          value: newValue.replace(/[^\d]/g, ""),
          name: "default",
        },
      ];
    }

    packData[id] = newValue;

    removeTrailingNewlines(packData);

    const updatedPackJSONContent = JSON.stringify(packData, null, 2);

    const writable = await packJSONFile.createWritable();
    await writable.write(updatedPackJSONContent);
    await writable.close();
  } catch (error) {
    console.error("Error updating pack.json:", error);
  }
}
