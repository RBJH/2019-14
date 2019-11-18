const fs = require("fs");
const path = require("path");

const resolvedPath = path.resolve(process.cwd(), "test.env");
require("dotenv").config({
  path: resolvedPath,
});
const { expect } = require("chai");
const { DockerApi } = require("../../src/api/Docker.js");
const { StreamResolver } = require("../../src/utils/StreamResolver");

const remoteIp = process.env.REMOTE_DOCKER_IP;
const remotePort = process.env.REMOTE_DOCKER_PORT;
const caPath = process.env.SSL_CA_PATH;
const certPath = process.env.SSL_CERT_PATH;
const keyPath = process.env.SSL_KEY_PATH;

const connectOptions = {
  right: {
    host: remoteIp,
    port: remotePort,
    version: "v1.40",
    caPath,
    certPath,
    keyPath,
  },
  wrongPort: {
    host: remoteIp,
    port: 8000,
    version: "v1.40",
  },
  noVersion: {
    host: remoteIp,
    port: remotePort,
  },
};

const testcases = {
  exec: {
    options: connectOptions.right,
    id: "d5d08093284f",
    cmd: "echo 'hello'",
    answer: "hello",
  },
};

describe("DockerApi", () => {
  it("container에 not-pending 형식의 명령어를 수행할 수 있다", async () => {
    const testcase = testcases.exec;
    const dockerClient = new DockerApi(testcase.options);
    await dockerClient.init();

    const stream = await dockerClient.execById(testcase.id, testcase.cmd);

    const resolver = new StreamResolver(stream);
    const rawString = await resolver.flush();

    const result = rawString.slice(8, -1);
    expect(result).to.be.equal(testcase.answer);
  });
});
