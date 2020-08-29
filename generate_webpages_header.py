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
import os
filedata = {}

def open_file_and_convert(filename):
    print('read file {}'.format(filename))
    file = os.path.splitext(os.path.basename(filename))[0]

    with open (filename, 'r') as myfile:
        data = myfile.read()

    filedata[file] = data


open_file_and_convert('html/header.html')
open_file_and_convert('html/footer.html')
open_file_and_convert('html/index.html')
open_file_and_convert('html/wifi.html')

data = ''
print('generate header file')
for file in filedata:
    data = data + '\nconstexpr static char const *{} = R"(\n{})";\n'.format(file, filedata[file])

data = '/**\n* Copyright (C) 2020 warhog <warhog@gmx.de>\n* \n* This program is free software: you can redistribute it and/or modify\n* it under the terms of the GNU General Public License as published by\n* the Free Software Foundation, either version 3 of the License, or\n* (at your option) any later version.\n* \n* This program is distributed in the hope that it will be useful,\n* but WITHOUT ANY WARRANTY; without even the implied warranty of\n* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the\n* GNU General Public License for more details.\n* \n* You should have received a copy of the GNU General Public License\n* along with this program.  If not, see <https://www.gnu.org/licenses/>.\n**/\n#pragma once\nnamespace comm {{\nclass WifiWebServerFiles {{\n\npublic:{}\n}};\n}}'.format(data)

with open("webui-generated.h", "w") as header:
    print(data, file=header)

print('done')