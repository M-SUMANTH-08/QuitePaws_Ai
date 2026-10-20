const { JSDOM } = require('jsdom');
const html = `<!DOCTYPE html><html><head>
  <script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd@2.2.2/dist/coco-ssd.min.js"></script>
</head><body></body></html>`;

const dom = new JSDOM(html, { runScripts: 'dangerously', resources: 'usable' });

setTimeout(() => {
  console.log('tf exists?', !!dom.window.tf);
  if (dom.window.tf) {
    console.log('tf.version:', dom.window.tf.version);
    console.log('tf.loadGraphModel:', typeof dom.window.tf.loadGraphModel);
  }
  console.log('cocoSsd exists?', !!dom.window.cocoSsd);
  process.exit(0);
}, 5000);
