import { SeiLa } from 'domain/sei-la'

const a = true
const seiLa = new SeiLa()
const minhaEnv = process.env.TESTE

if (a) {
  console.log({ minhaEnv })
}
