#!/bin/sh -e
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

# set the path to the platform tools
PATH=$PATH:/home/$USER/Android/Sdk/platform-tools

ionic cordova run android --device "$@"
if [ $? -ne 0 ]; then
    echo "failed to run"
    exit 1
fi
