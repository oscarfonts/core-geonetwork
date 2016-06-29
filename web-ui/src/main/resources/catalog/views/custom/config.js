(function() {

  goog.provide('gn_search_custom_config');

  var module = angular.module('gn_search_custom_config', []);

  module.value('gnTplResultlistLinksbtn',
      '../../catalog/views/custom/directives/partials/linksbtn.html');

  module
      .run([
        'gnSearchSettings',
        'gnViewerSettings',
        'gnOwsContextService',
        'gnMap',
        function(searchSettings, viewerSettings, gnOwsContextService, gnMap) {
          // Load the context defined in the configuration
          viewerSettings.defaultContext =
            viewerSettings.mapConfig.viewerMap ||
            '../../map/config-viewer.xml';

          // Keep one layer in the background
          // while the context is not yet loaded.
          viewerSettings.bgLayers = [
            gnMap.createLayerForType('osm')
          ];

          viewerSettings.servicesUrl =
            viewerSettings.mapConfig.listOfServices || {};

          var bboxStyle = new ol.style.Style({
            stroke: new ol.style.Stroke({
              color: 'rgba(255,0,0,1)',
              width: 2
            }),
            fill: new ol.style.Fill({
              color: 'rgba(255,0,0,0.3)'
            })
          });
          searchSettings.olStyles = {
            drawBbox: bboxStyle,
            mdExtent: new ol.style.Style({
              stroke: new ol.style.Stroke({
                color: 'orange',
                width: 2
              })
            }),
            mdExtentHighlight: new ol.style.Style({
              stroke: new ol.style.Stroke({
                color: 'orange',
                width: 3
              }),
              fill: new ol.style.Fill({
                color: 'rgba(255,255,0,0.3)'
              })
            })

          };


          /*******************************************************************
             * Define IDEC Base Layers
             */
          var URL = {
              MON: 'http://www.{a-c}.instamaps.cat/mapcache/tms/1.0.0/mon3857@GM8/{z}/{x}/{-y}.jpeg',
              MQ: 'http://otile{1-4}.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.png',
              TOPOICC: 'http://mapcache.{a-c}.icc.cat/map/bases_noutm/wmts/topo/GRID3857/{z}/{x}/{y}.jpeg',
              TOPOICC_GEO_MON: 'http://www.{a-c}.instamaps.cat/mapcache/tms/1.0.0/A250MON@GM14/{z}/{x}/{-y}.png',
              TOPOICC_GEO_1: 'http://www.{a-c}.instamaps.cat/mapcache/tms/1.0.0/A250TARJ3857@GMTOT/{z}/{x}/{-y}.png',
              ESRI: 'http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
              ORTOINSTAMAPS: 'http://www.{a-c}.instamaps.cat/mapcache/tms/1.0.0/orto3857_12@GMTOT/{z}/{x}/{-y}.png',
              ORTOICC: 'http://mapcache.{a-c}.icc.cat/map/bases_noutm/wmts/orto/GRID3857/{z}/{x}/{y}.jpeg',
              HIBRIDICGC: 'http://www.{a-c}.instamaps.cat/mapcache/tms/1.0.0/hibrid3857@GMTOT/{z}/{x}/{-y}.png'
          }

          function resolution(zoom) {
            var equator = 40075016.686;
            var tilesize = 256;
            return equator / (tilesize*Math.pow(2,zoom));
          };

          function layer(options) {
            return new ol.layer.Tile({
              minResolution: resolution(options.maxZoom)-1,
              maxResolution: resolution(options.minZoom)+1,
              source: new ol.source.XYZ({
                url: options.url,
                minZoom: options.minZoom,
                maxZoom: options.maxZoom
              })
            });
          }

          var backgrounds = {
            topo: [
              layer({
                url: URL.MON,
                minZoom: 0,
                maxZoom: 6
              }),
              layer({
                url: URL.MQ,
                minZoom: 7,
                maxZoom: 19
              }),
              layer({
                url: URL.TOPOICC,
                minZoom: 7,
                maxZoom: 20
              })
            ],
            simple: [
              layer({
                url: URL.TOPOICC_GEO_MON,
                minZoom: 1,
                maxZoom: 14
              }),
              layer({
                url: URL.MQ,
                minZoom: 15,
                maxZoom: 18
              }),
              layer({
                url: URL.TOPOICC_GEO_1,
                minZoom: 8,
                maxZoom: 18
              })
            ],
            orto: [
              layer({
                url: URL.ESRI,
                minZoom: 0,
                maxZoom: 19
              }),
              layer({
                url: URL.ORTOINSTAMAPS,
                minZoom: 0,
                maxZoom: 12
              }),
              layer({
                url: URL.ORTOICC,
                minZoom: 13,
                maxZoom: 20
              })
            ],
            hibrid: [
              layer({
                url: URL.ESRI,
                minZoom: 0,
                maxZoom: 18
              }),
              layer({
                url: URL.ORTOICC,
                minZoom: 13,
                maxZoom: 18
              }),
              layer({
                url: URL.HIBRIDICGC,
                minZoom: 0,
                maxZoom: 17
              })
            ]
          };

          /*******************************************************************
             * Define maps
             */
          var mapsConfig = {
            center: ol.proj.transform([2.1685, 41.3818], 'EPSG:4326', 'EPSG:3857'),
            zoom: 8,
            minZoom: 1
            //maxResolution: 9783.93962050256
          };

          var viewerMap = new ol.Map({
            controls: [],
            layers: backgrounds.simple,
            view: new ol.View(mapsConfig)
          });

          var searchMap = new ol.Map({
            controls:[],
            layers: backgrounds.simple,
            view: new ol.View(mapsConfig)
          });


          /** Facets configuration */
          searchSettings.facetsSummaryType = 'details';

          /*
             * Hits per page combo values configuration. The first one is the
             * default.
             */
          searchSettings.hitsperpageValues = [20, 50, 100];

          /* Pagination configuration */
          searchSettings.paginationInfo = {
            hitsPerPage: searchSettings.hitsperpageValues[0]
          };

          /*
             * Sort by combo values configuration. The first one is the default.
             */
          searchSettings.sortbyValues = [{
            sortBy: 'relevance',
            sortOrder: ''
          }, {
            sortBy: 'changeDate',
            sortOrder: ''
          }, {
            sortBy: 'title',
            sortOrder: 'reverse'
          }, {
            sortBy: 'rating',
            sortOrder: ''
          }, {
            sortBy: 'popularity',
            sortOrder: ''
          }, {
            sortBy: 'denominatorDesc',
            sortOrder: ''
          }, {
            sortBy: 'denominatorAsc',
            sortOrder: 'reverse'
          }];

          /* Default search by option */
          searchSettings.sortbyDefault = searchSettings.sortbyValues[0];

          /* Custom templates for search result views */
          searchSettings.resultViewTpls = [{
                  tplUrl: '../../catalog/components/search/resultsview/' +
                  'partials/viewtemplates/grid.html',
                  tooltip: 'Grid',
                  icon: 'fa-th'
                }];

          // For the time being metadata rendering is done
          // using Angular template. Formatter could be used
          // to render other layout

          // TODO: formatter should be defined per schema
          // schema: {
          // iso19139: 'md.format.xml?xsl=full_view&&id='
          // }
          searchSettings.formatter = {
            // defaultUrl: 'md.format.xml?xsl=full_view&id='
            defaultUrl: 'md.format.xml?xsl=xsl-view&uuid=',
            defaultPdfUrl: 'md.format.pdf?xsl=full_view&uuid=',
            list: [{
            //  label: 'inspire',
            //  url: 'md.format.xml?xsl=xsl-view' + '&view=inspire&id='
            //}, {
            //  label: 'full',
            //  url: 'md.format.xml?xsl=xsl-view&view=advanced&id='
            //}, {
              label: 'full',
              url: 'md.format.xml?xsl=full_view&uuid='
              /*
              // You can use a function to choose formatter
              url : function(md) {
                return 'md.format.xml?xsl=full_view&uuid=' + md.getUuid();
              }*/
            }]
          };

          // Mapping for md links in search result list.
          searchSettings.linkTypes = {
            links: ['LINK'],
            downloads: ['DOWNLOAD'],
            layers:['OGC', 'kml'],
            maps: ['ows']
          };

          // Set the default template to use
          searchSettings.resultTemplate =
              searchSettings.resultViewTpls[0].tplUrl;

          // Set custom config in gnSearchSettings
          angular.extend(searchSettings, {
            viewerMap: viewerMap,
            searchMap: searchMap
          });
        }]);
})();
