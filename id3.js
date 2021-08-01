const fs = require('fs');

/*
    ahoi. first things first

    - sette tags på en fil (POC)
    - metode som setter tags på fil (filename, tags{})
    - oversikt over gammel kode. spesialting den gjør
    - gather files med whitelist som param
        samler mapper med mp3-filer
    - filter file list. output if file/folder is fishy
*/
/*
    id3.js
    set id3 tags on mp3 files

    1 gather files from current dir
    2 check folder name + file name
        artist - title (YYYY) / 01 - foobar.mp3
    3 print out wrong formats + exit
    4 apply id3 tags

    Changelog
    # May 1 2005 Simen Lysebo (simen@slaatten.net)
    # June 12 2006 Simen Lysebo (simen@slaatten.net)
    # June 2 2007 Simen Lysebo (simen@slaatten.net)
    #      modified to only use the id3v2 command
    July 2021 - rewrite from perl to nodejs

*/

/*
    apply to all files in given dir
*/
const log = $str => console.log($str);

if (process.argv.length < 3) {
    log("no folder specified");
    return;
}

let dir = process.argv[2];
if (!fs.existsSync(dir)) {
    log("folder does not exist");
    return;
}
log(process.argv);