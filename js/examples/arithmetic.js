const ARITHMETIC_EXAMPLE = `; Симулятор процессора на машине Тьюринга
; https://github.com/dronperminov/TuringCpu
; Пример работы с арифметическими операциями

MOV A, 127
MOV B, 0
ADD A, B ; 127
; 0 0 0 0

MOV A, -1
MOV B, 127
ADD A, B ; 126
; 0 0 0 1

MOV A, 0
MOV B, 0
ADD A, B ; 0
; 0 0 1 0

MOV A, -1
MOV B, 1
ADD A, B ; 0
; 0 0 1 1

MOV A, -1
MOV B, 0
ADD A, B ; -1
; 0 1 0 0

MOV A, -1
MOV B, -1
ADD A, B ; -2
; 0 1 0 1

MOV A, -1
MOV B, -128
ADD A, B ; 127
; 1 0 0 1

MOV A, -128
MOV B, -128
ADD A, B ; 0
; 1 0 1 1

MOV A, 127
MOV B, 127
ADD A, B ; -2
; 1 1 0 0


MOV A, -1
MOV B, -2
SUB A, B ; 1
; 0 0 0 0

MOV A, 126
MOV B, -1
SUB A, B ; 127
; 0 0 0 1

MOV A, -1
MOV B, -1
SUB A, B ; 0
; 0 0 1 0

MOV A, -1
MOV B, 127
SUB A, B ; -128
; 0 1 0 0

MOV A, -2
MOV B, -1
SUB A, B ; -1
; 0 1 0 1

MOV A, -2
MOV B, 127
SUB A, B ; 127
; 1 0 0 0

MOV A, 127
MOV B, -1
SUB A, B ; -128
; 1 1 0 1
`