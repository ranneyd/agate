@echo off
cd ./tests
for %%f in (*.agate) do (
    node ../agate.js "%%~nf.agate" > "%%~nf.stupid"
    perl ../json-destupidizer.pl "%%~nf.stupid" > "%%~nf.json"
    del "%%~nf.stupid"
)
