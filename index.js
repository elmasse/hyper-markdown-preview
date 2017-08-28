const { existsSync, readFileSync } = require('fs');
const { exec } = require('child_process');
const { resolve } = require('path');

const { markdown, replaceLocalImagePlugin } = require('./markdown');
const matcher = require('./shell-matcher');

const resolveCWD = (pid, cb) => {
  exec(`lsof -n -p ${pid} | grep cwd | tr -s ' ' | cut -d ' ' -f9-`, (err, cwd) => {
    if (err) {
      cb(err, null);
    } else {
      cwd = cwd.trim();
      cb(null, cwd);
    }
  });
}

const hyperMarkdownPreview = {
  stylesheet: 'github'
}

exports.decorateConfig = (config) => {
   console.log(config)
  return Object.assign({
    hyperMarkdownPreview
  }, config);
}  

const stylesheets = {
  github: `<link href="https://unpkg.com/github-markdown-css@2.8.0" rel="stylesheet" />`,
  none: `<style>.markdown-body {font-family: Helvetica, Arial, sans serif;} </style>`
}

exports.middleware = (store) => (next) => (action) => {

  if ('SESSION_ADD_DATA' === action.type) {
    const { data } = action;
    const state = store.getState();
    const { sessions } = state;
    const { activeUid } = sessions;
    const session = sessions.sessions[activeUid];
    const { pid, shell } = session;
    const match = data.match(matcher[shell]);
    const globalCfg = window.config.getConfig();
    const config = globalCfg.hyperMarkdownPreview || hyperMarkdownPreview;
    if (match) { 
      const file = match[2];
      if (/\.(md|markdown)$/.test(file)) {

          resolveCWD(pid, (err, cwd) => {
            if (err) {
              console.log('Cannot retrieve CWD', err);
              return;
            }

            const path = resolve(cwd, file);

            if (existsSync(path)) {
              
              markdown.use(replaceLocalImagePlugin, {cwd});
              
              const source = readFileSync(path, 'UTF-8');
              const style = stylesheets[config.stylesheet] || stylesheets.github;
              const html =  `<html>
                <head>
                <meta charset="utf-8">
                ${style}
                <style>
                  .markdown-body {
                    margin: 50px;
                  }
                  img {
                    max-width: 90vw;                    
                  }
                </style>                
                </head>
                <body class="markdown-body">${markdown.render(source)}</body>
                </html>`;

              const url = URL.createObjectURL(new Blob([html],{type: 'text/html'}));
              
              store.dispatch({
                type: 'SESSION_URL_SET',
                uid: activeUid,
                url
              });

            } else {
              next(action);
            }
          });
      } else {
        next(action);
      }
    } else {
      next(action);
    }
  } else {
    next(action);
  }
};
