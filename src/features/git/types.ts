import type { Tagged } from "type-fest";

export type GitDiff = Tagged<string, "GitDiff">;

export type GitTreeId = Tagged<string, "TreeObjectId">;

export type GitChange = {
  path: string;
  status: { staged: string; unstaged: string };
};
