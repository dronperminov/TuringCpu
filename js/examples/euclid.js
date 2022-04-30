const EUCLID_EXAMPLE = `; Симулятор процессора на машине Тьюринга
; https://github.com/dronperminov/TuringCpu
; Пример вычисления НОД двух чисел по алгоритму Евклида

JMP start

Euclid:
    CMP A, B  ; сравниваем числа
    JE end    ; если числа равны, НОД найден
    JA else
    SUB B, A  ; если A < B, то B = B - A
    JMP Euclid
else:
    SUB A, B  ; иначе A = A - B
    JMP Euclid
    

start:
    MOV A, 96; первое число
    MOV B, 54; второе число
    JMP Euclid
end:
    XOR B, A`
