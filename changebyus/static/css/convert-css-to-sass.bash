for f in *.css; do
    echo $f ${f/.css/.scss};
    curl -s -X POST http://css2sass.heroku.com/xml --data-urlencode "page[css]@$f" -d commit="Convert 2 SCSS" | xmlstarlet sel -t -v /page/sass | xmlstarlet unesc > ${f/.css/.scss}; 
done