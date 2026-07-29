import fs from 'fs';
import https from 'https';

const url = 'https://i.postimg.cc/ZKfDjBkB/book.png';
const dest = 'public/source-icon.png';

const file = fs.createWriteStream(dest);
https.get(url, (response) => {
    response.pipe(file);
    file.on('finish', () => {
        file.close();
        console.log('Download completed.');
    });
}).on('error', (err) => {
    fs.unlink(dest, () => {});
    console.error('Error downloading file:', err.message);
});
