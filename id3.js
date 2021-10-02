"use strict";
/*
    id3.js <path>
    - updates id3 tags on mp3 files
    - applied to all folders from specified path

    Process
    - checks file naming convention
        artist - title (YYYY)/01 - foobar.mp3
        " and $ is allowed in filename, and is escaped prior to execSync

    - prints out wrong formats, and exits

    - removes id3v1 tags and applies id3v2 tags

    Simen Lysebo, September/October 2021
*/

const fs = require('fs');
const execSync = require("child_process").execSync;
const gatherFiles = require("./mod/gatherFiles");
const cmdExists = require("./mod/cmdExists");

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
    file and folder naming conventions
*/

const folderExp = /^(.*) - (.*) \((\d\d\d\d)\)$/;
const fileExp = /^(\d\d) - (.*)\.mp3$/i;

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
    get sub folders directly below path
*/

const subfolders = fs.readdirSync(path).filter(
    file => fs.statSync(path + "/" + file).isDirectory());

/*
    verify naming convention of folders
*/

process.stdout.write("Verifying " + subfolders.length + " folders.. ");

let err = [];
for (const folder of subfolders) {
    if (!folderExp.test(folder)) {
        err.push(folder);
    }
}

if(err.length > 0) {
    log("FAILED!");
    for(const line of err) {
        log("    " + line);
    }
    log("Fix folder names and try again.");
    process.exit();
}

log("ok");

/*
    build list of files to process
    report files that don't follow the naming standard
*/

process.stdout.write("Verifying files in folders.. ");

// { artist: "", album: "", year: "", num: "", track: "", filename: "" }
const itemsTodo = [];
err = [];

for(const folder of subfolders) {

    const album = {};

    // get album data
    const albumMatches = folderExp.exec(folder);
    album.artist = albumMatches[1].trim();
    album.album = albumMatches[2].trim();
    album.year = albumMatches[3];

    // get mp3 files in folder
    const mp3files = gatherFiles(path + "/" + folder, false, /.mp3$/i);
    if (mp3files.length == 0) {
        err.push("no mp3 in folder: " + folder);
    }
    for (const file of mp3files) {

        // check filename
        let trackMatches = fileExp.exec(file);
        if(!trackMatches) {
            err.push(folder + "/" + file);
        } else {
            // add info to itemsTodo
            itemsTodo.push({
                ...album, 
                num: trackMatches[1], 
                track: trackMatches[2].trim(),
                filename: path + "/" + folder + "/" + file
            });
        }
    }
}

if(err.length > 0) {
    log("FAILED!");
    for(const line of err) {
        log("    " + line);
    }
    log("Fix file names and try again.");
    process.exit();
}

log("ok");

/*
    apply tags
*/

process.stdout.write("Applying tags to " + itemsTodo.length + " files.. ");

for(const item of itemsTodo) {
    // { artist: "", album: "", year: "", num: "", track: "", filename: "" }

    // remove all id3v1 tags
    let cmd = `id3v2 -s "${prepString(item.filename)}"`;
    execSync(cmd, {encoding: "utf8"});

    // write id3v2 tags
    cmd = `id3v2`;
    cmd += ` -a "${prepString(item.artist)}"`;
    cmd += ` -A "${prepString(item.album)}"`;
    cmd += ` -y "${item.year}"`;
    cmd += ` -T "${item.num}"`;
    cmd += ` -t "${prepString(item.track)}"`;
    cmd += ` "${prepString(item.filename)}"`;
    execSync(cmd), {encoding: "utf8"};
}

log("done.");
