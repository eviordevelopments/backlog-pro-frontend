const { parseRoutes, getNonLayoutRoutes } = require('./tests/docs/utils/routing-parser.js');
const routes = parseRoutes('src/App.tsx');
const nonLayout = getNonLayoutRoutes(routes);
console.log(JSON.stringify(nonLayout, null, 2));
