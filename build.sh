rm -rf ./dist/templates/*
cp -rf ./src/templates/* ./dist/templates/
rm -rf ./static/js/*
for f in ./src/js/*.js; do npx uglify-js $f --compress --mangle -o ./static/js/$(basename $f); done
rm -rf ./static/css/*
for f in ./src/css/*.css; do npx cleancss $f -o ./static/css/$(basename $f); done
npx tsc
