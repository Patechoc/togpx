if (typeof require !== "undefined") {
  var expect = require("expect.js");
  var DOMParser = require("xmldom").DOMParser;
  var togpx = require("../");
}

describe("geometries", function () {

  it('blank geojson', function() {
    var geojson, result;
    geojson = {
      type: "FeatureCollection",
      features: []
    };
    result = togpx(geojson);
    result = (new DOMParser()).parseFromString(result, 'text/xml');
    expect(result.firstChild.tagName).to.eql("gpx");
    expect(result.firstChild.getAttribute("version")).to.eql("1.1");
    expect(result.getElementsByTagName("wpt")).to.have.length(0);
    expect(result.getElementsByTagName("trk")).to.have.length(0);
    expect(result.getElementsByTagName("rte")).to.have.length(0);
  });

  it('Point', function() {
    var geojson, result;
    geojson = {
      type: "FeatureCollection",
      features: [{
        type: "Feature",
        properties: {},
        geometry: {
          type: "Point",
          coordinates: [1.0,2.0]
        }
      }]
    };
    result = togpx(geojson);
    result = (new DOMParser()).parseFromString(result, 'text/xml');
    expect(result.getElementsByTagName("wpt")).to.have.length(1);
    expect(result.getElementsByTagName("trk")).to.have.length(0);
    expect(result.getElementsByTagName("rte")).to.have.length(0);
    var wpt = result.getElementsByTagName("wpt")[0];
    expect(wpt.getAttribute("lat")).to.eql(2.0);
    expect(wpt.getAttribute("lon")).to.eql(1.0);
  });

  it('LineString', function() {
    var geojson, result;
    geojson = {
      type: "FeatureCollection",
      features: [{
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: [[1.0,2.0],[3.0,4.0]]
        }
      }]
    };
    result = togpx(geojson);
    result = (new DOMParser()).parseFromString(result, 'text/xml');
    expect(result.getElementsByTagName("wpt")).to.have.length(0);
    expect(result.getElementsByTagName("trk")).to.have.length(1);
    expect(result.getElementsByTagName("rte")).to.have.length(0);
    var trk = result.getElementsByTagName("trk")[0];
    var trksegs = trk.getElementsByTagName("trkseg");
    expect(trksegs).to.have.length(1);
    var trkpts = trksegs[0].getElementsByTagName("trkpt");
    expect(trkpts).to.have.length(2);
    expect(trkpts[0].getAttribute("lat")).to.eql(2.0);
    expect(trkpts[0].getAttribute("lon")).to.eql(1.0);
    expect(trkpts[1].getAttribute("lat")).to.eql(4.0);
    expect(trkpts[1].getAttribute("lon")).to.eql(3.0);
  });

  it('Polygon (no holes)', function() {
    var geojson, result;
    geojson = {
      type: "FeatureCollection",
      features: [{
        type: "Feature",
        properties: {},
        geometry: {
          type: "Polygon",
          coordinates: [
            [ [100.0, 0.0], [101.0, 0.0], [101.0, 1.0], [100.0, 1.0], [100.0, 0.0] ]
          ]
        }
      }]
    };
    result = togpx(geojson);
    result = (new DOMParser()).parseFromString(result, 'text/xml');
    expect(result.getElementsByTagName("wpt")).to.have.length(0);
    expect(result.getElementsByTagName("trk")).to.have.length(1);
    expect(result.getElementsByTagName("rte")).to.have.length(0);
    var trk = result.getElementsByTagName("trk")[0];
    var trksegs = trk.getElementsByTagName("trkseg");
    expect(trksegs).to.have.length(1);
    var trkpts = trksegs[0].getElementsByTagName("trkpt");
    expect(trkpts).to.have.length(5);
    expect(trkpts[0].getAttribute("lat")).to.eql(0.0);
    expect(trkpts[0].getAttribute("lon")).to.eql(100.0);
    // skip remaining points, should be ok
  });

  it('Polygon (with hole)', function() {
    var geojson, result;
    geojson = {
      type: "FeatureCollection",
      features: [{
        type: "Feature",
        properties: {},
        geometry: {
          type: "Polygon",
          coordinates: [
            [ [100.0, 0.0], [101.0, 0.0], [101.0, 1.0], [100.0, 1.0], [100.0, 0.0] ],
            [ [100.2, 0.2], [100.8, 0.2], [100.8, 0.8], [100.2, 0.8], [100.2, 0.2] ]
          ]
        }
      }]
    };
    result = togpx(geojson);
    result = (new DOMParser()).parseFromString(result, 'text/xml');
    expect(result.getElementsByTagName("wpt")).to.have.length(0);
    expect(result.getElementsByTagName("trk")).to.have.length(1);
    expect(result.getElementsByTagName("rte")).to.have.length(0);
    var trk = result.getElementsByTagName("trk")[0];
    var trksegs = trk.getElementsByTagName("trkseg");
    expect(trksegs).to.have.length(2);
    var trkpts = trksegs[0].getElementsByTagName("trkpt");
    expect(trkpts).to.have.length(5);
    expect(trkpts[0].getAttribute("lat")).to.eql(0.0);
    expect(trkpts[0].getAttribute("lon")).to.eql(100.0);
    // skip remaining points, should be ok
    trkpts = trksegs[1].getElementsByTagName("trkpt");
    expect(trkpts).to.have.length(5);
    expect(trkpts[0].getAttribute("lat")).to.eql(0.2);
    expect(trkpts[0].getAttribute("lon")).to.eql(100.2);
    // skip remaining points, should be ok
  });

  it('MultiPolygon', function() {
    var geojson, result;
    geojson = {
      type: "FeatureCollection",
      features: [{
        type: "Feature",
        properties: {},
        geometry: {
          type: "MultiPolygon",
          coordinates: [
            [[[102.0, 2.0], [103.0, 2.0], [103.0, 3.0], [102.0, 3.0], [102.0, 2.0]]],
            [[[100.0, 0.0], [101.0, 0.0], [101.0, 1.0], [100.0, 1.0], [100.0, 0.0]],
             [[100.2, 0.2], [100.8, 0.2], [100.8, 0.8], [100.2, 0.8], [100.2, 0.2]]]
          ]
        }
      }]
    };
    result = togpx(geojson);
    result = (new DOMParser()).parseFromString(result, 'text/xml');
    expect(result.getElementsByTagName("wpt")).to.have.length(0);
    expect(result.getElementsByTagName("trk")).to.have.length(1);
    expect(result.getElementsByTagName("rte")).to.have.length(0);
    var trk = result.getElementsByTagName("trk")[0];
    var trksegs = trk.getElementsByTagName("trkseg");
    expect(trksegs).to.have.length(3);
    var trkpts = trksegs[0].getElementsByTagName("trkpt");
    expect(trkpts).to.have.length(5);
    expect(trkpts[0].getAttribute("lat")).to.eql(2.0);
    expect(trkpts[0].getAttribute("lon")).to.eql(102.0);
    // skip remaining points, should be ok
    trkpts = trksegs[1].getElementsByTagName("trkpt");
    expect(trkpts).to.have.length(5);
    expect(trkpts[0].getAttribute("lat")).to.eql(0.0);
    expect(trkpts[0].getAttribute("lon")).to.eql(100.0);
    // skip remaining points, should be ok
    trkpts = trksegs[2].getElementsByTagName("trkpt");
    expect(trkpts).to.have.length(5);
    expect(trkpts[0].getAttribute("lat")).to.eql(0.2);
    expect(trkpts[0].getAttribute("lon")).to.eql(100.2);
    // skip remaining points, should be ok
  });

  // todo: MultiPoint, MultiLineString
  // todo: simple feature (not FeatureCollection)
  // todo: simple objects (not Feature)
  // todo: GeometryCollection

});