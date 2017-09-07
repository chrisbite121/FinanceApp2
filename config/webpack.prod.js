// config/webpack.prod.js
const path = require('path');
const webpack = require('webpack');

const helpers = require('./helpers');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const AotPlugin = require('@ngtools/webpack').AotPlugin;
const ngToolsWebpack = require('@ngtools/webpack');

const ENV = process.env.NODE_ENV = process.env.ENV = 'production';
// workaround https://github.com/angular/angular-cli/issues/5329
var aotPlugin = new ngToolsWebpack.AotPlugin({
    tsConfigPath: "./tsconfig.aot.json",
    entryModule: helpers.root('src/app/app.module#AppModule'),
});
aotPlugin._compilerHost._resolve = function(path_to_resolve) {
    path_1 = require("path");
    path_to_resolve = aotPlugin._compilerHost._normalizePath(path_to_resolve);
    if (path_to_resolve[0] == '.') {
        return aotPlugin._compilerHost._normalizePath(path_1.join(aotPlugin._compilerHost.getCurrentDirectory(), path_to_resolve));
    }
    else if (path_to_resolve[0] == '/' || path_to_resolve.match(/^\w:\//)) {
        return path_to_resolve;
    }
    else {
        return aotPlugin._compilerHost._normalizePath(path_1.join(aotPlugin._compilerHost._basePath, path_to_resolve));
    }
};

module.exports = {
    devtool: 'source-map',

    entry: {
        polyfills: './src/polyfills.ts',
        vendor: './src/vendor-aot.ts',
        app: './src/boot-aot.ts'
    },

    output: {
        path: helpers.root('dist/aot'),
        publicPath: '/',
        filename: '[name].[hash].js',
        chunkFilename: '[id].[hash].chunk.js'
    },

    resolve: {
        extensions: ['.js', '.ts']
        // modules: ['./node_modules']
    },

    module: {
        loaders: [
            // {
            //     test: /\.js$/,
            //     loaders: ['angular2-template-loader'],
            //     exclude: /node_modules/
            // },            
            {
                test: /\.ts$/,
                loader: '@ngtools/webpack'
            },
            {
                test: /\.html$/,
                loader: 'html-loader'
            },
            {
                test: /\.(png|jpe?g|gif|svg|woff|woff2|ttf|eot|ico)$/,
                //loader: 'file-loader?name=../Images/[name].[ext]'
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            useRelativePath: false,
                            name: '[name].[ext]',
                            publicPath: '../Images/'
                        }
                    }
                ] 
            },
            {
                // site wide css (excluding all css under the app dir)
                test: /\.css$/,
                exclude: helpers.root('src/app'),
                loader: ExtractTextPlugin.extract({fallback: 'style-loader', use: 'css-loader?sourceMap'})
            },
            {
                // included styles under the app directory - these are for styles included
                // with styleUrls
                test: /\.css$/,
                include: helpers.root('src/app'),
                loader: 'raw-loader'
            },
            {
                test: /\.scss$/,
                loaders: ['raw-loader', 'sass-loader']
            }             
        ]
    },
    plugins: [
        new webpack.optimize.CommonsChunkPlugin({
            name: ['app', 'vendor', 'polyfills']
        }),

        // aotPlugin,

        new AotPlugin ({
            tsConfigPath: './tsconfig.aot.json',
            entryModule: helpers.root('src/app/app.module#AppModule')
          }),

        new HtmlWebpackPlugin({
            template: 'config/index.html'
        }),

        new webpack.optimize.UglifyJsPlugin({
            beautify: false,
            comments: false,
            compress: {
                screw_ie8: true,
                warnings: false
            },
            mangle: {
                keep_fnames: true,
                screw_i8: true
            }
        }),

        new ExtractTextPlugin({filename: '[name].[hash].css'}),

        new webpack.DefinePlugin({
            'process.env': {
                'ENV': JSON.stringify(ENV)
            }
        })
    ]
};