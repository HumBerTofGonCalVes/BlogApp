if (process.env.NODE_ENV == "production") {
    module.exports = {
        mongoURI: "mongodb+srv://humbertoGoncalves:Ououou13!@blogapp-humberto-rrpff.mongodb.net/test?retryWrites=true&w=majority"
    };
} else {
    module.exports = {
        mongoURI: "mongodb://localhost/blogapp"
    };
}