const MongoClient = require("mongodb").MongoClient;

(async function () {

    const mongoClient = new MongoClient("mongodb://localhost:27017/");
    await mongoClient.connect();
    global.db = mongoClient.db('nvv').collection("main");


    //const collection = mongoDB.collection("main");
    //global.db = mongoDB;

    // global.db.insertOne(
    //     {
    //         memory : {
    //             retain : {
    //                 retain_var1 : 1,
    //                 retain_var2 : 2
    //             },
    //             operative : {
    //                 operative_var1 : 3,
    //                 operative_var2 : 4
    //             }
    //         }
    //     }).then(
    //     () => console.log('add')
    // );

    await global.db.updateOne({
                retain_var1 : 1
            },
        { $set: {
                retain_var1 : 55
        }});


})();