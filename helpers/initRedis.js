const redis = require("redis");

const client = redis.createClient({
    port: process.env.REDIS_PORT,
    host: process.env.REDIS_HOST,
})


client.on("error", (err) => {
    console.error(err);
})

client.on("ready", () => {
    console.log(`redis Client ready!`);
})

client.on("connect",() => {
    console.log("redis Client connected");
})

client.on("end",()=>{
    console.log("redis Client end");
})

process.on("SIGINT", async () => {
    client.quit()
})

client.connect();

module.exports = client
