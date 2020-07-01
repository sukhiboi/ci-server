curl --header "Content-Type: application/json" \
  --request POST \
  --data '{"repository": { "clone_url": "https://github.com/sukhiboi/calc.git", "name": "calc" } }' \
  https://linter-step.herokuapp.com/payload

  curl --header "Content-Type: application/json" \
  --request POST \
  --data '{"repository": { "clone_url": "https://github.com/sukhiboi/sum.git", "name": "sum" } }' \
  https://linter-step.herokuapp.com/payload

  curl --header "Content-Type: application/json" \
  --request POST \
  --data '{"repository": { "clone_url": "https://github.com/step-batch-7/todo-sukhiboi.git", "name": "todo-sukhiboi" } }' \
  https://linter-step.herokuapp.com/payload

  curl --header "Content-Type: application/json" \
  --request POST \
  --data '{"repository": { "clone_url": "https://github.com/step-batch-7/jsTools-sukhiboi.git", "name": "jsTools-sukhiboi" } }' \
  https://linter-step.herokuapp.com/payload

  curl --header "Content-Type: application/json" \
  --request POST \
  --data '{"repository": { "clone_url": "https://github.com/sukhiboi/matchFiles.git", "name": "matchFiles" } }' \
  https://linter-step.herokuapp.com/payload