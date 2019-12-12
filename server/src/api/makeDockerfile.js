const fs = require("fs").promises;
require("../../src/env-loader").appendEnv("remote");

const parseTerminalOption = (terminalOption) => {
  let result =
    terminalOption.OS[0] === "ubuntu"
      ? makeUbuntuTypeTerminalText(terminalOption)
      : makeCentosTypeTerminalText(terminalOption);

  // docker container ssh 접속을 위한 셋팅
  result = `${result}\nRUN mkdir /var/run/sshd`;
  result = `${result}\nRUN echo '${process.env.DOCKER_SSH_ACCOUNT}' | chpasswd`;
  result = `${result}\nRUN sed -i '${process.env.DOCKER_SSH_CONFIG}' /etc/ssh/sshd_config`;

  result = `${result}\nRUN sed 's@session\s*required\s*pam_loginuid.so@session optional pam_loginuid.so@g' -i /etc/pam.d/sshd`;
  result = `${result}\nENV NOTVISIBLE "in users profile"`;
  result = `${result}\nRUN echo "export VISIBLE=now" >> /etc/profile`;
  result = `${result}\nEXPOSE 22`;
  result = `${result}\nCMD ["/usr/sbin/sshd", "-D"]`;

  console.log("dockerfile", result);
  return result;
};

const makeUbuntuTypeTerminalText = (terminalOption) => {
  let dockerText = `FROM ${terminalOption.OS[0]}:16.04`;
  dockerText = `${dockerText}\nRUN apt-get update -y && apt-get install -y apt apt-transport-https openssh-server ca-certificates wget`;

  let tmpText = "";

  if (terminalOption.DB.length !== 0) {
    terminalOption.DB.forEach((element) => {
      if (element === "mongo") {
        dockerText = `${dockerText}\nRUN wget -qO - https://www.mongodb.org/static/pgp/server-4.2.asc | apt-key add -`;
        dockerText = `${dockerText}\nRUN echo "deb [ arch=amd64 ] https://repo.mongodb.org/apt/ubuntu xenial/mongodb-org/4.2 multiverse"
         | tee /etc/apt/sources.list.d/mongodb-org-4.2.list`;
        tmpText = `${tmpText} mongodb-org`;
      }

      if (element === "mysql") {
        tmpText = `${tmpText} mysql-server`;
      }
    });
  }

  dockerText = `${dockerText}\nRUN apt-get update -y && DEBIAN_FRONTEND=noninteractive apt-get install -y ${tmpText}`;

  if (terminalOption.PL.length !== 0) {
    terminalOption.PL.forEach((element) => {
      dockerText = `${dockerText} ${element}`;
    });
  }
  return dockerText;
};

const makeCentosTypeTerminalText = (terminalOption) => {
  let dockerText = `FROM ${terminalOption.OS[0]}:7`;
  dockerText = `${dockerText}\nRUN yum update -y && yum install -y openssh-server`;

  terminalOption.DB.forEach((element) => {
    if (element === "mongo") {
      dockerText = `${dockerText} mongodb-org`;
    }

    if (element === "mysql") {
      dockerText = `${dockerText} mysql-community-server`;
    }
  });

  terminalOption.PL.forEach((element) => {
    dockerText = `${dockerText} ${element}`;
  });

  return dockerText;
};
// 같은 이름의 파일은 덮어 씀
const writeDockerfile = async (terminalOption) => {
  const text = parseTerminalOption(terminalOption);
  const data = new Uint8Array(Buffer.from(text));
  const result = await fs.writeFile(
    `${process.env.INIT_CWD}/dockerfiles/Dockerfile`,
    data
  );
  return result;
};

const makeDockerfile = async (text) => {
  try {
    await fs.open(
      // TODO 하드 코딩 경로 수정 할 것
      `${process.env.INIT_CWD}/dockerfiles/Dockerfile`,
      "wx"
    );
    const result = await writeDockerfile(text);
    return result;
  } catch (err) {
    if (err.code === "EEXIST") {
      console.error("myfile already exists");
      return;
    }
    throw err;
  }
};

module.exports = { writeDockerfile };
