import assert from "assert"
import fs from "fs"
import path from "path"
// Example emojis you want to include

if (module === require.main) {
    const folder = path.resolve(__dirname, "./assets/svg")
    const outFile = path.resolve(__dirname, "./emojis.ts")

    // Dictionary to dedupe emojis
    const uniqueMap: Record<string, string> = {}

    // Read all files from the folder
    const files = fs.readdirSync(folder)

    files.forEach((file) => {
        // Match files like "2b50.svg" or "1f1fb-1f1e8.svg"
        const match = file.match(/^([0-9a-f]+(?:-[0-9a-f]+)*)\.svg$/i)
        if (!match) return

        const hexCodes = match[1].split('-')
        const codePoints = hexCodes.map(hex => parseInt(hex, 16))
        const emoji = String.fromCodePoint(...codePoints)

        try {
            const filePath = path.join(folder, file)
            let svg = fs.readFileSync(filePath, "utf8")

            // Remove outer <svg> wrapper
            svg = svg.replace(/<svg[^>]*>/, "").replace(/<\/svg>/, "").trim()

            // Store in dict (duplicates automatically overwritten)
            assert(!uniqueMap[emoji], `Duplicate emoji detected: ${emoji} from file ${file}`)
            uniqueMap[emoji] = `'<g>${svg}</g>'`
        } catch (error) {
            console.warn(`Warning: Could not process file "${file}": ${error}`)
        }
    })

    // Build file content OUTSIDE the loop
    let fileContent = `

export const emojiMap = {
`

    for (const [emoji, jsx] of Object.entries(uniqueMap)) {
        fileContent += `  "${emoji}": ${jsx},\n`
    }

    fileContent += "} as const;\n"

    // Write file once
    fs.writeFileSync(outFile, fileContent, "utf8")
    fs.writeFileSync('emojis.txt', Object.keys(uniqueMap).join('\n'), "utf8")

    console.log("emojis.ts generated!", Object.keys(uniqueMap).length)
}