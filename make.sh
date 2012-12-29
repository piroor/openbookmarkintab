#!/bin/sh

appname=openbookmarkintab

cp buildscript/makexpi.sh ./
./makexpi.sh -n $appname -o
rm ./makexpi.sh

