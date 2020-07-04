# CI-STEP

This repo contains the code of sever of the ci-step system.  
You can visit the repo of ci-step-workers via this link [sukhiboi/ci-tool-worker](https://github.com/sukhiboi/ci-tool-worker)  
You can visit the ci-step system via this link [ci-tool](https://ci-step.herokuapp.com)

---
## How to run the server  

You can start the server as following

```bash
npm start
```

It will listen to a port available in the environment (environment variable) by default. But if port not available it will listen to localhost:4000

---
## Endpoints

- ### **/payload**

  This endpoint should be set as the github repository webhook url. It accepts a POST request.  
   The Github payload sended to this endpoint will be parsed and then saved on redis.

- ### **/results/:id**
  This endpoint will return back a json when hit. It accepts a GET request. You need to provide your job id in order to get your result. This will go to redis and fetch your job's current details.


---
## How it works

- It accepts the github payload on /payload endpoint
- Parse it, create a job object
- Push the jobId to testing queue
- Push the jobId to linting queue
- Push the job object to redis

---
## How can I connect my repo with this system

Go to your repo > Settings > Webhooks > Add Webhook  

It's simple just copy this URL https://ci-step.herokuapp.com and paste it as you payload. 

Select content type as application/json. 

Select the event as push event and save the webhook

On every push the system will lint and test your code.

---

## External Libraries used

- #### [Listr](https://www.npmjs.com/package/listr)
- #### [Redis](https://www.npmjs.com/package/redis)