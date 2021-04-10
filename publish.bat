@echo off
npm version patch && ^
cd "%cd%\projects\ng-lock" && ^
npm version patch && ^
cd "%cd%" && ^
npm run build ng-lock --prod && ^
copy /y "%cd%\README.md" "%cd%\dist\ng-lock\README.md" && ^
copy /y "%cd%\LICENSE" "%cd%\dist\ng-lock\LICENSE" && ^
cd "%cd%\dist\ng-lock" && ^
npm publish --ignore-scripts && ^
cd "%cd%"
pause