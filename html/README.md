#install

    cd locis/html
    npm install

#Start web server

    cd locis
    node bin/www 

#Compile

Compiles JavaScript and less

    cd locis/html
    node build/compile-all

#Watch 

For development we can start a watch server for .js and .less to automatically compile them with babel/browserify/less when file changes:

    cd locis/html
    node build/devel-watch

#run prodution server: 

    sudo node bin/www --production


#internal: comands for browserify/babel: 

    rm -rf output; mkdir output; babel src -d output
    browserify output/index.js > output/bundle.js

or in one line: 

    cd html; babel src -d output;  browserify output/index.js > output/bundle.js; cd ..