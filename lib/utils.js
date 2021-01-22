const path = require("path");
const fse = require("fs-extra");
const { error } = require("./printUtils");


function assertIsValidDocumentPath(filepath) {
  let ext = path.extname(filepath);
  if (ext !== ".docx" && ext !== ".doc") {
    error("Docit: not a valid file");
  }
}

function writeEmptyDocument(filepath) {
    try {
        fse.writeFileSync(filepath, "");
    } catch {
        error(`Docit: Unable to write file at ${filepath}`);
    }
  
}

function getFileName(filepath) {
  const extension = path.extname(filepath);
  return path.basename(filepath, extension)
}




const utils = {
  assertIsValidDocumentPath,
  writeEmptyDocument,
  getFileName
};

module.exports = utils;
