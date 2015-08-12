# sashimi-testapp
Simple angular webapp for sashimi.

From the sashimi-testapp root directory:
```
go run $GOPATH/src/github.com/ionous/sashimi/_examples/webapp.go -story sushi .
```
Then, if it doesn't open your browser automatically, go to http://localhost:8080/app/.

See also: https://github.com/ionous/sashimi and https://github.com/ionous/sashimi/blob/master/_examples/angular.go.

NOTE: The testapp has a loose dependency on npm, bower, and karma; it should run fine without those: the pages are currently setup to pull from cdns for the important bits.


