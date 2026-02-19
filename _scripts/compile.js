/**
 * Minifies javascript using UglifyJS and minifies features JSON
 */
const fs = require('fs');
const path = require('path');
const sass = require('sass');

const compiled_css = path.resolve( __dirname, '../assets/css/style.css' );
const minified_css = path.resolve( __dirname, '../assets/css/style.min.css' );

var result = sass.compile( path.resolve( __dirname, '../_scss/style.scss' ) );
fs.writeFileSync( compiled_css, result.css );
result = sass.compile( path.resolve( __dirname, '../_scss/style.scss' ), {style: "compressed"} );
fs.writeFileSync( minified_css, result.css );

