Для запуска использовать Apache.

После установки Apache в httpd.conf нужно раскомментить на 167 строке (может немного различаться) LoadModule rewrite_module modules/mod_rewrite.so, это необходимо для работы файла .htaccess
Также необходимо в httpd.conf на 256 и 257 строках (могут немного различаться) в DocumentRoot и Directory указать путь до проекта, где лежит index.html.
И в конце в том же httpd.conf на 385 (может немного различаться) в AllowOverride вместо None поставить All.
Теперь после перезапуска Apache при обращении по адресу localhost должна появится главная страница сайта.

Для добавления IMask прописать в консоль: npm install imask
Для добавления декодера прописать в консоль: npm install jsonwebtoken
