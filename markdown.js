
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


exports.markdown = md;

exports.replaceLocalImagePlugin = (instance, options) => {
  const img = instance.renderer.rules.image;
  instance.renderer.rules.image = (tokens, idx, opts /*, env */) => {
    const src = tokens[idx].src;
    const isLocal = !src.match(/^http/);
    if (isLocal) {
      tokens[idx].src = `file://${options.cwd}${src.substring(1)}`;
    }
    return img(tokens, idx, opts /*, env */);
  }
}

