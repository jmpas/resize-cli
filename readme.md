# $ resize
[![Build Status](https://travis-ci.org/Nipher/resize-cli.svg?branch=master)](https://travis-ci.org/Nipher/resize-cli)

Terminal client to resize images keeping the aspect ratio

`$ npm i -g resize-cli`

### Usage

`$ resize ./images/*`

### Options

- `--suffix, -s Suffix for all new generated files`
- `--max-width, -w Max width`
- `--max-height, -h Max height`
- `--out-dest, -o Output destination path`

### Examples

- `$ resize ./images/* -w 450 -h 450`
- `$ resize ./images/* -w 450 -h 450 -o ./dist/images/`
- `$ resize ./images/* -w 450 -h 450 -o ./dist/images/ -s ".min"`

### License

MIT License
