export function getMessage(msg: string[] | string): string {
  if (Array.isArray(msg)) {
    return msg.join('. ');
  } else {
    return msg;
  }
}

export function parseJwt(token: string) {
  var base64Url = token.split('.')[1];
  var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  var jsonPayload = decodeURIComponent(
    window
      .atob(base64)
      .split('')
      .map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join('')
  );

  return JSON.parse(jsonPayload);
}

export function shortAddress(
  address?: string,
  prefix: number = 4,
  suffix: number = 4
) {
  return address
    ? `${address.substring(
        0,
        address.startsWith('0x') ? prefix + 2 : prefix
      )}...${address.substring(address.length - suffix)}`
    : '';
}

const types: { [key: string]: string } = {
  //   File Extension   MIME Type
  abs: 'audio/x-mpeg',
  ai: 'application/postscript',
  aif: 'audio/x-aiff',
  aifc: 'audio/x-aiff',
  aiff: 'audio/x-aiff',
  aim: 'application/x-aim',
  anx: 'application/annodex',
  art: 'image/x-jg',
  asf: 'video/x-ms-asf',
  asx: 'video/x-ms-asf',
  au: 'audio/basic',
  avi: 'video/x-msvideo',
  avif: 'image/avif',
  avx: 'video/x-rad-screenplay',
  axa: 'audio/annodex',
  axv: 'video/annodex',
  bcpio: 'application/x-bcpio',
  bin: 'application/octet-stream',
  bmp: 'image/bmp',
  body: 'text/html',
  cdf: 'application/x-cdf',
  cer: 'application/pkix-cert',
  class: 'application/java',
  cpio: 'application/x-cpio',
  csh: 'application/x-csh',
  css: 'text/css',
  dib: 'image/bmp',
  doc: 'application/msword',
  dtd: 'application/xml-dtd',
  dv: 'video/x-dv',
  dvi: 'application/x-dvi',
  eot: 'application/vnd.ms-fontobject',
  eps: 'application/postscript',
  etx: 'text/x-setext',
  exe: 'application/octet-stream',
  flac: 'audio/flac',
  gif: 'image/gif',
  gtar: 'application/x-gtar',
  gz: 'application/x-gzip',
  hdf: 'application/x-hdf',
  hqx: 'application/mac-binhex40',
  htc: 'text/x-component',
  htm: 'text/html',
  html: 'text/html',
  ief: 'image/ief',
  jad: 'text/vnd.sun.j2me.app-descriptor',
  jar: 'application/java-archive',
  java: 'text/x-java-source',
  jnlp: 'application/x-java-jnlp-file',
  jpe: 'image/jpeg',
  jpeg: 'image/jpeg',
  jpg: 'image/jpeg',
  js: 'application/javascript',
  jsf: 'text/plain',
  json: 'application/json',
  jspf: 'text/plain',
  kar: 'audio/midi',
  latex: 'application/x-latex',
  m3u: 'audio/x-mpegurl',
  mac: 'image/x-macpaint',
  man: 'text/troff',
  mathml: 'application/mathml+xml',
  me: 'text/troff',
  mid: 'audio/midi',
  midi: 'audio/midi',
  mif: 'application/x-mif',
  mov: 'video/quicktime',
  movie: 'video/x-sgi-movie',
  mp1: 'audio/mpeg',
  mp2: 'audio/mpeg',
  mp3: 'audio/mpeg',
  mp4: 'video/mp4',
  mpa: 'audio/mpeg',
  mpe: 'video/mpeg',
  mpeg: 'video/mpeg',
  mpega: 'audio/x-mpeg',
  mpg: 'video/mpeg',
  mpv2: 'video/mpeg2',
  ms: 'application/x-wais-source',
  nc: 'application/x-netcdf',
  oda: 'application/oda',
  odb: 'application/vnd.oasis.opendocument.database',
  odc: 'application/vnd.oasis.opendocument.chart',
  odf: 'application/vnd.oasis.opendocument.formula',
  odg: 'application/vnd.oasis.opendocument.graphics',
  odi: 'application/vnd.oasis.opendocument.image',
  odm: 'application/vnd.oasis.opendocument.text-master',
  odp: 'application/vnd.oasis.opendocument.presentation',
  ods: 'application/vnd.oasis.opendocument.spreadsheet',
  odt: 'application/vnd.oasis.opendocument.text',
  oga: 'audio/ogg',
  ogg: 'audio/ogg',
  ogv: 'video/ogg',
  ogx: 'application/ogg',
  otf: 'application/x-font-opentype',
  otg: 'application/vnd.oasis.opendocument.graphics-template',
  oth: 'application/vnd.oasis.opendocument.text-web',
  otp: 'application/vnd.oasis.opendocument.presentation-template',
  ots: 'application/vnd.oasis.opendocument.spreadsheet-template',
  ott: 'application/vnd.oasis.opendocument.text-template',
  pbm: 'image/x-portable-bitmap',
  pct: 'image/pict',
  pdf: 'application/pdf',
  pgm: 'image/x-portable-graymap',
  pic: 'image/pict',
  pict: 'image/pict',
  pls: 'audio/x-scpls',
  png: 'image/png',
  pnm: 'image/x-portable-anymap',
  pnt: 'image/x-macpaint',
  ppm: 'image/x-portable-pixmap',
  pps: 'application/vnd.ms-powerpoint',
  ppt: 'application/vnd.ms-powerpoint',
  ps: 'application/postscript',
  psd: 'image/vnd.adobe.photoshop',
  qt: 'video/quicktime',
  qti: 'image/x-quicktime',
  qtif: 'image/x-quicktime',
  ras: 'image/x-cmu-raster',
  rdf: 'application/rdf+xml',
  rgb: 'image/x-rgb',
  rm: 'application/vnd.rn-realmedia',
  roff: 'text/troff',
  rtf: 'application/rtf',
  rtx: 'text/richtext',
  sfnt: 'application/font-sfnt',
  sh: 'application/x-sh',
  shar: 'application/x-shar',
  sit: 'application/x-stuffit',
  snd: 'audio/basic',
  spx: 'audio/ogg',
  src: 'application/x-wais-source',
  sv4cpio: 'application/x-sv4cpio',
  sv4crc: 'application/x-sv4crc',
  svg: 'image/svg+xml',
  svgz: 'image/svg+xml',
  swf: 'application/x-shockwave-flash',
  t: 'text/troff',
  tar: 'application/x-tar',
  tcl: 'application/x-tcl',
  tex: 'application/x-tex',
  texi: 'application/x-texinfo',
  texinfo: 'application/x-texinfo',
  tif: 'image/tiff',
  tiff: 'image/tiff',
  tr: 'text/troff',
  tsv: 'text/tab-separated-values',
  ttf: 'application/x-font-ttf',
  txt: 'text/plain',
  ulw: 'audio/basic',
  ustar: 'application/x-ustar',
  vsd: 'application/vnd.visio',
  vxml: 'application/voicexml+xml',
  wav: 'audio/x-wav',
  wbmp: 'image/vnd.wap.wbmp',
  wml: 'text/vnd.wap.wml',
  wmlc: 'application/vnd.wap.wmlc',
  wmls: 'text/vnd.wap.wmlsc',
  wmlscriptc: 'application/vnd.wap.wmlscriptc',
  wmv: 'video/x-ms-wmv',
  woff: 'application/font-woff',
  woff2: 'application/font-woff2',
  wrl: 'model/vrml',
  wspolicy: 'application/wspolicy+xml',
  xbm: 'image/x-xbitmap',
  xht: 'application/xhtml+xml',
  xhtml: 'application/xhtml+xml',
  xls: 'application/vnd.ms-excel',
  xml: 'application/xml',
  xpm: 'image/x-xpixmap',
  xsl: 'application/xml',
  xslt: 'application/xslt+xml',
  xspf: 'application/xspf+xml',
  xul: 'application/vnd.mozilla.xul+xml',
  xwd: 'image/x-xwindowdump',
  z: 'application/x-compress',
  zip: 'application/zip',
};

export function getMimeType(fileName?: string) {
  if (fileName) {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (extension) {
      return types[extension] ?? '';
    }
  }
  return 'unknown';
}

export const getTickerFromName = (name?: string | null) => {
  if (name && name.length > 0) {
    const matches = name.match(/\b([A-Z]|[a-z]|[0-9])/g);
    if (matches) {
      return matches.join('').substring(0, 3).toUpperCase();
    }
  }
  return '';
};

export const validateUrl = (url?: string): boolean => {
  if (url) {
    const pattern =
      /^((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/gi;

    return pattern.test(url);
  }

  return true;
};
