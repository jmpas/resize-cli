# $ resize

Terminal client to resize images keeping the aspect ratio

### Usage

`$ resize ./images/*`

### Options

`--suffix, -s Suffix for all new generated files`
`--max-width, -w Max width`
`--max-height, -h Max height`
`--out-dest, -o Output destination path`

### Examples

`$ resize ./images/* -w 450 -h 450`
`$ resize ./images/* -w 450 -h 450 -o ./dist/images/`
`$ resize ./images/* -w 450 -h 450 -o ./dist/images/ -s ".min"`
