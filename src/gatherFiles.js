const fs = require('fs');

/*
    gatherFiles (path, recursive, whitelist)
    v1.0.0
    gathers all files from supplied path
    returns list of files relative to path
    only gathers files, not directories

    params:
    path
        start path
    recursive = true
        if true, look in subfolders
    whitelist
        regex to gather certain filenames
        for instance mp3/MP3 files:
            /\.mp3$/i
*/
const gatherFiles = (path, recursive = true, whitelist) => {
    let files = [];

    let dirs = [path];

    while (dirs.length > 0) {
        let d = dirs.shift();
        // get elements in dir
        let elements = fs.readdirSync(d);
        for(let i in elements) {
            let e = elements[i];            
            let s = fs.statSync(d + "/" + e);
            if (s.isDirectory() && recursive) {
                dirs.push(d + "/" + e);
            } else {
                let str = d.replace(path, "") + "/" + e;
                str = str.replace(/^\//, "");

                // check whitelist
                if(whitelist !== undefined) {
                    if(whitelist.test(d + "/" + e)) {
                        files.push(str);
                    }
                } else {
                    files.push(str);
                }
            }
        }
    }
    return files;
}

module.exports = gatherFiles;