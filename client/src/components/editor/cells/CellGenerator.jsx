import React from "react";
import HeadingCell from "./Heading";
import TerminalCell from "./Terminal";
import QuoteCell from "./Quote";
import CodeCell from "./Code";
import ListCell from "./List";

const headingGenerator = (uuid) => <HeadingCell cellUuid={uuid} />;
const terminalGenerator = (uuid) => <TerminalCell cellUuid={uuid} />;
const quoteGenerator = (uuid) => <QuoteCell cellUuid={uuid} />;
const codeGenerator = (uuid) => <CodeCell cellUuid={uuid} />;

const unorderedListGenerator = (uuid) => (
  <ul>
    <ListCell cellUuid={uuid} />
  </ul>
);
const orderedListGenerator = (uuid, start) => (
  <ol start={start}>
    <ListCell cellUuid={uuid} />
  </ol>
);

const hrGenerator = (uuid) => (
  <hr cellUuid={uuid} noshade="noshade" style={{ borderColor: "silver" }} />
);

const cellGenerator = {
  h1: headingGenerator,
  h2: headingGenerator,
  h3: headingGenerator,
  h4: headingGenerator,
  h5: headingGenerator,
  h6: headingGenerator,

  terminal: terminalGenerator,

  blockquote: quoteGenerator,

  code: codeGenerator,

  ul: unorderedListGenerator,

  ol: orderedListGenerator,

  hr: hrGenerator,
};

export default cellGenerator;
