# MEGAFUNNEL

Stream massive amounts of time series data (analytics) into timeseries database (rotating log files)

## Overview

Megafunnel is basically just log files. It's about writing really big log files
really really fast.

If you have gigabytes of log files per day (or hundreds of gigabytes!),
then you need _MEGAFUNNEL_.

`megafunnel` uses the fastest database for writes: Append-only Files,
and rotating them (by default) at 1gb each. (todo: then uploading them to S3)

## Setup

```
npm install -g megafunnel
```

then create some servers, one should have a large harddisk,
because that is where the data will go.

``` bash
#create the directory the logs will live in.
mkdir -p ~/.megafunnel 

# start the large server instance.
# will create a server on http:4000, and tcp:4002
megafunnel
```

then start a funnel instance.

``` bash
# will create a server on http:4001
megafunnel-funnel --megaHost $MEGAHOST
```

pass in the ip address of the machine that is running `megafunnel`.
(by default `megaHost=localhost`)
Since megafunnel uses [rc](https://github.com/dominictarr/rc)
you can also set this in a configuration file (`~/.megafunnel/config`)

`megafunnel-funnel` instances validate the input, and add timestamps
(which will later be used to query the data). When running in production
you run several funnel instances, and they aggregate incomming analytics
data into a single stream into `megafunnel` (funneling in from thousands
of connections to just a few)

## configuration

megafunnel has default that will just work when you run it on localhost,
but if you are running it in production (with more than 1 funnel instances,
and the megafunnel instance on another machine then a configuration file is necessary)

If the default ports are used, the only setting required is `megaHost`

``` js
{
  "megaHost": {domain or ip address}
}
```

If you also use [megafunnel-view](https://github.com/micnews/megafunnel-view)
then that stores view patterns in the configuration file.

## network/HTTP Api

### http: megafunnel-funnel (default port: 4001)

to the `megafunnel-funnel` api, running on port 4001 by default.

#### POST /track

post csv data to the funnels.

#### GET /script.js

Get a tracking script that will point back at the funnel server.
this is an instance of [https://github.com/micnews/condor](condor)
This will track lots of things about page visits.
Of course, you can send any valid csv data here.

### tcp: megafunnel (default tcp port: 4002)

Connect to the aggregator. This is a plain tcp connection,
http is not used because tcp is a much more predictable stream,
and automatic reconnections work much better, and also there is less overhead.

This should be considered a private api, this instance does not do any
validation so this port should not be exposed over your firewall.

### http: megafunnel (default port: 4000

#### GET /query?gt={startDate}&lt={endDate}

query a range of log data. `startDate` and `endDate`
should be ISO formatted dates. if not provided, `startDate` defaults
to 1st Jan 1970, and `endDate` defaults to the current time.

## License

MIT
