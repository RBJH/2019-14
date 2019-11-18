import React, { useContext } from "react";
import {
  EditorStore,
  EditorContext,
  EditorDispatchContext,
} from "../stores/EditorStore.jsx";
import { editorActionCreator } from "../actions/EditorAction";
import { MarkdownTransformer } from "../components/editor/MarkdownRenderer";
import EditorHeader from "../components/editor/EditorHeader.jsx";

const AComponent = () => {
  const dispatch = useContext(EditorDispatchContext);

  const inputHandler = e => {
    const data = e.target.value;
    dispatch(editorActionCreator.update(data));
  };

  return <input type="text" onInput={inputHandler} />;
};

const BComponent = () => {
  const { state } = useContext(EditorContext);
  return (
    <>
      <input type="button" value={state.data} />
    </>
  );
};

const TestComponent = () => {
  return (
    <>
      <AComponent />
      <BComponent />
    </>
  );
};

const EditorPage = () => {
  return (
    <>
      <EditorStore>
        <EditorHeader />
        <MarkdownTransformer />
      </EditorStore>
    </>
  );
};

export default EditorPage;
