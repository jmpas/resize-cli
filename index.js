import path from 'path'
import fs from 'fs'
import aspect from 'aspectratio'
import imageSize from 'image-size'
import meow from 'meow'
import resizeImg from 'resize-img'
import logSymbols from 'log-symbols'

function writeFile(dest, fileName, suffix = '', buf) {
  return new Promise((resolve, reject) => {
    const arr = fileName.split('.')
    const name = arr.slice(0, -1).join('.')
    const extension = arr.pop()
    const nameWithSuffix = `${name}${suffix}.${extension}`
    fs.writeFile(
      path.resolve(dest, nameWithSuffix),
      buf,
      err => err ? reject({msg: err, fileName: nameWithSuffix}) : resolve(nameWithSuffix))
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

const cli = meow(`
  Usage
    $ resize <input>

  Options
    --suffix, -s Specifies a suffix for the new files
    --max-width, -w Specifies the new width
    --max-height, -h Specifies the new height
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
  .map(imgPath => {
    const fileName = imgPath.split('/').pop()
    const size = sizeOf(imgPath)

    return {imgPath, fileName, size}
  })
  .map(async img => {
    const {width, height} = await img.size
    const {w, h} = flags
    const [newWidth, newHeight] = aspect.resize(width, height, w, h)

    console.log(logSymbols.success, `Getting data from ${img.fileName}`)

    return Object.assign({}, img, {width: newWidth, height: newHeight})
  })
  .map(async img => {
    try {
      const {fileName, imgPath, width, height} = await img

      const imageBuffer = await getBuf(imgPath)
      const resizedBuffer = await resizeImg(imageBuffer, {width, height})
      console.log(logSymbols.success, `Resizing ${fileName}`)

      return {
        fileName,
        buf: resizedBuffer
      }
    } catch (err) {
      return Promise.reject(err)
    }
  })
  .map(async resizedImg => {
    try {
      const {fileName, buf} = await resizedImg
      return writeFile(flags.o, fileName, flags.s, buf)
    } catch (err) {
      return Promise.reject(err)
    }
  })
  .map(async data => {
    try {
      const fileName = await data
      console.log(logSymbols.success, `Saving ${fileName}`)
    } catch (err) {
      return console.log(logSymbols.error, `Saving ${fileName}`)
    }
  })

Promise.all(promises)
  .then(() => console.log(logSymbols.success, 'All images were successfuly resized.'))
  .catch((err) => console.log(logSymbols.warning, err))
