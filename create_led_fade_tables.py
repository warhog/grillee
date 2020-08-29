#!/usr/bin/python3
# Copyright (C) 2020 warhog <warhog@gmx.de>
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program.  If not, see <https://www.gnu.org/licenses/>.
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
