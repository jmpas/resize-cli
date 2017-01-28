import path from 'path'
import fs from 'fs'
import aspect from 'aspectratio'
import imageSize from 'image-size'
import meow from 'meow'
import resizeImg from 'resize-img'

function writeFile(dest, fileName, buf) {
  return new Promise((resolve, reject) => {
    fs.writeFile(
      path.resolve(dest, fileName),
      buf,
      err => err ? reject(err) : resolve(`${fileName} Saved!`))
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
    $ resize ./images/**/* -w 450 -h 450 -o ./dist/images/**/* -s ".min"
`, {
  alias: {
    w: 'max-width',
    h: 'max-height',
    o: 'output'
  }
})

const {input: images, flags} = cli
console.log(flags)

const promises = images
  .map(imgPath => {
    return {
      imgPath,
      fileName: imgPath.split('/').pop(),
      size: sizeOf(imgPath)
    }
  })
  .map(async img => {
    const {width, height} = await img.size
    const {w, h} = flags
    const [newWidth, newHeight] = aspect.resize(width, height, w, h)

    return Object.assign({}, img, {width: newWidth, height: newHeight})
  })
  .map(async img => {
    try {
      const {fileName, imgPath, width, height} = await img
      const imageBuffer = await getBuf(imgPath)
      const resizedBuffer = await resizeImg(imageBuffer, {width, height})

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
        return writeFile(flags.o, fileName, buf)
      } catch (err) {
        return Promise.reject(err)
      }
    })
    .map(async data => {
      try {
        console.log(await data)
      } catch (err) {
        console.log(err)
      }
    })

Promise.all(promises)
  .then(() => console.log('All images were successfuly resized.'))
  .catch(() => console.warn(`Couldn't resize all the images.`))
