const ZERO_FLAG = "ZF"
const CARRY_FLAG = "CF"

const FLAG_NAMES = [ZERO_FLAG, CARRY_FLAG]
const REGISTER_NAMES = ["A", "B", "C", "D", "E", "F"]

const INC_CMD = "INC"
const DEC_CMD = "DEC"

const COMMANDS = [
    INC_CMD, DEC_CMD,
]

const HIGHTLIGHT_RULES = [
    {regex: /;.*/gi, name: "comment-code"},
    {regex: /\b(\d+d?|[01]+b|0b[01]+|0o[0-7]+|0x[\da-fA-F]+)\b/g, name: "number-code"},
    {regex: new RegExp(`\\b(${REGISTER_NAMES.join('|')})\\b`, "g"), name: "register-code"},
    {regex: new RegExp(`\\b(${COMMANDS.join('|')})\\b`, "gi"), name: "command-code"}
]
