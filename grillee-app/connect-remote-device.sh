#!/bin/sh
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

IP_ADDRESS=$1

if [ -z "${IP_ADDRESS}" ]; then
    echo "give ip address"
    exit 1
fi

# set the path to the platform tools
PATH=$PATH:/home/$USER/Android/Sdk/platform-tools

adb tcpip 5555
adb connect ${IP_ADDRESS}:5555
adb devices

