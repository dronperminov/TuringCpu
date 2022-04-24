const ZERO_FLAG = "ZF"
const CARRY_FLAG = "CF"

const FLAG_NAMES = [ZERO_FLAG, CARRY_FLAG]
const REGISTER_NAMES = ["A", "B", "C", "D", "E", "F"]

const REGISTER_TYPE = 'reg'
const CONSTANT_TYPE = 'const'
const ADDRESS_TYPE = 'address'
const LABEL_TYPE = 'label'
const UNKNOWN_TYPE = 'unknown'

const LABEL_COMMAND = 'label'
const OTHER_COMMAND = 'other'


const ARITHMETIC_ARGS = [
    [REGISTER_TYPE, REGISTER_TYPE],
    [REGISTER_TYPE, CONSTANT_TYPE],
    [REGISTER_TYPE, ADDRESS_TYPE]
]

const MOV_ARGS = [
    [REGISTER_TYPE, REGISTER_TYPE],
    [REGISTER_TYPE, CONSTANT_TYPE],
    [REGISTER_TYPE, ADDRESS_TYPE],
    [ADDRESS_TYPE, REGISTER_TYPE],
    [ADDRESS_TYPE, CONSTANT_TYPE]
]

const MOV_CMD = { name: "MOV", args: 2, argTypes: MOV_ARGS }

const PUSH_CMD = { name: "PUSH", args: 1, argTypes: [[REGISTER_TYPE], [CONSTANT_TYPE], [ADDRESS_TYPE]] }
const POP_CMD = { name: "POP", args: 1, argTypes: [[REGISTER_TYPE]] }

const INC_CMD = { name: "INC", args: 1, argTypes: [[REGISTER_TYPE]] }
const DEC_CMD = { name: "DEC", args: 1, argTypes: [[REGISTER_TYPE]] }

const ADD_CMD = { name: "ADD", args: 2, argTypes: ARITHMETIC_ARGS }
const SUB_CMD = { name: "SUB", args: 2, argTypes: ARITHMETIC_ARGS }
const MUL_CMD = { name: "MUL", args: 2, argTypes: ARITHMETIC_ARGS }
const CMP_CMD = { name: "CMP", args: 2, argTypes: ARITHMETIC_ARGS }

const AND_CMD = { name: "AND", args: 2, argTypes: ARITHMETIC_ARGS }
const OR_CMD = { name: "OR", args: 2, argTypes: ARITHMETIC_ARGS }
const XOR_CMD = { name: "XOR", args: 2, argTypes: ARITHMETIC_ARGS }
const NOT_CMD = { name: "NOT", args: 1, argTypes: [[REGISTER_TYPE]] }
const SHL_CMD = { name: "SHL", args: 2, argTypes: ARITHMETIC_ARGS }
const SHR_CMD = { name: "SHR", args: 2, argTypes: ARITHMETIC_ARGS }

const JMP_CMD = {name: 'JMP', args: 1, argTypes: [[LABEL_TYPE]] }

const JZ_CMD = {name: 'JZ', args: 1, argTypes: [[LABEL_TYPE]] }
const JNZ_CMD = {name: 'JNZ', args: 1, argTypes: [[LABEL_TYPE]] }

const JC_CMD = {name: 'JC', args: 1, argTypes: [[LABEL_TYPE]] }
const JNC_CMD = {name: 'JNC', args: 1, argTypes: [[LABEL_TYPE]] }

const JA_CMD = {name: 'JA', args: 1, argTypes: [[LABEL_TYPE]] }
const JAE_CMD = {name: 'JAE', args: 1, argTypes: [[LABEL_TYPE]] }
const JB_CMD = {name: 'JB', args: 1, argTypes: [[LABEL_TYPE]] }
const JBE_CMD = {name: 'JBE', args: 1, argTypes: [[LABEL_TYPE]] }
const JE_CMD = {name: 'JE', args: 1, argTypes: [[LABEL_TYPE]] }
const JNE_CMD = {name: 'JNE', args: 1, argTypes: [[LABEL_TYPE]] }

const JNA_CMD = {name: 'JNA', args: 1, argTypes: [[LABEL_TYPE]] }
const JNAE_CMD = {name: 'JNAE', args: 1, argTypes: [[LABEL_TYPE]] }
const JNB_CMD = {name: 'JNB', args: 1, argTypes: [[LABEL_TYPE]] }
const JNBE_CMD = {name: 'JNBE', args: 1, argTypes: [[LABEL_TYPE]] }

const COMMANDS = [
    MOV_CMD,
    PUSH_CMD, POP_CMD,

    INC_CMD, DEC_CMD,
    ADD_CMD, SUB_CMD, MUL_CMD, CMP_CMD,
    AND_CMD, OR_CMD, XOR_CMD, NOT_CMD, SHL_CMD, SHR_CMD,

    JMP_CMD,
    JZ_CMD, JNZ_CMD,
    JC_CMD, JNC_CMD,
    JA_CMD, JAE_CMD, JB_CMD, JBE_CMD, JE_CMD, JNE_CMD,
    JNA_CMD, JNAE_CMD, JNB_CMD, JNBE_CMD
]

const CONSTANT_REGEXP = "\\b(\\d+d?|[01]+b|0b[01]+|0o[0-7]+|0x[\\da-fA-F]+)\\b"
const LABEL_REGEXP = "[.a-zA-Z]\\w*"

