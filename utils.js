const path = require("path");
const fse = require("fs-extra");

function assertIsValidDocumentPath(filepath) {
  let ext = path.extname(filepath);
  if (ext !== ".docx" || ext !== ".doc") {
    throw new Error("Docit: not a valid file")
  }
}

function writeEmptyDocument(filepath) {
    try {
        fse.writeFileSync(docPath, "");
    } catch {
        throw new Error(`Docit: Unable to write file at ${filepath}`);
    }
  
}

function getFileName(path) {
  const extension = path.extname(path);
  return path.basename(path, extension)
}

function decompressFile(path) {
  // TODO
}

function compressFile(path) {
  // TODO
}



const utils = {
  assertIsValidDocumentPath,
  writeEmptyDocument,
  getFileName
};

module.exports = utils;
