curl http://localhost:3000/aj/list
curl http://localhost:3000/aj/add/one
curl http://localhost:3000/aj/add/two
curl -d "three" --header "content-type: text/plain"  http://localhost:3000/aj/add
curl http://localhost:3000/aj/list
curl http://localhost:3000/aj/list/2
curl http://localhost:3000/aj/id
curl http://localhost:3000/aj/removeall
curl http://localhost:3000/aj/list
