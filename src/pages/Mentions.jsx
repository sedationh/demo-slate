import { useState } from "react"
import { Range, createEditor, Editor } from "slate"
import { withReact, Slate, Editable } from "slate-react"
import { CHARACTERS } from "../mock/mentions"

const initialValue = [
  {
    type: "paragraph",
    children: [{ text: "A line of text in a paragraph." }],
  },
]

const Mentions = () => {
  const [editor] = useState(() => withReact(createEditor()))
  const [target, setTarget] = useState()
  const [index, setIndex] = useState(0)
  const [search, setSearch] = useState("")

  const chars = CHARACTERS.filter((c) => c.toLowerCase().startsWith(search.toLowerCase())).slice(0, 10)

  return (
    <Slate
      editor={editor}
      initialValue={initialValue}
      onChange={() => {
        const { selection } = editor
        const [start] = Range.edges(selection)
        const wordBefore = Editor.before(editor, start, { unit: "word" })
        const before = wordBefore && Editor.before(editor, wordBefore)
        const beforeRange = before && Editor.range(editor, before, start)
        const beforeText = beforeRange && Editor.string(editor, beforeRange)
        const beforeMatch = beforeText && beforeText.match(/^@(\w+)$/)
        const after = Editor.after(editor, start)
        const afterRange = Editor.range(editor, start, after)
        const afterText = Editor.string(editor, afterRange)
        const afterMatch = afterText.match(/^(\s|$)/)

        if (beforeMatch && afterMatch) {
          setTarget(beforeRange)
          setSearch(beforeMatch[1])
          setIndex(0)
          return
        }
      }}
    >
      <Editable onKeyDown={(event) => {}} />
    </Slate>
  )
}

export default Mentions
