# DataCommon.io

*The MetroBoston DataCommon API*

DataCommon.io opens the data in the [MetroBoston DataCommon](http://metrobostondatacommon.org/) to developers who wish to use data in spatial or non-spatial applications.

All spatial data is served according to the [GeoJSON](http://geojson.org/geojson-spec.html) specification.

You do not need to use JSONP to retrieve the data. The access headers are set to allow [Cross-Origin Resource Sharing, or CORS](http://enable-cors.org/server_expressjs.html).


## Status

The following parts of this document have yet to be implemented. They will be deleted as they are completed.

+ Top level
+ Boundaries
  + Get multiple datasets
  + Get attributes from verbose list
  + Weighted Intersect


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








### Tabular

Most of the data in the DataCommon is not itself yet spatial, but can be joined to spatial data.


#### To find out what categories of data are available

__GET__ `datacommon.io/tabular/list`


#### To find out what datasets are available from a category

__GET__ `datacommon.io/tabular/category_name/list`

i.e. __GET__ `datacommon.io/tabular/transportation/list`


#### To retrieve additional information about a dataset

__GET__ `datacommon.io/tabular/category_name/dataset/meta`

i.e. __GET__ `datacommon.io/tabular/transportation/means_transportation_to_work_by_residence/meta`


#### To find information about available summary levels (geography at which attributes are aggregated)

Roughest (largest units): __GET__ `datacommon.io/tabular/category/dataset/roughest`
Finest (smallest units):  __GET__ `datacommon.io/tabular/category/dataset/finest`


#### To discover which fields are available

__GET__ `datacommon.io/tabular/category/dataset/fields`

i.e. __GET__ `datacommon.io/tabular/transportation/traveltime_to_work_by_residence/fields`


#### To retrieve data about a field

__GET__ `datacommon.io/tabular/category/dataset/field_name`

i.e. __GET__ `datacommon.io/tabular/transportation/traveltime_to_work_by_residence/pubtran`


#### To retrieve data about multiple fields

__GET__ `datacommon.io/tabular/category/dataset/field_name,another_field_name`

i.e. __GET__ `datacommon.io/tabular/transportation/traveltime_to_work_by_residence/mcycle,bicycle,walk`








### Spatial + Tabular = Geographic

If the spatial and tabular datasets cannot be joined (i.e. they don't have a common join key), an error will be returned, such as:

```javascript
{
  'status': 'error',
  'message': 'The join key for the tabular and spatial datasets are different.',
  'datasets':[
    {
      'name': 'mapc_municipalities',
      'key':  'muni_id',
      'type': 'spatial',
    },
    {
      'name': 'traveltime_to_work_by_residence',
      'key':  'census_tract',
      'type': 'tabular',
    }
  ]
}

```

#### To attach __all__ attributes from a table to specified spatial data

__GET__ `datacommon.io/geographic/category/dataset/spatial/dataset/`

i.e. __GET__ `datacommon.io/geographic/health/disease_rates/spatial/hospitals/`


#### To attach __select__ attributes from a table to specified spatial data

__GET__ `datacommon.io/geographic/category/dataset/field(s)/spatial/dataset/`

i.e. __GET__ `datacommon.io/geographic/health/disease_rates/malaria_cases/spatial/hospitals/`
i.e. __GET__ `datacommon.io/geographic/health/disease_rates/malaria_cases,patient_deaths/spatial/hospitals/`


#### To attach attributes to the roughest or finest available summary level

__GET__ `datacommon.io/geographic/category/dataset/spatial/roughest/`
__GET__ `datacommon.io/geographic/category/dataset/spatial/finest/`

__GET__ `datacommon.io/geographic/category/dataset/field(s)/spatial/roughest/`
__GET__ `datacommon.io/geographic/category/dataset/field(s)/spatial/finest/`


#### To retrieve attribute data tied to spatial data with an intersect

__GET__ `datacommon.io/geographic/category/dataset/spatial/dataset/intersect/posted_geojson`

__GET__ `datacommon.io/geographic/category/dataset/spatial/roughest/intersect/posted_geojson`
__GET__ `datacommon.io/geographic/category/dataset/spatial/finest/intersect/posted_geojson`








Contributing
--------------------

I will happily pull any requests that:

+ include tests
+ do not break existing tests
+ include good documentation


I am running Node on Mac OS 10.8 Mountain Lion for development, planning to run it in production in Ubuntu, on a DigitalOcean box.


### Getting Ready to Develop (Mac OS X)

#### Check Installation
Ensure that Node.js is installed by typing `node --version` into Terminal. You should see a version number like `v0.10.18`.
Ensure NPM (Node Package Manager) by typing `npm --version`. You should see a version number like `1.3.8`.

#### Install Node with Homebrew

If Node is not installed, see if you can install it with Homebrew.

Check if Homebrew is installed by typing `brew --version` into Terminal. You should see a version number like `0.9.5`.

In Terminal, enter `brew update`. This will update the list of available 'formulae' of software packages for installation. Always perform `brew update` before using Homebrew -- it's the one thing that always gets people stuck.

Enter `brew install node`. This will install Node.js.

#### Install NPM

In Terminal, enter `curl http://npmjs.org/install.sh | sh`.

#### Fork and Clone This Repository

On the right of any [GitHub page for datacommon-io](https://github.com/MAPC/datacommon-io), find the "__SSH__ clone URL" and copy it.

In Terminal, enter `git clone ` and copy the URL, so the Terminal reads:

`git clone git@github.com:MAPC/datacommon-io.git`


#### Install Dependencies

To download all the dependencies, in Terminal, run `sudo npm install`.


### Developer Guidelines

+ All files must be checked into source control. No files should only be on your local machine.
+ Consequently, all secrets and configuration variables should be stored as environment variables. If you are unfamiliar with this practice, please read up on [setting environment variables][setting] and [reading them in Node][reading].

+ Develop on your own branches off of the `develop` branch. The code for the staging server is on `staging`. Production is on `master`.

[setting]: http://askubuntu.com/questions/730/how-do-i-set-environment-variables
[reading]: http://stackoverflow.com/questions/4870328/how-to-read-environment-variable-in-node-js