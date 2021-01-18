const os = require("os");
const path = require("path");
// const fs = require("fs");
const fse = require("fs-extra");
const fileUtil = require("./utils.js");
const hasha = require("hasha");
const docit = require("./docit.js");
const zlib = require("zlib");


// if (!fs.existsSync(DOCIT_DIR)) {
//   fs.mkdirSync(DOCIT_DIR); //THIS MIGHT BE MADE AUTOMATICALLY
// }

// const buf = Buffer.from(JSON.stringify({ name: "JEFF" }));

// console.log(JSON.parse(buf.toString()))

// console.log(path.join("C:\Users\monir\test.docx"));

// console.log(path.join(process.argv[2], 'hollo'));



// command: docit init C:\Users\monir\test.docx --alias test
// command: docit init C:\Users\monir\test.docx (alias will be infered as test from filename)
function init(documentPath, alias) {
  // should it open by default???
  fileUtil.assertIsValidDocumentPath(documentPath);
  const extension = path.extname(documentPath);
  alias = alias || path.basename(documentPath, extension).toLowerCase(); // essentially get the name of the file without the extension
  docit.assertProjectAlreadyExists(alias);

  if (!fs.existsSync(documentPath)) {
    fileUtil.writeEmptyDocument(documentPath); //
    console.log(`Created new Word Document at ${documentPath}`);
  }

  docit.createInitalFiles(documentPath, alias);
}

// command: docit open test (uses alias)

async function open(alias) {
  // if opened after init, it should just set the config object directly
  docit.assertNoCurrentWorkingAlias();
  const folderpath = path.join(docit.DOCIT_PATH, alias);

  if (!fse.pathExistsSync(folderpath)) {
    throw new Error(
      `Docit: no project with the alias ${alias} exists. Create a new project with "docit init <path-to-document>"`
    );
  }

  docit.setCurrentAlias(alias);
}

//command: docit snapshot
//command docit new-version
//command docit new-version --comments "added new paragraph"

function new_version(comments="") {
  docit.assertCurrentWorkingAlias();
  // update version number
  const pastVersion = docit.config.latestVersion || 0.0; //
  const newVersion = (parseFloat(pastVersion) + 1.0).toString();

  // read the document (get a buffer) and generate a hash from it
  const documentBuffer = fse.readFileSync(docit.config.documentPath);
  const file_hash = hasha(docit.config.documentPath, { algorithm: "md5" }); // for now
  // compress the given buffer and get write that compressed buffer to the version_filed directory
  // (with the name as the hash)
  const compressedDocumentBuffer = zlib.brotliCompressSync(documentBuffer);

  fse.outputFileSync(
    path.join(docit.PROJECT_PATH, "version_files", file_hash),
    compressedDocumentBuffer
  );

  // add version to version object
  docit.versions[newVersion] = {
    file_hash,
    date: Date.now(),
    comments,
  };

  // get buffer of version object, compress it, and write it to versions file
  const versionsBuffer = Buffer.from(JSON.stringify(docit.versions));
  const compressedVersionsBuffer = zlib.brotliCompressSync(versionsBuffer);
  fse.writeFileSyncSync(docit.VERSIONS_PATH, compressedVersionsBuffer);

  // update config values and write to config.json file
  docit.config.currentVersion = newVersion;
  docit.config.latestVersion = newVersion;
  //   fse.writeJSONSync(docit.CONFIG_PATH, docit.config);
  docit.saveConfig();
}

//command: docit list-versions
function list_versions() {
  docit.assertCurrentWorkingAlias();
  // for now
  console.log(docit.versions);
}

// command: docit peek 2
function peek(version) {
  docit.assertCurrentWorkingAlias();
  // the version must exist
  if (docit.versions[version]) {
    // get the file from the requested file object
    const { file_hash } = docit.versions[version];

    // get the compressed buffer from version_files using the hash (the saved compressed file of the version)
    // this can be turned into seperate functions
    const compressedBuffer = fse.readFileSync(
      path.join(docit.PROJECT_PATH, "version_files", file_hash),
      compressedDocumentBuffer
    );

    // decompress the buffer
    const decompressedBuffer = zlib.brotliDecompressSync(compressedBuffer);

    // get the parent directory name, so the "peek" can be written in the same location
    const parentDirname = path.dirname(docit.config.documentPath);
    // get the document name of the tracked file (without the extension), to create a modified file name for the peeked file
    const documentName = fileUtil.getFileName(docit.config.documentPath);
    // write the new peeked file
    //e.g: vesion = 5 test.docx -> test v5.docx
    const peekedFilePath = path.join(
      parentDirname,
      `${documentName} v${version}.docx`
    );
    fse.writeFileSync(peekedFilePath, decompressedBuffer);
    console.log(`Peeked file created at ${peekedFilePath}`);
  } else {
    throw new Error("Docit: given version does not exist");
  }
}

// move document from one location to another
// command: docit move "C:\Users\monir\test.docx"
function move(newDocumentPath) {

  docit.assertCurrentWorkingAlias();
  // move the file to the new path
  fse.moveSync(docit.config.documentPath, newDocumentPath);
  // update the path in the config
  docit.config.documentPath = newDocumentPath;
  // save updated config to config.json
  docit.saveConfig();
  // fse.writeJSONSync(docit.CONFIG_PATH, docit.config);
}

//command: docit rollback 5
function rollback(version) {
    // TODO
}
