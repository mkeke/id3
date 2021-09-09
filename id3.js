const fs = require('fs');
const execSync = require("child_process").execSync;
const gatherFiles = require("./src/gatherFiles");
const cmdExists = require("./src/cmdExists");

const log = console.log;
const printErr = (str, exit = true) => { 
    log(str);
    log("usage:\n   z.id3 <path>");

    exit && process.exit();
}

/*
    check if required commands are available
*/

if (!cmdExists("id3v2")) {
    log("Required command id3v2 must be installed first.")
    process.exit();
}

/*
    Check command line params
    - must have one argument
    - path must exist
    - must be a path to a valid folder
*/

if (process.argv.length < 3) {
    printErr("<path> is missing.");
}

const path = process.argv[2].replace(/\/*$/, "");
if(!fs.existsSync(path)) {
    printErr("Path does not exist.");
}

const stats = fs.statSync(path);
if(!stats.isDirectory()) {
    printErr("Path must be to a valid folder.");
}

/*
    check folder name for convention. report fishiness

    the artist - the title (2020)

    Artist is from start of string to the first "-"
    Album title is from the first "-" to the last "(1234)"
    Year is the last "(1234)"
*/

// get only the last folder name. prepend a / for easier regex
const folder = ("/" + path).replace(/^.*\/([^\/]*)$/, "$1");
const matches = /^([^-]*)-(.*)\((\d\d\d\d)\)$/gm.exec(folder);
if(!matches) {
    printErr("Something fishy with folder name: " + folder);
}

// grab + trim album parts
const album = {
    artist: matches[1].trim(),
    title: matches[2].trim(),
    year: matches[3],
}

/*
    get file list
*/
let files = gatherFiles(path, false, /.mp3$/i);

/*
    check filenames. get data. report fishiness
*/
let ok = true;
files = files.map( item => {
    let matches = /^(\d\d) - (.*)\.mp3$/i.exec(item);
    if (matches) {
        return { filename: item, num: matches[1], title: matches[2] };
    } else {
        if (ok) {
            log("The following filenames are fishy:");
            ok = false;
        }
        log("  " + path + "/" + item);
        return item;
    }
});

if (!ok) {
    log("Fix errors and retry.");
    process.exit();
}

/*
    if no fishiness, apply tags
*/

files.map( track => {
    log(album.artist + " -> " + album.title + " -> " + album.year + " -> " + track.num + " -> " + track.title);
});

/*
    still here, then remove + apply tag for each file
*/

log("hei du");

return;

/*
    ahoi 2. firster things firster
    - kopiere inn noen albums
    - sjekk params (path)
    - apply på folder
    - sjekk filnavn
    - print out fishiness
    - apply tags til hver fil i folder
*/
/*
    ahoi. first things first

    v link fra bin
    - sette tags på en fil (POC)
    - metode som setter tags på fil (filename, tags{})
    - oversikt over gammel kode. spesialting den gjør
    - gather files med whitelist som param
        samler mapper med mp3-filer
    - filter file list. output if file/folder is fishy
    - push filnavn til liste, ta neste i køen når exec er klar
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

if (process.argv.length < 3) {
    log("no folder specified");
    return;
}

let dir = process.argv[2];
if (!fs.existsSync(dir)) {
    log("folder does not exist");
    return;
}
*/

/*
    data {
        artist
        album
        year
        track
        title
    }
*/
const setMetadata = (filename, data) => {
    // assumes filename conforms to the naming convention
    log(data);
    if(!fs.existsSync(filename)) {
        log(`file not found: ${filename}`)
        return;
    }

    let out = execSync(
        `id3v2 -l "${filename}"`, {encoding: "utf8"});

    log("ja");
    log(out);

}

const determineMetadata = filename => {
    // assumes filename conforms to the naming convention
    log("determineMetadata()");
    let data = {};
    let parts = filename.split("/");

    data.folder = parts[0];
    data.file = parts[1];

    return data;
}



// let files = gatherFiles(path, { whitelist: /\.mp3$/i });

log(files);
