const Discord = require('discord.js')
require('dotenv').config()
const client = new Discord.Client()
const fs = require('fs')

const userDataFile = 'user_data.json'
const channelId = '490133651275644939'

client.once('ready', () => {
  console.log('Ministeri paikalla')
})

client.on('message', async message => {
  if (message.author.bot) return

  const prefixPelaan = '-pelaan'
  const prefixJäähyä = '-jäähy'
  const prefixProfile = '-profiili'
  const prefixKalja = '-kalja'
  const prefixRooki = '-rööki'
  const prefixLervaus = '-lervaus'

  if (message.content.startsWith(prefixPelaan)) {
    handlePelaanCommand(message)
  } else if (message.content.startsWith(prefixJäähyä)) {
    handleJäähyäCommand(message)
  } else if (message.content.startsWith(prefixProfile)) {
    handleProfiiliCommand(message)
  } else if (message.content.startsWith(prefixKalja)) {
    handleKaljaCommand(message)
  } else if (message.content.startsWith(prefixRooki)) {
    handleRöökiCommand(message)
  } else if (message.content.startsWith(prefixLervaus)) {
    handleLervausCommand(message)
  }
})

async function handlePelaanCommand (message) {
  // Extract the word after the command
  const commandArgs = message.content.slice('-pelaan'.length).trim().split(' ')
  const gameToPlay = commandArgs.join(' ')

  const userIdsToMention = [
    '282220532718632980',
    '228790729881812992',
    '277547247325937665',
    '254340415900221441',
    '282219768784617493',
    '254679059118686210',
    '282217921860861953'
  ]

  const onlineUsers = []

  for (const userId of userIdsToMention) {
    const user = client.users.cache.get(userId)
    const member = message.guild.members.cache.get(userId)

    if (member && member.presence.status !== 'ofline') {
      onlineUsers.push(`<@${userId}>`)
    }
  }

  const onlineUsersString = onlineUsers.join('\n')

  if (onlineUsersString) {
    const response = `Nonii pojat:\n${onlineUsersString}\nMennääpä pelaamaan ${gameToPlay}.`
    const botMessage = await message.channel.send(response)

    // Add reactions to the bot's message
    await botMessage.react('✅') // :white_check_mark:
    await botMessage.react('❌') // :x:
  } else {
    message.channel.send('Ei ketään online. 😢')
  }
}

function handleJäähyäCommand (message) {
  // Extract the mentioned user
  const mentionedMember = message.mentions.members.first()
  const timeoutDuration = 10000 // 10 seconds

  // Check if the author has the required role (adjust 'YOUR_REQUIRED_ROLE_ID' accordingly)
  const requiredRoleId = '282646242897559562'
  const hasRequiredRole = message.member.roles.cache.has(requiredRoleId)

  if (hasRequiredRole) {
    if (mentionedMember) {
      // Mute the mentioned user
      mentionedMember.voice.setMute(true)

      // Unmute after the timeout duration
      setTimeout(() => {
        mentionedMember.voice.setMute(false)
        message.channel.send(`<@${mentionedMember.id}>, jäähy on päättynyt`)
      }, timeoutDuration)

      // Notify the mentioned user about the mute
      message.channel.send(
        `<@${mentionedMember.id}>, saat 10 sekunttia jäähyä ja olet nyt mykistetty!`
      )
    } else {
      message.channel.send(
        'Et maininnut käyttäjää, jolle haluat antaa jäähyä ja mykistystä.'
      )
    }
  } else {
    message.channel.send('You have no power here työtön klovni.')
  }
}

