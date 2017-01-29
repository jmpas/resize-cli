import path from 'path'
import test from 'ava'
import imageSize from 'image-size'
import aspect from 'aspectratio'
import {exec} from 'child_process'
import del from  'del'
import mkdir from 'mkdir-promise'

function sizeOf(img) {
  return new Promise((resolve, reject) => {
    imageSize(
      path.resolve(img),
      (err, dimensions) => err ? reject(err) : resolve(dimensions))
  })
}

function execCli(maxWidth, maxHeight, suffix) {
  const suffixOpt = suffix ? `-s "${suffix}"` : ''
  return new Promise((resolve, reject) => {
    exec(
      `node ./dist/index.js ./images/in/* -w ${maxWidth} -h ${maxHeight} ${suffixOpt} -o ./images/out`,
      (err) => err ? reject(err) : resolve()
    )
  })
}

test.before(async t => {
  await mkdir('./images/out')
  await execCli(140, 140)
  await execCli(140, 140, '_test')
})

test.after.always(async t => await del('./images/out/*'))

test('resize jpg without prefix', async t => {
  const jpgInfo = await sizeOf('./images/out/kitten.jpeg')
  t.deepEqual(jpgInfo, {height: 88, width: 140, type: 'jpg'})
})

test('resize jpg without prefix', async t => {
  const jpgInfo = await sizeOf('./images/out/kitten_test.jpeg')
  t.deepEqual(jpgInfo, {height: 88, width: 140, type: 'jpg'})
})

test('resize png without prefix', async t => {
  const pngInfo = await sizeOf('./images/out/kitten.png')
  t.deepEqual(pngInfo, {height: 140, width: 121, type: 'png'})
})

test('resize png with prefix', async t => {
  const pngInfo = await sizeOf('./images/out/kitten_test.png')
  t.deepEqual(pngInfo, {height: 140, width: 121, type: 'png'})
})
