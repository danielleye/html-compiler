const node = []
let i = 0 
let closeNodes = []
document.querySelector('.add-btn').addEventListener('click',()=>{
    const str = document.querySelector('.user-input').value
    const userInput = str.split(/\n/).filter(n => n.length > 0)
    const nodes = []
    let numOfTabs = 0

    const countTabsInLine = (text) => {
        var count = 0
        var index = 0
        while (text.charAt(index++) === "\t") {
            count++
        }
        return count
    }

    const extractTag = line => {
        return line.replace(/\(.+\)/, '')
    }

    const extractAttrs = line => {
        const value = line.match(/\((.+)\)/)
        if (value) {
            const str = value[1]

            if (/\,\s/.test(str) || /\:/.test(str)) {
                const attrs = str.split(', ')
                const attributes = {}
                attrs.forEach(attr => {
                    const [key, value] = attr.split(':')
                    attributes[key] = value
                })
                return {
                    attrs: attributes
                }
            } else {
                return {
                    textContent: str
                }
            }
        }
    }

    userInput.forEach((line, i) => {
        const l = line.trim()
        const tabCount = countTabsInLine(line)
        numOfTabs = tabCount > numOfTabs ? numOfTabs + tabCount : tabCount
        if (tabCount === 0) numOfTabs = 0
        nodes.push({
            id: i + 1,
            parent: numOfTabs,
            tag: extractTag(l),
            ...extractAttrs(l)
        })
    })
    console.log(nodes)

    const extractTextAttrs = ast => {
        return ast.textContent
    }

    const extractImgAttrs = ast => {
        return `src="${ast.attrs.src}" alt="${ast.attrs.alt}"`
    }

    const AstParser = (ast) => {
        for(const [key, value] of Object.entries(ast)) {
            if (key === 'tag') {
                if (ast.children) {
                    node.push(`<${value}>`)
                    closeNodes.unshift(`</${value}>`)
                } else {
                    if (value === 'img') {
                        node.push(`<${value} ${extractImgAttrs(ast)}>`)
                    } else {
                        node.push(`<${value}>${extractTextAttrs(ast)}</${value}>`)
                    }
                }
            }
            if(key === 'children') {
                ++i
                for (const n of value) {
                    AstParser(n)
                }
            }
        }
        return [...node, ...closeNodes].join('')
    }

    function generateHTMLObject(a, parent = 0) {
        const ast = []
        for (let i in a) {
            if (a[i].parent == parent) {
                let children = generateHTMLObject(a, a[i].id)

                if (children.length) {
                    a[i].children = children
                }

                delete a[i].id
                delete a[i].parent

                ast.push(a[i])
            }
        }
        return ast
    }

    const htmlTmpl = AstParser(generateHTMLObject(nodes)[0])
    document.querySelector('.results').innerText = htmlTmpl
    document.querySelector('.display-area').innerHTML = htmlTmpl
})

document.querySelector('.user-input').addEventListener('keydown', function(e) {
    if (e.key == 'Tab') {
      e.preventDefault()
      var start = this.selectionStart
      var end = this.selectionEnd
  
      // set textarea value to: text before caret + tab + text after caret
      this.value = this.value.substring(0, start) +
        "\t" + this.value.substring(end)
  
      // put caret at right position again
      this.selectionStart =
        this.selectionEnd = start + 1
    }
})