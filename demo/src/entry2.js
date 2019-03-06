import jquery from 'jquery'
import d3 from 'd3'
import lodash from 'lodash'

// Dynamic Imports will use Webpack Module Engine
// this chunk will not convert to AMD Module
import(
  /* webpackChunkName: "asyc-import-data" */
  './data'
).then(data => {
  console.log(data)
});
