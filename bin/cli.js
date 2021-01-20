#!/usr/bin/env node

const program = require("commander");
const { version } = require("../package.json");
const docit = require("../lib/index");

program.version(version).name("docit");


program
  .command("init <path>")
  .description("initalize project for given document", {
    path: "path of document",
  })
  .option("-a, --alias <alias>", "alias of project")
  .action((path, { alias }) => {
    docit.init(path, alias);
  });

program
  .command("open <alias>")
  .description("opens a project to be managed", {
    alias: "alias of wanted project",
  })
  .action((alias) => {
    docit.open(alias);
  });

program
  .command("new-version")
  .alias("snapshot")
  .description("creates a new version of the word document and saves it")
  .option("-c, --comments <comments>", "the comment for the version", "")
  .action(({ comments }) => {
    docit.new_version(comments);
  });

program
  .command("rollback <version>")
  .alias("restore")
  .description("rollsback to certain version", {
    version: "version of the word docu",
  })
  .action((version) => {
    docit.rollback(version);
  });

program
  .command("list-version")
  .description("list all the versions of a project")
  .action(() => {
    docit.list_versions();
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
    docit.peek(version);
  });

program
  .command("close")
  .description("closes the current working project")
  .action(() => {
    docit.close();
  });

program
  .command("move <newpath>")
  .description("moves the document to a new location", {
    newpath: "new path for the word document",
  })
  .action((newpath) => {
    docit.move(newpath);
  });

program.parse(process.argv);
