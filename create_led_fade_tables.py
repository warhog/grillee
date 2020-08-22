#!/usr/bin/python
import math

def calc(steps, resolution):
    values = []
    for step in range(steps):
        value = pow(2, math.log2(resolution - 1) * (step + 1) / steps)
        values.append(int(value))
    return values

def main():
    steps = 4096
    values = calc(steps, 4096)
    counter = 0
    output = 'const uint16_t pwmtable[{}] = {{\n'.format(len(values))

    line_length = 32
    while True:
        val = values[counter:counter + line_length]
        if len(val) == 0:
            break
        output += '\t'
        output += ', '.join(map(str, val))
        output += ',\n'
        counter += line_length
    output += '};'
    print(output)

if __name__ == '__main__':
    main()
