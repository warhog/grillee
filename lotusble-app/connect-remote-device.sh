#!/bin/sh

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

