## 3scale Identity provider with Oauth 2.0 authorization code flow with nginx

This tutorial is a sample IDP developed by 3scale to give you a look and feel how an Identity provider connects and exchanges messages between

1. Google Playground - Client Application
2. Identity provider - Developed in node.js and mongoDB as database to store the user credentials
3. Nginx - Authorization endpoints 
4. Redis server - To store the access_tokens
5. 3scale - Authorization backend for validating the tokens and generating the client_id and client_secret

##Prerequisites


