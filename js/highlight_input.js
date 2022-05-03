function HighlightInput(editableId, highlightId, rules) {
    this.editableBox = document.getElementById(editableId)
    this.highlightBox = document.getElementById(highlightId)
    this.rules = rules
    this.tabSpaces = '    '

    this.editableBox.addEventListener('input', () => this.Highlight())
    this.editableBox.addEventListener('cnahge', () => this.Highlight())
    this.editableBox.addEventListener('keydown', (e) => this.KeyDown(e))

    this.Highlight()
}

// TODO: shift lines
HighlightInput.prototype.InsertTab = function() {
    let start = this.editableBox.selectionStart
    let end = this.editableBox.selectionEnd

    let text = this.GetText()
    let before = text.substr(0, start)
    let after = text.substr(end)

    this.SetText(`${before}${this.tabSpaces}${after}`)
    this.editableBox.selectionStart = start + this.tabSpaces.length
    this.editableBox.selectionEnd = start + this.tabSpaces.length
}

HighlightInput.prototype.GetLastLineSpaces = function(text) {
    let spaces = ''

    for (let begin = text.lastIndexOf('\n'); text[begin + 1] == ' '; begin++)
        spaces += ' '

    return spaces
}

HighlightInput.prototype.InsertEnter = function() {
    let start = this.editableBox.selectionStart
    let end = this.editableBox.selectionEnd

    let text = this.GetText()
    let before = text.substr(0, start)
    let after = text.substr(end)
    let spaces = this.GetLastLineSpaces(before)

    this.SetText(`${before}\n${spaces}${after}`)
    this.editableBox.selectionStart = start + 1 + spaces.length
    this.editableBox.selectionEnd = start + 1 + spaces.length
}

// TODO: history, backspace
HighlightInput.prototype.KeyDown = function(e) {
    if (e.key === 'Enter') {
        this.InsertEnter()
        e.preventDefault()
    }
    else if (e.key == 'Tab') {
        this.InsertTab()
        e.preventDefault()
    }

    this.Highlight()
}

HighlightInput.prototype.SpanLine = function(line, rules) {
    let intervals = []

    for (let rule of rules) {
        for (let match of line.matchAll(rule.regex)) {
            let start = match.index
            let end = start + match[0].length
            intervals.push({start: start, end: end, len: end - start, name: rule.name})
        }
    }

    intervals.sort((a, b) => a.start - b.start)

    let prev = null
    let filtered = []

    for (let interval of intervals) {
        if (prev && interval.start < prev.end)
            continue

        filtered.push(interval)
        prev = interval
    }

    filtered.sort((a, b) => b.start - a.start)

    for (let interval of filtered) {
        let before = line.substr(0, interval.start)
        let inside = line.substr(interval.start, interval.len)
        let after = line.substr(interval.end)
        line = `${before}<span class="${interval.name}">${inside}</span>${after}`
    }

    return line
}

HighlightInput.prototype.IsWhiteSpace = function(line) {
    return line.match(/^\s*$/gi) != null
}

HighlightInput.prototype.Highlight = function() {
    let lines = this.GetTextLines()
    this.highlightBox.innerHTML = ''

    for (let i = 0; i < lines.length; i++) {
        let line = this.SpanLine(lines[i], this.rules)

        let div = document.createElement('div')
        div.className = 'code-line'
        div.id = `code-line-${i}`
        div.innerHTML = this.IsWhiteSpace(lines[i]) ? '<br>' : line

        this.highlightBox.appendChild(div)
    }
}

HighlightInput.prototype.GetTextLines = function() {
    return this.editableBox.value.split('\n')
}

HighlightInput.prototype.GetText = function() {
    return this.editableBox.value
}

HighlightInput.prototype.SetText = function(text) {
    this.editableBox.value = text
    this.Highlight()
}