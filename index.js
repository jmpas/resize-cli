#!/usr/bin/env node --harmony
import path from 'path'
import fs from 'fs'
import aspect from 'aspectratio'
import imageSize from 'image-size'
import meow from 'meow'
import resizeImg from 'resize-img'
import logSymbols from 'log-symbols'

const cli = meow(`
  Usage
    $ resize <input>

  Options
    --suffix, -s Suffix for all new generated files
    --max-width, -w Max width
    --max-height, -h Max height
    --out-dest, -o Output destination path

  Examples
    $ resize ./images/**/* -w 450 -h 450
    $ resize ./images/**/* -w 450 -h 450 -o ./dist/images/
    $ resize ./images/**/* -w 450 -h 450 -o ./dist/images/ -s ".min"
`, {
  alias: {
    w: 'max-width',
    h: 'max-height',
    o: 'output',
    s: 'suffix'
  }
})

const {input: images, flags} = cli

const promises = images
  .map(async imgPath => {
    const {w, h, s: suffix, o: outputPath} = flags
    const fileInfo = getFileInfo(imgPath, suffix)

    const [size, imageBuffer] = await Promise.all([sizeOf(imgPath), getBuf(imgPath)])

    const {width, height} = size
    const [newWidth, newHeight] = aspect.resize(width, height, w, h)

    console.log(logSymbols.success, `Getting data from ${fileInfo.fullName}`)

    let resizedBuffer
    try {
      resizedBuffer = await resizeImg(imageBuffer, {width: newWidth, height: newHeight})
      console.log(logSymbols.success, `Resizing ${fileInfo.fullName}`)
    } catch (err) {
      console.log(logSymbols.error, `Resizing ${fileInfo.fullName} Error: ${err}`)
      return Promise.reject(err)
    }

    try {
      await writeFile(outputPath, fileInfo.nameWithSuffix, resizedBuffer)
      console.log(logSymbols.success, `Saving ${fileInfo.nameWithSuffix}`)
    } catch (err) {
      console.log(logSymbols.error, `Saving ${fileInfo.nameWithSuffix} Error: ${err}`)
      return Promise.reject(err)
    }
  })

Promise.all(promises)
  .then(() => console.log(logSymbols.success, 'All images were successfuly resized.'))
  .catch(err => console.log(logSymbols.warning, err))

function writeFile(dest, fileName, buf) {
  return new Promise((resolve, reject) => {
    fs.writeFile(
      path.resolve(dest, fileName),
      buf,
      err => err ? reject(err) : resolve(fileName))
  })
}

function sizeOf(img) {
  return new Promise((resolve, reject) => {
    imageSize(
      path.resolve(img),
      (err, dimensions) => err ? reject(err) : resolve(dimensions))
  })
}

function getBuf(img) {
  return new Promise((resolve, reject) => {
    fs.readFile(
      path.resolve(img),
      (err, buf) => err ? reject(err) : resolve(buf))
  })
}

function getFileInfo(path, suffix = '') {
  const fullName = path.split('/').pop()
  const infos = fullName.split('.')
  const name = infos.slice(0, -1).join('.')
  const extension = infos.pop()
  const nameWithSuffix = `${name}${suffix}.${extension}`

  return {name, nameWithSuffix, extension, fullName}
}
