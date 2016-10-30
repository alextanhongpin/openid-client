// For application/x-www-form-urlencoded, spaces are to be replaced by '+', so one may wish to follow a encodeURIComponent replacement with an additional replacement of "%20" with "+".


function fixedEncodeURIComponent (str) {
  return encodeURIComponent(str).replace(/[!'()*]/g, function(c) {
    return '%' + c.charCodeAt(0).toString(16);
  });
}

module.exports = fixedEncodeURIComponent;