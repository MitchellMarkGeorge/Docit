const path = require("path");
const os = require("os");
const fse = require("fs-extra");
const zlib = require("zlib");
const printUtils = require("./printUtils.js");
const Conf = require("conf");

//USE PROMISES!!!!!


class Internals {
  constructor() {
    this.DOCIT_PATH = path.join(os.homedir(), ".docit");
    // where I store the current alias
    this.docitConfig = new Conf({ cwd: path.join(this.DOCIT_PATH, ".config") });
    
  }

  get currentWorkingAlias() {
    return this.docitConfig.get("currentAlias");
  }

  set currentWorkingAlias(alias) {
    this.docitConfig.set("currentAlias", alias);
  }

  get PROJECT_PATH() {
    return path.join(this.DOCIT_PATH, this.currentWorkingAlias);
  }

  get VERSIONS_PATH() {
    return path.join(this.PROJECT_PATH, "versions");
  }

  get CONFIG_PATH() {
    return path.join(this.PROJECT_PATH, "config.json");
  }

  get config() {
    // this.VERSIONS_PATH = path.join(this.PROJECT_PATH, "versions");
    return fse.readJSONSync(this.CONFIG_PATH);
  }

  get versions() {
    // this.VERSIONS_PATH = path.join(this.PROJECT_PATH, "versions");
    if (fse.pathExistsSync(this.VERSIONS_PATH)) {
      const buffer = fse.readFileSync(this.VERSIONS_PATH);
      const decompressed_buffer = zlib.brotliDecompressSync(buffer); // or use normal decompress
      return JSON.parse(decompressed_buffer.toString());
    } else {
      return {};
    }
  }

  getConfig() {
    this.CONFIG_PATH = path.join(this.PROJECT_PATH, "config.json");
    this.config = fse.readJSONSync(this.CONFIG_PATH);
    return this.config;
  }

  getVersions() {
    this.VERSIONS_PATH = path.join(this.PROJECT_PATH, "versions");
    if (fse.pathExistsSync(this.VERSIONS_PATH)) {
      const buffer = fse.readFileSync(this.VERSIONS_PATH);
      const decompressed_buffer = zlib.brotliDecompressSync(buffer); // or use normal decompress
      return JSON.parse(decompressed_buffer.toString());
    } else {
      return {};
    }
  }

  saveConfigFile(config) {
    // config = config || this.config
    // not compressing as config file will remain very small
    fse.outputJSONSync(this.CONFIG_PATH, config);
  }

  saveVersionsFile(versions) {
    const versionsBuffer = Buffer.from(JSON.stringify(versions));
    const compressedVersionsBuffer = zlib.brotliCompressSync(versionsBuffer);
    fse.outputFileSync(this.VERSIONS_PATH, compressedVersionsBuffer);
  }

  // function

  assertCurrentWorkingAlias() {
    if (!this.currentWorkingAlias) {
      printUtils.error("Docit: no project is open");
    }
  }

  assertNoCurrentWorkingAlias() {
    if (this.currentWorkingAlias) {
      printUtils.error(
        `Docit: project ${this.currentWorkingAlias} is already open`
      );
    }
  }

  assertProjectAlreadyExists(alias) {
    const folderpath = path.join(this.DOCIT_PATH, alias);
    if (fse.pathExistsSync(folderpath)) {
      printUtils.error(
        "Docit: Project with same alias already exists. Either rename file or set a different alias"
      );
    }
  }

  createInitalFiles(documentPath, alias) {
    const folderpath = path.join(this.DOCIT_PATH, alias);
    const initalConfig = {
      documentPath: documentPath, //
      currentVersion: "0.0",
      latestVersion: "0.0",
    };

    fse.outputJSONSync(path.join(folderpath, "config.json"), initalConfig);
    printUtils.success(
      `New project created with alias ${alias}. You can open it using "docit open ${alias}"`
    );
  }

  resetVariable() {
    this.docitConfig.delete("currentAlias");
  }
}

// function getDocitPath() {
//     return path.join(os.homedir(), ".docit");
// }

// const internals = {
//   currentWorkingAlias,
//   setCurrentAlias,
//   createInitalFiles,
//   config,
//   versions,
//   DOCIT_PATH,
//   PROJECT_PATH,
//   VERSIONS_PATH,
//   CONFIG_PATH,
//   saveConfigFile,
//   saveVersionsFile,
//   assertCurrentWorkingAlias,
//   assertNoCurrentWorkingAlias,
//   assertProjectAlreadyExists,
//   resetVariables,
// };

module.exports = new Internals();


// let array = [1, 3, 6, 10, 6];
// let length = array.length
// for (let i = 0; i <= length; i++) {
//   if (array[i] == 10 || length - )
// }