#!/usr/bin/env node

const program = require("commander");
const { version, name } = require("../package.json");
const docix = require("../lib/index");
const Table = require("cli-table");
const printUtils = require("../lib/printUtils");

program.version(version).name(name);
// spinners?

program
  .command("init <path>") // could use a flag to designate if creating a new file should be done
  .alias("i")
  .description("initalize project for given document", {
    path: "path of document",
  })
  .option("-a, --alias <alias>", "alias of project")
  .action((path, { alias }) => {
    docix.init(path, alias);
    printUtils.success(
      `New project created with alias ${alias}. You can open it using "docit open ${alias}"`
    );
  });

program
  .command("open <alias>")
  .description("opens a project to be managed", {
    alias: "alias of wanted project",
  })
  .action((alias) => {
    docix.open(alias);
    printUtils.success(
      `Project "${alias}" opened. When done, you can close it using "docit close"`
    );
  });

program
  .command("new-version")
  .alias("nv")
  .alias("snapshot")
  .description("creates a new version of the word document and saves it")
  .option("-c, --comments <comments>", "the comment for the version", "")
  .action(({ comments }) => {
    printUtils.info("Creating new version...");
    docix.new_version(comments);
    printUtils.success(`Saved new version: v${newVersion}`);
    printUtils.info(
      `When you are done working on this project, don't for get to close it using "docit close"`
    );
  });

program
  .command("rollback <version>")
  .alias("rb")
  .alias("restore")
  .description("rollsback to certain version", {
    version: "version of the word document you want to rollback to",
  })
  .action((version) => {
    // spinner
    printUtils.info(`Rolling back to v${version}...`);
    docix.rollback(version);
    printUtils.success(`Successfully rolled back to v${version}`);
  });

program
  .command("list-version")
  .alias("lv")
  .description("list all the versions of a project")
  .action(() => {
    const versions = docix.list_versions();
    const table = new Table({
      head: ["Version", "File Hash", "When", "Comments"],
    });

    
    for (const version in versions) {
      const values = Object.values(versions[version]);
      values[1] = new Date(values[1]).toDateString(); // make the numbers into an actual string
      values[2] = values[2] || "No Comments"; // if there is no comment, an alternate text is 

      table.push([`v${version}`, ...values]);
      
    }
    console.log(table.toString());
  });

program
  .command("list-projects")
  .alias("lp")
  .description("list all the projects")
  .action(() => {
    const projects = docix.list_projects();
    console.log("Projects:");
    projects.forEach((name) => {
      console.log(name);
    });
  });

program
  .command("status")
  .alias("info")
  .description("get information of the current project timeline")
  .action(() => {
    const config = docix.status();

    printUtils.info(`Current Project: ${config.documentPath}`);
    printUtils.info(`Latest Version: ${parseInt(config.latestVersion) || "None"}`);
    printUtils.info(
      `Current Version: ${parseInt(config.currentVersion) || "None"}`
    );
  });

program
  .command("peek <version>")
  .description(
    "creates a new word document of the saved version. does not affect the timeline",
    {
      version: "version of the word document you want to peek at",
    }
  )
  .action((version) => {
    printUtils.info("Creating peeked file...");
    docix.peek(version);
    printUtils.success(`Peeked file created at ${peekedFilePath}`);
    
  });

program
  .command("close")
  .description("closes the current working project")
  .action(() => {
    docix.close();
    printUtils.success("Closed working project");
  });

program
  .command("move <newpath>")
  .description("moves the document to a new location", {
    newpath: "new path for the word document",
  })
  .action((newpath) => {
    docix.move(newpath);
    printUtils.success("Moved file successfully");
  });

  program
  .command("make-file <path>")
  .alias("mf")
  .description("creates a new document at the given path", {
    path: "given path for the new document",
  })
  .action((path) => {
    docix.make_file(path);
    printUtils.success(`Made new Word Document at ${path}`);
  });

program.parse(process.argv);
