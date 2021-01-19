const fileUtil = require("./utils.js");
const path = require("path");
const os = require("os");
const fse = require("fs-extra");
const zlib = require("zlib");
// should docitfolder be global
//USE PROMISES!!!!!
let currentWorkingAlias;
const DOCIT_PATH = path.join(os.homedir(), ".docit");
let PROJECT_PATH;
let VERSIONS_PATH;
let CONFIG_PATH;
let config;
let versions;

function setCurrentAlias(alias) {
  currentWorkingAlias = alias;
  PROJECT_PATH = path.join(DOCIT_PATH, alias);
  config = getConfig(); // WHAT HAPPENS IF AN ERROR OCCURES??
  versions = getVersions();
}
// function getDocitPath() {
//     return path.join(os.homedir(), ".docit");
// }

function getConfig() {

  CONFIG_PATH = path.join(PROJECT_PATH, "config.json");
  config = fse.readJSONSync(CONFIG_PATH);
  return config;
}

function getVersions() {
    
    VERSIONS_PATH = path.join(PROJECT_PATH, "versions");
    const buffer = fse.readFileSync(VERSIONS_PATH);
    const decompressed_buffer = zlib.brotliDecompressSync(buffer); // or use normal decompress
    return JSON.parse(decompressed_buffer.toString());
    // decompress
    // get json
    // set to versions variable
}

function saveConfigFile() {
    // not compressing as will remain very small
    fse.writeJSONSync(CONFIG_PATH, config);
}

function saveVersionsFile() {
    const versionsBuffer = Buffer.from(JSON.stringify(versions));
  const compressedVersionsBuffer = zlib.brotliCompressSync(versionsBuffer);
  fse.writeFileSyncSync(VERSIONS_PATH, compressedVersionsBuffer);
}


// function 

function assertCurrentWorkingAlias() {
  if (!currentWorkingAlias) {
    throw new Error("Docit: no project is open");
  } 
}

function assertNoCurrentWorkingAlias() {
    if (currentWorkingAlias) {
      throw new Error("Docit: project is already open");
    }
  
}

function assertProjectAlreadyExists(alias) {
  const folderpath = path.join(DOCIT_PATH, alias);
  if (fse.pathExistsSync(folderpath)) {
    throw new Error(
      "Docit: Project with same alias already exists. Either rename file or set a different alias"
    );
  }
}

function createInitalFiles(documentPath, alias) {
  const folderpath = path.join(DOCIT_PATH, alias);
  const initalConfig = {
    documentPath: documentPath, //
    currentVersion: "0.0",
    latestVersion: "0.0",
  };

  fse.outputJSONSync(path.join(folderpath, "config.json"), initalConfig);
  console.log(
    `New project collected at ${alias}. You can open it using "docit open <alias>"`
  );
}



const docit = {
  currentWorkingAlias,
  setCurrentAlias,
  createInitalFiles,
  config,
  versions,
  DOCIT_PATH,
  PROJECT_PATH,
  VERSIONS_PATH,
  CONFIG_PATH,
  saveConfigFile,
  saveVersionsFile,
  assertCurrentWorkingAlias,
  assertNoCurrentWorkingAlias,
  assertProjectAlreadyExists,
};

module.exports = docit;
