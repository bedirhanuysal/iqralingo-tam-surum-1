const fs = require('fs');
const { execSync } = require('child_process');

function getGitFile(commit, path) {
    // Using --no-pager and getting buffer to be safe, then decoding as utf8
    return execSync(`git show ${commit}:${path}`, { encoding: 'utf8' });
}

try {
    const oldContent = getGitFile('b4d9bae', 'src/App.jsx');
    const newContent = getGitFile('origin/main', 'src/App.jsx');

    const oldLines = oldContent.split(/\r?\n/);
    const newLines = newContent.split(/\r?\n/);

    // Extract missing components from old file (lines 733 to 1115 in original indexed at 1)
    // 733 -> list index 732
    // 1115 -> list index 1114
    const missingCode = oldLines.slice(732, 1115);

    // Find where to insert in new file.
    let targetIdx = -1;
    for (let i = 0; i < newLines.length; i++) {
        if (newLines[i].includes('function DashboardContent')) {
            targetIdx = i;
            break;
        }
    }

    if (targetIdx === -1) {
        console.error("Could not find insertion point!");
        process.exit(1);
    }

    const result = [
        ...newLines.slice(0, targetIdx),
        "\n// --- RESTORED COMPONENTS FROM PREVIOUS COMMIT ---\n",
        ...missingCode,
        "\n// --- END RESTORED COMPONENTS ---\n",
        ...newLines.slice(targetIdx)
    ].join('\n');

    fs.writeFileSync('src/App.jsx', result, 'utf8');
    console.log("App.jsx merged and written successfully with UTF-8 encoding.");
} catch (err) {
    console.error("Error during merge:", err);
    process.exit(1);
}
