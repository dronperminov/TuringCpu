function Tape() {
    this.Clear()
}

Tape.prototype.SetChar = function(c) {
    this.SetCharAt(this.index, c)
}

Tape.prototype.SetCharAt = function(index, c) {
    if (index >= 0) {
        this.positive[index] = c
    }
    else {
        this.negative[1 - index] = c
    }
}

Tape.prototype.Move = function(direction) {
    if (direction == MOVE_LEFT) {
        this.index--
    }
    else if (direction == MOVE_RIGHT) {
        this.index++
    }
    else if (direction != MOVE_NONE) {
        throw `Invalid move direction ${direction}`
    }
}

Tape.prototype.GetChar = function() {
    return this.GetCharAt(this.index)
}

Tape.prototype.GetCharAt = function(index) {
    if (index >= 0)
        return index < this.positive.length ? this.positive[index] : LAMBDA

    return 1 - index < this.negative.length ? this.negative[1 - index] : LAMBDA
}

Tape.prototype.SetWord = function(word) {
    this.negative = []
    this.positive = []
    this.index = 0

    for (let i = 0; i < word.length; i++)
        this.positive.push(word[i])

    this.positive.push(LAMBDA)
}

Tape.prototype.GetWord = function(endChar = LAMBDA) {
    let word = []

    for (let index = this.index; true; index++) {
        let c = this.GetCharAt(index)

        if (c == endChar || c == LAMBDA)
            return word.join('')

        word.push(c)
    }
}

Tape.prototype.WriteWord = function(word, dir = 1) {
    for (let i = 0; i < word.length; i++) {
        this.SetCharAt(this.index + i * dir, word[dir == 1 ? i : word.length - 1 - i])
    }
}

Tape.prototype.Clear = function() {
    this.negative = []
    this.positive = [LAMBDA]
    this.index = 0
}

Tape.prototype.GetBorders = function() {
    let left = this.positive.length
    let right = 1 - this.negative.length
    let haveChars = false

    for (let i = -this.negative.length; i < this.positive.length; i++) {
        if (this.GetCharAt(i) != LAMBDA) {
            left = Math.min(left, i)
            right = Math.max(right, i)
            haveChars = true
        }
    }

    return haveChars ? {left: left, right: right} : {left: this.index, right: this.index }
}
