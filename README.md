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

then start a bunch of "funnels" pointing into this.

``` bash
# will create a server on http:4001
megafunnel-funnel --megaHost $MEGAHOST
```

pass in the ip address of the machine that is running `megafunnel`.
Since megafunnel uses [rc](https://github.com/dominictarr/rc)
you can also set this in a configuration file (`~/.megafunnel/config`)

`megafunnel-funnel` instances validate the input, and add timestamps
(which will later be used to query the data).

## Network Api

### POST megafunnel-funnel:4001/track

post csv data to the funnels.

### GET megafunnel-funnel:4001/script.js

Get a tracking script that will point back at the funnel server.
this is an instance of [https://github.com/micnews/condor](condor)
This will track lots of things about page visits.
Of course, you can send any valid csv data here.

### megafunnel:4002

Connect to the aggregator. This is a plain tcp connection,
http is not used because tcp is a much more predictable stream,
and automatic reconnections work much better, and also there is less overhead.

This should be considered a private api, this instance does not do any
validation so this port should not be exposed over your firewall.

### megafunnel:4000/query?gt={startDate}&lt={endDate}

query a range of log data. `startDate` and `endDate`
should be ISO formatted dates. if not provided, `startDate` defaults
to 1st Jan 1970, and `endDate` defaults to the current time.

## License

MIT
