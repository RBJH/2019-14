import React, { useContext, useEffect } from "react";
import styled from "styled-components";
import propTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFileMedical,
  faFileDownload,
  faFileUpload,
  faFileImport,
  faFileExport,
  faTerminal,
} from "@fortawesome/free-solid-svg-icons";
import { terminalSettingActionCreator } from "../../../actions/TerminalSetting";
import { TerminalSettingDispatch } from "../../../stores/TerminalSetting";
import { CellDispatchContext, CellContext } from "../../../stores/CellStore";
import { THEME } from "../../../enums";
import { cellActionCreator } from "../../../actions/CellAction";
import { request, utils } from "../../../utils";

const BUTTON_TYPE = {
  NEW: faFileMedical,
  SAVE: faFileDownload,
  LOAD: faFileUpload,
  SHARE: faFileExport,
  S_LOAD: faFileImport,
  TERMINAL: faTerminal,
};

const share = async () => {
  const data = {
    userId: "boost",
    containerId: 9,
  };
  const result = await request.do("SHARE", "POST", data);
  if (!result.ok) {
    return false;
  }

  const shareId = await result.text();
  localStorage.setItem("sharedDocumentId", shareId);
  return shareId;
};

const BUTTON_HANDLER = {
  NEW: () => {},
  SAVE: (cellDispatch) => {
    cellDispatch(cellActionCreator.save());
  },
  LOAD: (cellDispatch, cellManager) => {
    const loadDocument = async () => {
      const result = await request.do("LOAD");
      const doc = await result.text();
      cellManager.load(doc);
      cellDispatch(cellActionCreator.loadFinish());
    };
    cellDispatch(cellActionCreator.load());
    loadDocument();
  },
  SHARE: () => {
    let shareId = null;
    const shareDocument = async () => {
      shareId = await share();
      utils.copyText(shareId);
    };

    shareId = localStorage.getItem("sharedDocumentId");
    if (shareId) {
      utils.copyText(shareId);
    } else {
      shareDocument();
    }
  },
  S_LOAD: (cellDispatch, cellManager) => {
    const loadDocument = async (shareId) => {
      const result = await request.do("SHARE", "GET", null, shareId);
      const doc = await result.text();
      if (doc) {
        cellManager.load(doc);
      }
      cellDispatch(cellActionCreator.shareLoadFinish());
    };
    const shareId = prompt(
      "공유 문서의 ID를 입력하세요.",
      "Input a Document ID"
    );
    if (shareId) {
      cellDispatch(cellActionCreator.shareLoad());
      loadDocument(shareId);
    }
  },
  TERMINAL: (tmp, temp, terminalDispatch) => {
    terminalDispatch(terminalSettingActionCreator.viewTerminalSetting());
  },
};

const ToolBarButtonWrapper = styled.button`
  margin: 0 0.5rem;
  width: 2rem;
  height: 3rem;
  font-size: 1.5rem;
  background: transparent;
  border: transparent;
  cursor: pointer;
  color: ${THEME.VS_CODE.FONT};

  div {
    font-size: 0.4rem;
  }

  margin-left: ${({ isTerminal }) => isTerminal && "auto"};
`;

const ToolBarButton = ({ buttonType }) => {
  const isTerminal = buttonType === "TERMINAL";
  const cellDispatch = useContext(CellDispatchContext);
  const terminalDispatch = useContext(TerminalSettingDispatch);
  const { state } = useContext(CellContext);
  const { cellManager, isShared } = state;

  const onClick = () => {
    BUTTON_HANDLER[buttonType](cellDispatch, cellManager, terminalDispatch);
  };

  useEffect(() => {
    if (isShared) {
      console.log(localStorage.getItem("sharedDocumentId"));
    }
  }, [isShared]);

  return (
    <ToolBarButtonWrapper isTerminal={isTerminal}>
      {/* {isShared && <Redirect to="/share" />} */}
      <FontAwesomeIcon icon={BUTTON_TYPE[buttonType]} onClick={onClick} />
      <div>{buttonType}</div>
    </ToolBarButtonWrapper>
  );
};

ToolBarButton.propTypes = {
  buttonType: propTypes.string.isRequired,
};

export { ToolBarButton, BUTTON_TYPE };
