import { createClient } from "redis";

const client = createClient();

await client.connect();

while(true){
    const result = await client.xRead({
        key: "trades",
        id: '$' // only new message
    }, {
        BLOCK: 0 // wait forever
    })



    console.log('result', result)
    if(result){

    }
}