function handleProfiiliCommand (message) {
  // Extract the mentioned user
  const mentionedMember = message.mentions.members.first()

  // Get the member (user) from the message
  const member = message.guild.members.cache.get(message.author.id)

  // Load user data for the command invoker
  const userData = loadUserData(member.user.id)

  // Create the profile embed with beers and tobaccos details for the command invoker
  const profileEmbed = createProfileEmbed(member, userData)

  // Send the profile embed to the channel for the command invoker
  message.channel.send(profileEmbed)

  if (mentionedMember) {
    // Load user data for the mentioned user
    const mentionedUserData = loadUserData(mentionedMember.user.id)

    // Create the profile embed with beers and tobaccos details for the mentioned user
    const userProfileEmbed = createProfileEmbed(
      mentionedMember,
      mentionedUserData
    )

    // Send the profile embed to the channel for the mentioned user
    message.channel.send(userProfileEmbed)
  } else {
    message.channel.send(
      'Et maininnut käyttäjää, jonka profiilia haluat näyttää.'
    )
  }
}

function createProfileEmbed (member) {
  const profileEmbed = new Discord.MessageEmbed()
    .setColor('#0099ff')
    .setTitle(`${member.user.tag}'s Profile`)
    .addField('Username', member.user.username, true)
    .addField('Discriminator', member.user.discriminator, true)
    .addField('User ID', member.user.id, true)
    .addField('Joined Server', member.joinedAt.toDateString(), true)
    .addField('Joined Discord', member.user.createdAt.toDateString(), true)
    .addField('Beers Consumed', userData.beers || 0, true)
    .addField('Tobaccos Smoked', userData.tobaccos || 0, true)
    .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
    .setTimestamp()

  return profileEmbed
}

function handleKaljaCommand (message) {
  if (message.content.toLowerCase() === '-kalja') {
    const userId = message.author.id

    // Load user data from the file
    const userData = loadUserData()

    // Ensure proper initialization of user data
    userData[userId] = userData[userId] || { beers: 0, tobaccos: 0 }

    // Update the user's beer count
    userData[userId].beers += 1

    // Save the updated user data to the file
    saveUserData(userData)

    message.channel.send(
      `<@${userId}>, olet nauttinut ${userData[userId].beers} kaljaa! 🍺`
    )
  }
}

function handleRöökiCommand (message) {
  if (message.content.toLowerCase() === '-rööki') {
    const userId = message.author.id

    // Load user data from the file
    const userData = loadUserData()

    // Ensure proper initialization of user data
    userData[userId] = userData[userId] || { beers: 0, tobaccos: 0 }

    // Update the user's tobacco count
    userData[userId].tobaccos += 1

    // Save the updated user data to the file
    saveUserData(userData)

    message.channel.send(
      `<@${userId}>, olet polttanut ${userData[userId].tobaccos} tupakkaa! 🚬`
    )
  }
}

function handleLervausCommand (message) {
  if (message.content.toLowerCase() === '-lervaus') {
    const userId = message.author.id

    // Load user data from the file
    const userData = loadUserData()

    // Clear user data for the current user
    userData[userId] = { beers: 0, tobaccos: 0 }

    // Save the updated user data to the file
    saveUserData(userData)

    message.channel.send(
      `<@${userId}>, lervaus suoritettu! Heikko Jarkko:face_vomiting:`
    )
  }
}

function loadUserData () {
  try {
    const data = fs.readFileSync(userDataFile)
    return JSON.parse(data)
  } catch (error) {
    console.error('Error loading user data:', error)
    return {}
  }
}

function saveUserData (userData) {
  try {
    const data = JSON.stringify(userData, null, 2)
    fs.writeFileSync(userDataFile, data)
  } catch (error) {
    console.error('Error saving user data:', error)
  }
}

// Example of how to use the handleKaljaCommand function
const kaljaMessageMock = {
  content: '-kalja',
  author: { id: '123456789012345678' },
  channel: { send: content => console.log(content) } // Replace with your actual send function
}

const röökiMessageMock = {
  content: '-rööki',
  author: { id: '123456789012345678' },
  channel: { send: content => console.log(content) }
}
const lervausMessageMock = {
  content: '-lervaus',
  author: { id: '123456789012345678' },
  channel: { send: content => console.log(content) }
}

handleKaljaCommand(kaljaMessageMock)
handleRöökiCommand(röökiMessageMock)
handleLervausCommand(lervausMessageMock)

client.login(process.env.BOT_TOKEN)
