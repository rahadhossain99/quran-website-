import https from 'https';

function get(url: string) {
  return new Promise<string>((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'NodeApp' } }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function run() {
  const result = await get('https://api.github.com/search/code?q=hisnul+muslim+bangla+OR+bengali+OR+bn');
  console.log(result);
}
run();