const HIGHTLIGHT_RULES = [
    {regex: /;.*/gi, name: "comment-code"},
    {regex: new RegExp(`^ *${LABEL_REGEXP}:`, "gi"), name: "label-code"},
    {regex: new RegExp(CONSTANT_REGEXP, "g"), name: "number-code"},
    {regex: new RegExp(`\\b(${REGISTER_NAMES.join('|')})\\b`, "g"), name: "register-code"},
    {regex: new RegExp(`\\b(${COMMANDS.map((cmd) => cmd.name).join('|')})\\b`, "gi"), name: "command-code"}
]

function IsRegister(arg) {
    return REGISTER_NAMES.indexOf(arg) > -1
}

function IsConstant(arg) {
    return arg.match(new RegExp(`^${CONSTANT_REGEXP}$`, "g")) != null
}

function IsAddress(arg) {
    if (!arg.startsWith('[') || !arg.endsWith(']'))
        return false

    arg = arg.substr(1, arg.length - 2)
    return IsRegister(arg) || IsConstant(arg)
}

function IsLabel(arg) {
    return arg.match(new RegExp(`^${LABEL_REGEXP}$`, "g")) != null
}

function GetArgType(arg) {
    if (IsRegister(arg))
        return REGISTER_TYPE

    if (IsConstant(arg))
        return CONSTANT_TYPE

    if (IsAddress(arg))
        return ADDRESS_TYPE

    return UNKNOWN_TYPE
}

const MOVE_LEFT = "L"
const MOVE_NONE = "N"
const MOVE_RIGHT = "R"
const LAMBDA = ' '
const HALT = "!"
const HALT_OVERFLOW = "!C"

const TAPE_CELL_SIZE = 40
const LAMBDA_CELL = 'λ'
const LEFT_CELL = '‹'
const RIGHT_CELL = '›'

const BEGIN_CHAR = '^'
const ALU_CHAR = '%'
const MEMORY_CHAR = 'm'
const STACK_CHAR = 's'

const TURING_ALPHABET = [
    LAMBDA,
    '0', '1',
    'O', 'I', '#',
    BEGIN_CHAR,
    ALU_CHAR,
    MEMORY_CHAR,
    STACK_CHAR,
    ...REGISTER_NAMES
]

const TURING_STATES = [
    {name: "MEMORY-RUN",        transitions: {'0': 'R', '1': 'R', 'I': 'I,L,MEMORY-MOVE'}},
    {name: "MEMORY-MOVE",       transitions: {'0': '1,L,MEMORY-MOVE-dec', '1': '0,R,MEMORY-MOVE-mark'}},
    {name: "MEMORY-MOVE-mark",  transitions: {'0': "R", '1': "R", '#': 'O,L,MEMORY-MOVE-begin', 'I': "R", 'O': "R", ' ': "R"}},
    {name: "MEMORY-MOVE-begin", transitions: {'0': "L", '1': "L", '#': "L", 'I': 'I,L,MEMORY-MOVE', 'O': "L", ' ': "L"}},
    {name: "MEMORY-MOVE-dec",   transitions: {'0': '1,L,MEMORY-MOVE-dec', '1': '0,R,MEMORY-MOVE-mark', 'm': `${MEMORY_CHAR},R,MEMORY-MOVE-shift`}},
    {name: "MEMORY-MOVE-shift", transitions: {'0': ',R,MEMORY-MOVE-shift', '1': ',R,MEMORY-MOVE-shift', 'I': ',R,MEMORY-MOVE-find'}},
    {name: "MEMORY-MOVE-find",  transitions: {'0': "R", '1': "R", ' ': "R", '#': `#,R,${HALT}`, 'O': '#,R,MEMORY-MOVE-find'}},

    {name: 'POP-init', transitions: {'0': "R", '1': "R", '#': "R", ' ': ',L,POP-#'}},
    {name: 'POP-#', transitions: {'0': "L", '1': "L", '#': `#,R,${HALT}`, 's': `s,R,${HALT}`}},
    {name: 'POP',        transitions: {'0': '0,N,POP-clear', '1': '1,N,POP-clear', ' ': `,N,${HALT}`}},
    {name: 'POP-clear',  transitions: {'0': ',R,POP-clear', '1': ',R,POP-clear', ' ': ',L,POP-move'}},
    {name: 'POP-move',   transitions: {'#': `,L,POP-begin`, ' ': 'L'}},
    {name: 'POP-begin',  transitions: {'0': 'L', '1': 'L', '#': `#,R,${HALT}`, 's': `${HALT}`}},

    {name: 'PUSH', transitions: {'0': 'R', '1': 'R', '#': 'R', ' ': `#,R,${HALT}`}},

    {name: "move-begin", transitions: {'0': 'L',   '1': 'L',   '%': `%,R,${HALT}`}},
    {name: "INC",   transitions: {'0': 'R',              '1': 'R',      ' ': `,L,INC-1`}},
    {name: "INC-1", transitions: {'0': '1,N,move-begin', '1': '0,L,',   '%': `%,R,${HALT_OVERFLOW}`}},

    {name: "DEC",   transitions: {'0': 'R',              '1': 'R',           ' ': `,L,DEC-1`}},
    {name: "DEC-1", transitions: {'0': '1,L,DEC-1', '1': '0,N,move-begin',   '%': `%,R,${HALT_OVERFLOW}`}},

]
