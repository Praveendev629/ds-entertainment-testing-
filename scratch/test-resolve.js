
const FE_URL = 'https://dub.onestream.today/stream/video/48844';

async function test() {
  const HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Referer": "https://dubmv.top/",
  };

  console.log('Fetching:', FE_URL);
  const res = await fetch(FE_URL, { headers: HEADERS });
  const html = await res.text();
  console.log('HTML Length:', html.length);
  const videoIndex = html.indexOf('<video');
  console.log('HTML around video tag:', html.substring(videoIndex, videoIndex + 2000));
  
  const videoPatterns = [
    /source\s+src=["']([^"']+)["']/gi,
    /video[^>]+src=["']([^"']+)["']/gi,
    /["']([^"']*\.(?:mp4|m3u8|webm|mkv|avi|mov)[^"']*)["']/gi,
    /file:\s*["']([^"']+)["']/gi,
    /url:\s*["']([^"']+)["']/gi,
    /src:\s*["']([^"']+)["']/gi,
    /data-src=["']([^"']+)["']/gi,
    /data-url=["']([^"']+)["']/gi,
    /["'](https?:\/\/[^"']*\.(?:mp4|m3u8|webm)[^"']*)["']/gi,
  ];

  for (const pattern of videoPatterns) {
    let match;
    while ((match = pattern.exec(html)) !== null) {
      const url = match[1];
      if (url && (url.includes('.mp4') || url.includes('.m3u8') || url.includes('.webm') || url.includes('.mkv'))) {
        console.log('Found:', url);
      }
    }
  }
}

test();
