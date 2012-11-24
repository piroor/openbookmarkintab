#!/bin/sh

appname=openbookmarkintab

cp buildscript/makexpi.sh ./
./makexpi.sh -n $appname
rm ./makexpi.sh

