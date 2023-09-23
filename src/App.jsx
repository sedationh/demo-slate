/* eslint-disable react/prop-types */
import { useState, useCallback, useMemo } from "react"
import { createEditor, Transforms, Editor, Element } from "slate"
import { Slate, Editable, withReact } from "slate-react"

const CodeElement = (props) => {
  return (
    <pre {...props.attributes}>
      <code>{props.children}</code>
    </pre>
  )
}

const DefaultElement = (props) => {
  return <p {...props.attributes}>{props.children}</p>
}

const Leaf = (props) => {
  return (
    <span {...props.attributes} style={{ fontWeight: props.leaf.bold ? "bold" : "normal" }}>
      {props.children}
    </span>
  )
}

const CustomEditor = {
  isBoldMarkActive(editor) {
    const marks = Editor.marks(editor)
    return marks ? marks.bold === true : false
  },

  isCodeBlockActive(editor) {
    const [match] = Editor.nodes(editor, {
      match: (n) => n.type === "code",
    })

    return !!match
  },

  toggleBoldMark(editor) {
    const isActive = CustomEditor.isBoldMarkActive(editor)
    if (isActive) {
      Editor.removeMark(editor, "bold")
    } else {
      Editor.addMark(editor, "bold", true)
    }
  },

  toggleCodeBlock(editor) {
    const isActive = CustomEditor.isCodeBlockActive(editor)
    // Toggle the block type depending on whether there's already a match.
    Transforms.setNodes(
      editor,
      { type: isActive ? "paragraph" : "code" },
      { match: (n) => Element.isElement(n) && Editor.isBlock(editor, n) }
    )
  },
}

const App = () => {
  const [editor] = useState(() => withReact(createEditor()))

  const initialValue = useMemo(
    () =>
      JSON.parse(localStorage.getItem("content")) || [
        {
          type: "paragraph",
          children: [{ text: "A line of text in a paragraph." }],
        },
      ],
    []
  )

  const renderElement = useCallback((props) => {
    switch (props.element.type) {
      case "code":
        return <CodeElement {...props} />
      default:
        return <DefaultElement {...props} />
    }
  }, [])

  return (
    // Add the editable component inside the context.
    <Slate
      editor={editor}
      initialValue={initialValue}
      onChange={(value) => {
        const isAstChange = editor.operations.some((op) => "set_selection" !== op.type)
        if (isAstChange) {
          // Save the value to Local Storage.
          const content = JSON.stringify(value)
          localStorage.setItem("content", content)
        }
      }}
    >
      <Editable
        renderElement={renderElement}
        renderLeaf={Leaf}
        onKeyDown={(event) => {
          if (event.key === "&") {
            event.preventDefault()
            editor.insertText("and")
          }

          if (event.key === "`" && event.ctrlKey) {
            event.preventDefault()

            CustomEditor.toggleCodeBlock(editor)
          }

          if (event.key === "b" && event.ctrlKey) {
            event.preventDefault()
            CustomEditor.toggleBoldMark(editor)
          }
        }}
      />
    </Slate>
  )
}

export default App
