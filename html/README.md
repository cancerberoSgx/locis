#install

    cd locis/html
    npm install

#Start web server

    cd locis
    node bin/www 

For compile js and ot
#Compile

First, make sure you have browserify and babel installed

    sudo npm install -g browserify babel

Compiles JavaScript and less

    cd locis/html
    node build/compile-all

#Watch 

For development we can start a watch server for .js and .less to automatically compile them with babel/browserify/less when file changes:

    cd locis/html
    node build/devel-watch

#browsersync/livereload

First make sure you have browser-sync installed globally: 

    sudo npm install -g browser-sync

then the following command executes a browser sync server (make sure you also run the webserver in port 3000)

    cd locis/html
    browser-sync start --proxy "http://localhost:3000/" --files "output/*"

#Development shortcut

Start server and watch:
    
    cd locis
    node bin/www & cd html; node build/devel-watch & browser-sync start --proxy "http://localhost:3000/" --files "output/*" & cd ..

and them kill them all ! (watchout!)

    killall node

#Prodution server

    sudo node bin/www --production


#internal: comands for browserify/babel: 

    rm -rf output; mkdir output; babel src -d output
    browserify output/index.js > output/bundle.js

or in one line: 

    cd html; babel src -d output;  browserify output/index.js > output/bundle.js; cd ..