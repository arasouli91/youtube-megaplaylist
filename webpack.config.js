const Dotenv = require('dotenv-webpack')

module.exports = {
    module: {
        rules: [
            {
                test: /\.worker\.js$/,
                use: { loader: "worker-loader" },
            },
        ],
    },
    plugins: [
        new Dotenv()
    ]
};

