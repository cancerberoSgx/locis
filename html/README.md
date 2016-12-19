### how to compile it

First, make sure you have browserify and babel installed

    sudo npm install -g browserify babel

Then: 

    rm -rf output; mkdir output; babel src -d output
    browserify -t engify output/index.js > output/bundle.js