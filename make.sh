#!/bin/sh

appname=openbookmarkintab

cp buildscript/makexpi.sh ./
./makexpi.sh $appname version=0
rm ./makexpi.sh

