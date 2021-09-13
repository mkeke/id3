/*
    id3.js <path>
    set id3 tags on mp3 files in specified path

    - checks file naming convention
        artist - title (YYYY)/01 - foobar.mp3
        " and $ is allowed in filename, and is escaped prior to execSync

    - prints out wrong formats, and exits

    - removes id3v1 tags and applies id3v2 tags

    Simen Lysebo, September 2021
*/

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
const prepString = s => {
    // backslash "
    s = s.replace(/\"/g, "\\\"");
    // backslash $
    s = s.replace(/\$/g, "\\\$");
    return s;
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

// grab + trim album parts. Strings must be prepared for exec
const album = {
    path: prepString(path),
    artist: prepString(matches[1].trim()),
    title: prepString(matches[2].trim()),
    year: prepString(matches[3]),
}

/*
    get file list
*/
let files = gatherFiles(path, false, /.mp3$/i);

/*
    check filenames. get data (prepared for exec). report fishiness
*/
let ok = true;
files = files.map( item => {
    let matches = /^(\d\d) - (.*)\.mp3$/i.exec(item);
    if (matches) {
        return { 
            origin: item,
            filename: prepString(item), 
            num: prepString(matches[1]), 
            title: prepString(matches[2]) };
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
log(path);

files.map( track => {
    log(`   ${track.origin}`);
    // remove all id3v1 tags
    let cmd = `id3v2 -s "${album.path}/${track.filename}"`;
    execSync(cmd, {encoding: "utf8"});

    // write id3v2 tags
    cmd = `id3v2 -a "${album.artist}" -A "${album.title}" -y "${album.year}"`;
    cmd += ` -T "${track.num}" -t "${track.title}" "${album.path}/${track.filename}"`;

    execSync(cmd), {encoding: "utf8"};
});

log("done");

/*

// proof

files.map( track => {
    log(path + "/" + track.origin);
    let cmd = `id3v2 -l "${album.path}/${track.filename}"`;
    let out = execSync(cmd, {encoding: "utf8"});
    log(out);
});

*/
