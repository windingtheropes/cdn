import express, { query } from "express";
import { readdirSync, lstatSync, existsSync, fstatSync } from "fs";
import { join, basename } from "path";
const app = express()

import * as url from 'url'
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const __pubdir = join(__dirname, "public")
const port =  3030;

// generate a safe, relative path for use in urls
const relpath = (path) => {
    return path.replace(__pubdir,"")
}
// generate rudimentary html directory list for a directory
const directory_gen = (path) => {
    let html = `<h1>${relpath(path)}</h1>`
    const dirfiles = readdirSync(path)
    for (const file of dirfiles) {
        // don't show showtrue in the contents
        if(file == "showtrue") {
            continue
        }
        const __fullpath = join(path, file)
        const __rel = relpath(__fullpath)
        html = `${html}<a href="${__rel}">${file}</><br>`
    }
    return html
}
// send all files within the public directory
app.get('*', (req, res) => {
    // full, unsafe query path
    const __qpath_full = join(__pubdir, decodeURI(req.url))
    try {
        if(existsSync(__qpath_full)) {
            // if directory, check if a page should be generated
            if(lstatSync(__qpath_full).isDirectory()) {
                // check for whitelist file
                if(existsSync(join(__qpath_full, "showtrue"))) {
                    return res.send(directory_gen(__qpath_full))
                }
                return res.sendStatus(404)
            }
            // skip showtrue file
            if(basename(__qpath_full) == "showtrue") {
                return res.sendStatus(404)
            }
            // send the file
            return res.sendFile(__qpath_full)
        }
        return res.sendStatus(404)
    }
    catch {
        return res.sendStatus(500)
    }
})

app.listen(port, () => {
    console.log(`cdn running on port ${port}`)
})