[что здесь]
Karma + Jasmine

[how to install]
https://taco.visualstudio.com/en-us/docs/unit-test-03-basic-testing/

[site]
http://karma-runner.github.io/0.8/index.html

[karma + webpack]
http://www.thinksincode.com/2016/07/07/karma-jasmine-webpack.html

[run on windows]
Пример генерации карма-конфига:
D:\projects\angular-starter\node_modules\.bin\karma init

[package.json]
можно добавить шорткат в раздел scripts 

[usage]
Перейти в папку тестов и запустить karma init - образуется файл specs\karma.conf.js.example
Запуск тестов:
karma start --single-run

[!]
При установке карма создала в корне проекта папку src

[нуждается в проверке]
Чтобы тесты не прогонялись на каждое сохранение, можно 
запустить 
    karma start test/karma.konf.js —no-auto-wath 
и затем, в другом терминале запускать
    karma run

Либо запускать как обычно через 
D:\projects\angular-starter\node_modules\.bin\karma  start
Но сперва выставив auto watch в false в конфиге кармы.
А потом в другом терминале:    
    D:\projects\angular-starter\node_modules\.bin\karma  run (в винде)