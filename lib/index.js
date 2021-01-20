const path = require("path");
const fse = require("fs-extra");
const fileUtil = require("./utils.js");
const hasha = require("hasha");
const internals = require("./internals.js");
const zlib = require("zlib");
const printUtils = require("./printUtils.js");
const ora = require("ora");
const chalk = require("chalk")

// LOOK FOR ERROR IN ALL FILES
//TYPESCRIPT
//ERROR HANDLING (mostly in internal) -> PROMISES
//ENCAPSULATION

// command: docit init C:\Users\monir\test.docx --alias test
// command: docit init C:\Users\monir\test.docx (alias will be infered as test from filename)
function init(documentPath, alias) {
  // should it open by default???
  fileUtil.assertIsValidDocumentPath(documentPath);
  const extension = path.extname(documentPath);
  alias = alias || path.basename(documentPath, extension).toLowerCase(); // essentially get the name of the file without the extension
  internals.assertProjectAlreadyExists(alias);

  if (!fse.pathExistsSync(documentPath)) {
    fileUtil.writeEmptyDocument(documentPath); //
    printUtils.info(`Created new Word Document at ${documentPath}`);
  }

  internals.createInitalFiles(documentPath, alias);
}

// command: docit open test (uses alias)

function open(alias) {
  // if opened after init, it should just set the config object directly
  internals.assertNoCurrentWorkingAlias();
  const folderpath = path.join(internals.DOCIT_PATH, alias);

  if (!fse.pathExistsSync(folderpath)) {
    printUtils.error(
      `Docit: no project with the alias ${alias} exists. Create a new project with "docit init <path-to-document>"`
    );
  }

  internals.currentWorkingAlias = alias;
  printUtils.success(`Project "${alias}" opened. When done, you can close it using "docit close"`)
  // console.log(internals.currentWorkingAlias);
}

//command: docit snapshot
//command docit new-version
//command docit new-version --comments "added new paragraph"

function new_version(comments) {
  
  // console.log(internals.currentWorkingAlias);
  internals.assertCurrentWorkingAlias();
  const spinner = ora(chalk.bold("Creating new version...")).start()
  // update version number
  const config = internals.config;
  const versions = internals.versions;

  const pastVersion = config.latestVersion || 0.0; //
  const newVersion = (parseFloat(pastVersion) + 1.0).toString();

  // read the document (get a buffer) and generate a hash from it
  const documentBuffer = fse.readFileSync(config.documentPath);
  const file_hash = hasha(config.documentPath, { algorithm: "md5" }); // for now
  // compress the given buffer and get write that compressed buffer to the version_filed directory
  // (with the name as the hash)
  const compressedDocumentBuffer = zlib.brotliCompressSync(documentBuffer);

  fse.outputFileSync(
    path.join(internals.PROJECT_PATH, "version_files", file_hash),
    compressedDocumentBuffer
  );

  // add version to version object
  versions[newVersion] = {
    file_hash,
    date: Date.now(),
    comments,
  };

  // get buffer of version object, compress it, and write it to versions file
  // docit.saveVersionsFile()
  const versionsBuffer = Buffer.from(JSON.stringify(versions));
  const compressedVersionsBuffer = zlib.brotliCompressSync(versionsBuffer);
  fse.writeFileSync(internals.VERSIONS_PATH, compressedVersionsBuffer);

  // update config values and write to config.json file
  config.currentVersion = newVersion;
  config.latestVersion = newVersion;
  //   fse.writeJSONSync(docit.CONFIG_PATH, docit.config);
  internals.saveConfigFile(config);
  spinner.succeed(chalk.bold(`Saved new version: ${newVersion}`));
}

//command: docit status
// command: docit info
// prints out info about version
function status() {}

//command: docit list-versions
function list_versions() {
  internals.assertCurrentWorkingAlias();
  // for now
  console.dir(internals.versions);
}

// command: docit peek 2
function peek(version) {
  internals.assertCurrentWorkingAlias();
  const spinner = ora(chalk.bold("Creating peeked file...")).start();
  // the version must exist
  const config = internals.config;
  const versions = internals.versions;
  if (versions[version]) {
    // get the file from the requested file object
    const { file_hash } = versions[version];

    // get the compressed buffer from version_files using the hash (the saved compressed file of the version)
    // this can be turned into seperate functions
    const compressedBuffer = fse.readFileSync(
      path.join(internals.PROJECT_PATH, "version_files", file_hash),
      compressedDocumentBuffer
    );

    // decompress the buffer
    const decompressedBuffer = zlib.brotliDecompressSync(compressedBuffer);

    // get the parent directory name, so the "peek" can be written in the same location
    const parentDirname = path.dirname(config.documentPath);
    // get the document name of the tracked file (without the extension), to create a modified file name for the peeked file
    const documentName = fileUtil.getFileName(config.documentPath);
    // write the new peeked file
    //e.g: vesion = 5 test.docx -> test v5.docx
    const peekedFilePath = path.join(
      parentDirname,
      `${documentName} v${version}.docx`
    );
    fse.writeFileSync(peekedFilePath, decompressedBuffer);
    printUtils.success(`Peeked file created at ${peekedFilePath}`);
  } else {
    spinner.fail(chalk.bold("Docit: given version does not exist"));
  }
}

// move document from one location to another
// command: docit move "C:\Users\monir\test.docx"
function move(newDocumentPath) {
  internals.assertCurrentWorkingAlias();
  const config = internals.config;
  // const versions = internals.versions;
  // move the file to the new path
  fse.moveSync(config.documentPath, newDocumentPath);
  // update the path in the config
  config.documentPath = newDocumentPath;
  // save updated config to config.json
  internals.saveConfigFile(config);
  printUtils.success("Moved file successfully")
  // fse.writeJSONSync(docit.CONFIG_PATH, docit.config);
}

//command: docit rollback 5
function rollback(version) {
  // TODO
  internals.assertCurrentWorkingAlias();
  const spinner = ora(`Rolling back to version ${version}...`).start();
  const config = internals.config;
  const versions = internals.versions;

  if (versions[version]) {
    // get the file from the requested version object
    const { file_hash } = versions[version];

    // get the compressed buffer from version_files using the hash (the saved compressed file of the version)
    // this can be turned into seperate functions
    const compressedBuffer = fse.readFileSync(
      path.join(internals.PROJECT_PATH, "version_files", file_hash),
      compressedDocumentBuffer
    );

    // decompress the buffer
    const decompressedBuffer = zlib.brotliDecompressSync(compressedBuffer);

    fse.writeFileSync(internals.config.documentPath, decompressedBuffer);

    config.currentVersion = version;

    internals.saveConfigFile(config);

    spinner.succeed(chalk.bold(`Successfully rolled back to version ${version}`));
  } else {
    spinner.fail(chalk.bold("Docit: given version does not exist"));
  }
}

// command: docit close
function close() {
  internals.assertCurrentWorkingAlias();
  internals.resetVariable();
  printUtils.success("Closed working project")
}

module.exports = {
  rollback,
  move,
  peek,
  init,
  open,
  new_version,
  list_versions,
  close,
};