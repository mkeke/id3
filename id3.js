const fs = require('fs');
const execSync = require("child_process").execSync;

const log = str => console.log(str);

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


/*
    gatherFiles (path, options)
    gathers all files recursively from path
    returns list of files relative to path
    only gathers files, not directories
    options can be whitelist, to gather certain filenames
    for instance mp3/MP3 files:
        { whitelist: /\.mp3$/i }
*/
const gatherFiles = (path, options = {}) => {
    let files = [];

    let dirs = [path];

    while (dirs.length > 0) {
        let d = dirs.shift();
        // get elements in dir
        let elements = fs.readdirSync(d);
        for(let i in elements) {
            let e = elements[i];            
            let s = fs.statSync(d + "/" + e);
            if (s.isDirectory()) {
                dirs.push(d + "/" + e);
            } else {
                // check whitelist
                if(options.whitelist !== undefined) {
                    if(options.whitelist.test(d + "/" + e)) {
                        files.push(d + "/" + e);
                    }
                } else {
                    files.push(d + "/" + e);
                }
            }
        }
    }
    return files;
}

let path = process.argv[2];
if (path === undefined || path == "") {
    // default to current dir
    path = ".";
}
// remove trailing slashes
path = path.replace(/\/+$/, "");

// quit if path does not exist
if(!fs.existsSync(path)) {
    log(`not found: ${path}`);
    log("quitting.");
    return;
}

// quit if not a directory
let stats = fs.statSync(path);
if (!stats.isDirectory()) {
    log(`not a directory: ${path}`);
    log("quitting.");
    return;
}

let files = gatherFiles(path, { whitelist: /\.mp3$/i });

log(files);
