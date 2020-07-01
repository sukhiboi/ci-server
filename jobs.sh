curl --header "Content-Type: application/json" \
  --request POST \
  --data '{"repository": { "clone_url": "https://github.com/sukhiboi/calc.git", "name": "calc" } }' \
  http://localhost:4000/payload

  curl --header "Content-Type: application/json" \
  --request POST \
  --data '{"repository": { "clone_url": "https://github.com/sukhiboi/sum.git", "name": "sum" } }' \
  http://localhost:4000/payload

  curl --header "Content-Type: application/json" \
  --request POST \
  --data '{"repository": { "clone_url": "https://github.com/step-batch-7/todo-sukhiboi.git", "name": "todo-sukhiboi" } }' \
  http://localhost:4000/payload

  curl --header "Content-Type: application/json" \
  --request POST \
  --data '{"repository": { "clone_url": "https://github.com/step-batch-7/jsTools-sukhiboi.git", "name": "jsTools-sukhiboi" } }' \
  http://localhost:4000/payload

  curl --header "Content-Type: application/json" \
  --request POST \
  --data '{"repository": { "clone_url": "https://github.com/sukhiboi/matchFiles.git", "name": "matchFiles" } }' \
  http://localhost:4000/payload