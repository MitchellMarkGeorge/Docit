declare module docit {
  function move(): void;
  function rollback(version: string): void;
  function peek(version: string): void;
  function init(documentPath: string, alias?: string): void;
  function open(alias: string): void;
  function new_version(comments?: string): void;
  function list_versions(): ProjectVersions;
  function close(): void;
  function status(): ProjectConfig; // should retun something {}
  function list_projects(): string[];
  function is_in_project(): boolean
  function make_file(path: string): void
  function get_current_alias(): string | undefined
}

interface ProjectConfig {
  documentPath: string; //
  currentVersion: string;
  latestVersion: string;
}

interface ProjectVersions {
    [version: string] : {
        file_hash: string,
        comments: string,
        date: number
    }
}

export = docit
