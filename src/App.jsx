/* eslint-disable react/prop-types */
import { useState, useCallback } from "react"
import { createEditor, Transforms, Element, Editor } from "slate"
import { Slate, Editable, withReact } from "slate-react"

const initialValue = [
  {
    type: "paragraph",
    children: [{ text: "A line of text in a paragraph." }],
  },
]

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

const App = () => {
  const [editor] = useState(() => withReact(createEditor()))

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
    <Slate editor={editor} initialValue={initialValue}>
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
            // Determine whether any of the currently selected blocks are code blocks.
            const [match] = Editor.nodes(editor, {
              match: (n) => n.type === "code",
            })
            // Toggle the block type depending on whether there's already a match.
            Transforms.setNodes(
              editor,
              { type: match ? "paragraph" : "code" },
              { match: (n) => Element.isElement(n) && Editor.isBlock(editor, n) }
            )
          }

          if (event.key === "b" && event.ctrlKey) {
            event.preventDefault()
            Editor.addMark(editor, "bold", true)
          }
        }}
      />
    </Slate>
  )
}

export default App
