// @ts-check
// require('dotenv').config()
const client = require("cheerio-httpcli")
const inquirer = require("inquirer")

let logged = false
let user = ""
let contest = null

main()

async function main() {
  console.clear()
  console.log("start up the AtTools!")
  // await autoLogin(client)

  while (true) {
    if (logged) console.log("user : " + user)
    if (contest) console.log("contest : " + contest)

    const { choices, acts } = collect(client)
    let answer = await inquirer.prompt({
      type: "list",
      name: "operation",
      message: "select an operation",
      choices,
    })

    console.clear()

    await acts[choices.indexOf(answer.operation)]()
  }
}

// async function autoLogin(client) {
//   const {USERNAME : username, PASSWORD : password} = process.env;
//   if(username && password) {
//     await login(client, username, password)
//     if(logged) console.log("suceeded in auto-logging in as " + user)
//     else console.log("though there's an auto-login settings, failed to login")
//   }
// }

function collect(client) {
  const choices = [], acts = []
  // login
  if (!logged) {
    choices.push("login")
    acts.push(async () => {
      let { username } = await inquirer.prompt({
        type: "input",
        name: "username",
        message: "username",
      })
      const { password } = await inquirer.prompt({
        type: "password",
        name: "password",
        message: "password",
      })
      console.clear()
      username = username.trim()
      if (username && password) {
        console.log("processing...")
        await login(client, username, password)
        console.clear()
        if (logged) console.log("suceeded in logging in as " + user)
        else console.log("failed to login")
      }
    })
  }

  // enter the contest
  if (!contest) {
    choices.push("enter contest")
    acts.push(async () => {
      const confirm = await inquirer.prompt({
        type : "confirm",
        name : "confirm",
        default : false,
        message : "really?"
      })
      if (confirm) {
        ({ contest } = await inquirer.prompt({
          type: "input",
          name: "contest",
          message: "contest",
        }))
      }
    })
  } else {
    choices.push("exit contest")
    acts.push(() => {
      contest = null
    })
  }

  // logout
  if (logged) {
    choices.push("logout")
    acts.push(async () => {
      await logout(client)
    })
  }

  // exit
  if (logged) choices.push("logout & exit")
  else choices.push("exit")
  acts.push(async () => {
    if (logged) await logout(client)
    process.exit()
  })

  return { choices, acts }
}

/**
 * @param {typeof client} client
 */
async function login(client, username, password) {
  if (logged === true) return
  var { $, body, response } = await client.fetch("https://beta.atcoder.jp/login")
  let form = $("form[action='/login']")
  form.field({ username, password })
  await form.submit()
  logged = await isLogged(client)
  if (logged) user = username
}

async function logout(client) {
  if (logged === false) return
  var { $, body, response } = await client.fetch("https://beta.atcoder.jp/")
  let form = $("form[action='/logout']")
  await form.submit()
  logged = false
}

/**
 * @param {typeof client} client
 */
async function isLogged(client) {
  var { $, body, response } = await client.fetch("https://beta.atcoder.jp/")
  let form = $("form[action='/login']")
  return !form.length
}

function delay(mili) {
  return new Promise((resolve, reject) => {
    setTimeout(function () { resolve() }, mili);
  })
}
