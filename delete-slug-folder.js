const fs = require('fs');
const path = require('path');

const folderToDelete = path.join(__dirname, 'frontend', 'app', '(site)', 't', '[slug]');

console.log('Attempting to delete:', folderToDelete);

try {
  if (fs.existsSync(folderToDelete)) {
    fs.rmSync(folderToDelete, { recursive: true, force: true });
    console.log('Successfully deleted:', folderToDelete);
  } else {
    console.log('Folder does not exist:', folderToDelete);
  }
} catch (err) {
  console.error('Error deleting folder:', err.message);
}
