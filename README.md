# DataCommon.io

*The MetroBoston DataCommon API*

DataCommon.io opens the data in the [MetroBoston DataCommon](http://metrobostondatacommon.org/) to developers who wish to use data in spatial or non-spatial applications.

All spatial data is served according to the [GeoJSON](http://geojson.org/geojson-spec.html) specification.

You do not need to use JSONP to retrieve the data. The access headers are set to allow [Cross-Origin Resource Sharing, or CORS](http://enable-cors.org/server_expressjs.html).


## Status

The following parts of this document have yet to be implemented. They will be deleted as they are completed.

+ Top level
+ Available datasets
+ Boundaries
  + Get datasets
  + Get multiple datasets
  + Get attributes from verbose list
  + Get attributes from dataset meta
  + Intersect
    + Weight


## API Documentation


Assume HTTP verbs are GET unless otherwise noted.  
*Not familiar with HTTP verbs? [Brush up on them to fully understand the docs](http://net.tutsplus.com/tutorials/other/a-beginners-introduction-to-http-and-rest/).*



------

#### Terminology:

__Geographic Data__: Data that includes or can easily include a spatial component. While the database table of MBTA train station boardings does not itself contain a spatial column, it has a key that can reliably link it to spatial data, making it geographic data.

__Spatial Data__:    Data that specifies a geography in a specified spatial reference system. Spatial data is always geographic data, but geographic data is not always spatial data.

------



### Top Level

You can obtain information about the various datasets by calling any of the following:

`datacommon.io/datasets`: All datasets
`datacommon.io/boundaries`: All geographic boundaries
`datacommon.io/spatial`: All spatial data
`datacommon.io/tabular`: All geographic data that does not directly include spatial information in the dataset, but can be linked to one or more geographies.


### Available Datasets
##### What datasets are available?

To view all available datasets, both boundary and non-boundary:

GET `datacommon.io/datasets/list`


To view all available spatial boundary datasets (such as census tracts and school districts):

GET `datacommon.io/boundaries/list`


To view all available spatial datasets (such as MBTA Stations, bus lines, streets, and all boundaries):

GET `datacommon.io/spatial/list`


To view all available non-spatial

GET `datacommon.io/tabular/list`


### Boundaries

#### Get datasets

To retrieve a dataset:

GET `datacommon.io/boundaries/dataset_name`

i.e.
```
datacommon.io/boundaries/census2010_tracts
```


To retrieve multiple datasets:

GET `datacommon.io/boundaries/first_dataset_name,second_dataset_name`

i.e.
```
datacommon.io/boundaries/census2010_tracts,school_districts
```



#### Get attributes of a boundary dataset.

Boundary files are presently limited to either Massachusetts or the Metro Boston area. Information about the extent of the dataset can be obtained by requesting a list of all boundaries verbosely, or by requesting the meta attribute of a known dataset.

Verbose list:

```
datacommon.io/boundaries/list/verbose
```

Meta:
```
datacommon.io/boundaries/census2010_tracts/meta
```



#### Intersect
Let's say you have a specific study area, stored as GeoJSON, and you would like to get data for just that study area. To intersect your area with one or more boundaries, request the following.

__POST__ `datacommon.io/boundaries/dataset_name/intersect/posted_geojson` or
__POST__ `datacommon.io/boundaries/first_dataset_name,second_dataset_name/intersect/posted_geojson`

An implementation of this in jQuery would look like the following. This example assumes you have a GeoJSON polygon stored in a varaiable `geojson` and that you are querying the Census 2010 Tract boundaries.

```javascript

$.ajax({
  url: 'http://datacommon.io/boundaries/census2010_tracts/intersect', 
  type: 'POST', 
  contentType: 'application/json', 
  data: JSON.stringify(geojson),
  success: function(data){
    console.log(JSON.parse(data));
  },
  error: function(e) {
    alert('Error. Please check your JavaScript console.');
    console.log('There was an error posting your GeoJSON: ');
    console.log(e);
  }
});

```

##### Weight

Each polygon returned from an intersect includes a `weight` attribute. If your study area polygon overlaps a polygon in the target dataset (i.e. above: Census 2010 Tracts) by 30%, that [feature](http://geojson.org/geojson-spec.html#feature-objects) in the returned GeoJSON will contain an attribute `weight: 0.3`. That way, your script can take into account the intersected area when summarizing statistics, for example.


Contributing
--------------------

I will happily pull any requests that:

+ include tests
+ do not break existing tests
+ include good documentation


I am running Node on Mac OS 10.8 Mountain Lion for development, planning to run it in production in Ubuntu, on a DigitalOcean box.


### Developer Guidelines

+ All files must be checked into source control. No files should only be on your local machine.
+ Consequently, all secrets and configuration variables should be stored as environment variables. If you are unfamiliar with this practice, please read up on [setting environment variables][setting] and [reading them in Node][reading].

+ Develop on your own branches off of the `develop` branch. The code for the staging server is on `staging`. Production is on `master`.

[setting]: http://askubuntu.com/questions/730/how-do-i-set-environment-variables
[reading]: http://stackoverflow.com/questions/4870328/how-to-read-environment-variable-in-node-js