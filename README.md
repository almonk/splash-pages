# Running locally:

```
$ npm install
$ bundle install
$ gulp watch
```

[http://localhost:8000/index.html](http://localhost:8000/index.html)

# Deploying manually

Set up AWS credentials (web ops):
```
export GC_AWS_ACCESS_KEY=ask webops
export GC_AWS_ACCESS_KEY=ask webops
```

Testing:
```
$ make deploy target=live-staging
```

Production:
```
$ make deploy target=live-production
```
