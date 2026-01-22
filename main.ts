import fs, { readFileSync } from "fs"
import path from "path"
// Example emojis you want to include

if (module === require.main) {
    const folder = path.resolve(__dirname, "./assets/svg")
    const outFile = path.resolve(__dirname, "./emojis.ts")
    const emojiList = JSON.parse(readFileSync('emojis.json', 'utf8')) as string[]

    // Dictionary to dedupe emojis
    const uniqueMap: Record<string, string> = {}

    function fileName(emoji: string) {
        return `${emoji.codePointAt(0)?.toString(16)}.svg`
    }

    emojiList.forEach((emoji) => {
        try {
            const filePath = path.join(folder, fileName(emoji))
            let svg = fs.readFileSync(filePath, "utf8")

            // Remove outer <svg> wrapper
            svg = svg.replace(/<svg[^>]*>/, "").replace(/<\/svg>/, "").trim()

            // Convert attributes to JSX-compatible names
            // svg = svg.replace(/fill-opacity=/g, "fillOpacity=")
            // svg = svg.replace(/stroke-width=/g, "strokeWidth=")
            // svg = svg.replace(/fill-rule=/g, "fillRule=")
            // svg = svg.replace(/clip-rule=/g, "clipRule=")

            // Store in dict (duplicates automatically overwritten)
            uniqueMap[emoji] = `'<g>${svg}</g>'`
        } catch (error) {
            console.warn(`Warning: Could not process emoji "${emoji}": ${error}`)
        }
    })

    // Build file content OUTSIDE the loop
    let fileContent = `

export const emojiMap: Record<string, string> = {
`

    for (const [emoji, jsx] of Object.entries(uniqueMap)) {
        fileContent += `  "${emoji}": ${jsx},\n`
    }

    fileContent += "};\n"

    // Write file once
    fs.writeFileSync(outFile, fileContent, "utf8")

    console.log("emojis.ts generated!", Object.keys(uniqueMap).length)
}