"use strict";

const assert = require("node:assert/strict");
const shim = require("./index.js");
const root = require("agora-agents");

assert.equal(shim.AgoraClient, root.AgoraClient);
assert.equal(shim.Agent, root.Agent);

console.log("Compat package re-exports verified.");
