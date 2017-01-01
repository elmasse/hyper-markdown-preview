
const Remarkable = require('remarkable');
const hljs = require('highlight.js');

const md = new Remarkable({
  html: true,
  linkify: true,
  typographer: true,
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(lang, str).value;
      } catch (err) {}
    }

    try {
      return hljs.highlightAuto(str).value;
    } catch (err) {}

    return ''; // use external default escaping
  }
});  


const imageRender = (options, imgFn) => (tokens, idx, opts /*, env */) => {
  const src = tokens[idx].src;
  const isLocal = !src.match(/^http|file/);
  if (isLocal) {
    tokens[idx].src = createLocalUri(options.cwd, src);
  }
  return imgFn(tokens, idx, opts /*, env */);
}

const createLocalUri = (cwd, src) => {
  let uri = src;

  if (src.match(/^\./)) {
    uri = src.substring(1);
  }

  if (!src.match(/^\//)) {
    uri = `/${uri}`;
  }

  return `file://${cwd}${uri}`;
}

exports.markdown = md;

exports.replaceLocalImagePlugin = (instance, options) => {
  const imgFn = instance.renderer.rules.image;
  instance.renderer.rules.image = imageRender(options, imgFn)
}

