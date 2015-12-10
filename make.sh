#!/bin/sh

appname=openbookmarkintab

cp makexpi/makexpi.sh ./
./makexpi.sh -n $appname -o
rm ./makexpi.sh

