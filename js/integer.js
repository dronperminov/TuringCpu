function Integer(base = 10000) {
    this.digits = [0]
    this.sign = ''
    this.base = base
    this.baseCount = this.GetDigitCount(base)
}

Integer.prototype.GetDigitCount = function(digit) {
    let count = 0

    for (; digit > 9; digit = Math.floor(digit / 10))
        count += 1

    return count
}

Integer.prototype.ToString = function() {
    let digits = this.sign

    for (i = this.digits.length - 1; i >= 0; i--) {
        let digit = this.digits[i]

        if (i < this.digits.length - 1) {
            let zerosCount = this.baseCount - this.GetDigitCount(digit) - 1
            let zeros = Array(zerosCount).fill('0')
            digit += zeros.join('')
        }
        
        digits += digit
    }

    return digits
}

Integer.prototype.Normalize = function() {
    let carry = 0

    for (let i = 0; i < this.digits.length; i++) {
        let digit = this.digits[i] + carry
        this.digits[i] = digit % this.base
        carry = Math.floor(digit / this.base)
    }

    if (carry > 0)
        this.digits.push(carry)
}

Integer.prototype.Increment = function() {
    this.digits[0] += 1
    this.Normalize()
    return this
}

Integer.prototype.Double = function() {
    for (let i = 0; i < this.digits.length; i++)
        this.digits[i] *= 2

    this.Normalize()
}

Integer.prototype.Parse = function(value, incrementDigit = '1') {
    this.digits = [0]

    for (let c of value) {
        this.Double()

        if (c == incrementDigit)
            this.Increment()
    }

    return this
}

Integer.prototype.ParseSigned = function(value) {
    if (value.startsWith('1')) {
        this.sign = '-'
        this.Parse(value.substr(1), '0')
        this.Increment()
    }
    else {
        this.sign = ''
        this.Parse(value.substr(1), '1')
    }

    return this
}
