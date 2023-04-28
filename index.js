const express = require('express');
const fetch = require('node-fetch');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const port = 3000;
// Support Mutiple Hooks
const COMMIT_HOOKS = [""];
const ISSUE_HOOKS = [""];
const BUILD_HOOKS = [""]






app.all('/*', function (req, res) {
   console.log("-------------- New Request --------------");
   console.log("Headers:"+ JSON.stringify(req.headers, null, 3));
   console.log("Body:"+ JSON.stringify(req.body, null, 3));
   console.log("-----------------------------------------");

    // Organization Wide Commit
    if (req.body["organization"] && req.body["commits"]) {
         sendHook(
             req.body["sender"]["login"],
             req.body["sender"]["avatar_url"],
             `${req.body["head_commit"]["message"]} \n`+`-[${req.body["sender"]["login"]}](${req.body["sender"]["url"]}) on [${req.body["organization"]["login"]}](${req.body["organization"]["url"]})/[${req.body["repository"]["name"]}](${req.body["repository"]["url"]})`,
             "commit"
         )
    }
    if (req.body["action"] && req.body["issue"] && req.body["body"] == null) {
        if (req.body["action"] == "opened" || req.body["action"] == "closed" || req.body["action"] == "reopened") {
            sendHook(
                req.body["sender"]["login"],
                req.body["sender"]["avatar_url"],
                `[${req.body["issue"]["title"]}](${req.body["issue"]["url"]}) ${req.body["action"].charAt(0).toUpperCase() + req.body["action"].slice(1)}\n -[${req.body["sender"]["login"]}](${req.body["sender"]["url"]}) on [${req.body["organization"]["login"]}](${req.body["organization"]["url"]})/[${req.body["repository"]["name"]}](${req.body["repository"]["url"]})`,
                "issue"
            )
        }
    }
    if (req.body["action"] && req.body["issue"] && req.body["comment"]) {
        sendHook(
            req.body["sender"]["login"],
            req.body["sender"]["avatar_url"],
            `${req.body["comment"]["body"]} \n-[${req.body["sender"]["login"]}](${req.body["sender"]["url"]}) on [${req.body["organization"]["login"]}](${req.body["organization"]["url"]})/[${req.body["repository"]["name"]}](${req.body["repository"]["url"]})/[${req.body["issue"]["title"]}](${req.body["issue"]["url"]}) `,
            "issue"
        )
    }
    if (req.body["action"] && req.body["workflow_job"]) {
        sendHook(
            req.body["sender"]["login"],
            req.body["sender"]["avatar_url"],
            `${req.body["workflow_job"]["name"]} ${req.body["action"].charAt(0).toUpperCase() + req.body["action"].slice(1)}\n [${req.body["organization"]["login"]}](${req.body["organization"]["url"]})/[${req.body["repository"]["name"]}](${req.body["repository"]["url"]})`,
            "build"
        )
    }

    res.status(200).send('OK');
})


const sendHook = (username, avatar, message, type) => {
    const fetchFunction = (username, avatar, message, webhook) => {
        fetch(webhook, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                avatar_url: avatar,
                content: message
            })
        })
    }
    switch (type) {
        case "commit":
            for (let i = 0; i < COMMIT_HOOKS.length; i++) fetchFunction(username, avatar, message, COMMIT_HOOKS[i])
            break;
        case "issue": 
            for (let i = 0; i < ISSUE_HOOKS.length; i++) fetchFunction(username, avatar, message, ISSUE_HOOKS[i])
            break;
        case "build":
            for (let i = 0; i < BUILD_HOOKS.length; i++) fetchFunction(username, avatar, message, BUILD_HOOKS[i])
            break;
        default:
            console.log("Error: Invalid type")
            break;
    }
}

app.listen(port, function () {
   console.log(`Example app listening at ${port}`)
})