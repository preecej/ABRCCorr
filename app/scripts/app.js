/*global _*/
/*jshint camelcase: false*/
/*global cytoscape*/
(function(window, $, _,cytoscape, undefined) {
  'use strict';

  console.log('Hello, workshop tutorial!');

  var appContext = $('[data-app-name="workshop-tutorial"]');


    var nodeClick = function(evt){
        var locus = evt.cyTarget.id();


        window.Agave.api.adama.search( //
            {'namespace': 'aip', 'service': 'locus_gene_report_v0.1', 'queryParams': {'locus': locus}},

            function(search) {
                var name=_.findWhere(search.obj.result[0].properties,{type:'name'}).value;
                $('#details').text(locus+' -> '+name);
            }
        );
    };

  /*
   * ADAMA - Araport Data API Mediator API
   * getStatus()
   * getNamespaces()
   * getServices()
   * search()
   *
   * Data APIs
   * {'namespace': 'aip', 'service': 'atted_coexpressed_by_locus_v0.1'}
   * {'namespace': 'aip', 'service': 'locus_gene_report_v0.1'}
   */
    $('#submit').on('click', function(e) {
        e.preventDefault();

        var Agave = window.Agave;

        var thresh = $('#thresh').val();
        if(thresh === 0 || thresh === ''){
            thresh = 0.8;
            $('#thresh').val(0.8);
        }

        var query = {
            locus: $('#wt_locus').val(),
            relationship_type: 'correlation_coefficient',
            threshold: thresh
        };

        var attedNetwork = {};

        attedNetwork.name = 'ATTED';
        attedNetwork.source = 'atted.jp project';
        //blue & red
        Agave.api.adama.getStatus({}, function(resp) { // for parameter1
            if (resp.obj.status === 'success') {
                Agave.api.adama.search(
                    {'namespace': 'aip', 'service': 'atted_coexpressed_by_locus_v0.1', 'queryParams': query},
                    function(search) {

                        var edges = {
                            color : 'blue',
                            edge : []
                        };

                        $.each(search.obj.result,function(index,pair){
                            var edge = {
                                source : query.locus,
                                target : pair.related_entity,
                                weight : pair.relationships[0].scores[0].correlation_coefficient
                            };
                            edges.edge.push(edge);
                        });

                        attedNetwork.edges = edges;

                        //init(attedNetwork);

                        var abrcNetwork = {};
                        abrcNetwork.name = 'ABRC Ordering Data';
                        abrcNetwork.source = 'The ABRC - OSU';
                        Agave.api.adama.search(
                            {'namespace':'tkdbb84','service':'abrc_coordering_by_locus_v0.3','queryParams':{'locus':query.locus }},
                            function(response){
                                var edges = {
                                    color : 'red',
                                    edge : []
                                };
                                $.each(response.obj.result, function(index,pair){
                                    //console.log(pair);
                                    var key = Object.keys(pair)[0];
                                    var edge = {
                                        target : key,
                                        source : query.locus,
                                        weight : pair[key]
                                    };
                                    edges.edge.push(edge);
                                });
                                abrcNetwork.edges = edges;
                                var defaultNode = query.locus;
                                init(attedNetwork,abrcNetwork,defaultNode);
                            }
                        );


                        /* all the code above again.... */


                    });
            } else {
                $('.messages', appContext).append('<div class="alert alert-danger">The Query Service is currently unavailable. Please try again later.</div>');
            }
        });

    });


    /***Network Drawing******/

    /**
     * @param1 Network 1
     * {
     *  name : string
     *  source : string
     *  edges : {
     *      color : string[hex-code]
     *      edge : [
     *              {
     *                   target : "agi"
     *                  source : "agi"
     *                  weight : int
     *              },
     *              {...}
     *          ]
     *      }
     * }
     * @param2 Network 2
     * ...
     * @paramN network N
     */


    var addNodes = function(cyto, network){
        var color = network.edges.color;
        var maxEdge = 0;
        $.each(network.edges.edge,function(index,obj) {

            if(obj.weight > maxEdge){
                maxEdge = obj.weight;
            }

            var $source;
            if ((cyto.nodes('#' + obj.source)).length > 0) {
                $source = cyto.nodes('#' + obj.source);
            } else {
                $source = cyto.add({
                    group: 'nodes',
                    name : 'bob',
                    data: {id: obj.source},
                    position : {
                        x : 100,
                        y : 100
                    },
                    css : {
                        'height': '10px',
                        'width':'10px',
                        'background-color' : 'black'
                    }
                });
            }

            var $target;
            if ((cyto.nodes('#' + obj.target)).length > 0) {
                $target = cyto.nodes('#' + obj.target);
            } else {
                $target = cyto.add({
                    group: 'nodes',
                    name: 'bob',
                    data: {id: obj.target},
                    position : {
                        x : 100,
                        y : 100
                    },
                    css : {
                        'height': '10px',
                        'width':'10px',
                        'background-color' : 'black'
                    }
                });
            }
        });

        $.each(network.edges.edge,function(index,obj){
            var edgeWeight = (obj.weight / maxEdge) * 10;
            if( edgeWeight < 1 ){
                edgeWeight = 1;
            }
            cyto.add({
                group: 'edges',
                data: {
                    id: network.name+'-'+obj.source+'-'+obj.target,
                    source: obj.source,
                    target: obj.target,
                    weight: obj.weight
                },
                'curve-style': 'bezier'
            }).css({'line-color' : color, 'width' : edgeWeight});

        });
    };

    var init = function(){
        var numNetworks = arguments.length;
        var args = arguments;
        var cyto = cytoscape({

            container: document.getElementById('cytoscape_div'),

            layout: {
                name: 'grid',
                padding: 10
            },
            style: cytoscape.stylesheet(),
            ready: function(){




                for (var i = 0 ; i < numNetworks - 1; i++){
                    addNodes(cyto,args[i]);
                }

                cyto.layout({
                    name:'circle',
                    minNodeSpacing: 10,
                    avoidOverlap:true,
                    height: 1000,
                    width: 1000,
                    startAngle : 3/2 * Math.PI
                });

                cyto.zoom(1,{x:0,y:0});
                cyto.fit(cyto.nodes(),100);
                cyto.nodes().css({'width':'20px','height':'20px'});
                console.log('Finished & Resized');
            }

        });

        cyto.on('tap', 'node',nodeClick);
         nodeClick({cyTarget : { id: function () {return args[numNetworks-1];}}});

    };




})(window, jQuery, _,cytoscape);