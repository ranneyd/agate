@echo off

for %%f in (.\tests\*.agate) do (
    echo %%f
    node agate.js -t -p %%f
    echo "-------------------------------------------------------------"
)