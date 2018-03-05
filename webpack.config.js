const path  = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextWebpackPlugin = require('extract-text-webpack-plugin');
const browsers = [ 'ie 10', 'last 2 versions' ];
module.exports = {
	mode: 'development', 
	entry: './src/index.js',
	output: {
		path: path.resolve(__dirname, 'dist'), 
		filename: '[name].js', 
	}, 
	devServer: {
		host: '0.0.0.0', 
		port: 3000, 
		disableHostCheck: true, 
	}, 
	plugins :[
		new CleanWebpackPlugin([
			'./dist', 
		]), 
		new HtmlWebpackPlugin({
			title: 'development', 
		}), 
		new ExtractTextWebpackPlugin(
			'[name].css'
		), 
	], 
	module: {
		rules: [
			{
				test: /\.jsx?$/, 
				exclude: /node_modules/, 
				use: [
					{
						loader: 'babel-loader', 
						options: { 
							presets: [
								[ 'env', { targets: { browsers } } ], 
								'react', 
							], 
							plugins: [
								'transform-object-rest-spread', 
								'transform-class-properties', 
								'transform-decorators', 
							], 
						}, 
					}, 
				], 
			}, 
			{
				test: /\.(css|s[ac]ss)$/, 
				use: ExtractTextWebpackPlugin.extract({
					fallback: 'style-loader', 
					use: [
						{
							loader: 'css-loader', 
						}, 
						{
							loader: 'postcss-loader', 
							options: { plugins: [ require('autoprefixer')({ targets: { browsers } }) ] }, 
						}, 
						{
							loader: 'sass-loader', 
						}, 
					], 
				}), 
			}, 
			{
				test: /(\.(eot|[ot]tf|woff2?)|.*font.*\.svg)$/, 
				use: [
					{
						loader: 'file-loader', 
						options: {
							name: path =>
							{
								return path.replace(/.*node_modules\//, 'fonts/vendor/');
							}
						}, 
					}, 
				], 
			}, 
		], 
	}, 
};